"""
watchlists.py: Smart Topic & Entity Watchlists Engine.
Allows researchers to define targeted monitors for authors, frameworks, research labs, and concept keywords.
"""

from typing import List, Dict, Any, Optional
import datetime

DEFAULT_WATCHLISTS = [
    {
        "id": "wl_langgraph_durable",
        "name": "LangGraph & Durable Graphs",
        "category": "Framework",
        "query": "LangGraph OR \"durable execution\" OR checkpoint",
        "tags": ["Framework", "Durable", "LangGraph"],
        "channel": "In-app",
        "active": True,
        "hit_count": 8,
        "last_matched": "2 hours ago",
        "created_at": "2026-10-15T10:00:00Z"
    },
    {
        "id": "wl_hierarchical_memory",
        "name": "Hierarchical & Episodic Memory",
        "category": "Topic",
        "query": "MemOS OR \"episodic memory\" OR \"hierarchical memory\"",
        "tags": ["Memory", "Planning", "Cognitive"],
        "channel": "In-app",
        "active": True,
        "hit_count": 14,
        "last_matched": "3 hours ago",
        "created_at": "2026-10-18T14:30:00Z"
    },
    {
        "id": "wl_mcp_protocols",
        "name": "Model Context Protocol (MCP)",
        "category": "Protocol",
        "query": "MCP OR \"Model Context Protocol\" OR A2A",
        "tags": ["Protocol", "MCP", "A2A"],
        "channel": "Webhook",
        "active": True,
        "hit_count": 11,
        "last_matched": "5 hours ago",
        "created_at": "2026-10-22T08:00:00Z"
    },
    {
        "id": "wl_reasoning_authors",
        "name": "Yao & Shinn (ReAct / Reflexion)",
        "category": "Author",
        "query": "author:\"Shunyu Yao\" OR author:\"Noah Shinn\"",
        "tags": ["Reasoning", "ReAct", "Reflexion"],
        "channel": "In-app",
        "active": True,
        "hit_count": 6,
        "last_matched": "1 day ago",
        "created_at": "2026-10-25T12:00:00Z"
    },
    {
        "id": "wl_swe_benchmarks",
        "name": "SWE & Tool-Use Benchmarks",
        "category": "Benchmark",
        "query": "SWE-bench OR ToolBench OR GAIA OR \"tau-bench\"",
        "tags": ["Evals", "Benchmarks", "ToolBench"],
        "channel": "In-app",
        "active": True,
        "hit_count": 9,
        "last_matched": "1 day ago",
        "created_at": "2026-10-28T16:15:00Z"
    }
]

def get_all_watchlists() -> List[Dict[str, Any]]:
    return DEFAULT_WATCHLISTS

def match_feed_items_against_watchlist(watchlist: Dict[str, Any], items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    query_terms = [t.strip().lower().replace('"', '') for t in watchlist["query"].replace("OR", " ").replace("AND", " ").split()]
    matched = []
    for item in items:
        text = f"{item.get('title', '')} {item.get('summary', '')} {' '.join(item.get('tags', []))}".lower()
        if any(term in text for term in query_terms if len(term) > 2):
            matched.append(item)
    return matched
