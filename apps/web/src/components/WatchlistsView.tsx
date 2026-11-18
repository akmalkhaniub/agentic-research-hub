"use client";

import React, { useState, useEffect } from "react";
import { Bookmark, Plus, Bell, Radio, CheckCircle2, Trash2, Search, ArrowUpRight, X, Filter } from "lucide-react";

interface Watchlist {
  id: string;
  name: string;
  category: string;
  query: string;
  tags: string[];
  channel: string;
  active: boolean;
  hit_count: number;
  last_matched: string;
  matched_items?: Array<{
    id: string;
    title: string;
    source: string;
    summary: string;
    tags: string[];
  }>;
}

interface WatchlistsViewProps {
  onSelectItem?: (item: any) => void;
}

export function WatchlistsView({ onSelectItem }: WatchlistsViewProps) {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [selectedWlId, setSelectedWlId] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newQuery, setNewQuery] = useState("");
  const [newCategory, setNewCategory] = useState("Framework");
  const [newChannel, setNewChannel] = useState("In-app");

  const fetchWatchlists = () => {
    fetch("http://localhost:8000/api/watchlists")
      .then((res) => res.json())
      .then((data) => {
        if (data.watchlists) {
          setWatchlists(data.watchlists);
          if (!selectedWlId && data.watchlists.length > 0) {
            setSelectedWlId(data.watchlists[0].id);
          }
        }
      })
      .catch((e) => console.error(e));
  };

  useEffect(() => {
    fetchWatchlists();
  }, []);

  const handleScan = async (id: string) => {
    setIsScanning(true);
    try {
      await fetch(`http://localhost:8000/api/watchlists/${id}/scan`, { method: "POST" });
      fetchWatchlists();
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`http://localhost:8000/api/watchlists/${id}`, { method: "DELETE" });
      const remaining = watchlists.filter((w) => w.id !== id);
      setWatchlists(remaining);
      if (selectedWlId === id && remaining.length > 0) {
        setSelectedWlId(remaining[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newQuery.trim()) return;

    try {
      const res = await fetch("http://localhost:8000/api/watchlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          query: newQuery,
          category: newCategory,
          channel: newChannel,
          tags: [newCategory],
        }),
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewName("");
        setNewQuery("");
        fetchWatchlists();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeWl = watchlists.find((w) => w.id === selectedWlId) || watchlists[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-primary" />
            Smart Topic Watchlists
          </h2>
          <p className="text-xs text-muted mt-1">
            Automated entity alerts for key authors, framework releases, memory architectures, and evaluation suites.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            New Tracker
          </button>
        </div>
      </div>

      {/* Main Grid: Trackers List & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trackers Sidebar */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider px-1">
            Active Monitors ({watchlists.length})
          </div>

          <div className="space-y-2">
            {watchlists.map((wl) => {
              const isSelected = wl.id === activeWl?.id;
              return (
                <div
                  key={wl.id}
                  onClick={() => setSelectedWlId(wl.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition flex flex-col gap-2 ${
                    isSelected
                      ? "border-primary/50 bg-secondary/80 shadow-sm"
                      : "border-border bg-card hover:border-border/80 hover:bg-hover"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-semibold text-xs text-foreground">{wl.name}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/20 text-muted">
                      {wl.category}
                    </span>
                  </div>

                  <p className="text-[11px] font-mono text-muted line-clamp-1">{wl.query}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px] text-muted">
                    <span className="flex items-center gap-1">
                      <Bell className="w-3 h-3 text-muted" />
                      {wl.hit_count} matches
                    </span>
                    <span className="text-[10px]">Active</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tracker Detail & Matched Stream */}
        <div className="lg:col-span-7 space-y-4">
          {activeWl ? (
            <div className="p-5 rounded-2xl border border-border bg-card space-y-5">
              <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-foreground">{activeWl.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {activeWl.channel} Alert
                    </span>
                  </div>
                  <div className="text-xs font-mono text-muted mt-1 bg-muted/15 p-2 rounded-lg border border-border/40">
                    Query: {activeWl.query}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleScan(activeWl.id)}
                    disabled={isScanning}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-border bg-background hover:bg-hover text-foreground transition"
                  >
                    <Radio className={`w-3 h-3 text-primary ${isScanning ? "animate-spin" : ""}`} />
                    Scan Now
                  </button>
                  <button
                    onClick={(e) => handleDelete(activeWl.id, e)}
                    className="p-1.5 rounded-lg border border-border hover:bg-destructive/10 text-muted hover:text-destructive transition"
                    title="Delete Tracker"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Matched Feed Items */}
              <div className="space-y-3">
                <div className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                  Recently Captured Matches ({activeWl.matched_items?.length || 0})
                </div>

                {activeWl.matched_items && activeWl.matched_items.length > 0 ? (
                  <div className="space-y-2.5">
                    {activeWl.matched_items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => onSelectItem && onSelectItem(item)}
                        className="p-3.5 rounded-xl border border-border/80 bg-background hover:border-primary/40 transition cursor-pointer flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-semibold text-primary uppercase">
                            {item.source}
                          </span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-muted group-hover:text-primary" />
                        </div>
                        <h4 className="font-semibold text-xs text-foreground line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-muted line-clamp-2 leading-relaxed">
                          {item.summary}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-muted/20 text-muted font-mono"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-border rounded-xl text-muted text-xs">
                    No matching items in recent ingest buffer. Click "Scan Now" to query live arXiv and GitHub APIs.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-border rounded-2xl text-muted text-xs">
              Select or create a watchlist to monitor incoming literature.
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground">Create New Smart Tracker</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-muted hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-muted font-medium mb-1">Tracker Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MCP & Tool Protocols"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-muted font-medium mb-1">Boolean Query / Keywords</label>
                <input
                  type="text"
                  required
                  placeholder='e.g. "Model Context Protocol" OR MCP OR A2A'
                  value={newQuery}
                  onChange={(e) => setNewQuery(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-medium mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs"
                  >
                    <option value="Framework">Framework</option>
                    <option value="Topic">Topic</option>
                    <option value="Author">Author</option>
                    <option value="Protocol">Protocol</option>
                    <option value="Benchmark">Benchmark</option>
                  </select>
                </div>
                <div>
                  <label className="block text-muted font-medium mb-1">Notification Channel</label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs"
                  >
                    <option value="In-app">In-app</option>
                    <option value="Webhook">Webhook</option>
                    <option value="Email">Email Digest</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-hover font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 shadow-sm"
                >
                  Create Tracker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
