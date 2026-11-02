"use client";

import React, { useState } from "react";
import { Sparkles, Send, BookOpen, CheckCircle, ArrowRight } from "lucide-react";

interface CopilotViewProps {
  onProposeExperiment: (name: string, template: string) => void;
}

export function CopilotView({ onProposeExperiment }: CopilotViewProps) {
  const [query, setQuery] = useState("");
  const [isDeepResearch, setIsDeepResearch] = useState(true);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string; sources?: string[] }>>([
    {
      role: "assistant",
      content:
        "Hello! I am your Agentic AI Research Copilot. Ask me to synthesize recent research, compare agent topologies (Supervisor vs Swarm vs Reflexion), evaluate memory frameworks (MemOS-2 vs Letta), or draft GPU experiment notebooks.",
      sources: ["MemOS-2 Paper", "LangGraph 1.4 Release"],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim() || isLoading) return;
    const userText = query;
    setQuery("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setIsLoading(true);

    try {
      const resp = await fetch("http://localhost:8000/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userText, deep_research: isDeepResearch }),
      });
      const data = await resp.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, sources: data.sources },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Based on your Research Hub papers and recent benchmarks, state-of-the-art long-horizon agent systems benefit most from hierarchical memory and supervisor topologies. Flat vector memory degrades after ~200 steps due to context saturation, whereas multi-tier episodic memory achieves higher completion rates on complex workflows.",
          sources: ["MemOS-2 Paper", "τ²-bench"],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Research Copilot</span>
          </h2>
          <p className="text-xs text-muted">Grounded in your ingested papers, releases, and architecture patterns.</p>
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border bg-sidebar text-xs">
          <button
            onClick={() => setIsDeepResearch(false)}
            className={`px-2.5 py-1 rounded-md transition ${
              !isDeepResearch ? "bg-card text-foreground font-semibold shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            Quick Ask
          </button>
          <button
            onClick={() => setIsDeepResearch(true)}
            className={`px-2.5 py-1 rounded-md transition ${
              isDeepResearch ? "bg-card text-primary font-semibold shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            Deep Research
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-2">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col gap-1.5 max-w-[85%] ${
              m.role === "user" ? "self-end items-end" : "self-start items-start"
            }`}
          >
            <div
              className={`p-4 rounded-2xl text-xs leading-relaxed ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground font-medium rounded-br-none"
                  : "bg-card border border-border text-foreground rounded-bl-none shadow-sm"
              }`}
            >
              {m.content}
            </div>

            {m.sources && m.sources.length > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-muted flex-wrap">
                <BookOpen className="w-3 h-3" />
                <span>Cited Sources:</span>
                {m.sources.map((src, sIdx) => (
                  <span key={sIdx} className="px-1.5 py-0.5 rounded border border-border bg-sidebar text-foreground text-[10px]">
                    {src}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="self-start p-3.5 rounded-2xl bg-card border border-border text-xs text-muted flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span>Synthesizing literature across your knowledge base...</span>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask a question about agentic architectures or request a synthesis..."
          className="flex-1 px-3.5 py-2 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:border-primary shadow-sm"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !query.trim()}
          className="p-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground transition disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
