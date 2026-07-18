/**
 * Startup Copilot OS — Server functions (backend API layer)
 */

import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin, isServerSupabaseConfigured } from "@/lib/supabase.server";
import type { Database } from "@/lib/database.types";

function readEnv(name: string): string | undefined {
  const fromVite = (import.meta as ImportMeta & { env?: Record<string, string> }).env?.[name];
  if (fromVite) return fromVite.trim();
  if (typeof process !== "undefined" && process.env?.[name]) {
    return process.env[name]!.trim();
  }
  return undefined;
}

function getPublicConfig() {
  const url = readEnv("VITE_SUPABASE_URL") || readEnv("SUPABASE_URL");
  const anon =
    readEnv("VITE_SUPABASE_ANON_KEY") ||
    readEnv("VITE_SUPABASE_PUBLISHABLE_KEY");
  let urlOk = false;
  try {
    if (url) {
      const u = new URL(url);
      urlOk = u.protocol === "https:" && u.hostname.length > 3;
    }
  } catch {
    urlOk = false;
  }
  return { url, anon, urlOk, hasAnon: Boolean(anon), hasSecret: isServerSupabaseConfigured };
}

/** Health / config check — safe to call from the client */
export const checkSupabaseBackend = createServerFn({ method: "GET" }).handler(async () => {
  const cfg = getPublicConfig();
  if (!cfg.urlOk || !cfg.hasAnon) {
    return {
      ok: false as const,
      message:
        "Missing VITE_SUPABASE_URL. Set it to https://YOUR_PROJECT.supabase.co from Project Settings → API.",
      config: {
        hasUrl: cfg.urlOk,
        hasAnonKey: cfg.hasAnon,
        hasSecretKey: cfg.hasSecret,
      },
    };
  }

  try {
    const client = createClient(cfg.url!, cfg.anon!);
    // Lightweight auth endpoint ping
    const { error } = await client.auth.getSession();
    if (error) {
      return {
        ok: false as const,
        message: `Auth ping failed: ${error.message}`,
        config: { hasUrl: true, hasAnonKey: true, hasSecretKey: cfg.hasSecret },
      };
    }

    // Check if schema tables exist (via REST)
    const tablesRes = await fetch(`${cfg.url}/rest/v1/profiles?select=id&limit=1`, {
      headers: {
        apikey: cfg.anon!,
        Authorization: `Bearer ${cfg.anon!}`,
      },
    });

    const schemaReady = tablesRes.status !== 404;
    // 401/200/406 all mean the route exists; 404 / PGRST205 means table missing
    const bodyText = await tablesRes.text();
    const tableMissing =
      tablesRes.status === 404 ||
      bodyText.includes("Could not find the table") ||
      bodyText.includes("PGRST205");

    return {
      ok: true as const,
      message: tableMissing
        ? "Connected to Supabase, but schema is not applied yet. Run supabase/schema.sql in the SQL Editor."
        : "Supabase backend is reachable.",
      schemaReady: !tableMissing && schemaReady,
      config: { hasUrl: true, hasAnonKey: true, hasSecretKey: cfg.hasSecret },
    };
  } catch (e) {
    return {
      ok: false as const,
      message: e instanceof Error ? e.message : "Failed to reach Supabase",
      config: { hasUrl: cfg.urlOk, hasAnonKey: cfg.hasAnon, hasSecretKey: cfg.hasSecret },
    };
  }
});

/**
 * Delete every Supabase Auth user (and cascading profile rows) so emails can be
 * re-registered from scratch. Requires SUPABASE_SECRET_KEY on the server.
 */
export const wipeAllAuthUsers = createServerFn({ method: "POST" }).handler(async () => {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return {
      ok: false as const,
      deleted: 0,
      error:
        "SUPABASE_SECRET_KEY is not set. Local accounts were still cleared — delete users in Supabase Dashboard → Authentication → Users, or set the secret key and try again.",
    };
  }

  let deleted = 0;
  const errors: string[] = [];

  // Paginate through auth users and delete each one
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) {
      return { ok: false as const, deleted, error: error.message };
    }
    const users = data.users ?? [];
    if (users.length === 0) break;

    for (const u of users) {
      const { error: delErr } = await admin.auth.admin.deleteUser(u.id);
      if (delErr) errors.push(`${u.email ?? u.id}: ${delErr.message}`);
      else deleted += 1;
    }

    if (users.length < 100) break;
  }

  // Extra cleanup for orphaned profile / workspace rows
  await admin.from("profiles").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  return {
    ok: errors.length === 0,
    deleted,
    error: errors.length ? errors.slice(0, 5).join("; ") : undefined,
  };
});

