"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Bot, ShieldCheck, Terminal, Copy, Check, ArrowRight, Play, BookOpen, Clock, FileText } from "lucide-react";

interface SwarmBrief {
  id: string;
  topic: string;
  status: string;
  created_at: string;
  dialogue_trace?: Array<{
    agent: string;
    role: string;
    message: string;
  }>;
  scout_findings: string[];
  critic_evaluation: {
    score: number;
    strengths: string;
    caveats: string;
    recommendation: string;
  };
  architect_blueprint: {
    topology: string;
    framework: string;
    code_snippet: string;
    estimated_token_savings: string;
  };
  markdown_report: string;
}

export function StudioView() {
  const [briefs, setBriefs] = useState<SwarmBrief[]>([]);
  const [selectedBriefId, setSelectedBriefId] = useState<string>("");
  const [topicInput, setTopicInput] = useState("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<"brief" | "dialogue" | "code">("brief");

  const fetchBriefs = () => {
    fetch("http://localhost:8000/api/studio/briefs")
      .then((res) => res.json())
      .then((data) => {
        if (data.briefs) {
          setBriefs(data.briefs);
          if (!selectedBriefId && data.briefs.length > 0) {
            setSelectedBriefId(data.briefs[0].id);
          }
        }
      })
      .catch((e) => console.error(e));
  };

  useEffect(() => {
    fetchBriefs();
  }, []);

  const handleLaunchSynthesis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim() || isSynthesizing) return;

    setIsSynthesizing(true);
    try {
      const res = await fetch("http://localhost:8000/api/studio/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicInput.trim() }),
      });
      const data = await res.json();
      setBriefs((prev) => [data, ...prev]);
      setSelectedBriefId(data.id);
      setTopicInput("");
      setActiveTab("dialogue");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const activeBrief = briefs.find((b) => b.id === selectedBriefId) || briefs[0];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Autonomous Synthesis Studio
        </h2>
        <p className="text-xs text-muted mt-1">
          Coordinate a 3-agent research swarm (Literature Scout, Methodology Critic, System Architect) to synthesize publication-ready architectural briefs.
        </p>
      </div>

      {/* Swarm Roster Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border border-border bg-card flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-xs text-foreground">Literature Scout</div>
            <div className="text-[10px] text-muted">arXiv & GitHub Releases Ingestion</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-card flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-xs text-foreground">Methodology Critic</div>
            <div className="text-[10px] text-muted">Statistical Audit & COGS Analysis</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-card flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-xs text-foreground">System Architect</div>
            <div className="text-[10px] text-muted">LangGraph / MCP Blueprint Generator</div>
          </div>
        </div>
      </div>

      {/* Swarm Dispatch Bar */}
      <form onSubmit={handleLaunchSynthesis} className="p-4 rounded-2xl border border-border bg-card space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            required
            placeholder="Enter research topic or architectural question (e.g. 'Durable sub-graphs under rate limits')..."
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={isSynthesizing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-50 shrink-0"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isSynthesizing ? "animate-spin" : ""}`} />
            {isSynthesizing ? "Swarm Deliberating..." : "Launch Swarm"}
          </button>
        </div>

        {/* Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted">
          <span>Suggestions:</span>
          {[
            "Hierarchical Episodic Memory",
            "Context Dilution in Long Tool Chains",
            "Zero-Cost Cloud Deployment of Swarms",
          ].map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setTopicInput(s)}
              className="px-2 py-0.5 rounded-full border border-border bg-background hover:bg-hover text-foreground font-medium transition"
            >
              {s}
            </button>
          ))}
        </div>
      </form>

      {/* Main Grid: Briefs Sidebar & Active Synthesis View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Synthesis History Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-[11px] font-semibold text-muted uppercase tracking-wider px-1">
            Research Briefs ({briefs.length})
          </div>

          <div className="space-y-2">
            {briefs.map((b) => {
              const isSelected = b.id === activeBrief?.id;
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBriefId(b.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition flex flex-col gap-1.5 ${
                    isSelected
                      ? "border-primary/50 bg-secondary/80 shadow-xs"
                      : "border-border bg-card hover:border-border/80 hover:bg-hover"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-muted">
                    <span className="font-mono">{b.architect_blueprint?.framework || "LangGraph"}</span>
                    <span className="text-emerald-500 font-semibold">{b.critic_evaluation?.score}/10</span>
                  </div>
                  <h4 className="font-semibold text-xs text-foreground line-clamp-2 leading-snug">
                    {b.topic}
                  </h4>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Brief View */}
        <div className="lg:col-span-8 space-y-4">
          {activeBrief ? (
            <div className="p-5 rounded-2xl border border-border bg-card space-y-5">
              {/* Brief Title & Critic Score */}
              <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="font-bold text-base text-foreground leading-tight">
                    {activeBrief.topic}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted">
                    <span className="font-mono bg-muted/20 px-1.5 py-0.5 rounded">
                      {activeBrief.architect_blueprint?.topology}
                    </span>
                    <span>•</span>
                    <span>{activeBrief.architect_blueprint?.estimated_token_savings}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-semibold text-muted">Critic Score</div>
                    <div className="text-base font-bold text-emerald-500">
                      {activeBrief.critic_evaluation?.score} / 10
                    </div>
                  </div>
                </div>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                {[
                  { id: "brief", label: "Synthesis Brief" },
                  { id: "dialogue", label: "Swarm Deliberation" },
                  { id: "code", label: "Architecture Code" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                      activeTab === t.id
                        ? "bg-secondary text-primary font-semibold shadow-xs"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: Synthesis Brief */}
              {activeTab === "brief" && (
                <div className="space-y-4 text-xs">
                  {/* Scout Findings */}
                  <div className="space-y-2">
                    <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                      Scout Literature Ingestion
                    </span>
                    <ul className="space-y-1.5 text-[11px] text-muted bg-muted/15 p-3 rounded-xl border border-border/40 list-disc list-inside">
                      {activeBrief.scout_findings.map((f, i) => (
                        <li key={i} className="leading-relaxed">{f}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Critic Evaluation */}
                  <div className="space-y-2">
                    <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Methodology Critique
                    </span>
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] space-y-1">
                      <div><strong className="text-foreground">Strengths:</strong> {activeBrief.critic_evaluation?.strengths}</div>
                      <div><strong className="text-foreground">Caveats:</strong> {activeBrief.critic_evaluation?.caveats}</div>
                      <div className="text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                        Recommendation: {activeBrief.critic_evaluation?.recommendation}
                      </div>
                    </div>
                  </div>

                  {/* Markdown Report Preview */}
                  <div className="p-4 rounded-xl border border-border bg-background space-y-2 font-mono text-[11px] whitespace-pre-wrap leading-relaxed text-muted">
                    {activeBrief.markdown_report}
                  </div>
                </div>
              )}

              {/* Tab 2: Swarm Dialogue Trace */}
              {activeTab === "dialogue" && (
                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 text-xs">
                  {(activeBrief.dialogue_trace || [
                    { agent: "Literature Scout", role: "Scout", message: "Queried recent papers on this topic and extracted empirical controls." },
                    { agent: "Methodology Critic", role: "Critic", message: "Validated statistical variance across evaluation suites." },
                    { agent: "System Architect", role: "Architect", message: "Designed modular LangGraph topology with isolated state reducers." }
                  ]).map((step, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-border bg-background space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-primary">{step.agent}</span>
                        <span className="font-mono text-muted bg-muted/20 px-1.5 rounded">{step.role}</span>
                      </div>
                      <p className="text-[11px] text-foreground leading-relaxed font-sans">{step.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Architecture Code Blueprint */}
              {activeTab === "code" && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-muted">
                      {activeBrief.architect_blueprint?.framework} Blueprint
                    </span>
                    <button
                      onClick={() => handleCopyCode(activeBrief.architect_blueprint?.code_snippet)}
                      className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border border-border bg-background hover:bg-hover text-muted hover:text-foreground transition"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      {copiedCode ? "Copied!" : "Copy Code"}
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl border border-border bg-background font-mono text-[11px] overflow-x-auto text-foreground leading-relaxed">
                    {activeBrief.architect_blueprint?.code_snippet}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card p-8">
              <Bot className="w-8 h-8 text-muted mx-auto mb-2 opacity-60" />
              <h3 className="font-semibold text-xs text-foreground">No Research Brief Selected</h3>
              <p className="text-[11px] text-muted mt-1 max-w-sm mx-auto">
                Launch a new synthesis swarm above or select a pre-compiled brief from the left rail.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
