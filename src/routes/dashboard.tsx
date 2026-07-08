import { useEffect, useState } from "react";
import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAppState } from "../hooks/use-app-state";
import {
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  Network,
  Users,
  Bell,
  LogOut,
  Menu,
  X,
  Settings,
  BrainCircuit,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const { isAuthenticated, user, logout, notifications, clearNotifications } = useAppState();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/auth" });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Verifying security context...</span>
        </div>
      </div>
    );
  }

  const navLinks = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "AI Co-founder", href: "/dashboard/chat", icon: MessageSquare },
    { label: "Integrations", href: "/dashboard/integrations", icon: Network },
    { label: "AI Agents", href: "/dashboard/agents", icon: Users },
  ];

  const currentPath = routerState.location.pathname;
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background neon glows */}
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-20" />
      <div className="pointer-events-none fixed top-0 right-1/4 h-[30rem] w-[30rem] rounded-full bg-brand/10 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-1/4 h-[30rem] w-[30rem] rounded-full bg-brand-2/10 blur-3xl" />

      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/50 px-6 backdrop-blur-xl md:hidden">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg gradient-brand-bg">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-semibold text-sm">Copilot OS</span>
        </Link>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-destructive animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-muted-foreground hover:text-foreground"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-border bg-card/20 p-6 backdrop-blur-xl md:flex">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 pb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand-bg ring-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-base font-semibold tracking-tight">
              Startup Copilot <span className="gradient-text">OS</span>
            </span>
          </Link>

          {/* Nav links */}
          <nav className="mt-6 flex-1 space-y-1.5">
            {navLinks.map((link) => {
              const active = currentPath === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    active
                      ? "gradient-brand-bg text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Notifications Trigger */}
          <div className="relative mb-3">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground"
            >
              <span className="flex items-center gap-3">
                <Bell className="h-4 w-4" /> Notifications
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* User profile / Logout */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between gap-2 px-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-2 font-medium text-sm text-primary-foreground">
                  {user?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="truncate text-sm font-medium">{user?.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-colors"
                title="Logout"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              />
              {/* Sidebar */}
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-background/95 p-6 shadow-2xl backdrop-blur-2xl md:hidden"
              >
                <div className="flex items-center justify-between pb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand-bg">
                      <Sparkles className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="font-display font-semibold">Copilot OS</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)}>
                    <X className="h-6 w-6 text-muted-foreground" />
                  </button>
                </div>

                <nav className="mt-4 flex-1 space-y-1.5">
                  {navLinks.map((link) => {
                    const active = currentPath === link.href;
                    return (
                      <Link
                        key={link.href}
                        to={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                          active
                            ? "gradient-brand-bg text-primary-foreground"
                            : "text-muted-foreground hover:bg-white/5"
                        }`}
                      >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>

                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-2 font-medium text-primary-foreground">
                        {user?.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{user?.name}</div>
                        <div className="text-xs text-muted-foreground">{user?.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={logout}
                      className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive"
                    >
                      <LogOut className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Notifications Popover */}
        <AnimatePresence>
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-4 top-16 z-50 w-80 rounded-2xl border border-border bg-card/90 p-4 shadow-xl backdrop-blur-2xl md:fixed md:right-auto md:left-64 md:bottom-20 md:top-auto"
              >
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Notifications
                  </span>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" /> Clear
                    </button>
                  )}
                </div>
                <div className="mt-2 max-h-60 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-muted-foreground">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="rounded-lg bg-white/5 p-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-medium ${
                              n.type === "success"
                                ? "text-emerald-400"
                                : n.type === "warning"
                                  ? "text-yellow-400"
                                  : "text-foreground"
                            }`}
                          >
                            {n.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{n.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 px-6 py-8 md:px-10 overflow-x-hidden relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
