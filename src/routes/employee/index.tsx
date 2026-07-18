import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppState } from "../../hooks/use-app-state";
import {
  CalendarDays,
  Users,
  Bot,
  MessageSquare,
  Network,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";

export const Route = createFileRoute("/employee/")({
  component: EmployeeOverview,
});

function EmployeeOverview() {
  const { user, leaveRequests, teamMembers, agents, integrations, notifications } = useAppState();

  const myLeaves = leaveRequests.filter(
    (l) => l.employeeEmail.toLowerCase() === (user?.email ?? "").toLowerCase(),
  );
  const myPending = myLeaves.filter((l) => l.status === "pending").length;
  const myApproved = myLeaves.filter((l) => l.status === "approved").length;
  const activeAgents = agents.filter((a) => a.active).length;
  const connectedTools = integrations.filter((i) => i.connected).length;

  const shortcuts = [
    {
      title: "Request leave",
      desc: "Submit holiday or sick leave for manager approval",
      href: "/employee/leaves",
      icon: CalendarDays,
      color: "text-yellow-400",
    },
    {
      title: "AI Assistant",
      desc: "Ask about work, policies, or team context",
      href: "/employee/chat",
      icon: MessageSquare,
      color: "text-brand-glow",
    },
    {
      title: "Team activity",
      desc: "See what teammates are shipping",
      href: "/employee/team",
      icon: Users,
      color: "text-blue-400",
    },
    {
      title: "AI Agents",
      desc: "Run workplace agents for your role",
      href: "/employee/agents",
      icon: Bot,
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-brand-glow/80">Employee portal</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Welcome back, {user?.name?.split(" ")[0] ?? "teammate"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Request leave, stay aligned with the team, and use AI tools — same Copilot OS theme.
          </p>
        </div>
        <Link
          to="/employee/leaves"
          className="inline-flex items-center gap-1.5 rounded-full gradient-brand-bg px-4 py-2 text-xs font-medium text-primary-foreground"
        >
          <CalendarDays className="h-3.5 w-3.5" />
          Request leave
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "My pending leave", value: myPending, icon: Clock, color: "text-yellow-400" },
          { label: "Approved leave", value: myApproved, icon: CheckCircle, color: "text-emerald-400" },
          { label: "Active agents", value: activeAgents, icon: Bot, color: "text-brand-glow" },
          { label: "Connected tools", value: connectedTools, icon: Network, color: "text-blue-400" },
        ].map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className={`mt-2 font-display text-3xl font-bold ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {shortcuts.map((s) => (
          <Link
            key={s.href}
            to={s.href as "/employee/leaves"}
            className="group glass flex items-start justify-between gap-4 rounded-2xl p-5 transition-colors hover:bg-white/[0.04]"
          >
            <div className="flex gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">{s.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
              </div>
            </div>
            <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-brand-glow" />
            <h3 className="text-sm font-semibold">My recent leave</h3>
          </div>
          {myLeaves.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No leave requests yet.{" "}
              <Link to="/employee/leaves" className="text-brand-glow hover:underline">
                Submit your first request →
              </Link>
            </p>
          ) : (
            <div className="space-y-2">
              {myLeaves.slice(0, 4).map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between rounded-xl border border-border/40 bg-white/[0.02] px-3 py-2.5 text-xs"
                >
                  <div>
                    <p className="font-medium capitalize">
                      {l.leaveType} · {l.startDate} → {l.endDate}
                    </p>
                    <p className="mt-0.5 text-muted-foreground">{l.days} day{l.days === 1 ? "" : "s"}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                      l.status === "pending"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : l.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {l.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-semibold">Team pulse</h3>
          </div>
          <div className="space-y-2">
            {teamMembers.slice(0, 5).map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-xl border border-border/40 bg-white/[0.02] px-3 py-2.5 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand/40 to-brand-2/40 text-[10px] font-semibold">
                    {m.avatar}
                  </div>
                  <div>
                    <p className="font-medium">{m.name}</p>
                    <p className="text-muted-foreground">{m.role}</p>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground">{m.lastActive}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {notifications[0] && (
        <div className="flex items-start gap-3 rounded-2xl border border-brand/20 bg-brand/5 px-4 py-3 text-xs">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-glow" />
          <div>
            <p className="font-medium">Latest update</p>
            <p className="mt-0.5 text-muted-foreground">{notifications[0].title}</p>
          </div>
        </div>
      )}
    </div>
  );
}
