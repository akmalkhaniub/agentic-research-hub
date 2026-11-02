"use client";

import React from "react";
import { CheckSquare, Check, X, ShieldAlert, Cpu } from "lucide-react";

export interface ApprovalItemData {
  id: string;
  title: string;
  description: string;
  category: string;
  resource_cost: string;
  requested_by: string;
  created_at: string;
}

interface ApprovalsViewProps {
  approvals: ApprovalItemData[];
  onAction: (id: string, action: "approve" | "reject") => void;
}

export function ApprovalsView({ approvals, onAction }: ApprovalsViewProps) {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div className="pb-4 border-b border-border">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-primary" />
          <span>Human-in-the-Loop Approvals Inbox</span>
        </h2>
        <p className="text-xs text-muted">
          All autonomous requests that consume GPU quotas, trigger cloud deployments, or execute code wait here for explicit review.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {approvals.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border rounded-xl text-muted text-xs">
            No pending approval requests. Your autonomous agents are operating within baseline bounds.
          </div>
        ) : (
          approvals.map((item) => (
            <div key={item.id} className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-muted mb-1">
                    <span className="font-semibold text-foreground">{item.category}</span>
                    <span>·</span>
                    <span>Requested by {item.requested_by}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-sidebar text-[11px] font-mono text-primary font-semibold">
                  <Cpu className="w-3 h-3" />
                  <span>{item.resource_cost}</span>
                </div>
              </div>

              <p className="text-xs text-muted leading-relaxed">{item.description}</p>

              <div className="flex items-center gap-2 mt-2 pt-3 border-t border-border">
                <button
                  onClick={() => onAction(item.id, "approve")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve & Dispatch</span>
                </button>
                <button
                  onClick={() => onAction(item.id, "reject")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-hover text-rose-600 font-semibold text-xs transition"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
