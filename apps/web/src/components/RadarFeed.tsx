"use client";

import React, { useState } from "react";
import { Filter, Bookmark, ExternalLink, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";

export interface FeedItemData {
  id: string;
  title: string;
  source: string;
  source_type: string;
  url: string;
  author?: string;
  summary: string;
  why_it_matters: string;
  tags: string[];
  relevance: string;
  published_at?: string;
  is_read: boolean;
  is_saved: boolean;
}

interface RadarFeedProps {
  items: FeedItemData[];
  onSelectItem: (item: FeedItemData) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function RadarFeed({
  items,
  onSelectItem,
  onToggleSave,
  onRefresh,
  isRefreshing,
}: RadarFeedProps) {
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const types = ["All", "Paper", "Release", "News", "Blog"];
  const tags = ["All", "Memory", "Multi-agent", "Planning", "Tool use/MCP", "A2A", "Evals", "Deployment"];

  const filtered = items.filter((item) => {
    if (selectedType !== "All" && item.source_type !== selectedType) return false;
    if (selectedTag !== "All" && !item.tags.includes(selectedTag)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!item.title.toLowerCase().includes(q) && !item.summary.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="flex gap-6 max-w-7xl mx-auto">
      {/* Filters sidebar rail */}
      <div className="w-52 shrink-0 flex flex-col gap-5 select-none">
        <div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-muted mb-2">Content Type</div>
          <div className="flex flex-col gap-1">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  selectedType === t
                    ? "bg-secondary text-selected-fg font-semibold"
                    : "text-muted hover:bg-hover hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-wider font-semibold text-muted mb-2">Core Topics</div>
          <div className="flex flex-col gap-1">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  selectedTag === t
                    ? "bg-secondary text-selected-fg font-semibold"
                    : "text-muted hover:bg-hover hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main feed list */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="Filter feed by keywords…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground text-xs focus:outline-none focus:border-primary"
          />
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-hover text-xs font-medium text-foreground transition disabled:opacity-50"
          >
            {isRefreshing ? "Scanning..." : "Scan Feeds"}
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border rounded-xl text-muted text-xs">
              No updates match the selected filters.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="card-hover p-4 rounded-xl border border-border bg-card cursor-pointer group relative"
              >
                <div className="flex items-center gap-2 text-[11px] text-muted mb-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.relevance === "high"
                        ? "bg-emerald-500"
                        : item.relevance === "med"
                        ? "bg-amber-500"
                        : "bg-slate-400"
                    }`}
                    title={`Relevance: ${item.relevance}`}
                  />
                  <span className="font-medium text-foreground">{item.source_type}</span>
                  <span>·</span>
                  <span>{item.source}</span>
                  {item.author && (
                    <>
                      <span>·</span>
                      <span className="truncate max-w-[200px]">{item.author}</span>
                    </>
                  )}
                </div>

                <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-muted mt-1.5 line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>

                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/60">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-border bg-sidebar text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="ml-auto flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => onToggleSave(item.id, e)}
                      className={`p-1.5 rounded-lg border text-xs transition ${
                        item.is_saved
                          ? "border-primary bg-secondary text-selected-fg"
                          : "border-border text-muted hover:text-foreground hover:bg-hover"
                      }`}
                      title={item.is_saved ? "Saved in Library" : "Save to Library"}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg border border-border text-muted hover:text-foreground hover:bg-hover text-xs transition"
                      title="Open Original Source"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
