import feedparser
import datetime
from typing import List, Dict, Any
from bs4 import BeautifulSoup

RSS_FEEDS = [
    {"url": "https://huggingface.co/blog/feed.xml", "source": "Hugging Face Blog", "type": "Blog"},
    {"url": "https://blog.langchain.dev/rss/", "source": "LangChain Blog", "type": "Blog"},
    {"url": "https://www.llamaindex.ai/blog/rss.xml", "source": "LlamaIndex Blog", "type": "Blog"},
    {"url": "https://openai.com/news/rss.xml", "source": "OpenAI News", "type": "News"},
]

def clean_html(raw_html: str) -> str:
    if not raw_html:
        return ""
    try:
        soup = BeautifulSoup(raw_html, "html.parser")
        return soup.get_text(separator=" ", strip=True)
    except Exception:
        return raw_html

async def fetch_rss_feeds() -> List[Dict[str, Any]]:
    """
    Fetches latest blog posts and news from AI research and engineering RSS feeds.
    """
    items = []
    for feed_info in RSS_FEEDS:
        try:
            feed = feedparser.parse(feed_info["url"])
            for entry in feed.entries[:5]:
                title = entry.get("title", "")
                link = entry.get("link", "")
                summary = clean_html(entry.get("summary") or entry.get("description", ""))
                
                # Published date parsing
                pub_date = datetime.datetime.utcnow()
                if hasattr(entry, "published_parsed") and entry.published_parsed:
                    pub_date = datetime.datetime(*entry.published_parsed[:6])
                elif hasattr(entry, "updated_parsed") and entry.updated_parsed:
                    pub_date = datetime.datetime(*entry.updated_parsed[:6])

                item_id = f"rss_{abs(hash(link)) % 100000000}"

                items.append({
                    "id": item_id,
                    "title": title,
                    "source": feed_info["source"],
                    "source_type": feed_info["type"],
                    "url": link,
                    "author": entry.get("author", feed_info["source"]),
                    "published_at": pub_date,
                    "raw_content": summary[:2000],
                    "matched_keywords": ["blog", "news"]
                })
        except Exception as e:
            print(f"Error parsing RSS {feed_info['url']}: {e}")

    return items
