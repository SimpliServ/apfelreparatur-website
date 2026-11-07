// Cookieless analytics: the beacon in components/Analytics.astro posts here, rows go to the shared
// Workers Analytics Engine dataset "site_analytics".
// Nothing is stored on the device, the visitor id is a daily-rotating hash (no cookie banner needed).

type Env = { ANALYTICS?: AnalyticsEngineDataset; EMDASH_ENCRYPTION_KEY?: string };
type Beacon = { t?: string; p?: string; r?: string; n?: string; l?: string; w?: number; d?: number; s?: number; u?: Record<string, string> };

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|curl|wget|python|httpclient|go-http|java\/|monitor|uptime/i;
const NO_CONTENT = () => new Response(null, { status: 204 });

export const isBeacon = (request: Request) => request.method === "POST" && request.url.endsWith("/_a");

export async function trackBeacon(request: Request, env: Env): Promise<Response> {
	const ua = request.headers.get("user-agent") ?? "";
	if (!env.ANALYTICS || BOT.test(ua) || request.headers.get("sec-fetch-site") === "cross-site") return NO_CONTENT();
	let b: Beacon;
	try {
		const text = await request.text();
		if (text.length > 2048) return NO_CONTENT();
		b = JSON.parse(text);
	} catch {
		return NO_CONTENT();
	}
	if (b.t !== "pv" && b.t !== "ev" && b.t !== "end") return NO_CONTENT();

	const host = new URL(request.url).hostname.replace(/^www\./, "");
	const cf = (request.cf ?? {}) as { country?: string; city?: string; regionCode?: string };
	const ip = request.headers.get("cf-connecting-ip") ?? "";
	const u = b.u ?? {};
	env.ANALYTICS.writeDataPoint({
		indexes: [host],
		blobs: [
			host,
			b.t,
			cut(b.p, 200),
			cut(b.n, 40),
			cut(b.l, 120),
			referrerHost(b.r, host),
			cut(u.source, 60),
			cut(u.medium, 60),
			cut(u.campaign, 80),
			cf.country ?? "",
			cf.city ?? "",
			cf.regionCode ?? "",
			device(ua),
			browser(ua),
			os(ua),
			await visitor(env.EMDASH_ENCRYPTION_KEY ?? host, ip, ua, host),
			cut(request.headers.get("accept-language")?.split(/[,;]/)[0], 10),
		],
		doubles: [1, num(b.w), num(b.d), num(b.s)],
	});
	return NO_CONTENT();
}

const cut = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : "");
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.min(v, 3_600_000) : 0);

function referrerHost(ref: string | undefined, host: string) {
	try {
		const h = new URL(ref ?? "").hostname.replace(/^www\./, "");
		return h === host ? "" : h;
	} catch {
		return "";
	}
}

async function visitor(secret: string, ip: string, ua: string, host: string) {
	const day = new Date().toISOString().slice(0, 10);
	const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(`${secret}|${day}`), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
	const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${ip}|${ua}|${host}`));
	return [...new Uint8Array(sig.slice(0, 8))].map((x) => x.toString(16).padStart(2, "0")).join("");
}

const device = (ua: string) => (/iPad|Tablet|Android(?!.*Mobile)/.test(ua) ? "tablet" : /Mobi|iPhone|Android/.test(ua) ? "mobile" : "desktop");

function browser(ua: string) {
	if (/Edg\//.test(ua)) return "Edge";
	if (/OPR\/|Opera/.test(ua)) return "Opera";
	if (/SamsungBrowser/.test(ua)) return "Samsung Internet";
	if (/Firefox|FxiOS/.test(ua)) return "Firefox";
	if (/Chrome|CriOS/.test(ua)) return "Chrome";
	if (/Safari/.test(ua)) return "Safari";
	return "Other";
}

function os(ua: string) {
	if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
	if (/Android/.test(ua)) return "Android";
	if (/Windows/.test(ua)) return "Windows";
	if (/CrOS/.test(ua)) return "ChromeOS";
	if (/Mac OS X/.test(ua)) return "macOS";
	if (/Linux/.test(ua)) return "Linux";
	return "Other";
}
