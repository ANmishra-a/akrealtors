# 0009 — Media hosting: ImageKit (photos) + YouTube unlisted (video)

**Status:** Accepted (user's explicit choice)

## Context

The user asked explicitly for photos and video to live somewhere other
than the main site "to make faster," and asked for a free, easy-to-use
recommendation. Four options were put to the user for images (three for
video, since Cloudflare Stream has no meaningful free tier):

- **ImageKit.io** (images) + **YouTube unlisted** (video) — both free,
  URL-parameter-based transforms, India-aware CDN (recommended, and
  chosen).
- Cloudinary + YouTube — similar, smaller free tier (25 credits/mo).
- Cloudflare Images + Stream — tightest integration with 0002's hosting
  choice, but both are paid with no real free tier.

## Decision

- **Photos**: hosted on ImageKit, referenced in content as a relative
  path (e.g. `projects/park-eden/hero.jpg`); `src/lib/imagekit.ts` builds
  transformation URLs (`w-`, `q-`, `f-auto` for automatic AVIF/WebP,
  optional `fo-` focus) so every `<img>` requests exactly the size it
  renders at, never a full-resolution developer render for a 400px card.
- **Video**: YouTube, uploaded **unlisted** (not public — findable only
  via direct link, so it doesn't compete with the site for search
  ranking, but is still free and unlimited). `YouTubeLite.astro`
  implements the facade pattern: only a thumbnail + play button ship on
  first load; the ~1MB YouTube iframe/JS is only injected after a click.
- Both are wired for the **first fully documented project, Park Eden**,
  whose marketing assets are shared via the Drive folder the user linked
  — see the `internalNote` on `src/content/projects/park-eden.md` for the
  upload/migration steps and an open question about the project's actual
  locality (the design brief says Wagholi; the Drive folder is titled
  "... Kharadi ...").

## Consequences

- Zero photos or videos are committed to the git repository — keeps the
  repo small and keeps CMS "publish" (0005) fast, since editorial
  workflow commits never carry binary diffs.
- The CMS's image/photo fields are plain text (ImageKit path), not
  Decap's built-in media picker, which would otherwise commit binaries
  into git — see 0005's noted friction point.
- `PUBLIC_IMAGEKIT_URL_ENDPOINT` must be set (see `.env.example`) before
  any real photo will resolve; until then, `SkeletonImage.astro` renders
  its "photo pending" placeholder instead of a broken image.
