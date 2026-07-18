/**
 * Startup Copilot OS — Browser Supabase client
 *
 * Uses Project URL + publishable/anon key (safe in the browser).
 * Secret keys must NEVER use a VITE_ prefix.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const anonKey = (
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)
)?.trim();

/** True when URL looks like a real Supabase project URL */
function isValidSupabaseUrl(value?: string): boolean {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === "https:" && u.hostname.includes("supabase");
  } catch {
    return false;
  }
}

export const isSupabaseConfigured =
  (import.meta.env.VITE_SUPABASE_ENABLED as string | undefined) !== "false" &&
  isValidSupabaseUrl(url) &&
  Boolean(anonKey);

export type { Database };

let client: SupabaseClient<Database> | null = null;

if (isSupabaseConfigured) {
  client = createClient<Database>(url!, anonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export const supabase = client;

export function requireSupabase(): SupabaseClient<Database> {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL (https://xxxx.supabase.co) and VITE_SUPABASE_ANON_KEY.",
    );
  }
  return supabase;
}

export function getSupabaseConfigStatus() {
  return {
    configured: isSupabaseConfigured,
    hasUrl: isValidSupabaseUrl(url),
    hasAnonKey: Boolean(anonKey),
    urlHost: isValidSupabaseUrl(url) ? new URL(url!).host : null,
  };
}
