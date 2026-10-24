import type { APIRoute } from "astro";
import { SITE } from "../lib/seo";

// Search and AI answer engines are welcome by name; some only crawl when explicitly allowed.
const BOTS = [
	"Googlebot",
	"Bingbot",
	"Applebot",
	"DuckDuckBot",
	"OAI-SearchBot",
	"ChatGPT-User",
	"GPTBot",
	"ClaudeBot",
	"Claude-User",
	"Claude-SearchBot",
	"PerplexityBot",
	"Perplexity-User",
	"Google-Extended",
	"Applebot-Extended",
	"Amazonbot",
	"MistralAI-User",
	"DuckAssistBot",
];

const rules = "Allow: /\nDisallow: /_emdash/\nDisallow: /*?gesendet=\n";
const body = [
	"# Zusammenfassung für KI-Agenten: " + `${SITE}/llms.txt`,
	"",
	"User-agent: *",
	"Content-Signal: search=yes, ai-input=yes, ai-train=yes",
	rules,
	...BOTS.map((b) => `User-agent: ${b}`),
	rules,
	`Sitemap: ${SITE}/sitemap.xml`,
	"",
].join("\n");

export const GET: APIRoute = () => new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
