import os
import re
from typing import Dict, Any, List

def classify_tags_and_relevance(title: str, text: str) -> Dict[str, Any]:
    """
    Fallback deterministic tag classifier and relevance scorer.
    """
    combined = f"{title} {text}".lower()
    
    tags = []
    if any(k in combined for k in ["memory", "episodic", "memos", "consolidation", "retrieval"]):
        tags.append("Memory")
    if any(k in combined for k in ["multi-agent", "swarm", "supervisor", "hierarchical", "consensus", "collaboration"]):
        tags.append("Multi-agent")
    if any(k in combined for k in ["plan", "planning", "tree-of-thought", "mcts", "reflection", "reflexion"]):
        tags.append("Planning")
    if any(k in combined for k in ["tool", "mcp", "function calling", "api", "action"]):
        tags.append("Tool use/MCP")
    if any(k in combined for k in ["a2a", "agent-to-agent", "negotiation", "protocol"]):
        tags.append("A2A")
    if any(k in combined for k in ["eval", "benchmark", "gaia", "swe-bench", "tau-bench", "accuracy"]):
        tags.append("Evals")
    if any(k in combined for k in ["deploy", "docker", "cloud run", "latency", "production", "fastapi"]):
        tags.append("Deployment")
    if any(k in combined for k in ["fine-tun", "lora", "unsloth", "sft", "dpo", "distillation"]):
        tags.append("Fine-tuning")

    if not tags:
        tags = ["Agentic AI"]

    # Calculate relevance based on keyword density & specificity
    high_impact = ["sota", "benchmark", "release", "novel", "framework", "architecture", "breakthrough", "hierarchical"]
    score = sum(1 for w in high_impact if w in combined)
    
    if score >= 2 or len(tags) >= 2:
        relevance = "high"
    elif score == 1 or len(tags) == 1:
        relevance = "med"
    else:
        relevance = "low"

    # Clean 2-sentence extractive summary if no LLM
    sentences = re.split(r'(?<=[.!?]) +', text.strip())
    clean_sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
    summary = " ".join(clean_sentences[:2]) if clean_sentences else title
    why_it_matters = f"Relevant to {', '.join(tags)} workflows; provides insights for autonomous agent architectures."

    return {
        "summary": summary,
        "why_it_matters": why_it_matters,
        "tags": tags[:4],
        "relevance": relevance
    }

async def enrich_item(title: str, text: str, source_type: str) -> Dict[str, Any]:
    """
    Enriches an item using Gemini if API key is provided, or heuristic fallback.
    """
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return classify_tags_and_relevance(title, text)

    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        prompt = f"""
You are an expert in Agentic AI architectures, multi-agent systems, and AI research.
Analyze this {source_type}:
Title: {title}
Content: {text[:2000]}

Respond strictly with a JSON object with these keys:
- "summary": A concise 2-sentence TL;DR focusing on the core technical contribution or release feature.
- "why_it_matters": 1 clear sentence explaining why an agent builder or AI researcher should care.
- "tags": A list of 1 to 4 tags from ["Memory", "Multi-agent", "Planning", "Tool use/MCP", "A2A", "Evals", "Deployment", "Fine-tuning"].
- "relevance": Exactly "high", "med", or "low".
"""
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={"response_mime_type": "application/json"}
        )
        import json
        data = json.loads(response.text)
        return {
            "summary": data.get("summary", ""),
            "why_it_matters": data.get("why_it_matters", ""),
            "tags": data.get("tags", ["Agentic AI"]),
            "relevance": data.get("relevance", "med")
        }
    except Exception as e:
        print(f"Gemini enrichment failed, falling back to heuristic: {e}")
        return classify_tags_and_relevance(title, text)
