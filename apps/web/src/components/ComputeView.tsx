"use client";

import React from "react";
import { Cpu, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";

export function ComputeView() {
  const providers = [
    { name: "Kaggle", offering: "30h / week (T4×2 / P100)", used: 12, total: 30, unit: "h", status: "Connected", automation: "Full API" },
    { name: "Modal", offering: "Serverless GPUs (T4–H100)", used: 8, total: 30, unit: "$", status: "Connected", automation: "Full API" },
    { name: "Lightning AI", offering: "Studio persistent hours", used: 4, total: 15, unit: "cr", status: "Connected", automation: "Full API" },
    { name: "Google Colab", offering: "Interactive free T4 GPU", used: 0, total: 0, unit: "", status: "Ready", automation: "Semi (Handoff)" },
    { name: "GitHub Actions", offering: "CPU runner workflows", used: 620, total: 2000, unit: "min", status: "Connected", automation: "Full API" },
  ];

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div className="pb-4 border-b border-border">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Cpu className="w-4 h-4 text-primary" />
          <span>Compute Providers & Weekly Quotas</span>
        </h2>
        <p className="text-xs text-muted">
          Manage zero-cost GPU and serverless execution environments with intelligent routing and automated quota tracking.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {providers.map((p) => {
          const pct = p.total > 0 ? Math.round((p.used / p.total) * 100) : 0;
          return (
            <div key={p.name} className="p-4 rounded-xl border border-border bg-card flex flex-col gap-3 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{p.name}</h3>
                  <p className="text-[11px] text-muted">{p.offering}</p>
                </div>
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{p.status}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-sidebar font-medium text-muted">
                  {p.automation}
                </span>
              </div>

              {p.total > 0 ? (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted text-[11px]">Usage this week</span>
                    <span className="font-medium text-foreground">
                      {p.used} / {p.total} {p.unit}
                    </span>
                  </div>
                  <div className="w-full bg-accent h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-muted italic">Manual session quota managed in Colab tab.</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Routing policy */}
      <div className="p-5 rounded-xl border border-border bg-card flex flex-col gap-3">
        <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">
          Intelligent GPU Dispatch Policy
        </h3>
        <p className="text-xs text-muted leading-relaxed">
          The Hub automatically balances workload to protect weekly quotas:
        </p>
        <div className="grid grid-cols-2 gap-4 text-xs text-muted">
          <div className="p-3 rounded-lg border border-border bg-sidebar">
            <div className="font-semibold text-foreground mb-1">Training & LoRA Runs (&gt;1 Hour)</div>
            <p>Priority 1: Kaggle GPU (12h session ceiling, 30h quota). Fallback: Lightning AI Studio.</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-sidebar">
            <div className="font-semibold text-foreground mb-1">Quick Benchmark & Eval Suites (&lt;15 Min)</div>
            <p>Priority 1: Modal serverless micro-batches. Priority 2: GitHub Actions CPU.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
