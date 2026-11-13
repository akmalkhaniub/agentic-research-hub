"""
library.py: Personal Research Library manager with collections, notes,
and multi-format exporter (Markdown, Obsidian Vault [[wikilinks]], BibTeX).
"""

from typing import List, Dict, Any, Optional

COLLECTIONS = [
    {"id": "inbox", "name": "Inbox", "description": "Unsorted papers and releases flagged for review", "count": 12},
    {"id": "reading_list", "name": "Reading List", "description": "Prioritized queue for in-depth analysis", "count": 5},
    {"id": "core_architecture", "name": "Core Architecture", "description": "Reference designs on Supervised and Hierarchical multi-agent trees", "count": 8},
    {"id": "memory_research", "name": "Memory & Consolidation", "description": "Episodic, working, and semantic memory architectures (MemOS-2, Letta)", "count": 9},
    {"id": "saved_notes", "name": "Synthesis Notes", "description": "Personal technical notes and experiment takeaways", "count": 4}
]

def export_library_item(item: Dict[str, Any], format_type: str = "markdown") -> str:
    """
    Exports a paper or note into Markdown, Obsidian Vault note, or BibTeX.
    """
    title = item.get("title", "Untitled Paper")
    author = item.get("author", "Unknown Author")
    url = item.get("url", "")
    summary = item.get("summary", "")
    why_it_matters = item.get("why_it_matters", "")
    tags = item.get("tags", [])
    item_id = item.get("id", "paper_ref")

    if format_type == "obsidian":
        tags_str = "\n".join([f"  - {t.lower().replace(' ', '-')}" for t in tags])
        return f"""---
title: "{title}"
author: "{author}"
url: "{url}"
created: 2026-11-14
type: literature-note
tags:
{tags_str}
---

# {title}

**Authors:** {author}  
**Source URL:** [{url}]({url})

## Executive Summary
{summary}

## Why it Matters for Agent Architecture
{why_it_matters}

## Connected Patterns & References
- [[Supervisor Pattern]]
- [[3-Tier Episodic Memory]]
- [[GAIA Benchmark]]

## Notes & Observations
- Extracted and indexed via [[Agentic AI Research Hub]]
"""

    elif format_type == "bibtex":
        clean_key = re_clean = "".join(c for c in title.split()[0] if c.isalnum()).lower()
        return f"""@article{{{clean_key}2026agentic,
  title     = {{{title}}},
  author    = {{{author}}},
  journal   = {{arXiv preprint / Research Hub}},
  year      = {{2026}},
  url       = {{{url}}},
  note      = {{Indexed in Agentic Research Hub}}
}}"""

    else:  # standard markdown
        return f"""# {title}
*By {author}* | [Original Publication]({url})

### Summary
{summary}

### Architectural Impact
{why_it_matters}

**Tags:** {', '.join(tags)}
"""
