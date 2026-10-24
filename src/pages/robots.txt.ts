import type { APIRoute } from "astro";
import { SITE } from "../lib/seo";

export const GET: APIRoute = () =>
	new Response(`User-agent: *\nAllow: /\nDisallow: /_emdash/\n\nSitemap: ${SITE}/sitemap.xml\n`, { headers: { "content-type": "text/plain; charset=utf-8" } });
