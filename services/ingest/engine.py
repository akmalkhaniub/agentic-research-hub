import asyncio
import datetime
from sqlalchemy.future import select
from services.api.database import AsyncSessionLocal, init_db
from services.api.models import FeedItem, ExperimentRun, ApprovalItem, WatchlistItem
from services.ingest.collectors.arxiv import fetch_arxiv_papers
from services.ingest.collectors.github_releases import fetch_github_releases
from services.ingest.collectors.rss_blogs import fetch_rss_feeds
from services.ingest.summarizer import enrich_item

SEED_ITEMS = [
    {
        "id": "seed_memos_2",
        "title": "MemOS-2: Hierarchical episodic memory for long-horizon agents",
        "source": "arXiv · cs.AI",
        "source_type": "Paper",
        "url": "https://arxiv.org/abs/2410.memos2",
        "author": "Chen, Okafor, Ruiz et al.",
        "published_at": datetime.datetime.utcnow() - datetime.timedelta(hours=3),
        "summary": "Introduces a 3-tier memory (working, episodic, and semantic) with learned consolidation; delivers +18% on long-horizon web tasks compared to flat RAG memory.",
        "why_it_matters": "Shows that hierarchical memory beats flat vector retrieval when agent tasks exceed 200 interaction steps.",
        "tags": ["Memory", "Planning"],
        "relevance": "high",
        "raw_content": "Autonomous agents often suffer from catastrophic context dilution in multi-hour tasks..."
    },
    {
        "id": "seed_langgraph_14",
        "title": "LangGraph 1.4 released: durable sub-graphs and native A2A handoffs",
        "source": "GitHub Releases · LangGraph",
        "source_type": "Release",
        "url": "https://github.com/langchain-ai/langgraph/releases",
        "author": "LangChain",
        "published_at": datetime.datetime.utcnow() - datetime.timedelta(hours=5),
        "summary": "Sub-graphs can now checkpoint independently with isolated retry budgets; introduces first-class A2A agent-card discovery and negotiation.",
        "why_it_matters": "Enables complex multi-agent hierarchical trees to recover gracefully without blowing away parent orchestrator state.",
        "tags": ["Framework", "A2A", "Multi-agent"],
        "relevance": "high",
        "raw_content": "We are thrilled to announce LangGraph 1.4 with production durable execution..."
    },
    {
        "id": "seed_postmortem_multiagent",
        "title": "Why our multi-agent system got worse with more agents: A production postmortem",
        "source": "Engineering Blog · HN 612 pts",
        "source_type": "News",
        "url": "https://news.ycombinator.com/item?id=3912048",
        "author": "Alex Thorne",
        "published_at": datetime.datetime.utcnow() - datetime.timedelta(hours=8),
        "summary": "Analysis of coordination overhead in multi-agent swarms; demonstrates that systems with >4 specialists often degrade due to semantic drift and conflicting tool calls.",
        "why_it_matters": "Provides empirical justification to cap supervisor specialists at 3-4 and use shared scratchpads rather than freeform agent chatter.",
        "tags": ["Multi-agent", "Deployment"],
        "relevance": "med",
        "raw_content": "In early 2026 our team scaled our customer research agent from 2 specialists to 9..."
    },
    {
        "id": "seed_tau_bench",
        "title": "τ²-bench: dual-control evaluation for conversational and actionable agents",
        "source": "HF Daily Papers",
        "source_type": "Paper",
        "url": "https://huggingface.co/papers/tau2-bench",
        "author": "DeepMind / Berkeley",
        "published_at": datetime.datetime.utcnow() - datetime.timedelta(hours=12),
        "summary": "A dynamic benchmark where both user and agent simultaneously manipulate a shared state environment; top frontier models experience 25-30% accuracy drops under asynchronous dual control.",
        "why_it_matters": "Exposes real-world race conditions and state sync challenges in conversational agents that static benchmarks miss.",
        "tags": ["Evals"],
        "relevance": "med",
        "raw_content": "Traditional benchmarks evaluate agents in frozen synchronous environments..."
    },
    {
        "id": "seed_mcp_spec",
        "title": "MCP specification update: streamable HTTP auth and user elicitation standard",
        "source": "Model Context Protocol Blog",
        "source_type": "News",
        "url": "https://modelcontextprotocol.io/blog/update-2026",
        "author": "Anthropic & MCP Working Group",
        "published_at": datetime.datetime.utcnow() - datetime.timedelta(days=1),
        "summary": "Standardizes OAuth resource indicators and server-initiated user input prompts for distributed HTTP-based MCP servers.",
        "why_it_matters": "Makes deploying remote MCP servers to Cloud Run / Lambda secure and standard across all client agents.",
        "tags": ["Tool use/MCP"],
        "relevance": "med",
        "raw_content": "Today the MCP working group released the final streamable HTTP authentication RFC..."
    }
]

