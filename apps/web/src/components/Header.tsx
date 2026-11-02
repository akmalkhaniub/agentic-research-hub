"use client";

import React, { useEffect, useState } from "react";
import { Search, Sun, Moon, Bell, PlayCircle } from "lucide-react";

interface HeaderProps {
  onSearchClick: () => void;
  activeRunsCount?: number;
}

export function Header({ onSearchClick, activeRunsCount = 2 }: HeaderProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const initial = saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <header className="h-14 border-b border-border bg-sidebar/50 backdrop-blur-sm flex items-center gap-3 px-5 sticky top-0 z-20">
      <div className="flex-1 max-w-md">
        <button
          onClick={onSearchClick}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-muted text-xs hover:border-border-strong transition bg-card text-left"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search papers, releases, or patterns…</span>
          <span className="ml-auto px-1.5 py-0.5 rounded border border-border text-[10px] font-mono">⌘K</span>
        </button>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border text-xs bg-card">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-foreground">{activeRunsCount} running</span>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg border border-border text-muted hover:text-foreground hover:bg-hover transition bg-card"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        <button className="p-2 rounded-lg border border-border text-muted hover:text-foreground hover:bg-hover transition bg-card relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
        </button>

        <div className="w-8 h-8 rounded-full bg-secondary text-selected-fg flex items-center justify-center font-semibold text-xs border border-border">
          RH
        </div>
      </div>
    </header>
  );
}
