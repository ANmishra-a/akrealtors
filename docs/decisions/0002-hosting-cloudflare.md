# 0002 — Hosting: Cloudflare Workers (formerly "Pages")

**Status:** Accepted

## Context

The uploaded design brief's own Lead Form component is annotated *"POSTS
TO A CLOUDFLARE WORKER · SERVER-SIDE VALIDATION · HONEYPOT · RATE
LIMIT"* — the designer had already assumed Cloudflare for the backend.
Separately: free tier generosity, edge latency in India, and Turnstile
(free CAPTCHA) all favored Cloudflare over Vercel/Netlify for this site.

## Decision

Deploy on **Cloudflare**, via `@astrojs/cloudflare`. Concretely this
means **Cloudflare Workers with static assets** — Cloudflare's current
unified deployment model — not the older, separate "Pages" product.

## A build-time surprise worth recording

`@astrojs/cloudflare` v14's own README describes itself as *"An SSR
adapter for use with Cloudflare Workers targets"* — not Pages. Cloudflare
has been consolidating Pages into Workers-with-assets, and the adapter
follows that. Concretely, this meant:

- `wrangler.toml`'s `pages_build_output_dir` field triggers wrangler's
  Pages-project validation, which then **rejects** an explicit `ASSETS`
  binding — even though the adapter itself needs to declare one during
  its internal prerender step. Setting it broke the build with `The name
  'ASSETS' is reserved in Pages projects`.
- The fix: the root `wrangler.toml` only declares custom bindings
  (`LEADS_KV`, `RATE_LIMIT_KV`); it does **not** set `pages_build_output_dir`,
  `main`, or `[assets]`. The adapter generates its own complete
  `dist/server/wrangler.json` after `astro build`, with the correct
  `main`/`assets` paths, and merges in the custom bindings from the root
  file. `npm run deploy` runs `wrangler deploy` against that generated
  config.

This is the kind of thing that's invisible until you actually run
`astro build` against a real adapter version — recorded here so the next
adapter upgrade that changes this behavior doesn't cost another hour of
debugging.

## Alternatives considered

- **Vercel.** Best-in-class DX for Next.js specifically; would have
  needed a separate serverless function setup for the lead form rather
  than reusing the Worker the design brief already assumed.

## Consequences

- `npm run deploy` = `astro build && wrangler deploy` (see `package.json`).
- Two KV namespaces (`LEADS_KV`, `RATE_LIMIT_KV`) must be created once via
  `wrangler kv namespace create` and their ids pasted into `wrangler.toml`
  — see the README's deployment checklist.
- `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` are Worker secrets, not
  `.env` vars — set via `wrangler secret put`.
