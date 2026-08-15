# 0012 — Technical note: Astro scoped styles don't reach a child component's root element

**Status:** Accepted (documented gotcha, not a reversible choice)

## Context

While building the compliance block, project hero image, home-page
credential cards, and the ad-landing-page media slot, a visual bug
appeared: elements sized via `aspect-ratio` + `display:flex` collapsed to
their unstyled content height, with the "artist's impression" badge
overlapping the placeholder label text.

## Root cause

Astro's scoped CSS adds a `data-astro-cid-<hash>` attribute to every
element a component **authors directly in its own template** — including
elements slotted into a child component — but **not** to the root element
a child component itself renders internally. So:

```astro
<!-- ProjectLayout.astro -->
<BlueprintFrame class="hero-image">
  <span class="hero-image-label">...</span>   <!-- ✅ gets ProjectLayout's data-cid -->
</BlueprintFrame>
<style>
  .hero-image { aspect-ratio: 21/9; }         /* ❌ never matches — the <div>
                                                     BlueprintFrame renders is
                                                     BlueprintFrame's own element,
                                                     not ProjectLayout's */
  .hero-image-label { font-family: ...; }     /* ✅ works fine */
</style>
```

The `class="hero-image"` string is passed through as a prop and does
land on the rendered `<div>` — so the class *name* is there, but the
scoped selector Astro generates for `.hero-image` is rewritten to
`.hero-image[data-astro-cid-XXXX]`, and that attribute was never added to
BlueprintFrame's own root element.

## Decision

Any scoped-style rule whose selector targets a class passed **into** a
child component (rather than an element the file authors itself) must be
wrapped in `:global(...)`, e.g. `:global(.hero-image) { ... }`. Found and
fixed in: `ComplianceBlock.astro` (`.compliance-block`),
`ProjectLayout.astro` (`.hero-image`, `.author-card`),
`lp/kharadi-annexe.astro` (`.lp-media`), and `index.astro`
(`.credential-card`) — all five places `<BlueprintFrame class="...">` is
used with a page/component-specific sizing class.

## Consequences

- `SkeletonImage.astro` was **not** affected — its `aspect-ratio` is set
  via an inline `style` attribute on an element it authors itself, which
  sidesteps this issue entirely. Preferring inline `style` (or authoring
  the sized element directly rather than via a wrapper component) avoids
  the class of bug altogether; `:global()` is the fix when a class truly
  needs to target a child component's root from outside.
- Any *new* component built on `<BlueprintFrame class="...">` (or any
  future wrapper component) needs this same treatment — worth checking
  for during code review, since the failure mode (collapsed box, no
  console error) is easy to miss without visually inspecting the page.
