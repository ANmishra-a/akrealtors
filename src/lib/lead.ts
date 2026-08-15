/**
 * Shared logic for the /api/lead endpoint — kept separate from the route
 * handler so it's independently testable. See
 * docs/decisions/0006-lead-capture-worker.md for the honeypot/rate-limit/
 * Telegram-alert design.
 */

export interface LeadPayload {
  name: string;
  phone: string;
  configuration: string;
  timeline: string;
  siteVisitDay: string;
  project: string;
  source: string;
  consentContact: boolean;
  consentUpdates: boolean;
  consentTextVersion: string;
  consentTimestamp: string;
  website?: string; // honeypot
}

export interface ValidationResult {
  ok: boolean;
  error?: string;
}

const PHONE_RE = /^[6-9]\d{9}$/;

export function isHoneypotTripped(payload: Partial<LeadPayload>): boolean {
  return Boolean(payload.website && payload.website.trim().length > 0);
}

export function validateLead(payload: Partial<LeadPayload>): ValidationResult {
  if (!payload.name || payload.name.trim().length < 2) {
    return { ok: false, error: "Enter your name." };
  }
  if (!payload.phone || !PHONE_RE.test(payload.phone.trim())) {
    return { ok: false, error: "Enter a valid 10-digit mobile number." };
  }
  if (!payload.consentContact) {
    return { ok: false, error: "Please tick the consent box so we can contact you." };
  }
  if (!payload.project || !payload.source) {
    return { ok: false, error: "Missing project/source context." };
  }
  return { ok: true };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function formatTelegramMessage(payload: LeadPayload): string {
  return [
    "🏠 <b>New lead — AK Realtors</b>",
    `<b>${escapeHtml(payload.name)}</b> · ${escapeHtml(payload.phone)}`,
    `Project: ${escapeHtml(payload.project)}`,
    `Config: ${escapeHtml(payload.configuration)} · Timeline: ${escapeHtml(payload.timeline)}`,
    `Site visit: ${escapeHtml(payload.siteVisitDay)}`,
    `Source: ${escapeHtml(payload.source)}`,
    `Updates opt-in: ${payload.consentUpdates ? "yes" : "no"}`,
  ].join("\n");
}

export async function sendTelegramAlert(env: { TELEGRAM_BOT_TOKEN?: string; TELEGRAM_CHAT_ID?: string }, payload: LeadPayload): Promise<void> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return; // not configured yet — fail open, never block the lead
  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text: formatTelegramMessage(payload),
      parse_mode: "HTML",
    }),
  }).catch(() => {
    /* Telegram being down must never fail the lead submission itself. */
  });
}
