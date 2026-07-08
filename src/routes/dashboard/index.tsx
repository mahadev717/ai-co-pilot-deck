import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppState } from "../../hooks/use-app-state";
import {
  Sparkles,
  TrendingUp,
  Activity,
  Users,
  Bot,
  Bell,
  CheckCircle,
  AlertTriangle,
  Play,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardOverview,
});

const mrrData = [
  { month: "Jan", revenue: 120000 },
  { month: "Feb", revenue: 145000 },
  { month: "Mar", revenue: 168000 },
  { month: "Apr", revenue: 190000 },
  { month: "May", revenue: 220000 },
  { month: "Jun", revenue: 248910 },
];

const customerData = [
  { month: "Jan", active: 1500, new: 200 },
  { month: "Feb", active: 1800, new: 350 },
  { month: "Mar", active: 2100, new: 400 },
  { month: "Apr", active: 2500, new: 450 },
  { month: "May", active: 2900, new: 500 },
  { month: "Jun", active: 3204, new: 610 },
];

function DashboardOverview() {
  const { user, businessHealth, revenue, customers, teamPRs, integrations, resolveRecommendation } =
    useAppState();

  const [mounted, setMounted] = useState(false);
  const [recommendations, setRecommendations] = useState([
    {
      id: "rec1",
      title: "Churn risk detected in 3 enterprise accounts",
      desc: "Lumen AI and Northwind Labs show 40% drops in API usage. Action: Auto-schedule account health QBRs.",
      status: "pending",
      actionText: "Schedule QBRs",
    },
    {
      id: "rec2",
      title: "Vulnerability in dependency packages",
      desc: "Outdated package contains security warning. Action: Trigger automated security hotfix PR via Engineering Agent.",
      status: "pending",
      actionText: "Create Hotfix PR",
    },
    {
      id: "rec3",
      title: "Organic marketing lead spike",
      desc: "Traffic to /pricing spiked 45% following launch. Action: Optimize conversion landing hooks for SaaS teams.",
      status: "pending",
      actionText: "Apply landing hooks",
    },
  ]);
  const [activeRec, setActiveRec] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleResolve = async (id: string, text: string) => {
    setActiveRec(id);
    setResolving(true);
    // Simulate agent background execution
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setRecommendations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "completed" } : item)),
    );
    resolveRecommendation(id, text);
    setResolving(false);
    setActiveRec(null);
  };

  const isStripe = integrations.find((i) => i.id === "stripe")?.connected;
  const isGithub = integrations.find((i) => i.id === "github")?.connected;
  const isHubspot = integrations.find((i) => i.id === "hubspot")?.connected;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Hello, {user?.name || "Founder"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Here is your AI Co-founder workspace status report for today.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs">
          <Sparkles className="h-4 w-4 text-brand-glow animate-pulse-glow" />
          <span>AI agent status: Monitoring active pipelines</span>
        </div>
      </div>

      {/* Analytics Widgets */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Health Score Gauge */}
        <div className="glass flex flex-col justify-between rounded-2xl p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Business Health
          </div>
          <div className="relative mx-auto my-3 h-28 w-28">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="oklch(1 0 0 / 0.05)"
                strokeWidth="7"
                fill="none"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                stroke="url(#health-grad)"
                strokeWidth="7"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="264"
                initial={{ strokeDashoffset: 264 }}
                animate={{ strokeDashoffset: 264 - 264 * (businessHealth / 100) }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="health-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="oklch(0.66 0.20 265)" />
                  <stop offset="100%" stopColor="oklch(0.62 0.24 300)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-3xl font-bold">{businessHealth}</span>
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                {businessHealth > 85 ? "Excellent" : businessHealth > 70 ? "Healthy" : "Needs Sync"}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Score weight</span>
            <span className="text-foreground">
              {integrations.filter((i) => i.connected).length} / 6 connected
            </span>
          </div>
        </div>

        {/* Revenue MRR */}
        <div className="glass flex flex-col justify-between rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Revenue (MRR)
            </span>
            {isStripe && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
                <TrendingUp className="h-3 w-3" /> +12.4%
              </span>
            )}
          </div>
          <div className="my-4">
            <div className="font-display text-3xl font-bold">
              {isStripe ? `$${revenue.toLocaleString()}` : "Stripe Offline"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {isStripe ? "Pending Stripe payout: $42,180" : "Link Stripe in Integrations to view"}
            </p>
          </div>
          <Link
            to="/dashboard/integrations"
            className="text-xs text-brand-glow hover:underline flex items-center gap-1 mt-auto"
          >
            {isStripe ? "View billing logs" : "Link Stripe now"} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Customers */}
        <div className="glass flex flex-col justify-between rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Customers
            </span>
            {isHubspot && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
                <Activity className="h-3 w-3" /> +8.3%
              </span>
            )}
          </div>
          <div className="my-4">
            <div className="font-display text-3xl font-bold">
              {isHubspot ? customers.toLocaleString() : "CRM Offline"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {isHubspot ? "Qualified pipeline: +14% growth" : "Link HubSpot CRM to fetch metrics"}
            </p>
          </div>
          <Link
            to="/dashboard/integrations"
            className="text-xs text-brand-glow hover:underline flex items-center gap-1 mt-auto"
          >
            {isHubspot ? "View pipeline leads" : "Link HubSpot"} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Engineering / GitHub */}
        <div className="glass flex flex-col justify-between rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Engineering PRs
            </span>
            {isGithub && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
                <CheckCircle className="h-3 w-3" /> CI Passing
              </span>
            )}
          </div>
          <div className="my-4">
            <div className="font-display text-3xl font-bold">
              {isGithub ? `${teamPRs} Merged` : "GitHub Offline"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {isGithub ? "14 active engineers code sync" : "Link GitHub to monitor code velocity"}
            </p>
          </div>
          <Link
            to="/dashboard/integrations"
            className="text-xs text-brand-glow hover:underline flex items-center gap-1 mt-auto"
          >
            {isGithub ? "View repository health" : "Link GitHub"} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Grid: Charts & AI Recommendations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recharts Graphics */}
        <div className="glass col-span-1 rounded-2xl p-5 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Startup Growth Trends</h3>
            <span className="text-xs text-muted-foreground">Metrics synchronized in real-time</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MRR Chart */}
            <div className="h-64 space-y-2">
              <span className="text-xs font-medium text-muted-foreground">
                Monthly Recurring Revenue (USD)
              </span>
              {!isStripe ? (
                <div className="flex h-56 items-center justify-center rounded-xl bg-white/5 border border-dashed border-border text-xs text-muted-foreground">
                  Stripe disconnected. No billing history.
                </div>
              ) : mounted ? (
                <ResponsiveContainer width="100%" height="90%">
                  <AreaChart data={mrrData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMRR" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.66 0.20 265)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="oklch(0.66 0.20 265)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      stroke="oklch(0.70 0.02 265)"
                      fontSize={10}
                      tickLine={false}
                    />
                    <YAxis stroke="oklch(0.70 0.02 265)" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "#1a1a2e",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="oklch(0.66 0.20 265)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorMRR)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : null}
            </div>

            {/* Customers Chart */}
            <div className="h-64 space-y-2">
              <span className="text-xs font-medium text-muted-foreground">
                Active Customer Acquisition
              </span>
              {!isHubspot ? (
                <div className="flex h-56 items-center justify-center rounded-xl bg-white/5 border border-dashed border-border text-xs text-muted-foreground">
                  CRM disconnected. No acquisition logs.
                </div>
              ) : mounted ? (
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart
                    data={customerData}
                    margin={{ top: 10, right: 5, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="month"
                      stroke="oklch(0.70 0.02 265)"
                      fontSize={10}
                      tickLine={false}
                    />
                    <YAxis stroke="oklch(0.70 0.02 265)" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "#1a1a2e",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    />
                    <Bar
                      dataKey="active"
                      fill="oklch(0.62 0.24 300)"
                      radius={[4, 4, 0, 0]}
                      opacity={0.8}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : null}
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-brand-glow animate-pulse" />
            <h3 className="font-display text-lg font-semibold">AI Assistant Actions</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Specialized agents have flagged the following actionable items:
          </p>

          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`relative rounded-xl border p-3.5 transition-colors ${
                  rec.status === "completed"
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-white/5 border-border hover:bg-white/10"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      {rec.status === "completed" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />
                      )}
                      <span
                        className={
                          rec.status === "completed"
                            ? "line-through text-muted-foreground"
                            : "text-foreground"
                        }
                      >
                        {rec.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{rec.desc}</p>
                  </div>
                </div>

                {rec.status !== "completed" && (
                  <button
                    onClick={() => handleResolve(rec.id, rec.title)}
                    disabled={resolving && activeRec === rec.id}
                    className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg gradient-brand-bg px-3 py-1.5 text-[11px] font-medium text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
                  >
                    {resolving && activeRec === rec.id ? (
                      <span className="h-3 w-3 animate-spin rounded-full border border-primary-foreground border-t-transparent" />
                    ) : (
                      <>
                        <Play className="h-3 w-3" /> {rec.actionText}
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
