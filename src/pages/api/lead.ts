import type { APIRoute } from "astro";
// Astro v6 removed `Astro.locals.runtime.env` in favour of importing the
// bindings straight from the `cloudflare:workers` module. This module only
// resolves when actually running on the Cloudflare Workers runtime (dev
// server via wrangler, or production) — see docs/decisions/0006-lead-capture-worker.md.
import { env } from "cloudflare:workers";
import { isHoneypotTripped, validateLead, sendTelegramAlert, type LeadPayload } from "@/lib/lead";

export const prerender = false;

const RATE_LIMIT_WINDOW_SECONDS = 600; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 5;

export const POST: APIRoute = async ({ request }) => {
  let payload: Partial<LeadPayload>;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  // Honeypot: real users never see or fill the `website` field. Bots that
  // fill every field trip it — return a fake success so the bot doesn't
  // learn to skip the field next time, but never notify or store it.
  if (isHoneypotTripped(payload)) {
    return json({ ok: true }, 200);
  }

  const validation = validateLead(payload);
  if (!validation.ok) {
    return json({ error: validation.error }, 400);
  }
  const lead = payload as LeadPayload;

  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  if (env.RATE_LIMIT_KV) {
    const rateLimited = await checkRateLimit(env.RATE_LIMIT_KV, ip);
    if (rateLimited) {
      return json({ error: "Too many requests. Please try WhatsApp instead." }, 429);
    }
  }

  const leadId = crypto.randomUUID();
  const record = { ...lead, id: leadId, ip, receivedAt: new Date().toISOString() };

  if (env.LEADS_KV) {
    await env.LEADS_KV.put(`lead:${record.receivedAt}:${leadId}`, JSON.stringify(record));
  }

  await sendTelegramAlert(env, lead);

  return json({ ok: true, id: leadId }, 200);
};

async function checkRateLimit(kv: KVNamespace, ip: string): Promise<boolean> {
  const key = `ratelimit:${ip}`;
  const current = await kv.get(key);
  const count = current ? parseInt(current, 10) : 0;
  if (count >= RATE_LIMIT_MAX_REQUESTS) return true;
  await kv.put(key, String(count + 1), { expirationTtl: RATE_LIMIT_WINDOW_SECONDS });
  return false;
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
