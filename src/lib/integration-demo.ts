/**
 * Presentation-ready demo intelligence for every integration.
 * Used when live APIs are unavailable so the product still demos cleanly.
 */

export type IntegrationInsight = {
  headline: string;
  summary: string;
  healthScore: number;
  metrics: { label: string; value: string; trend?: "up" | "down" | "flat" }[];
  findings: string[];
  recommendations: string[];
  timeline: { time: string; text: string }[];
};

export type DemoRepo = {
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
};

export type DemoFile = {
  path: string;
  language: string;
  size: number;
  content: string;
  analysis: string[];
};

export const INTEGRATION_INSIGHTS: Record<string, IntegrationInsight> = {
  stripe: {
    headline: "Payments & subscription health",
    summary:
      "Stripe shows healthy MRR growth with expansion revenue offsetting churn. Two past-due invoices need founder follow-up before month-end.",
    healthScore: 86,
    metrics: [
      { label: "MRR", value: "$248,910", trend: "up" },
      { label: "Expansion MRR", value: "$18,700", trend: "up" },
      { label: "Past-due", value: "$4,800", trend: "down" },
      { label: "Failed charges (7d)", value: "23", trend: "flat" },
    ],
    findings: [
      "Expansion MRR up 52% MoM — seat upgrades from Acme and NovaTech",
      "Churned MRR $3.2k, mostly from 2 SMB accounts that hit pricing friction",
      "Payment failure rate 1.8% (industry avg ~2.5%) — recovery emails recovering 61%",
    ],
    recommendations: [
      "Retry past-due invoices for Contoso ($2.1k) and Brightly ($2.7k)",
      "Offer annual plan discount to accounts with 2+ failed cards",
      "Enable Smart Retries for EU cards to cut decline rate another 0.4%",
    ],
    timeline: [
      { time: "2h ago", text: "Successful charge $12,400 — Enterprise renewal" },
      { time: "5h ago", text: "Failed card Visa •••• 4242 (retry scheduled)" },
      { time: "1d ago", text: "New subscription: Orbit Labs — Growth plan" },
    ],
  },
  quickbooks: {
    headline: "Cash, burn & runway",
    summary:
      "Cash position is solid with 13.8 months runway. Payroll and cloud remain the two largest burn drivers.",
    healthScore: 82,
    metrics: [
      { label: "Cash", value: "$1.20M", trend: "flat" },
      { label: "Burn / mo", value: "$87k", trend: "up" },
      { label: "Runway", value: "13.8 mo", trend: "down" },
      { label: "Payroll", value: "$62k", trend: "flat" },
    ],
    findings: [
      "Cloud infra spend up 8% MoM — correlated with traffic spike",
      "AP aging: 3 vendor invoices >30 days ($9.4k)",
      "R&D tax credit estimate not yet booked for Q2",
    ],
    recommendations: [
      "Negotiate AWS commit for 15% savings",
      "Clear AP >30 days this week",
      "Book estimated R&D credit to improve cash visibility",
    ],
    timeline: [
      { time: "Today", text: "Payroll run scheduled — $62,140" },
      { time: "Yesterday", text: "AWS invoice posted — $14,200" },
      { time: "3d ago", text: "Customer payment received — $48,000" },
    ],
  },
  github: {
    headline: "Engineering velocity & code risk",
    summary:
      "GitHub is fully connected for presentation: 8 repos, open PRs needing review, and a HIGH CVE on lodash that should be patched before the next deploy.",
    healthScore: 74,
    metrics: [
      { label: "Open PRs", value: "12", trend: "up" },
      { label: "Open issues", value: "47", trend: "flat" },
      { label: "Deploys / day", value: "2.3", trend: "up" },
      { label: "Critical CVE", value: "1", trend: "down" },
    ],
    findings: [
      "3 PRs waiting review >48h — review queue bottleneck on auth-service",
      "lodash@4.17.15 — CVE-2021-23337 HIGH in packages/api",
      "Last production deploy 6h ago with 0% rollback rate",
    ],
    recommendations: [
      "Assign reviewers to PR #184, #191, #203 today",
      "Bump lodash to ≥4.17.21 and ship security patch",
      "Open Dependabot for npm across all active repos",
    ],
    timeline: [
      { time: "1h ago", text: "sarah opened PR: harden session cookies" },
      { time: "3h ago", text: "CI passed on copilot-web main" },
      { time: "6h ago", text: "Production deploy v2.14.3 succeeded" },
    ],
  },
  linear: {
    headline: "Sprint delivery risk",
    summary: "Sprint 18 is 68% complete with two blocked tickets that threaten the Friday release.",
    healthScore: 71,
    metrics: [
      { label: "Sprint progress", value: "68%", trend: "up" },
      { label: "Points done", value: "21/31", trend: "up" },
      { label: "Blocked", value: "2", trend: "flat" },
      { label: "Cycle time", value: "3.1d", trend: "down" },
    ],
    findings: [
      "Dashboard redesign is 2 days behind estimate",
      "INFRA-208 blocked on AWS quota increase",
      "AUTH-441 waiting on design approval from Figma",
    ],
    recommendations: [
      "Unblock INFRA-208 via AWS support ticket today",
      "Pull AUTH-441 into design review standup",
      "Cut 2 low-priority polish tickets to protect release",
    ],
    timeline: [
      { time: "30m ago", text: "Moved AUTH-441 → Blocked" },
      { time: "2h ago", text: "Completed ONB-112 onboarding checklist" },
      { time: "Yesterday", text: "Sprint planning locked 31 points" },
    ],
  },
  jira: {
    headline: "Delivery system health",
    summary: "Velocity is improving but backlog hygiene is weak — 87 items with unclear owners.",
    healthScore: 69,
    metrics: [
      { label: "Velocity", value: "34 pts", trend: "up" },
      { label: "Backlog", value: "87", trend: "up" },
      { label: "Blocked", value: "2", trend: "flat" },
      { label: "SLA breaches", value: "1", trend: "down" },
    ],
    findings: [
      "External dependency tickets stalling support escalations",
      "Duplicate epics between Growth and Platform boards",
    ],
    recommendations: [
      "Triage backlog to <50 this sprint",
      "Merge duplicate Growth/Platform epics",
    ],
    timeline: [
      { time: "Today", text: "Velocity report published — 34pts" },
      { time: "2d ago", text: "Created epic: Enterprise SSO" },
    ],
  },
  figma: {
    headline: "Design handoff status",
    summary: "Onboarding v3 is in review; three files still lack engineering handoff.",
    healthScore: 78,
    metrics: [
      { label: "Active files", value: "12", trend: "flat" },
      { label: "In review", value: "1", trend: "up" },
      { label: "Pending handoff", value: "3", trend: "down" },
      { label: "Comments open", value: "19", trend: "up" },
    ],
    findings: [
      "Pricing page redesign approved yesterday",
      "Onboarding v3 has unresolved accessibility comments",
    ],
    recommendations: [
      "Schedule handoff for pricing + onboarding today",
      "Resolve a11y comments before engineering pick-up",
    ],
    timeline: [
      { time: "4h ago", text: "Comment on Onboarding v3 — contrast fail" },
      { time: "1d ago", text: "Pricing redesign marked Approved" },
    ],
  },
  slack: {
    headline: "Team communication pulse",
    summary: "High message volume with an emerging latency complaint in #eng that correlates with AWS p99 rise.",
    healthScore: 80,
    metrics: [
      { label: "Channels", value: "24", trend: "flat" },
      { label: "Msgs today", value: "487", trend: "up" },
      { label: "PR reviews pending", value: "5", trend: "up" },
      { label: "Incidents flagged", value: "1", trend: "flat" },
    ],
    findings: [
      "@sarah flagged auth service +200ms latency",
      "Review queue stacking in #code-review",
    ],
    recommendations: [
      "Create incident thread for auth latency",
      "Ping reviewers on the 5 pending PRs",
    ],
    timeline: [
      { time: "20m ago", text: "#eng: auth p99 up 200ms" },
      { time: "1h ago", text: "#sales: demo win Contoso" },
    ],
  },
  notion: {
    headline: "Knowledge base freshness",
    summary: "Wiki is large but 7 docs are stale >30 days — risk of outdated runbooks.",
    healthScore: 76,
    metrics: [
      { label: "Pages", value: "340", trend: "up" },
      { label: "Stale docs", value: "7", trend: "down" },
      { label: "Open actions", value: "3", trend: "flat" },
      { label: "Roadmap age", value: "2d", trend: "up" },
    ],
    findings: [
      "Q3 roadmap updated 2 days ago",
      "Incident runbook last edited 41 days ago",
    ],
    recommendations: [
      "Refresh incident + on-call runbooks",
      "Close 3 open all-hands action items",
    ],
    timeline: [
      { time: "2d ago", text: "Q3 roadmap published" },
      { time: "1w ago", text: "All-hands notes archived" },
    ],
  },
  calendar: {
    headline: "Founder time load",
    summary: "Meeting load is overloaded at 31h this week — protect deep work blocks.",
    healthScore: 58,
    metrics: [
      { label: "Meeting hours", value: "31h", trend: "up" },
      { label: "Customer calls", value: "4", trend: "flat" },
      { label: "Investor syncs", value: "2", trend: "up" },
      { label: "Focus blocks", value: "2", trend: "down" },
    ],
    findings: [
      "Back-to-back blocks Mon–Thu with <15m gaps",
      "No focus block scheduled Friday AM",
    ],
    recommendations: [
      "Decline 2 internal syncs that have no agenda",
      "Block Friday 9–12 for product deep work",
    ],
    timeline: [
      { time: "Tomorrow 10:00", text: "Customer call — Acme renewal" },
      { time: "Wed 15:00", text: "Investor sync — Series A update" },
    ],
  },
  aws: {
    headline: "Cloud cost & reliability",
    summary: "Uptime is excellent; spend and p99 latency are the watch items for this week.",
    healthScore: 77,
    metrics: [
      { label: "Spend / mo", value: "$14.2k", trend: "up" },
      { label: "Uptime 30d", value: "99.97%", trend: "flat" },
      { label: "API p99", value: "420ms", trend: "up" },
      { label: "Last incident", value: "12d", trend: "up" },
    ],
    findings: [
      "p99 latency rose from 310ms → 420ms after traffic spike",
      "NAT gateway + data transfer driving most of spend increase",
    ],
    recommendations: [
      "Profile auth hot path and add cache",
      "Review NAT/data transfer for savings",
    ],
    timeline: [
      { time: "Today", text: "CloudWatch alarm: p99 >400ms" },
      { time: "12d ago", text: "Resolved: Redis failover (MTTR 14m)" },
    ],
  },
  pagerduty: {
    headline: "Incident readiness",
    summary: "No active incidents. MTTR improved 22% — on-call process is healthy.",
    healthScore: 92,
    metrics: [
      { label: "Active", value: "0", trend: "flat" },
      { label: "MTTR", value: "14m", trend: "down" },
      { label: "Incidents / mo", value: "3", trend: "down" },
      { label: "Uptime", value: "99.97%", trend: "flat" },
    ],
    findings: ["All 3 monthly incidents resolved under 30 minutes"],
    recommendations: ["Run game-day for auth latency scenario"],
    timeline: [{ time: "12d ago", text: "Incident #482 resolved — Redis" }],
  },
  hubspot: {
    headline: "Pipeline & deal risk",
    summary: "Strong pipeline with three stalled deals totaling $48k ARR that need founder touch.",
    healthScore: 79,
    metrics: [
      { label: "Pipeline", value: "$1.2M", trend: "up" },
      { label: "In negotiation", value: "18", trend: "up" },
      { label: "Stalled >14d", value: "3", trend: "down" },
      { label: "New leads / wk", value: "92", trend: "up" },
    ],
    findings: ["3 stalled deals need executive outreach", "14 demos scheduled this week"],
    recommendations: ["Founder call on top stalled deal today", "Send nurture sequence to 92 new leads"],
    timeline: [
      { time: "1h ago", text: "Deal stage → Negotiation: Orbit Labs" },
      { time: "Yesterday", text: "Lost deal: TinyCo (pricing)" },
    ],
  },
  gmail: {
    headline: "Inbox & follow-up risk",
    summary: "Reply SLA is slipping; investor threads need same-day response.",
    healthScore: 64,
    metrics: [
      { label: "Avg reply", value: "4.2h", trend: "up" },
      { label: "Leads stale >3d", value: "12", trend: "up" },
      { label: "Investor unread", value: "2", trend: "flat" },
      { label: "Target reply", value: "2h", trend: "flat" },
    ],
    findings: ["2 investor emails unread >24h", "12 sales leads without follow-up"],
    recommendations: ["Reply to investor threads before noon", "Batch follow-ups for 12 stale leads"],
    timeline: [
      { time: "3h ago", text: "New inbound: Series A partner question" },
      { time: "1d ago", text: "Lead reply waiting — Brightly" },
    ],
  },
  calendly: {
    headline: "Demo booking quality",
    summary: "Demo volume is strong but no-show rate at 23.5% is burning SDR time.",
    healthScore: 70,
    metrics: [
      { label: "Demos / mo", value: "34", trend: "up" },
      { label: "No-shows", value: "8", trend: "up" },
      { label: "No-show rate", value: "23.5%", trend: "up" },
      { label: "Lead→demo", value: "3.2d", trend: "down" },
    ],
    findings: ["No-show spike on Monday AM slots"],
    recommendations: ["Add SMS reminders 2h before demos", "Offer afternoon slots preferentially"],
    timeline: [{ time: "Today", text: "3 demos booked for Thursday" }],
  },
  zendesk: {
    headline: "Support load & SLA",
    summary: "SSO login issue is generating a ticket cluster — one root cause fix clears 8 tickets.",
    healthScore: 66,
    metrics: [
      { label: "Open tickets", value: "34", trend: "up" },
      { label: "SLA breaches", value: "6", trend: "up" },
      { label: "CSAT", value: "4.6/5", trend: "flat" },
      { label: "SSO cluster", value: "8", trend: "up" },
    ],
    findings: ["SSO login failures share one IdP misconfig", "Webhook delay affecting 5 customers"],
    recommendations: ["Hotfix SSO IdP claim mapping", "Escalate webhook delay to eng on-call"],
    timeline: [
      { time: "45m ago", text: "New ticket: SSO login loop" },
      { time: "2h ago", text: "SLA breach warning — #4821" },
    ],
  },
  intercom: {
    headline: "Live chat & product signal",
    summary: "Chat volume healthy; three feature requests are trending into roadmap candidates.",
    healthScore: 84,
    metrics: [
      { label: "Chats / wk", value: "147", trend: "up" },
      { label: "First reply", value: "8m", trend: "down" },
      { label: "Feature asks", value: "3", trend: "up" },
      { label: "CSAT chat", value: "4.7", trend: "flat" },
    ],
    findings: ["Trending requests: bulk export, API keys, SSO"],
    recommendations: ["Feed top 3 requests into Linear backlog", "Publish status page note on SSO fix ETA"],
    timeline: [{ time: "10m ago", text: "Visitor asked about API keys" }],
  },
  "google-analytics": {
    headline: "Acquisition & conversion",
    summary: "Traffic is up sharply; pricing page conversion lags benchmark and is the main leak.",
    healthScore: 73,
    metrics: [
      { label: "Sessions / wk", value: "28.4k", trend: "up" },
      { label: "Pricing CVR", value: "2.1%", trend: "down" },
      { label: "Organic share", value: "42%", trend: "up" },
      { label: "Bounce /pricing", value: "61%", trend: "up" },
    ],
    findings: ["/pricing traffic +45% but CVR 2.1% vs 3.5% benchmark"],
    recommendations: ["A/B test pricing hero + social proof", "Add chatbot assist on /pricing"],
    timeline: [{ time: "Today", text: "Campaign spike from Product Hunt mention" }],
  },
  mixpanel: {
    headline: "Product adoption",
    summary: "Retention is strong vs industry; Agents feature adoption is the lagging module.",
    healthScore: 81,
    metrics: [
      { label: "D30 retention", value: "68%", trend: "up" },
      { label: "Dashboard adopt", value: "89%", trend: "flat" },
      { label: "Agents adopt", value: "31%", trend: "up" },
      { label: "Onboarding lift", value: "+24%", trend: "up" },
    ],
    findings: ["New onboarding A/B +24% activation", "Agents under-discovered in nav"],
    recommendations: ["Surface Agents in empty states", "Trigger in-app tour after first connect"],
    timeline: [{ time: "Yesterday", text: "A/B test concluded — ship winner" }],
  },
  mailchimp: {
    headline: "Email engagement",
    summary: "Open rates are excellent but unsubscribe spike needs list hygiene review.",
    healthScore: 75,
    metrics: [
      { label: "List size", value: "12.4k", trend: "up" },
      { label: "Open rate", value: "41%", trend: "up" },
      { label: "CTR", value: "3.2%", trend: "flat" },
      { label: "Unsubscribes", value: "48", trend: "up" },
    ],
    findings: ["Unsubscribe spike vs usual ~12 — likely frequency"],
    recommendations: ["Reduce send cadence for cold segment", "Reconfirm consent for inactive 90d"],
    timeline: [{ time: "2d ago", text: "Campaign: Product update shipped" }],
  },
  twitter: {
    headline: "Brand & social signal",
    summary: "Positive viral mentions with one negative thread that needs a human reply.",
    healthScore: 72,
    metrics: [
      { label: "Mentions / wk", value: "142", trend: "up" },
      { label: "Viral posts", value: "3", trend: "up" },
      { label: "Neg. threads", value: "1", trend: "flat" },
      { label: "Impressions", value: "2.1k+", trend: "up" },
    ],
    findings: ["Negative thread about SSO downtime unanswered 6h"],
    recommendations: ["Public reply + status update within 1 hour", "Amplify top viral mention with founder quote"],
    timeline: [{ time: "6h ago", text: "Negative thread: SSO complaints" }],
  },
};

