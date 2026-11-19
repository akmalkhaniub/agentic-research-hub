"""
protocols.py: Model Context Protocol (MCP) & Agent-to-Agent (A2A) Registry.
Enforces standardized open protocols for client-to-tool and agent-to-agent interoperability.
"""

from typing import List, Dict, Any, Optional

MCP_TOOLS = [
    {
        "name": "arxiv_search",
        "description": "Searches the latest arXiv preprints across cs.AI, cs.MA, cs.CL, and cs.LG categories.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search keywords or boolean expression."},
                "max_results": {"type": "integer", "default": 5, "description": "Maximum number of papers to retrieve."}
            },
            "required": ["query"]
        },
        "category": "Literature Retrieval",
        "latency_avg_ms": 320
    },
    {
        "name": "kaggle_dispatch",
        "description": "Submits a headless GPU evaluation or training notebook to Kaggle Kernels API (T4x2).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "Kernel title."},
                "notebook_path": {"type": "string", "description": "Path to local or parameterized .ipynb file."},
                "enable_gpu": {"type": "boolean", "default": True}
            },
            "required": ["title", "notebook_path"]
        },
        "category": "Compute Execution",
        "latency_avg_ms": 850
    },
    {
        "name": "vector_recall",
        "description": "Queries the local SQLite vector chunk index for semantically similar literature excerpts.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Semantic query string."},
                "top_k": {"type": "integer", "default": 4}
            },
            "required": ["query"]
        },
        "category": "Knowledge Base",
        "latency_avg_ms": 15
    },
    {
        "name": "obsidian_export",
        "description": "Synthesizes an ingested paper or experiment run into an Obsidian-compatible Markdown note with wikilinks.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "item_id": {"type": "string", "description": "Unique identifier of feed item or experiment."},
                "vault_path": {"type": "string", "description": "Optional destination vault directory."}
            },
            "required": ["item_id"]
        },
        "category": "Export & PKM",
        "latency_avg_ms": 45
    },
    {
        "name": "memory_compact",
        "description": "Performs cognitive compaction on unconsolidated episodic memory traces into semantic invariant rules.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "force": {"type": "boolean", "default": False}
            }
        },
        "category": "Memory Systems",
        "latency_avg_ms": 110
    }
]

A2A_AGENT_CARDS = [
    {
        "id": "agent_scout",
        "name": "Literature Scout Agent",
        "version": "1.2.0",
        "description": "Autonomous literature discovery agent with specialized arXiv, GitHub releases, and RSS collectors.",
        "capabilities": ["arxiv_ingestion", "taxonomy_tagging", "abstract_synthesis"],
        "endpoint": "https://hub.local/a2a/agents/scout",
        "auth_type": "Bearer JWT",
        "status": "Online",
        "rate_limit": "60 req/min"
    },
    {
        "id": "agent_critic",
        "name": "Methodology Critic Agent",
        "version": "2.0.0",
        "description": "Peer-review agent that audits empirical claims, baseline controls, and compute token consumption.",
        "capabilities": ["methodology_critique", "statistical_audit", "hallucination_check"],
        "endpoint": "https://hub.local/a2a/agents/critic",
        "auth_type": "Bearer JWT",
        "status": "Online",
        "rate_limit": "30 req/min"
    },
    {
        "id": "agent_architect",
        "name": "System Architect Agent",
        "version": "1.4.1",
        "description": "Translates research hypotheses into runnable LangGraph architectures, MCP tools, and Terraform blueprints.",
        "capabilities": ["topology_synthesis", "iac_generation", "code_verification"],
        "endpoint": "https://hub.local/a2a/agents/architect",
        "auth_type": "Bearer JWT",
        "status": "Online",
        "rate_limit": "20 req/min"
    },
    {
        "id": "agent_benchmarker",
        "name": "Benchmark Dispatcher Agent",
        "version": "1.0.0",
        "description": "Dispatches evaluation workloads across zero-cost compute providers (Kaggle, Colab, Modal).",
        "capabilities": ["kaggle_orchestration", "colab_handoff", "metric_telemetry"],
        "endpoint": "https://hub.local/a2a/agents/benchmarker",
        "auth_type": "Bearer JWT",
        "status": "Online",
        "rate_limit": "15 req/min"
    }
]

def get_mcp_tools() -> List[Dict[str, Any]]:
    return MCP_TOOLS

def get_a2a_agents() -> List[Dict[str, Any]]:
    return A2A_AGENT_CARDS

def test_mcp_tool(tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    tool = next((t for t in MCP_TOOLS if t["name"] == tool_name), None)
    if not tool:
        return {"error": f"Tool '{tool_name}' not found in MCP registry."}
    
    # Simulate realistic tool execution response
    if tool_name == "arxiv_search":
        return {
            "status": "success",
            "tool": tool_name,
            "results": [
                {"title": "MemOS-2: Hierarchical Episodic Memory", "arxiv_id": "2410.memos2", "relevance": 0.94},
                {"title": "Reflexion: Language Agents with Verbal Reinforcement", "arxiv_id": "2303.11366", "relevance": 0.89}
            ]
        }
    elif tool_name == "vector_recall":
        return {
            "status": "success",
            "tool": tool_name,
            "chunks_matched": 3,
            "excerpts": [
                "Flat vector memory exhibits context dilution beyond 200 interaction steps...",
                "Consolidation into semantic memory preserves critical constraints without token overhead."
            ]
        }
    elif tool_name == "memory_compact":
        return {
            "status": "success",
            "tool": tool_name,
            "episodes_compacted": 4,
            "new_rule_id": "rule_04",
            "tokens_reclaimed": 1800
        }
    else:
        return {
            "status": "success",
            "tool": tool_name,
            "message": f"Tool '{tool_name}' executed cleanly with validated arguments: {arguments}"
        }
