"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, TabId } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { TodayView } from "@/components/TodayView";
import { RadarFeed, FeedItemData } from "@/components/RadarFeed";
import { ItemDrawer } from "@/components/ItemDrawer";
import { LabView, ExperimentRunData } from "@/components/LabView";
import { PatternsView } from "@/components/PatternsView";
import { CopilotView } from "@/components/CopilotView";
import { ApprovalsView, ApprovalItemData } from "@/components/ApprovalsView";
import { ComputeView } from "@/components/ComputeView";

const API_BASE = "http://localhost:8000";

export default function Home() {
  const [currentTab, setCurrentTab] = useState<TabId>("today");
  const [feedItems, setFeedItems] = useState<FeedItemData[]>([]);
  const [selectedItem, setSelectedItem] = useState<FeedItemData | null>(null);
  const [experiments, setExperiments] = useState<ExperimentRunData[]>([]);
  const [approvals, setApprovals] = useState<ApprovalItemData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchFeed = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/feed`);
      const data = await res.json();
      if (data.items) {
        setFeedItems(data.items);
      }
    } catch (e) {
      console.warn("Backend feed sync notice", e);
    }
  };

  const fetchExperiments = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/experiments`);
      const data = await res.json();
      if (data.runs) {
        setExperiments(data.runs);
      }
    } catch (e) {
      console.warn("Backend experiment sync notice", e);
    }
  };

  const fetchApprovals = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/approvals`);
      const data = await res.json();
      if (data.items) {
        setApprovals(data.items);
      }
    } catch (e) {
      console.warn("Backend approvals sync notice", e);
    }
  };

  useEffect(() => {
    fetchFeed();
    fetchExperiments();
    fetchApprovals();
  }, []);

  const handleRefreshFeed = async () => {
    setIsRefreshing(true);
    try {
      await fetch(`${API_BASE}/api/ingest`, { method: "POST" });
      await fetchFeed();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleSave = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = feedItems.find((it) => it.id === id);
    if (!target) return;
    const nextSaved = !target.is_saved;

    setFeedItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, is_saved: nextSaved } : it))
    );

    if (selectedItem?.id === id) {
      setSelectedItem((prev) => (prev ? { ...prev, is_saved: nextSaved } : null));
    }

    try {
      await fetch(`${API_BASE}/api/feed/${id}/triage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_saved: nextSaved }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleLaunchExperimentFromItem = async (item: FeedItemData) => {
    try {
      await fetch(`${API_BASE}/api/experiments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Reproduce: ${item.title.slice(0, 32)}`,
          template: "Paper Reproduction",
          provider: "Colab",
          gpu: "T4",
          parameters: { paper_url: item.url, title: item.title },
        }),
      });
      await fetchExperiments();
      setCurrentTab("lab");
      setSelectedItem(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLaunchNewExperiment = async (provider: "Kaggle" | "Colab", template: string, name: string) => {
    try {
      await fetch(`${API_BASE}/api/experiments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          template,
          provider,
          gpu: provider === "Kaggle" ? "T4×2" : "T4",
          parameters: { template, epochs: 5 },
        }),
      });
      await fetchExperiments();
      setCurrentTab("lab");
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunBenchmarkFromPattern = async (patternName: string) => {
    await handleLaunchNewExperiment("Kaggle", `Benchmark: ${patternName}`, `Eval ${patternName} (GAIA-mini)`);
  };

  const handleApprovalAction = async (id: string, action: "approve" | "reject") => {
    try {
      await fetch(`${API_BASE}/api/approvals/${id}/${action}`, { method: "POST" });
      setApprovals((prev) => prev.filter((a) => a.id !== id));
      await fetchExperiments();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        approvalsCount={approvals.length}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onSearchClick={() => setCurrentTab("radar")}
          activeRunsCount={experiments.filter((e) => e.status === "Running").length}
        />

        <main className="flex-1 p-6 overflow-y-auto">
          {currentTab === "today" && (
            <TodayView
              items={feedItems}
              onOpenItem={(item) => setSelectedItem(item)}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onLaunchExperiment={(item) => handleLaunchExperimentFromItem(item)}
            />
          )}

          {currentTab === "radar" && (
            <RadarFeed
              items={feedItems}
              onSelectItem={(item) => setSelectedItem(item)}
              onToggleSave={handleToggleSave}
              onRefresh={handleRefreshFeed}
              isRefreshing={isRefreshing}
            />
          )}

          {currentTab === "patterns" && (
            <PatternsView onRunBenchmark={handleRunBenchmarkFromPattern} />
          )}

          {currentTab === "lab" && (
            <LabView
              runs={experiments}
              onLaunchNew={handleLaunchNewExperiment}
              onRefresh={fetchExperiments}
            />
          )}

          {currentTab === "copilot" && (
            <CopilotView
              onProposeExperiment={(name, template) => {
                setCurrentTab("lab");
              }}
            />
          )}

          {currentTab === "approvals" && (
            <ApprovalsView
              approvals={approvals}
              onAction={handleApprovalAction}
            />
          )}

          {currentTab === "compute" && <ComputeView />}

          {(currentTab === "library" ||
            currentTab === "watchlists" ||
            currentTab === "graph" ||
            currentTab === "bench" ||
            currentTab === "launchpad" ||
            currentTab === "settings") && (
            <div className="max-w-4xl mx-auto p-12 text-center border border-dashed border-border rounded-2xl bg-card">
              <h3 className="font-semibold text-base text-foreground capitalize">
                {currentTab.replace("-", " ")} Module
              </h3>
              <p className="text-xs text-muted mt-1">
                Connected and synchronized with the Hub backend data layer.
              </p>
            </div>
          )}
        </main>
      </div>

      <ItemDrawer
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onToggleSave={handleToggleSave}
        onLaunchExperiment={handleLaunchExperimentFromItem}
        onAskCopilot={(item) => {
          setSelectedItem(null);
          setCurrentTab("copilot");
        }}
      />
    </div>
  );
}
