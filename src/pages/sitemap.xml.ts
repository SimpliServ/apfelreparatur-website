import type { APIRoute } from "astro";
import { SITE } from "../lib/seo";

const PATHS = ["/", "/iphone", "/ipad", "/mac", "/datenrettung", "/reparatur-anfragen", "/kontakt", "/impressum", "/datenschutz", "/agb"];

export const GET: APIRoute = () => {
	const urls = PATHS.map((p) => `<url><loc>${SITE}${p}</loc></url>`).join("");
	return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
		headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" },
	});
};
