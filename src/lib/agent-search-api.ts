/**
 * Server functions for AgentSearch health + proxied search
 */

import { createServerFn } from "@tanstack/react-start";
import {
  runAgentWebSearch,
  getAgentSearchBaseUrl,
  isAgentSearchLiveEnabled,
  type SearchResponse,
} from "./agent-search";

export const checkAgentSearch = createServerFn({ method: "GET" }).handler(async () => {
  // Demo mode: dummy AgentSearch is always "online"
  if (!isAgentSearchLiveEnabled()) {
    return {
      ok: true as const,
      url: "demo://agent-search",
      status: "demo" as const,
      provider: "dummy" as const,
      hint: "Using curated dummy results. Set VITE_AGENT_SEARCH_LIVE=true to use Docker AgentSearch.",
    };
  }

  const base = getAgentSearchBaseUrl();
  try {
    const res = await fetch(`${base}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      return { ok: true as const, url: base, status: "online" as const, provider: "agent-search" as const };
    }
    const engines = await fetch(`${base}/engines`, { signal: AbortSignal.timeout(3000) });
    if (engines.ok) {
      return { ok: true as const, url: base, status: "online" as const, provider: "agent-search" as const };
    }
    return {
      ok: true as const,
      url: base,
      status: "demo" as const,
      provider: "dummy" as const,
      http: res.status,
      hint: "Live AgentSearch offline — using dummy results",
    };
  } catch {
    return {
      ok: true as const,
      url: base,
      status: "demo" as const,
      provider: "dummy" as const,
      hint: "Live AgentSearch offline — using dummy results. Start with: docker compose -f docker-compose.agent-search.yml up -d",
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
