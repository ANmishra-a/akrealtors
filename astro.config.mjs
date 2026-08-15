import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";

// See docs/decisions/0001-framework-astro.md and 0002-hosting-cloudflare.md
// for why Astro (React islands) + Cloudflare Pages were chosen.
export default defineConfig({
  site: "https://akarohanrealtors.com",
  output: "server", // hybrid: pages are prerendered per-route via `export const prerender = true`
  adapter: cloudflare({
    imageService: "compile", // no server-side image transform; ImageKit CDN handles it (0009)
  }),
  integrations: [
    react(),
    sitemap({
      // Ad landing pages are noindex by design (campaign-specific, no
      // organic search intent) — keep them out of the sitemap too.
      filter: (page) => !page.includes("/lp/"),
    }),
  ],
  // No Astro image service configured on purpose: all photography/video is
  // off-origin on ImageKit/YouTube (see 0009-media-hosting-imagekit-youtube.md),
  // so pages use plain <img>/<ImageKitImage> rather than Astro's build-time
  // image pipeline.
  vite: {
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  },
});
