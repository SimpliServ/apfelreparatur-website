// Cloudflare Turnstile widget "MobiNil Websites" (all MobiNil brand domains); dev uses Cloudflare's always-pass test key.
export const TURNSTILE_SITEKEY = import.meta.env.DEV ? "1x00000000000000000000AA" : "0x4AAAAAAF6IgySuVW8WeuSQ";
export const TURNSTILE_FIELD = "cf-turnstile-response";
export const TURNSTILE_HOST = "challenges.cloudflare.com";

type Fetch = (url: string, init?: RequestInit) => Promise<Response>;

/** Without the secret (local dev) every request passes; if siteverify itself is unreachable, too (no lost customers). */
export async function turnstileOk(token: unknown, ip: string | undefined, secret: string | undefined, fetcher: Fetch): Promise<boolean> {
	if (!secret) return true;
	if (typeof token !== "string" || !token || token.length > 2048) return false;
	const body = new URLSearchParams({ secret, response: token });
	if (ip) body.set("remoteip", ip);
	try {
		const res = await fetcher(`https://${TURNSTILE_HOST}/turnstile/v0/siteverify`, { method: "POST", body });
		if (!res.ok) return true;
		return ((await res.json()) as { success?: boolean }).success === true;
	} catch {
		return true;
	}
}
