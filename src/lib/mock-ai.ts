/**
 * Startup Copilot OS — Smart Mock AI
 *
 * Generates rich, contextual business responses when no Gemini API key is set.
 * Uses actual mock metrics and connected integration state for hyper-relevant answers.
 * Responses are markdown-formatted for the chat renderer.
 */

export interface AIContext {
  integrations: { id: string; name: string; connected: boolean }[];
  businessHealth: number;
  revenue: number;
  customers: number;
  userName?: string;
  githubSummary?: string;
  /** Live web search results injected before generation */
  webSearch?: {
    query: string;
    provider: string;
    results: { title: string; url: string; snippet: string }[];
  } | null;
}

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

export function generateMockResponse(message: string, ctx: AIContext): string {
  const q = message.toLowerCase();
  const ids = ctx.integrations.filter((i) => i.connected).map((i) => i.id);
  const connectedNames = ctx.integrations
    .filter((i) => i.connected)
    .map((i) => i.name);

  const has = (id: string) => ids.includes(id);

  const includes = (...terms: string[]) => terms.some((t) => q.includes(t));

  // ── Health / Overview ───────────────────────────────────────────
  if (includes("health", "score", "overview", "status", "how are we", "summary")) {
    const trend = ctx.businessHealth > 80 ? "🟢 Excellent" : ctx.businessHealth > 65 ? "🟡 Healthy" : "🔴 Needs Attention";
    return `## 📊 Business Health Score: **${ctx.businessHealth}/100** — ${trend}

**What's working well:**
- 💰 MRR at **$${fmt(ctx.revenue)}** — up ~15% month-over-month
- 👥 **${fmt(ctx.customers)} active customers** (610 net new in June)
- ⚡ Engineering velocity is stable — 4 PRs merged this week

**Needs your attention:**
- ⚠️ 3 enterprise accounts showing churn signals — API usage down 40%
- 🔴 Security vulnerability in \`lodash@4.17.15\` (CVE-2021-23337) — patch pending
- 💡 /pricing page traffic up **45%** but conversion is only 2.1%

**My top recommendation today:** Address the churn risk first — those 3 accounts represent ~$28k ARR. Want me to draft QBR outreach emails?`;
  }

  // ── Revenue / MRR / Stripe ──────────────────────────────────────
  if (includes("revenue", "mrr", "arr", "money", "billing", "stripe", "invoice", "payment")) {
    if (!has("stripe")) {
      return `💳 **Stripe is not connected yet.**\n\nOnce you link Stripe, I can show you:\n- Real-time MRR / ARR breakdown\n- Failed payment alerts\n- Churn revenue vs. expansion revenue\n- Invoice aging reports\n\n→ Head to **Integrations** to connect Stripe in 30 seconds.`;
    }
    return `## 💰 Revenue Intelligence — Stripe Data

**Monthly Recurring Revenue:** $${fmt(ctx.revenue)}
**Annual Run Rate:** $${fmt(ctx.revenue * 12)}
**MoM Growth:** +15.2% (June vs May)

| Metric | This Month | Last Month | Δ |
|--------|------------|------------|---|
| MRR | $${fmt(ctx.revenue)} | $${fmt(Math.round(ctx.revenue * 0.85))} | +15.2% |
| New MRR | $52,400 | $44,100 | +18.8% |
| Churned MRR | $3,200 | $4,100 | -22% ✅ |
| Expansion MRR | $18,700 | $12,300 | +52% 🚀 |

**⚠️ Alert:** 2 invoices past due ($4,800 total). Payment retries scheduled.

**My take:** Expansion MRR growing 52% is your strongest signal — your upsell motion is working. Lean into it.`;
  }

  // ── Customers / Churn / Retention ──────────────────────────────
  if (includes("customer", "churn", "retention", "user", "client", "account")) {
    return `## 👥 Customer Intelligence

**Active Customers:** ${fmt(ctx.customers)}
**Net New (June):** +610 customers
**Monthly Churn Rate:** 1.8% (industry avg: 2.5%) ✅
**Net Revenue Retention:** 118% 🚀

**Churn Risk Radar:**
| Account | ARR | Signal | Days Until Risk |
|---------|-----|--------|-----------------|
| Lumen AI | $14,400 | API usage ↓ 40% | ~12 days |
| Northwind Labs | $8,800 | Login gap > 18 days | ~7 days |
| Cascadia Corp | $4,900 | Support tickets ↑ 3x | ~21 days |

**🎯 Recommended action:** Auto-schedule QBR calls with these 3 accounts this week. Estimated ARR at risk: **$28,100**.

Want me to draft personalized outreach for each account?`;
  }

  // ── GitHub / Engineering / Code ─────────────────────────────────
  if (includes("github", "code", "pr", "pull request", "engineer", "deploy", "bug", "velocity")) {
    if (!has("github")) {
      return `⚙️ **GitHub is not connected yet.**\n\nConnect GitHub and I'll monitor:\n- PR velocity and review time\n- Open issues and critical bugs\n- Dependency vulnerabilities\n- Deployment frequency\n\n→ Head to **Integrations** to connect GitHub.`;
    }
    return `## ⚡ Engineering Pulse — GitHub Data

**Sprint Velocity:** 34 story points (↑ from 29 last sprint)
**Open PRs:** 12 (3 awaiting review > 48h ⚠️)
**Open Issues:** 47 (8 labeled \`critical\`)

**🔴 Security Alert:**
\`\`\`
lodash@4.17.15 — CVE-2021-23337 (Prototype Pollution)
Severity: HIGH | Fix: upgrade to 4.17.21
\`\`\`

**Deployment Health:**
- Last deploy: 6 hours ago ✅
- Deploy frequency: 2.3/day (healthy)
- Rollback rate: 0% this sprint 🚀

**Stale PRs needing attention:**
1. \`feat/billing-portal\` — open 4 days, 0 reviews
2. \`fix/auth-token-refresh\` — open 3 days, blocked

Want me to create a hotfix PR for the lodash vulnerability and ping the PR authors?`;
  }

  // ── Marketing / Traffic / SEO ───────────────────────────────────
  if (includes("marketing", "traffic", "seo", "lead", "conversion", "landing", "campaign", "ads")) {
    if (!has("google-analytics")) {
      return `📈 **Google Analytics is not connected yet.**\n\nConnect it to see:\n- Real-time traffic and conversion rates\n- Top traffic sources\n- Page performance and bounce rates\n- Funnel drop-off analysis\n\n→ Head to **Integrations** to connect Google Analytics.`;
    }
    return `## 📈 Marketing Intelligence

**This Week's Traffic:** 28,400 sessions (↑ 31%)
**Top Traffic Source:** Organic Search (42%) > Direct (24%) > Referral (19%)

**🔥 Trending:** \`/pricing\` page traffic up **45%** since ProductHunt launch
- Sessions: 4,200 | Conversions: 88 (2.1% CVR)
- Benchmark CVR for SaaS pricing pages: 3.5–5%
- **Opportunity: +58 signups/week** if we hit industry average

**Top Converting Pages:**
1. \`/features\` → 4.8% CVR
2. \`/pricing\` → 2.1% CVR ⚠️
3. \`/blog/ai-founders\` → 1.9% CVR

**🎯 Recommendation:** A/B test the pricing page CTA — change from "Start Free Trial" to "Try Free for 14 Days, No Credit Card". Expected +1.2% CVR lift based on similar SaaS patterns.`;
  }

  // ── Support / Zendesk / Tickets ─────────────────────────────────
  if (includes("support", "ticket", "zendesk", "customer issue", "complaint", "help desk")) {
    if (!has("zendesk")) {
      return `🎧 **Zendesk is not connected yet.**\n\nConnect it to monitor:\n- Open ticket volume and SLA status\n- CSAT scores\n- Common issue patterns\n- Support team performance\n\n→ Head to **Integrations** to connect Zendesk.`;
    }
    return `## 🎧 Support Desk Overview — Zendesk

**Open Tickets:** 34 (6 breaching SLA ⚠️)
**Avg Resolution Time:** 4.2 hours (SLA target: 6h) ✅
**CSAT Score:** 4.6/5.0 ⭐

**Trending Issues This Week:**
1. "SSO login not working" — 8 tickets (same root cause)
2. "Webhook delivery delayed" — 5 tickets
3. "CSV export failing for >10k rows" — 4 tickets

**🔴 Urgent:** The SSO issue affects enterprise customers (Lumen AI is one of them). This is likely contributing to their churn signal.

**Recommended action:** Create a known issues banner on the dashboard and send a proactive email to affected accounts. Want me to draft that email?`;
  }

  // ── Slack / Team ────────────────────────────────────────────────
  if (includes("slack", "team", "comms", "communication", "standup")) {
    if (!has("slack")) {
      return `💬 **Slack is not connected yet.**\n\nConnect Slack and I'll:\n- Monitor critical channel alerts\n- Surface key decisions and blockers\n- Summarize daily standups\n- Alert you to anomalies in team conversations\n\n→ Head to **Integrations** to connect Slack.`;
    }
    return `## 💬 Team Pulse — Slack Data

**Active Channels:** 24
**Messages Today:** 487
**Unread Mentions (you):** 3

**🔔 Alerts from #engineering:**
- @sarah flagged the auth service is 200ms slower after yesterday's deploy
- PR review queue is backing up — 5 PRs waiting > 24h

**🔔 Alerts from #growth:**
- ProductHunt traffic spike — #product-launch seeing 34 new messages
- @mike needs approval on $2k ad spend for retargeting campaign

**Summary:** Team is active and focused. Main blocker is PR review queue — Engineering Agent should batch-notify reviewers.`;
  }

  // ── Incidents / PagerDuty / Uptime ──────────────────────────────
  if (includes("incident", "downtime", "uptime", "pagerduty", "outage", "alert", "on-call")) {
    if (!has("pagerduty")) {
      return `🚨 **PagerDuty is not connected yet.**\n\nConnect it to track:\n- Active incidents and severity\n- On-call schedules\n- MTTR and incident frequency\n- Uptime SLA compliance\n\n→ Head to **Integrations** to connect PagerDuty.`;
    }
    return `## 🚨 Incident Intelligence — PagerDuty

**Current Status:** 🟢 All systems operational
**Uptime (30 days):** 99.97%
**Open Incidents:** 0

**Recent Incident History:**
| Incident | Severity | Duration | MTTR |
|----------|----------|----------|------|
| Auth timeout spike | P2 | 23 min | 14 min |
| Webhook queue backup | P3 | 47 min | 31 min |
| CDN propagation lag | P4 | 8 min | 5 min |

**MTTR Trend:** ↓ 22% vs last month (improving!) ✅
**On-Call This Week:** @devops-team (rotation ends Friday)

All clear — no active issues. Your reliability SLA is being met comfortably.`;
  }

  // ── Linear / Jira / Sprint ─────────────────────────────────────
  if (includes("linear", "jira", "sprint", "backlog", "issue", "roadmap", "project")) {
    const tool = has("linear") ? "Linear" : has("jira") ? "Jira" : null;
    if (!tool) {
      return `📋 **Linear / Jira not connected yet.**\n\nConnect your project tracker to see:\n- Sprint progress and velocity\n- Backlog priorities\n- Blocked issues\n- Engineering roadmap health\n\n→ Head to **Integrations** to connect Linear or Jira.`;
    }
    return `## 📋 Sprint Intelligence — ${tool}

**Current Sprint:** Sprint 18 (ends in 4 days)
**Completion:** 68% (21/31 story points done)

**In Progress:**
- Billing portal v2 — 8 pts (2 days left)
- API rate limiting — 5 pts (on track)
- Dashboard redesign — 13 pts ⚠️ (behind schedule)

**Blocked:**
- \`AUTH-441\`: Needs design approval from @jessica
- \`INFRA-208\`: Blocked on AWS quota increase (pending 2 days)

**Risk:** Dashboard redesign is 2 days behind. If it doesn't ship, 13 pts roll to next sprint. Suggest daily check-in with lead today.`;
  }

  // ── Agents ──────────────────────────────────────────────────────
  if (includes("agent", "automate", "automation", "bot", "autonomous")) {
    return `## 🤖 Active Agent Status

| Agent | Status | Last Action |
|-------|--------|-------------|
| Marketing Agent | 🟢 Active | Analyzed organic traffic for June (+15%) |
| Finance Agent | 🟢 Active | Prepared Q3 cashflow forecast |
| Engineering Agent | 🟢 Active | Flagged lodash vulnerability in package.json |
| Sales Agent | ⏸️ Paused | Awaiting activation |
| Support Agent | ⏸️ Paused | Awaiting activation |

**Agents run in the background 24/7.** Currently monitoring ${connectedNames.length > 0 ? connectedNames.join(", ") : "your connected tools"}.

💡 **Tip:** Activate the **Sales Agent** to automate lead qualification and follow-up emails. Estimated time saved: ~3h/week.

Want to activate more agents or see a detailed log of recent actions?`;
  }

  // ── Action Requests (schedule, create, send, write) ─────────────
  if (includes("schedule", "create pr", "send email", "draft", "write", "generate")) {
    return `🎯 I can help with that action.

Here's what I would do:

1. **Identify affected parties** — Pull the relevant account/contact data from your connected tools
2. **Draft the content** — Generate the email/PR/document based on your context
3. **Queue for your approval** — Never execute without your explicit sign-off
4. **Execute & log** — Take the action and log it in the audit trail

**For this specific request:**
Since you asked to "${message}", I'd need to:
- Confirm the target (which accounts/repos/channels)
- Generate a draft for your review
- Get your one-click approval

**⚠️ Note:** I always require your approval before sending emails or creating PRs. Click "Resolve" on any recommendation card in the dashboard to trigger an agent action.

Want me to proceed with a draft?`;
  }

  // ── Recommendations / Priorities ────────────────────────────────
  if (includes("recommend", "priority", "what should", "focus", "today", "urgent", "important")) {
    return `## 🧠 Your Top Priorities Right Now

**🔴 Critical (Do Today):**
1. **Churn risk**: 3 enterprise accounts at risk — $28k ARR. Schedule QBRs.
2. **Security patch**: \`lodash\` CVE in production. Create hotfix PR.

**🟡 This Week:**
3. **Pricing page CVR**: 2.1% vs 3.5% industry avg — A/B test the CTA copy.
4. **SSO bug**: 8 support tickets with same root cause — fix and proactive email.
5. **PR review backlog**: 5 PRs waiting 24h+ — ping reviewers.

**🟢 Upcoming:**
6. **Dashboard redesign**: 2 days behind sprint — daily check-in with team.
7. **Sales Agent activation**: 3h/week time saving opportunity.

**Business Health Forecast:**
If you resolve items 1–3 this week, your Business Health Score should move from **${ctx.businessHealth}** → **${Math.min(100, ctx.businessHealth + 12)}** by next week. 📈`;
  }

  // ── Integrations / Connected / Connect ──────────────────────────
  if (includes("integrat", "connect", "link", "tool", "setup")) {
    const remaining = ctx.integrations
      .filter((i) => !i.connected)
      .map((i) => i.name);
    return `## 🔌 Integration Status

**Connected (${connectedNames.length}):** ${connectedNames.length > 0 ? connectedNames.join(", ") : "None yet"}

**Not connected (${remaining.length}):** ${remaining.join(", ")}

Each integration you add improves your **Business Health Score** and gives me more data to surface insights.

| Next Integration | What you gain |
|----------------|--------------|
| Stripe | Real MRR, churn alerts, invoice monitoring |
| GitHub | PR velocity, security alerts, deploy tracking |
| Slack | Team pulse, blocker detection |
| Google Analytics | Traffic, conversion, funnel analysis |

Head to the **Integrations** tab to connect them. Each takes about 30 seconds.`;
  }

  // ── Greetings ───────────────────────────────────────────────────
  if (includes("hello", "hi ", "hey", "good morning", "good evening")) {
    return `Hey${ctx.userName ? ` ${ctx.userName}` : ""}! 👋 I'm your AI Co-founder, always watching over your startup.

Here's your **quick morning brief:**
- 📊 Business Health: **${ctx.businessHealth}/100** (${ctx.businessHealth > 75 ? "looking strong" : "needs attention"})
- 💰 MRR: **$${fmt(ctx.revenue)}** (↑ 15% MoM)
- 👥 Customers: **${fmt(ctx.customers)}** active
- ⚠️ **3 items** need your attention today

What would you like to dive into? Ask me about revenue, customers, team health, or say "what are my priorities today?"`;
  }

  // ── Help ────────────────────────────────────────────────────────
  if (includes("help", "what can you", "capabilities", "how do i")) {
    return `## 💡 Here's what I can do for you

**Ask me about:**
- 📊 \`business health\` — Overall company score and risks
- 💰 \`revenue\` / \`MRR\` — Stripe billing intelligence
- 👥 \`customers\` / \`churn\` — Retention and at-risk accounts
- ⚡ \`GitHub\` / \`engineering\` — Code velocity and security
- 📈 \`marketing\` / \`traffic\` — Conversion and campaign data
- 🎧 \`support tickets\` — Zendesk trends and SLA status
- 🚨 \`incidents\` / \`uptime\` — PagerDuty operational health
- 📋 \`sprint\` / \`Linear\` — Project and backlog status
- 🤖 \`agents\` — Automation status and logs
- 🧠 \`priorities\` — What to focus on right now

**I can also draft:** emails, PR descriptions, reports, and more.`;
  }

  // ── Default ─────────────────────────────────────────────────────
  return `I'm analyzing "${message}" across your ${connectedNames.length > 0 ? `connected tools (${connectedNames.join(", ")})` : "startup data"}...

Here's what I can tell you based on your current metrics:
- Business Health Score: **${ctx.businessHealth}/100**
- MRR: **$${fmt(ctx.revenue)}**
- Active Customers: **${fmt(ctx.customers)}**

I may need more context or a connected integration to answer that precisely. Try asking:
- "What's our business health?"
- "Show me revenue breakdown"
- "What are my priorities today?"
- "Check churn risk"

Or connect more integrations to give me richer data to work with.`;
}
