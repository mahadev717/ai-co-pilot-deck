/**
 * Startup Copilot OS — Autonomous Agent Runner
 *
 * Each agent specialty runs via OpenAI GPT-4o Mini (preferred)
 * with a deterministic mock fallback so agents never hard-fail.
 */

import { runAgentWebSearch } from "./agent-search";

const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
const OPENAI_MODEL = "gpt-4o-mini";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

export type AgentRunResult = {
  ok: boolean;
  agentId: string;
  summary: string;
  action: string;
  alert?: { title: string; type: "info" | "success" | "warning" | "error" } | null;
  usedEngine: "openai" | "mock";
  error?: string;
};

export type AgentRunContext = {
  userName?: string;
  businessHealth: number;
  revenue: number;
  customers: number;
  burnRate: number;
  runway: number;
  teamPRs: number;
  connectedIntegrations: string[];
  activeAgents: string[];
  atRiskCustomers?: { name: string; arr: number; ticketsOpen: number }[];
};

const AGENT_PROMPTS: Record<
  string,
  { role: string; mission: string; focus: string; useSearch?: boolean }
> = {
  marketing: {
    role: "Marketing Agent",
    mission: "Grow acquisition, conversion, and brand presence.",
    focus:
      "Analyze funnel health, pricing/landing conversion, campaign ideas, SEO opportunities, and social signals. Propose 1 concrete next action.",
    useSearch: true,
  },
  finance: {
    role: "Finance Agent",
    mission: "Protect runway and grow efficient revenue.",
    focus:
      "Review MRR, burn, runway, churned vs expansion revenue, and cash risk. Flag any finance urgency and propose 1 investor-ready action.",
  },
  engineering: {
    role: "Engineering Agent",
    mission: "Keep shipping velocity high and production safe.",
    focus:
      "Assess open PRs, deploy health, security vulnerabilities, blockers, and tech debt. Propose 1 engineering action that unblocks the team.",
  },
  sales: {
    role: "Sales Agent",
    mission: "Convert pipeline into closed revenue.",
    focus:
      "Review stalled deals, demo no-shows, lead follow-up gaps, and pipeline velocity. Propose 1 personalized outreach or CRM action.",
  },
  support: {
    role: "Support Agent",
    mission: "Raise CSAT and kill recurring ticket root causes.",
    focus:
      "Detect ticket clusters, SLA breaches, churn-linked support issues, and draft a response strategy. Propose 1 fix or escalation.",
  },
  intelligence: {
    role: "Intelligence Agent",
    mission: "Connect cross-tool signals into early warnings.",
    focus:
      "Correlate churn risk, product usage, support tickets, engineering blockers, and market signals. Surface the single highest-priority hidden risk or opportunity.",
    useSearch: true,
  },
  ops: {
    role: "Ops Agent",
    mission: "Keep infrastructure and team operations stable.",
    focus:
      "Monitor cloud cost, incidents, on-call load, meeting overload, and process bottlenecks. Propose 1 ops improvement.",
  },
};

const MOCK_ACTIONS: Record<string, () => AgentRunResult> = {
  marketing: () => ({
    ok: true,
    agentId: "marketing",
    summary: "Organic /pricing traffic up 45%; conversion still 2.1% vs 3.5% benchmark.",
    action: "Drafted A/B test: clearer CTA + social proof above the fold on /pricing.",
    alert: { title: "Marketing: /pricing conversion lagging despite traffic spike", type: "warning" },
    usedEngine: "mock",
  }),
  finance: () => ({
    ok: true,
    agentId: "finance",
    summary: "MRR strong; 2 invoices past due totaling $4,800.",
    action: "Queued payment retry + founder digests for overdue accounts.",
    alert: { title: "Finance: $4,800 in past-due invoices need recovery", type: "warning" },
    usedEngine: "mock",
  }),
  engineering: () => ({
    ok: true,
    agentId: "engineering",
    summary: "lodash CVE-2021-23337 still present; 3 PRs waiting >48h for review.",
    action: "Prepared dependency hotfix PR plan and flagged review backlog.",
    alert: { title: "Engineering: HIGH severity CVE in production dependencies", type: "error" },
    usedEngine: "mock",
  }),
  sales: () => ({
    ok: true,
    agentId: "sales",
    summary: "3 deals stalled >14 days (~$48k ARR); 12 leads not followed up >3 days.",
    action: "Generated personalized follow-up emails for top 3 stalled deals.",
    alert: { title: "Sales: $48k ARR stalled in negotiation >14 days", type: "warning" },
    usedEngine: "mock",
  }),
  support: () => ({
    ok: true,
    agentId: "support",
    summary: "8 tickets share SSO login root cause; 6 SLA breaches open.",
    action: "Drafted unified SSO incident reply + escalation to engineering.",
    alert: { title: "Support: SSO issue cluster — 8 tickets, same root cause", type: "warning" },
    usedEngine: "mock",
  }),
  intelligence: () => ({
    ok: true,
    agentId: "intelligence",
    summary: "Lumen AI: API usage ↓40% + 3 tickets + no recent demos = churn signal.",
    action: "Recommended founder QBR outreach within 48 hours for Lumen AI.",
    alert: { title: "Intelligence: Lumen AI churn risk — $14.4k ARR exposed", type: "error" },
    usedEngine: "mock",
  }),
  ops: () => ({
    ok: true,
    agentId: "ops",
    summary: "Cloud spend ↑8% MoM; founder calendar at 31h meetings this week.",
    action: "Proposed meeting-load cap + infra cost review for AWS/Vercel.",
    alert: { title: "Ops: Founder overbooked (31h) + cloud spend trending up", type: "info" },
    usedEngine: "mock",
  }),
};

