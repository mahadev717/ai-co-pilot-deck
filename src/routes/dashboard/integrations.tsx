import { useState, type ComponentType } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAppState } from "../../hooks/use-app-state";
import {
  Slack,
  Github,
  FileText,
  Mail,
  Users,
  CreditCard,
  Check,
  Zap,
  ArrowRight,
  ShieldCheck,
  X,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/dashboard/integrations")({
  component: IntegrationsManager,
});

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  stripe: CreditCard,
  github: Github,
  slack: Slack,
  notion: FileText,
  hubspot: Users,
  zendesk: MessageSquare,
};

function IntegrationsManager() {
  const { integrations, connectIntegration, disconnectIntegration } = useAppState();
  const [activeSyncId, setActiveSyncId] = useState<string | null>(null);
  const [syncStep, setSyncStep] = useState(0);

  const handleConnect = async (id: string) => {
    setActiveSyncId(id);

    // Simulate multi-step onboarding synchronization logs
    setSyncStep(1); // Authenticating
    await new Promise((r) => setTimeout(r, 600));
    setSyncStep(2); // Fetching metadata
    await new Promise((r) => setTimeout(r, 800));
    setSyncStep(3); // Vectorizing docs
    await new Promise((r) => setTimeout(r, 800));
    setSyncStep(4); // Completing setup
    await new Promise((r) => setTimeout(r, 500));

    await connectIntegration(id);
    setActiveSyncId(null);
    setSyncStep(0);
  };

  const getSyncStepText = () => {
    switch (syncStep) {
      case 1:
        return "Performing secure OAuth handshake...";
      case 2:
        return "Downloading schemas and metadata records...";
      case 3:
        return "Vectorizing documents for AI knowledge base...";
      case 4:
        return "Configuring autonomous agent listeners...";
      default:
        return "Connecting...";
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Integrations Portal</h1>
        <p className="text-sm text-muted-foreground">
          Securely link your business tools. Startup Copilot OS encrypts data end-to-end and never
          trains public models on your code.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((item) => {
          const Icon = iconMap[item.id] || Zap;
          return (
            <div
              key={item.id}
              className={`glass flex flex-col justify-between rounded-2xl p-6 transition-all duration-300 ${
                item.connected ? "ring-1 ring-primary/20" : ""
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-brand-glow">
                    <Icon className="h-6 w-6" />
                  </div>
                  {item.connected ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
                      <Check className="h-3.5 w-3.5" /> Live Sync
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Offline</span>
                  )}
                </div>

                <h3 className="mt-5 text-lg font-semibold">{item.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 border-t border-border/50 pt-4 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  {item.connected ? `Synced: ${item.lastSynced}` : "OAuth 2.0 Security"}
                </span>

                {item.connected ? (
                  <button
                    onClick={() => disconnectIntegration(item.id)}
                    className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/15"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(item.id)}
                    disabled={activeSyncId !== null}
                    className="inline-flex items-center gap-1 rounded-lg gradient-brand-bg px-3.5 py-1.5 text-xs font-medium text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
                  >
                    Connect <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Syncing Overlay Modal */}
      <AnimatePresence>
        {activeSyncId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-strong w-full max-w-sm rounded-3xl p-6 text-center space-y-6"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 mx-auto text-brand-glow animate-pulse">
                {(() => {
                  const SyncIcon = iconMap[activeSyncId] || Zap;
                  return <SyncIcon className="h-7 w-7" />;
                })()}
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-lg">Linking Accounts</h4>
                <p className="text-xs text-muted-foreground">
                  Secure connection via Startup Copilot OS API proxy
                </p>
              </div>

              {/* Progress Simulation */}
              <div className="space-y-2">
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full gradient-brand-bg rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${(syncStep / 4) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="text-[11px] text-muted-foreground animate-pulse min-h-[16px]">
                  {getSyncStepText()}
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>AES-256 Key Encryption Active</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
