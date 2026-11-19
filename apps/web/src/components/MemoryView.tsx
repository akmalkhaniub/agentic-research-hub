"use client";

import React, { useState, useEffect } from "react";
import { Brain, Layers, Database, Sparkles, RefreshCw, CheckCircle2, Search, ArrowRight, Zap, ShieldAlert } from "lucide-react";

interface MemoryState {
  working_memory: {
    token_count: number;
    max_tokens: number;
    saturation_pct: number;
    items: Array<{
      turn: number;
      role: string;
      content: string;
      tokens: number;
    }>;
  };
  episodic_memory: {
    total_episodes: number;
    unconsolidated_count: number;
    episodes: Array<{
      id: string;
      timestamp: string;
      task: string;
      action: string;
      observation: string;
      status: string;
      consolidated: boolean;
    }>;
  };
  semantic_memory: {
    total_rules: number;
    rules: Array<{
      id: string;
      category: string;
      rule: string;
      derived_from: string;
      confidence: number;
      created_at: string;
    }>;
  };
}

export function MemoryView() {
  const [memoryState, setMemoryState] = useState<MemoryState | null>(null);
  const [isCompacting, setIsCompacting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [compactNotice, setCompactNotice] = useState<string | null>(null);

  const fetchMemory = () => {
    fetch("http://localhost:8000/api/memory/state")
      .then((res) => res.json())
      .then((data) => setMemoryState(data))
      .catch((e) => console.error(e));
  };

  useEffect(() => {
    fetchMemory();
  }, []);

  const handleConsolidate = async () => {
    setIsCompacting(true);
    setCompactNotice(null);
    try {
      const res = await fetch("http://localhost:8000/api/memory/consolidate", { method: "POST" });
      const data = await res.json();
      setMemoryState(data.memory_state);
      setCompactNotice(`Compacted ${data.episodes_compacted} episodes; reclaimed ${data.tokens_freed} context tokens!`);
      setTimeout(() => setCompactNotice(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCompacting(false);
    }
  };

  if (!memoryState) {
    return (
      <div className="text-center py-16 border border-dashed border-border rounded-2xl text-muted text-xs">
        Loading Cognitive Memory Topology...
      </div>
    );
  }

  const filteredEpisodes = memoryState.episodic_memory.episodes.filter(
    (e) => !searchQuery || e.task.toLowerCase().includes(searchQuery.toLowerCase()) || e.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRules = memoryState.semantic_memory.rules.filter(
    (r) => !searchQuery || r.rule.toLowerCase().includes(searchQuery.toLowerCase()) || r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Agent Memory & Context Inspector
          </h2>
          <p className="text-xs text-muted mt-1">
            Real-time inspection of 3-tier cognitive memory: active working context, episodic trajectory logs, and consolidated invariant rules.
          </p>
        </div>

        <button
          onClick={handleConsolidate}
          disabled={isCompacting}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition disabled:opacity-50 shrink-0"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isCompacting ? "animate-spin" : ""}`} />
          {isCompacting ? "Compacting..." : "Trigger Consolidation"}
        </button>
      </div>

      {compactNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          {compactNotice}
        </div>
      )}

      {/* Tier 1: Working Memory Context Window */}
      <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-sm text-foreground">Tier 1: Active Working Context Window</span>
          </div>
          <span className="text-[11px] font-mono text-muted">
            {memoryState.working_memory.token_count} / {memoryState.working_memory.max_tokens} Tokens ({memoryState.working_memory.saturation_pct}%)
          </span>
        </div>

        {/* Token Progress Bar */}
        <div className="w-full h-2 rounded-full bg-muted/20 overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ width: `${Math.min(memoryState.working_memory.saturation_pct, 100)}%` }}
          />
        </div>

        {/* Working Context Items Stream */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
          {memoryState.working_memory.items.map((item) => (
            <div key={item.turn} className="p-2.5 rounded-lg border border-border bg-background space-y-1">
              <div className="flex items-center justify-between text-[10px] text-muted">
                <span className="font-semibold text-primary">Turn {item.turn} ({item.role})</span>
                <span className="font-mono bg-muted/20 px-1 rounded">{item.tokens} tok</span>
              </div>
              <p className="text-[11px] text-foreground font-sans line-clamp-2">{item.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Filter episodic traces and semantic rules by keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-card text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Split Grid: Tier 2 (Episodic) vs Tier 3 (Semantic) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier 2: Episodic Trajectory Store */}
        <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              <span className="font-bold text-sm text-foreground">Tier 2: Episodic Trajectory Store</span>
            </div>
            <span className="text-[11px] text-muted font-mono">
              {memoryState.episodic_memory.total_episodes} Episodes
            </span>
          </div>

          <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
            {filteredEpisodes.map((ep) => (
              <div key={ep.id} className="p-3.5 rounded-xl border border-border bg-background space-y-2 text-xs">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-foreground font-mono">{ep.id}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded font-medium ${
                      ep.consolidated
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-amber-500/10 text-amber-500"
                    }`}
                  >
                    {ep.consolidated ? "Consolidated" : "Unconsolidated"}
                  </span>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div><strong className="text-muted">Task:</strong> <span className="text-foreground">{ep.task}</span></div>
                  <div><strong className="text-muted">Action:</strong> <span className="text-foreground font-mono">{ep.action}</span></div>
                  <div><strong className="text-muted">Observation:</strong> <span className="text-muted">{ep.observation}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier 3: Consolidated Semantic Invariants */}
        <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-500" />
              <span className="font-bold text-sm text-foreground">Tier 3: Semantic Long-Term Knowledge</span>
            </div>
            <span className="text-[11px] text-muted font-mono">
              {memoryState.semantic_memory.total_rules} Invariants
            </span>
          </div>

          <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
            {filteredRules.map((rule) => (
              <div key={rule.id} className="p-3.5 rounded-xl border border-border bg-background space-y-2 text-xs">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-purple-500 uppercase tracking-wider">{rule.category}</span>
                  <span className="text-muted font-mono">Confidence: {rule.confidence * 100}%</span>
                </div>

                <p className="text-[11px] text-foreground font-sans leading-relaxed">
                  "{rule.rule}"
                </p>

                <div className="text-[10px] text-muted flex items-center justify-between pt-1 border-t border-border/40">
                  <span>Source: {rule.derived_from}</span>
                  <span>Persistent</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
