"use client";

import React, { useState, useEffect } from "react";
import { Swords, Play, Trophy, Cpu, Zap, DollarSign, Clock, ShieldCheck, ArrowRight, RotateCcw, AlertTriangle } from "lucide-react";

interface Scenario {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  prompt: string;
  target_tools: string[];
  expected_steps_baseline: number;
  success_criteria: string;
}

interface ContenderSpec {
  id: string;
  name: string;
  topology: string;
  framework: string;
  color: string;
}

interface ArenaResult {
  scenario: Scenario;
  winner: string;
  winner_name: string;
  verdict: string;
  contender_a: {
    id: string;
    spec: ContenderSpec;
    metrics: {
      steps: number;
      latency_s: number;
      tokens: number;
      cost_usd: number;
      success_rate: number;
      recovery_rate: number;
    };
    trace: Array<{
      step: number;
      role: string;
      type: string;
      content: string;
    }>;
  };
  contender_b: {
    id: string;
    spec: ContenderSpec;
    metrics: {
      steps: number;
      latency_s: number;
      tokens: number;
      cost_usd: number;
      success_rate: number;
      recovery_rate: number;
    };
    trace: Array<{
      step: number;
      role: string;
      type: string;
      content: string;
    }>;
  };
}

export function ArenaView() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [contenders, setContenders] = useState<ContenderSpec[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("scenario_distributed_lock");
  const [contenderA, setContenderA] = useState<string>("react_baseline");
  const [contenderB, setContenderB] = useState<string>("supervisor_specialists");
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<ArenaResult | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/arena/scenarios")
      .then((res) => res.json())
      .then((data) => {
        if (data.scenarios) setScenarios(data.scenarios);
        if (data.contenders) setContenders(data.contenders);
      })
      .catch((e) => console.error(e));
  }, []);

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch("http://localhost:8000/api/arena/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario_id: selectedScenarioId,
          contender_a: contenderA,
          contender_b: contenderB,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const activeScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Swords className="w-5 h-5 text-primary" />
            Architecture Arena & Trace Simulator
          </h2>
          <p className="text-xs text-muted mt-1">
            Empirical side-by-side execution trace simulation across ReAct, Supervisor, Reflexion, and Hierarchical topologies.
          </p>
        </div>

        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition disabled:opacity-50"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isSimulating ? "animate-spin" : ""}`} />
          {isSimulating ? "Simulating Execution..." : "Run Battle Simulation"}
        </button>
      </div>

      {/* Scenario & Contender Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Scenario Picker */}
        <div className="md:col-span-6 p-4 rounded-xl border border-border bg-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              1. Select Challenge Scenario
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted/20 text-muted">
              {activeScenario?.category}
            </span>
          </div>

          <select
            value={selectedScenarioId}
            onChange={(e) => setSelectedScenarioId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs font-medium"
          >
            {scenarios.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.title} ({sc.difficulty})
              </option>
            ))}
          </select>

          {activeScenario && (
            <div className="space-y-2 text-[11px] bg-muted/15 p-3 rounded-lg border border-border/40">
              <p className="text-foreground leading-relaxed font-sans">{activeScenario.prompt}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeScenario.target_tools?.map((t) => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/20 text-muted font-mono">
                    🔧 {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contenders Picker */}
        <div className="md:col-span-6 p-4 rounded-xl border border-border bg-card space-y-3">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            2. Matchup Contenders
          </span>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-muted font-medium mb-1">Contender A (Blue)</label>
              <select
                value={contenderA}
                onChange={(e) => setContenderA(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs"
              >
                {contenders.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-muted font-medium mb-1">Contender B (Red)</label>
              <select
                value={contenderB}
                onChange={(e) => setContenderB(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs"
              >
                {contenders.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-[11px] text-muted pt-2 border-t border-border/40 flex items-center justify-between">
            <span>Evaluation Criteria: Success Rate, Self-Correction, Latency & COGS</span>
            <span className="font-mono text-[10px] text-primary">Fast Simulation</span>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result ? (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Winner Banner */}
          <div className="p-4 rounded-xl border border-primary/40 bg-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Simulation Outcome: {result.winner_name}
                </div>
                <div className="text-xs font-medium text-foreground mt-0.5">{result.verdict}</div>
              </div>
            </div>
          </div>

          {/* Metric Comparison Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-border bg-card">
              <span className="text-[11px] text-muted font-medium block">Success Rate</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold text-foreground">{result.contender_a.metrics.success_rate}%</span>
                <span className="text-xs text-muted">vs</span>
                <span className="text-sm font-bold text-foreground">{result.contender_b.metrics.success_rate}%</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-card">
              <span className="text-[11px] text-muted font-medium block">Total Steps</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold text-foreground">{result.contender_a.metrics.steps} steps</span>
                <span className="text-xs text-muted">vs</span>
                <span className="text-sm font-bold text-foreground">{result.contender_b.metrics.steps} steps</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-card">
              <span className="text-[11px] text-muted font-medium block">Mean Latency</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold text-foreground">{result.contender_a.metrics.latency_s}s</span>
                <span className="text-xs text-muted">vs</span>
                <span className="text-sm font-bold text-foreground">{result.contender_b.metrics.latency_s}s</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-card">
              <span className="text-[11px] text-muted font-medium block">Cost per Task</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold text-foreground">${result.contender_a.metrics.cost_usd}</span>
                <span className="text-xs text-muted">vs</span>
                <span className="text-sm font-bold text-foreground">${result.contender_b.metrics.cost_usd}</span>
              </div>
            </div>
          </div>

          {/* Synchronized Traces Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Contender A Trace */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  {result.contender_a.spec.name}
                </span>
                <span className="text-[10px] font-mono text-muted">
                  {result.contender_a.spec.framework}
                </span>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {result.contender_a.trace.map((t, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-border/60 bg-background text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-muted">
                      <span className="font-semibold text-primary">{t.role}</span>
                      <span className="font-mono bg-muted/20 px-1 rounded">{t.type}</span>
                    </div>
                    <div className="text-foreground leading-relaxed">{t.content}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contender B Trace */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  {result.contender_b.spec.name}
                </span>
                <span className="text-[10px] font-mono text-muted">
                  {result.contender_b.spec.framework}
                </span>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {result.contender_b.trace.map((t, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-border/60 bg-background text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-muted">
                      <span className="font-semibold text-purple-600 dark:text-purple-400">{t.role}</span>
                      <span className="font-mono bg-muted/20 px-1 rounded">{t.type}</span>
                    </div>
                    <div className="text-foreground leading-relaxed">{t.content}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card p-8">
          <Swords className="w-8 h-8 text-muted mx-auto mb-2 opacity-60" />
          <h3 className="font-semibold text-xs text-foreground">No Simulation Run Yet</h3>
          <p className="text-[11px] text-muted mt-1 max-w-sm mx-auto">
            Choose a challenge scenario above, select two topologies to match up, and click "Run Battle Simulation" to inspect execution traces.
          </p>
        </div>
      )}
    </div>
  );
}
