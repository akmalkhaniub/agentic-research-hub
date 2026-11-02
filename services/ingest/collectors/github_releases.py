import httpx
import datetime
from typing import List, Dict, Any

FRAMEWORK_REPOS = [
    {"repo": "langchain-ai/langgraph", "name": "LangGraph"},
    {"repo": "crewAIInc/crewAI", "name": "CrewAI"},
    {"repo": "microsoft/autogen", "name": "AutoGen (AG2)"},
    {"repo": "pydantic/pydantic-ai", "name": "PydanticAI"},
    {"repo": "huggingface/smolagents", "name": "smolagents"},
    {"repo": "stanfordnlp/dspy", "name": "DSPy"},
    {"repo": "modelcontextprotocol/servers", "name": "MCP Servers"},
]

async def fetch_github_releases(limit_per_repo: int = 2) -> List[Dict[str, Any]]:
    """
    Fetches latest releases for essential agentic frameworks from GitHub.
    """
    releases = []
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "AgenticResearchHub/0.1.0"
    }

    async with httpx.AsyncClient(timeout=10.0, headers=headers) as client:
        for item in FRAMEWORK_REPOS:
            repo = item["repo"]
            name = item["name"]
            url = f"https://api.github.com/repos/{repo}/releases"
            try:
                resp = await client.get(url, params={"per_page": limit_per_repo})
                if resp.status_code != 200:
                    continue

                data = resp.json()
                for rel in data:
                    tag_name = rel.get("tag_name", "")
                    rel_name = rel.get("name") or tag_name
                    body = rel.get("body", "") or ""
                    html_url = rel.get("html_url", f"https://github.com/{repo}/releases/tag/{tag_name}")
                    pub_str = rel.get("published_at")
                    
                    pub_date = datetime.datetime.utcnow()
                    if pub_str:
                        try:
                            pub_date = datetime.datetime.fromisoformat(pub_str.replace("Z", "+00:00")).replace(tzinfo=None)
                        except Exception:
                            pass

                    # Clean title
                    title = f"{name} {tag_name} released: {rel_name}" if tag_name not in rel_name else f"{name} {rel_name}"

                    releases.append({
                        "id": f"gh_{repo.replace('/', '_')}_{tag_name}",
                        "title": title,
                        "source": f"GitHub Releases · {name}",
                        "source_type": "Release",
                        "url": html_url,
                        "author": repo.split("/")[0],
                        "published_at": pub_date,
                        "raw_content": body[:1500],
                        "matched_keywords": ["framework", "release", name.lower()]
                    })
            except Exception as e:
                print(f"Error fetching release for {repo}: {e}")

    return releases
