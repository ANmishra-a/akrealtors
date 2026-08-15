# 0010 — Loading states: plain CSS skeletons, no JS library

**Status:** Accepted

## Context

The user asked for skeleton loaders / a loading-state library
specifically to keep perceived loading time low. Given 0001's Astro
islands architecture already ships near-zero JavaScript baseline, pulling
in a full skeleton-loader library (react-loading-skeleton, etc.) would
undercut the exact performance goal it's meant to serve.

## Decision

`SkeletonImage.astro` renders a CSS `background-position` shimmer
(`@keyframes skeleton-shimmer`, `.skeleton` class in `global.css`) behind
every image slot, sized via `aspect-ratio` so there is zero layout shift
when the real photo loads. A ~10-line inline `<script>` swaps opacity
from 0→1 once the `<img>` fires its `load` event (or immediately if
`img.complete` — handles the cached-image case). `@media
(prefers-reduced-motion: reduce)` disables the shimmer animation.

## Alternatives considered

- **react-loading-skeleton or similar.** Would add a dependency and (for
  non-React pages) a hydration cost for something plain CSS + `aspect-ratio`
  already solves without JavaScript.
- **No skeleton, just `loading="lazy"`.** Rejected — a bare gray box with
  no shimmer reads as "broken" rather than "loading," and the brief
  specifically asked for a loading-state treatment.

## Consequences

- No new dependency; the entire mechanism is ~60 lines of CSS/inline JS.
- Every image slot across the site (project cards, visit-log photos,
  floor plans, construction updates) goes through this one component, so
  the loading treatment is consistent everywhere by construction.
