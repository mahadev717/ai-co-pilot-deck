import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useAppState } from "../../hooks/use-app-state";
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
  CalendarDays,
  Users,
  Bot,
  Briefcase,
} from "lucide-react";
import { motion } from "motion/react";

export const Route = createFileRoute("/employee/auth")({
  component: EmployeeAuthPage,
});

const FEATURES = [
  {
    icon: CalendarDays,
    title: "Request leave in seconds",
    desc: "Submit holidays and sick leave — track approval status live.",
  },
  {
    icon: Users,
    title: "See team activity",
    desc: "Stay aligned with teammates without founder-only finance views.",
  },
  {
    icon: Bot,
    title: "AI workplace assistant",
    desc: "Ask about policies, leave balance context, and day-to-day work.",
  },
];

function EmployeeAuthPage() {
  const { login, register, enterPresentationDemo, isAuthenticated, authReady, user, logout } =
    useAppState();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("employee@copilot.ai");
  const [name, setName] = useState("Alex Employee");
  const [password, setPassword] = useState("demo1234");
  const [showPassword, setShowPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady) return;
    if (isAuthenticated && user?.role === "employee") {
      navigate({ to: "/employee" });
    }
    if (isAuthenticated && user?.role === "founder") {
      navigate({ to: "/dashboard" });
    }
  }, [authReady, isAuthenticated, user?.role, navigate]);

  const handleDemo = async () => {
    setLoading(true);
    setError(null);
    setEmail("employee@copilot.ai");
    setPassword("demo1234");
    setName("Alex Employee");
    try {
      if (isAuthenticated && user?.role !== "employee") {
        await logout();
      }
      const result = await enterPresentationDemo("employee");
      if (!result.ok) {
        setError(result.error);
        setLoading(false);
        return;
      }
      window.location.assign("/employee");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Demo login failed");
      setLoading(false);
    }
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
    // If a founder session is active, clear it first
    if (isAuthenticated && user?.role !== "employee") {
      await logout();
    }
    const result = isSignUp
      ? await register(email, name.trim(), password, "employee")
      : await login(email, password, "employee");
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
    navigate({ to: "/employee" });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-20" />
      <div className="pointer-events-none fixed -top-24 right-0 h-[28rem] w-[28rem] rounded-full bg-brand/15 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-0 h-[28rem] w-[28rem] rounded-full bg-brand-2/15 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen max-w-6xl lg:grid-cols-2">
        <div className="hidden flex-col justify-between p-10 lg:flex">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand-bg">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-semibold">
              Copilot <span className="gradient-text">Employee</span>
            </span>
          </Link>

          <div className="space-y-8">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[11px] font-medium text-brand-glow">
                <Briefcase className="h-3.5 w-3.5" /> Employee workplace portal
              </div>
              <h1 className="font-display text-4xl font-semibold tracking-tight leading-tight">
                Your leave, team & AI tools —{" "}
                <span className="gradient-text">without finance clutter</span>
              </h1>
              <p className="mt-4 max-w-md text-sm text-muted-foreground">
                Request holidays, track approvals, chat with the AI assistant, and stay on top of team activity.
              </p>
            </div>
            <div className="space-y-4">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex gap-3 rounded-2xl border border-border/50 bg-white/[0.02] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand-glow">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{f.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Founder / Admin?{" "}
            <Link to="/auth" className="text-brand-glow hover:underline">
              Admin Login →
            </Link>
            {" · "}
            <Link to="/signin" className="hover:underline">
              All options
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong w-full max-w-md rounded-3xl p-8"
          >
            <div className="mb-6 lg:hidden">
              <Link to="/" className="mb-6 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand-bg">
                  <Briefcase className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-display font-semibold">Employee Portal</span>
              </Link>
            </div>

            <h2 className="font-display text-2xl font-semibold">
              {isSignUp ? "Create employee account" : "Employee Login"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isSignUp
                ? "Use your work email. Admin (company owner) emails cannot register here."
                : "Workplace access only — Admin/company-owner emails cannot sign in here."}
            </p>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
                <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {success}
              </div>
            )}

            <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
              {isSignUp && (
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-medium text-muted-foreground">Full name</span>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-border bg-white/5 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary/50"
                      placeholder="Alex Chen"
                    />
                  </div>
                </label>
              )}
              <label className="block space-y-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">Work email</span>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white/5 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary/50"
                    placeholder="you@company.com"
                  />
                </div>
              </label>
              <label className="block space-y-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">Password</span>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white/5 py-2.5 pl-10 pr-10 text-sm outline-none focus:border-primary/50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-brand-bg py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {loading ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <button
              type="button"
              onClick={() => void handleDemo()}
              disabled={loading}
              className="mt-3 w-full rounded-xl border border-border py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Enter as Demo Employee
            </button>
            <p className="mt-2 text-center font-mono text-[10px] text-muted-foreground">
              employee@copilot.ai · demo1234
            </p>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              {isSignUp ? "Already have an account?" : "New here?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="font-medium text-brand-glow hover:underline"
              >
                {isSignUp ? "Sign in" : "Create employee account"}
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
