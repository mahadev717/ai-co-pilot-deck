import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAppState, type ProfileStatus } from "@/hooks/use-app-state";
import { ChevronDown, LogOut, Circle } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const STATUS_OPTIONS: {
  id: ProfileStatus;
  label: string;
  color: string;
  dot: string;
}[] = [
  { id: "online", label: "Online", color: "text-emerald-400", dot: "bg-emerald-400" },
  { id: "away", label: "Away", color: "text-yellow-400", dot: "bg-yellow-400" },
  { id: "busy", label: "Busy", color: "text-orange-400", dot: "bg-orange-400" },
  { id: "offline", label: "Offline", color: "text-muted-foreground", dot: "bg-muted-foreground" },
];

export function ProfileMenu({
  logoutTo = "/signin",
  compact = false,
}: {
  logoutTo?: string;
  compact?: boolean;
}) {
  const { user, logout, setProfileStatus, authBackend } = useAppState();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const current = STATUS_OPTIONS.find((s) => s.id === user.status) ?? STATUS_OPTIONS[0];
  const roleLabel = user.role === "employee" ? "Employee" : "Admin";
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate({ to: logoutTo as "/signin" });
  };

  return (
    <div className="relative">
      {authBackend === "supabase" && !compact && (
        <p className="mb-2 px-2 text-[10px] text-emerald-400/80">☁ Synced with Supabase</p>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/5"
      >
        <div className="relative shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-2 text-sm font-medium text-primary-foreground">
            {initials}
          </div>
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${current.dot}`}
            title={current.label}
          />
        </div>
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="truncate text-sm font-medium">{user.name}</div>
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[10px] text-muted-foreground">{user.email}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="rounded-full bg-brand/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-brand-glow">
              {roleLabel}
            </span>
            <span className={`flex items-center gap-1 text-[10px] ${current.color}`}>
              <Circle className={`h-1.5 w-1.5 fill-current ${current.color}`} />
              {current.label}
            </span>
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              className="absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-2xl border border-border bg-card/95 p-2 shadow-xl backdrop-blur-xl"
            >
              <p className="px-2 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Profile status
              </p>
              <div className="space-y-0.5">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setProfileStatus(opt.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs transition-colors hover:bg-white/5 ${
                      user.status === opt.id ? "bg-white/5" : ""
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${opt.dot}`} />
                    <span className={opt.color}>{opt.label}</span>
                    {user.status === opt.id && (
                      <span className="ml-auto text-[10px] text-muted-foreground">Active</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="my-2 border-t border-border" />

              <div className="px-2.5 pb-2 text-[10px] text-muted-foreground">
                Signed in as <span className="text-foreground">{roleLabel}</span>
              </div>

              <button
                type="button"
                onClick={() => void handleLogout()}
                className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-3.5 w-3.5" />
                Log out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
