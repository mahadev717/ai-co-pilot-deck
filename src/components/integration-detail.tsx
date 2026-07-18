import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAppState } from "@/hooks/use-app-state";
import { getIntegrationInsight, type DemoFile } from "@/lib/integration-demo";
import {
  getPresentationGitHubData,
  listDemoFilesForRepo,
  fetchGitHubFileContent,
} from "@/lib/api-service";
import {
  ArrowLeft,
  CheckCircle2,
  Code2,
  FileCode2,
  GitBranch,
  Github,
  Lock,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertTriangle,
  Lightbulb,
  Activity,
  MessageSquare,
  Bot,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";

function TrendIcon({ trend }: { trend?: "up" | "down" | "flat" }) {
  if (trend === "up") return <TrendingUp className="h-3 w-3 text-emerald-400" />;
  if (trend === "down") return <TrendingDown className="h-3 w-3 text-amber-400" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
}

function buildBotBrief(name: string, insight: ReturnType<typeof getIntegrationInsight>) {
  return `## ${name} — plain-English brief

${insight.summary}

**What the numbers mean**
${insight.metrics.map((m) => `- **${m.label}:** ${m.value}`).join("\n")}

**What I'm seeing**
${insight.findings.map((f) => `- ${f}`).join("\n")}

**What you should do next**
${insight.recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}

Ask me anything else about ${name} — billing risk, trends, or next actions.`;
}

function StripeDashboard({
  onAskAi,
}: {
  onAskAi: (prompt: string) => void;
}) {
  const insight = getIntegrationInsight("stripe");
  const charges = [
    { id: "ch_1", customer: "Acme Corp", amount: "$12,400", status: "succeeded" },
    { id: "ch_2", customer: "Orbit Labs", amount: "$2,890", status: "succeeded" },
    { id: "ch_3", customer: "Contoso", amount: "$2,100", status: "past_due" },
    { id: "ch_4", customer: "Brightly", amount: "$2,700", status: "past_due" },
    { id: "ch_5", customer: "NovaTech", amount: "$4,200", status: "succeeded" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <CreditCard className="h-4 w-4 text-brand-glow" />
          Stripe revenue dashboard
        </div>
        <button
          type="button"
          onClick={() =>
            onAskAi(
              "Explain our Stripe dashboard: MRR, past-due invoices, expansion vs churn, and what I should do today.",
            )
          }
          className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-1.5 text-xs text-brand-glow"
        >
          <Bot className="h-3.5 w-3.5" /> Ask AI to explain Stripe
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {insight.metrics.map((m) => (
          <div key={m.label} className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase text-muted-foreground">{m.label}</p>
              <TrendIcon trend={m.trend} />
            </div>
            <p className="mt-1 font-display text-2xl font-semibold">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60">
        <div className="border-b border-border/50 bg-white/5 px-4 py-2 text-xs font-semibold">
          Recent charges & invoices
        </div>
        <div className="divide-y divide-border/40">
          {charges.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <p className="font-medium">{c.customer}</p>
                <p className="text-[10px] text-muted-foreground">{c.id}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{c.amount}</p>
                <p
                  className={`text-[10px] ${
                    c.status === "succeeded" ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {c.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GitHubHub({
  onAskAi,
}: {
  onAskAi: (prompt: string) => void;
}) {
  const { liveGitHub, getIntegrationCredentials } = useAppState();
  const bundle = liveGitHub?.repos?.length
    ? liveGitHub
    : getPresentationGitHubData();
  const repos = bundle.repos ?? getPresentationGitHubData().repos;
  const [selectedRepo, setSelectedRepo] = useState(repos[0]?.fullName ?? "");
  const [files, setFiles] = useState<DemoFile[]>(() =>
    listDemoFilesForRepo(repos[0]?.fullName ?? "startup-copilot/copilot-web"),
  );
  const [activeFile, setActiveFile] = useState<DemoFile | null>(files[0] ?? null);
  const [loadingFile, setLoadingFile] = useState(false);

  useEffect(() => {
    if (!selectedRepo) return;
    const next = listDemoFilesForRepo(selectedRepo);
    setFiles(next);
    setActiveFile(next[0] ?? null);
  }, [selectedRepo]);

  const openFile = async (path: string) => {
    setLoadingFile(true);
    try {
      const token = getIntegrationCredentials("github").token;
      const file = await fetchGitHubFileContent(token || undefined, selectedRepo, path);
      if (file) setActiveFile(file);
    } finally {
      setLoadingFile(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Github className="h-4 w-4 text-brand-glow" />
          GitHub Hub · {bundle.mode === "live" ? "Live API" : "Presentation demo"}
        </div>
        <button
          type="button"
          onClick={() =>
            onAskAi(
              "Analyze our GitHub repos for security risks, review bottlenecks, and what we should ship this week.",
            )
          }
          className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-1.5 text-xs text-brand-glow"
        >
          <Sparkles className="h-3.5 w-3.5" /> Ask AI to analyze GitHub
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Open PRs", value: bundle.openPrsCount },
          { label: "Open issues", value: bundle.openIssuesCount },
          { label: "Repos", value: repos.length },
        ].map((m) => (
          <div key={m.label} className="glass rounded-2xl p-4">
            <p className="text-[10px] uppercase text-muted-foreground">{m.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="space-y-2 lg:col-span-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Repositories
          </h3>
          <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
            {repos.map((repo) => (
              <button
                key={repo.id}
                type="button"
                onClick={() => setSelectedRepo(repo.fullName)}
                className={`w-full rounded-2xl border p-3 text-left transition-colors ${
                  selectedRepo === repo.fullName
                    ? "border-brand/40 bg-brand/10"
                    : "border-border/60 bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{repo.fullName}</p>
                  {repo.private ? <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : null}
                </div>
                <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                  {repo.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Code2 className="h-3 w-3" /> {repo.language}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3 w-3" /> {repo.stars}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <GitBranch className="h-3 w-3" /> {repo.defaultBranch}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 lg:col-span-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Code & analysis · {selectedRepo}
          </h3>
          <div className="flex flex-wrap gap-2">
            {files.map((f) => (
              <button
                key={f.path}
                type="button"
                onClick={() => void openFile(f.path)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] ${
                  activeFile?.path === f.path
                    ? "border-brand/40 bg-brand/15 text-brand-glow"
                    : "border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileCode2 className="h-3 w-3" />
                {f.path.split("/").pop()}
              </button>
            ))}
          </div>
          {loadingFile && <p className="text-xs text-muted-foreground">Loading file…</p>}
          {activeFile && (
            <div className="overflow-hidden rounded-2xl border border-border/60">
              <div className="flex items-center justify-between border-b border-border/50 bg-white/5 px-4 py-2">
                <span className="font-mono text-[11px] text-brand-glow">{activeFile.path}</span>
                <span className="text-[10px] text-muted-foreground">
                  {(activeFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
              <pre className="max-h-64 overflow-auto bg-black/40 p-4 font-mono text-[11px] leading-relaxed text-foreground/90">
                {activeFile.content}
              </pre>
              <div className="space-y-2 border-t border-border/50 bg-white/[0.03] p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold">
                  <Sparkles className="h-3.5 w-3.5 text-brand-glow" /> AI code analysis
                </p>
                <ul className="space-y-1.5">
                  {activeFile.analysis.map((line) => (
                    <li key={line} className="flex gap-2 text-[12px] text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-glow" />
                      {line}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() =>
                    onAskAi(
                      `Explain the risks and next actions for ${activeFile.path} in ${selectedRepo}. Notes: ${activeFile.analysis.join("; ")}`,
                    )
                  }
                  className="text-[11px] text-brand-glow hover:underline"
                >
                  Send this file to AI chat →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function IntegrationDetailPanel({
  integrationId,
  basePath,
}: {
  integrationId: string;
  basePath: "/dashboard" | "/employee";
}) {
  const navigate = useNavigate();
  const { integrations, sendChatMessage } = useAppState();
  const item = integrations.find((i) => i.id === integrationId);
  const insight = useMemo(() => getIntegrationInsight(integrationId), [integrationId]);
  const displayName = item?.name ?? integrationId;

  const askAi = (prompt: string) => {
    sendChatMessage(prompt);
    if (basePath === "/employee") {
      void navigate({ to: "/employee/chat" });
    } else {
      void navigate({ to: "/dashboard/chat" });
    }
  };

  const listTo = basePath === "/employee" ? "/employee/integrations" : "/dashboard/integrations";

  if (!item) {
    return (
      <div className="space-y-4">
        <Link
          to={listTo}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to integrations
        </Link>
        <p className="text-sm text-muted-foreground">
          Unknown integration “{integrationId}”. Pick a tool from the integrations list.
        </p>
        <p className="text-xs text-muted-foreground">
          Tip: use <strong>Enter as Demo Admin</strong> on Admin Login so all tools are ready.
        </p>
      </div>
    );
  }

  const botBrief = buildBotBrief(displayName, insight);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to={listTo}
            className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All integrations
          </Link>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {displayName} dashboard
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{insight.summary}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {item.connected ? "Connected" : "Preview mode"}
            </span>
            <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground">
              Health {insight.healthScore}/100
            </span>
            {item.accountLabel && (
              <span className="text-[11px] text-brand-glow/80">Account: {item.accountLabel}</span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            askAi(
              `Explain what ${displayName} is telling us right now and the top 3 actions I should take.`,
            )
          }
          className="inline-flex items-center gap-1.5 self-start rounded-xl gradient-brand-bg px-4 py-2.5 text-xs font-medium text-primary-foreground"
        >
          <MessageSquare className="h-3.5 w-3.5" /> Open AI chat & explain
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Always-visible bot explanation on the dashboard itself */}
      <div className="glass-strong rounded-3xl border border-brand/20 p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-brand-bg">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold">AI Co-founder explanation</p>
            <p className="text-[10px] text-muted-foreground">
              Plain English — what this tool means for your business
            </p>
          </div>
        </div>
        <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
          <p>{insight.summary}</p>
          <div>
            <p className="mb-1 text-xs font-semibold text-amber-300">What I&apos;m seeing</p>
            <ul className="space-y-1">
              {insight.findings.map((f) => (
                <li key={f} className="flex gap-2 text-muted-foreground">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold text-brand-glow">What you should do</p>
            <ul className="space-y-1">
              {insight.recommendations.map((r) => (
                <li key={r} className="flex gap-2 text-muted-foreground">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-glow" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <button
          type="button"
          onClick={() => askAi(botBrief)}
          className="mt-4 text-xs text-brand-glow hover:underline"
        >
          Continue this explanation in AI chat (text + voice) →
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {insight.metrics.map((m) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{m.label}</p>
              <TrendIcon trend={m.trend} />
            </div>
            <p className="mt-1 font-display text-xl font-semibold">{m.value}</p>
          </motion.div>
        ))}
      </div>

      {integrationId === "stripe" && <StripeDashboard onAskAi={askAi} />}
      {integrationId === "github" && <GitHubHub onAskAi={askAi} />}

      {integrationId !== "stripe" && integrationId !== "github" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="glass rounded-2xl p-5">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
              <AlertTriangle className="h-4 w-4 text-amber-400" /> Findings
            </p>
            <ul className="space-y-2">
              {insight.findings.map((f) => (
                <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-2xl p-5">
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
              <Lightbulb className="h-4 w-4 text-brand-glow" /> Recommendations
            </p>
            <ul className="space-y-2">
              {insight.recommendations.map((r) => (
                <li key={r} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-glow" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="glass rounded-2xl p-5">
        <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
          <Activity className="h-4 w-4 text-brand-glow" /> {insight.headline} · live activity
        </p>
        <ul className="space-y-2">
          {insight.timeline.map((t) => (
            <li key={`${t.time}-${t.text}`} className="flex gap-3 text-sm">
              <span className="w-28 shrink-0 text-[11px] text-muted-foreground">{t.time}</span>
              <span className="text-muted-foreground">{t.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
