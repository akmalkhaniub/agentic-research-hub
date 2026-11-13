"""
bench.py: Agent Evaluation & Benchmark Engine.
Tracks multi-agent framework comparisons across standardized suites (GAIA, τ²-bench, ToolBench).
"""

from typing import List, Dict, Any, Optional

BENCHMARK_SUITES = [
    {
        "id": "gaia_mini",
        "name": "GAIA-mini (General AI Assistants)",
        "tasks_count": 40,
        "description": "Multi-modal, multi-tool reasoning tasks requiring web browsing, code execution, and file inspection.",
        "difficulty": "Hard",
        "primary_metric": "Task Success Rate (%)",
        "estimated_duration": "45 min on Kaggle GPU / 20 min on Modal"
    },
    {
        "id": "tau2_bench",
        "name": "τ²-bench (Dual-Control Dynamic State)",
        "tasks_count": 25,
        "description": "Asynchronous environments where user and agent concurrently manipulate flight/airline databases.",
        "difficulty": "Very Hard",
        "primary_metric": "Dual-Control Completion Rate (%)",
        "estimated_duration": "30 min on Kaggle GPU"
    },
    {
        "id": "toolbench_core",
        "name": "ToolBench Core (API Function Calling)",
        "tasks_count": 50,
        "description": "Multi-step tool retrieval and execution across 1,000+ real-world REST APIs with rate limits.",
        "difficulty": "Medium",
        "primary_metric": "Tool Call Precision & Win Rate",
        "estimated_duration": "15 min on GitHub Actions CPU / 5 min on Modal"
    },
    {
        "id": "swe_lite_sample",
        "name": "SWE-bench Lite (Agent Debugging)",
        "tasks_count": 15,
        "description": "Resolves real GitHub issue pull requests across Django, Sympy, and Scikit-learn repositories.",
        "difficulty": "Expert",
        "primary_metric": "Pass@1 Resolved Rate (%)",
        "estimated_duration": "2.5 hours on Kaggle GPU (T4×2)"
    }
]

LEADERBOARD_ENTRIES = [
    {
        "rank": 1,
        "contender": "LangGraph · Supervisor + 3 Specialists",
        "topology": "Supervisor",
        "framework": "LangGraph",
        "suite_id": "gaia_mini",
        "success_rate": 81.2,
        "avg_latency_s": 24.1,
        "cost_per_task": 0.012,
        "avg_steps": 9.1,
        "failure_recovery_rate": 78.5,
        "last_run": "2026-11-02"
    },
    {
        "rank": 2,
        "contender": "Google ADK · Coordinator + Gemini 2.5",
        "topology": "Supervisor",
        "framework": "Google ADK",
        "suite_id": "gaia_mini",
        "success_rate": 78.4,
        "avg_latency_s": 18.6,
        "cost_per_task": 0.010,
        "avg_steps": 8.4,
        "failure_recovery_rate": 72.0,
        "last_run": "2026-11-01"
    },
    {
        "rank": 3,
        "contender": "LangGraph · ReAct + Reflexion Loop",
        "topology": "Reflexion",
        "framework": "LangGraph",
        "suite_id": "gaia_mini",
        "success_rate": 75.0,
        "avg_latency_s": 29.8,
        "cost_per_task": 0.016,
        "avg_steps": 13.2,
        "failure_recovery_rate": 84.2,
        "last_run": "2026-10-30"
    },
    {
        "rank": 4,
        "contender": "LangGraph · Single ReAct Baseline",
        "topology": "ReAct",
        "framework": "LangGraph",
        "suite_id": "gaia_mini",
        "success_rate": 72.1,
        "avg_latency_s": 15.2,
        "cost_per_task": 0.007,
        "avg_steps": 11.3,
        "failure_recovery_rate": 45.0,
        "last_run": "2026-10-28"
    },
    {
        "rank": 5,
        "contender": "CrewAI · Hierarchical Process",
        "topology": "Hierarchical",
        "framework": "CrewAI",
        "suite_id": "gaia_mini",
        "success_rate": 69.5,
        "avg_latency_s": 31.4,
        "cost_per_task": 0.015,
        "avg_steps": 12.0,
        "failure_recovery_rate": 61.0,
        "last_run": "2026-10-29"
    }
]

def get_benchmark_suites() -> List[Dict[str, Any]]:
    return BENCHMARK_SUITES

def get_leaderboard(suite_id: Optional[str] = None) -> List[Dict[str, Any]]:
    if not suite_id:
        return LEADERBOARD_ENTRIES
    return [e for e in LEADERBOARD_ENTRIES if e["suite_id"] == suite_id]
