import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Every project/article file is Decap-CMS-edited markdown+frontmatter
 * (see public/admin/config.yml). Fields marked optional with a
 * `dataSlot: true` sibling flag render the `.data-slot` placeholder style
 * on the front end until a human fills them in — same convention the
 * design brief itself uses ("DATA SLOT"). See
 * docs/decisions/0004-content-model-markdown-collections.md.
 */

const visitLogEntry = z.object({
  photo: z.string().optional(),
  caption: z.string(),
  date: z.coerce.date(),
});

const qprRow = z.object({
  quarter: z.string(),
  declared: z.string(),
  progress: z.string(),
  note: z.string().optional(),
});

const benchRow = z.object({
  name: z.string(),
  source: z.string(),
  rate: z.string(),
  pct: z.number().min(0).max(100).default(50),
});

const priceRow = z.object({
  config: z.string(),
  carpet: z.string(),
  price: z.string(),
  availability: z.string(),
});

const planSlot = z.object({
  photo: z.string().optional(),
  label: z.string(),
  note: z.string(),
});

const specRow = z.object({
  key: z.string(),
  value: z.string(),
});

const constructionUpdate = z.object({
  date: z.coerce.date(),
  title: z.string(),
  body: z.string(),
  photo: z.string().optional(),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    name: z.string(),
    developer: z.string(),
    locality: z.string(),
    config: z.string(),
    carpetArea: z.string().default("DATA SLOT"),
    possession: z.string().default("DATA SLOT"),
    priceFrom: z.string().default("Price on request"),
    status: z.enum(["FLAGSHIP", "SELLING", "LIMITED", "MULTIPLE", "SOLD OUT"]).default("SELLING"),
    flagship: z.boolean().default(false),
    reraProjectNumber: z.string().default("DATA SLOT"),
    reraAgentNumber: z.string().default("A041262504263"),
    repPhone: z.string(),
    repName: z.string(),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    specRows: z.array(specRow).default([]),
    visitLog: z.array(visitLogEntry).default([]),
    qprRows: z.array(qprRow).default([]),
    benchRows: z.array(benchRow).default([]),
    priceRows: z.array(priceRow).default([]),
    planSlots: z.array(planSlot).default([]),
    updates: z.array(constructionUpdate).default([]),
    draft: z.boolean().default(false),
    /** CMS-only note, never rendered on the public page. */
    internalNote: z.string().optional(),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    dek: z.string(),
    kicker: z.string(),
    author: z.string(),
    authorRera: z.string().default("A041262504263"),
    publishDate: z.coerce.date(),
    heroChartCaption: z.string().optional(),
    relatedProject: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, articles };
