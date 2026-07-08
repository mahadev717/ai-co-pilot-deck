import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAppState } from "../hooks/use-app-state";
import { Sparkles, ArrowRight, Lock, Mail, User } from "lucide-react";
import { motion } from "motion/react";

export const Route = createFileRoute("/auth")({
  component: AuthComponent,
});

function AuthComponent() {
  const { login, isAuthenticated } = useAppState();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated && typeof window !== "undefined") {
    navigate({ to: "/dashboard" });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) return;

    setLoading(true);
    // Simulate loading/encryption delay
    await new Promise((resolve) => setTimeout(resolve, 1200));
    login(email, isSignUp ? name : email.split("@")[0]);
    setLoading(false);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Background neon glows */}
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full gradient-brand-bg blur-3xl opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass-strong relative z-10 w-full max-w-md rounded-3xl p-8 sm:p-10"
      >
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl gradient-brand-bg ring-glow">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight">
            {isSignUp ? "Create an account" : "Welcome back"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isSignUp
              ? "Sign up to start building your startup with AI"
              : "Sign in to access your AI co-founder OS"}
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="name">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                  <User className="h-4 w-4" />
                </span>
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
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="email"
                type="email"
                required
                placeholder="founder@startup.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-white/5 py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-primary/50 focus:bg-white/10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="password">
                Password
              </label>
              {!isSignUp && (
                <a href="#" className="text-xs text-brand-glow hover:underline">
                  Forgot?
                </a>
              )}
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-white/5 py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors focus:border-primary/50 focus:bg-white/10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl gradient-brand-bg py-2.5 text-sm font-medium text-primary-foreground ring-glow transition-transform hover:scale-[1.02] disabled:scale-100 disabled:opacity-50"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <>
                {isSignUp ? "Sign Up" : "Sign In"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode Link */}
        <div className="mt-6 text-center text-xs">
          <span className="text-muted-foreground">
            {isSignUp ? "Already have an account? " : "New to Copilot OS? "}
          </span>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-medium text-brand-glow hover:underline"
          >
            {isSignUp ? "Sign In" : "Create one free"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
