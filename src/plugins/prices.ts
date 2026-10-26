import { definePlugin } from "emdash";
import type { PluginContentItem as ContentItem, PluginContext } from "emdash";
import { z } from "astro/zod";
import { prices as copy } from "../i18n/prices";
import { qualityLabels, repairLabels } from "../i18n/ui";
import { applyChanges, checkChanges, defaultSort, imageUrl, normTitle, quality, resolvePart, searchTerms, slot, type RepairRow } from "../lib/prices";

const COLLECTION = "devices";
const change = z.object({
	repair: z.string().min(1).max(40).describe("Repair key, e.g. display, akku, ladebuchse, kamera, backcover, tastatur, ssd"),
	quality: z.enum(["original", "drittanbieter", "standard"]).optional().describe("Part quality. Defaults to standard"),
	price: z.number().positive().max(9999.99).nullable().describe("New price in EUR, null removes the repair from this device"),
	price_from: z.boolean().optional().describe("true shows the price as 'ab' (from) price"),
});
const title = z.string().trim().min(1).max(80);
const series = z.string().trim().max(60);
const fields = z.object({
	title: title.optional().describe("New model name"),
	series: series.optional().describe("Series / group, e.g. iPhone 17"),
	image: z.object({ id: z.string().min(1).max(100), storageKey: z.string().regex(/^[\w-]{1,120}\.[a-z0-9]{2,5}$/i) }).nullable().optional().describe("Device photo from the media library (id + storageKey), null removes it"),
});
const updateInput = z.object({
	id: z.string().min(1).max(100).describe("Device id from find_devices"),
	changes: z.array(change).max(40).default([]),
	fields: fields.optional(),
	expected: z.string().max(40).optional(),
});
const createInput = z.object({
	title: title.describe("Model name as shown on the website, e.g. iPhone 18 Pro"),
	brand: z.string().min(1).max(30).describe("Brand key, always apple"),
	category: z.string().min(1).max(30).describe("smartphone (iPhone), tablet (iPad), mac or watch (Apple Watch)"),
	series: series.optional().describe("Series / group, e.g. iPhone 18"),
	sort: z.number().int().min(-9999).max(9999).optional().describe("Position, lower comes first. Defaults to the top of the series (or of the brand for a new series)"),
	image: z.object({ id: z.string().min(1).max(100), storageKey: z.string().regex(/^[\w-]{1,120}\.[a-z0-9]{2,5}$/i) }).optional().describe("Device photo from the media library (id + storageKey)"),
	changes: z.array(change).max(40).default([]).describe("Repair prices of the new device"),
});
const findInput = z.object({ query: z.string().min(1).max(80).describe("Model name, e.g. iPhone 15 Pro") });
const listInput = z.object({ cursor: z.string().max(500).optional(), all: z.boolean().optional() });

class PriceError extends Error { constructor(readonly code: string) { super(code); } }
const fail = (error: unknown) => {
	const code = error instanceof PriceError ? error.code : "UNAVAILABLE";
	if (!(error instanceof PriceError)) console.error("prices", error);
	return { ok: false as const, error: code, message: copy.error[code] ?? copy.error.UNAVAILABLE };
};
async function safe<T extends object>(action: () => Promise<T>) {
	try { return { ok: true as const, ...await action() }; } catch (error) { return fail(error); }
}
function parse<T>(schema: z.ZodType<T>, input: unknown): T {
	const r = schema.safeParse(input);
	if (!r.success) throw new PriceError("INVALID_INPUT");
	return r.data;
}