export const DEMO_GITHUB_REPOS: DemoRepo[] = [
  {
    id: "1",
    fullName: "startup-copilot/copilot-web",
    description: "Main dashboard & AI co-founder UI (TanStack Start)",
    language: "TypeScript",
    stars: 128,
    forks: 24,
    openIssues: 14,
    updatedAt: "2 hours ago",
    private: true,
    defaultBranch: "main",
  },
  {
    id: "2",
    fullName: "startup-copilot/copilot-api",
    description: "API gateway, agents runner, and webhook ingest",
    language: "TypeScript",
    stars: 86,
    forks: 11,
    openIssues: 9,
    updatedAt: "5 hours ago",
    private: true,
    defaultBranch: "main",
  },
  {
    id: "3",
    fullName: "startup-copilot/agent-runtime",
    description: "Background AI agents with tool calling",
    language: "Python",
    stars: 64,
    forks: 8,
    openIssues: 6,
    updatedAt: "1 day ago",
    private: true,
    defaultBranch: "main",
  },
  {
    id: "4",
    fullName: "startup-copilot/infra",
    description: "Terraform + GitHub Actions deploy pipelines",
    language: "HCL",
    stars: 22,
    forks: 4,
    openIssues: 3,
    updatedAt: "3 days ago",
    private: true,
    defaultBranch: "main",
  },
  {
    id: "5",
    fullName: "startup-copilot/design-tokens",
    description: "Shared design system tokens exported to web",
    language: "TypeScript",
    stars: 15,
    forks: 2,
    openIssues: 1,
    updatedAt: "5 days ago",
    private: false,
    defaultBranch: "main",
  },
  {
    id: "6",
    fullName: "startup-copilot/docs",
    description: "Public product docs & API reference",
    language: "MDX",
    stars: 41,
    forks: 9,
    openIssues: 4,
    updatedAt: "1 week ago",
    private: false,
    defaultBranch: "main",
  },
  {
    id: "7",
    fullName: "startup-copilot/mobile",
    description: "React Native companion app (early)",
    language: "TypeScript",
    stars: 9,
    forks: 1,
    openIssues: 7,
    updatedAt: "2 weeks ago",
    private: true,
    defaultBranch: "develop",
  },
  {
    id: "8",
    fullName: "startup-copilot/security-scan",
    description: "Dependabot + CVE triage automation",
    language: "Go",
    stars: 18,
    forks: 3,
    openIssues: 2,
    updatedAt: "4 days ago",
    private: true,
    defaultBranch: "main",
  },
];

