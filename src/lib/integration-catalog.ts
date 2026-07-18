/**
 * Per-provider credential fields for linking integrations to a user account.
 * Users can connect with their own keys, or link the tool without live keys (demo sync).
 */

export type CredentialField = {
  key: string;
  label: string;
  placeholder: string;
  type?: "text" | "password";
  required?: boolean;
  hint?: string;
};

export type IntegrationCredentialSpec = {
  providerId: string;
  title: string;
  description: string;
  fields: CredentialField[];
  /** Optional env fallbacks used when the user leaves a field blank */
  envFallbacks?: Record<string, string | undefined>;
};

const env = (key: string) => import.meta.env[key] as string | undefined;

export const INTEGRATION_CREDENTIAL_SPECS: Record<string, IntegrationCredentialSpec> = {
  github: {
    providerId: "github",
    title: "Link GitHub to your account",
    description: "Paste a personal access token and the repo to monitor (owner/name).",
    fields: [
      { key: "token", label: "Personal Access Token", placeholder: "ghp_…", type: "password", required: false, hint: "repo scope recommended" },
      { key: "repo", label: "Repository", placeholder: "owner/repo", required: false },
    ],
    envFallbacks: { token: env("VITE_GITHUB_TOKEN"), repo: env("VITE_GITHUB_REPO") },
  },
  stripe: {
    providerId: "stripe",
    title: "Link Stripe to your account",
    description: "Use a restricted secret key so Copilot can read charges and MRR signals.",
    fields: [
      { key: "secretKey", label: "Secret Key", placeholder: "sk_live_… or sk_test_…", type: "password", required: false },
    ],
    envFallbacks: { secretKey: env("VITE_STRIPE_SECRET_KEY") },
  },
  slack: {
    providerId: "slack",
    title: "Link Slack to your account",
    description: "Incoming webhook URL for agent alerts in your workspace.",
    fields: [
      { key: "webhookUrl", label: "Incoming Webhook URL", placeholder: "https://hooks.slack.com/services/…", type: "password", required: false },
    ],
    envFallbacks: { webhookUrl: env("VITE_SLACK_WEBHOOK_URL") },
  },
  linear: {
    providerId: "linear",
    title: "Link Linear to your account",
    description: "API key from Linear → Settings → API.",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "lin_api_…", type: "password", required: false },
      { key: "workspace", label: "Workspace slug", placeholder: "acme", required: false },
    ],
  },
  jira: {
    providerId: "jira",
    title: "Link Jira to your account",
    description: "Atlassian API token + cloud site.",
    fields: [
      { key: "email", label: "Atlassian email", placeholder: "you@company.com", required: false },
      { key: "apiToken", label: "API Token", placeholder: "ATATT3…", type: "password", required: false },
      { key: "domain", label: "Site domain", placeholder: "your-domain.atlassian.net", required: false },
    ],
  },
  figma: {
    providerId: "figma",
    title: "Link Figma to your account",
    description: "Personal access token from Figma account settings.",
    fields: [
      { key: "token", label: "Access Token", placeholder: "figd_…", type: "password", required: false },
      { key: "teamId", label: "Team ID", placeholder: "1234567890", required: false },
    ],
  },
  notion: {
    providerId: "notion",
    title: "Link Notion to your account",
    description: "Internal integration token + root page ID.",
    fields: [
      { key: "token", label: "Integration Token", placeholder: "ntn_…", type: "password", required: false },
      { key: "pageId", label: "Root page ID", placeholder: "uuid", required: false },
    ],
  },
  calendar: {
    providerId: "calendar",
    title: "Link Google Calendar",
    description: "OAuth refresh token or calendar ID for founder load monitoring.",
    fields: [
      { key: "calendarId", label: "Calendar ID", placeholder: "primary", required: false },
      { key: "accessToken", label: "Access / refresh token", placeholder: "ya29.…", type: "password", required: false },
    ],
  },
  aws: {
    providerId: "aws",
    title: "Link AWS to your account",
    description: "Read-only IAM keys for cost and health signals.",
    fields: [
      { key: "accessKeyId", label: "Access Key ID", placeholder: "AKIA…", required: false },
      { key: "secretAccessKey", label: "Secret Access Key", placeholder: "…", type: "password", required: false },
      { key: "region", label: "Region", placeholder: "us-east-1", required: false },
    ],
  },
  pagerduty: {
    providerId: "pagerduty",
    title: "Link PagerDuty",
    description: "API token from PagerDuty developer settings.",
    fields: [
      { key: "apiToken", label: "API Token", placeholder: "u+…", type: "password", required: false },
    ],
  },
  hubspot: {
    providerId: "hubspot",
    title: "Link HubSpot CRM",
    description: "Private app access token with CRM scopes.",
    fields: [
      { key: "accessToken", label: "Private App Token", placeholder: "pat-…", type: "password", required: false },
    ],
  },
  gmail: {
    providerId: "gmail",
    title: "Link Gmail",
    description: "OAuth token for inbox / follow-up draft context.",
    fields: [
      { key: "accessToken", label: "OAuth access token", placeholder: "ya29.…", type: "password", required: false },
      { key: "email", label: "Mailbox", placeholder: "you@company.com", required: false },
    ],
  },
  calendly: {
    providerId: "calendly",
    title: "Link Calendly",
    description: "Personal access token from Calendly integrations.",
    fields: [
      { key: "token", label: "Personal Access Token", placeholder: "eyJ…", type: "password", required: false },
    ],
  },
  zendesk: {
    providerId: "zendesk",
    title: "Link Zendesk",
    description: "Subdomain + API token for ticket intelligence.",
    fields: [
      { key: "subdomain", label: "Subdomain", placeholder: "acme", required: false },
      { key: "email", label: "Agent email", placeholder: "you@company.com", required: false },
      { key: "apiToken", label: "API Token", placeholder: "…", type: "password", required: false },
    ],
  },
  intercom: {
    providerId: "intercom",
    title: "Link Intercom",
    description: "Access token from Intercom Developer Hub.",
    fields: [
      { key: "accessToken", label: "Access Token", placeholder: "dG9r…", type: "password", required: false },
    ],
  },
  "google-analytics": {
    providerId: "google-analytics",
    title: "Link Google Analytics",
    description: "GA4 property ID + service account / OAuth token.",
    fields: [
      { key: "propertyId", label: "GA4 Property ID", placeholder: "123456789", required: false },
      { key: "accessToken", label: "Access Token", placeholder: "ya29.…", type: "password", required: false },
    ],
  },
  mixpanel: {
    providerId: "mixpanel",
    title: "Link Mixpanel",
    description: "Service account or project API secret.",
    fields: [
      { key: "projectId", label: "Project ID", placeholder: "1234567", required: false },
      { key: "apiSecret", label: "API Secret", placeholder: "…", type: "password", required: false },
    ],
  },
  mailchimp: {
    providerId: "mailchimp",
    title: "Link Mailchimp",
    description: "API key from Mailchimp account → Extras → API keys.",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "…-us1", type: "password", required: false },
      { key: "serverPrefix", label: "Server prefix", placeholder: "us1", required: false },
    ],
  },
  twitter: {
    providerId: "twitter",
    title: "Link X (Twitter)",
    description: "Bearer token for brand / social monitoring.",
    fields: [
      { key: "bearerToken", label: "Bearer Token", placeholder: "AAAA…", type: "password", required: false },
      { key: "handle", label: "Handle", placeholder: "@yourstartup", required: false },
    ],
  },
  quickbooks: {
    providerId: "quickbooks",
    title: "Link QuickBooks",
    description: "OAuth access token + company (realm) ID.",
    fields: [
      { key: "accessToken", label: "Access Token", placeholder: "eyJ…", type: "password", required: false },
      { key: "realmId", label: "Company / Realm ID", placeholder: "1234567890", required: false },
    ],
  },
};

