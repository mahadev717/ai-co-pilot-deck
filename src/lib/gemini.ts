/**
 * Startup Copilot OS — Unified AI Client
 *
 * Priority order:
 *   1. OpenAI GPT-4o Mini  — when VITE_OPENAI_API_KEY is set  ← active now
 *   2. Google Gemini 2.0 Flash — when VITE_GEMINI_API_KEY is set
 *   3. Smart Mock AI — always available as fallback (no key needed)
 *
 * All integration context is injected via the system prompt so the AI
 * responds intelligently based on which tools are connected.
 */

import { generateMockResponse, type AIContext } from "./mock-ai";

const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

const OPENAI_MODEL = "gpt-4o-mini";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/** Simulated latency for mock responses (makes them feel real) */
function mockLatency(): Promise<void> {
  return new Promise((r) => setTimeout(r, 700 + Math.random() * 900));
}

/** Which AI engine is active */
export function activeEngine(): "openai" | "gemini" | "mock" {
  if (OPENAI_KEY) return "openai";
  if (GEMINI_KEY) return "gemini";
  return "mock";
}

// ─── System prompt ────────────────────────────────────────────────────────────

export function buildSystemPrompt(ctx: AIContext): string {
  const connected = ctx.integrations.filter((i) => i.connected).map((i) => i.name);
  const disconnected = ctx.integrations.filter((i) => !i.connected).map((i) => i.name);

  // Build per-integration data hints so AI gives richer answers
  const integrationData: Record<string, string> = {
    Stripe: "MRR $248,910 (+15% MoM), 3,204 customers, 2 invoices past due ($4,800), Churned MRR $3,200 (↓22%), Expansion MRR $18,700 (↑52%), ARR $2.99M",
    QuickBooks: "Burn rate $87,000/mo, Runway 13.8 months, Payroll $62k, Cloud infra $14k, Operating expenses $11k. Cash in bank $1.2M",
    GitHub: "12 open PRs (3 awaiting review >48h), 47 open issues (8 critical), lodash@4.17.15 CVE-2021-23337 HIGH severity, last deploy 6h ago, 0% rollback rate, 2.3 deploys/day",
    Linear: "Sprint 18 — 68% complete (21/31 pts), Dashboard redesign 2d behind, 2 blocked tickets (INFRA-208 AWS quota, AUTH-441 needs design approval)",
    Jira: "Sprint velocity 34pts (↑from 29), 2 tickets blocked on external dependencies, backlog 87 items",
    Figma: "12 design files active, onboarding v3 in review (4 days), pricing page redesign approved, 3 files not handed off to engineering",
    Slack: "24 active channels, 487 messages today, auth service 200ms slower (flagged by @sarah), 5 PRs in review queue stacking up",
    Notion: "340 wiki pages, Q3 roadmap updated 2 days ago, 3 open action items from last all-hands, 7 docs stale >30 days",
    "Google Calendar": "Founder: 31h meetings this week (overloaded ⚠️), 4 customer calls scheduled, 2 investor syncs next week",
    "AWS / Vercel": "Cloud spend $14,200/mo (↑8% MoM), 99.97% uptime, API p99 latency 420ms (↑from 310ms), last incident 12 days ago",
    PagerDuty: "0 active incidents, uptime 99.97% (30d), MTTR 14min (↓22% improvement), 3 incidents this month (all resolved <30min)",
    HubSpot: "Pipeline $1.2M, 18 deals in negotiation, 3 stalled >14 days ($48k ARR), 92 new leads this week, 14 demos scheduled",
    Gmail: "Avg reply time 4.2h (target: 2h), 12 leads not followed up >3 days, 2 investor emails unread >24h",
    Calendly: "34 demos booked this month, 8 no-shows (23.5% no-show rate ⚠️), avg deal-to-demo 3.2 days",
    Zendesk: "34 open tickets (6 breaching SLA), CSAT 4.6/5.0, SSO login issue 8 tickets (same root cause), webhook delay 5 customers",
    Intercom: "147 live chat conversations this week, 3 feature requests trending (bulk export, API keys, SSO), avg first reply 8min",
    "Google Analytics": "28,400 sessions this week (↑31%), /pricing page ↑45% traffic (CVR 2.1% vs 3.5% benchmark), Organic 42% of traffic",
    Mixpanel: "Feature adoption: Dashboard 89%, Chat 71%, Integrations 44%, Agents 31%. Day-30 retention 68% (industry avg 45%). A/B test: new onboarding flow +24% activation",
    Mailchimp: "Email list 12,400, last campaign 41% open rate, 3.2% CTR, 48 unsubscribes (spike vs usual 12 ⚠️)",
    "X / Twitter": "142 mentions this week, 3 viral tweets about Copilot OS (2.1k impressions), 1 negative thread needs response, competitor launched feature",
  };

  const connectedWithData = connected
    .map((name) => {
      const data = integrationData[name];
      return data ? `• ${name}: ${data}` : `• ${name}: Connected`;
    })
    .join("\n");

  return `You are the AI Co-founder for ${ctx.userName ?? "the founder"}'s startup — powered by Startup Copilot OS.

## Live Business Context
- Business Health Score: ${ctx.businessHealth}/100
- MRR: $${ctx.revenue.toLocaleString("en-US")} | ARR: $${(ctx.revenue * 12).toLocaleString("en-US")}
- Active Customers: ${ctx.customers.toLocaleString("en-US")}

## Connected Integrations & Live Data
${connectedWithData || "• No integrations connected yet — encourage user to connect tools"}
${ctx.githubSummary ? `\n## GitHub Hub\n${ctx.githubSummary}\n` : ""}
## Not Yet Connected
${disconnected.length > 0 ? disconnected.map((n) => `• ${n}`).join("\n") : "All integrations connected!"}
${
  ctx.webSearch && ctx.webSearch.results.length > 0
    ? `\n## Live Web Search (${ctx.webSearch.provider}) — "${ctx.webSearch.query}"\n${ctx.webSearch.results
        .map((r, i) => `${i + 1}. ${r.title}\n   ${r.url}\n   ${r.snippet}`)
        .join("\n")}\n\nUse these search results when answering. Cite URLs when you reference them.`
    : ""
}

## Behavioral Guidelines
- Be a strategic, data-driven co-founder — concise but insightful
- Use markdown formatting (##, bullet points, **bold**, \`code\`)
- Reference real numbers from the live data above when answering
- For unconnected integrations, acknowledge the data gap and briefly suggest connecting
- When recommending actions (emails, PRs, meetings), always describe what you'd do and ask approval first
- Proactively surface risks and opportunities the founder might have missed
- Never make up specific numbers beyond what's provided above
- Keep responses under 300 words unless depth is clearly needed`;
}

// ─── OpenAI ───────────────────────────────────────────────────────────────────

async function callOpenAI(
  message: string,
  history: { role: "user" | "model"; text: string }[],
  ctx: AIContext
): Promise<string> {
  const systemPrompt = buildSystemPrompt(ctx);

  const messages = [
    { role: "system", content: systemPrompt },
    // Convert history (last 8 turns for context window efficiency)
    ...history.slice(-8).map((m) => ({
      role: m.role === "model" ? ("assistant" as const) : ("user" as const),
      content: m.text,
    })),
    { role: "user" as const, content: message },
  ];

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("OpenAI API error:", err);
    throw new Error("OpenAI API failed");
  }

  const data = await res.json();
  return (
    data?.choices?.[0]?.message?.content ??
    "I couldn't generate a response. Please try again."
  );
}

// ─── Gemini ───────────────────────────────────────────────────────────────────

async function callGemini(
  message: string,
  history: { role: "user" | "model"; text: string }[],
  ctx: AIContext
): Promise<string> {
  const systemPrompt = buildSystemPrompt(ctx);

  const contents = [
    ...history.slice(-8).map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    })),
    { role: "user" as const, parts: [{ text: message }] },
  ];

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024, topP: 0.9 },
  };

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error("Gemini API failed");

  const data = await res.json();
  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text ??
    "I couldn't generate a response. Please try again."
  );
}

// ─── Main export — used by use-app-state.tsx ──────────────────────────────────

export async function getAIResponse(
  message: string,
  history: { role: "user" | "model"; text: string }[],
  ctx: AIContext
): Promise<string> {
  // Enrich with live web search when the question needs fresh external info
  let enriched = ctx;
  if (!ctx.webSearch) {
    try {
      const { needsWebSearch, runAgentWebSearch } = await import("./agent-search");
      if (needsWebSearch(message)) {
        const search = await runAgentWebSearch(message, 5);
        if (search.ok && search.results.length > 0) {
          enriched = {
            ...ctx,
            webSearch: {
              query: search.query,
              provider: search.provider,
              results: search.results.map((r) => ({
                title: r.title,
                url: r.url,
                snippet: r.snippet,
              })),
            },
          };
        }
      }
    } catch (e) {
      console.warn("Web search enrichment skipped:", e);
    }
  }

  // 1. Try OpenAI
  if (OPENAI_KEY) {
    try {
      return await callOpenAI(message, history, enriched);
    } catch (e) {
      console.warn("OpenAI failed, falling back to mock:", e);
    }
  }

  // 2. Try Gemini
  if (GEMINI_KEY) {
    try {
      return await callGemini(message, history, enriched);
    } catch (e) {
      console.warn("Gemini failed, falling back to mock:", e);
    }
  }

  // 3. Smart mock AI (always works)
  await mockLatency();
  let mock = generateMockResponse(message, enriched);
  if (enriched.webSearch?.results?.length) {
    const cites = enriched.webSearch.results
      .slice(0, 3)
      .map((r) => `- [${r.title}](${r.url}) — ${r.snippet.slice(0, 120)}`)
      .join("\n");
    mock += `\n\n## Sources (live web)\n${cites}`;
  }
  return mock;
}
