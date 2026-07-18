/**
 * Server functions for AgentSearch health + proxied search
 */

import { createServerFn } from "@tanstack/react-start";
import { runAgentWebSearch, getAgentSearchBaseUrl, type SearchResponse } from "./agent-search";

export const checkAgentSearch = createServerFn({ method: "GET" }).handler(async () => {
  const base = getAgentSearchBaseUrl();
  try {
    const res = await fetch(`${base}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    // Some builds use / or /engines as health
    if (res.ok) {
      return { ok: true as const, url: base, status: "online" as const };
    }
    const engines = await fetch(`${base}/engines`, { signal: AbortSignal.timeout(3000) });
    if (engines.ok) {
      return { ok: true as const, url: base, status: "online" as const };
    }
    return { ok: false as const, url: base, status: "offline" as const, http: res.status };
  } catch {
    return {
      ok: false as const,
      url: base,
      status: "offline" as const,
      hint: "Start with: docker compose -f docker-compose.agent-search.yml up -d",
    };
  }
});

export const agentWebSearch = createServerFn({ method: "POST" })
  .validator((d: { query: string; limit?: number }) => d)
  .handler(async ({ data }): Promise<SearchResponse> => {
    const q = data.query?.trim();
    if (!q) {
      return { ok: false, query: "", provider: "none", results: [], error: "Empty query" };
    }
    return runAgentWebSearch(q, data.limit ?? 6);
  });
