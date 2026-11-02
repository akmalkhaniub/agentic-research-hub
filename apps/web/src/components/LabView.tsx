"use client";

import React, { useState } from "react";
import { Play, ExternalLink, RefreshCw, Terminal, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

export interface ExperimentRunData {
  id: string;
  name: string;
  template: string;
  provider: string;
  gpu: string;
  status: string;
  duration_str: string;
  key_metric?: string;
  metrics: Record<string, any>;
  started_at?: string;
}

interface LabViewProps {
  runs: ExperimentRunData[];
  onLaunchNew: () => void;
  onRefresh: () => void;
}

export function LabView({ runs, onLaunchNew, onRefresh }: LabViewProps) {
  const [selectedRun, setSelectedRun] = useState<ExperimentRunData | null>(runs[0] || null);

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h2 className="text-lg font-bold text-foreground">Lab & GPU Experiments</h2>
          <p className="text-xs text-muted">
            Launch agent training, benchmark topologies, and evaluations across Kaggle (automated) and Google Colab (handoff).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg border border-border bg-card hover:bg-hover text-muted hover:text-foreground text-xs transition"
            title="Refresh run statuses"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onLaunchNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary-hover transition shadow-sm"
          >
            <Play className="w-3.5 h-3.5" />
            <span>New Experiment</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Runs list */}
        <div className="col-span-1 flex flex-col gap-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted px-1">
            Experiments ({runs.length})
          </div>
          {runs.map((r) => {
            const isSelected = selectedRun?.id === r.id;
            return (
              <div
                key={r.id}
                onClick={() => setSelectedRun(r)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                  isSelected
                    ? "border-primary bg-secondary/60 shadow-sm"
                    : "border-border bg-card hover:bg-hover"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-foreground truncate max-w-[180px]">{r.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      r.status === "Running"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : r.status === "Awaiting_Handoff"
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-slate-500/10 text-slate-600"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                <div className="text-[11px] text-muted flex items-center gap-2">
                  <span>{r.provider} ({r.gpu})</span>
                  <span>·</span>
                  <span>{r.duration_str}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected run details view */}
        <div className="col-span-2">
          {selectedRun ? (
            <div className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">{selectedRun.name}</h3>
                  <p className="text-xs text-muted mt-0.5">Template: {selectedRun.template}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full border border-border bg-sidebar font-medium text-foreground">
                    {selectedRun.provider} · {selectedRun.gpu}
                  </span>
                </div>
              </div>

              {/* Colab Handoff Helper */}
              {selectedRun.provider.toLowerCase() === "colab" && (
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Colab Semi-Automated Handoff</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    Google Colab requires manual initiation. Follow these 3 steps to run this experiment on a free T4 GPU:
                  </p>
                  <ol className="flex flex-col gap-2 text-xs text-muted pl-4 list-decimal">
                    <li>Click <strong className="text-foreground">Open in Colab</strong> to load the parameterized notebook.</li>
                    <li>Select <strong className="text-foreground">Runtime → Change runtime type → T4 GPU</strong>.</li>
                    <li>Click <strong className="text-foreground">Runtime → Run all</strong>. The notebook automatically streams metrics back to this Hub.</li>
                  </ol>
                  <div>
                    <a
                      href="https://colab.research.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in Colab ↗</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Metrics preview */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border border-border bg-sidebar">
                  <div className="text-[11px] text-muted">Execution Status</div>
                  <div className="text-sm font-semibold text-foreground mt-0.5">{selectedRun.status}</div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-sidebar">
                  <div className="text-[11px] text-muted">Key Metric</div>
                  <div className="text-sm font-semibold text-foreground mt-0.5">
                    {selectedRun.key_metric || "Evaluating..."}
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-sidebar">
                  <div className="text-[11px] text-muted">Runtime Duration</div>
                  <div className="text-sm font-semibold text-foreground mt-0.5">{selectedRun.duration_str}</div>
                </div>
              </div>

              {/* Streamed Logs preview */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Execution Stream & Telemetry</span>
                </div>
                <div className="p-3 rounded-xl bg-sidebar border border-border font-mono text-[11px] text-muted max-h-48 overflow-y-auto leading-relaxed">
                  <div>[00:00:01] Container worker initialized.</div>
                  <div>[00:00:04] Fetching dataset & dependencies via uv/pip...</div>
                  <div>[00:01:10] Loaded model weights onto GPU memory.</div>
                  <div>[00:02:15] hub_reporter webhook active. Streaming loss checkpoints...</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center border border-dashed border-border rounded-xl text-muted text-xs">
              Select an experiment to inspect live telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
