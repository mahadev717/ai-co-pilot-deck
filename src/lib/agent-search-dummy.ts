/**
 * Demo AgentSearch — curated dummy web results for hackathon / offline demos.
 * Used when live AgentSearch (localhost:3939) is not running.
 */

export type DummySearchHit = {
  title: string;
  url: string;
  snippet: string;
  score?: number;
  source?: string;
};

export type DummySearchResponse = {
  ok: boolean;
  query: string;
  provider: "dummy";
  results: DummySearchHit[];
};

type DummyBucket = {
  keys: string[];
  hits: DummySearchHit[];
};

const DUMMY_BUCKETS: DummyBucket[] = [
  {
    keys: ["marketing", "conversion", "pricing", "seo", "campaign", "landing"],
    hits: [
      {
        title: "SaaS Pricing Page Conversion Benchmarks 2026",
        url: "https://example.com/saas-pricing-conversion",
        snippet:
          "Median SaaS pricing-page conversion sits near 3.2%. Clear annual toggle + social proof lifts conversion 18–24% in B2B trials.",
        score: 0.94,
        source: "dummy",
      },
      {
        title: "Startup Marketing Trends: PLG + Content Loops",
        url: "https://example.com/plg-marketing-trends",
        snippet:
          "Product-led growth teams pair short demo videos with SEO landing clusters. Weekly ship-notes outperform generic brand ads for early ARR.",
        score: 0.91,
        source: "dummy",
      },
      {
        title: "How Top SaaS Brands Test Messaging",
        url: "https://example.com/saas-messaging-tests",
        snippet:
          "Winning teams A/B test one value prop per week. Outcome-first headlines beat feature lists for cold traffic.",
        score: 0.88,
        source: "dummy",
      },
      {
        title: "Paid Acquisition Efficiency for Seed SaaS",
        url: "https://example.com/seed-paid-acq",
        snippet:
          "CAC payback under 9 months is the common seed target. Retargeting + comparison pages cut wasted spend ~20%.",
        score: 0.85,
        source: "dummy",
      },
    ],
  },
  {
    keys: ["churn", "retention", "competitor", "intelligence", "market", "risk"],
    hits: [
      {
        title: "Early Churn Signals in B2B SaaS",
        url: "https://example.com/churn-signals",
        snippet:
          "Drop in weekly active seats + rising support tickets predicts churn 30–45 days out. Expansion cohorts stay 2.1× longer.",
        score: 0.93,
        source: "dummy",
      },
      {
        title: "AI SaaS Competitive Landscape Snapshot",
        url: "https://example.com/ai-saas-competitors",
        snippet:
          "Category leaders push usage-based pricing and agent workflows. Mid-market buyers prioritize integrations over model novelty.",
        score: 0.9,
        source: "dummy",
      },
      {
        title: "Funding & M&A Watch: DevTools / Ops AI",
        url: "https://example.com/devtools-ma-watch",
        snippet:
          "Series A medians hold near $12–18M. Acquirers favor teams with GitHub + CRM connectors already live.",
        score: 0.86,
        source: "dummy",
      },
      {
        title: "Hidden Revenue Risk From Support Backlogs",
        url: "https://example.com/support-revenue-risk",
        snippet:
          "Accounts with 3+ open tickets and NPS < 30 show 4× higher logo churn. SLA breaches amplify expansion freeze.",
        score: 0.84,
        source: "dummy",
      },
    ],
  },
  {
    keys: ["finance", "revenue", "mrr", "burn", "runway", "stripe", "funding"],
    hits: [
      {
        title: "SaaS Benchmarks: Burn Multiple & Runway",
        url: "https://example.com/burn-multiple",
        snippet:
          "Efficient seed SaaS aims for burn multiple under 1.5×. 12–18 months runway remains the fundraising comfort zone.",
        score: 0.92,
        source: "dummy",
      },
      {
        title: "MRR Expansion Levers That Compound",
        url: "https://example.com/mrr-expansion",
        snippet:
          "Seat expansion + annual prepay discounts raise NRR. Teams with billing health alerts recover 8–12% of failed charges.",
        score: 0.89,
        source: "dummy",
      },
      {
        title: "Stripe Billing Health Playbook",
        url: "https://example.com/stripe-billing-health",
        snippet:
          "Dunning + smart retries recover failed invoices. Card-update reminders before renewal cut involuntary churn.",
        score: 0.87,
        source: "dummy",
      },
      {
        title: "Investor-Ready Finance Snapshot Checklist",
        url: "https://example.com/investor-finance-checklist",
        snippet:
          "Board packs that win: MRR bridge, cohort retention, runway months, and top 5 churned ARR accounts with next actions.",
        score: 0.83,
        source: "dummy",
      },
    ],
  },
  {
    keys: ["github", "engineering", "pr", "deploy", "velocity", "devops"],
    hits: [
      {
        title: "Engineering Velocity Benchmarks for Startups",
        url: "https://example.com/eng-velocity",
        snippet:
          "Healthy early teams ship 8–15 merged PRs/week with <24h review latency. Long-lived branches correlate with incident risk.",
        score: 0.91,
        source: "dummy",
      },
      {
        title: "PR Review Bottlenecks That Slow Roadmaps",
        url: "https://example.com/pr-bottlenecks",
        snippet:
          "Unassigned reviews and >3 day aging PRs are the top velocity killers. Pairing + CODEOWNERS cut cycle time ~30%.",
        score: 0.88,
        source: "dummy",
      },
      {
        title: "Deploy Safety Without Slowing Ships",
        url: "https://example.com/deploy-safety",
        snippet:
          "Canary + automated rollback keep MTTR low. Teams with CI flake under 5% ship faster with fewer hotfixes.",
        score: 0.85,
        source: "dummy",
      },
      {
        title: "Security Debt Signals in GitHub Repos",
        url: "https://example.com/github-security-debt",
        snippet:
          "Dependabot backlog + secrets in history are common audit fails. Weekly triage beats quarterly crunch.",
        score: 0.82,
        source: "dummy",
      },
    ],
  },
  {
    keys: ["sales", "pipeline", "crm", "deal", "outreach"],
    hits: [
      {
        title: "B2B Pipeline Velocity Playbook",
        url: "https://example.com/pipeline-velocity",
        snippet:
          "Stalled deals over 21 days need a new champion map. Personalized demos beat generic decks for mid-market close rates.",
        score: 0.9,
        source: "dummy",
      },
      {
        title: "Follow-up Cadence That Recovers No-Shows",
        url: "https://example.com/demo-no-show",
        snippet:
          "Same-day + day-3 + day-7 sequences recover ~28% of missed demos when value props stay specific.",
        score: 0.87,
        source: "dummy",
      },
      {
        title: "CRM Hygiene for Accurate Forecasting",
        url: "https://example.com/crm-hygiene",
        snippet:
          "Stage definitions + next-step required fields cut forecast error. Weekly pipeline scrub beats end-of-month surprises.",
        score: 0.84,
        source: "dummy",
      },
      {
        title: "Outbound Personalization That Converts",
        url: "https://example.com/outbound-personalization",
        snippet:
          "Trigger emails from product usage or GitHub stars outperform cold spray. Keep ask size small and CTA singular.",
        score: 0.81,
        source: "dummy",
      },
    ],
  },
  {
    keys: ["support", "ticket", "csat", "sla", "customer"],
    hits: [
      {
        title: "Support Ticket Clustering for Root Causes",
        url: "https://example.com/ticket-clusters",
        snippet:
          "Top recurring themes: onboarding confusion, billing edge cases, and integration auth. Fixing top 3 cuts volume 25%.",
        score: 0.9,
        source: "dummy",
      },
      {
        title: "SLA Breach Patterns Linked to Churn",
        url: "https://example.com/sla-churn",
        snippet:
          "Accounts with two SLA breaches in a quarter show elevated churn. Proactive status updates protect CSAT.",
        score: 0.86,
        source: "dummy",
      },
      {
        title: "CSAT Recovery Scripts That Work",
        url: "https://example.com/csat-recovery",
        snippet:
          "Acknowledge + own + timeline + follow-up beats apology-only replies. Closed-loop tickets raise CSAT within 2 weeks.",
        score: 0.83,
        source: "dummy",
      },
      {
        title: "Deflect FAQs Without Hurting Trust",
        url: "https://example.com/faq-deflection",
        snippet:
          "In-product help for the top 10 intents reduces tickets while keeping human escalation obvious.",
        score: 0.8,
        source: "dummy",
      },
    ],
  },
];

