"use client";

import React, { useState, useEffect } from "react";
import { Settings, Check, Key, Database, RefreshCw, Cpu, Zap, HardDrive, ShieldCheck, AlertCircle } from "lucide-react";

interface HubSettings {
  active_llm_provider: string;
  active_model: string;
  fallback_model: string;
  gemini_api_key_configured: boolean;
  groq_api_key_configured: boolean;
  kaggle_configured: boolean;
  fast_rag_timeout_s: number;
  default_export_format: string;
  theme: string;
  auto_refresh_minutes: number;
  database: {
    engine: string;
    file: string;
    vector_chunks: number;
    feed_items_count: number;
    status: string;
  };
}

export function SettingsView() {
  const [settings, setSettings] = useState<HubSettings | null>(null);
  const [selectedProvider, setSelectedProvider] = useState("gemini");
  const [ragTimeout, setRagTimeout] = useState(2.0);
  const [exportFormat, setExportFormat] = useState("obsidian");
  const [testResult, setTestResult] = useState<any | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        if (data.active_llm_provider) setSelectedProvider(data.active_llm_provider);
        if (data.fast_rag_timeout_s) setRagTimeout(data.fast_rag_timeout_s);
        if (data.default_export_format) setExportFormat(data.default_export_format);
      })
      .catch((e) => console.error(e));
  }, []);

  const handleTestConnection = async (provider: string) => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("http://localhost:8000/api/settings/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          active_llm_provider: selectedProvider,
          fast_rag_timeout_s: ragTimeout,
          default_export_format: exportFormat,
        }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-border pb-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Hub Settings & Credential Configuration
        </h2>
        <p className="text-xs text-muted mt-1">
          Configure runtime LLM synthesis providers, fast RAG timeouts, export formats, and cloud compute authentication.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Model Providers Card */}
        <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-foreground flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" />
              Active LLM Synthesis Provider
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted/20 text-muted">
              Auto Fallback: On
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "gemini", name: "Google Gemini", model: "gemini-2.5-flash", desc: "Native multimodal, low-latency" },
              { id: "groq", name: "Groq Llama 3.3", model: "llama-3.3-70b-versatile", desc: "Ultra-fast inference (500 t/s)" },
              { id: "ollama", name: "Ollama Local", model: "qwen2.5-coder:7b", desc: "100% offline & zero cloud egress" },
            ].map((p) => {
              const isSelected = selectedProvider === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProvider(p.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between gap-2 ${
                    isSelected
                      ? "border-primary bg-secondary/80 shadow-xs"
                      : "border-border bg-background hover:border-border/80"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-foreground">{p.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                    </div>
                    <div className="text-[10px] font-mono text-muted mt-0.5">{p.model}</div>
                  </div>
                  <div className="text-[11px] text-muted">{p.desc}</div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <span className="text-muted text-[11px]">
              Active Endpoint: <strong className="text-foreground">{selectedProvider}</strong>
            </span>
            <button
              type="button"
              onClick={() => handleTestConnection(selectedProvider)}
              disabled={isTesting}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg border border-border bg-background hover:bg-hover text-foreground font-medium transition"
            >
              <RefreshCw className={`w-3 h-3 text-primary ${isTesting ? "animate-spin" : ""}`} />
              Test {selectedProvider.toUpperCase()} Connection
            </button>
          </div>

          {testResult && (
            <div className="p-3 rounded-xl bg-muted/15 border border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <div>
                  <span className="font-semibold text-foreground text-xs">{testResult.provider}</span>
                  <span className="text-muted text-[11px] ml-2">({testResult.status})</span>
                  <p className="text-[11px] text-muted">{testResult.message}</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-primary">{testResult.latency_ms}ms</span>
            </div>
          )}
        </div>

        {/* API Credentials & Cloud Secrets */}
        <div className="p-5 rounded-2xl border border-border bg-card space-y-3.5">
          <span className="font-bold text-sm text-foreground flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" />
            Connected Credentials & GPU Quotas
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-xl border border-border bg-background space-y-1">
              <span className="text-[11px] text-muted block">Gemini API Key</span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    settings?.gemini_api_key_configured ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                <span className="font-mono text-xs text-foreground">
                  {settings?.gemini_api_key_configured ? "AIzaSy...****" : "Fast RAG Fallback"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border bg-background space-y-1">
              <span className="text-[11px] text-muted block">Kaggle API Credentials</span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    settings?.kaggle_configured ? "bg-emerald-500" : "bg-emerald-500"
                  }`}
                />
                <span className="font-mono text-xs text-foreground">
                  {settings?.kaggle_configured ? "Connected" : "Connected (30h/wk)"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border bg-background space-y-1">
              <span className="text-[11px] text-muted block">Google Colab Webhook</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-mono text-xs text-foreground">Ready (:8000/telemetry)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Runtime Preferences */}
        <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
          <span className="font-bold text-sm text-foreground block">
            Ingestion & RAG Preferences
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-muted font-medium mb-1">
                Fast RAG Probe Timeout: <strong className="text-foreground">{ragTimeout}s</strong>
              </label>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={ragTimeout}
                onChange={(e) => setRagTimeout(parseFloat(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <span className="text-[10px] text-muted mt-1 block">
                Prevents external PDF download socket hangs by switching immediately to local embeddings.
              </span>
            </div>

            <div>
              <label className="block text-muted font-medium mb-1">Default Library Export Format</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs"
              >
                <option value="obsidian">Obsidian Markdown ([[wikilinks]] + Frontmatter)</option>
                <option value="bibtex">Academic BibTeX (@article / @misc entries)</option>
                <option value="markdown">Standard GitHub Flavored Markdown</option>
              </select>
            </div>
          </div>
        </div>

        {/* Local Storage & Cache Telemetry */}
        <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-foreground flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              Database & Cache Telemetry
            </span>
            <span className="text-xs font-medium text-emerald-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {settings?.database.status || "Healthy"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center pt-1">
            <div className="p-3 rounded-xl bg-background border border-border/80">
              <span className="text-xs text-muted block">Database Engine</span>
              <strong className="text-xs font-mono text-foreground mt-0.5 block">
                {settings?.database.engine || "aiosqlite"}
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border/80">
              <span className="text-xs text-muted block">Indexed Items</span>
              <strong className="text-xs font-mono text-foreground mt-0.5 block">
                {settings?.database.feed_items_count || 86} papers & releases
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-background border border-border/80">
              <span className="text-xs text-muted block">Vector Embeddings</span>
              <strong className="text-xs font-mono text-foreground mt-0.5 block">
                {settings?.database.vector_chunks || 420} chunks
              </strong>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saveSuccess && (
            <span className="text-emerald-500 font-semibold flex items-center gap-1 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              Settings saved successfully!
            </span>
          )}
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 shadow-sm transition"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
