import type { APIRoute } from "astro";
import { SITE } from "@/lib/site";

export const prerender = true;

export const GET: APIRoute = () => {
  const body = `User-agent: *
Allow: /
Disallow: /lp/
Disallow: /api/
Disallow: /admin/

Sitemap: https://${SITE.domain}/sitemap-index.xml
`;
  return new Response(body, { headers: { "Content-Type": "text/plain" } });
};
