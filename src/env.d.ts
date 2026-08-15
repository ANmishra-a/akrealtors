/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

// Bindings are read via `import { env } from "cloudflare:workers"` (Astro
// v6 removed `Astro.locals.runtime.env` — see src/pages/api/lead.ts).
// `env`'s type is `Cloudflare.Env`, which @cloudflare/workers-types leaves
// empty on purpose for exactly this kind of project-specific merge
// (`wrangler types` would generate this automatically from wrangler.toml,
// but its KV blocks use placeholder ids until real ones exist, so it's
// declared by hand here instead).
declare namespace Cloudflare {
  interface Env {
    LEADS_KV: KVNamespace;
    RATE_LIMIT_KV: KVNamespace;
    TELEGRAM_BOT_TOKEN?: string;
    TELEGRAM_CHAT_ID?: string;
  }
}

interface ImportMetaEnv {
  readonly PUBLIC_IMAGEKIT_URL_ENDPOINT: string;
  readonly PUBLIC_GA4_ID?: string;
  readonly PUBLIC_META_PIXEL_ID?: string;
  readonly PUBLIC_GOOGLE_ADS_ID?: string;
  readonly PUBLIC_GOOGLE_ADS_CONVERSION_LABEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
