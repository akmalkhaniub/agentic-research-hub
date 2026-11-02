import httpx
import xml.etree.ElementTree as ET
import datetime
from typing import List, Dict, Any

ARXIV_API_URL = "http://export.arxiv.org/api/query"

AGENTIC_KEYWORDS = [
    "agent", "agentic", "multi-agent", "tool-use", "planning", 
    "memory", "reflection", "reasoning", "mcp", "workflow"
]

async def fetch_arxiv_papers(max_results: int = 15) -> List[Dict[str, Any]]:
    """
    Fetches latest papers from arXiv cs.AI, cs.MA, cs.CL, cs.LG matching agentic queries.
    """
    query = 'cat:cs.AI OR cat:cs.MA OR cat:cs.CL OR cat:cs.LG'
    params = {
        "search_query": query,
        "start": 0,
        "max_results": max_results,
        "sortBy": "submittedDate",
        "sortOrder": "descending",
    }

    papers = []
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(ARXIV_API_URL, params=params)
            if resp.status_code != 200:
                return []

            root = ET.fromstring(resp.text)
            ns = {"atom": "http://www.w3.org/2005/Atom", "arxiv": "http://arxiv.org/schemas/atom"}

            for entry in root.findall("atom:entry", ns):
                title_elem = entry.find("atom:title", ns)
                summary_elem = entry.find("atom:summary", ns)
                id_elem = entry.find("atom:id", ns)
                published_elem = entry.find("atom:published", ns)

                title = " ".join(title_elem.text.split()) if title_elem is not None and title_elem.text else ""
                summary = " ".join(summary_elem.text.split()) if summary_elem is not None and summary_elem.text else ""
                url = id_elem.text.strip() if id_elem is not None and id_elem.text else ""
                
                # Check if it has any agentic / reasoning keywords in title or summary
                text_to_check = f"{title.lower()} {summary.lower()}"
                matched_keywords = [kw for kw in AGENTIC_KEYWORDS if kw in text_to_check]
                if not matched_keywords:
                    continue

                authors = []
                for author in entry.findall("atom:author", ns):
                    name_elem = author.find("atom:name", ns)
                    if name_elem is not None and name_elem.text:
                        authors.append(name_elem.text.strip())

                author_str = ", ".join(authors[:3])
                if len(authors) > 3:
                    author_str += " et al."

                pub_date = datetime.datetime.utcnow()
                if published_elem is not None and published_elem.text:
                    try:
                        pub_date = datetime.datetime.fromisoformat(published_elem.text.replace("Z", "+00:00")).replace(tzinfo=None)
                    except Exception:
                        pass

                # Derive clean arxiv ID
                arxiv_id = url.split("/abs/")[-1] if "/abs/" in url else url

                papers.append({
                    "id": f"arxiv_{arxiv_id.replace('.', '_').replace('/', '_')}",
                    "title": title,
                    "source": "arXiv · cs.AI",
                    "source_type": "Paper",
                    "url": url,
                    "author": author_str,
                    "published_at": pub_date,
                    "raw_content": summary,
                    "matched_keywords": matched_keywords
                })

    except Exception as e:
        print(f"Error fetching arXiv papers: {e}")

    return papers
