"use client";

import React from "react";
import {
  Home,
  Radio,
  Bookmark,
  Library,
  GitBranch,
  Network,
  FlaskConical,
  Cpu,
  Scale,
  Rocket,
  Sparkles,
  CheckSquare,
  Settings,
} from "lucide-react";

export type TabId =
  | "today"
  | "radar"
  | "watchlists"
  | "library"
  | "patterns"
  | "graph"
  | "lab"
  | "compute"
  | "bench"
  | "launchpad"
  | "copilot"
  | "approvals"
  | "settings";

interface SidebarProps {
  currentTab: TabId;
  onSelectTab: (tab: TabId) => void;
  approvalsCount?: number;
}

export function Sidebar({ currentTab, onSelectTab, approvalsCount = 2 }: SidebarProps) {
  const groups = [
    {
      title: "",
      items: [{ id: "today" as TabId, label: "Today", icon: Home }],
    },
    {
      title: "Discover",
      items: [
        { id: "radar" as TabId, label: "Radar Feed", icon: Radio },
        { id: "watchlists" as TabId, label: "Watchlists", icon: Bookmark },
      ],
    },
    {
      title: "Knowledge",
      items: [
        { id: "library" as TabId, label: "Library", icon: Library },
        { id: "patterns" as TabId, label: "Architecture Patterns", icon: GitBranch },
        { id: "graph" as TabId, label: "Knowledge Graph", icon: Network },
      ],
    },
    {
      title: "Build & Test",
      items: [
        { id: "lab" as TabId, label: "Lab (GPU)", icon: FlaskConical },
        { id: "compute" as TabId, label: "Compute & Quotas", icon: Cpu },
        { id: "bench" as TabId, label: "Bench & Evals", icon: Scale },
        { id: "launchpad" as TabId, label: "Cloud Launchpad", icon: Rocket },
      ],
    },
    {
      title: "Assist",
      items: [
        { id: "copilot" as TabId, label: "Research Copilot", icon: Sparkles },
        { id: "approvals" as TabId, label: "Approvals", icon: CheckSquare, badge: approvalsCount },
      ],
    },
  ];

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-sidebar p-3 flex flex-col gap-4 select-none min-h-screen">
      <div className="flex items-center gap-2.5 px-2 py-1.5">
        <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs tracking-wider shadow-sm">
          RH
        </div>
        <div>
          <div className="font-semibold text-sm leading-tight text-foreground">Research Hub</div>
          <div className="text-[11px] text-muted">Agentic Systems</div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-4 text-sm mt-1">
        {groups.map((grp, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            {grp.title && (
              <div className="text-[11px] uppercase tracking-wider font-semibold text-muted px-2 mb-0.5">
                {grp.title}
              </div>
            )}
            {grp.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition text-left ${
                    isActive
                      ? "bg-secondary text-selected-fg font-semibold shadow-sm"
                      : "text-muted hover:bg-hover hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary text-primary-foreground">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="pt-2 border-t border-border">
        <button
          onClick={() => onSelectTab("settings")}
          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition text-left ${
            currentTab === "settings"
              ? "bg-secondary text-selected-fg font-semibold"
              : "text-muted hover:bg-hover hover:text-foreground"
          }`}
        >
          <Settings className="w-4 h-4 text-muted" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
