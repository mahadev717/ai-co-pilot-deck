/**
 * Startup Copilot OS — Server-only Supabase admin client
 *
 * Uses SUPABASE_SECRET_KEY (never VITE_). Bypasses RLS for seeding / admin tasks.
 * Import only from createServerFn handlers or other server code.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

function readEnv(name: string): string | undefined {
  // Vite server + Node
  const fromVite = (import.meta as ImportMeta & { env?: Record<string, string> }).env?.[name];
  if (fromVite) return fromVite.trim();
  if (typeof process !== "undefined" && process.env?.[name]) {
    return process.env[name]!.trim();
  }
  return undefined;
}

const url = readEnv("VITE_SUPABASE_URL") || readEnv("SUPABASE_URL");
const secretKey =
  readEnv("SUPABASE_SECRET_KEY") ||
  readEnv("SUPABASE_SERVICE_ROLE_KEY");

function isValidUrl(value?: string) {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

export const isServerSupabaseConfigured = isValidUrl(url) && Boolean(secretKey);

let admin: SupabaseClient<Database> | null = null;

export function getSupabaseAdmin(): SupabaseClient<Database> | null {
  if (!isServerSupabaseConfigured) return null;
  if (!admin) {
    admin = createClient<Database>(url!, secretKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return admin;
}
