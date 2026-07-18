import { useState, type ComponentType, type FormEvent } from "react";
import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useAppState, type Integration } from "../../hooks/use-app-state";
import {
  getCredentialSpec,
  mergeWithEnvFallbacks,
} from "@/lib/integration-catalog";
import {
  Slack,
  Github,
  FileText,
  Users,
  CreditCard,
  Check,
  Zap,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  BarChart3,
  Bell,
  Layers,
  TrendingUp,
  Search,
  Mail,
  Calendar,
  Cloud,
  Figma,
  DollarSign,
  Activity,
  Megaphone,
  Twitter,
  BookOpen,
  HeartHandshake,
  Link2,
  X,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/dashboard/integrations")({
  component: IntegrationsManager,
});

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  stripe: CreditCard,
  quickbooks: DollarSign,
  github: Github,
  linear: TrendingUp,
  jira: Layers,
  figma: Figma,
  slack: Slack,
  notion: FileText,
  calendar: Calendar,
  aws: Cloud,
  pagerduty: Bell,
  hubspot: Users,
  gmail: Mail,
  calendly: BookOpen,
  zendesk: MessageSquare,
  intercom: HeartHandshake,
  "google-analytics": BarChart3,
  mixpanel: Activity,
  mailchimp: Megaphone,
  twitter: Twitter,
};

const categoryColors: Record<string, string> = {
  finance: "text-emerald-400 bg-emerald-500/10",
  engineering: "text-blue-400 bg-blue-500/10",
  design: "text-pink-400 bg-pink-500/10",
  sales: "text-purple-400 bg-purple-500/10",
  support: "text-orange-400 bg-orange-500/10",
  ops: "text-yellow-400 bg-yellow-500/10",
  infrastructure: "text-red-400 bg-red-500/10",
  analytics: "text-cyan-400 bg-cyan-500/10",
  marketing: "text-fuchsia-400 bg-fuchsia-500/10",
};

const categoryLabels: Record<string, string> = {
  finance: "Finance",
  engineering: "Engineering",
  design: "Design",
  sales: "CRM & Sales",
  support: "Support",
  ops: "Operations",
  infrastructure: "Infrastructure",
  analytics: "Analytics",
  marketing: "Marketing",
};

const CATEGORIES = [
  "all",
  "finance",
  "engineering",
  "ops",
  "sales",
  "support",
  "analytics",
  "marketing",
  "design",
  "infrastructure",
] as const;