const pending = (item: ContentItem) => item.status !== "published" || (!!item.draftRevisionId && item.draftRevisionId !== item.liveRevisionId);
const repairsOf = (item: ContentItem) => (Array.isArray(item.data.repairs) ? item.data.repairs : []) as RepairRow[];
function preview(value: unknown) {
	const url = imageUrl(value);
	const img = value as { id?: string; alt?: string; meta?: { storageKey?: unknown } } | null;
	return url && img ? { id: img.id ?? "", url, alt: img.alt ?? "", storageKey: typeof img.meta?.storageKey === "string" ? img.meta.storageKey : undefined } : null;
}
function row(item: ContentItem) {
	const d = item.data;
	return {
		id: item.id, slug: item.slug, title: String(d.title ?? ""), brand: String(d.brand ?? ""), category: String(d.category ?? ""),
		series: String(d.series ?? ""), sort: typeof d.sort === "number" ? d.sort : 0, status: item.status, pending: pending(item),
		updatedAt: item.updatedAt, image: preview(d.image),
		repairs: repairsOf(item).map(r => ({ repair: r.repair, quality: quality(r.quality), price: r.price, price_from: !!r.price_from, note: r.note ?? "" })),
	};
}

const ext = (s: string) => s.split(".").pop()?.toLowerCase() ?? "";
/** Same shape EmDash's image field stores; the site reads meta.storageKey. */
async function imageValue(ctx: PluginContext, pick: { id: string; storageKey: string } | null, name: string) {
	if (pick === null) return null;
	const media = await ctx.media!.get(pick.id);
	if (!media || !media.mimeType.startsWith("image/") || ext(media.filename) !== ext(pick.storageKey)) throw new PriceError("BAD_IMAGE");
	return {
		id: media.id, provider: "local", filename: media.filename, mimeType: media.mimeType,
		...(media.width && media.height ? { width: media.width, height: media.height } : {}),
		alt: media.alt || copy.imageAlt(name),
		...(media.blurhash ? { blurhash: media.blurhash } : {}), ...(media.dominantColor ? { dominantColor: media.dominantColor } : {}),
		...(media.focalX != null && media.focalY != null ? { focalX: media.focalX, focalY: media.focalY } : {}),
		meta: { storageKey: pick.storageKey },
	};
}

async function options(ctx: PluginContext) {
	const all = (await ctx.schema!.getCollection(COLLECTION))?.fields ?? [];
	const opt = (slug: string) => ((all.find(f => f.slug === slug)?.validation ?? {}) as { options?: string[] }).options ?? [];
	const sub = ((all.find(f => f.slug === "repairs")?.validation ?? {}) as { subFields?: { slug: string; options?: string[] }[] }).subFields ?? [];
	const qualities = sub.find(s => s.slug === "quality")?.options ?? [];
	return {
		repairs: sub.find(s => s.slug === "repair")?.options ?? [], qualities: qualities.includes("standard") ? qualities : [...qualities, "standard"],
		brands: opt("brand"), categories: opt("category"),
	};
}

