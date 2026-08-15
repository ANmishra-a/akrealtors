# 0001 — Framework: Astro + React islands

**Status:** Accepted

## Context

The site's two stated top goals are SEO and lead generation. Google's
Core Web Vitals are a direct ranking factor, and the design brief is
almost entirely content (project pages, articles, a home page) with a
small number of genuinely interactive pieces (the lead form, tab
switching, locality filters). The user is comfortable with React/JS and
explicitly asked whether Astro would be a better fit.

## Decision

Build the site in **Astro**, using **React only for the interactive
islands** (`LeadForm.tsx`) — everything else is Astro components that
ship no client-side JavaScript at all.

## Alternatives considered

- **Next.js (App Router).** Fully React, familiar DX, strong SEO via
  server components. Rejected as the primary framework because it ships
  more baseline client JS than Astro even with RSC, and it buys
  capabilities (auth, streaming dashboards, complex client state) this
  site doesn't need. If the roadmap later needs an authenticated
  dashboard or real-time features, Next.js becomes the stronger case —
  worth revisiting then, not now.
- **Plain static HTML (no framework).** Would technically hit the same
  Core Web Vitals numbers, but the project/article content model,
  Decap CMS integration, and repeated layout (header/footer/compliance
  block/lead form across dozens of pages) make a component framework
  worth its near-zero runtime cost here.

## Consequences

- Every page is a `.astro` file; only `LeadForm.tsx` hydrates client-side
  (`client:visible` / `client:load` depending on placement).
- React knowledge transfers directly to the one place it's needed.
- Any future component that turns out to need real interactivity can be
  written in React and mounted as an island — the pattern already exists.
