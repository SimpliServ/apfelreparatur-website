#!/usr/bin/env node
// One-off import of the device catalogue into the EmDash `devices` collection (schema + entries + photos).
// iPhone/iPad prices come from the operator's public API, +10 € each; Macs (scripts/data/mac-models.json) and Apple Watch
// start without prices and get them in Admin → Preisliste. Idempotent: existing slugs and uploaded photos are skipped.
//
//   node scripts/import-devices.mjs --url http://localhost:4330 --token <PAT>
//   (local PAT: curl -X POST 'http://localhost:4330/_emdash/api/setup/dev-bypass?token=1')
import { readFileSync } from "node:fs";

const arg = (name, fallback) => {
	const i = process.argv.indexOf(`--${name}`);
	return i > 0 ? process.argv[i + 1] : fallback;
};
const BASE = arg("url", "http://localhost:4330").replace(/\/$/, "");
const TOKEN = arg("token", process.env.EMDASH_TOKEN);
const SOURCE = "https://www.mobinil.at";
const MARKUP = 10;
const ONLY_SCHEMA = process.argv.includes("--schema-only");
if (!TOKEN) throw new Error("--token missing");

const UA = { "user-agent": "Mozilla/5.0 (Macintosh) apfelreparatur-import" };
async function api(path, init = {}) {
	const res = await fetch(BASE + "/_emdash/api" + path, {
		...init,
		headers: { authorization: `Bearer ${TOKEN}`, "X-EmDash-Request": "1", ...(init.body && !(init.body instanceof FormData) ? { "content-type": "application/json" } : {}), ...init.headers },
	});
	const text = await res.text();
	const json = text ? JSON.parse(text) : null;
	if (!res.ok) throw new Error(`${init.method ?? "GET"} ${path} ${res.status}: ${text.slice(0, 300)}`);
	return json?.data ?? json;
}
async function source(path) {
	const res = await fetch(SOURCE + path, { headers: UA });
	if (!res.ok) throw new Error(`${path} ${res.status}`);
	return path.endsWith(".json") ? res.json() : res.text();
}

// ---- Schema ----

export const REPAIRS = ["display", "aussendisplay", "akku", "selfie-kamera", "kamera", "backcover", "ladebuchse", "lautsprecher", "face-id", "power-button", "home-button", "sim", "kopfhoererbuchse", "tastatur", "trackpad", "ssd", "datenrettung", "datenuebertragung", "wasserschaden", "software-fehler", "software-update", "fehleranalyse"];
const FIELDS = [
	{ slug: "title", label: "Modell", type: "string", required: true, searchable: true },
	{ slug: "brand", label: "Marke", type: "select", validation: { options: ["apple"] }, required: true, translatable: false },
	{ slug: "category", label: "Kategorie", type: "select", validation: { options: ["smartphone", "tablet", "mac", "watch"] }, required: true, translatable: false },
	{ slug: "series", label: "Serie", type: "string", translatable: false },
	{ slug: "sort", label: "Sortierung", type: "integer", translatable: false },
	{ slug: "image", label: "Gerätebild", type: "image" },
	{ slug: "model_numbers", label: "Modellnummern (A…)", type: "string", searchable: true, translatable: false },
	{ slug: "search_terms", label: "Suchbegriffe", type: "string", searchable: true, translatable: false },
	{
		slug: "repairs", label: "Reparaturen & Preise", type: "repeater", translatable: false,
		validation: {
			subFields: [
				{ slug: "repair", label: "Reparatur", type: "select", options: REPAIRS, required: true },
				{ slug: "quality", label: "Teil", type: "select", options: ["standard", "original", "drittanbieter"] },
				{ slug: "price", label: "Preis (€)", type: "number", required: true },
				{ slug: "price_from", label: "ab-Preis", type: "boolean" },
				{ slug: "note", label: "Hinweis", type: "string" },
			],
		},
	},
	{ slug: "notes", label: "Hinweise zum Gerät", type: "text" },
];

async function ensureSchema() {
	const list = await api("/schema/collections");
	const items = list.items ?? list.collections ?? list;
	if (!items.some((c) => c.slug === "devices")) {
		await api("/schema/collections", {
			method: "POST",
			body: JSON.stringify({ slug: "devices", label: "Geräte & Preise", labelSingular: "Gerät", group: "Reparatur", supports: ["drafts", "revisions", "search"] }),
		});
		console.log("collection devices created");
	}
	const col = await api("/schema/collections/devices?includeFields=true");
	const have = new Set((col.item ?? col.collection ?? col).fields?.map((f) => f.slug) ?? []);
	for (const [i, f] of FIELDS.entries()) {
		if (have.has(f.slug)) continue;
		await api("/schema/collections/devices/fields", { method: "POST", body: JSON.stringify({ validation: null, ...f, sortOrder: i }) });
		console.log("field", f.slug);
	}
}