const DEFAULT_HITS: DummySearchHit[] = [
  {
    title: "Startup Copilot OS — Demo Web Intelligence",
    url: "https://example.com/copilot-os-demo-search",
    snippet:
      "Demo AgentSearch is active. These curated signals simulate live web research for pitch and offline demos.",
    score: 0.99,
    source: "dummy",
  },
  {
    title: "Founder Decision Framework: Focus This Week",
    url: "https://example.com/founder-weekly-focus",
    snippet:
      "Prioritize revenue protection, at-risk accounts, and one growth experiment. Avoid parallel initiatives that dilute runway.",
    score: 0.9,
    source: "dummy",
  },
  {
    title: "AI Co-founder Workflows for Seed Teams",
    url: "https://example.com/ai-cofounder-workflows",
    snippet:
      "Winning teams connect billing + GitHub + CRM, then let agents surface risks before Monday standup.",
    score: 0.87,
    source: "dummy",
  },
  {
    title: "Operational Dashboards That Drive Action",
    url: "https://example.com/ops-dashboards",
    snippet:
      "Health score + churn ARR + open PRs + leave coverage is enough for most seed operating cadences.",
    score: 0.84,
    source: "dummy",
  },
];

function scoreQuery(query: string, keys: string[]): number {
  const q = query.toLowerCase();
  return keys.reduce((n, k) => (q.includes(k) ? n + 1 : n), 0);
}

/** Always-on demo search — never hits the network */
export function searchWithDummyAgentSearch(
  query: string,
  limit = 6,
): DummySearchResponse {
  const q = query.trim() || "startup insights";
  let best = DEFAULT_HITS;
  let bestScore = 0;

  for (const bucket of DUMMY_BUCKETS) {
    const s = scoreQuery(q, bucket.keys);
    if (s > bestScore) {
      bestScore = s;
      best = bucket.hits;
    }
  }

  const results = best.slice(0, Math.max(1, limit)).map((h) => ({
    ...h,
    snippet: h.snippet,
  }));

  return {
    ok: true,
    query: q,
    provider: "dummy",
    results,
  };
}
