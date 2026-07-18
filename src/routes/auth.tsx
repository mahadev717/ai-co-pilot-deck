import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useAppState } from "../hooks/use-app-state";
import { getSupabaseConfigStatus } from "@/lib/supabase";
import { checkSupabaseBackend } from "@/lib/db-api";
import {
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
  TrendingUp,
  Bot,
  Network,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

export const Route = createFileRoute("/auth")({
  component: AuthComponent,
});

function PasswordStrength({ password }: { password: string }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const colors = ["bg-destructive", "bg-orange-500", "bg-yellow-500", "bg-emerald-500"];
  const labels = ["Too short", "Weak", "Good", "Strong"];

  if (!password) return null;
  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i < score ? colors[score - 1] : "bg-white/10"
            }`}
          />
        ))}
      </div>
      <p className={`text-[10px] ${score < 2 ? "text-destructive" : score < 3 ? "text-yellow-500" : "text-emerald-400"}`}>
        {labels[score - 1] ?? "Too short"}
      </p>
    </div>
  );
}

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Real-time Business Intelligence",
    desc: "Monitor MRR, churn risk, and customer health — all in one place.",
  },
  {
    icon: Network,
    title: "20+ Integrations",
    desc: "Connect Stripe, GitHub, Slack, Linear, and more in seconds.",
  },
  {
    icon: Bot,
    title: "Autonomous AI Agents",
    desc: "Agents monitor your business 24/7 and execute tasks on your behalf.",
  },
  {
    icon: ShieldCheck,
    title: "Predict Problems Early",
    desc: "Get alerts on churn signals, security vulnerabilities, and revenue risks.",
  },
];

function AuthComponent() {
  const { login, register, enterPresentationDemo, isAuthenticated, authReady, authBackend, user } =
    useAppState();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("admin@copilot.ai");
  const [name, setName] = useState("Demo Admin");
  const [password, setPassword] = useState("demo1234");
  const [showPassword, setShowPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [backendMsg, setBackendMsg] = useState<string | null>(null);
  const configStatus = getSupabaseConfigStatus();

  useEffect(() => {
    if (!authReady || !isAuthenticated) return;
    if (user?.role === "employee") navigate({ to: "/employee" });
    else navigate({ to: "/dashboard" });
  }, [isAuthenticated, authReady, user?.role, navigate]);

  useEffect(() => {
    void checkSupabaseBackend()
      .then((res) => {
        if (!res.ok) setBackendMsg(res.message);
        else if (!("schemaReady" in res) || !res.schemaReady) setBackendMsg(res.message);
        else setBackendMsg(null);
      })
      .catch(() => {});
  }, []);

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    setEmail("admin@copilot.ai");
    setPassword("demo1234");
    setName("Demo Admin");
    const result = await enterPresentationDemo("founder");
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate({ to: "/dashboard" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password || (isSignUp && !name)) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    const result = isSignUp
      ? await register(email, name.trim(), password, "founder")
      : await login(email, password, "founder");

    setLoading(false);

    if (!result.ok) {
      if (result.needsEmailConfirm) {
        setSuccess(result.error);
        setIsSignUp(false);
        setPassword("");
        return;
      }
      setError(result.error);
      return;
    }

    navigate({ to: "/dashboard" });
  };

  const toggleMode = () => {
    setIsSignUp((v) => !v);
    setError(null);
    setSuccess(null);
    if (!isSignUp) {
      setPassword("");
    } else {
      setEmail("admin@copilot.ai");
      setPassword("demo1234");
      setName("Demo Admin");
    }
  };

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Loading auth…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* ── Left panel — feature showcase (desktop only) ── */}
      <div className="relative hidden lg:flex lg:w-[52%] flex-col justify-between overflow-hidden border-r border-border bg-card/20 p-12">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />
        <div className="pointer-events-none absolute -top-40 -left-20 h-[40rem] w-[40rem] rounded-full bg-brand/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[25rem] w-[25rem] rounded-full bg-brand-2/10 blur-3xl" />

        {/* Logo */}
        <Link to="/" className="relative flex items-center gap-2.5 w-fit">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand-bg ring-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">
            Startup Copilot <span className="gradient-text">OS</span>
          </span>
        </Link>

        {/* Main pitch */}
        <div className="relative space-y-10">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-glow">
              Your AI Co-founder
            </p>
            <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight">
              One platform for every business decision.
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              Connect your tools, let AI agents monitor your business around the clock,
              and make faster decisions with live intelligence — not guesswork.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
                className="flex items-start gap-3.5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-brand-glow">
                  <f.icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{f.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Live stats strip */}
          <div className="flex items-center gap-6 rounded-2xl border border-border/50 bg-white/[0.02] px-5 py-4">
            {[
              { label: "Founders using Copilot OS", value: "2,400+" },
              { label: "Avg. time saved / week", value: "6.3 hrs" },
              { label: "Business Health improvement", value: "+34%" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-xl font-bold gradient-text">{s.value}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <p className="relative text-xs text-muted-foreground">
          "The first operating system built for startup founders." — Product Hunt #1 of the day
        </p>
      </div>

      {/* ── Right panel — auth form ── */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full gradient-brand-bg blur-3xl opacity-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-sm"
        >
          {/* Mobile logo */}
          <Link to="/" className="mb-8 flex lg:hidden items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-brand-bg">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold">Startup Copilot OS</span>
          </Link>

          <div className="mb-8 space-y-1">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              {isSignUp ? "Create admin account" : "Admin Login"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isSignUp
                ? "Create the company owner account. Employee emails cannot be used here."
                : "Admin is the company owner. Employee accounts cannot sign in here."}
            </p>
            <p className="pt-1 text-[10px] text-muted-foreground/80">
              {authBackend === "supabase" ? (
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Supabase Auth · cloud sync enabled
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                  Local mode · waiting for VITE_SUPABASE_URL
                </span>
              )}
            </p>
          </div>

          {!configStatus.hasUrl && (
            <div className="mb-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2.5 text-xs text-yellow-200">
              <p className="font-semibold">Supabase Project URL required</p>
              <p className="mt-1 text-yellow-200/80">
                You added API keys, but <code className="text-yellow-100">VITE_SUPABASE_URL</code> must be your project URL
                (e.g. <code className="text-yellow-100">https://xxxx.supabase.co</code>) from Dashboard → Project Settings → API.
              </p>
              {backendMsg && <p className="mt-1.5 text-yellow-200/70">{backendMsg}</p>}
            </div>
          )}

          {configStatus.hasUrl && backendMsg && (
            <div className="mb-4 rounded-xl border border-brand-glow/30 bg-brand/10 px-3 py-2.5 text-xs text-brand-glow">
              {backendMsg}
            </div>
          )}

          {/* ── ONE-CLICK DEMO ADMIN ── */}
          <>
            <button
              id="demo-login-btn"
              type="button"
              onClick={() => void handleDemoLogin()}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-brand-glow/40 bg-brand/10 py-3 text-sm font-semibold text-brand-glow transition-all hover:scale-[1.02] hover:border-brand-glow/70 hover:bg-brand/20 disabled:scale-100 disabled:opacity-50"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-glow border-t-transparent" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              Enter as Demo Admin
            </button>

            <div className="mt-3 rounded-xl border border-border/60 bg-white/[0.03] px-3 py-2.5 text-[11px] text-muted-foreground">
              <p className="font-medium text-foreground/90">Dummy admin login (presentation)</p>
              <p className="mt-1 font-mono text-[10px]">
                Email: <span className="text-brand-glow">admin@copilot.ai</span>
                <span className="mx-2 text-border">·</span>
                Password: <span className="text-brand-glow">demo1234</span>
              </p>
              <p className="mt-1 text-[10px]">
                One click opens the dashboard with all 20 integrations pre-connected.
              </p>
            </div>

            <div className="relative my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-border/50" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                or sign in manually
              </span>
              <div className="h-px flex-1 bg-border/50" />
            </div>
          </>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Steve Jobs"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white/5 py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-primary/50 focus:bg-white/10"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="founder@startup.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-white/5 py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-primary/50 focus:bg-white/10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-white/5 py-2.5 pl-10 pr-10 text-sm text-foreground outline-none transition-colors focus:border-primary/50 focus:bg-white/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {isSignUp && <PasswordStrength password={password} />}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-400">
                <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              id="auth-submit-btn"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl gradient-brand-bg py-3 text-sm font-semibold text-primary-foreground ring-glow transition-transform hover:scale-[1.02] disabled:scale-100 disabled:opacity-50"
            >
              {loading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <>
                  {isSignUp ? "Create Account" : "Sign In"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo hint */}
          {!isSignUp && (
            <div className="mt-4 rounded-xl border border-border/50 bg-white/[0.02] px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="h-3.5 w-3.5 text-brand-glow shrink-0" />
                <span>
                  <strong className="text-foreground">First time?</strong> Sign up with any email and password — no real credentials needed for the demo.
                </span>
              </div>
            </div>
          )}

          <div className="mt-6 text-center text-xs">
            <span className="text-muted-foreground">
              {isSignUp ? "Already have an account? " : "New to Copilot OS? "}
            </span>
            <button
              id="auth-toggle-btn"
              type="button"
              onClick={toggleMode}
              className="font-medium text-brand-glow hover:underline"
            >
              {isSignUp ? "Sign In" : "Create one free"}
            </button>
          </div>

          <div className="mt-4 text-center text-[11px] text-muted-foreground">
            <Link to="/signin" className="hover:text-foreground">← All sign-in options</Link>
            <span className="text-border">·</span>
            <Link to="/employee/auth" className="hover:text-brand-glow">Employee Login →</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
