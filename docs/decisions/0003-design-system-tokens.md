# 0003 — Design system as CSS custom properties, ported from the approved brief

**Status:** Accepted

## Context

The uploaded strategy zip included a full design-system export ("Industry":
a generic steel-blue blueprint system) plus the actual site mockup
(`AK Realtors Site.dc.html`), which recolors that system with a warm gold
accent (`#c39a4e`), a WhatsApp-green functional color, and Barlow /
Barlow Condensed type — all hardcoded as inline styles in the mockup
since it's a design-tool export, not production code.

## Decision

Port the **mockup's actual executed palette** (not the generic template's
steel-blue) into `src/styles/global.css` as CSS custom properties
(`--color-*`, `--font-*`, `--space-*`, `--radius-*`, `--shadow-*`), plus
the `.blueprint`/`.corner` registration-mark mechanic, `.btn-whatsapp`,
`.data-slot`, and `.skeleton` utility classes used throughout every page.

## Alternatives considered

- **Tailwind CSS.** Would work, but the design system's vocabulary
  (blueprint corner marks, a mono-ramp gold accent, specific
  letter-spacing/uppercase kicker conventions) is already a small, fixed
  set of reusable classes — a utility framework adds a build step and a
  new vocabulary for no real gain here.
- **Inline styles matching the mockup exactly.** What the mockup itself
  does, because it's a design-tool export, not a codebase. Copying that
  pattern into production would mean the same color repeated in every
  file with no single place to retune the brand later.

## Consequences

- Retuning the brand (a new accent color, different spacing scale) is a
  one-file edit to `global.css`.
- Dark-surface sections (footer, "talk to a human" strip, ad landing
  pages) use a `.surface-dark` class that remaps the same token names,
  mirroring the light/dark swap already built into the Lead Form
  component in the original mockup.
- See 0012 for a related gotcha: passing one of these classes into a
  *child component* (rather than an element authored directly in the
  page) needs `:global()` in the scoped `<style>` block, or the rule
  silently never applies.