export const DEMO_GITHUB_FILES: Record<string, DemoFile[]> = {
  "startup-copilot/copilot-web": [
    {
      path: "src/hooks/use-app-state.tsx",
      language: "tsx",
      size: 48200,
      content: `export function AppStateProvider({ children }: { children: ReactNode }) {
  const [integrations, setIntegrations] = useState(DEFAULT_INTEGRATIONS);
  // Connect tools → hydrate live GitHub / Stripe → feed AI context
  async function connectIntegration(id: string, credentials = {}) {
    // ... secure link + sync
  }
}`,
      analysis: [
        "Central state hub — good for demo narrative of 'one brain'",
        "Auth role lock separates Admin vs Employee portals",
        "Integration connect path injects live metrics into AI chat",
      ],
    },
    {
      path: "src/routes/dashboard/chat.tsx",
      language: "tsx",
      size: 12400,
      content: `export function AIFounderChat() {
  // Text + voice (Web Speech API) → sendChatMessage → OpenAI/Gemini/mock
  return <form>...</form>;
}`,
      analysis: [
        "Voice input uses browser SpeechRecognition",
        "TTS can speak assistant replies for presentation demos",
        "Quick prompts showcase cross-tool intelligence",
      ],
    },
    {
      path: "package.json",
      language: "json",
      size: 2100,
      content: `{
  "name": "ai-co-pilot-deck",
  "dependencies": {
    "@tanstack/react-router": "^1",
    "framer-motion": "^12",
    "@supabase/supabase-js": "^2"
  }
}`,
      analysis: [
        "Modern stack suitable for investor/demo story",
        "No critical outdated runtime deps in demo snapshot",
      ],
    },
  ],
  "startup-copilot/copilot-api": [
    {
      path: "package.json",
      language: "json",
      size: 1800,
      content: `{
  "dependencies": {
    "lodash": "4.17.15",
    "express": "4.19.2",
    "openai": "4.70.0"
  }
}`,
      analysis: [
        "⚠️ lodash@4.17.15 has CVE-2021-23337 (HIGH) — prototype pollution",
        "Recommend bump to lodash@4.17.21 before next production deploy",
        "express and openai versions look current for demo",
      ],
    },
    {
      path: "src/agents/runner.ts",
      language: "ts",
      size: 8600,
      content: `export async function runAgentCycle(id: string, ctx: AgentContext) {
  const prompt = buildAgentPrompt(id, ctx);
  return callOpenAI(prompt) ?? mockAgentResult(id, ctx);
}`,
      analysis: [
        "Graceful mock fallback keeps demos working offline",
        "Context includes connected integrations — good for story",
      ],
    },
  ],
};