async def seed_initial_records(session):
    # Check if feed items exist
    res = await session.execute(select(FeedItem))
    existing = res.scalars().all()
    if not existing:
        for item_data in SEED_ITEMS:
            item = FeedItem(**item_data)
            session.add(item)

    # Check if experiments exist
    res_exp = await session.execute(select(ExperimentRun))
    if not res_exp.scalars().all():
        exp1 = ExperimentRun(
            id="run_0142",
            name="Unsloth tool-calling LoRA (Qwen3-4B)",
            template="Fine-tune small LLM for tool calling",
            provider="Kaggle",
            gpu="T4×2",
            status="Running",
            duration_str="1h 12m",
            key_metric="loss 0.84",
            parameters={"base_model": "Qwen3-4B-Instruct", "lora_r": 16, "epochs": 2},
            metrics={"loss": 0.84, "eval_acc": 0.784, "gpu_mem_gb": 11.2},
            logs="[01:10:02] step 1230 loss=0.851\n[01:10:31] step 1240 loss=0.842\n[01:10:31] hub_reporter: metrics synced to hub"
        )
        exp2 = ExperimentRun(
            id="run_0143",
            name="Embedding model comparison for Agent Memory",
            template="Compare embedding models for RAG",
            provider="Colab",
            gpu="T4",
            status="Awaiting_Handoff",
            duration_str="n/a",
            key_metric="n/a",
            parameters={"models": ["bge-m3", "nomic-embed-v1.5", "all-MiniLM-L6-v2"]},
            logs="Waiting for user to click 'Open in Colab' and initiate runtime."
        )
        session.add(exp1)
        session.add(exp2)

    # Check if approvals exist
    res_app = await session.execute(select(ApprovalItem))
    if not res_app.scalars().all():
        app1 = ApprovalItem(
            id="app_001",
            title="Bench run: MemOS-2 vs Letta on GAIA-mini",
            description="Evaluate hierarchical memory vs OS paged memory across 40 complex multi-step web tasks.",
            category="GPU & Compute",
            resource_cost="GitHub Actions ~80 min · Kaggle ~2 GPU-h",
            status="Pending",
            requested_by="Research Copilot",
            payload={"task_suite": "gaia-mini", "contenders": ["memos-2", "letta-paged"]}
        )
        app2 = ApprovalItem(
            id="app_002",
            title="Weekly scheduled re-run: Agentic embedding leaderboard",
            description="Re-benchmark recent embeddings on retrieval accuracy for long-context tool calling.",
            category="Scheduled Automation",
            resource_cost="Kaggle ~1 GPU-h",
            status="Pending",
            requested_by="Scheduled Cron",
            payload={"suite": "embedding-eval"}
        )
        session.add(app1)
        session.add(app2)

    # Check watchlists
    res_wl = await session.execute(select(WatchlistItem))
    if not res_wl.scalars().all():
        session.add(WatchlistItem(id="wl_1", name="A2A Protocol", query="A2A OR agent2agent", channel="Telegram", hit_count=3))
        session.add(WatchlistItem(id="wl_2", name="Agent Memory", query="memory AND (agent OR episodic)", channel="Telegram", hit_count=9))
        session.add(WatchlistItem(id="wl_3", name="SWE-bench SOTA", query="SWE-bench + leaderboard", channel="In-app", hit_count=1))

    await session.commit()

async def run_ingestion_pipeline() -> int:
    """
    Executes live collection from arXiv, GitHub, and RSS, and upserts new records.
    """
    await init_db()
    new_count = 0

    print("Fetching arXiv papers...")
    arxiv_items = await fetch_arxiv_papers(max_results=10)
    print(f"Retrieved {len(arxiv_items)} arXiv papers")

    print("Fetching GitHub releases...")
    gh_items = await fetch_github_releases(limit_per_repo=2)
    print(f"Retrieved {len(gh_items)} GitHub releases")

    print("Fetching RSS feeds...")
    rss_items = await fetch_rss_feeds()
    print(f"Retrieved {len(rss_items)} RSS items")

    all_raw = arxiv_items + gh_items + rss_items

    async with AsyncSessionLocal() as session:
        # Seed if clean db
        await seed_initial_records(session)

        for raw in all_raw:
            # Check if exists by id or url
            res = await session.execute(
                select(FeedItem).where((FeedItem.id == raw["id"]) | (FeedItem.url == raw["url"]))
            )
            if res.scalar_one_or_none() is not None:
                continue

            # Enrich with summary & tags
            meta = await enrich_item(raw["title"], raw.get("raw_content", ""), raw["source_type"])
            
            feed_item = FeedItem(
                id=raw["id"],
                title=raw["title"],
                source=raw["source"],
                source_type=raw["source_type"],
                url=raw["url"],
                author=raw.get("author"),
                published_at=raw.get("published_at", datetime.datetime.utcnow()),
                summary=meta["summary"],
                why_it_matters=meta["why_it_matters"],
                tags=meta["tags"],
                relevance=meta["relevance"],
                raw_content=raw.get("raw_content")
            )
            session.add(feed_item)
            new_count += 1

        await session.commit()

    print(f"Ingestion complete: {new_count} new items added.")
    return new_count
