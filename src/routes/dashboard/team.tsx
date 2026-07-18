import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppState } from "../../hooks/use-app-state";
import {
  GitPullRequest, Activity, Clock, Users, AlertCircle,
  CheckCircle, Zap, Code, Slack, TrendingUp,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";
import { motion } from "motion/react";

export const Route = createFileRoute("/dashboard/team")({
  component: TeamPage,
});

const velocity = [
  { sprint: "S14", points: 28, prs: 9 },
  { sprint: "S15", points: 31, prs: 11 },
  { sprint: "S16", points: 29, prs: 8 },
  { sprint: "S17", points: 34, prs: 12 },
  { sprint: "S18", points: 21, prs: 7 },
];

const radarData = [
  { subject: "Velocity", A: 82 },
  { subject: "Quality", A: 91 },
  { subject: "Collaboration", A: 74 },
  { subject: "Docs", A: 58 },
  { subject: "Security", A: 65 },
  { subject: "Delivery", A: 88 },
];

const recentActivity = [
  { type: "pr", text: "Alex Chen merged feat/billing-portal", time: "12 min ago", status: "success" },
  { type: "alert", text: "Marcus Webb's task INFRA-208 blocked (AWS quota)", time: "1 hr ago", status: "warning" },
  { type: "pr", text: "Sarah Kim opened fix/dashboard-layout", time: "2 hrs ago", status: "info" },
  { type: "slack", text: "Auth service 200ms slower post-deploy (flagged)", time: "3 hrs ago", status: "warning" },
  { type: "pr", text: "Jordan Lee merged chore/update-deps", time: "4 hrs ago", status: "success" },
  { type: "pr", text: "Priya Nair updated design/onboarding-v3 in Figma", time: "5 hrs ago", status: "info" },
];

export function TeamPage() {
  const { teamMembers, integrations, liveGitHub, teamPRs, refreshLiveData, user } = useAppState();
  const integrationsPath =
    user?.role === "employee" ? "/employee/integrations" : "/dashboard/integrations";
  const isGithub = integrations.find((i) => i.id === "github")?.connected;
  const isSlack = integrations.find((i) => i.id === "slack")?.connected;
  const isLinear = integrations.find((i) => i.id === "linear")?.connected || integrations.find((i) => i.id === "jira")?.connected;

  const statusColors: Record<string, string> = {
    active: "bg-emerald-400",
    away: "bg-yellow-400",
    blocked: "bg-destructive",
  };

  const activityFeed =
    liveGitHub?.recentActivity && liveGitHub.recentActivity.length > 0
      ? liveGitHub.recentActivity
      : recentActivity;

  const openPrsDisplay = liveGitHub ? String(liveGitHub.openPrsCount) : "12";
  const openPrsSub = liveGitHub
    ? `${liveGitHub.openIssuesCount} open issues from live GitHub`
    : "3 awaiting review >48h ⚠️";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Team Activity</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cross-tool team intelligence from GitHub, Slack, Linear, and Figma.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isGithub && liveGitHub && (
            <button
              onClick={() => void refreshLiveData()}
              className="rounded-full border border-border bg-white/5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Refresh live data
            </button>
          )}
          {isGithub && liveGitHub ? (
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400">
              Live GitHub · {teamPRs} open PRs
            </span>
          ) : !isGithub ? (
            <Link to={integrationsPath} className="flex items-center gap-1.5 rounded-full border border-brand-glow/30 bg-brand/10 px-4 py-2 text-xs font-medium text-brand-glow hover:bg-brand/20">
              <Zap className="h-3.5 w-3.5" /> Connect GitHub for live data
            </Link>
          ) : null}
        </div>
      </div>

      {/* Team KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Sprint Velocity", value: "34 pts", sub: "Sprint 18 (↑17%)", icon: TrendingUp, color: "text-brand-glow" },
          { label: "Open PRs", value: openPrsDisplay, sub: openPrsSub, icon: GitPullRequest, color: "text-yellow-400" },
          { label: "Blocked", value: "2", sub: "INFRA-208, AUTH-441", icon: AlertCircle, color: "text-destructive" },
          { label: "Deploy Rate", value: "2.3/day", sub: "0% rollback rate ✅", icon: Zap, color: "text-emerald-400" },
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Team roster */}
        <div className="glass col-span-1 rounded-2xl p-5 space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-glow" />
            <h3 className="font-display text-lg font-semibold">Team Roster</h3>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">{teamMembers.filter(m => m.status === "active").length} active now</span>
          </div>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-4 rounded-xl border border-border/40 bg-white/[0.02] p-3 hover:bg-white/5 transition-colors">
                <div className="relative flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xs font-bold">
                    {member.avatar}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${statusColors[member.status]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{member.name}</p>
                    {member.status === "blocked" && (
                      <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] text-destructive font-medium">BLOCKED</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{member.role} · {member.lastActive}</p>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="text-center">
                    <p className="font-semibold text-foreground">{member.prsThisWeek}</p>
                    <p>PRs</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground">{member.commitsThisWeek}</p>
                    <p>Commits</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team health radar */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <h3 className="font-display text-lg font-semibold">Engineering Health</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "oklch(0.60 0.02 265)" }} />
                <Radar name="Team" dataKey="A" stroke="oklch(0.66 0.20 265)" fill="oklch(0.66 0.20 265)" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {radarData.map((d) => (
              <div key={d.subject} className="flex items-center gap-2 text-xs">
                <div className="w-20 shrink-0 text-muted-foreground">{d.subject}</div>
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full gradient-brand-bg" style={{ width: `${d.A}%` }} />
                </div>
                <span className="w-8 text-right font-medium">{d.A}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sprint velocity chart */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Sprint Velocity</h3>
            {!isLinear && <Link to={integrationsPath} className="text-xs text-brand-glow hover:underline">Connect Linear →</Link>}
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocity}>
                <XAxis dataKey="sprint" stroke="oklch(0.60 0.02 265)" fontSize={11} tickLine={false} />
                <YAxis stroke="oklch(0.60 0.02 265)" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" }} />
                <Bar dataKey="points" fill="oklch(0.66 0.20 265)" radius={[4, 4, 0, 0]} name="Story Points" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity feed */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-brand-glow" />
            <h3 className="font-display text-lg font-semibold">Activity Feed</h3>
            {liveGitHub && (
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">LIVE</span>
            )}
            {!isSlack && !isGithub && <Link to={integrationsPath} className="ml-auto text-xs text-brand-glow hover:underline">Connect tools →</Link>}
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {activityFeed.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] ${
                  item.status === "success" ? "bg-emerald-500/15 text-emerald-400" :
                  item.status === "warning" ? "bg-yellow-500/15 text-yellow-400" :
                  "bg-blue-500/15 text-blue-400"
                }`}>
                  {item.type === "pr" ? <GitPullRequest className="h-3 w-3" /> :
                   item.type === "slack" ? <Slack className="h-3 w-3" /> :
                   <Code className="h-3 w-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground/90 leading-relaxed">{item.text}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
