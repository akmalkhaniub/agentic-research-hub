"""
graph.py: Knowledge Graph engine linking Papers, Architecture Topologies,
Frameworks, Protocols (A2A/MCP), and Benchmarks with relationship traversal.
"""

from typing import List, Dict, Any, Optional

GRAPH_NODES = [
    # Topologies (Techniques)
    {"id": "topo_supervisor", "label": "Supervisor Topology", "type": "Topology", "category": "Multi-Agent", "desc": "Central coordinator routing tasks to specialized agents."},
    {"id": "topo_hierarchical", "label": "Hierarchical Tree", "type": "Topology", "category": "Multi-Agent", "desc": "Multi-tiered supervisors delegating across deep task subtrees."},
    {"id": "topo_swarm", "label": "Swarm & Handoffs", "type": "Topology", "category": "Multi-Agent", "desc": "Decentralized peer-to-peer agent execution handoffs."},
    {"id": "topo_react", "label": "ReAct Loop", "type": "Topology", "category": "Single-Agent", "desc": "Interleaved thought-action-observation cycles."},
    {"id": "topo_reflexion", "label": "Reflexion Memory", "type": "Topology", "category": "Single-Agent", "desc": "Self-critique with verbal reinforcement in episodic memory."},
    {"id": "topo_memos", "label": "3-Tier Episodic Memory", "type": "Topology", "category": "Memory", "desc": "Working, episodic, and semantic consolidation tiers."},

    # Frameworks
    {"id": "fw_langgraph", "label": "LangGraph", "type": "Framework", "category": "Orchestration", "desc": "Graph-based stateful multi-agent orchestration with durable checkpoints."},
    {"id": "fw_adk", "label": "Google ADK", "type": "Framework", "category": "Orchestration", "desc": "Google Agent Development Kit optimized for Gemini 2.5/3."},
    {"id": "fw_crewai", "label": "CrewAI", "type": "Framework", "category": "Orchestration", "desc": "Role-playing autonomous agent collaboration framework."},
    {"id": "fw_autogen", "label": "AutoGen (AG2)", "type": "Framework", "category": "Orchestration", "desc": "Event-driven conversational multi-agent systems."},
    {"id": "fw_pydantic_ai", "label": "PydanticAI", "type": "Framework", "category": "Type-Safe", "desc": "Type-safe agent framework with structured validation."},

    # Protocols
    {"id": "proto_mcp", "label": "Model Context Protocol (MCP)", "type": "Protocol", "category": "Standard", "desc": "Open standard connecting agents to external tools and data."},
    {"id": "proto_a2a", "label": "Agent-to-Agent (A2A)", "type": "Protocol", "category": "Standard", "desc": "Protocol for inter-agent discovery, capability negotiation, and delegation."},

    # Papers
    {"id": "paper_memos2", "label": "MemOS-2 (Chen et al.)", "type": "Paper", "category": "Research", "desc": "Hierarchical memory delivering +18% on long-horizon web tasks."},
    {"id": "paper_reflexion", "label": "Reflexion (Shinn et al.)", "type": "Paper", "category": "Research", "desc": "Verbal reinforcement learning for language agents."},
    {"id": "paper_react", "label": "ReAct (Yao et al.)", "type": "Paper", "category": "Research", "desc": "Synergizing reasoning and acting in language models."},
    {"id": "paper_generative_agents", "label": "Generative Agents (Park et al.)", "type": "Paper", "category": "Research", "desc": "Simulacra of human behavior with memory streams and reflection."},

    # Benchmarks
    {"id": "bench_gaia", "label": "GAIA Benchmark", "type": "Benchmark", "category": "Evaluation", "desc": "General AI Assistants benchmark for complex multi-modal multi-step tasks."},
    {"id": "bench_tau", "label": "τ²-bench", "type": "Benchmark", "category": "Evaluation", "desc": "Dual-control asynchronous evaluation of conversational agents."},
    {"id": "bench_swe", "label": "SWE-bench", "type": "Benchmark", "category": "Evaluation", "desc": "Software engineering benchmark resolving GitHub issues."}
]

GRAPH_EDGES = [
    # Paper -> Topology
    {"source": "paper_memos2", "target": "topo_memos", "relation": "introduces"},
    {"source": "paper_reflexion", "target": "topo_reflexion", "relation": "introduces"},
    {"source": "paper_react", "target": "topo_react", "relation": "introduces"},
    {"source": "paper_generative_agents", "target": "topo_memos", "relation": "pioneers"},

    # Framework -> Topology
    {"source": "fw_langgraph", "target": "topo_supervisor", "relation": "implements"},
    {"source": "fw_langgraph", "target": "topo_hierarchical", "relation": "implements"},
    {"source": "fw_langgraph", "target": "topo_swarm", "relation": "implements"},
    {"source": "fw_adk", "target": "topo_supervisor", "relation": "implements"},
    {"source": "fw_adk", "target": "topo_react", "relation": "implements"},
    {"source": "fw_crewai", "target": "topo_hierarchical", "relation": "implements"},
    {"source": "fw_crewai", "target": "topo_supervisor", "relation": "implements"},
    {"source": "fw_autogen", "target": "topo_swarm", "relation": "implements"},

    # Framework -> Protocol
    {"source": "fw_langgraph", "target": "proto_a2a", "relation": "supports"},
    {"source": "fw_langgraph", "target": "proto_mcp", "relation": "supports"},
    {"source": "fw_adk", "target": "proto_mcp", "relation": "supports"},
    {"source": "fw_pydantic_ai", "target": "proto_mcp", "relation": "supports"},

    # Topology / Framework -> Benchmark
    {"source": "topo_memos", "target": "bench_gaia", "relation": "evaluated_on"},
    {"source": "topo_supervisor", "target": "bench_gaia", "relation": "evaluated_on"},
    {"source": "topo_react", "target": "bench_tau", "relation": "evaluated_on"},
    {"source": "fw_langgraph", "target": "bench_swe", "relation": "benchmarks_on"},
    {"source": "topo_reflexion", "target": "bench_swe", "relation": "evaluated_on"}
]

def get_knowledge_graph() -> Dict[str, Any]:
    return {
        "nodes": GRAPH_NODES,
        "edges": GRAPH_EDGES,
        "summary": {
            "total_nodes": len(GRAPH_NODES),
            "total_edges": len(GRAPH_EDGES),
            "types": ["Topology", "Framework", "Protocol", "Paper", "Benchmark"]
        }
    }

def get_node_details(node_id: str) -> Optional[Dict[str, Any]]:
    node = next((n for n in GRAPH_NODES if n["id"] == node_id), None)
    if not node:
        return None
    
    connected_edges = [
        e for e in GRAPH_EDGES if e["source"] == node_id or e["target"] == node_id
    ]
    neighbors = []
    for e in connected_edges:
        neighbor_id = e["target"] if e["source"] == node_id else e["source"]
        neighbor_node = next((n for n in GRAPH_NODES if n["id"] == neighbor_id), None)
        if neighbor_node:
            neighbors.append({
                "id": neighbor_node["id"],
                "label": neighbor_node["label"],
                "type": neighbor_node["type"],
                "relation": e["relation"],
                "direction": "outgoing" if e["source"] == node_id else "incoming"
            })

    return {
        "node": node,
        "connected_count": len(connected_edges),
        "neighbors": neighbors
    }
