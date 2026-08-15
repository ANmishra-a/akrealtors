# 0008 — SEO architecture: per-tab URLs, SSG, sitemap exclusions

**Status:** Accepted

## Context

SEO is the site's primary acquisition channel (per the brief, this is
meant to compete with portals like Housiey on organic reach). The design
brief is unusually specific about *why* certain structural choices matter
for search: floor plans "survive AI Overviews" because the answer is an
image; construction updates are "the whole ranking signal" for
`<project> construction status <month>`-type queries because freshness
is the differentiator; and each project tab is explicitly meant to be
"its own indexed URL, its own search intent."

## Decision

- **Every project detail page is four separate prerendered routes**, not
  a client-side tab switcher: `/projects/<slug>/`,
  `/projects/<slug>/price/`, `/projects/<slug>/floor-plans/`,
  `/projects/<slug>/updates/`. Each has its own `<title>`/description
  targeting a different search intent.
- **Every page that can be is fully static** (`export const prerender =
  true`), built at deploy time from the content collections — the only
  dynamic route in the whole site is `/api/lead`. This is what makes the
  "low loading time" goal achievable without a JS-heavy runtime.
- **Ad landing pages are `noindex, nofollow`** and excluded from
  `sitemap.xml` (`@astrojs/sitemap`'s `filter` option) — they exist for
  paid traffic only and have no organic search intent; indexing them
  would just create thin/duplicate-content pages.
- `robots.txt` (`src/pages/robots.txt.ts`) explicitly disallows `/lp/`,
  `/api/`, and `/admin/`.
- Structured data: a `RealEstateAgent` JSON-LD block on every page
  (`BaseLayout.astro`) carries both office addresses and MahaRERA
  service area — the brief's "NAP must match the Google Business Profile
  character for character" requirement is centralized in `src/lib/site.ts`
  so it can never drift between pages.

## Consequences

- Publishing a new project or article is a content-only change (0004) —
  Cloudflare's rebuild regenerates every affected static route
  automatically; nobody has to remember which pages reference a project.
- A locality filter on `/projects/` (Kharadi, Wagholi, etc.) is
  client-side JavaScript over a fully server-rendered grid, not a
  separate route per locality — deliberately, since filtering doesn't
  need its own URL/search-intent the way a project's tabs do, and this
  keeps the page static.
