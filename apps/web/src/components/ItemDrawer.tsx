"use client";

import React from "react";
import { X, ExternalLink, Bookmark, Play, Sparkles } from "lucide-react";
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
  if (!item) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[460px] bg-card border-l border-border shadow-2xl z-30 flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
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

      <div className="flex items-center gap-1.5 mt-3 flex-wrap">
        {item.tags.map((t) => (
          <span key={t} className="px-2 py-0.5 rounded-full text-[11px] font-medium border border-border bg-sidebar text-muted">
            {t}
          </span>
        ))}
      </div>

      {/* TL;DR Box */}
      <div className="mt-5 p-3.5 rounded-xl border border-border bg-sidebar">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
          Technical Summary (TL;DR)
        </div>
        <p className="text-xs text-foreground leading-relaxed">{item.summary}</p>
      </div>

      {/* Why it matters */}
      <div className="mt-4 p-3.5 rounded-xl border border-border bg-card">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-primary mb-1">
          Why it Matters for Agent Builders
        </div>
        <p className="text-xs text-muted leading-relaxed">{item.why_it_matters}</p>
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex flex-col gap-2.5">
        {item.source_type === "Paper" && (
          <button
            onClick={() => onLaunchExperiment(item)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover transition shadow-sm"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Reproduce on GPU (Kaggle / Colab)</span>
          </button>
        )}

        <button
          onClick={() => onAskCopilot(item)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium border border-border bg-card hover:bg-hover text-foreground transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Analyze with Research Copilot</span>
        </button>

        <div className="flex items-center gap-2 mt-1">
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
