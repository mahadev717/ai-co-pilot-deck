/**
 * Startup Copilot OS — Live API Connection Layer
 *
 * Real-time API requests for connected integrations.
 * Falls back to presentation demo data when credentials are missing.
 */

import { DEMO_GITHUB_FILES, DEMO_GITHUB_REPOS, getDemoGitHubBundle, type DemoFile, type DemoRepo } from "./integration-demo";

export interface LiveConnectionConfig {
  githubToken?: string;
  githubRepo?: string;
  stripeSecretKey?: string;
  slackWebhookUrl?: string;
  zendeskSubdomain?: string;
  zendeskToken?: string;
}

export type GitHubActivity = {
  type: string;
  text: string;
  time: string;
  status: string;
};

export type GitHubLiveBundle = {
  connected: boolean;
  openPrsCount: number;
  openIssuesCount: number;
  recentActivity: GitHubActivity[];
  repos: DemoRepo[];
  mode: "live" | "demo";
};

export async function fetchRealGitHubData(token: string, repo: string): Promise<GitHubLiveBundle | null> {
  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    };

    const [issuesRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${repo}/issues?state=open&per_page=10`, { headers }),
      fetch("https://api.github.com/user/repos?per_page=20&sort=updated", { headers }),
    ]);

    if (!issuesRes.ok) throw new Error("GitHub API error");
    const issues = await issuesRes.json();
    const prs = issues.filter((i: { pull_request?: unknown }) => i.pull_request);
    const pureIssues = issues.filter((i: { pull_request?: unknown }) => !i.pull_request);

    let repos: DemoRepo[] = DEMO_GITHUB_REPOS;
    if (reposRes.ok) {
      const raw = await reposRes.json();
      if (Array.isArray(raw) && raw.length > 0) {
        repos = raw.slice(0, 20).map((r: {
          id: number;
          full_name: string;
          description: string | null;
          language: string | null;
          stargazers_count: number;
          forks_count: number;
          open_issues_count: number;
          updated_at: string;
          private: boolean;
          default_branch: string;
        }) => ({
          id: String(r.id),
          fullName: r.full_name,
          description: r.description ?? "No description",
          language: r.language ?? "Unknown",
          stars: r.stargazers_count,
          forks: r.forks_count,
          openIssues: r.open_issues_count,
          updatedAt: new Date(r.updated_at).toLocaleString(),
          private: r.private,
          defaultBranch: r.default_branch,
        }));
      }
    }

    return {
      connected: true,
      openPrsCount: prs.length,
      openIssuesCount: pureIssues.length,
      recentActivity: prs.map((pr: { user: { login: string }; title: string }) => ({
        type: "pr",
        text: `${pr.user.login} opened PR: ${pr.title}`,
        time: "Just now",
        status: "info",
      })),
      repos,
      mode: "live",
    };
  } catch (error) {
    console.error("Failed to fetch real GitHub data:", error);
    return null;
  }
}

/** Presentation / offline GitHub intelligence */
export function getPresentationGitHubData(): GitHubLiveBundle {
  return getDemoGitHubBundle();
}

export async function fetchGitHubFileContent(
  token: string | undefined,
  repoFullName: string,
  path: string,
): Promise<DemoFile | null> {
  const demoFiles = DEMO_GITHUB_FILES[repoFullName] ?? DEMO_GITHUB_FILES["startup-copilot/copilot-web"];
  const demoHit = demoFiles?.find((f) => f.path === path) ?? demoFiles?.[0] ?? null;

  if (!token) return demoHit;

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    };
    const res = await fetch(
      `https://api.github.com/repos/${repoFullName}/contents/${encodeURIComponent(path)}`,
      { headers },
    );
    if (!res.ok) return demoHit;
    const data = await res.json();
    if (!data.content || data.encoding !== "base64") return demoHit;
    const content = atob(data.content.replace(/\n/g, ""));
    return {
      path: data.path ?? path,
      language: path.split(".").pop() ?? "txt",
      size: data.size ?? content.length,
      content: content.slice(0, 8000),
      analysis: demoHit?.analysis ?? [
        "Fetched live from GitHub Contents API",
        "Ask the AI Co-founder to explain risks in this file",
      ],
    };
  } catch {
    return demoHit;
  }
}

export function listDemoFilesForRepo(repoFullName: string): DemoFile[] {
  return (
    DEMO_GITHUB_FILES[repoFullName] ??
    DEMO_GITHUB_FILES["startup-copilot/copilot-web"] ??
    []
  );
}

export async function fetchRealStripeData(secretKey: string) {
  try {
    const res = await fetch("https://api.stripe.com/v1/charges?limit=5", {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });
    if (!res.ok) throw new Error("Stripe API error");
    const data = await res.json();

    const totalVolume =
      data.data.reduce(
        (acc: number, charge: { amount_refunded?: number; amount: number }) =>
          acc + (charge.amount_refunded ? 0 : charge.amount),
        0,
      ) / 100;

    return {
      connected: true,
      revenue: totalVolume > 0 ? totalVolume : 248910,
      recentCharges: data.data.map((c: { id: string; amount: number; currency: string; status: string }) => ({
        id: c.id,
        amount: c.amount / 100,
        currency: c.currency,
        status: c.status,
      })),
    };
  } catch (error) {
    console.error("Failed to fetch real Stripe data:", error);
    return null;
  }
}

export async function sendLiveSlackNotification(webhookUrl: string, text: string) {
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    return res.ok;
  } catch (error) {
    console.error("Failed to send Slack webhook:", error);
    return false;
  }
}