function buildAgentSystemPrompt(agentId: string, ctx: AgentRunContext, searchBlock: string): string {
  const spec = AGENT_PROMPTS[agentId] ?? {
    role: "Business Agent",
    mission: "Improve startup outcomes.",
    focus: "Surface one high-leverage insight and action.",
  };

  const atRisk =
    ctx.atRiskCustomers?.length
      ? ctx.atRiskCustomers
          .map((c) => `• ${c.name} — ARR $${c.arr.toLocaleString()}, tickets ${c.ticketsOpen}`)
          .join("\n")
      : "• None flagged";

  return `You are the ${spec.role} inside Startup Copilot OS for ${ctx.userName ?? "the founder"}.
Mission: ${spec.mission}

## Live business snapshot
- Health: ${ctx.businessHealth}/100
- MRR: $${ctx.revenue.toLocaleString()} | Customers: ${ctx.customers.toLocaleString()}
- Burn: $${ctx.burnRate.toLocaleString()}/mo | Runway: ${ctx.runway} months
- Open PRs (team): ${ctx.teamPRs}
- Connected tools: ${ctx.connectedIntegrations.join(", ") || "none"}
- Active sibling agents: ${ctx.activeAgents.join(", ") || "none"}

## At-risk accounts
${atRisk}
${searchBlock}

## Your focus
${spec.focus}

## Output rules
Respond ONLY with valid JSON (no markdown fences):
{
  "summary": "1-2 sentence insight",
  "action": "Concrete action you took or recommend (past tense if executed as an agent)",
  "alert": { "title": "short notification title", "type": "info|success|warning|error" } | null,
  "priority": "low|medium|high"
}
Be specific, data-driven, and actionable. Do not invent tools that are not connected.`;
}

async function callOpenAIJson(system: string, user: string): Promise<string> {
  if (!OPENAI_KEY) throw new Error("No OpenAI key");

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: 500,
      temperature: 0.55,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "{}";
}

function parseAgentJson(raw: string, agentId: string): AgentRunResult {
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    const alertType = parsed.alert?.type;
    const alert =
      parsed.alert && parsed.alert.title
        ? {
            title: String(parsed.alert.title).slice(0, 160),
            type: (
              alertType === "success" ||
              alertType === "warning" ||
              alertType === "error" ||
              alertType === "info"
                ? alertType
                : "info"
            ) as "info" | "success" | "warning" | "error",
          }
        : null;

    return {
      ok: true,
      agentId,
      summary: String(parsed.summary || "Cycle complete.").slice(0, 280),
      action: String(parsed.action || "No action proposed.").slice(0, 280),
      alert,
      usedEngine: "openai",
    };
  } catch {
    return {
      ok: true,
      agentId,
      summary: raw.slice(0, 200) || "Agent completed a monitoring cycle.",
      action: "Logged findings for founder review.",
      alert: null,
      usedEngine: "openai",
    };
  }
}

/** Run one specialized agent cycle */
export async function runAgentCycle(
  agentId: string,
  ctx: AgentRunContext,
): Promise<AgentRunResult> {
  const mock = MOCK_ACTIONS[agentId]?.() ?? {
    ok: true,
    agentId,
    summary: "Monitoring cycle complete.",
    action: "No critical issues detected.",
    alert: null as AgentRunResult["alert"],
    usedEngine: "mock" as const,
  };

  try {
    let searchBlock = "";
    const spec = AGENT_PROMPTS[agentId];
    if (spec?.useSearch) {
      const q =
        agentId === "marketing"
          ? "SaaS startup marketing trends conversion pricing page"
          : "startup churn risk signals competitor news AI SaaS";
      try {
        const search = await runAgentWebSearch(q, 4);
        if (search.ok && search.results.length) {
          searchBlock =
            "\n## Live web signals\n" +
            search.results
              .map((r, i) => `${i + 1}. ${r.title} — ${r.url}\n   ${r.snippet}`)
              .join("\n");
        }
      } catch {
        /* search optional */
      }
    }

    if (!OPENAI_KEY) return mock;

    const system = buildAgentSystemPrompt(agentId, ctx, searchBlock);
    const user = `Run your ${agentId} monitoring cycle now. Return JSON only.`;
    const raw = await callOpenAIJson(system, user);
    return parseAgentJson(raw, agentId);
  } catch (e) {
    const fallback = mock;
    return {
      ...fallback,
      ok: true,
      error: e instanceof Error ? e.message : "Agent run failed",
      action: `${fallback.action} (fallback — live AI unavailable)`,
      usedEngine: "mock",
    };
  }
}

export function agentUsesSearch(agentId: string): boolean {
  return Boolean(AGENT_PROMPTS[agentId]?.useSearch);
}
