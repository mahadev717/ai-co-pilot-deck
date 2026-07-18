import { createFileRoute } from "@tanstack/react-router";
import { useAppState } from "../../hooks/use-app-state";
import {
  Bot, Terminal, ToggleLeft, ToggleRight, Zap, TrendingUp,
  DollarSign, Code2, Users, HeartHandshake, Brain, Settings2,
  Loader2, Play,
} from "lucide-react";
import { motion } from "motion/react";
import { activeEngine } from "@/lib/gemini";

export const Route = createFileRoute("/dashboard/agents")({
  component: AgentsManager,
});

const agentIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  marketing: TrendingUp,
  finance: DollarSign,
  engineering: Code2,
  sales: Users,
  support: HeartHandshake,
  intelligence: Brain,
  ops: Settings2,
};

const agentColors: Record<string, string> = {
  marketing: "from-pink-500/20 to-rose-500/10 border-pink-500/20",
  finance: "from-emerald-500/20 to-green-500/10 border-emerald-500/20",
  engineering: "from-blue-500/20 to-cyan-500/10 border-blue-500/20",
  sales: "from-purple-500/20 to-violet-500/10 border-purple-500/20",
  support: "from-orange-500/20 to-amber-500/10 border-orange-500/20",
  intelligence: "from-brand/20 to-brand-2/10 border-brand/20",
  ops: "from-yellow-500/20 to-lime-500/10 border-yellow-500/20",
};

const agentIconColors: Record<string, string> = {
  marketing: "text-pink-400",
  finance: "text-emerald-400",
  engineering: "text-blue-400",
  sales: "text-purple-400",
  support: "text-orange-400",
  intelligence: "text-brand-glow",
  ops: "text-yellow-400",
};

export function AgentsManager() {
  const { agents, toggleAgent, runAgent, runAllAgents, runningAgents, notifications } = useAppState();

  const activeCount = agents.filter((a) => a.active).length;
  const totalTasks = agents.reduce((s, a) => s + a.tasksCompleted, 0);
  const alertCount = notifications.filter((n) => !n.read && (n.type === "warning" || n.type === "error")).length;
  const anyRunning = Object.values(runningAgents).some(Boolean);
  const engine = activeEngine();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Autonomous AI Agents</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Specialized agents monitor your business 24/7 and execute operations — powered by{" "}
            {engine === "openai" ? "OpenAI GPT-4o Mini" : engine === "gemini" ? "Gemini" : "local mock"}.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="glass rounded-full px-4 py-1.5 text-xs">
            <span className="font-bold text-emerald-400">{activeCount}</span>
            <span className="text-muted-foreground"> / {agents.length} active</span>
          </div>
          <div className="glass rounded-full px-4 py-1.5 text-xs">
            <span className="font-bold text-brand-glow">{totalTasks}</span>
            <span className="text-muted-foreground"> tasks completed</span>
          </div>
          <button
            type="button"
            disabled={anyRunning || activeCount === 0}
            onClick={() => void runAllAgents()}
            className="flex items-center gap-1.5 rounded-full gradient-brand-bg px-4 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50 hover:scale-[1.02] transition-transform"
          >
            {anyRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            {anyRunning ? "Running…" : "Run All Active"}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active Agents", value: activeCount, sub: "Monitoring 24/7", color: "text-emerald-400" },
          { label: "Tasks Completed", value: totalTasks, sub: "Lifetime cycles", color: "text-brand-glow" },
          { label: "Open Alerts", value: alertCount, sub: "Actionable insights", color: "text-yellow-400" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4 text-center">
            <p className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="mt-1 text-xs font-medium">{s.label}</p>
            <p className="text-[10px] text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Agents grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {agents.map((agent) => {
          const Icon = agentIcons[agent.category] || Bot;
          const gradientCls = agentColors[agent.category] || "from-white/5 to-white/0 border-border";
          const iconCls = agentIconColors[agent.category] || "text-muted-foreground";
          const isRunning = Boolean(runningAgents[agent.id]);

          return (
            <motion.div
              key={agent.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative flex flex-col justify-between rounded-2xl border bg-gradient-to-br p-6 transition-all duration-300 ${gradientCls} ${
                agent.active ? "opacity-100" : "opacity-70"
              }`}
            >
              {/* Active pulse dot */}
              {agent.active && !isRunning && (
                <span className="absolute right-5 top-5 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
              )}
              {isRunning && (
                <span className="absolute right-5 top-5">
                  <Loader2 className="h-4 w-4 animate-spin text-brand-glow" />
                </span>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 ${iconCls}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{agent.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium ${
                        isRunning
                          ? "bg-brand/15 text-brand-glow"
                          : agent.active
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-white/5 text-muted-foreground"
                      }`}>
                        {isRunning ? (
                          <>Running</>
                        ) : agent.active ? (
                          <><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Active</>
                        ) : (
                          "Paused"
                        )}
                      </span>
                      {agent.tasksCompleted > 0 && (
                        <span className="text-[9px] text-muted-foreground">
                          {agent.tasksCompleted} tasks done
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleAgent(agent.id)}
                    className="ml-auto text-muted-foreground transition-colors hover:text-foreground"
                    title={agent.active ? "Pause Agent" : "Activate Agent"}
                    disabled={isRunning}
                  >
                    {agent.active ? (
                      <ToggleRight className="h-9 w-9 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="h-9 w-9 text-muted-foreground" />
                    )}
                  </button>
                </div>

                <p className="text-xs leading-relaxed text-muted-foreground">{agent.description}</p>
              </div>

              {/* Log console */}
              <div className="mt-5 border-t border-white/10 pt-4">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                  <Terminal className="h-3 w-3" /> Last Action
                </div>
                <div className="rounded-lg bg-black/30 px-3 py-2.5 font-mono text-[10px] text-brand-glow border border-white/5 leading-relaxed min-h-[2.5rem]">
                  {agent.recentAction}
                </div>
              </div>

              {/* Action button for active agents */}
              {agent.active && (
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={() => void runAgent(agent.id)}
                  className="mt-4 flex items-center gap-1.5 self-end rounded-lg gradient-brand-bg px-3 py-1.5 text-[11px] font-medium text-primary-foreground hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:hover:scale-100"
                >
                  {isRunning ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Running…</>
                  ) : (
                    <><Zap className="h-3.5 w-3.5" /> Run Now</>
                  )}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
