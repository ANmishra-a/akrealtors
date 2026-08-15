# 0004 — Content model: Astro content collections over markdown

**Status:** Accepted

## Context

Projects need repeating structured data (spec rows, a monthly site-visit
log, RERA QPR rows, price rows, floor-plan slots) plus a free-text "our
layer" narrative. Articles are closer to plain long-form writing.
Whatever stores this has to also be editable through Decap CMS (0005)
without a database or a separate backend.

## Decision

Use **Astro's content layer API** (`src/content.config.ts`, `glob()`
loader, Zod schemas) over markdown files with YAML frontmatter —
`src/content/projects/*.md` and `src/content/articles/*.md`. Repeating
data (visit log, updates, price rows, etc.) lives in frontmatter as YAML
lists; the long-form narrative is the markdown body.

## Alternatives considered

- **A headless CMS with its own database** (Sanity, Contentful). Real
  contenders and reconsidered in 0005 — rejected specifically for the
  *storage* layer because it adds an external system and an API call at
  build time for a site whose entire content volume is a few dozen
  projects and articles; markdown-in-git is simpler and free.
- **JSON files instead of markdown+frontmatter.** Would work for the
  structured project data but has no natural home for the narrative
  prose, and Decap's markdown widget (rich text editing) needs an actual
  markdown body to attach to.

## Consequences

- `draft: true` hides an entry from the live site without deleting it —
  used as the default so a newly created CMS entry never accidentally
  goes live half-filled.
- Every placeholder value uses the literal string `"DATA SLOT"` (matching
  the design brief's own convention) so it's grep-able and visually
  obvious in both the CMS and the rendered page (`.data-slot` styling).
- Adding a new project or article is: create one markdown file (via
  Decap or directly) → commit → Cloudflare rebuilds. No schema migration,
  no admin API call.