function IntegrationCard({
  item,
  basePath,
  onConnect,
  onDisconnect,
  isBusy,
}: {
  item: Integration;
  basePath: "/dashboard" | "/employee";
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  isBusy: boolean;
}) {
  const Icon = iconMap[item.id] || Zap;
  const catColor = categoryColors[item.category] ?? "text-muted-foreground bg-white/5";
  const catLabel = categoryLabels[item.category] ?? item.category;
  const detailTo =
    basePath === "/employee"
      ? ("/employee/integrations/$id" as const)
      : ("/dashboard/integrations/$id" as const);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={`glass flex flex-col justify-between rounded-2xl p-5 transition-all duration-300 ${
        item.connected ? "ring-1 ring-primary/20 bg-white/[0.04]" : ""
      }`}
    >
      <div>
        <div className="flex items-center justify-between">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-brand-glow"
            style={{ color: item.color !== "#000000" ? item.color : undefined }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {item.connected ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                <Check className="h-3 w-3" /> Linked
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground">Not linked</span>
            )}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${catColor}`}>
              {catLabel}
            </span>
          </div>
        </div>

        <Link
          to={detailTo}
          params={{ id: item.id }}
          className="mt-4 block text-sm font-semibold hover:text-brand-glow"
        >
          {item.name}
        </Link>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
          {item.description}
        </p>
        {item.connected && item.accountLabel && (
          <p className="mt-2 truncate text-[10px] text-brand-glow/80">
            Account: {item.accountLabel}
          </p>
        )}
      </div>

      <div className="mt-5 border-t border-border/50 pt-4 flex items-center justify-between gap-2">
        <Link
          to={detailTo}
          params={{ id: item.id }}
          className="text-[10px] text-brand-glow hover:underline"
        >
          {item.connected ? "Open intelligence →" : "Preview analysis →"}
        </Link>

        {item.connected ? (
          <button
            id={`disconnect-${item.id}`}
            type="button"
            onClick={() => onDisconnect(item.id)}
            className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-1.5 text-[11px] font-medium text-destructive transition-colors hover:bg-destructive/15"
          >
            Disconnect
          </button>
        ) : (
          <button
            id={`connect-${item.id}`}
            type="button"
            onClick={() => onConnect(item.id)}
            disabled={isBusy || item.syncing}
            className="inline-flex items-center gap-1 rounded-lg gradient-brand-bg px-3 py-1.5 text-[11px] font-medium text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
          >
            {item.syncing ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Linking…
              </>
            ) : (
              <>
                Connect <ArrowRight className="h-3 w-3" />
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function IntegrationsManager() {
  const {
    user,
    integrations,
    connectIntegration,
    disconnectIntegration,
    connectAllIntegrations,
    getIntegrationCredentials,
  } = useAppState();

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const basePath: "/dashboard" | "/employee" = pathname.startsWith("/employee")
    ? "/employee"
    : "/dashboard";
  const detailTo =
    basePath === "/employee"
      ? ("/employee/integrations/$id" as const)
      : ("/dashboard/integrations/$id" as const);

  const [activeSyncId, setActiveSyncId] = useState<string | null>(null);
  const [syncStep, setSyncStep] = useState(0);
  const [linkTarget, setLinkTarget] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [connectingAll, setConnectingAll] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const openLinkForm = (id: string) => {
    const spec = getCredentialSpec(id);
    const existing = getIntegrationCredentials(id);
    const seeded: Record<string, string> = {};
    for (const field of spec.fields) {
      seeded[field.key] =
        existing[field.key] ??
        spec.envFallbacks?.[field.key] ??
        "";
    }
    setFormValues(seeded);
    setLinkTarget(id);
  };

  const runConnectAnimation = async (id: string, credentials: Record<string, string>) => {
    setActiveSyncId(id);
    setSyncStep(1);
    await new Promise((r) => setTimeout(r, 500));
    setSyncStep(2);
    await new Promise((r) => setTimeout(r, 600));
    setSyncStep(3);
    await new Promise((r) => setTimeout(r, 500));
    setSyncStep(4);
    await connectIntegration(id, credentials);
    setActiveSyncId(null);
    setSyncStep(0);
  };

  const submitLink = async (e: FormEvent) => {
    e.preventDefault();
    if (!linkTarget) return;
    const id = linkTarget;
    const credentials = mergeWithEnvFallbacks(id, formValues);
    setLinkTarget(null);
    await runConnectAnimation(id, credentials);
  };

  const linkWithoutKeys = async () => {
    if (!linkTarget) return;
    const id = linkTarget;
    setLinkTarget(null);
    await runConnectAnimation(id, {});
  };

  const handleConnectAll = async () => {
    setConnectingAll(true);
    try {
      await connectAllIntegrations();
    } finally {
      setConnectingAll(false);
    }
  };

  const syncSteps = [
    "Initiating secure connection…",
    "Linking tool to your user account…",
    "Saving credentials to your workspace…",
    "Syncing schemas and metadata…",
    "Activating agent listeners…",
  ];

  const connectedCount = integrations.filter((i) => i.connected).length;
  const pendingCount = integrations.length - connectedCount;

  const filtered = integrations.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === "all" || item.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const linkSpec = linkTarget ? getCredentialSpec(linkTarget) : null;
  const linkName = integrations.find((i) => i.id === linkTarget)?.name;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Integrations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Link each tool to <span className="text-foreground">{user?.email ?? "your account"}</span>.
            Connections and credentials stay with this user.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-border bg-white/5 px-4 py-1.5 text-sm">
            <span className="font-semibold text-brand-glow">{connectedCount}</span>
            <span className="text-muted-foreground">/ {integrations.length} linked</span>
          </div>
          {pendingCount > 0 && (
            <button
              type="button"
              disabled={connectingAll || activeSyncId !== null}
              onClick={() => void handleConnectAll()}
              className="inline-flex items-center gap-1.5 rounded-full gradient-brand-bg px-4 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
            >
              {connectingAll ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Link2 className="h-3.5 w-3.5" />
              )}
              {connectingAll ? "Linking…" : `Link all (${pendingCount})`}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-brand/20 bg-brand/5 px-4 py-3 text-xs text-muted-foreground">
        Presentation tip: click <span className="text-foreground">Link all</span> to connect every
        tool with dummy intelligence (no API keys needed). Open any card for analysis — GitHub
        includes repos, code, and AI review.
      </div>

      {connectedCount > 0 && (
        <div className="glass space-y-3 rounded-2xl p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Connected ({connectedCount})</h2>
            <span className="text-[10px] text-muted-foreground">
              Click any tool for live analysis
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {integrations
              .filter((i) => i.connected)
              .map((i) => {
                const Icon = iconMap[i.id] || Zap;
                return (
                  <Link
                    key={i.id}
                    to={detailTo}
                    params={{ id: i.id }}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 transition-colors hover:bg-emerald-500/20"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {i.name}
                    <ArrowRight className="h-3 w-3 opacity-60" />
                  </Link>
                );
              })}
          </div>
        </div>
      )}

      <div className="glass rounded-2xl p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Account coverage</span>
          <span className="text-xs font-semibold">
            {Math.round((connectedCount / integrations.length) * 100)}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full rounded-full gradient-brand-bg"
            initial={{ width: 0 }}
            animate={{ width: `${(connectedCount / integrations.length) * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="integrations-search"
            type="text"
            placeholder="Search integrations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-white/5 py-2 pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-primary/50 focus:bg-white/10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              id={`filter-${cat}`}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                activeCategory === cat
                  ? "gradient-brand-bg text-primary-foreground"
                  : "border border-border bg-white/5 text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat === "all" ? `All (${integrations.length})` : categoryLabels[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence>
          {filtered.map((item) => (
            <IntegrationCard
              key={item.id}
              item={item}
              basePath={basePath}
              onConnect={openLinkForm}
              onDisconnect={(id) => void disconnectIntegration(id)}
              isBusy={activeSyncId !== null || connectingAll}
            />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border/50 py-12 text-center text-sm text-muted-foreground">
            No integrations match your search.
          </div>
        )}
      </motion.div>

      {/* Credential / account link modal */}
      <AnimatePresence>
        {linkTarget && linkSpec && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
            <motion.form
              onSubmit={(e) => void submitLink(e)}
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="glass-strong w-full max-w-md rounded-3xl p-6 space-y-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-display text-lg font-semibold">{linkSpec.title}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">{linkSpec.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setLinkTarget(null)}
                  className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                {linkSpec.fields.map((field) => (
                  <label key={field.key} className="block space-y-1.5">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {field.label}
                      {field.hint ? ` · ${field.hint}` : ""}
                    </span>
                    <input
                      type={field.type ?? "text"}
                      value={formValues[field.key] ?? ""}
                      onChange={(e) =>
                        setFormValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      placeholder={field.placeholder}
                      autoComplete="off"
                      className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm outline-none focus:border-primary/50"
                    />
                  </label>
                ))}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => void linkWithoutKeys()}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Link without keys
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl gradient-brand-bg px-4 py-2 text-xs font-medium text-primary-foreground"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  Link {linkName} to account
                </button>
              </div>

              <p className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Saved only for {user?.email ?? "this user"} · RLS protected in Supabase
              </p>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Syncing Modal */}
      <AnimatePresence>
        {activeSyncId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass-strong w-full max-w-sm rounded-3xl p-8 text-center space-y-6"
            >
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl gradient-brand-bg">
                {(() => {
                  const SyncIcon = iconMap[activeSyncId] || Zap;
                  return <SyncIcon className="h-8 w-8 text-primary-foreground" />;
                })()}
                <div className="absolute inset-0 rounded-2xl gradient-brand-bg animate-pulse opacity-40" />
              </div>

              <div className="space-y-1">
                <h4 className="font-display text-lg font-semibold">
                  Linking {integrations.find((i) => i.id === activeSyncId)?.name}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Attaching this integration to {user?.email ?? "your account"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full gradient-brand-bg"
                    initial={{ width: "0%" }}
                    animate={{ width: `${(syncStep / 4) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground animate-pulse min-h-[16px]">
                  {syncSteps[syncStep] ?? "Connecting…"}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