async function allDevices(ctx: PluginContext) {
	const items: ContentItem[] = [];
	let cursor: string | undefined;
	for (let i = 0; i < 20; i++) {
		const page = await ctx.content!.list(COLLECTION, { limit: 100, cursor });
		items.push(...page.items);
		if (!page.hasMore || !page.cursor) break;
		cursor = page.cursor;
	}
	return items;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
async function find(ctx: PluginContext, query: string) {
	const tokens = query.toLowerCase().split(/\s+/).map(norm).filter(Boolean);
	const hits = (await allDevices(ctx)).filter(item => {
		const hay = norm([item.data.title, item.data.search_terms, item.data.series, item.data.brand].filter(Boolean).join(" "));
		return tokens.every(t => hay.includes(t));
	}).sort((a, b) => String(a.data.title).length - String(b.data.title).length);
	return {
		total: hits.length,
		devices: hits.slice(0, 15).map(item => {
			const r = row(item);
			return { ...r, repairs: r.repairs.map(x => ({ ...x, label: [repairLabels.de[x.repair] ?? x.repair, qualityLabels.de[x.quality]].filter(Boolean).join(" · ") })) };
		}),
	};
}

async function publish(ctx: PluginContext, id: string) {
	const v = await ctx.content!.getVersioned!(COLLECTION, id);
	if (!v) throw new PriceError("NOT_FOUND");
	await ctx.content!.publish!(COLLECTION, id, { _rev: v._rev });
	const fresh = await ctx.content!.get(COLLECTION, id);
	if (!fresh) throw new PriceError("NOT_FOUND");
	return fresh;
}

async function duplicate(ctx: PluginContext, brand: string, name: string, except?: string) {
	const n = normTitle(name);
	return (await allDevices(ctx)).some(d => d.id !== except && d.data.brand === brand && normTitle(String(d.data.title ?? "")) === n);
}

async function update(ctx: PluginContext, input: z.infer<typeof updateInput>) {
	return withDeviceLock(ctx, input.id, () => updateLocked(ctx, input));
}

/**
 * EmDash content updates have no revision check, so two saves of the same device at the same moment would both read the old
 * version and the second write would drop the first one's cells. A short per-device lock (KV compareAndSet) makes them run one
 * after the other; each then merges onto the latest version. A stuck lock expires after LOCK_MS.
 */
const LOCK_MS = 10_000;
async function withDeviceLock<T>(ctx: PluginContext, id: string, fn: () => Promise<T>): Promise<T> {
	const key = "lock:device:" + id;
	const deadline = Date.now() + 8_000;
	for (;;) {
		const now = Date.now();
		const cur = await ctx.kv.getVersioned<{ until: number }>(key);
		const free = !cur || !cur.value || (cur.value.until ?? 0) < now;
		const got = free ? await ctx.kv.compareAndSet(key, cur ? cur.revision : null, { until: now + LOCK_MS }) : { applied: false as const };
		if (got.applied) {
			try { return await fn(); } finally { await ctx.kv.compareAndDelete(key, got.revision).catch(() => {}); }
		}
		if (Date.now() > deadline) throw new PriceError("BUSY");
		await new Promise(r => setTimeout(r, 80 + Math.random() * 120));
	}
}

async function updateLocked(ctx: PluginContext, input: z.infer<typeof updateInput>) {
	const opts = await options(ctx);
	const { image, ...text } = input.fields ?? {};
	const patch: Record<string, unknown> = Object.fromEntries(Object.entries(text).filter(([, v]) => v !== undefined));
	if (!input.changes.length && !Object.keys(patch).length && image === undefined) throw new PriceError("INVALID_INPUT");
	const invalid = checkChanges(input.changes, opts.repairs, opts.qualities);
	if (invalid) throw new PriceError(invalid);
	const item = await ctx.content!.get(COLLECTION, input.id);
	if (!item) throw new PriceError("NOT_FOUND");
	if (item.status !== "published") throw new PriceError("NOT_PUBLISHED");
	if (pending(item)) throw new PriceError("PENDING_DRAFT");
	if (typeof patch.title === "string" && await duplicate(ctx, String(item.data.brand), patch.title, item.id)) throw new PriceError("DUPLICATE");
	if (image !== undefined) patch.image = await imageValue(ctx, image, String(patch.title ?? item.data.title ?? ""));
	const before = row(item).repairs;
	/** Merge: only the sent cells change, on top of the latest saved version ("expected" is ignored), so parallel edits of different cells both stay. */
	const rows = repairsOf(item);
	const needsPool = input.changes.some(c => quality(c.quality) === "standard" && !rows.some(r => r.repair === c.repair));
	const pool = needsPool
		? new Set((await allDevices(ctx)).filter(d => d.id !== item.id && d.data.brand === item.data.brand && d.data.category === item.data.category).flatMap(d => repairsOf(d).map(r => slot(r.repair, r.quality))))
		: new Set<string>();
	const changes = input.changes.map(c => resolvePart(c, rows, () => pool));
	const merged = checkChanges(changes, opts.repairs, opts.qualities);
	if (merged) throw new PriceError(merged);
	await ctx.content!.update!(COLLECTION, item.id, { ...patch, ...(changes.length ? { repairs: applyChanges(rows, changes, opts.repairs) } : {}) });
	return { device: row(await publish(ctx, item.id)), before };
}

async function create(ctx: PluginContext, input: z.infer<typeof createInput>) {
	const opts = await options(ctx);
	if (!opts.brands.includes(input.brand) || !opts.categories.includes(input.category)) throw new PriceError("INVALID_INPUT");
	const invalid = checkChanges(input.changes, opts.repairs, opts.qualities);
	if (invalid) throw new PriceError(invalid);
	const devices = await allDevices(ctx);
	const n = normTitle(input.title);
	if (devices.some(d => d.data.brand === input.brand && normTitle(String(d.data.title ?? "")) === n)) throw new PriceError("DUPLICATE");
	const group = devices.filter(d => d.data.brand === input.brand && d.data.category === input.category && typeof d.data.sort === "number")
		.map(d => ({ sort: d.data.sort as number, series: String(d.data.series ?? "") }));
	const item = await ctx.content!.create!(COLLECTION, {
		title: input.title, brand: input.brand, category: input.category, series: input.series ?? "",
		sort: input.sort ?? defaultSort(group, input.series?.trim() ?? ""), popular: false,
		search_terms: searchTerms(input.title), repairs: applyChanges([], input.changes, opts.repairs),
		...(input.image ? { image: await imageValue(ctx, input.image, input.title) } : {}),
	});
	return { device: row(await publish(ctx, item.id)) };
}

async function summary(ctx: PluginContext) {
	const rows = (await allDevices(ctx)).map(row);
	return {
		total: rows.length,
		noImage: rows.filter(r => !r.image).length,
		noPrices: rows.filter(r => !r.repairs.length).length,
		pending: rows.filter(r => r.pending).length,
		updatedAt: rows.reduce((m, r) => (r.updatedAt > m ? r.updatedAt : m), ""),
	};
}

const json = { methods: ["POST"] as ["POST"], request: { body: "json" as const } };

export function createPlugin() {
	return definePlugin({
		id: "apfel-prices", version: "1.1.0",
		capabilities: ["content:write", "content:publish", "schema:read", "media:read"],
		admin: {
			pages: [{ path: "/prices", label: copy.pageTitle, icon: "tag", group: "Reparatur" }],
			widgets: [{ id: "overview", title: copy.pageTitle, size: "half" }],
		},
		routes: {
			list: { ...json, permission: "content:edit_any", handler: ctx => safe(async () => {
				const { cursor, all } = parse(listInput, ctx.input ?? {});
				if (all) {
					const now = new Date().toISOString();
					return { devices: (await allDevices(ctx)).map(row), cursor: null, options: await options(ctx), now };
				}
				const page = await ctx.content!.list(COLLECTION, { limit: 100, cursor });
				return { devices: page.items.map(row), cursor: page.hasMore ? page.cursor ?? null : null, ...(cursor ? {} : { options: await options(ctx), now: new Date().toISOString() }) };
			}) },
			find: { ...json, permission: "content:read", handler: ctx => safe(() => find(ctx, parse(findInput, ctx.input).query)) },
			summary: { ...json, permission: "content:read", handler: ctx => safe(() => summary(ctx)) },
			update: { ...json, permission: "content:publish_any", handler: ctx => safe(() => update(ctx, parse(updateInput, ctx.input))) },
			create: { ...json, permission: "content:publish_any", handler: ctx => safe(() => create(ctx, parse(createInput, ctx.input))) },
		},
		mcp: {
			tools: {
				find_devices: { description: copy.mcp.find, route: "find", input: findInput },
				update_prices: { description: copy.mcp.update, route: "update", input: updateInput, destructive: true },
				create_device: { description: copy.mcp.create, route: "create", input: createInput, destructive: true },
			},
		},
	});
}
