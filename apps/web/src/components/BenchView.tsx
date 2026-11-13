"use client";

import React, { useState, useEffect } from "react";
import { Scale, Play, Trophy, Clock, DollarSign, RefreshCw, CheckCircle2, ChevronRight, X } from "lucide-react";

interface BenchmarkSuite {
  id: string;
  name: string;
  tasks_count: number;
  description: string;
  difficulty: string;
  primary_metric: string;
  estimated_duration: string;
}

interface LeaderboardEntry {
  rank: number;
  contender: string;
  topology: string;
  framework: string;
  suite_id: string;
  success_rate: number;
  avg_latency_s: number;
  cost_per_task: number;
  avg_steps: number;
  failure_recovery_rate: number;
  last_run: string;
}

interface BenchViewProps {
  onDispatchBenchmark: (suiteName: string, contender: string, provider: "Kaggle" | "Colab") => void;
}

export function BenchView({ onDispatchBenchmark }: BenchViewProps) {
  const [suites, setSuites] = useState<BenchmarkSuite[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedSuiteId, setSelectedSuiteId] = useState<string>("gaia_mini");
  const [showRunModal, setShowRunModal] = useState(false);
  const [modalContender, setModalContender] = useState("LangGraph · Supervisor");
  const [modalProvider, setModalProvider] = useState<"Kaggle" | "Colab">("Kaggle");

  useEffect(() => {
    fetch("http://localhost:8000/api/bench/suites")
      .then((res) => res.json())
      .then((data) => {
        if (data.suites) setSuites(data.suites);
      })
      .catch((e) => console.error(e));

    fetch("http://localhost:8000/api/bench/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.entries) setLeaderboard(data.entries);
      })
      .catch((e) => console.error(e));
  }, []);

  const activeSuite = suites.find((s) => s.id === selectedSuiteId) || suites[0];
  const filteredEntries = leaderboard.filter(
    (e) => !selectedSuiteId || e.suite_id === selectedSuiteId
  );

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" />
            <span>Agent Benchmarking & Empirical Leaderboard</span>
          </h2>
          <p className="text-xs text-muted">
            Empirical evaluation of multi-agent topologies across GAIA, τ²-bench, and ToolBench with standardized latency, cost, and recovery metrics.
          </p>
        </div>
        <button
          onClick={() => setShowRunModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs transition shadow-sm"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Launch Benchmark Run</span>
        </button>
      </div>

      {/* Benchmark Suites Selector */}
      <div className="grid grid-cols-4 gap-4">
        {suites.map((s) => {
          const isSelected = selectedSuiteId === s.id;
          return (
            <div
              key={s.id}
              onClick={() => setSelectedSuiteId(s.id)}
              className={`p-4 rounded-xl border text-left cursor-pointer transition ${
                isSelected
                  ? "border-primary bg-secondary shadow-sm"
                  : "border-border bg-card hover:bg-hover hover:border-border-strong"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-semibold text-foreground">{s.tasks_count} Tasks</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-sidebar font-medium text-muted">
                  {s.difficulty}
                </span>
              </div>
              <h4 className="font-bold text-xs text-foreground truncate">{s.name}</h4>
              <p className="text-[11px] text-muted mt-1 line-clamp-2 leading-relaxed">{s.description}</p>
            </div>
          );
        })}
      </div>

      {/* Leaderboard Table */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Comparative Contender Leaderboard: {activeSuite?.name}</span>
            </h3>
            <p className="text-xs text-muted mt-0.5">Primary Metric: {activeSuite?.primary_metric}</p>
          </div>
          <span className="text-xs text-muted">Ranked by Success Rate (%)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-muted uppercase font-semibold text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Contender Architecture</th>
                <th className="py-2.5 px-3">Topology</th>
                <th className="py-2.5 px-3">Success Rate</th>
                <th className="py-2.5 px-3">Avg Latency</th>
                <th className="py-2.5 px-3">Cost / Task</th>
                <th className="py-2.5 px-3">Avg Steps</th>
                <th className="py-2.5 px-3">Failure Recovery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEntries.map((row) => (
                <tr key={row.rank} className="hover:bg-hover transition">
                  <td className="py-3 px-3 font-bold text-foreground">
                    {row.rank === 1 ? "🥇 #1" : row.rank === 2 ? "🥈 #2" : row.rank === 3 ? "🥉 #3" : `#${row.rank}`}
                  </td>
                  <td className="py-3 px-3 font-semibold text-foreground">
                    {row.contender}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-border bg-sidebar text-muted">
                      {row.topology}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-accent h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${row.success_rate}%` }} />
                      </div>
                      <span>{row.success_rate}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-muted">{row.avg_latency_s}s</td>
                  <td className="py-3 px-3 text-muted font-mono">${row.cost_per_task.toFixed(3)}</td>
                  <td className="py-3 px-3 text-muted">{row.avg_steps}</td>
                  <td className="py-3 px-3 font-medium text-emerald-600 dark:text-emerald-400">
                    {row.failure_recovery_rate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Run Benchmark Modal */}
      {showRunModal && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-sm text-foreground">Launch Empirical Benchmark</h3>
              <button onClick={() => setShowRunModal(false)} className="p-1 rounded text-muted hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted">Benchmark Suite</label>
              <div className="p-2.5 rounded-lg border border-border bg-sidebar text-xs text-foreground font-semibold mt-1">
                {activeSuite?.name} ({activeSuite?.tasks_count} Tasks)
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted">Contender Topology</label>
              <select
                value={modalContender}
                onChange={(e) => setModalContender(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-border bg-sidebar text-xs text-foreground"
              >
                <option>LangGraph · Supervisor + 3 Specialists</option>
                <option>Google ADK · Coordinator + Gemini 2.5</option>
                <option>LangGraph · ReAct + Reflexion Loop</option>
                <option>CrewAI · Hierarchical Process</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted">Execution Environment</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setModalProvider("Kaggle")}
                  className={`p-3 rounded-xl border text-left transition ${
                    modalProvider === "Kaggle" ? "border-primary bg-secondary font-semibold" : "border-border bg-sidebar text-muted"
                  }`}
                >
                  <div className="text-xs text-foreground">Kaggle GPU</div>
                  <div className="text-[10px] text-muted">Automated T4×2 (Free)</div>
                </button>
                <button
                  type="button"
                  onClick={() => setModalProvider("Colab")}
                  className={`p-3 rounded-xl border text-left transition ${
                    modalProvider === "Colab" ? "border-primary bg-secondary font-semibold" : "border-border bg-sidebar text-muted"
                  }`}
                >
                  <div className="text-xs text-foreground">Google Colab</div>
                  <div className="text-[10px] text-muted">1-Click T4 Handoff</div>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border mt-2">
              <button
                type="button"
                onClick={() => setShowRunModal(false)}
                className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDispatchBenchmark(activeSuite?.name || "GAIA", modalContender, modalProvider);
                  setShowRunModal(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs shadow-sm"
              >
                Dispatch Benchmark
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
