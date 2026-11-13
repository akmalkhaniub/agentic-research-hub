"use client";

import React, { useState, useEffect } from "react";
import { Library, Folder, Download, Bookmark, FileText, Check, Copy, ExternalLink, Sparkles, X } from "lucide-react";
import { FeedItemData } from "./RadarFeed";

interface CollectionData {
  id: string;
  name: string;
  description: string;
  count: number;
}

interface LibraryViewProps {
  items: FeedItemData[];
  onOpenItem: (item: FeedItemData) => void;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
}

export function LibraryView({ items, onOpenItem, onToggleSave }: LibraryViewProps) {
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>("core_architecture");
  const [searchQuery, setSearchQuery] = useState("");
  const [exportModalItem, setExportModalItem] = useState<FeedItemData | null>(null);
  const [exportFormat, setExportFormat] = useState<"markdown" | "obsidian" | "bibtex">("obsidian");
  const [exportedContent, setExportedContent] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/api/library/collections")
      .then((res) => res.json())
      .then((data) => {
        if (data.collections) setCollections(data.collections);
      })
      .catch((e) => console.error(e));
  }, []);

  const handleOpenExport = async (item: FeedItemData) => {
    setExportModalItem(item);
    try {
      const resp = await fetch("http://localhost:8000/api/library/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: item.id, format: exportFormat }),
      });
      const data = await resp.json();
      setExportedContent(data.content);
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeFormat = async (fmt: "markdown" | "obsidian" | "bibtex") => {
    setExportFormat(fmt);
    if (!exportModalItem) return;
    try {
      const resp = await fetch("http://localhost:8000/api/library/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: exportModalItem.id, format: fmt }),
      });
      const data = await resp.json();
      setExportedContent(data.content);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyExport = () => {
    navigator.clipboard.writeText(exportedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredItems = items.filter((it) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return it.title.toLowerCase().includes(q) || it.summary.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Library className="w-4 h-4 text-primary" />
            <span>Personal Research Library & Knowledge Base</span>
          </h2>
          <p className="text-xs text-muted">
            Curated papers, architecture notes, and syntheses with one-click export to Markdown, Obsidian Vault, and BibTeX.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Collections Rail (3 cols) */}
        <div className="col-span-3 flex flex-col gap-2 select-none">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted px-1 mb-1">
            Collections
          </div>
          {collections.map((col) => {
            const isSelected = selectedCollection === col.id;
            return (
              <div
                key={col.id}
                onClick={() => setSelectedCollection(col.id)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition flex items-center justify-between ${
                  isSelected
                    ? "border-primary bg-secondary shadow-sm font-semibold text-selected-fg"
                    : "border-border bg-card hover:bg-hover text-muted hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Folder className="w-3.5 h-3.5 shrink-0 text-primary" />
                  <span className="text-xs truncate">{col.name}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-border bg-sidebar font-mono">
                  {col.count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Saved Items Main Area (9 cols) */}
        <div className="col-span-9 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search library by paper title, authors, or concepts…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground text-xs focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onOpenItem(item)}
                className="card-hover p-4 rounded-xl border border-border bg-card cursor-pointer group flex flex-col gap-2"
              >
                <div className="flex items-center justify-between text-[11px] text-muted">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{item.source_type}</span>
                    <span>·</span>
                    <span>{item.source}</span>
                    {item.author && (
                      <>
                        <span>·</span>
                        <span>{item.author}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleOpenExport(item)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md border border-border bg-sidebar hover:bg-hover text-muted hover:text-foreground text-[10px] font-medium transition"
                      title="Export to Obsidian or BibTeX"
                    >
                      <Download className="w-3 h-3" />
                      <span>Export</span>
                    </button>
                    <button
                      onClick={(e) => onToggleSave(item.id, e)}
                      className={`p-1 rounded-md border text-xs transition ${
                        item.is_saved
                          ? "border-primary bg-secondary text-selected-fg"
                          : "border-border text-muted hover:text-foreground hover:bg-hover"
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-muted leading-relaxed line-clamp-2">{item.summary}</p>

                <div className="flex items-center gap-1.5 mt-1">
                  {item.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-border bg-sidebar text-muted">
                      {t}
                    </span>
                  ))}
                  <span className="ml-auto text-xs text-primary font-medium group-hover:underline">
                    Read & Chat →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {exportModalItem && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">Export Literature Note</h3>
              </div>
              <button onClick={() => setExportModalItem(null)} className="p-1 rounded text-muted hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border bg-sidebar text-xs">
                <button
                  onClick={() => handleChangeFormat("obsidian")}
                  className={`px-3 py-1 rounded-md transition font-medium ${
                    exportFormat === "obsidian"
                      ? "bg-card text-foreground font-semibold shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  Obsidian Note ([[wikilinks]])
                </button>
                <button
                  onClick={() => handleChangeFormat("markdown")}
                  className={`px-3 py-1 rounded-md transition font-medium ${
                    exportFormat === "markdown"
                      ? "bg-card text-foreground font-semibold shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  Standard Markdown
                </button>
                <button
                  onClick={() => handleChangeFormat("bibtex")}
                  className={`px-3 py-1 rounded-md transition font-medium ${
                    exportFormat === "bibtex"
                      ? "bg-card text-foreground font-semibold shadow-sm"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  BibTeX
                </button>
              </div>

              <button
                onClick={handleCopyExport}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs transition shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Content"}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-sidebar border border-border max-h-72 overflow-y-auto">
              <pre className="font-mono text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {exportedContent || "Generating export format..."}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
