"use client";

import React, { useState, useEffect } from "react";
import { Network, Terminal, CheckCircle2, Play, Copy, Check, Users, ArrowRight, ShieldCheck, Cpu } from "lucide-react";

interface McpTool {
  name: string;
  description: string;
  inputSchema: any;
  category: string;
  latency_avg_ms: number;
}

interface A2aAgent {
  id: string;
  name: string;
  version: string;
  description: string;
  capabilities: string[];
  endpoint: string;
  auth_type: string;
  status: string;
  rate_limit: string;
}

export function ProtocolView() {
  const [tools, setTools] = useState<McpTool[]>([]);
  const [agents, setAgents] = useState<A2aAgent[]>([]);
  const [selectedTool, setSelectedTool] = useState<McpTool | null>(null);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [activeTab, setActiveTab] = useState<"mcp" | "a2a">("mcp");

  useEffect(() => {
    fetch("http://localhost:8000/api/protocols/tools")
      .then((res) => res.json())
      .then((data) => {
        if (data.tools) {
          setTools(data.tools);
          if (data.tools.length > 0) setSelectedTool(data.tools[0]);
        }
      })
      .catch((e) => console.error(e));

    fetch("http://localhost:8000/api/protocols/a2a/agents")
      .then((res) => res.json())
      .then((data) => {
        if (data.agents) setAgents(data.agents);
      })
      .catch((e) => console.error(e));
  }, []);

  const handleTestTool = async () => {
    if (!selectedTool) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("http://localhost:8000/api/protocols/tools/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool_name: selectedTool.name,
          arguments: { query: "MemOS-2 hierarchical memory" },
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Network className="w-5 h-5 text-primary" />
            Protocol & Interface Registry
          </h2>
          <p className="text-xs text-muted mt-1">
            Standardized Model Context Protocol (MCP 2025/2026) tools and Agent-to-Agent (A2A) capability discovery cards.
          </p>
        </div>

        {/* Protocol Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl border border-border bg-card">
          <button
            onClick={() => setActiveTab("mcp")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === "mcp"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            MCP Tools ({tools.length})
          </button>
          <button
            onClick={() => setActiveTab("a2a")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === "a2a"
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            A2A Agent Cards ({agents.length})
          </button>
        </div>
      </div>

      {/* Tab 1: MCP Tools Registry */}
      {activeTab === "mcp" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tools List */}
          <div className="lg:col-span-5 space-y-2.5">
            <div className="text-[11px] font-semibold text-muted uppercase tracking-wider px-1">
              Registered MCP Tools
            </div>

            {tools.map((t) => {
              const isSelected = selectedTool?.name === t.name;
              return (
                <div
                  key={t.name}
                  onClick={() => {
                    setSelectedTool(t);
                    setTestResult(null);
                  }}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition flex flex-col gap-1.5 ${
                    isSelected
                      ? "border-primary/50 bg-secondary/80 shadow-xs"
                      : "border-border bg-card hover:border-border/80 hover:bg-hover"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-foreground">{t.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/20 text-muted">
                      {t.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted line-clamp-2">{t.description}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px] text-muted">
                    <span>Avg Latency: {t.latency_avg_ms}ms</span>
                    <span className="text-emerald-500 font-medium">Streamable HTTP</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tool Inspector & Execution Sandbox */}
          <div className="lg:col-span-7 space-y-4">
            {selectedTool ? (
              <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
                <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <h3 className="font-bold text-sm text-foreground font-mono">{selectedTool.name}</h3>
                    <p className="text-xs text-muted mt-1">{selectedTool.description}</p>
                  </div>
                  <button
                    onClick={handleTestTool}
                    disabled={isTesting}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 shadow-sm transition disabled:opacity-50 shrink-0"
                  >
                    <Play className={`w-3.5 h-3.5 fill-current ${isTesting ? "animate-spin" : ""}`} />
                    {isTesting ? "Executing..." : "Test Tool Call"}
                  </button>
                </div>

                {/* JSON Schema */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-semibold text-xs text-foreground block">JSON Input Schema:</span>
                  <pre className="p-3.5 rounded-xl border border-border bg-background font-mono text-[11px] text-muted overflow-x-auto leading-relaxed">
                    {JSON.stringify(selectedTool.inputSchema, null, 2)}
                  </pre>
                </div>

                {/* Execution Result */}
                {testResult && (
                  <div className="space-y-1.5 text-xs animate-in fade-in">
                    <span className="font-semibold text-xs text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Execution Output (200 OK):
                    </span>
                    <pre className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 font-mono text-[11px] text-foreground overflow-x-auto leading-relaxed">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed border-border rounded-2xl text-muted text-xs">
                Select an MCP tool to inspect its schema.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: A2A Agent Cards Registry */}
      {activeTab === "a2a" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {agents.map((agent) => (
            <div key={agent.id} className="p-5 rounded-2xl border border-border bg-card space-y-3.5 text-xs">
              <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-foreground">{agent.name}</h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/20 text-muted">
                      v{agent.version}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted mt-1">{agent.description}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 shrink-0">
                  {agent.status}
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-foreground block">Declared Capabilities:</span>
                <div className="flex flex-wrap gap-1.5">
                  {agent.capabilities.map((cap) => (
                    <span key={cap} className="px-2 py-0.5 rounded-md border border-border bg-background font-mono text-[10px] text-muted">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-[11px]">
                <div>
                  <span className="text-muted block text-[10px]">Auth Type</span>
                  <span className="font-mono text-foreground">{agent.auth_type}</span>
                </div>
                <div>
                  <span className="text-muted block text-[10px]">Rate Limit</span>
                  <span className="font-mono text-foreground">{agent.rate_limit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
