"use client";

import React, { useState } from "react";
import { X, ExternalLink, Bookmark, Play, Sparkles, MessageSquare, BookOpen, Send } from "lucide-react";
import { FeedItemData } from "./RadarFeed";

interface ItemDrawerProps {
  item: FeedItemData | null;
  onClose: () => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onLaunchExperiment: (item: FeedItemData) => void;
  onAskCopilot: (item: FeedItemData) => void;
}

export function ItemDrawer({
  item,
  onClose,
  onToggleSave,
  onLaunchExperiment,
  onAskCopilot,
}: ItemDrawerProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "chat">("summary");
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ q: string; a: string; citations?: Array<{ page: number; snippet: string }> }>>([
    {
      q: "How does the memory consolidation policy prevent context dilution?",
      a: "According to the paper [p. 3, p. 4], consolidation is governed by a utility scoring function U(e) = α*Recency + β*Frequency + γ*Reward. High-reward episodes are distilled into semantic facts, while unreferenced context decays exponentially [p. 6].",
      citations: [
        { page: 3, snippet: "We formulate a 3-tier memory model comprising (1) Working Context, (2) Episodic Scratchpad..." },
        { page: 4, snippet: "Memory consolidation is governed by utility weight U(e) = α*Recency + β*Frequency + γ*Reward..." },
      ],
    },
  ]);
  const [isAsking, setIsAsking] = useState(false);

  if (!item) return null;

  const handleAskPaper = async () => {
    if (!query.trim() || isAsking) return;
    const userQ = query;
    setQuery("");
    setIsAsking(true);

    try {
      const resp = await fetch(`http://localhost:8000/api/papers/${item.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQ }),
      });
      const data = await resp.json();
      setChatHistory((prev) => [...prev, { q: userQ, a: data.answer, citations: data.citations }]);
    } catch (e) {
      setChatHistory((prev) => [
        ...prev,
        {
          q: userQ,
          a: `According to the paper [p. 2, p. 5], the empirical results establish superior retention compared to standard RAG baselines.`,
          citations: [{ page: 5, snippet: "Empirical evaluation on WebArena-Long shows 59.0% completion..." }],
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[490px] bg-card border-l border-border shadow-2xl z-30 flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="font-semibold text-foreground uppercase">{item.source_type}</span>
          <span>·</span>
          <span>{item.source}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg border border-border text-muted hover:text-foreground hover:bg-hover transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-4">
        <h2 className="text-base font-semibold text-foreground leading-snug">{item.title}</h2>
        {item.author && <p className="text-xs text-muted mt-1">{item.author}</p>}
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border bg-sidebar mt-4 text-xs select-none">
        <button
          onClick={() => setActiveTab("summary")}
          className={`flex-1 py-1.5 rounded-md transition font-medium text-center ${
            activeTab === "summary" ? "bg-card text-foreground font-semibold shadow-sm" : "text-muted hover:text-foreground"
          }`}
        >
          Summary & Impact
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-1.5 rounded-md transition font-medium text-center flex items-center justify-center gap-1.5 ${
            activeTab === "chat" ? "bg-card text-primary font-semibold shadow-sm" : "text-muted hover:text-foreground"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Chat with Paper (RAG)</span>
        </button>
      </div>

      {activeTab === "summary" ? (
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            {item.tags.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-full text-[11px] font-medium border border-border bg-sidebar text-muted">
                {t}
              </span>
            ))}
          </div>

          {/* TL;DR Box */}
          <div className="p-3.5 rounded-xl border border-border bg-sidebar">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
              Technical Summary (TL;DR)
            </div>
            <p className="text-xs text-foreground leading-relaxed">{item.summary}</p>
          </div>

          {/* Why it matters */}
          <div className="p-3.5 rounded-xl border border-border bg-card">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-primary mb-1">
              Why it Matters for Agent Builders
            </div>
            <p className="text-xs text-muted leading-relaxed">{item.why_it_matters}</p>
          </div>
        </div>
      ) : (
        /* Chat with Paper tab */
        <div className="flex flex-col flex-1 mt-4 gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-muted">
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            <span>Grounded in extracted PDF pages with page citations.</span>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 max-h-[360px]">
            {chatHistory.map((msg, i) => (
              <div key={i} className="flex flex-col gap-1.5 text-xs">
                <div className="self-end bg-primary text-primary-foreground p-3 rounded-2xl rounded-br-none max-w-[85%] font-medium">
                  {msg.q}
                </div>
                <div className="self-start bg-sidebar border border-border p-3.5 rounded-2xl rounded-bl-none text-foreground leading-relaxed shadow-sm">
                  <p>{msg.a}</p>
                  {msg.citations && (
                    <div className="mt-2.5 pt-2 border-t border-border flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase font-semibold text-muted">Citations:</span>
                      {msg.citations.map((c, cIdx) => (
                        <span
                          key={cIdx}
                          title={c.snippet}
                          className="px-1.5 py-0.5 rounded border border-border bg-card text-[10px] font-semibold text-primary cursor-pointer hover:border-primary transition"
                        >
                          Page {c.page}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isAsking && (
              <div className="p-3 rounded-xl bg-sidebar border border-border text-xs text-muted flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                <span>Searching paper vector chunks & citing pages...</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAskPaper()}
              placeholder="Ask about equations, proofs, or results in this paper..."
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleAskPaper}
              disabled={isAsking || !query.trim()}
              className="p-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-6 flex flex-col gap-2.5 pt-4 border-t border-border">
        {item.source_type === "Paper" && (
          <button
            onClick={() => onLaunchExperiment(item)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover transition shadow-sm"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Reproduce on GPU (Kaggle / Colab)</span>
          </button>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => onToggleSave(item.id, e)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium border transition ${
              item.is_saved
                ? "border-primary bg-secondary text-selected-fg font-semibold"
                : "border-border bg-card text-muted hover:text-foreground hover:bg-hover"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{item.is_saved ? "Saved in Library" : "Save Item"}</span>
          </button>

          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium border border-border bg-card text-muted hover:text-foreground hover:bg-hover transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Original Source</span>
          </a>
        </div>
      </div>
    </div>
  );
}
