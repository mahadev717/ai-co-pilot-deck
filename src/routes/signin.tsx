import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAppState } from "../hooks/use-app-state";
import {
  Sparkles,
  Shield,
  Briefcase,
  ArrowRight,
  Building2,
  Users,
  RotateCcw,
} from "lucide-react";
import { motion } from "motion/react";

export const Route = createFileRoute("/signin")({
  component: SignInChooser,
});

function SignInChooser() {
  const { isAuthenticated, authReady, user, resetAllAccounts } = useAppState();
  const navigate = useNavigate();
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady || !isAuthenticated) return;
    navigate({ to: user?.role === "employee" ? "/employee" : "/dashboard" });
  }, [authReady, isAuthenticated, user?.role, navigate]);

  async function handleResetAccounts() {
    if (resetting) return;
    const ok = window.confirm(
      "Delete all registered Admin and Employee emails so you can sign up fresh?",
    );
    if (!ok) return;
    setResetting(true);
    setResetMsg(null);
    try {
      const result = await resetAllAccounts();
      if (result.ok) {
        setResetMsg(
          result.deleted > 0
            ? `Cleared ${result.deleted} cloud account(s). You can register with any email again.`
            : "All local accounts cleared. You can register with any email again.",
        );
      } else {
        setResetMsg(
          result.error
            ? `Local emails cleared. Cloud wipe: ${result.error}`
            : "Local emails cleared. Cloud accounts may still exist — delete them in Supabase Auth if signup says email is taken.",
        );
      }
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-20" />
      <div className="pointer-events-none fixed -top-24 right-0 h-[28rem] w-[28rem] rounded-full bg-brand/15 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-0 h-[28rem] w-[28rem] rounded-full bg-brand-2/15 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
        <div className="mb-10 text-center">
          <Link to="/" className="mb-8 inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand-bg ring-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-semibold tracking-tight">
              Startup Copilot <span className="gradient-text">OS</span>
            </span>
          </Link>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Choose how you sign in
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Admins manage the company portal. Employees request leave and use workplace tools.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Link
              to="/auth"
              className="group glass-strong flex h-full flex-col rounded-3xl p-7 transition-all hover:ring-1 hover:ring-brand/40"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/15 text-brand-glow">
                <Shield className="h-6 w-6" />
              </div>
              <h2 className="mt-5 font-display text-xl font-semibold">Admin Login</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                Founders & managers — revenue, customers, leave approvals, agents, and full control.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-brand-glow" /> Company dashboard
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-brand-glow" /> Approve employee leave
                </li>
              </ul>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-glow group-hover:gap-2.5 transition-all">
                Continue as Admin <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            <Link
              to="/employee/auth"
              className="group glass-strong flex h-full flex-col rounded-3xl p-7 transition-all hover:ring-1 hover:ring-emerald-500/40"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
                <Briefcase className="h-6 w-6" />
              </div>
              <h2 className="mt-5 font-display text-xl font-semibold">Employee Login</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                Team members — request holidays, track approvals, team activity, and AI tools.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Briefcase className="h-3.5 w-3.5 text-emerald-400" /> Workplace portal
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-emerald-400" /> Submit leave requests
                </li>
              </ul>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 group-hover:gap-2.5 transition-all">
                Continue as Employee <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </motion.div>
        </div>

        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={handleResetAccounts}
            disabled={resetting}
            className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${resetting ? "animate-spin" : ""}`} />
            {resetting ? "Resetting accounts…" : "Reset all emails (start fresh)"}
          </button>
          {resetMsg && (
            <p className="mx-auto mt-3 max-w-lg text-xs text-muted-foreground">{resetMsg}</p>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
