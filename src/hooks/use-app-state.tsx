/**
 * Startup Copilot OS — Complete Application State
 *
 * 18 integrations, 7 AI agents, cross-tool intelligence, team activity,
 * revenue intelligence, customer journey tracking.
 *
 * Storage: localStorage (swap for Supabase when ready)
 * AI: OpenAI GPT-4o Mini (key in .env)
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { storage, applyPendingAuthAccountsReset } from "@/lib/storage";
import { getAIResponse } from "@/lib/gemini";
import {
  fetchRealGitHubData,
  fetchRealStripeData,
  getPresentationGitHubData,
  sendLiveSlackNotification,
} from "@/lib/api-service";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  loadProfile,
  loadWorkspace,
  saveWorkspace,
  upsertProfile,
  loadUserIntegrations,
  upsertUserIntegration,
  deleteUserIntegration,
  loadLeaveRequests,
  insertLeaveRequest,
  updateLeaveRequestStatus,
} from "@/lib/supabase-db";
import { loadBusinessData, wipeAllAuthUsers } from "@/lib/db-api";
import { runAgentCycle, type AgentRunContext } from "@/lib/agent-runner";
import {
  accountLabelFromCreds,
  hasAnyCredential,
  mergeWithEnvFallbacks,
} from "@/lib/integration-catalog";
import { sendLeaveDecisionEmail } from "@/lib/leave-email";

// ─── Types ─────────────────────────────────────────────────────────────────

export type UserRole = "founder" | "employee";
export type ProfileStatus = "online" | "away" | "busy" | "offline";

export type AppUser = {
  email: string;
  name: string;
  role: UserRole;
  status: ProfileStatus;
};

export type Message = {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
};

export type Integration = {
  id: string;
  name: string;
  connected: boolean;
  syncing: boolean;
  lastSynced?: string;
  description: string;
  category: IntegrationCategory;
  color: string;
  /** Human-readable account link (repo, workspace, email, etc.) */
  accountLabel?: string;
};

export type IntegrationCategory =
  | "finance"
  | "engineering"
  | "sales"
  | "support"
  | "ops"
  | "analytics"
  | "marketing"
  | "design"
  | "infrastructure";

export type Agent = {
  id: string;
  name: string;
  active: boolean;
  description: string;
  recentAction?: string;
  tasksCompleted: number;
  category: "marketing" | "finance" | "engineering" | "sales" | "support" | "ops" | "intelligence";
};

export type AppNotification = {
  id: string;
  title: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning" | "error";
  source?: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  prsThisWeek: number;
  commitsThisWeek: number;
  status: "active" | "away" | "blocked";
  lastActive: string;
};

export type CustomerAccount = {
  id: string;
  name: string;
  arr: number;
  health: "healthy" | "at-risk" | "churned";
  lastActive: string;
  ticketsOpen: number;
  nps: number;
  stage: "trial" | "active" | "enterprise" | "churned";
};

export type RevenueSnapshot = {
  month: string;
  mrr: number;
  newMrr: number;
  churnedMrr: number;
  expansionMrr: number;
  customers: number;
};

export type LeaveType = "annual" | "sick" | "personal" | "unpaid" | "other";
export type LeaveStatus = "pending" | "approved" | "rejected";

export type LeaveRequest = {
  id: string;
  employeeName: string;
  employeeEmail: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  reviewerNote?: string;
  emailSent: boolean;
  reviewedAt?: string;
  createdAt: string;
};

export type LiveGitHubData = {
  connected: boolean;
  openPrsCount: number;
  openIssuesCount: number;
  recentActivity: { type: string; text: string; time: string; status: string }[];
  repos?: {
    id: string;
    fullName: string;
    description: string;
    language: string;
    stars: number;
    forks: number;
    openIssues: number;
    updatedAt: string;
    private: boolean;
    defaultBranch: string;
  }[];
  mode?: "live" | "demo";
};

export type LiveStripeData = {
  connected: boolean;
  revenue: number;
  recentCharges: { id: string; amount: number; currency: string; status: string }[];
};

// ─── App Context Type ───────────────────────────────────────────────────────

type AuthResult = { ok: true } | { ok: false; error: string; needsEmailConfirm?: boolean };

type AppStateContextType = {
  isAuthenticated: boolean;
  authReady: boolean;
  authBackend: "supabase" | "local";
  user: AppUser | null;
  integrations: Integration[];
  agents: Agent[];
  chatHistory: Message[];
  notifications: AppNotification[];
  teamMembers: TeamMember[];
  customerAccounts: CustomerAccount[];
  revenueHistory: RevenueSnapshot[];
  leaveRequests: LeaveRequest[];
  liveGitHub: LiveGitHubData | null;
  liveStripe: LiveStripeData | null;
  businessHealth: number;
  revenue: number;
  customers: number;
  teamPRs: number;
  burnRate: number;
  runway: number;
  isTyping: boolean;
  runningAgents: Record<string, boolean>;
  // Actions
  login: (email: string, password: string, expectedRole: UserRole) => Promise<AuthResult>;
  register: (
    email: string,
    name: string,
    password: string,
    role: UserRole,
  ) => Promise<AuthResult>;
  logout: () => Promise<void>;
  /** Wipe all registered emails (local + Supabase) so you can sign up fresh. */
  resetAllAccounts: () => Promise<{ ok: boolean; deleted: number; error?: string }>;
  /** One-click presentation login (local demo session — works even if Supabase is configured). */
  enterPresentationDemo: (role?: UserRole) => Promise<AuthResult>;
  setProfileStatus: (status: ProfileStatus) => void;
  connectIntegration: (id: string, credentials?: Record<string, string>) => Promise<void>;
  disconnectIntegration: (id: string) => Promise<void>;
  connectAllIntegrations: () => Promise<void>;
  getIntegrationCredentials: (id: string) => Record<string, string>;
  toggleAgent: (id: string) => void;
  runAgent: (id: string) => Promise<void>;
  runAllAgents: () => Promise<void>;
  sendChatMessage: (text: string) => void;
  clearChat: () => void;
  resolveRecommendation: (id: string, text: string) => void;
  clearNotifications: () => void;
  markNotificationRead: (id: string) => void;
  refreshLiveData: () => Promise<void>;
  submitLeaveRequest: (input: {
    employeeName: string;
    employeeEmail: string;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
  }) => Promise<void>;
  reviewLeaveRequest: (
    id: string,
    status: "approved" | "rejected",
    reviewerNote?: string,
  ) => Promise<{ emailMethod?: string; emailOk?: boolean }>;
};

// ─── All 18 Integrations ────────────────────────────────────────────────────

