import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppState } from "../../hooks/use-app-state";
import { useState } from "react";
import { Users, TrendingUp, AlertTriangle, CheckCircle, Zap, Heart, Mail, Phone, Search, Filter } from "lucide-react";
import { motion } from "motion/react";

export const Route = createFileRoute("/dashboard/customers")({
  component: CustomersPage,
});

function HealthBadge({ health }: { health: "healthy" | "at-risk" | "churned" }) {
  const config = {
    healthy: { label: "Healthy", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    "at-risk": { label: "At Risk", cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
    churned: { label: "Churned", cls: "bg-destructive/10 text-destructive border-destructive/20" },
  }[health];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${config.cls}`}>
      {health === "healthy" ? <CheckCircle className="h-3 w-3" /> : health === "at-risk" ? <AlertTriangle className="h-3 w-3" /> : null}
      {config.label}
    </span>
  );
}

function NpsBar({ score }: { score: number }) {
  const color = score >= 70 ? "bg-emerald-500" : score >= 50 ? "bg-yellow-500" : "bg-destructive";
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="h-1.5 w-20 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="font-semibold">{score}</span>
    </div>
  );
}

function CustomersPage() {
  const { customerAccounts, integrations } = useAppState();
  const [filter, setFilter] = useState<"all" | "healthy" | "at-risk" | "churned">("all");
  const [search, setSearch] = useState("");
  const isHubspot = integrations.find((i) => i.id === "hubspot")?.connected;
  const isZendesk = integrations.find((i) => i.id === "zendesk")?.connected;
  const isIntercom = integrations.find((i) => i.id === "intercom")?.connected;

  const filtered = customerAccounts.filter((c) => {
    const matchFilter = filter === "all" || c.health === filter;
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const atRiskArr = customerAccounts.filter((c) => c.health === "at-risk").reduce((s, c) => s + c.arr, 0);
  const healthyArr = customerAccounts.filter((c) => c.health === "healthy").reduce((s, c) => s + c.arr, 0);
  const totalArr = customerAccounts.filter((c) => c.health !== "churned").reduce((s, c) => s + c.arr, 0);

  const stageColors: Record<string, string> = {
    trial: "bg-blue-500/10 text-blue-400",
    active: "bg-emerald-500/10 text-emerald-400",
    enterprise: "bg-purple-500/10 text-purple-400",
    churned: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Customer Intelligence</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Account health, churn risk, NPS, and journey tracking across HubSpot, Zendesk, and Intercom.
          </p>
        </div>
        {!isHubspot && (
          <Link to="/dashboard/integrations" className="flex items-center gap-1.5 rounded-full border border-brand-glow/30 bg-brand/10 px-4 py-2 text-xs font-medium text-brand-glow hover:bg-brand/20">
            <Zap className="h-3.5 w-3.5" /> Connect HubSpot for live data
          </Link>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total ARR", value: `$${(totalArr / 1000).toFixed(0)}k`, sub: `${customerAccounts.filter(c => c.health !== "churned").length} accounts`, icon: TrendingUp, color: "text-emerald-400" },
          { label: "At-Risk ARR", value: `$${(atRiskArr / 1000).toFixed(0)}k`, sub: `${customerAccounts.filter(c => c.health === "at-risk").length} accounts need attention`, icon: AlertTriangle, color: "text-yellow-400" },
          { label: "Avg NPS", value: "67", sub: "+8 pts vs last quarter", icon: Heart, color: "text-pink-400" },
          { label: "Net Revenue Retention", value: "118%", sub: "Expansion > Churn ✅", icon: Users, color: "text-brand-glow" },
        ].map((m) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="glass flex flex-col justify-between rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{m.label}</span>
              <m.icon className={`h-4 w-4 ${m.color}`} />
            </div>
            <div className="my-3 font-display text-3xl font-bold">{m.value}</div>
            <p className="text-xs text-muted-foreground">{m.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Integration prompt if no tools connected */}
      {!isHubspot && !isZendesk && !isIntercom && (
        <div className="glass rounded-2xl border border-dashed border-border/50 p-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <Users className="h-10 w-10 text-muted-foreground/30" />
            <p className="font-medium">Connect CRM & Support tools for live customer data</p>
            <p className="text-sm text-muted-foreground">The customer data below is a demo. Connect HubSpot, Zendesk, or Intercom for real accounts.</p>
            <Link to="/dashboard/integrations" className="inline-flex items-center gap-1 rounded-full gradient-brand-bg px-4 py-2 text-sm font-medium text-primary-foreground">
              <Zap className="h-3.5 w-3.5" /> Connect integrations
            </Link>
          </div>
        </div>
      )}

      {/* Filters + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text" placeholder="Search accounts…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-white/5 py-2 pl-10 pr-4 text-sm text-foreground outline-none focus:border-primary/50 focus:bg-white/10"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "healthy", "at-risk", "churned"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${filter === f ? "gradient-brand-bg text-primary-foreground" : "border border-border bg-white/5 text-muted-foreground hover:text-foreground"}`}>
              {f === "all" ? "All" : f === "at-risk" ? "At Risk" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Customer table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border/50 bg-white/[0.02]">
              <tr className="text-xs text-muted-foreground">
                <th className="px-6 py-4 text-left font-medium">Account</th>
                <th className="px-4 py-4 text-left font-medium">ARR</th>
                <th className="px-4 py-4 text-left font-medium">Stage</th>
                <th className="px-4 py-4 text-left font-medium">Health</th>
                <th className="px-4 py-4 text-left font-medium">NPS</th>
                <th className="px-4 py-4 text-left font-medium">Tickets</th>
                <th className="px-4 py-4 text-left font-medium">Last Active</th>
                <th className="px-6 py-4 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {filtered.map((account) => (
                <tr key={account.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-xs font-bold text-brand-glow">
                        {account.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium">{account.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-semibold">${account.arr.toLocaleString()}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${stageColors[account.stage]}`}>
                      {account.stage}
                    </span>
                  </td>
                  <td className="px-4 py-4"><HealthBadge health={account.health} /></td>
                  <td className="px-4 py-4"><NpsBar score={account.nps} /></td>
                  <td className="px-4 py-4">
                    <span className={account.ticketsOpen > 2 ? "text-destructive font-semibold" : "text-muted-foreground"}>
                      {account.ticketsOpen} open
                    </span>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground text-xs">{account.lastActive}</td>
                  <td className="px-6 py-4 text-right">
                    {account.health === "at-risk" && (
                      <button className="flex items-center gap-1.5 rounded-lg gradient-brand-bg px-3 py-1.5 text-xs font-medium text-primary-foreground ml-auto">
                        <Mail className="h-3 w-3" /> Schedule QBR
                      </button>
                    )}
                    {account.health === "healthy" && (
                      <button className="flex items-center gap-1.5 rounded-lg border border-border bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10 ml-auto">
                        <TrendingUp className="h-3 w-3" /> Upsell
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