// ---- Media ----

const uploaded = new Map();
async function upload(url, { filename, alt, caption }) {
	if (uploaded.has(url)) return uploaded.get(url);
	const buf = url.startsWith("file:") ? readFileSync(new URL(url)) : Buffer.from(await (await fetch(url, { headers: UA })).arrayBuffer());
	const form = new FormData();
	form.set("file", new Blob([buf], { type: "image/webp" }), filename);
	form.set("alt", alt);
	if (caption) form.set("caption", caption);
	form.set("deduplicate", "true");
	const { item } = await api("/media", { method: "POST", body: form });
	const value = {
		id: item.id, provider: "local", filename: item.filename, mimeType: item.mimeType,
		...(item.width && item.height ? { width: item.width, height: item.height } : {}),
		alt, ...(item.blurhash ? { blurhash: item.blurhash } : {}), ...(item.dominantColor ? { dominantColor: item.dominantColor } : {}),
		meta: { storageKey: item.storageKey, ...(caption ? { caption } : {}) },
	};
	uploaded.set(url, value);
	return value;
}

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
/** Device photo + credit line from the source device page (credits are required for the CC-licensed photos). */
async function sourcePhoto(slug) {
	const html = await source(`/geraet/${slug}`);
	const key = /_emdash%2Fapi%2Fmedia%2Ffile%2F([A-Z0-9]+\.(?:webp|png|jpe?g|avif))[^"]*"[^>]*Rückansicht/.exec(html)?.[1];
	if (!key) return null;
	const fig = /<figcaption class="media-credit"[^>]*>([\s\S]*?)<\/figcaption>/.exec(html.slice(html.indexOf(key)))?.[1];
	const caption = fig ? [decode(fig.replace(/<span[\s\S]*$/, "").trim()), ...[...fig.matchAll(/href="([^"]+)"/g)].map((m) => decode(m[1]))].join(" ").trim() : "";
	return { url: `${SOURCE}/_emdash/api/media/file/${key}`, key, caption };
}

// ---- Catalogue ----

const PART = { "Original Ersatzteil": "original", "Drittanbieter Ersatzteil": "drittanbieter" };
const up = (n) => Math.round((n + MARKUP) * 100) / 100;
const searchTerms = (title, extra = "") => [title, title.replace(/[^\p{L}\p{N}]+/gu, ""), extra].filter(Boolean).join(" ");

async function phonesAndTablets() {
	const { devices } = await source("/api/v1/geraete.json");
	const out = [];
	for (const [i, d] of devices.filter((x) => x.brand === "apple").entries()) {
		const full = await source(`/api/v1/geraete/${d.slug}.json`);
		const repairs = full.repairs.map((r) => ({
			repair: r.key,
			// iPad parts are not advertised as Original Apple on this site (AGENTS.md).
			quality: d.category === "tablet" ? "standard" : (PART[r.part] ?? "standard"),
			price: up(r.price),
			price_from: !!r.priceIsFrom,
			note: r.note ?? "",
		}));
		out.push({ slug: d.slug, title: d.title, category: d.category, series: d.series, sort: i + 1, repairs, photo: () => sourcePhoto(d.slug) });
	}
	return out;
}

const MAC_IMAGES = {
	"macbook-air": { file: "macbook-air", alt: "MacBook Air 15″ in Mitternacht, aufgeklappt von vorne", caption: "Foto: KKPCW (Kyu3) · CC BY-SA 4.0 · Freigestellt und retuschiert. https://commons.wikimedia.org/wiki/File:Macbook_Air_15_inch_-_2_(blurred).jpg https://creativecommons.org/licenses/by-sa/4.0" },
	"macbook-pro": { file: "macbook-pro", alt: "MacBook Pro 14″ in Space Schwarz, aufgeklappt von vorne" },
	"macbook-neo": { file: "macbook-neo", alt: "MacBook Neo 13″ in Indigo, aufgeklappt, Schrägansicht", caption: "Foto: EvanTech10 · CC BY-SA 4.0 · Freigestellt und retuschiert. https://commons.wikimedia.org/wiki/File:MacBook_Neo_Indigo_Touch_ID.png https://creativecommons.org/licenses/by-sa/4.0" },
	macbook: { file: "macbook-12", alt: "MacBook Retina 12″ in Silber, aufgeklappt von vorne" },
	imac: { file: "imac", alt: "iMac 24″ in Blau, Vorderansicht mit Standfuß", caption: "Foto: Seasider53 · CC BY 4.0 · Freigestellt und retuschiert. https://commons.wikimedia.org/wiki/File:IMac_M4_2024_2_(cropped).jpg https://creativecommons.org/licenses/by/4.0" },
	"imac-pro": { file: "imac-pro", alt: "iMac Pro 27″ in Space Grau, Vorderansicht mit Standfuß", caption: "Foto: Nobuyuki Hayashi · CC BY 2.0 · Freigestellt und retuschiert. https://commons.wikimedia.org/wiki/File:IMac_Pro_(2017).jpg https://creativecommons.org/licenses/by/2.0" },
};
const slugify = (s) => s.toLowerCase().replace(/″/g, "").replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/,/g, "-").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function macs() {
	const data = JSON.parse(readFileSync(new URL("./data/mac-models.json", import.meta.url), "utf8"));
	const out = [];
	let sort = 1;
	for (const [line, groups] of Object.entries(data)) {
		for (const g of groups) {
			const img = MAC_IMAGES[g.image ?? line];
			for (const m of g.models) {
				const numbers = [...new Set(m.numbers)].join(", ");
				out.push({
					slug: slugify(m.name), title: m.name, category: "mac", series: g.name, sort: sort++, repairs: [], model_numbers: numbers,
					photo: async () => ({ url: new URL(`../../mobinil/src/assets/mac/${img.file}.webp`, import.meta.url).href, key: `${img.file}.webp`, caption: img.caption ?? "", alt: img.alt }),
				});
			}
		}
	}
	return out;
}

const WATCHES = [
	["Apple Watch Ultra 3", "Apple Watch Ultra"], ["Apple Watch Ultra 2", "Apple Watch Ultra"], ["Apple Watch Ultra", "Apple Watch Ultra"],
	["Apple Watch Series 11", "Apple Watch Series"], ["Apple Watch Series 10", "Apple Watch Series"], ["Apple Watch Series 9", "Apple Watch Series"],
	["Apple Watch Series 8", "Apple Watch Series"], ["Apple Watch Series 7", "Apple Watch Series"], ["Apple Watch Series 6", "Apple Watch Series"],
	["Apple Watch Series 5", "Apple Watch Series"], ["Apple Watch Series 4", "Apple Watch Series"],
	["Apple Watch SE (3. Generation)", "Apple Watch SE"], ["Apple Watch SE (2. Generation)", "Apple Watch SE"], ["Apple Watch SE", "Apple Watch SE"],
];
const watches = () => WATCHES.map(([title, series], i) => ({ slug: slugify(title), title, category: "watch", series, sort: i + 1, repairs: [] }));

// ---- Run ----

async function existing() {
	const out = new Map();
	let cursor;
	do {
		const page = await api(`/content/devices?limit=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`);
		for (const item of page.items) out.set(item.slug, item);
		cursor = page.nextCursor ?? page.cursor;
		if (!page.hasMore && !page.nextCursor) break;
	} while (cursor);
	return out;
}

await ensureSchema();
if (!ONLY_SCHEMA) {
	const have = await existing();
	const all = [...(await phonesAndTablets()), ...macs(), ...watches()];
	let created = 0;
	for (const d of all) {
		if (have.has(d.slug)) continue;
		const photo = d.photo ? await d.photo() : null;
		const image = photo ? await upload(photo.url, { filename: `${d.category === "mac" ? photo.key.replace(".webp", "") : d.slug}.webp`, alt: photo.alt ?? `${d.title}, Rückansicht`, caption: photo.caption }) : undefined;
		const { item } = await api("/content/devices", {
			method: "POST",
			body: JSON.stringify({
				slug: d.slug,
				data: {
					title: d.title, brand: "apple", category: d.category, series: d.series, sort: d.sort,
					search_terms: searchTerms(d.title, d.model_numbers), model_numbers: d.model_numbers ?? "", repairs: d.repairs, notes: "",
					...(image ? { image } : {}),
				},
			}),
		});
		await api(`/content/devices/${item.id}/publish`, { method: "POST", body: "{}" });
		created++;
		console.log("+", d.slug, image ? "" : "(no photo)");
	}
	console.log(`${created} created, ${all.length - created} already there`);
}
