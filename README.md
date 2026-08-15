# AK Realtors — lead generation website

The main lead-generation funnel for AK Realtors Pvt. Ltd. (MahaRERA
channel partner, East Pune). Built from the approved design brief in
`Real_estate_website_strategy.zip` — every non-obvious technical choice
below is written up in **[`docs/decisions/`](./docs/decisions/README.md)**
with the alternatives considered and why they lost. Read that folder
before changing the stack, not just this file.

## Stack, in one line each

| Layer | Choice | Why (full reasoning in `docs/decisions/`) |
|---|---|---|
| Framework | Astro + React islands | [0001](./docs/decisions/0001-framework-astro.md) — near-zero shipped JS, best Core Web Vitals |
| Hosting | Cloudflare Workers | [0002](./docs/decisions/0002-hosting-cloudflare.md) — matches the brief's own Lead Form spec |
| Content | Markdown content collections | [0004](./docs/decisions/0004-content-model-markdown-collections.md) |
| CMS | Decap CMS (git-based) | [0005](./docs/decisions/0005-cms-decap.md) — your choice |
| Lead capture | Astro SSR endpoint + KV | [0006](./docs/decisions/0006-lead-capture-worker.md) |
| Lead alerts | Telegram bot | [0007](./docs/decisions/0007-lead-alerts-telegram.md) — your choice |
| Images / video | ImageKit / YouTube unlisted | [0009](./docs/decisions/0009-media-hosting-imagekit-youtube.md) — your choice |
| Loading states | Plain CSS skeletons | [0010](./docs/decisions/0010-skeleton-loaders.md) |
| Analytics | GA4 + Meta Pixel + Google Ads, consent-gated | [0011](./docs/decisions/0011-analytics-consent.md) — your choice |

## Local development

```sh
npm install
cp .env.example .env   # fill in what you have; everything is optional to start
npm run dev             # http://localhost:4321
```

`npm run build` runs `astro check` (type checking) then `astro build` —
run this before every commit; CI-equivalent to what Cloudflare will do.

Cloudflare-specific bindings (`LEADS_KV`, `RATE_LIMIT_KV`, Telegram
secrets) aren't available under plain `astro dev` — `/api/lead` still
works locally (validation, honeypot), it just skips storage/rate-limit/
alerts when those bindings aren't present. To test against real
bindings locally, use `wrangler pages dev` / `wrangler dev` with a
`.dev.vars` file (never commit this).

## First-time deployment checklist

1. **Cloudflare KV namespaces** (once):
   ```sh
   npx wrangler kv namespace create LEADS_KV
   npx wrangler kv namespace create RATE_LIMIT_KV
   ```
   Paste the returned ids into `wrangler.toml`.

2. **Telegram bot** for lead alerts ([0007](./docs/decisions/0007-lead-alerts-telegram.md)):
   - Message [@BotFather](https://t.me/BotFather) on Telegram, `/newbot`, note the token.
   - Message your new bot once, then visit
     `https://api.telegram.org/bot<TOKEN>/getUpdates` to find your `chat.id`.
   - `npx wrangler secret put TELEGRAM_BOT_TOKEN`
   - `npx wrangler secret put TELEGRAM_CHAT_ID`

3. **Deploy**:
   ```sh
   npm run deploy   # astro build && wrangler deploy
   ```

4. **CMS OAuth worker** (separate, one-time — see
   [`cms-oauth/README.md`](./cms-oauth/README.md)) so `/admin/` can log
   in with GitHub.

5. **ImageKit** ([0009](./docs/decisions/0009-media-hosting-imagekit-youtube.md)):
   sign up free at [imagekit.io](https://imagekit.io), set
   `PUBLIC_IMAGEKIT_URL_ENDPOINT` in Cloudflare's dashboard (Settings →
   Environment variables) to your account's URL endpoint.

6. **Analytics** ([0011](./docs/decisions/0011-analytics-consent.md), optional
   — the site works with zero tracking until these are set): fill in
   `PUBLIC_GA4_ID`, `PUBLIC_META_PIXEL_ID`, `PUBLIC_GOOGLE_ADS_ID` as
   Cloudflare environment variables.

## Adding or updating a project

This is the "hassle-free, regularly updated" workflow the site is built
around:

1. Go to `/admin/`, log in with GitHub.
2. **Projects** collection → open the project (or **New Project**).
3. Fill in the fields you have; leave the rest as `DATA SLOT` — the site
   renders those visibly as placeholders, never as blank or wrong data.
4. For a photo: upload it at [imagekit.io/dashboard](https://imagekit.io/dashboard)
   first, then paste the resulting path (e.g. `projects/park-eden/hero.jpg`)
   into the matching field. (See [0005](./docs/decisions/0005-cms-decap.md)
   for why this is two steps instead of one.)
5. **Adding a monthly construction update** — the recurring task — is one
   new entry in the "Construction updates" list: date, title, two
   sentences, a photo path. That's the entire monthly ritual the design
   brief calls "the whole moat."
6. Uncheck **Draft** when it's ready to go live, then **Publish**. Cloudflare
   rebuilds automatically (~1 minute).

Adding an article works the same way under the **Insights** collection.

## Adding a new ad landing page

Ad landing pages are one Astro file each, not CMS content (campaigns are
infrequent enough that a developer editing a file is fine — see
[0008](./docs/decisions/0008-seo-architecture.md)). Copy
`src/pages/lp/kharadi-annexe.astro` to a new file, change the copy, and
give the `<LeadForm>` a new unique `source` string so leads from this
campaign are attributable. It automatically inherits `noindex` and stays
out of the sitemap.

## Known open item: Park Eden's locality

The design brief lists Park Eden's locality as **Wagholi**; the shared
Google Drive folder of marketing collaterals is titled *"Park Eden -
**Kharadi** - Marketing Collaterals for CPs."* This is flagged as an
`internalNote` on `src/content/projects/park-eden.md` — confirm the
correct micro-market with the developer before this project goes live,
since the MahaRERA disclosure block must be accurate.

## Compliance notes baked into the build, not bolted on

- Every project and ad-landing page carries a MahaRERA disclosure block
  (project + agent registration numbers, a QR code slot) — including
  `noindex` pages, since MahaRERA Order 46C/2025 applies regardless of
  search indexing.
- Every photo/render is captioned "Artist's impression" by
  `SkeletonImage.astro` by default.
- The Lead Form's consent checkboxes are itemized per DPDP's
  purpose-limitation principle (contact-me vs. other-updates are
  separate, and only the first is required).
- `/privacy/` is the DPDP notice + grievance-officer contact, linked from
  the footer and the consent banner.
