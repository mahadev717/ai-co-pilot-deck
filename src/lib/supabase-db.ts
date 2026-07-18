/**
 * Startup Copilot OS — Supabase data helpers
 */

import { supabase, isSupabaseConfigured } from "./supabase";
import type { Json } from "./database.types";

export type WorkspacePayload = {
  integrations: unknown;
  agents: unknown;
  chat_history: unknown;
  notifications: unknown;
};

export type UserIntegrationRow = {
  provider_id: string;
  connected: boolean;
  account_label: string | null;
  credentials: Record<string, string>;
  last_synced: string | null;
};

export async function upsertProfile(
  userId: string,
  email: string,
  name: string,
  role: "founder" | "employee" = "founder",
) {
  if (!supabase) return;

  // Lock role: once set, do not allow the opposite portal to overwrite it
  const { data: existing } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  const existingRole =
    existing?.role === "employee" || existing?.role === "founder" ? existing.role : null;
  const lockedRole = existingRole ?? role;

  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email,
      name,
      role: lockedRole,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (error) console.error("Failed to upsert profile:", error.message);
  return lockedRole as "founder" | "employee";
}

export async function loadProfile(userId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, name, role")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.error("Failed to load profile:", error.message);
    return null;
  }
  return data;
}

export async function loadWorkspace(userId: string): Promise<WorkspacePayload | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("user_workspace")
    .select("integrations, agents, chat_history, notifications")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("Failed to load workspace:", error.message);
    return null;
  }
  if (!data) return null;
  return {
    integrations: data.integrations,
    agents: data.agents,
    chat_history: data.chat_history,
    notifications: data.notifications,
  };
}

export async function saveWorkspace(userId: string, payload: WorkspacePayload) {
  if (!supabase) return;
  const { error } = await supabase.from("user_workspace").upsert(
    {
      user_id: userId,
      integrations: payload.integrations as Json,
      agents: payload.agents as Json,
      chat_history: payload.chat_history as Json,
      notifications: payload.notifications as Json,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) console.error("Failed to save workspace:", error.message);
}

function asCredMap(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "string" && v.trim()) out[k] = v;
  }
  return out;
}

export async function loadUserIntegrations(userId: string): Promise<UserIntegrationRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("user_integrations")
    .select("provider_id, connected, account_label, credentials, last_synced")
    .eq("user_id", userId);
  if (error) {
    // Table may not exist yet — fail soft
    console.warn("loadUserIntegrations:", error.message);
    return [];
  }
  return (data ?? []).map((row) => ({
    provider_id: row.provider_id,
    connected: row.connected,
    account_label: row.account_label,
    credentials: asCredMap(row.credentials),
    last_synced: row.last_synced,
  }));
}

export async function upsertUserIntegration(
  userId: string,
  row: {
    providerId: string;
    connected: boolean;
    accountLabel?: string | null;
    credentials?: Record<string, string>;
    lastSynced?: string | null;
  },
) {
  if (!supabase) return;
  const { error } = await supabase.from("user_integrations").upsert(
    {
      user_id: userId,
      provider_id: row.providerId,
      connected: row.connected,
      account_label: row.accountLabel ?? null,
      credentials: (row.credentials ?? {}) as Json,
      last_synced: row.lastSynced ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,provider_id" },
  );
  if (error) console.warn("upsertUserIntegration:", error.message);
}

export async function deleteUserIntegration(userId: string, providerId: string) {
  if (!supabase) return;
  const { error } = await supabase
    .from("user_integrations")
    .delete()
    .eq("user_id", userId)
    .eq("provider_id", providerId);
  if (error) console.warn("deleteUserIntegration:", error.message);
}

export type LeaveRequestRow = {
  id: string;
  employee_name: string;
  employee_email: string;
  leave_type: "annual" | "sick" | "personal" | "unpaid" | "other";
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  reviewer_note: string | null;
  email_sent: boolean;
  reviewed_at: string | null;
  created_at: string;
};

export async function loadLeaveRequests(userId: string): Promise<LeaveRequestRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("leave_requests")
    .select(
      "id, employee_name, employee_email, leave_type, start_date, end_date, days, reason, status, reviewer_note, email_sent, reviewed_at, created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("loadLeaveRequests:", error.message);
    return [];
  }
  return (data ?? []) as LeaveRequestRow[];
}

export async function insertLeaveRequest(
  userId: string,
  row: {
    id?: string;
    employeeName: string;
    employeeEmail: string;
    leaveType: LeaveRequestRow["leave_type"];
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
  },
): Promise<LeaveRequestRow | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("leave_requests")
    .insert({
      id: row.id,
      user_id: userId,
      employee_name: row.employeeName,
      employee_email: row.employeeEmail,
      leave_type: row.leaveType,
      start_date: row.startDate,
      end_date: row.endDate,
      days: row.days,
      reason: row.reason,
      status: "pending",
    })
    .select(
      "id, employee_name, employee_email, leave_type, start_date, end_date, days, reason, status, reviewer_note, email_sent, reviewed_at, created_at",
    )
    .single();
  if (error) {
    console.warn("insertLeaveRequest:", error.message);
    return null;
  }
  return data as LeaveRequestRow;
}

export async function updateLeaveRequestStatus(
  userId: string,
  leaveId: string,
  patch: {
    status: "approved" | "rejected";
    reviewerNote?: string;
    emailSent?: boolean;
  },
) {
  if (!supabase) return;
  const { error } = await supabase
    .from("leave_requests")
    .update({
      status: patch.status,
      reviewer_note: patch.reviewerNote ?? null,
      email_sent: patch.emailSent ?? false,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("id", leaveId);
  if (error) console.warn("updateLeaveRequestStatus:", error.message);
}

export { isSupabaseConfigured };
