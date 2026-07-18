/**
 * Leave approval emails — server-side sender
 *
 * Priority:
 *  1. Resend API when RESEND_API_KEY is set (real email)
 *  2. Otherwise returns a mailto payload the client can open
 */

import { createServerFn } from "@tanstack/react-start";

function readEnv(name: string): string | undefined {
  const fromVite = (import.meta as ImportMeta & { env?: Record<string, string> }).env?.[name];
  if (fromVite) return fromVite.trim();
  if (typeof process !== "undefined" && process.env?.[name]) {
    return process.env[name]!.trim();
  }
  return undefined;
}

export type LeaveEmailPayload = {
  to: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  status: "approved" | "rejected";
  reviewerNote?: string;
  companyName?: string;
};

function buildEmail(payload: LeaveEmailPayload) {
  const company = payload.companyName || "Startup Copilot OS";
  const decision = payload.status === "approved" ? "approved" : "declined";
  const subject =
    payload.status === "approved"
      ? `Your leave request has been approved`
      : `Update on your leave request`;

  const body = [
    `Hi ${payload.employeeName},`,
    ``,
    `Your ${payload.leaveType} leave request (${payload.startDate} → ${payload.endDate}, ${payload.days} day${payload.days === 1 ? "" : "s"}) has been ${decision}.`,
    payload.reviewerNote ? `` : null,
    payload.reviewerNote ? `Note from manager: ${payload.reviewerNote}` : null,
    ``,
    `— ${company} HR`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  return { subject, body };
}

export const sendLeaveDecisionEmail = createServerFn({ method: "POST" })
  .validator((data: LeaveEmailPayload) => data)
  .handler(async ({ data }) => {
    const { subject, body } = buildEmail(data);
    const resendKey = readEnv("RESEND_API_KEY");
    const from =
      readEnv("RESEND_FROM_EMAIL") || "Startup Copilot OS <onboarding@resend.dev>";

    if (resendKey) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: [data.to],
            subject,
            text: body,
          }),
        });
        if (!res.ok) {
          const errText = await res.text();
          return {
            ok: false as const,
            method: "resend" as const,
            error: `Resend ${res.status}: ${errText.slice(0, 200)}`,
            mailto: `mailto:${encodeURIComponent(data.to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
          };
        }
        return { ok: true as const, method: "resend" as const };
      } catch (e) {
        return {
          ok: false as const,
          method: "resend" as const,
          error: e instanceof Error ? e.message : "Email send failed",
          mailto: `mailto:${encodeURIComponent(data.to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
        };
      }
    }

    // No Resend key — client can open the default mail app
    return {
      ok: true as const,
      method: "mailto" as const,
      mailto: `mailto:${encodeURIComponent(data.to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      preview: { subject, body },
    };
  });