const DEFAULT_INTEGRATIONS: Integration[] = [
  // Finance
  { id: "stripe", name: "Stripe", connected: false, syncing: false, description: "Track MRR, invoices, churn, failed payments, and expansion revenue in real-time.", category: "finance", color: "#635BFF" },
  { id: "quickbooks", name: "QuickBooks", connected: false, syncing: false, description: "Monitor expenses, payroll, burn rate, runway, and P&L statements.", category: "finance", color: "#2CA01C" },

  // Engineering
  { id: "github", name: "GitHub", connected: false, syncing: false, description: "Track pull requests, code velocity, security vulnerabilities, and deploy frequency.", category: "engineering", color: "#24292F" },
  { id: "linear", name: "Linear", connected: false, syncing: false, description: "Sprint velocity, backlog priorities, engineering roadmap health and blockers.", category: "engineering", color: "#5E6AD2" },
  { id: "jira", name: "Jira", connected: false, syncing: false, description: "Project backlogs, sprint progress, cross-team assignments, and velocity.", category: "engineering", color: "#0052CC" },
  { id: "figma", name: "Figma", connected: false, syncing: false, description: "Design velocity, files in review vs shipped, UX debt tracking, handoff status.", category: "design", color: "#F24E1E" },

  // Team / Ops
  { id: "slack", name: "Slack", connected: false, syncing: false, description: "Team pulse, blocker detection, standup summaries, and culture sentiment analysis.", category: "ops", color: "#4A154B" },
  { id: "notion", name: "Notion", connected: false, syncing: false, description: "Company wiki health, stale docs, roadmap status, and meeting notes.", category: "ops", color: "#000000" },
  { id: "calendar", name: "Google Calendar", connected: false, syncing: false, description: "Meeting load analysis, overbooked team alerts, customer call trends.", category: "ops", color: "#4285F4" },

  // Infrastructure
  { id: "aws", name: "AWS / Vercel", connected: false, syncing: false, description: "Cloud cost monitoring, error rates, deploy health, and infrastructure spend.", category: "infrastructure", color: "#FF9900" },
  { id: "pagerduty", name: "PagerDuty", connected: false, syncing: false, description: "Real-time incident alerts, on-call schedules, MTTR, and uptime monitoring.", category: "infrastructure", color: "#06AC38" },

  // Sales / CRM
  { id: "hubspot", name: "HubSpot", connected: false, syncing: false, description: "Customer pipelines, deal velocity, churn prediction, and lead scoring.", category: "sales", color: "#FF7A59" },
  { id: "gmail", name: "Gmail", connected: false, syncing: false, description: "Customer email response time, lead follow-up gaps, and investor relationship tracking.", category: "sales", color: "#EA4335" },
  { id: "calendly", name: "Calendly", connected: false, syncing: false, description: "Demo booked rates, no-show tracking, sales cycle velocity from first touch.", category: "sales", color: "#006BFF" },

  // Support
  { id: "zendesk", name: "Zendesk", connected: false, syncing: false, description: "Support ticket volume, CSAT scores, SLA compliance, and recurring bug patterns.", category: "support", color: "#03363D" },
  { id: "intercom", name: "Intercom", connected: false, syncing: false, description: "Live chat conversations, product feedback signals, churn warning indicators.", category: "support", color: "#1F8DED" },

  // Analytics / Marketing
  { id: "google-analytics", name: "Google Analytics", connected: false, syncing: false, description: "Traffic sources, conversion funnels, user behavior, and campaign performance.", category: "analytics", color: "#E37400" },
  { id: "mixpanel", name: "Mixpanel", connected: false, syncing: false, description: "Feature adoption, in-product funnel drop-offs, retention cohorts, and A/B tests.", category: "analytics", color: "#7856FF" },
  { id: "mailchimp", name: "Mailchimp", connected: false, syncing: false, description: "Email campaign open rates, click rates, list health, and unsubscribe spikes.", category: "marketing", color: "#FFE01B" },
  { id: "twitter", name: "X / Twitter", connected: false, syncing: false, description: "Brand mentions, viral moments, competitor tracking, and sentiment analysis.", category: "marketing", color: "#1DA1F2" },
];

// ─── 7 AI Agents ────────────────────────────────────────────────────────────

const DEFAULT_AGENTS: Agent[] = [
  {
    id: "marketing", name: "Marketing Agent", active: true, tasksCompleted: 47,
    description: "Generates SEO drafts, monitors acquisition funnels, tracks campaign ROI, and schedules social posts.",
    recentAction: "Ready — activate Run Now for a live OpenAI cycle",
    category: "marketing",
  },
  {
    id: "finance", name: "Finance Agent", active: true, tasksCompleted: 89,
    description: "Monitors burn rate, subscription metrics, flags payment failures, and prepares investor-ready reports.",
    recentAction: "Ready — activate Run Now for a live OpenAI cycle",
    category: "finance",
  },
  {
    id: "engineering", name: "Engineering Agent", active: true, tasksCompleted: 132,
    description: "Runs security audits, tracks code velocity, checks deploy health, and monitors dependency vulnerabilities.",
    recentAction: "Ready — activate Run Now for a live OpenAI cycle",
    category: "engineering",
  },
  {
    id: "sales", name: "Sales Agent", active: true, tasksCompleted: 12,
    description: "Qualifies inbound leads, generates personalized follow-up emails, and updates deal stages in CRM.",
    recentAction: "Ready — activate Run Now for a live OpenAI cycle",
    category: "sales",
  },
  {
    id: "support", name: "Support Agent", active: true, tasksCompleted: 18,
    description: "Drafts ticket responses, summarizes support logs, detects bug patterns, and escalates critical issues.",
    recentAction: "Ready — activate Run Now for a live OpenAI cycle",
    category: "support",
  },
  {
    id: "intelligence", name: "Intelligence Agent", active: true, tasksCompleted: 23,
    description: "Cross-tool pattern detection — connects signals from all integrations to surface hidden risks and opportunities.",
    recentAction: "Ready — activate Run Now for a live OpenAI cycle",
    category: "intelligence",
  },
  {
    id: "ops", name: "Ops Agent", active: true, tasksCompleted: 9,
    description: "Monitors infrastructure costs, on-call schedules, incident response, and team meeting load.",
    recentAction: "Ready — activate Run Now for a live OpenAI cycle",
    category: "ops",
  },
];

// ─── Mock team members ───────────────────────────────────────────────────────

const DEFAULT_TEAM: TeamMember[] = [
  { id: "t1", name: "Alex Chen", role: "Lead Engineer", avatar: "AC", prsThisWeek: 8, commitsThisWeek: 31, status: "active", lastActive: "2 min ago" },
  { id: "t2", name: "Sarah Kim", role: "Frontend Dev", avatar: "SK", prsThisWeek: 5, commitsThisWeek: 18, status: "active", lastActive: "15 min ago" },
  { id: "t3", name: "Marcus Webb", role: "Backend Dev", avatar: "MW", prsThisWeek: 4, commitsThisWeek: 22, status: "blocked", lastActive: "1 hr ago" },
  { id: "t4", name: "Priya Nair", role: "Product Designer", avatar: "PN", prsThisWeek: 1, commitsThisWeek: 3, status: "active", lastActive: "5 min ago" },
  { id: "t5", name: "Jordan Lee", role: "DevOps", avatar: "JL", prsThisWeek: 3, commitsThisWeek: 14, status: "away", lastActive: "3 hrs ago" },
  { id: "t6", name: "Emma Davis", role: "Sales Lead", avatar: "ED", prsThisWeek: 0, commitsThisWeek: 0, status: "active", lastActive: "Just now" },
];

