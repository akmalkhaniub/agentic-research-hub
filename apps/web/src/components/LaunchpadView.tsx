"use client";

import React, { useState, useEffect } from "react";
import { Rocket, Cloud, Terminal, Copy, Check, ShieldCheck, ExternalLink, Code2 } from "lucide-react";

interface LaunchpadTemplate {
  id: string;
  name: string;
  cloud: string;
  service: string;
  free_tier_fit: string;
  description: string;
  category: string;
  icon: string;
  env_vars: string[];
  dockerfile: string;
  terraform: string;
  cli_command: string;
}

export function LaunchpadView() {
  const [templates, setTemplates] = useState<LaunchpadTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("gcp_cloud_run_api");
  const [activeCodeTab, setActiveCodeTab] = useState<"terraform" | "dockerfile" | "cli">("terraform");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/api/launchpad/templates")
      .then((res) => res.json())
      .then((data) => {
        if (data.templates) {
          setTemplates(data.templates);
          if (data.templates.length > 0) {
            setSelectedTemplateId(data.templates[0].id);
          }
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const handleCopyCode = () => {
    if (!activeTemplate) return;
    const code =
      activeCodeTab === "terraform"
        ? activeTemplate.terraform
        : activeCodeTab === "dockerfile"
        ? activeTemplate.dockerfile
        : activeTemplate.cli_command;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeTemplate) {
    return <div className="p-8 text-center text-xs text-muted">Loading cloud launchpad...</div>;
  }

  const activeCode =
    activeCodeTab === "terraform"
      ? activeTemplate.terraform
      : activeCodeTab === "dockerfile"
      ? activeTemplate.dockerfile
      : activeTemplate.cli_command;

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Rocket className="w-4 h-4 text-primary" />
            <span>Cloud Launchpad & Zero-Cost IaC Blueprints</span>
          </h2>
          <p className="text-xs text-muted">
            Production deployment blueprints for Google Cloud Platform, AWS, and Hugging Face designed for scale-to-zero free tiers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Templates Rail (4 cols) */}
        <div className="col-span-4 flex flex-col gap-2 select-none">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted px-1 mb-1">
            Blueprints ({templates.length})
          </div>
          {templates.map((tpl) => {
            const isSelected = selectedTemplateId === tpl.id;
            return (
              <div
                key={tpl.id}
                onClick={() => setSelectedTemplateId(tpl.id)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                  isSelected
                    ? "border-primary bg-secondary/60 shadow-sm"
                    : "border-border bg-card hover:bg-hover"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-foreground">{tpl.cloud}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-border bg-sidebar text-emerald-600 dark:text-emerald-400 font-medium">
                    Free Tier
                  </span>
                </div>
                <h4 className="font-semibold text-xs text-foreground truncate">{tpl.name}</h4>
                <p className="text-[11px] text-muted mt-0.5">{tpl.service}</p>
              </div>
            );
          })}
        </div>

        {/* Blueprint Details & IaC Generator (8 cols) */}
        <div className="col-span-8 flex flex-col gap-5">
          <div className="p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted mb-1">
                <span className="font-bold text-foreground">{activeTemplate.cloud}</span>
                <span>·</span>
                <span>{activeTemplate.service}</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">{activeTemplate.name}</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">{activeTemplate.description}</p>
            </div>

            {/* Free Tier Guarantee Box */}
            <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                  {activeTemplate.free_tier_fit}
                </span>
              </div>
            </div>

            {/* Required Environment Variables */}
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-1.5">
                Target Environment Variables
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {activeTemplate.env_vars.map((v) => (
                  <span key={v} className="px-2 py-0.5 rounded-md font-mono text-[11px] border border-border bg-sidebar text-foreground">
                    {v}
                  </span>
                ))}
              </div>
            </div>

            {/* Code Tabs */}
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border bg-sidebar text-xs">
                  <button
                    onClick={() => setActiveCodeTab("terraform")}
                    className={`px-3 py-1 rounded-md transition font-medium ${
                      activeCodeTab === "terraform"
                        ? "bg-card text-foreground font-semibold shadow-sm"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    Terraform (main.tf)
                  </button>
                  <button
                    onClick={() => setActiveCodeTab("dockerfile")}
                    className={`px-3 py-1 rounded-md transition font-medium ${
                      activeCodeTab === "dockerfile"
                        ? "bg-card text-foreground font-semibold shadow-sm"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    Dockerfile
                  </button>
                  <button
                    onClick={() => setActiveCodeTab("cli")}
                    className={`px-3 py-1 rounded-md transition font-medium ${
                      activeCodeTab === "cli"
                        ? "bg-card text-foreground font-semibold shadow-sm"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    Cloud CLI Command
                  </button>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-card text-xs text-muted hover:text-foreground transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy Code"}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-sidebar border border-border overflow-x-auto max-h-72">
                <pre className="font-mono text-xs text-foreground leading-relaxed whitespace-pre">
                  {activeCode}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
