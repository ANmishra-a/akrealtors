# Architecture decision records

Every choice in this list changes what the site can do, how fast it loads,
or what it costs to run — the kind of decision that's expensive to
reverse once the site is live and has traffic. Each file is short on
purpose: what we chose, what we didn't, and why, so a future decision
(including "let's rip this out") starts from the actual reasoning instead
of re-litigating it from scratch.

| # | Decision |
|---|---|
| [0001](./0001-framework-astro.md) | Framework: Astro + React islands |
| [0002](./0002-hosting-cloudflare.md) | Hosting: Cloudflare Workers (formerly "Pages") |
| [0003](./0003-design-system-tokens.md) | Design system as CSS custom properties, ported from the approved brief |
| [0004](./0004-content-model-markdown-collections.md) | Content model: Astro content collections over markdown |
| [0005](./0005-cms-decap.md) | CMS: Decap (git-based) over Sanity/Notion |
| [0006](./0006-lead-capture-worker.md) | Lead capture: Astro SSR endpoint + honeypot + KV rate limit |
| [0007](./0007-lead-alerts-telegram.md) | Lead alerts: Telegram bot over WhatsApp Cloud API |
| [0008](./0008-seo-architecture.md) | SEO architecture: per-tab URLs, SSG, sitemap exclusions |
| [0009](./0009-media-hosting-imagekit-youtube.md) | Media hosting: ImageKit (photos) + YouTube unlisted (video) |
| [0010](./0010-skeleton-loaders.md) | Loading states: plain CSS skeletons, no JS library |
| [0011](./0011-analytics-consent.md) | Analytics: GA4 + Meta Pixel + Google Ads behind a DPDP consent gate |
| [0012](./0012-astro-scoped-styles-on-child-roots.md) | Technical note: Astro scoped styles don't reach a child component's root element |

Adding a new one: copy the shape of any file here (Status / Context /
Decision / Alternatives considered / Consequences), number it
sequentially, and add a row above.
