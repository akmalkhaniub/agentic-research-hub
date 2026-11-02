"use client";

import React from "react";
import { Sparkles, Clock, ArrowRight, Play, CheckCircle2, AlertCircle } from "lucide-react";
import { FeedItemData } from "./RadarFeed";

interface TodayViewProps {
  items: FeedItemData[];
  onOpenItem: (item: FeedItemData) => void;
  onNavigateTab: (tab: any) => void;
  onLaunchExperiment: (item: FeedItemData) => void;
}

export function TodayView({
  items,
  onOpenItem,
  onNavigateTab,
  onLaunchExperiment,
}: TodayViewProps) {
  const topPicks = items.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      {/* Briefing banner */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Today's Executive Briefing</span>
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {items.length} Notable Agentic AI Updates Ingested
        </h2>
        <ul className="mt-3 flex flex-col gap-2 text-xs text-muted leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-foreground font-bold">•</span>
            <span>
              <strong className="text-foreground">Hierarchical Memory:</strong> Recent benchmarks confirm 3-tier episodic memory (working/episodic/semantic) outperforms flat RAG by 18% on tasks exceeding 200 steps.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-foreground font-bold">•</span>
            <span>
              <strong className="text-foreground">Durable Sub-graphs:</strong> LangGraph and agentic frameworks are standardizing isolated checkpointing to prevent multi-agent cascades from failing on single tool exceptions.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-foreground font-bold">•</span>
            <span>
              <strong className="text-foreground">Multi-agent Topology:</strong> Production postmortems caution against swarms &gt;4 specialists without a centralized coordinator or shared scratchpad.
            </span>
          </li>
        </ul>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Top picks column (2 cols) */}
        <div className="col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-foreground">Top Research Picks</h3>
            <button
              onClick={() => onNavigateTab("radar")}
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
            >
              <span>Explore all feed updates</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {topPicks.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenItem(item)}
              className="card-hover p-4 rounded-xl border border-border bg-card cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-[11px] text-muted mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-foreground">{item.source_type}</span>
                <span>·</span>
                <span>{item.source}</span>
              </div>
              <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition leading-snug">
                {item.title}
              </h4>
              <p className="text-xs text-muted mt-1.5 leading-relaxed line-clamp-2">
                {item.summary}
              </p>
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50">
                <div className="flex items-center gap-1.5">
                  {item.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-border bg-sidebar text-muted">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="ml-auto">
                  <span className="text-xs text-primary font-medium group-hover:underline">Read details →</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right side widgets column (1 col) */}
        <div className="flex flex-col gap-5">
          {/* Active GPU runs */}
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider">Active GPU Runs</h4>
              <button
                onClick={() => onNavigateTab("lab")}
                className="text-[11px] text-primary hover:underline"
              >
                Lab →
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="p-2.5 rounded-lg border border-border bg-sidebar">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">Unsloth LoRA (Qwen-4B)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-semibold">Running</span>
                </div>
                <div className="text-[11px] text-muted mt-0.5">Kaggle T4×2 · 1h 12m elapsed</div>
                <div className="w-full bg-accent h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: "65%" }} />
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-border bg-sidebar">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">Embedding Benchmark</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-semibold">Awaiting Colab</span>
                </div>
                <div className="text-[11px] text-muted mt-0.5">Colab T4 · Open notebook</div>
              </div>
            </div>
          </div>

          {/* Quota gauges */}
          <div className="p-4 rounded-xl border border-border bg-card flex flex-col gap-3">
            <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider">Weekly Free Compute</h4>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-foreground font-medium">Kaggle GPU</span>
                <span className="text-muted text-[11px]">12 / 30h</span>
              </div>
              <div className="w-full bg-accent h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: "40%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-foreground font-medium">Modal Credits</span>
                <span className="text-muted text-[11px]">$8 / $30</span>
              </div>
              <div className="w-full bg-accent h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: "26%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-foreground font-medium">Lightning AI</span>
                <span className="text-muted text-[11px]">4 / 15 credits</span>
              </div>
              <div className="w-full bg-accent h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: "27%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