function countLeaveDays(startDate: string, endDate: string): number {
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 1;
  return Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

function mapLeaveRow(row: {
  id: string;
  employee_name: string;
  employee_email: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  reviewer_note: string | null;
  email_sent: boolean;
  reviewed_at: string | null;
  created_at: string;
}): LeaveRequest {
  return {
    id: row.id,
    employeeName: row.employee_name,
    employeeEmail: row.employee_email,
    leaveType: row.leave_type,
    startDate: row.start_date,
    endDate: row.end_date,
    days: row.days,
    reason: row.reason,
    status: row.status,
    reviewerNote: row.reviewer_note ?? undefined,
    emailSent: row.email_sent,
    reviewedAt: row.reviewed_at ?? undefined,
    createdAt: row.created_at,
  };
}

function localLeavesKey(_email?: string) {
  // Company-wide leave board so founders and employees share the same queue
  return "company_leave_requests_v1";
}

const DEFAULT_LEAVES: LeaveRequest[] = [
  {
    id: "lv1",
    employeeName: "Sarah Kim",
    employeeEmail: "sarah.kim@company.com",
    leaveType: "annual",
    startDate: "2026-07-22",
    endDate: "2026-07-24",
    days: 3,
    reason: "Family trip — already covered frontend tickets with Alex.",
    status: "pending",
    emailSent: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "lv2",
    employeeName: "Marcus Webb",
    employeeEmail: "marcus.webb@company.com",
    leaveType: "sick",
    startDate: "2026-07-18",
    endDate: "2026-07-18",
    days: 1,
    reason: "Doctor appointment — will be back tomorrow.",
    status: "pending",
    emailSent: false,
    createdAt: new Date().toISOString(),
  },
];

// ─── Customer accounts ───────────────────────────────────────────────────────

const DEFAULT_CUSTOMERS: CustomerAccount[] = [
  { id: "c1", name: "Lumen AI", arr: 14400, health: "at-risk", lastActive: "18 days ago", ticketsOpen: 3, nps: 42, stage: "enterprise" },
  { id: "c2", name: "Northwind Labs", arr: 8800, health: "at-risk", lastActive: "12 days ago", ticketsOpen: 1, nps: 51, stage: "active" },
  { id: "c3", name: "Cascadia Corp", arr: 4900, health: "at-risk", lastActive: "5 days ago", ticketsOpen: 4, nps: 38, stage: "active" },
  { id: "c4", name: "TechVault Inc", arr: 24000, health: "healthy", lastActive: "Today", ticketsOpen: 0, nps: 78, stage: "enterprise" },
  { id: "c5", name: "SkyBase Systems", arr: 18200, health: "healthy", lastActive: "Yesterday", ticketsOpen: 1, nps: 82, stage: "enterprise" },
  { id: "c6", name: "Orbital Data", arr: 6600, health: "healthy", lastActive: "2 days ago", ticketsOpen: 0, nps: 71, stage: "active" },
  { id: "c7", name: "Vertex Analytics", arr: 3600, health: "healthy", lastActive: "Today", ticketsOpen: 0, nps: 89, stage: "active" },
  { id: "c8", name: "Quantum Works", arr: 2400, health: "churned", lastActive: "32 days ago", ticketsOpen: 0, nps: 22, stage: "churned" },
];

// ─── Revenue history ────────────────────────────────────────────────────────

const DEFAULT_REVENUE: RevenueSnapshot[] = [
  { month: "Jan", mrr: 120000, newMrr: 18000, churnedMrr: 5200, expansionMrr: 8000, customers: 1500 },
  { month: "Feb", mrr: 145000, newMrr: 24000, churnedMrr: 4800, expansionMrr: 9200, customers: 1800 },
  { month: "Mar", mrr: 168000, newMrr: 28000, churnedMrr: 5100, expansionMrr: 12000, customers: 2100 },
  { month: "Apr", mrr: 190000, newMrr: 32000, churnedMrr: 4200, expansionMrr: 14800, customers: 2500 },
  { month: "May", mrr: 220000, newMrr: 38000, churnedMrr: 3800, expansionMrr: 16000, customers: 2900 },
  { month: "Jun", mrr: 248910, newMrr: 52400, churnedMrr: 3200, expansionMrr: 18700, customers: 3204 },
];

// ─── Notifications ──────────────────────────────────────────────────────────

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  { id: "n1", title: "Churn signal: Lumen AI API usage dropped 40% — 3 open tickets", time: "2 min ago", read: false, type: "warning", source: "Intelligence Agent" },
  { id: "n2", title: "Engineering: lodash CVE-2021-23337 detected in production", time: "14 min ago", read: false, type: "error", source: "Engineering Agent" },
  { id: "n3", title: "June MRR hit $248,910 — best month yet 🚀", time: "1 hr ago", read: false, type: "success", source: "Finance Agent" },
  { id: "n4", title: "Marketing: /pricing page traffic up 45% from ProductHunt", time: "2 hrs ago", read: true, type: "info", source: "Marketing Agent" },
  { id: "n5", title: "PR #241 (payment webhook fix) waiting 3 days for review", time: "3 hrs ago", read: true, type: "warning", source: "Engineering Agent" },
  { id: "n6", title: "Support: 8 tickets same root cause (SSO login issue)", time: "5 hrs ago", read: true, type: "warning", source: "Support Agent" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function nowTime(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function roleMismatchMessage(expectedRole: UserRole, actualRole: UserRole): string {
  if (expectedRole === "employee" && actualRole === "founder") {
    return "This email belongs to the Admin (company owner) account. It cannot be used on the Employee portal. Please use Admin Login, or sign up with a different employee email.";
  }
  if (expectedRole === "founder" && actualRole === "employee") {
    return "This email is registered as an Employee. It cannot sign in to the Admin portal — Admin is only for the company owner. Please use Employee Login instead.";
  }
  return "This account belongs to a different portal. Use the correct Admin or Employee login.";
}

function normalizeRole(value: unknown): UserRole | null {
  if (value === "employee" || value === "founder") return value;
  return null;
}

/** Resolve locked portal role for an account. Employee role always wins over a missing/default. */
function resolveAccountRole(parts: {
  profileRole?: unknown;
  metaRole?: unknown;
  storedRole?: unknown;
}): UserRole | null {
  return (
    normalizeRole(parts.profileRole) ??
    normalizeRole(parts.metaRole) ??
    normalizeRole(parts.storedRole) ??
    null
  );
}

/** Merge saved integrations with defaults so new tools appear after app updates */
function mergeIntegrations(saved: Integration[] | null | undefined): Integration[] {
  if (!Array.isArray(saved) || saved.length === 0) return DEFAULT_INTEGRATIONS;
  const byId = new Map(saved.map((i) => [i.id, i]));
  return DEFAULT_INTEGRATIONS.map((def) => {
    const prev = byId.get(def.id);
    return prev
      ? {
          ...def,
          ...prev,
          description: def.description,
          name: def.name,
          category: def.category,
          color: def.color,
          syncing: false,
        }
      : def;
  });
}

function localIntegrationsKey(email: string) {
  return `integrations_user_${email.toLowerCase()}`;
}

function localCredsKey(email: string) {
  return `integration_creds_${email.toLowerCase()}`;
}

function applyUserIntegrationRows(
  base: Integration[],
  rows: { provider_id: string; connected: boolean; account_label: string | null; last_synced: string | null }[],
): Integration[] {
  if (!rows.length) return base;
  const byId = new Map(rows.map((r) => [r.provider_id, r]));
  return base.map((i) => {
    const row = byId.get(i.id);
    if (!row) return i;
    return {
      ...i,
      connected: row.connected,
      accountLabel: row.account_label ?? i.accountLabel,
      lastSynced: row.last_synced ?? i.lastSynced,
      syncing: false,
    };
  });
}

function mergeAgents(saved: Agent[] | null | undefined): Agent[] {
  if (!Array.isArray(saved) || saved.length === 0) return DEFAULT_AGENTS;
  const byId = new Map(saved.map((a) => [a.id, a]));
  return DEFAULT_AGENTS.map((def) => {
    const prev = byId.get(def.id);
    // Keep task counts / recent actions from storage, but always refresh catalog fields.
    return prev
      ? {
          ...def,
          ...prev,
          description: def.description,
          name: def.name,
          category: def.category,
          // Ensure newly added specialty agents come online by default
          active: typeof prev.active === "boolean" ? prev.active : def.active,
        }
      : def;
  });
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  sender: "assistant",
  text: "Welcome to Startup Copilot OS! 👋 I'm your AI co-founder — talk or type with me.\n\n**For your presentation:** open Integrations → Link all (dummy data, no API keys). Then open GitHub Hub to show repos, code, and analysis.\n\nTry asking:\n\n• \"What's our business health?\"\n• \"Analyze connected GitHub repos\"\n• \"Summarize all connected integrations\"\n• \"What should I focus on today?\"",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};

// ─── Context ────────────────────────────────────────────────────────────────

const AppStateContext = createContext<AppStateContextType | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  // One-time wipe of registered emails so portals start with a clean slate
  const authAccountsWereReset =
    typeof window !== "undefined" ? applyPendingAuthAccountsReset() : false;

  const isPresentationDemo =
    typeof window !== "undefined" && storage.get("presentation_demo", false) === true;

  const [user, setUser] = useState<AppUser | null>(() => {
    if (authAccountsWereReset) return null;
    // Presentation demo always restores from local storage (even when Supabase is configured)
    if (isPresentationDemo || !isSupabaseConfigured) {
      const saved = storage.get<AppUser | null>("user", null);
      if (!saved) return null;
      return {
        ...saved,
        role: saved.role ?? "founder",
        status: saved.status ?? "online",
      };
    }
    return null;
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(
    !isSupabaseConfigured || isPresentationDemo,
  );

  const [integrations, setIntegrations] = useState<Integration[]>(() => {
    const demoUser = storage.get<AppUser | null>("user", null);
    if (isPresentationDemo && demoUser?.email) {
      return mergeIntegrations(
        storage.get(localIntegrationsKey(demoUser.email), DEFAULT_INTEGRATIONS),
      );
    }
    if (isSupabaseConfigured) {
      return mergeIntegrations(storage.get("integrations_v2", DEFAULT_INTEGRATIONS));
    }
    const localUser = storage.get<AppUser | null>("user", null);
    if (localUser?.email) {
      return mergeIntegrations(
        storage.get(localIntegrationsKey(localUser.email), DEFAULT_INTEGRATIONS),
      );
    }
    return mergeIntegrations(storage.get("integrations_v2", DEFAULT_INTEGRATIONS));
  });
  const [integrationCreds, setIntegrationCreds] = useState<Record<string, Record<string, string>>>(() => {
    if (isPresentationDemo) {
      const demoUser = storage.get<AppUser | null>("user", null);
      if (demoUser?.email) return storage.get(localCredsKey(demoUser.email), {});
      return {};
    }
    if (isSupabaseConfigured) return {};
    const localUser = storage.get<AppUser | null>("user", null);
    if (localUser?.email) return storage.get(localCredsKey(localUser.email), {});
    return {};
  });
  const [agents, setAgents] = useState<Agent[]>(() => {
    const v3 = storage.get<Agent[] | null>("agents_v3", null);
    if (v3) return mergeAgents(v3);
    // One-time migrate from v2 — bring every specialty agent online
    return mergeAgents(storage.get("agents_v2", DEFAULT_AGENTS)).map((a) => ({
      ...a,
      active: true,
      recentAction:
        a.recentAction?.startsWith("Inactive")
          ? "Ready — activate Run Now for a live OpenAI cycle"
          : a.recentAction,
    }));
  });
  const [chatHistory, setChatHistory] = useState<Message[]>(() =>
    storage.get("chat_v2", [WELCOME_MESSAGE]),
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    storage.get("notifications_v2", DEFAULT_NOTIFICATIONS),
  );
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(DEFAULT_TEAM);
  const [customerAccounts, setCustomerAccounts] = useState<CustomerAccount[]>(DEFAULT_CUSTOMERS);
  const [revenueHistory, setRevenueHistory] = useState<RevenueSnapshot[]>(DEFAULT_REVENUE);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() =>
    storage.get(localLeavesKey(), DEFAULT_LEAVES),
  );
  const [isTyping, setIsTyping] = useState(false);
  const [runningAgents, setRunningAgents] = useState<Record<string, boolean>>({});
  const [liveGitHub, setLiveGitHub] = useState<LiveGitHubData | null>(null);
  const [liveStripe, setLiveStripe] = useState<LiveStripeData | null>(null);
  const [metrics, setMetrics] = useState({
    mrr: 248910,
    customers: 3204,
    burnRate: 87000,
    cashOnHand: 1200000,
    teamPRs: 12,
  });

  const chatRef = useRef(chatHistory);
  const agentsRef = useRef(agents);
  const runningRef = useRef(runningAgents);
  const runAgentRef = useRef<(id: string) => Promise<void>>(async () => {});
  const integrationCredsRef = useRef(integrationCreds);
  const userIdRef = useRef(userId);
  const userRef = useRef(user);
  const skipCloudSave = useRef(true);
  const cloudSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bgTickIndex = useRef(0);
  const initialAgentKickoff = useRef(false);

  useEffect(() => { chatRef.current = chatHistory; }, [chatHistory]);
  useEffect(() => { agentsRef.current = agents; }, [agents]);
  useEffect(() => { runningRef.current = runningAgents; }, [runningAgents]);
  useEffect(() => { integrationCredsRef.current = integrationCreds; }, [integrationCreds]);
  useEffect(() => { userIdRef.current = userId; }, [userId]);
  useEffect(() => { userRef.current = user; }, [user]);

  // Always mirror to localStorage (fast offline cache)
  // Never wipe a presentation demo session with a null write on boot
  useEffect(() => {
    if (user === null && storage.get("presentation_demo", false)) return;
    storage.set("user", user);
  }, [user]);
  useEffect(() => { storage.set("integrations_v2", integrations); }, [integrations]);
  useEffect(() => {
    if (!user?.email) return;
    storage.set(localIntegrationsKey(user.email), integrations);
    storage.set(localCredsKey(user.email), integrationCreds);
  }, [user?.email, integrations, integrationCreds]);
  useEffect(() => {
    storage.set("agents_v3", agents);
    storage.set("agents_v2", agents); // keep legacy key in sync
  }, [agents]);
  useEffect(() => { storage.set("chat_v2", chatHistory); }, [chatHistory]);
  useEffect(() => { storage.set("notifications_v2", notifications); }, [notifications]);
  useEffect(() => {
    storage.set(localLeavesKey(), leaveRequests);
  }, [leaveRequests]);

  // Debounced cloud sync when Supabase session is active
  useEffect(() => {
    if (!isSupabaseConfigured || !userId || skipCloudSave.current) return;
    if (cloudSaveTimer.current) clearTimeout(cloudSaveTimer.current);
    cloudSaveTimer.current = setTimeout(() => {
      void saveWorkspace(userId, {
        integrations,
        agents,
        chat_history: chatHistory,
        notifications,
      });
    }, 800);
    return () => {
      if (cloudSaveTimer.current) clearTimeout(cloudSaveTimer.current);
    };
  }, [userId, integrations, agents, chatHistory, notifications]);

  async function hydrateFromSupabase(
    uid: string,
    email: string,
    metaName?: string | null,
    preferredRole?: UserRole,
  ) {
    skipCloudSave.current = true;
    const profile = await loadProfile(uid);
    const name = profile?.name || metaName || email.split("@")[0];
    const roleFromProfile = normalizeRole(profile?.role);
    // Profile role wins. preferredRole is only for brand-new accounts with no profile role yet.
    const resolvedRole: UserRole = roleFromProfile ?? preferredRole ?? "founder";
    const savedStatus = storage.get<ProfileStatus | null>(`profile_status_${email.toLowerCase()}`, null);
    setUser({
      email: profile?.email || email,
      name,
      role: resolvedRole,
      status: savedStatus ?? "online",
    });
    setUserId(uid);

    const workspace = await loadWorkspace(uid);
    let nextIntegrations = mergeIntegrations(
      (workspace?.integrations as Integration[] | undefined) ??
        storage.get(localIntegrationsKey(email), storage.get("integrations_v2", DEFAULT_INTEGRATIONS)),
    );

    // Prefer dedicated per-user integration rows (credentials + connection state)
    const linked = await loadUserIntegrations(uid);
    if (linked.length > 0) {
      nextIntegrations = applyUserIntegrationRows(nextIntegrations, linked);
      const credMap: Record<string, Record<string, string>> = {};
      for (const row of linked) {
        if (hasAnyCredential(row.credentials)) credMap[row.provider_id] = row.credentials;
      }
      setIntegrationCreds(credMap);
    } else {
      setIntegrationCreds(storage.get(localCredsKey(email), {}));
    }

    if (workspace) {
      setIntegrations(nextIntegrations);
      if (workspace.agents) setAgents(mergeAgents(workspace.agents as Agent[]));
      if (Array.isArray(workspace.chat_history) && (workspace.chat_history as Message[]).length > 0) {
        setChatHistory(workspace.chat_history as Message[]);
      }
      if (Array.isArray(workspace.notifications)) {
        setNotifications(workspace.notifications as AppNotification[]);
      }
    } else {
      setIntegrations(nextIntegrations);
      // First login — seed workspace from current/local defaults
      await saveWorkspace(uid, {
        integrations: nextIntegrations,
        agents: storage.get("agents_v3", storage.get("agents_v2", DEFAULT_AGENTS)),
        chat_history: storage.get("chat_v2", [WELCOME_MESSAGE]),
        notifications: storage.get("notifications_v2", DEFAULT_NOTIFICATIONS),
      });
    }

    // Load relational business tables (customers, revenue, team, metrics)
    try {
      const { data: sessionData } = await supabase!.auth.getSession();
      const token = sessionData.session?.access_token;
      if (token) {
        const biz = await loadBusinessData({ data: { accessToken: token } });
        if (biz.ok) {
          if (biz.customers.length > 0) {
            setCustomerAccounts(
              biz.customers.map((c) => ({
                id: c.id,
                name: c.name,
                arr: Number(c.arr),
                health: c.health,
                lastActive: c.last_active,
                ticketsOpen: c.tickets_open,
                nps: c.nps,
                stage: c.stage,
              })),
            );
          }
          if (biz.revenue.length > 0) {
            setRevenueHistory(
              biz.revenue.map((r) => ({
                month: r.month,
                mrr: Number(r.mrr),
                newMrr: Number(r.new_mrr),
                churnedMrr: Number(r.churned_mrr),
                expansionMrr: Number(r.expansion_mrr),
                customers: r.customers,
              })),
            );
          }
          if (biz.team.length > 0) {
            setTeamMembers(
              biz.team.map((t) => ({
                id: t.id,
                name: t.name,
                role: t.role,
                avatar: t.avatar,
                prsThisWeek: t.prs_this_week,
                commitsThisWeek: t.commits_this_week,
                status: t.status,
                lastActive: t.last_active,
              })),
            );
          }
          if (biz.metrics) {
            setMetrics({
              mrr: Number(biz.metrics.mrr),
              customers: biz.metrics.customers,
              burnRate: Number(biz.metrics.burn_rate),
              cashOnHand: Number(biz.metrics.cash_on_hand),
              teamPRs: biz.metrics.team_prs,
            });
          }
        }
      }
    } catch (e) {
      console.warn("Business data hydrate skipped:", e);
    }

    try {
      const leaves = await loadLeaveRequests(uid);
      if (leaves.length > 0) {
        // Merge cloud + company board (employees may have added locally)
        const local = storage.get<LeaveRequest[]>(localLeavesKey(), []);
        const byId = new Map<string, LeaveRequest>();
        for (const l of local) byId.set(l.id, l);
        for (const row of leaves) byId.set(row.id, mapLeaveRow(row));
        setLeaveRequests(Array.from(byId.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      } else {
        setLeaveRequests(storage.get(localLeavesKey(), DEFAULT_LEAVES));
      }
    } catch (e) {
      console.warn("Leave requests hydrate skipped:", e);
      setLeaveRequests(storage.get(localLeavesKey(), DEFAULT_LEAVES));
    }

    // Allow cloud saves after hydrate settles
    setTimeout(() => { skipCloudSave.current = false; }, 100);
  }

  // Restore session on boot
  useEffect(() => {
    // Presentation demo — local only, never hydrate Supabase over it
    if (storage.get("presentation_demo", false)) {
      const saved = storage.get<AppUser | null>("user", null);
      if (saved) {
        setUser({
          ...saved,
          role: saved.role ?? "founder",
          status: saved.status ?? "online",
        });
        const ints = mergeIntegrations(
          storage.get(localIntegrationsKey(saved.email), DEFAULT_INTEGRATIONS),
        );
        setIntegrations(ints);
        setIntegrationCreds(storage.get(localCredsKey(saved.email), {}));
        setLeaveRequests(storage.get(localLeavesKey(), DEFAULT_LEAVES));
        if (ints.some((i) => i.id === "github" && i.connected)) {
          setLiveGitHub(getPresentationGitHubData());
        }
      }
      setUserId(null);
      skipCloudSave.current = true;
      setAuthReady(true);
      return;
    }

    if (!supabase) {
      setAuthReady(true);
      return;
    }

    let unsub = () => {};

    (async () => {
      if (authAccountsWereReset) {
        try {
          await supabase.auth.signOut();
        } catch {
          /* ignore */
        }
        setUser(null);
        setUserId(null);
        storage.remove("user");
        try {
          await wipeAllAuthUsers();
        } catch {
          /* ignore */
        }
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && !authAccountsWereReset && !storage.get("presentation_demo", false)) {
          await hydrateFromSupabase(
            session.user.id,
            session.user.email ?? "",
            session.user.user_metadata?.name as string | undefined,
          );
        }
      } catch (e) {
        console.warn("Supabase session restore failed:", e);
      }
      setAuthReady(true);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (storage.get("presentation_demo", false)) return;
      if (event === "SIGNED_OUT" || !session?.user) {
        setUser(null);
        setUserId(null);
        setIntegrations(DEFAULT_INTEGRATIONS.map((i) => ({ ...i })));
        setIntegrationCreds({});
        setLeaveRequests(DEFAULT_LEAVES);
        setLiveGitHub(null);
        setLiveStripe(null);
        skipCloudSave.current = true;
        return;
      }
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        if (!userId || userId !== session.user.id) {
          await hydrateFromSupabase(
            session.user.id,
            session.user.email ?? "",
            session.user.user_metadata?.name as string | undefined,
          );
        }
      }
    });
    unsub = () => subscription.unsubscribe();

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived metrics
  const connectedCount = integrations.filter((i) => i.connected).length;
  const activeAgentCount = agents.filter((a) => a.active).length;
  const businessHealth = Math.min(100, Math.round(
    30 + connectedCount * 3 + activeAgentCount * 4 + (connectedCount > 5 ? 12 : 0) + (connectedCount > 10 ? 8 : 0)
  ));
  const revenue = liveStripe?.revenue && liveStripe.revenue > 0 ? liveStripe.revenue : metrics.mrr;
  const customers = metrics.customers;
  const teamPRs = liveGitHub?.openPrsCount ?? metrics.teamPRs;
  const burnRate = metrics.burnRate;
  const runway = Math.round((metrics.cashOnHand / burnRate) * 10) / 10; // months

  // ── Live data helpers ─────────────────────────────────────────

  async function refreshLiveData() {
    const creds = integrationCredsRef.current;
    const github = mergeWithEnvFallbacks("github", creds.github ?? {});
    const stripe = mergeWithEnvFallbacks("stripe", creds.stripe ?? {});

    const tasks: Promise<void>[] = [];

    if (github.token && github.repo) {
      tasks.push(
        fetchRealGitHubData(github.token, github.repo).then((data) => {
          if (data) setLiveGitHub(data);
          else setLiveGitHub(getPresentationGitHubData());
        }),
      );
    } else if (integrations.some((i) => i.id === "github" && i.connected)) {
      setLiveGitHub((prev) => prev ?? getPresentationGitHubData());
    }

    if (stripe.secretKey) {
      tasks.push(
        fetchRealStripeData(stripe.secretKey).then((data) => {
          if (data) setLiveStripe(data);
        }),
      );
    }

    await Promise.all(tasks);
  }

  // Pull live data when GitHub / Stripe are already connected on load
  useEffect(() => {
    const githubOn = integrations.some((i) => i.id === "github" && i.connected);
    const stripeOn = integrations.some((i) => i.id === "stripe" && i.connected);
    if (githubOn || stripeOn) {
      void refreshLiveData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auth ──────────────────────────────────────────────────────

  async function login(
    email: string,
    password: string,
    expectedRole: UserRole,
  ): Promise<AuthResult> {
    if (!email.includes("@")) return { ok: false, error: "Enter a valid email address." };
    if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };

    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, error: error.message };
      if (!data.user) return { ok: false, error: "Sign-in failed. Try again." };

      const profile = await loadProfile(data.user.id);
      const actualRole =
        resolveAccountRole({
          profileRole: profile?.role,
          metaRole: data.user.user_metadata?.role,
        }) ?? "founder";

      // Hard lock: employee email can never enter Admin (company owner) portal
      if (actualRole !== expectedRole) {
        await supabase.auth.signOut();
        setUser(null);
        setUserId(null);
        storage.remove("user");
        return { ok: false, error: roleMismatchMessage(expectedRole, actualRole) };
      }

      await hydrateFromSupabase(
        data.user.id,
        data.user.email ?? email,
        data.user.user_metadata?.name as string | undefined,
        actualRole,
      );
      return { ok: true };
    }

    const registered = storage.get<
      { email: string; name: string; password: string; role?: UserRole }[]
    >("registered_users", []);
    const found = registered.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return { ok: false, error: "No account found. Please sign up first." };
    if (found.password !== password) return { ok: false, error: "Incorrect password." };

    const actualRole = resolveAccountRole({ storedRole: found.role }) ?? "founder";
    if (actualRole !== expectedRole) {
      return { ok: false, error: roleMismatchMessage(expectedRole, actualRole) };
    }

    setUser({
      email: found.email,
      name: found.name,
      role: actualRole,
      status: storage.get(`profile_status_${found.email.toLowerCase()}`, "online" as ProfileStatus),
    });
    setIntegrations(mergeIntegrations(storage.get(localIntegrationsKey(found.email), DEFAULT_INTEGRATIONS)));
    setIntegrationCreds(storage.get(localCredsKey(found.email), {}));
    setLeaveRequests(storage.get(localLeavesKey(), DEFAULT_LEAVES));
    return { ok: true };
  }

  async function register(
    email: string,
    name: string,
    password: string,
    role: UserRole,
  ): Promise<AuthResult> {
    if (!email.includes("@")) return { ok: false, error: "Enter a valid email address." };
    if (name.trim().length < 2) return { ok: false, error: "Enter your full name." };
    if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };

    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name.trim(), role } },
      });
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
          return {
            ok: false,
            error:
              role === "founder"
                ? "This email is already registered. Employee accounts cannot access Admin Login (company owner). Use Employee Login, or a different email for Admin."
                : "This email is already registered. Admin (company owner) accounts cannot access the Employee portal. Use Admin Login, or a different email for Employee.",
          };
        }
        return { ok: false, error: error.message };
      }

      if (!data.session) {
        if (data.user) {
          const existing = await loadProfile(data.user.id);
          const existingRole = resolveAccountRole({
            profileRole: existing?.role,
            metaRole: data.user.user_metadata?.role,
          });
          if (existingRole && existingRole !== role) {
            return { ok: false, error: roleMismatchMessage(role, existingRole) };
          }
          await upsertProfile(data.user.id, email, name.trim(), existingRole ?? role);
        }
        return {
          ok: false,
          error: "Check your email to confirm your account, then sign in.",
          needsEmailConfirm: true,
        };
      }

      const existing = await loadProfile(data.user!.id);
      const existingRole = resolveAccountRole({
        profileRole: existing?.role,
        metaRole: data.user!.user_metadata?.role,
      });
      if (existingRole && existingRole !== role) {
        await supabase.auth.signOut();
        setUser(null);
        setUserId(null);
        return { ok: false, error: roleMismatchMessage(role, existingRole) };
      }

      await upsertProfile(data.user!.id, email, name.trim(), existingRole ?? role);
      await hydrateFromSupabase(data.user!.id, email, name.trim(), existingRole ?? role);
      return { ok: true };
    }

    const registered = storage.get<
      { email: string; name: string; password: string; role?: UserRole }[]
    >("registered_users", []);
    const existing = registered.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      const existingRole = resolveAccountRole({ storedRole: existing.role }) ?? "founder";
      if (existingRole !== role) {
        return { ok: false, error: roleMismatchMessage(role, existingRole) };
      }
      return {
        ok: false,
        error:
          role === "employee"
            ? "An employee account with this email already exists. Sign in on Employee Login."
            : "An admin (company owner) account with this email already exists. Sign in on Admin Login.",
      };
    }
    storage.set("registered_users", [...registered, { email, name, password, role }]);
    setUser({ email, name, role, status: "online" });
    setIntegrations(DEFAULT_INTEGRATIONS.map((i) => ({ ...i })));
    setIntegrationCreds({});
    setLeaveRequests(storage.get(localLeavesKey(), DEFAULT_LEAVES));
    return { ok: true };
  }

  async function logout() {
    storage.remove("presentation_demo");
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setUserId(null);
    setIntegrations(DEFAULT_INTEGRATIONS.map((i) => ({ ...i })));
    setIntegrationCreds({});
    setLeaveRequests(storage.get(localLeavesKey(), DEFAULT_LEAVES));
    setLiveGitHub(null);
    setLiveStripe(null);
    storage.remove("user");
    skipCloudSave.current = true;
  }

  /** Local presentation session — bypasses Supabase so demos always work. */
  async function enterPresentationDemo(role: UserRole = "founder"): Promise<AuthResult> {
    try {
      // Flag first so any late Supabase SIGNED_OUT cannot wipe the demo user
      storage.set("presentation_demo", true);
      skipCloudSave.current = true;
      setUserId(null);

      if (supabase) {
        try {
          await supabase.auth.signOut();
        } catch {
          /* ignore */
        }
      }

      const email = role === "founder" ? "admin@copilot.ai" : "employee@copilot.ai";
      const name = role === "founder" ? "Demo Admin" : "Alex Employee";
      const password = "demo1234";

      const registered = storage.get<
        { email: string; name: string; password: string; role?: UserRole }[]
      >("registered_users", []);
      const existingIdx = registered.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
      const nextUser = { email, name, password, role };
      if (existingIdx >= 0) {
        registered[existingIdx] = nextUser;
        storage.set("registered_users", registered);
      } else {
        storage.set("registered_users", [...registered, nextUser]);
      }

      const appUser: AppUser = { email, name, role, status: "online" };
      storage.set("user", appUser);
      setUser(appUser);

      if (role === "founder") {
        const linked = DEFAULT_INTEGRATIONS.map((i) => ({
          ...i,
          connected: true,
          syncing: false,
          lastSynced: "Just now",
          accountLabel: i.id === "github" ? "startup-copilot (demo)" : `${name} · demo`,
        }));
        setIntegrations(linked);
        storage.set(localIntegrationsKey(email), linked);
        storage.set("integrations_v2", linked);
        setLiveGitHub(getPresentationGitHubData());
        setLiveStripe({
          connected: true,
          revenue: 248910,
          recentCharges: [
            { id: "ch_demo_1", amount: 12400, currency: "usd", status: "succeeded" },
            { id: "ch_demo_2", amount: 2890, currency: "usd", status: "succeeded" },
          ],
        });
        setLeaveRequests(storage.get(localLeavesKey(), DEFAULT_LEAVES));
        setNotifications((prev) => [
          {
            id: uid(),
            title: "Demo Admin ready — all 20 integrations linked",
            time: "Just now",
            read: false,
            type: "success",
            source: "System",
          },
          ...prev.slice(0, 29),
        ]);
      } else {
        setIntegrations(DEFAULT_INTEGRATIONS.map((i) => ({ ...i })));
        setLiveGitHub(null);
        setLiveStripe(null);
      }

      setIntegrationCreds({});
      setAuthReady(true);
      return { ok: true };
    } catch (e) {
      console.error("enterPresentationDemo failed:", e);
      return {
        ok: false,
        error: e instanceof Error ? e.message : "Demo login failed. Refresh and try again.",
      };
    }
  }

  async function resetAllAccounts(): Promise<{ ok: boolean; deleted: number; error?: string }> {
    storage.remove("presentation_demo");
    storage.clearAuthAccounts();
    setUser(null);
    setUserId(null);
    setIntegrations(DEFAULT_INTEGRATIONS.map((i) => ({ ...i })));
    setIntegrationCreds({});
    setLeaveRequests(DEFAULT_LEAVES);
    setLiveGitHub(null);
    setLiveStripe(null);
    skipCloudSave.current = true;
    if (supabase) {
      await supabase.auth.signOut();
    }
    const cloud = await wipeAllAuthUsers();
    return {
      ok: cloud.ok !== false,
      deleted: cloud.deleted ?? 0,
      error: cloud.error,
    };
  }

  function setProfileStatus(status: ProfileStatus) {
    setUser((prev) => {
      if (!prev) return prev;
      storage.set(`profile_status_${prev.email.toLowerCase()}`, status);
      return { ...prev, status };
    });
  }

  // ── Integrations ──────────────────────────────────────────────

  function getIntegrationCredentials(id: string): Record<string, string> {
    return { ...(integrationCredsRef.current[id] ?? {}) };
  }

  async function persistIntegrationLink(
    id: string,
    connected: boolean,
    creds: Record<string, string>,
    accountLabel: string | undefined,
    lastSynced: string | undefined,
  ) {
    const uid = userIdRef.current;
    if (uid) {
      if (connected) {
        await upsertUserIntegration(uid, {
          providerId: id,
          connected: true,
          accountLabel: accountLabel ?? null,
          credentials: creds,
          lastSynced: lastSynced ?? null,
        });
      } else {
        await deleteUserIntegration(uid, id);
      }
    }
  }

  async function connectIntegration(id: string, credentials: Record<string, string> = {}) {
    if (!userRef.current) {
      addNotification({
        title: "Sign in to link integrations to your account",
        type: "warning",
        source: "System",
      });
      return;
    }

    setIntegrations((prev) => prev.map((i) => (i.id === id ? { ...i, syncing: true } : i)));

    const merged = mergeWithEnvFallbacks(id, {
      ...(integrationCredsRef.current[id] ?? {}),
      ...credentials,
    });
    const label = accountLabelFromCreds(id, merged);

    let detailsMsg = `linked to your account (${label})`;
    let liveOk = false;

    if (id === "github") {
      if (merged.token && merged.repo) {
        const data = await fetchRealGitHubData(merged.token, merged.repo);
        if (data) {
          setLiveGitHub(data);
          liveOk = true;
          detailsMsg = `linked — ${data.openPrsCount} open PRs, ${data.openIssuesCount} issues, ${data.repos.length} repos`;
        } else {
          setLiveGitHub(getPresentationGitHubData());
          detailsMsg = "linked — presentation GitHub hub (live sync failed)";
        }
      } else {
        setLiveGitHub(getPresentationGitHubData());
        detailsMsg = "linked — presentation GitHub hub (repos, code & analysis ready)";
      }
    } else if (id === "stripe") {
      if (merged.secretKey) {
        const data = await fetchRealStripeData(merged.secretKey);
        if (data) {
          setLiveStripe(data);
          liveOk = true;
          detailsMsg = `linked — live Stripe feed (${data.recentCharges.length} recent charges)`;
        } else {
          setLiveStripe({
            connected: true,
            revenue: 248910,
            recentCharges: [
              { id: "ch_demo_1", amount: 12400, currency: "usd", status: "succeeded" },
              { id: "ch_demo_2", amount: 2100, currency: "usd", status: "failed" },
            ],
          });
          detailsMsg = "linked — Stripe dashboard ready (presentation data)";
        }
      } else {
        setLiveStripe({
          connected: true,
          revenue: 248910,
          recentCharges: [
            { id: "ch_demo_1", amount: 12400, currency: "usd", status: "succeeded" },
            { id: "ch_demo_2", amount: 2890, currency: "usd", status: "succeeded" },
            { id: "ch_demo_3", amount: 2100, currency: "usd", status: "failed" },
          ],
        });
        detailsMsg = "linked — Stripe dashboard ready (presentation data)";
      }
    } else if (id === "slack" && merged.webhookUrl) {
      const ok = await sendLiveSlackNotification(
        merged.webhookUrl,
        `✅ Startup Copilot OS: Slack linked to ${userRef.current.name}'s account.`,
      );
      detailsMsg = ok
        ? "linked — live Slack webhook verified"
        : "linked to account (Slack webhook test failed)";
      liveOk = ok;
    } else {
      await new Promise((r) => setTimeout(r, 900));
      if (hasAnyCredential(merged)) {
        detailsMsg = `linked to your account with credentials (${label})`;
      } else {
        detailsMsg = "linked in presentation mode — intelligence unlocked";
      }
    }

    const lastSynced = liveOk ? "Live just now" : "Just now";

    setIntegrationCreds((prev) => ({ ...prev, [id]: merged }));
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              syncing: false,
              connected: true,
              lastSynced,
              accountLabel: label,
            }
          : i,
      ),
    );

    await persistIntegrationLink(id, true, merged, label, lastSynced);

    const name = integrations.find((i) => i.id === id)?.name ?? id;
    addNotification({
      title: `${name} ${detailsMsg}`,
      type: liveOk ? "success" : "info",
      source: "System",
    });
  }

  async function disconnectIntegration(id: string) {
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, connected: false, lastSynced: undefined, accountLabel: undefined, syncing: false }
          : i,
      ),
    );
    setIntegrationCreds((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (id === "github") setLiveGitHub(null);
    if (id === "stripe") setLiveStripe(null);
    await persistIntegrationLink(id, false, {}, undefined, undefined);

    const name = integrations.find((i) => i.id === id)?.name ?? id;
    addNotification({
      title: `${name} disconnected from your account`,
      type: "info",
      source: "System",
    });
  }

  async function connectAllIntegrations() {
    if (!userRef.current) {
      addNotification({
        title: "Sign in to link integrations to your account",
        type: "warning",
        source: "System",
      });
      return;
    }
    const pending = integrations.filter((i) => !i.connected);
    for (const item of pending) {
      await connectIntegration(item.id, integrationCredsRef.current[item.id] ?? {});
    }
    addNotification({
      title: `Presentation ready — linked ${pending.length || integrations.length} tools with intelligence views`,
      type: "success",
      source: "System",
    });
  }

  // ── Agents ────────────────────────────────────────────────────

  function buildAgentContext(): AgentRunContext {
    const connected = integrations.filter((i) => i.connected).map((i) => i.name);
    const active = agentsRef.current.filter((a) => a.active).map((a) => a.name);
    const atRisk = customerAccounts
      .filter((c) => c.health === "at-risk" || c.ticketsOpen > 2)
      .slice(0, 5)
      .map((c) => ({ name: c.name, arr: c.arr, ticketsOpen: c.ticketsOpen }));

    return {
      userName: user?.name,
      businessHealth,
      revenue,
      customers,
      burnRate,
      runway,
      teamPRs,
      connectedIntegrations: connected,
      activeAgents: active,
      atRiskCustomers: atRisk,
    };
  }

  async function runAgent(id: string) {
    if (runningRef.current[id]) return;

    const agent = agentsRef.current.find((a) => a.id === id);
    if (!agent) return;

    setRunningAgents((prev) => ({ ...prev, [id]: true }));
    setAgents((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, recentAction: "⏳ Running OpenAI cycle…" } : a,
      ),
    );

    try {
      const result = await runAgentCycle(id, buildAgentContext());
      const engineTag = result.usedEngine === "openai" ? "OpenAI" : "mock";
      const actionLine = `${result.action}${result.error ? ` [${engineTag} fallback]` : ` [${engineTag}]`}`;

      setAgents((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                tasksCompleted: a.tasksCompleted + 1,
                recentAction: actionLine,
              }
            : a,
        ),
      );

      if (result.alert?.title) {
        addNotification({
          title: result.alert.title,
          type: result.alert.type,
          source: agent.name,
        });
      } else {
        addNotification({
          title: `${agent.name}: ${result.summary}`,
          type: "info",
          source: agent.name,
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setAgents((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, recentAction: `❌ Cycle failed — ${msg.slice(0, 120)}` }
            : a,
        ),
      );
      addNotification({
        title: `${agent.name} failed: ${msg.slice(0, 100)}`,
        type: "error",
        source: "System",
      });
    } finally {
      setRunningAgents((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  }

  runAgentRef.current = runAgent;

  async function runAllAgents() {
    const active = agentsRef.current.filter((a) => a.active);
    for (const agent of active) {
      await runAgentRef.current(agent.id);
    }
  }

  function toggleAgent(id: string) {
    setAgents((prev) => prev.map((a) => {
      if (a.id !== id) return a;
      const nowActive = !a.active;
      if (nowActive) {
        addNotification({
          title: `${a.name} activated — background monitoring started`,
          type: "success",
          source: "System",
        });
      }
      return {
        ...a,
        active: nowActive,
        recentAction: nowActive ? "Agent activated — monitoring started" : "Inactive — activate to start monitoring",
      };
    }));
  }

  // Background ticks: rotate one active agent every 90s (avoids OpenAI rate spam)
  useEffect(() => {
    if (!authReady || !user) return;

    const kickoff = window.setTimeout(() => {
      if (initialAgentKickoff.current) return;
      initialAgentKickoff.current = true;
      const first = agentsRef.current.find((a) => a.active);
      if (first) void runAgentRef.current(first.id);
    }, 2500);

    const interval = window.setInterval(() => {
      const active = agentsRef.current.filter((a) => a.active);
      if (active.length === 0) return;
      const idx = bgTickIndex.current % active.length;
      bgTickIndex.current += 1;
      const next = active[idx];
      if (next && !runningRef.current[next.id]) {
        void runAgentRef.current(next.id);
      }
    }, 90_000);

    return () => {
      window.clearTimeout(kickoff);
      window.clearInterval(interval);
    };
  }, [authReady, user?.email]);

  // ── Chat ─────────────────────────────────────────────────────

  function sendChatMessage(text: string) {
    const userMsg: Message = { id: uid(), sender: "user", text, timestamp: nowTime() };
    setChatHistory((prev) => [...prev, userMsg]);
    setIsTyping(true);

    const history = chatRef.current.slice(-10).map((m) => ({
      role: (m.sender === "user" ? "user" : "model") as "user" | "model",
      text: m.text,
    }));

    const ctx = {
      integrations,
      businessHealth,
      revenue,
      customers,
      userName: user?.name,
      githubSummary: liveGitHub
        ? `${liveGitHub.openPrsCount} open PRs, ${liveGitHub.openIssuesCount} issues, ${(liveGitHub.repos?.length ?? 0)} repos (${liveGitHub.mode ?? "demo"})`
        : undefined,
    };

    getAIResponse(text, history, ctx)
      .then((response) => {
        setChatHistory((prev) => [...prev, { id: uid(), sender: "assistant", text: response, timestamp: nowTime() }]);
      })
      .catch(() => {
        setChatHistory((prev) => [...prev, {
          id: uid(), sender: "assistant",
          text: "I ran into an issue. Please try again.",
          timestamp: nowTime(),
        }]);
      })
      .finally(() => setIsTyping(false));
  }

  function clearChat() {
    setChatHistory([WELCOME_MESSAGE]);
    storage.remove("chat_v2");
  }

  // ── Recommendations ───────────────────────────────────────────

  function resolveRecommendation(id: string, text: string) {
    addNotification({
      title: `Agent executed: "${text}" — completed`,
      type: "success",
      source: "AI Agent",
    });
  }

  // ── Notifications ─────────────────────────────────────────────

  function addNotification(partial: Pick<AppNotification, "title" | "type" | "source">) {
    const n: AppNotification = { id: uid(), title: partial.title, time: "Just now", read: false, type: partial.type, source: partial.source };
    setNotifications((prev) => [n, ...prev.slice(0, 29)]);
  }

  async function submitLeaveRequest(input: {
    employeeName: string;
    employeeEmail: string;
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
  }) {
    const days = countLeaveDays(input.startDate, input.endDate);
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : uid();
    const createdAt = new Date().toISOString();
    const request: LeaveRequest = {
      id,
      employeeName: input.employeeName.trim(),
      employeeEmail: input.employeeEmail.trim().toLowerCase(),
      leaveType: input.leaveType,
      startDate: input.startDate,
      endDate: input.endDate,
      days,
      reason: input.reason.trim(),
      status: "pending",
      emailSent: false,
      createdAt,
    };

    setLeaveRequests((prev) => [request, ...prev]);

    if (userIdRef.current) {
      await insertLeaveRequest(userIdRef.current, {
        id,
        employeeName: request.employeeName,
        employeeEmail: request.employeeEmail,
        leaveType: request.leaveType,
        startDate: request.startDate,
        endDate: request.endDate,
        days: request.days,
        reason: request.reason,
      });
    }

    addNotification({
      title: `Leave request from ${request.employeeName} (${request.days} day${request.days === 1 ? "" : "s"}) — pending approval`,
      type: "warning",
      source: "Leave Portal",
    });
  }

  async function reviewLeaveRequest(
    id: string,
    status: "approved" | "rejected",
    reviewerNote?: string,
  ): Promise<{ emailMethod?: string; emailOk?: boolean }> {
    const current = leaveRequests.find((l) => l.id === id);
    if (!current || current.status !== "pending") return {};

    let emailOk = false;
    let emailMethod: string | undefined;

    try {
      const result = await sendLeaveDecisionEmail({
        data: {
          to: current.employeeEmail,
          employeeName: current.employeeName,
          leaveType: current.leaveType,
          startDate: current.startDate,
          endDate: current.endDate,
          days: current.days,
          status,
          reviewerNote,
          companyName: "Startup Copilot OS",
        },
      });

      emailMethod = result.method;
      emailOk = result.ok;

      if (result.method === "mailto" && "mailto" in result && result.mailto) {
        // Open the user's mail client with a pre-filled approval email
        window.open(result.mailto, "_blank");
        emailOk = true;
      } else if (!result.ok && "mailto" in result && result.mailto) {
        window.open(result.mailto, "_blank");
      }
    } catch (e) {
      console.warn("Leave email failed:", e);
      // Fallback mailto
      const subject =
        status === "approved"
          ? "Your leave request has been approved"
          : "Update on your leave request";
      const body = `Hi ${current.employeeName},\n\nYour ${current.leaveType} leave (${current.startDate} → ${current.endDate}) has been ${status}.\n\n— HR`;
      window.open(
        `mailto:${encodeURIComponent(current.employeeEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
        "_blank",
      );
      emailMethod = "mailto";
      emailOk = true;
    }

    const reviewedAt = new Date().toISOString();
    setLeaveRequests((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status,
              reviewerNote,
              emailSent: emailOk,
              reviewedAt,
            }
          : l,
      ),
    );

    if (userIdRef.current) {
      await updateLeaveRequestStatus(userIdRef.current, id, {
        status,
        reviewerNote,
        emailSent: emailOk,
      });
    }

    addNotification({
      title:
        status === "approved"
          ? `Approved leave for ${current.employeeName} — email ${emailOk ? "sent" : "queued"} to ${current.employeeEmail}`
          : `Rejected leave for ${current.employeeName} — employee notified`,
      type: status === "approved" ? "success" : "info",
      source: "Leave Portal",
    });

    return { emailMethod, emailOk };
  }

  function clearNotifications() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markNotificationRead(id: string) {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  return (
    <AppStateContext.Provider value={{
      isAuthenticated: user !== null,
      authReady,
      authBackend: isSupabaseConfigured ? "supabase" : "local",
      user,
      integrations,
      agents,
      chatHistory,
      notifications,
      teamMembers,
      customerAccounts,
      revenueHistory,
      leaveRequests,
      liveGitHub,
      liveStripe,
      businessHealth,
      revenue,
      customers,
      teamPRs,
      burnRate,
      runway,
      isTyping,
      runningAgents,
      login,
      register,
      logout,
      enterPresentationDemo,
      resetAllAccounts,
      setProfileStatus,
      connectIntegration,
      disconnectIntegration,
      connectAllIntegrations,
      getIntegrationCredentials,
      toggleAgent,
      runAgent,
      runAllAgents,
      sendChatMessage,
      clearChat,
      resolveRecommendation,
      clearNotifications,
      markNotificationRead,
      refreshLiveData,
      submitLeaveRequest,
      reviewLeaveRequest,
    }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextType {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
