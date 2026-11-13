"use client";

import React, { useState, useEffect } from "react";
import { Network, Filter, ArrowRight, Play, BookOpen, Layers, CheckCircle2 } from "lucide-react";

interface NodeData {
  id: string;
  label: string;
  type: string;
  category: string;
  desc: string;
}

interface EdgeData {
  source: string;
  target: string;
  relation: string;
}

interface GraphData {
  nodes: NodeData[];
  edges: EdgeData[];
}

interface GraphViewProps {
  onRunBenchmark?: (name: string) => void;
}

export function GraphView({ onRunBenchmark }: GraphViewProps) {
  const [graph, setGraph] = useState<GraphData>({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [filterType, setFilterType] = useState<string>("All");

  useEffect(() => {
    fetch("http://localhost:8000/api/graph")
      .then((res) => res.json())
      .then((data) => {
        setGraph(data);
        if (data.nodes && data.nodes.length > 0) {
          setSelectedNode(data.nodes[0]);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const types = ["All", "Topology", "Framework", "Protocol", "Paper", "Benchmark"];

  const filteredNodes = graph.nodes.filter(
    (n) => filterType === "All" || n.type === filterType
  );

  const activeNodeId = selectedNode?.id;

  const connectedEdges = graph.edges.filter(
    (e) => e.source === activeNodeId || e.target === activeNodeId
  );

  const connectedNeighbors = connectedEdges.map((e) => {
    const isOutgoing = e.source === activeNodeId;
    const neighborId = isOutgoing ? e.target : e.source;
    const node = graph.nodes.find((n) => n.id === neighborId);
    return {
      node,
      relation: e.relation,
      direction: isOutgoing ? "outgoing" : "incoming",
    };
  }).filter((n) => n.node != null);

  const getNodeColor = (type: string) => {
    switch (type) {
      case "Topology":
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30";
      case "Framework":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "Protocol":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "Paper":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "Benchmark":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
      default:
        return "bg-secondary text-foreground border-border";
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Network className="w-4 h-4 text-primary" />
            <span>Agentic Systems Knowledge Graph</span>
          </h2>
          <p className="text-xs text-muted">
            Explore topological relationships linking academic papers, framework implementations, protocols (A2A/MCP), and evaluation benchmarks.
          </p>
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border bg-sidebar text-xs">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-1 rounded-md transition ${
                filterType === t
                  ? "bg-card text-foreground font-semibold shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Visual Graph Canvas / Card Layout (8 cols) */}
        <div className="col-span-8 flex flex-col gap-4">
          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm flex flex-col gap-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted flex items-center justify-between">
              <span>Interactive Topology Entities ({filteredNodes.length})</span>
              <span className="text-[10px] text-muted">Click any node to inspect relationship links</span>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-[560px] overflow-y-auto pr-1">
              {filteredNodes.map((n) => {
                const isSelected = selectedNode?.id === n.id;
                return (
                  <div
                    key={n.id}
                    onClick={() => setSelectedNode(n)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                      isSelected
                        ? "border-primary bg-secondary shadow-sm"
                        : "border-border bg-card hover:bg-hover hover:border-border-strong"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getNodeColor(n.type)}`}>
                        {n.type}
                      </span>
                      <span className="text-[10px] text-muted">{n.category}</span>
                    </div>
                    <h4 className="font-semibold text-xs text-foreground leading-snug">{n.label}</h4>
                    <p className="text-[11px] text-muted mt-1 line-clamp-2 leading-relaxed">{n.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Node Details & Connected Relationships (4 cols) */}
        <div className="col-span-4">
          {selectedNode ? (
            <div className="p-5 rounded-2xl border border-border bg-card shadow-sm flex flex-col gap-4 sticky top-20">
              <div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getNodeColor(selectedNode.type)}`}>
                  {selectedNode.type}
                </span>
                <h3 className="font-bold text-base text-foreground mt-2">{selectedNode.label}</h3>
                <p className="text-xs text-muted mt-1 leading-relaxed">{selectedNode.desc}</p>
              </div>

              <div className="pt-3 border-t border-border">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">
                  Connected Entities ({connectedNeighbors.length})
                </div>

                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {connectedNeighbors.length === 0 ? (
                    <div className="text-xs text-muted italic">No direct edges for this node.</div>
                  ) : (
                    connectedNeighbors.map((conn, idx) => (
                      <div
                        key={idx}
                        onClick={() => conn.node && setSelectedNode(conn.node)}
                        className="p-2.5 rounded-lg border border-border bg-sidebar hover:bg-hover cursor-pointer transition flex items-center justify-between text-xs"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{conn.node?.label}</span>
                          <span className="text-[10px] text-muted uppercase font-mono mt-0.5">
                            {conn.direction === "outgoing" ? "→" : "←"} {conn.relation.replace("_", " ")}
                          </span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getNodeColor(conn.node?.type || "")}`}>
                          {conn.node?.type}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-border flex flex-col gap-2">
                {selectedNode.type === "Topology" && onRunBenchmark && (
                  <button
                    onClick={() => onRunBenchmark(selectedNode.label)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary-hover transition shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Benchmark in Lab</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-border rounded-xl text-muted text-xs">
              Select a node to inspect its relational graph.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
