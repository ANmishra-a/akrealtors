# 0006 — Lead capture: Astro SSR endpoint + honeypot + KV rate limit

**Status:** Accepted

## Context

The design brief's Lead Form component explicitly specifies: *"POSTS TO
A CLOUDFLARE WORKER · SERVER-SIDE VALIDATION · HONEYPOT · RATE LIMIT."*
Every form on the site (home, project pages, articles, ad landing pages)
reuses the same component with a different `project`/`source` tag, so
they all need to hit the same backend.

## Decision

Implement `POST /api/lead` as an **Astro SSR endpoint**
(`src/pages/api/lead.ts`, `export const prerender = false`), which
`@astrojs/cloudflare` compiles into the same single Worker as the rest of
the (mostly prerendered) site. This is functionally the "Cloudflare
Worker" the brief calls for — just reached via Astro's own routing
instead of a hand-written Cloudflare Pages Function, which avoids running
two separate deploy artifacts (the adapter's generated `_worker.js` would
otherwise conflict with a `functions/` directory).

Server-side defenses, in order:
1. **Honeypot** — a visually-hidden `website` field. A human never fills
   it; a bot that fills every field trips it. Tripping it returns a fake
   `{ ok: true }` (never `ok:false`) so a scraping bot doesn't learn to
   skip the field, but nothing is stored or alerted.
2. **Validation** — name, a 10-digit Indian mobile number pattern, and
   the consent checkbox are all re-validated server-side (never trust the
   client).
3. **Rate limiting** — a Cloudflare KV counter keyed by
   `cf-connecting-ip`, 5 requests / 10 minutes, using `expirationTtl` so
   it self-cleans without a cron job.
4. **Storage** — every valid lead is written to a `LEADS_KV` namespace as
   its own key (`lead:<timestamp>:<uuid>`), a durable backup independent
   of the Telegram alert (0007).

## Alternatives considered

- **A hand-written Cloudflare Pages Function** (`functions/api/lead.ts`).
  This is the more common pattern in Cloudflare Pages tutorials, but it's
  built for the *separate* Pages Functions deploy model, which conflicts
  with `@astrojs/cloudflare`'s single-worker output (0002). Astro's own
  SSR endpoint achieves the identical runtime behavior without the
  conflict.
- **A third-party form backend** (Formspree, etc.). Rejected — it would
  mean lead data (PII under DPDP) leaving Cloudflare's infrastructure for
  no benefit, and doesn't naturally support the honeypot/rate-limit/
  Telegram flow the brief specifies.

## Consequences

- Leads are recoverable even if Telegram is misconfigured or down
  (`sendTelegramAlert` fails open — see 0007 — and never blocks the
  lead's own success response).
- `LEADS_KV` and `RATE_LIMIT_KV` are two separate namespaces on purpose:
  one is a permanent record, the other is disposable rate-limit counters
  with a 10-minute TTL. Mixing them would make the permanent record
  harder to reason about.
