import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppState } from "../../hooks/use-app-state";
import {
  DollarSign, TrendingUp, TrendingDown, ArrowRight,
  Users, AlertTriangle, BarChart3, Activity,
  CreditCard, Flame, Clock, Zap,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, LineChart, Line, Legend,
} from "recharts";
import { motion } from "motion/react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/revenue")({
  component: RevenuePage,
});

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card/95 p-3 text-xs shadow-xl backdrop-blur">
      <p className="mb-2 font-semibold text-foreground">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.name}:</span>
          <span className="font-medium text-foreground">
            {typeof p.value === "number" && p.value > 1000
              ? `$${p.value.toLocaleString()}`
              : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

function MetricCard({ label, value, sub, trend, icon: Icon, color = "text-brand-glow" }: {
  label: string; value: string; sub?: string; trend?: number; icon: React.ComponentType<any>; color?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass flex flex-col justify-between rounded-2xl p-5"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="my-3">
        <div className="font-display text-3xl font-bold">{value}</div>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? "text-emerald-400" : "text-destructive"}`}>
          {trend >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {trend >= 0 ? "+" : ""}{trend}% vs last month
        </div>
      )}
    </motion.div>
  );
}

function RevenuePage() {
  const { revenueHistory, integrations, burnRate, runway, liveStripe, refreshLiveData } = useAppState();
  const [activeView, setActiveView] = useState<"mrr" | "breakdown" | "customers">("mrr");
  const isStripe = integrations.find((i) => i.id === "stripe")?.connected;
  const isQB = integrations.find((i) => i.id === "quickbooks")?.connected;
  const latest = revenueHistory[revenueHistory.length - 1];
  const prev = revenueHistory[revenueHistory.length - 2];
  const mrrGrowth = Math.round(((latest.mrr - prev.mrr) / prev.mrr) * 100);
  const mrrDisplay = liveStripe?.revenue && liveStripe.revenue > 1000 ? liveStripe.revenue : latest.mrr;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Revenue Intelligence</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live financial metrics across Stripe, QuickBooks, and billing systems.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isStripe && liveStripe && (
            <button
              onClick={() => void refreshLiveData()}
              className="rounded-full border border-border bg-white/5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Refresh live data
            </button>
          )}
          {isStripe && liveStripe ? (
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400">
              Live Stripe · {liveStripe.recentCharges.length} recent charges
            </span>
          ) : !isStripe ? (
            <Link to="/dashboard/integrations" className="flex items-center gap-1.5 rounded-full border border-brand-glow/30 bg-brand/10 px-4 py-2 text-xs font-medium text-brand-glow hover:bg-brand/20 transition-colors">
              <Zap className="h-3.5 w-3.5" /> Connect Stripe to unlock live data
            </Link>
          ) : null}
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Monthly Recurring Revenue" value={`$${mrrDisplay.toLocaleString()}`} sub={liveStripe ? "Live Stripe volume signal" : "Annual run rate: $2.99M"} trend={mrrGrowth} icon={DollarSign} color="text-emerald-400" />
        <MetricCard label="New MRR" value={`$${latest.newMrr.toLocaleString()}`} sub="From new customers this month" trend={18} icon={TrendingUp} color="text-brand-glow" />
        <MetricCard label="Expansion MRR" value={`$${latest.expansionMrr.toLocaleString()}`} sub="Upgrades & upsells" trend={52} icon={Activity} color="text-blue-400" />
        <MetricCard label="Churned MRR" value={`$${latest.churnedMrr.toLocaleString()}`} sub="↓22% vs last month (improving)" trend={-22} icon={TrendingDown} color="text-destructive" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Burn Rate" value={`$${burnRate.toLocaleString()}/mo`} sub={isQB ? "From QuickBooks payroll + ops" : "Estimated — connect QuickBooks"} icon={Flame} color="text-orange-400" />
        <MetricCard label="Cash Runway" value={`${runway} months`} sub="At current burn rate" icon={Clock} color={runway < 6 ? "text-destructive" : runway < 12 ? "text-yellow-400" : "text-emerald-400"} />
        <MetricCard label="Net Revenue Retention" value="118%" sub="Expansion > Churn ✅" trend={3} icon={TrendingUp} color="text-emerald-400" />
        <MetricCard label="Active Customers" value={latest.customers.toLocaleString()} sub={`+610 in ${latest.month}`} trend={21} icon={Users} color="text-purple-400" />
      </div>

      {/* Live Stripe charges */}
      {liveStripe && liveStripe.recentCharges.length > 0 && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-400" />
            <h3 className="font-display text-lg font-semibold">Live Stripe Charges</h3>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">LIVE</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-xs text-muted-foreground">
                  <th className="pb-3 text-left font-medium">Charge ID</th>
                  <th className="pb-3 text-left font-medium">Amount</th>
                  <th className="pb-3 text-left font-medium">Currency</th>
                  <th className="pb-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {liveStripe.recentCharges.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3 font-mono text-xs text-muted-foreground">{c.id}</td>
                    <td className="py-3 font-medium">${c.amount.toLocaleString()}</td>
                    <td className="py-3 uppercase text-muted-foreground">{c.currency}</td>
                    <td className="py-3 text-right">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${
                        c.status === "succeeded" ? "bg-emerald-500/10 text-emerald-400" : "bg-yellow-500/10 text-yellow-400"
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Chart toggle */}
      <div className="glass rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Revenue Trends</h3>
          <div className="flex gap-1 rounded-lg border border-border bg-white/5 p-1">
            {(["mrr", "breakdown", "customers"] as const).map((v) => (
              <button key={v} onClick={() => setActiveView(v)}
                className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${activeView === v ? "gradient-brand-bg text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {v === "mrr" ? "MRR" : v === "breakdown" ? "Breakdown" : "Customers"}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64">
          {!isStripe ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border text-center">
              <CreditCard className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">Connect Stripe to see live revenue charts</p>
              <Link to="/dashboard/integrations" className="text-xs text-brand-glow hover:underline">Connect now →</Link>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {activeView === "mrr" ? (
                <AreaChart data={revenueHistory}>
                  <defs>
                    <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.66 0.20 265)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="oklch(0.66 0.20 265)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="oklch(0.60 0.02 265)" fontSize={11} tickLine={false} />
                  <YAxis stroke="oklch(0.60 0.02 265)" fontSize={11} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="mrr" stroke="oklch(0.66 0.20 265)" strokeWidth={2} fillOpacity={1} fill="url(#mrrGrad)" name="MRR" />
                </AreaChart>
              ) : activeView === "breakdown" ? (
                <BarChart data={revenueHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="oklch(0.60 0.02 265)" fontSize={11} tickLine={false} />
                  <YAxis stroke="oklch(0.60 0.02 265)" fontSize={11} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="newMrr" fill="oklch(0.66 0.20 265)" radius={[3,3,0,0]} name="New MRR" stackId="a" />
                  <Bar dataKey="expansionMrr" fill="oklch(0.70 0.18 150)" radius={[3,3,0,0]} name="Expansion" stackId="a" />
                  <Bar dataKey="churnedMrr" fill="oklch(0.60 0.22 25)" radius={[3,3,0,0]} name="Churned" stackId="b" />
                </BarChart>
              ) : (
                <LineChart data={revenueHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="oklch(0.60 0.02 265)" fontSize={11} tickLine={false} />
                  <YAxis stroke="oklch(0.60 0.02 265)" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="customers" stroke="oklch(0.62 0.24 300)" strokeWidth={2} dot={{ fill: "oklch(0.62 0.24 300)", r: 4 }} name="Customers" />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Churn risk table */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
          <h3 className="font-display text-lg font-semibold">Revenue Risk Radar</h3>
          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive font-medium">$28,100 ARR at risk</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-xs text-muted-foreground">
                <th className="pb-3 text-left font-medium">Account</th>
                <th className="pb-3 text-left font-medium">ARR</th>
                <th className="pb-3 text-left font-medium">Signal</th>
                <th className="pb-3 text-left font-medium">NPS</th>
                <th className="pb-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {[
                { name: "Lumen AI", arr: 14400, signal: "API usage ↓40% + 3 open tickets", nps: 42 },
                { name: "Northwind Labs", arr: 8800, signal: "No login in 12 days", nps: 51 },
                { name: "Cascadia Corp", arr: 4900, signal: "Support tickets ↑3x this week", nps: 38 },
              ].map((r) => (
                <tr key={r.name} className="group">
                  <td className="py-3 font-medium">{r.name}</td>
                  <td className="py-3 text-muted-foreground">${r.arr.toLocaleString()}</td>
                  <td className="py-3">
                    <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-400">{r.signal}</span>
                  </td>
                  <td className="py-3">
                    <span className={`font-semibold ${r.nps < 50 ? "text-destructive" : "text-yellow-400"}`}>{r.nps}</span>
                  </td>
                  <td className="py-3 text-right">
                    <button className="rounded-lg bg-white/5 px-3 py-1 text-xs hover:bg-white/10 transition-colors flex items-center gap-1 ml-auto">
                      Schedule QBR <ArrowRight className="h-3 w-3" />
                    </button>
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
