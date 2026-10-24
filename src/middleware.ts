import { defineMiddleware } from "astro:middleware";

// Workers Cache (wrangler.jsonc "cache") answers public pages before the Worker runs; uncached SSR exceeds the free plan's CPU limit.
const EDGE_PAGE = "max-age=300, stale-while-revalidate=604800, stale-if-error=604800";
const EDGE_MEDIA = "max-age=604800, stale-if-error=604800";
const BROWSER_MEDIA = import.meta.env.PROD ? "public, max-age=31536000, immutable" : "public, max-age=86400";
const NO_STORE = "private, no-store";
const PERSONAL_COOKIE = /(?:^|;\s*)(?:astro-session|emdash-edit-mode)=/;
const PRIVATE_PATH = /^\/(?:_|reparatur-anfragen|vertrag-widerrufen)/;

type Ctx = Parameters<Parameters<typeof defineMiddleware>[0]>[0];

// Some responses (redirects, rewrites) carry immutable headers.
function mutable(res: Response): Response {
	try {
		res.headers.set("x-cache-probe", "1");
		res.headers.delete("x-cache-probe");
		return res;
	} catch {
		return new Response(res.body, res);
	}
}

function withCache(ctx: Ctx, pathname: string, res: Response): Response {
	const method = ctx.request.method;
	if (method !== "GET" && method !== "HEAD") {
		const out = mutable(res);
		out.headers.set("cache-control", NO_STORE);
		out.headers.delete("cloudflare-cdn-cache-control");
		return out;
	}
	const h = res.headers;
	const decide = (): [string, string?] | null => {
		if (PERSONAL_COOKIE.test(ctx.request.headers.get("cookie") ?? "") || h.has("set-cookie")) return [NO_STORE];
		if (res.status === 200 && (pathname === "/_image" || pathname.startsWith("/_emdash/api/media/file/"))) return [BROWSER_MEDIA, EDGE_MEDIA];
		if (PRIVATE_PATH.test(pathname) || res.status !== 200) return h.has("cache-control") ? null : [NO_STORE];
		return h.has("cache-control") ? null : ["public, max-age=60", EDGE_PAGE];
	};
	const d = decide();
	if (!d) return res;
	const out = mutable(res);
	out.headers.set("cache-control", d[0]);
	if (d[1]) out.headers.set("cloudflare-cdn-cache-control", d[1]);
	else out.headers.delete("cloudflare-cdn-cache-control");
	return out;
}

export const onRequest = defineMiddleware(async (ctx, next) => {
	const { pathname, hostname } = ctx.url;
	if (hostname === "www.apfelreparatur.at") {
		const read = ctx.request.method === "GET" || ctx.request.method === "HEAD";
		const to = new URL(ctx.url);
		to.hostname = "apfelreparatur.at";
		// no-store: the cache is shared across both hosts, a cached redirect would loop.
		return new Response(null, { status: read ? 301 : 308, headers: { location: to.toString(), "cache-control": NO_STORE } });
	}
	return withCache(ctx, pathname, await next());
});
