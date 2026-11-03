"use client";

import React, { useState } from "react";
import { Play, ExternalLink, RefreshCw, Terminal, CheckCircle2, Clock, AlertTriangle, Zap, Plus, X } from "lucide-react";

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
  parameters?: Record<string, any>;
  logs?: string;
  started_at?: string;
}

interface LabViewProps {
  runs: ExperimentRunData[];
  onLaunchNew: (provider: "Kaggle" | "Colab", template: string, name: string) => void;
  onRefresh: () => void;
}

export function LabView({ runs, onLaunchNew, onRefresh }: LabViewProps) {
  const [selectedRun, setSelectedRun] = useState<ExperimentRunData | null>(runs[0] || null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [modalProvider, setModalProvider] = useState<"Kaggle" | "Colab">("Kaggle");
  const [modalTemplate, setModalTemplate] = useState("Fine-tune small LLM for tool calling");
  const [modalName, setModalName] = useState("Agent Fine-Tune (Unsloth Qwen-4B)");
  const [isSimulatingStream, setIsSimulatingStream] = useState(false);

  const handleSimulateTelemetry = async () => {
    if (!selectedRun) return;
    setIsSimulatingStream(true);

    const steps = [
      { step: 1, loss: 1.18, eval_acc: 0.62, gpu_vram_gb: 8.4 },
      { step: 2, loss: 0.94, eval_acc: 0.71, gpu_vram_gb: 9.6 },
      { step: 3, loss: 0.81, eval_acc: 0.79, gpu_vram_gb: 11.2 },
      { step: 4, loss: 0.73, eval_acc: 0.84, gpu_vram_gb: 11.2 },
    ];

    for (const s of steps) {
      try {
        await fetch(`http://localhost:8000/api/experiments/${selectedRun.id}/telemetry`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            step: s.step,
            timestamp: Date.now() / 1000,
            metrics: s,
          }),
        });
        onRefresh();
        await new Promise((r) => setTimeout(r, 800));
      } catch (e) {
        console.error(e);
      }
    }
    setIsSimulatingStream(false);
  };

  const colabUrl = selectedRun?.parameters?.colab_url;

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h2 className="text-lg font-bold text-foreground">Lab & GPU Experiments</h2>
          <p className="text-xs text-muted">
            Launch agent fine-tuning and benchmark runs across Kaggle API (30h/wk automated) and Google Colab (1-click handoff).
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
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary-hover transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
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
                  <button
                    onClick={handleSimulateTelemetry}
                    disabled={isSimulatingStream}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-hover text-xs font-medium text-foreground transition disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    <span>{isSimulatingStream ? "Streaming..." : "Stream Telemetry"}</span>
                  </button>
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
                    <span>Google Colab Parameterized Handoff</span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    Notebook synthesized with pre-injected hyperparameters and active <code className="text-foreground">HubReporter</code> telemetry.
                  </p>
                  <div>
                    <a
                      href={colabUrl || "https://colab.research.google.com"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Synthesized Notebook in Colab ↗</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Metrics preview */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 rounded-lg border border-border bg-sidebar">
                  <div className="text-[11px] text-muted">Status</div>
                  <div className="text-sm font-semibold text-foreground mt-0.5">{selectedRun.status}</div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-sidebar">
                  <div className="text-[11px] text-muted">Loss Checkpoint</div>
                  <div className="text-sm font-semibold text-foreground mt-0.5">
                    {selectedRun.metrics?.loss || "1.42"}
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-sidebar">
                  <div className="text-[11px] text-muted">Eval Accuracy</div>
                  <div className="text-sm font-semibold text-foreground mt-0.5">
                    {selectedRun.metrics?.eval_acc ? `${Math.round(selectedRun.metrics.eval_acc * 100)}%` : "50%"}
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-sidebar">
                  <div className="text-[11px] text-muted">GPU VRAM</div>
                  <div className="text-sm font-semibold text-foreground mt-0.5">
                    {selectedRun.metrics?.gpu_vram_gb ? `${selectedRun.metrics.gpu_vram_gb} GB` : "4.2 GB"}
                  </div>
                </div>
              </div>

              {/* Streamed Logs preview */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Execution Stream & Telemetry</span>
                </div>
                <div className="p-3 rounded-xl bg-sidebar border border-border font-mono text-[11px] text-muted max-h-48 overflow-y-auto leading-relaxed">
                  <pre className="whitespace-pre-wrap">{selectedRun.logs || "[00:00:01] Container worker initialized.\n[00:00:04] Fetching dataset & dependencies via uv/pip...\n[00:01:10] Loaded model weights onto GPU memory.\n[00:02:15] hub_reporter webhook active. Streaming loss checkpoints..."}</pre>
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

      {/* New Experiment Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-sm text-foreground">Launch GPU Experiment</h3>
              <button onClick={() => setShowNewModal(false)} className="p-1 rounded text-muted hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted">Experiment Name</label>
              <input
                type="text"
                value={modalName}
                onChange={(e) => setModalName(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-border bg-sidebar text-xs text-foreground"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted">Template</label>
              <select
                value={modalTemplate}
                onChange={(e) => setModalTemplate(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-lg border border-border bg-sidebar text-xs text-foreground"
              >
                <option>Fine-tune small LLM for tool calling</option>
                <option>Agent Architecture Benchmark</option>
                <option>Compare embedding models for RAG memory</option>
                <option>Paper Reproduction</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted">Compute Provider</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setModalProvider("Kaggle")}
                  className={`p-3 rounded-xl border text-left transition ${
                    modalProvider === "Kaggle" ? "border-primary bg-secondary/60 font-semibold" : "border-border bg-sidebar text-muted"
                  }`}
                >
                  <div className="text-xs text-foreground">Kaggle API</div>
                  <div className="text-[10px] text-muted">Fully Automated (30h/wk)</div>
                </button>
                <button
                  type="button"
                  onClick={() => setModalProvider("Colab")}
                  className={`p-3 rounded-xl border text-left transition ${
                    modalProvider === "Colab" ? "border-primary bg-secondary/60 font-semibold" : "border-border bg-sidebar text-muted"
                  }`}
                >
                  <div className="text-xs text-foreground">Google Colab</div>
                  <div className="text-[10px] text-muted">1-Click Handoff (T4 GPU)</div>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border mt-2">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onLaunchNew(modalProvider, modalTemplate, modalName);
                  setShowNewModal(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs shadow-sm"
              >
                Launch on {modalProvider}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
