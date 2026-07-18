/**
 * Startup Copilot OS — AgentSearch client
 *
 * Default: Demo AgentSearch (dummy curated results) — no Docker required
 * Optional live: brcrusoe72/agent-search on localhost:3939 when VITE_AGENT_SEARCH_LIVE=true
 * Fallback chain when live enabled: AgentSearch → DuckDuckGo → Dummy
 */

import { searchWithDummyAgentSearch } from "./agent-search-dummy";

export type SearchHit = {
  title: string;
  url: string;
  snippet: string;
  score?: number;
  source?: string;
};

export type SearchResponse = {
  ok: boolean;
  query: string;
  provider: "agent-search" | "duckduckgo" | "dummy" | "none";
  results: SearchHit[];
  error?: string;
};

const AGENT_SEARCH_URL = (
  (typeof process !== "undefined" && process.env?.AGENT_SEARCH_URL) ||
  (import.meta.env?.VITE_AGENT_SEARCH_URL as string | undefined) ||
  "http://127.0.0.1:3939"
).replace(/\/$/, "");

const AGENT_SEARCH_TOKEN =
  (typeof process !== "undefined" && process.env?.AGENT_SEARCH_TOKEN) ||
  (import.meta.env?.VITE_AGENT_SEARCH_TOKEN as string | undefined) ||
  "";

/** Live Docker AgentSearch only when explicitly enabled (avoids ERR_CONNECTION_REFUSED in demos) */
const LIVE_AGENT_SEARCH =
  (typeof process !== "undefined" && process.env?.AGENT_SEARCH_LIVE === "true") ||
  import.meta.env?.VITE_AGENT_SEARCH_LIVE === "true";

/** Heuristic: should this chat turn trigger a live web search? */
export function needsWebSearch(message: string): boolean {
  const q = message.toLowerCase();
  const triggers = [
    "search",
    "google",
    "look up",
    "lookup",
    "latest",
    "news",
    "what happened",
    "market",
    "competitor",
    "competitors",
    "trend",
    "trends",
    "research",
    "who is",
    "funding",
    "ipo",
    "acquisition",
    "announce",
    "web search",
    "find online",
    "current",
    "today",
    "this week",
  ];
  return triggers.some((t) => q.includes(t));
}

function authHeaders(): HeadersInit {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (AGENT_SEARCH_TOKEN) headers.Authorization = `Bearer ${AGENT_SEARCH_TOKEN}`;
  return headers;
}

/** Call local AgentSearch /search (only when live mode is on) */
export async function searchWithAgentSearch(
  query: string,
  limit = 6,
): Promise<SearchResponse> {
  if (!LIVE_AGENT_SEARCH) {
    return searchWithDummyAgentSearch(query, limit);
  }

  try {
    const url = `${AGENT_SEARCH_URL}/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    const res = await fetch(url, {
      headers: authHeaders(),
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) {
      return {
        ok: false,
        query,
        provider: "agent-search",
        results: [],
        error: `AgentSearch HTTP ${res.status}`,
      };
    }
    const data = await res.json();
    const raw: unknown[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data?.items)
          ? data.items
          : [];

    const results: SearchHit[] = raw
      .slice(0, limit)
      .map((item: any) => ({
        title: String(item.title || item.name || "Untitled"),
        url: String(item.url || item.link || item.href || ""),
        snippet: String(
          item.content || item.snippet || item.description || item.text || "",
        ).slice(0, 320),
        score: typeof item.score === "number" ? item.score : undefined,
        source: "agent-search",
      }))
      .filter((r) => r.url);

    return { ok: true, query, provider: "agent-search", results };
  } catch (e) {
    return {
      ok: false,
      query,
      provider: "agent-search",
      results: [],
      error: e instanceof Error ? e.message : "AgentSearch unreachable",
    };
  }
}

/** Lightweight fallback when Docker AgentSearch is not running */
async function searchWithDuckDuckGo(query: string, limit = 5): Promise<SearchResponse> {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8_000) });
    if (!res.ok) {
      return { ok: false, query, provider: "duckduckgo", results: [], error: `DDG HTTP ${res.status}` };
    }
    const data = await res.json();
    const results: SearchHit[] = [];

    if (data.AbstractText && data.AbstractURL) {
      results.push({
        title: data.Heading || query,
        url: data.AbstractURL,
        snippet: data.AbstractText,
        source: "duckduckgo",
      });
    }

    for (const t of data.RelatedTopics || []) {
      if (results.length >= limit) break;
      if (t.Text && t.FirstURL) {
        results.push({
          title: t.Text.split(" - ")[0] || t.Text.slice(0, 80),
          url: t.FirstURL,
          snippet: t.Text,
          source: "duckduckgo",
        });
      } else if (Array.isArray(t.Topics)) {
        for (const nested of t.Topics) {
          if (results.length >= limit) break;
          if (nested.Text && nested.FirstURL) {
            results.push({
              title: nested.Text.split(" - ")[0] || nested.Text.slice(0, 80),
              url: nested.FirstURL,
              snippet: nested.Text,
              source: "duckduckgo",
            });
          }
        }
      }
    }

    return { ok: results.length > 0, query, provider: "duckduckgo", results };
  } catch (e) {
    return {
      ok: false,
      query,
      provider: "duckduckgo",
      results: [],
      error: e instanceof Error ? e.message : "DuckDuckGo failed",
    };
  }
}

/**
 * Prefer demo dummy search by default.
 * If VITE_AGENT_SEARCH_LIVE=true: AgentSearch → DuckDuckGo → Dummy
 */
export async function runAgentWebSearch(query: string, limit = 6): Promise<SearchResponse> {
  if (!LIVE_AGENT_SEARCH) {
    return searchWithDummyAgentSearch(query, limit);
  }

  const primary = await searchWithAgentSearch(query, limit);
  if (primary.ok && primary.results.length > 0) return primary;

  const fallback = await searchWithDuckDuckGo(query, limit);
  if (fallback.ok && fallback.results.length > 0) return fallback;

  // Always succeed for agents/chat demos
  return searchWithDummyAgentSearch(query, limit);
}

export function formatSearchForPrompt(search: SearchResponse): string {
  if (!search.results.length) return "";
  const label =
    search.provider === "dummy"
      ? "Demo Web Search"
      : `Live Web Search (${search.provider})`;
  const lines = search.results.map(
    (r, i) => `${i + 1}. **${r.title}**\n   ${r.url}\n   ${r.snippet}`,
  );
  return `## ${label} — query: "${search.query}"\n${lines.join("\n")}`;
}

export function getAgentSearchBaseUrl() {
  return AGENT_SEARCH_URL;
}

export function isAgentSearchLiveEnabled() {
  return LIVE_AGENT_SEARCH;
}