/** Seed demo customers / revenue / team for the signed-in user */
export const seedUserDemoData = createServerFn({ method: "POST" })
  .validator((d: { accessToken: string }) => d)
  .handler(async ({ data }) => {
    const cfg = getPublicConfig();
    if (!cfg.urlOk || !cfg.hasAnon) {
      return { ok: false as const, error: "Supabase URL / anon key not configured." };
    }

    const userClient = createClient<Database>(cfg.url!, cfg.anon!, {
      global: { headers: { Authorization: `Bearer ${data.accessToken}` } },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser(data.accessToken);
    if (userErr || !userData.user) {
      return { ok: false as const, error: userErr?.message ?? "Not authenticated." };
    }

    const userId = userData.user.id;

    // Prefer RPC (security definer). Fall back to admin client inserts.
    const { error: rpcError } = await userClient.rpc("seed_demo_data", { p_user_id: userId });
    if (!rpcError) {
      return { ok: true as const, seeded: true, method: "rpc" as const };
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return {
        ok: false as const,
        error: `seed_demo_data RPC failed (${rpcError.message}). Apply schema.sql and set SUPABASE_SECRET_KEY.`,
      };
    }

    // Admin path: call same RPC with elevated client
    const { error: adminErr } = await admin.rpc("seed_demo_data", { p_user_id: userId });
    if (adminErr) {
      return { ok: false as const, error: adminErr.message };
    }
    return { ok: true as const, seeded: true, method: "admin" as const };
  });

/** Load relational business data for the signed-in user */
export const loadBusinessData = createServerFn({ method: "POST" })
  .validator((d: { accessToken: string }) => d)
  .handler(async ({ data }) => {
    const cfg = getPublicConfig();
    if (!cfg.urlOk || !cfg.hasAnon) {
      return { ok: false as const, error: "Supabase not configured." };
    }

    const client = createClient<Database>(cfg.url!, cfg.anon!, {
      global: { headers: { Authorization: `Bearer ${data.accessToken}` } },
    });

    const { data: userData, error: userErr } = await client.auth.getUser(data.accessToken);
    if (userErr || !userData.user) {
      return { ok: false as const, error: "Not authenticated." };
    }

    const userId = userData.user.id;

    const [customers, revenue, team, metrics] = await Promise.all([
      client.from("customers").select("*").eq("user_id", userId).order("arr", { ascending: false }),
      client.from("revenue_snapshots").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
      client.from("team_members").select("*").eq("user_id", userId).order("name"),
      client.from("business_metrics").select("*").eq("user_id", userId).maybeSingle(),
    ]);

    // Auto-seed if empty
    if ((customers.data?.length ?? 0) === 0 && !customers.error) {
      await client.rpc("seed_demo_data", { p_user_id: userId });
      const [c2, r2, t2, m2] = await Promise.all([
        client.from("customers").select("*").eq("user_id", userId).order("arr", { ascending: false }),
        client.from("revenue_snapshots").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
        client.from("team_members").select("*").eq("user_id", userId).order("name"),
        client.from("business_metrics").select("*").eq("user_id", userId).maybeSingle(),
      ]);
      return {
        ok: true as const,
        customers: c2.data ?? [],
        revenue: r2.data ?? [],
        team: t2.data ?? [],
        metrics: m2.data,
        seeded: true,
      };
    }

    return {
      ok: true as const,
      customers: customers.data ?? [],
      revenue: revenue.data ?? [],
      team: team.data ?? [],
      metrics: metrics.data,
      seeded: false,
      errors: {
        customers: customers.error?.message,
        revenue: revenue.error?.message,
        team: team.error?.message,
        metrics: metrics.error?.message,
      },
    };
  });