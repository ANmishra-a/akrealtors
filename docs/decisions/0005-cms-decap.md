# 0005 — CMS: Decap (git-based) over Sanity/Notion

**Status:** Accepted (user's explicit choice)

## Context

The user's stated goal: adding a project update or an article should be
"as easy and hassle-free as sending a WhatsApp message," usable by a
non-technical partner, ideally from a phone. Three options were put to
the user directly:

1. **Sanity.io Studio** — real-time structured editor, built-in image
   CDN, strongest fit for repeating structured fields (recommended by
   default).
2. **Notion as CMS** — lowest learning curve (the user already uses
   Notion), weaker for structured/repeating fields without extra glue.
3. **Decap CMS (git-based)** — free, no vendor, form-based UI that
   commits straight to GitHub.

The user chose **Decap CMS**.

## Decision

Use Decap CMS, loaded from its CDN build at `/admin/`, with a GitHub
backend. Since Cloudflare has no Netlify-style built-in "Git Gateway,"
authentication is handled by a small, separately deployed OAuth worker
(`cms-oauth/`) implementing the standard two-endpoint GitHub OAuth
handshake Decap expects.

## Consequences

- **Zero recurring cost, zero extra vendor.** Content lives in the same
  git repo as the code; there's nothing else to pay for or lose access
  to.
- **"Publish" is a git commit**, not instant. Decap's `editorial_workflow`
  mode is enabled so an editor can save a draft and preview it before it
  merges to `main` and triggers a Cloudflare rebuild — this is the
  closest git-based CMS gets to Sanity's real-time feel, but it is not
  literally instant (expect ~1 minute for the rebuild).
- **No native ImageKit media picker.** Decap's built-in media library
  would commit binary photos into the git repo, which 0009 deliberately
  avoids. Image/plan/photo fields in the CMS are plain text fields for an
  ImageKit path — the editor uploads the file at imagekit.io/dashboard
  first (drag-and-drop, works from a phone), then pastes the path. This
  is the one place the "as easy as WhatsApp" goal has real friction —
  worth revisiting (e.g., a custom Decap media library plugin for
  ImageKit) if this two-step upload proves annoying in practice.
- Requires the one-time OAuth app + worker setup in `cms-oauth/README.md`
  before `/admin/` can be used at all.
