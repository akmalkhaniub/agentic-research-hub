"use client";

import React, { useState, useEffect } from "react";
import { GitBranch, Play, Copy, Check, ExternalLink, ShieldCheck, Zap, DollarSign } from "lucide-react";

interface PatternData {
  slug: string;
  name: string;
  category: string;
  summary: string;
  when_to_use: string;
  when_to_avoid: string;
  tradeoffs: {
    reliability: number;
    latency: number;
    token_cost: number;
    complexity: number;
  };
  langgraph_code: string;
  adk_code: string;
  crewai_code: string;
}

interface PatternsViewProps {
  onRunBenchmark: (patternName: string) => void;
}

export function PatternsView({ onRunBenchmark }: PatternsViewProps) {
  const [patterns, setPatterns] = useState<PatternData[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("supervisor");
  const [selectedCodeTab, setSelectedCodeTab] = useState<"langgraph" | "adk" | "crewai">("langgraph");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/api/patterns")
      .then((res) => res.json())
      .then((data) => {
        if (data.patterns) {
          setPatterns(data.patterns);
          if (data.patterns.length > 0) {
            setSelectedSlug(data.patterns[0].slug);
          }
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const activePattern = patterns.find((p) => p.slug === selectedSlug) || patterns[0];

  const handleCopyCode = () => {
    if (!activePattern) return;
    const code =
      selectedCodeTab === "langgraph"
        ? activePattern.langgraph_code
        : selectedCodeTab === "adk"
        ? activePattern.adk_code
        : activePattern.crewai_code;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activePattern) {
    return <div className="p-8 text-center text-xs text-muted">Loading pattern catalog...</div>;
  }

  const activeCode =
    selectedCodeTab === "langgraph"
      ? activePattern.langgraph_code
      : selectedCodeTab === "adk"
      ? activePattern.adk_code
      : activePattern.crewai_code;

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-primary" />
            <span>Architecture Patterns Playground</span>
          </h2>
          <p className="text-xs text-muted">
            Inspect canonical agentic topologies, trade-offs, and multi-framework implementations across LangGraph, Google ADK, and CrewAI.
          </p>
        </div>
        <button
          onClick={() => onRunBenchmark(activePattern.name)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs transition shadow-sm"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Benchmark Topology in Lab</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Pattern list column (4 cols) */}
        <div className="col-span-4 flex flex-col gap-2 select-none">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted px-1 mb-1">
            Canonical Topologies ({patterns.length})
          </div>
          {patterns.map((p) => {
            const isSelected = selectedSlug === p.slug;
            return (
              <div
                key={p.slug}
                onClick={() => setSelectedSlug(p.slug)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                  isSelected
                    ? "border-primary bg-secondary/60 shadow-sm"
                    : "border-border bg-card hover:bg-hover"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-foreground">{p.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-sidebar text-muted">
                    {p.category}
                  </span>
                </div>
                <p className="text-[11px] text-muted line-clamp-2 leading-relaxed">{p.summary}</p>
              </div>
            );
          })}
        </div>

        {/* Pattern details column (8 cols) */}
        <div className="col-span-8 flex flex-col gap-5">
          {/* Main card */}
          <div className="p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col gap-5">
            <div>
              <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                {activePattern.category} Topology
              </div>
              <h3 className="text-xl font-bold text-foreground">{activePattern.name}</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">{activePattern.summary}</p>
            </div>

            {/* When to use / avoid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-border bg-sidebar">
                <div className="font-semibold text-foreground mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>When to Use</span>
                </div>
                <p className="text-muted leading-relaxed">{activePattern.when_to_use}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-sidebar">
                <div className="font-semibold text-foreground mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>When to Avoid</span>
                </div>
                <p className="text-muted leading-relaxed">{activePattern.when_to_avoid}</p>
              </div>
            </div>

            {/* Trade-offs meters */}
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">
                Empirical Architectural Trade-Offs
              </div>
              <div className="grid grid-cols-4 gap-3 text-xs">
                {Object.entries(activePattern.tradeoffs).map(([metric, val]) => (
                  <div key={metric} className="p-3 rounded-lg border border-border bg-sidebar">
                    <div className="capitalize text-muted text-[11px] mb-1">{metric.replace("_", " ")}</div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <span
                          key={lvl}
                          className={`flex-1 h-1.5 rounded-full ${
                            lvl <= val ? "bg-primary" : "bg-border"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Tabs */}
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border bg-sidebar text-xs">
                  <button
                    onClick={() => setSelectedCodeTab("langgraph")}
                    className={`px-3 py-1 rounded-md transition font-medium ${
                      selectedCodeTab === "langgraph"
                        ? "bg-card text-foreground font-semibold shadow-sm"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    LangGraph
                  </button>
                  <button
                    onClick={() => setSelectedCodeTab("adk")}
                    className={`px-3 py-1 rounded-md transition font-medium ${
                      selectedCodeTab === "adk"
                        ? "bg-card text-foreground font-semibold shadow-sm"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    Google ADK
                  </button>
                  <button
                    onClick={() => setSelectedCodeTab("crewai")}
                    className={`px-3 py-1 rounded-md transition font-medium ${
                      selectedCodeTab === "crewai"
                        ? "bg-card text-foreground font-semibold shadow-sm"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    CrewAI
                  </button>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-card text-xs text-muted hover:text-foreground transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy Code"}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-sidebar border border-border overflow-x-auto">
                <pre className="font-mono text-xs text-foreground leading-relaxed whitespace-pre">
                  {activeCode}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
