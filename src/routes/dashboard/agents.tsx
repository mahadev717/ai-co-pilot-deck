import { createFileRoute } from "@tanstack/react-router";
import { useAppState } from "../../hooks/use-app-state";
import {
  Sparkles,
  Play,
  Pause,
  Bot,
  Terminal,
  Activity,
  ToggleLeft,
  ToggleRight,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/agents")({
  component: AgentsManager,
});

function AgentsManager() {
  const { agents, toggleAgent } = useAppState();

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Autonomous AI Agents</h1>
        <p className="text-sm text-muted-foreground">
          Deploy and configure specialized AI agents that execute operations, analyze metrics, and
          run tasks in the background.
        </p>
      </div>

      {/* Agents List */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {agents.map((agent) => {
          return (
            <div
              key={agent.id}
              className={`glass flex flex-col justify-between rounded-2xl p-6 transition-all duration-300 ${
                agent.active ? "ring-1 ring-primary/25 bg-white/[0.04]" : "opacity-80"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        agent.active
                          ? "gradient-brand-bg text-primary-foreground"
                          : "bg-white/5 text-muted-foreground"
                      }`}
                    >
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{agent.name}</h3>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-medium ${
                          agent.active
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-white/5 text-muted-foreground"
                        }`}
                      >
                        {agent.active ? "Active Monitor" : "Paused"}
                      </span>
                    </div>
                  </div>

                  {/* Toggle button */}
                  <button
                    onClick={() => toggleAgent(agent.id)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    title={agent.active ? "Pause Agent" : "Activate Agent"}
                  >
                    {agent.active ? (
                      <ToggleRight className="h-9 w-9 text-brand-glow" />
                    ) : (
                      <ToggleLeft className="h-9 w-9 text-muted-foreground" />
                    )}
                  </button>
                </div>

                <p className="text-xs leading-relaxed text-muted-foreground">{agent.description}</p>
              </div>

              {/* Agent Log Console */}
              <div className="mt-6 border-t border-border/50 pt-4">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                  <Terminal className="h-3 w-3" /> Recent Activity Log
                </div>
                <div className="rounded-lg bg-black/30 p-2.5 font-mono text-[10px] text-brand-glow border border-border/30">
                  {agent.recentAction}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