/** Spec used when a provider has no custom fields — still links to the user account */
export function getCredentialSpec(providerId: string): IntegrationCredentialSpec {
  return (
    INTEGRATION_CREDENTIAL_SPECS[providerId] ?? {
      providerId,
      title: `Link ${providerId} to your account`,
      description: "Connect this tool to your Copilot account. Add optional credentials for live sync.",
      fields: [
        { key: "accountLabel", label: "Account label", placeholder: "My workspace", required: false },
        { key: "apiKey", label: "API key (optional)", placeholder: "…", type: "password", required: false },
      ],
    }
  );
}

export function mergeWithEnvFallbacks(
  providerId: string,
  input: Record<string, string>,
): Record<string, string> {
  const spec = getCredentialSpec(providerId);
  const out: Record<string, string> = { ...input };
  for (const [k, v] of Object.entries(spec.envFallbacks ?? {})) {
    if (!out[k]?.trim() && v) out[k] = v;
  }
  // Drop empty strings
  for (const k of Object.keys(out)) {
    if (!out[k]?.trim()) delete out[k];
  }
  return out;
}

export function hasAnyCredential(creds: Record<string, string> | undefined): boolean {
  if (!creds) return false;
  return Object.values(creds).some((v) => Boolean(v?.trim()));
}

export function accountLabelFromCreds(providerId: string, creds: Record<string, string>): string {
  if (creds.repo) return creds.repo;
  if (creds.handle) return creds.handle;
  if (creds.email) return creds.email;
  if (creds.workspace) return creds.workspace;
  if (creds.subdomain) return `${creds.subdomain}.zendesk.com`;
  if (creds.domain) return creds.domain;
  if (creds.calendarId) return creds.calendarId;
  if (creds.accountLabel) return creds.accountLabel;
  if (hasAnyCredential(creds)) return "Linked credentials";
  return "Linked to account";
}
