// MobiNil catalogue snapshot in R2. The cron refreshes it every 10 min with a conditional request (304 when unchanged);
// pages only read it. On a change the edge cache of every page (tag CATALOG_TAG) is purged at once, so no page ever
// shows a mix of old and new prices, and pages are only re-rendered when prices actually changed.
import * as workers from "cloudflare:workers";

const FEED = "https://www.mobinil.at/api/v1/katalog.json?marke=apple";
const KEY = "_catalog/mobinil-apple.json";
export const CATALOG_TAG = "catalog";

const bucket = () => (workers.env as unknown as { MEDIA: R2Bucket }).MEDIA;

/** Cron: fetch the feed if it changed, store it, purge the page cache. Returns true when the snapshot changed. */
export async function refreshCatalog(): Promise<boolean> {
	const current = await bucket().head(KEY);
	const known = current?.customMetadata?.etag;
	const res = await fetch(FEED, { headers: { accept: "application/json", ...(known ? { "if-none-match": known } : {}) }, signal: AbortSignal.timeout(15_000) });
	if (res.status === 304 || !res.ok) return false;
	const etag = res.headers.get("etag") ?? "";
	const body = await res.text();
	if (!body.includes('"devices"') || (known && etag === known)) return false;
	await bucket().put(KEY, body, { httpMetadata: { contentType: "application/json" }, customMetadata: { etag, fetchedAt: new Date().toISOString() } });
	if (current) await (workers as unknown as { cache?: { purge(o: { tags: string[] }): Promise<unknown> } }).cache?.purge({ tags: [CATALOG_TAG] }).catch(() => {});
	return true;
}

/** Current snapshot; body is only read when its version differs from `seen`. Missing snapshot: fetched once. */
export async function readCatalog(seen?: string): Promise<{ version: string; body?: string } | null> {
	let head = await bucket().head(KEY);
	if (!head) {
		await refreshCatalog().catch(() => false);
		head = await bucket().head(KEY);
		if (!head) return null;
	}
	if (head.etag === seen) return { version: head.etag };
	const obj = await bucket().get(KEY);
	return obj ? { version: obj.etag, body: await obj.text() } : null;
}