export function getIntegrationInsight(id: string): IntegrationInsight {
  return (
    INTEGRATION_INSIGHTS[id] ?? {
      headline: "Connected workspace signal",
      summary: "This tool is linked to your account. Copilot OS is collecting signals for cross-tool insights.",
      healthScore: 75,
      metrics: [
        { label: "Status", value: "Linked", trend: "up" },
        { label: "Signals / day", value: "120+", trend: "up" },
      ],
      findings: ["Account linked successfully", "Agents can now reference this tool in answers"],
      recommendations: ["Ask the AI Co-founder what this tool changes about business health"],
      timeline: [{ time: "Just now", text: "Connection established" }],
    }
  );
}

export function getDemoGitHubBundle() {
  return {
    connected: true as const,
    openPrsCount: 12,
    openIssuesCount: 47,
    recentActivity: [
      { type: "pr", text: "sarah opened PR: harden session cookies", time: "1h ago", status: "info" },
      { type: "pr", text: "alex opened PR: agents empty-state tour", time: "3h ago", status: "info" },
      { type: "issue", text: "Dependabot: lodash CVE-2021-23337", time: "5h ago", status: "warning" },
      { type: "deploy", text: "Production deploy v2.14.3 succeeded", time: "6h ago", status: "success" },
    ],
    repos: DEMO_GITHUB_REPOS,
    mode: "demo" as const,
  };
}
