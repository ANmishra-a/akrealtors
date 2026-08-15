# 0011 — Analytics: GA4 + Meta Pixel + Google Ads behind a DPDP consent gate

**Status:** Accepted (user's explicit choice)

## Context

The site's ad landing pages (0008) exist specifically for Meta/Google ad
campaigns, and each Lead Form submission already carries a `source` tag
meant for attribution. Three options were put to the user: full tracking
from launch (recommended, and chosen), GA4-only with ad pixels added
later, or no tracking at launch. India's Digital Personal Data Protection
Act (DPDP) doesn't mandate a cookie banner the way EU GDPR does, but the
site already collects and discloses data-usage information elsewhere (the
Lead Form's itemized consent checkboxes), so a consistent posture across
the whole site was chosen over a narrower legal minimum.

## Decision

- **GA4 + Google Ads conversion tag** load via Google's **Consent Mode
  v2**: the `gtag.js` script and `dataLayer` initialize immediately (so
  Google can still model aggregate behavior from denied pings), but
  `ad_storage` / `analytics_storage` / `ad_user_data` /
  `ad_personalization` all default to `"denied"` until the user accepts.
- **Meta Pixel** has no equivalent consent-mode primitive, so its script
  is not injected into the page at all until consent is granted.
- A plain-JS `ConsentBanner.astro` (not a React island — two buttons
  don't need a framework) persists the choice to `localStorage` and calls
  `window.__akConsent.grant()` / `.deny()`, defined in `Analytics.astro`.
- All three IDs (`PUBLIC_GA4_ID`, `PUBLIC_META_PIXEL_ID`,
  `PUBLIC_GOOGLE_ADS_ID`) are optional build-time env vars — the whole
  analytics block no-ops (ships zero tracking scripts) if unset, so the
  site works correctly before any ad account exists.
- A successful Lead Form submission fires a `generate_lead` GA4/Ads
  conversion event client-side (`LeadForm.tsx`).

## Consequences

- No tracking script executes for a visitor who hasn't seen (or has
  rejected) the consent banner — including on the ad landing pages that
  most need the data, which is the correct trade-off for compliance over
  short-term measurement completeness.
- Whoever runs the ad campaigns needs to fill in the three `PUBLIC_*_ID`
  vars (see `.env.example`) before conversion data will flow — there is
  no separate "enable analytics" step beyond setting those.
