export type RepairRow = { repair: string; quality?: string | null; price: number; price_from?: boolean | null; note?: string | null };
export type PriceChange = { repair: string; quality?: string | null; price: number | null; price_from?: boolean };
export type PriceError = "INVALID_INPUT" | "UNKNOWN_REPAIR";

export const QUALITY_ORDER = ["original", "drittanbieter", "standard"];
/** Services without a part (client rule 2026-10-18): never "Original"/"Drittanbieter", always stored as standard. */
export const SERVICE_REPAIRS = new Set(["wasserschaden", "software-fehler", "software-update", "fehleranalyse", "datenrettung", "datenuebertragung"]);
export const quality = (q?: string | null) => q || "standard";
export const slot = (repair: string, q?: string | null) => `${repair}:${quality(q)}`;
export const roundPrice = (n: number) => Math.round(n * 100) / 100;

export type SortDir = "asc" | "desc";

/** Foldables and flips have a second, outer display priced as its own repair; "display" is the main inner one. */
export const COVER_DISPLAY = "aussendisplay";
export const hasCoverDisplay = (title: string) => /\b(fold|flip|duo)\b/i.test(title);

/** Series blocks per brand + category in order of first appearance, like the site catalog. Pinned rows stay on top. */
export function groupSeries<T extends { brand: string; category: string; series: string }>(rows: T[], pinned: (r: T) => boolean = () => false): T[] {
	const first = new Map<string, number>();
	const g = (r: T) => r.brand + "|" + r.category, s = (r: T) => g(r) + "|" + r.series;
	rows.forEach((r, i) => { if (!first.has(g(r))) first.set(g(r), i); if (!pinned(r) && !first.has(s(r))) first.set(s(r), i); });
	return rows.map((r, i) => ({ r, i, g: first.get(g(r))!, p: pinned(r), s: pinned(r) ? -1 : first.get(s(r))! }))
		.sort((a, b) => a.g - b.g || +b.p - +a.p || a.s - b.s || a.i - b.i).map(x => x.r);
}

/** New device goes to the top of its series, or of the brand when the series is new. */
export function defaultSort(devices: { sort: number; series: string }[], series: string): number {
	const sorts = devices.map(d => d.sort);
	if (!sorts.length) return 1;
	const own = series ? devices.filter(d => d.series === series).map(d => d.sort) : [];
	if (!own.length) return Math.min(...sorts) - 1;
	const top = Math.min(...own), above = sorts.filter(x => x < top);
	return !above.length || Math.max(...above) < top - 1 ? top - 1 : top;
}

/** Column sort inside each group: asc = empty first, then cheapest; desc = most expensive first, empty last. Pinned rows stay on top, ties keep input order. */
export function sortRows<T>(rows: T[], group: (r: T) => string, value: (r: T) => number | null, dir: SortDir, pinned: (r: T) => boolean = () => false): T[] {
	const order = new Map<string, number>();
	for (const r of rows) if (!order.has(group(r))) order.set(group(r), order.size);
	const v = (r: T) => value(r) ?? -Infinity;
	return rows.map((r, i) => ({ r, i, g: order.get(group(r))!, p: pinned(r), v: v(r) })).sort((a, b) =>
		a.g - b.g || +b.p - +a.p || (dir === "asc" ? a.v - b.v : b.v - a.v) || a.i - b.i).map(x => x.r);
}

export function formatCell(row?: Pick<RepairRow, "price" | "price_from"> | null): string {
	if (!row || typeof row.price !== "number") return "";
	return (row.price_from ? "ab " : "") + row.price.toFixed(2).replace(".", ",");
}

export function parseCell(input: string): { price: number; price_from: boolean } | null | "invalid" {
	const s = input.trim().replace(/\s*(€|EUR)\s*/gi, "").replace(/\s+/g, " ");
	if (!s || /^[-–—]$/.test(s)) return null;
	const m = /^(ab ?)?(\d{1,4}|\d\.\d{3}(?=,))(?:[.,](\d{1,2}))?$/i.exec(s);
	if (!m) return "invalid";
	const price = roundPrice(Number(`${m[2].replace(/\./g, "")}.${(m[3] ?? "0").padEnd(2, "0")}`));
	return price > 0 ? { price, price_from: !!m[1] } : "invalid";
}

export function checkChanges(changes: PriceChange[], repairs: string[], qualities: string[]): PriceError | null {
	const seen = new Set<string>();
	for (const c of changes) {
		if (!repairs.includes(c.repair) || !qualities.includes(quality(c.quality))) return "UNKNOWN_REPAIR";
		if (c.price !== null && !(Number.isFinite(c.price) && c.price > 0 && c.price < 10000)) return "INVALID_INPUT";
		const key = slot(c.repair, c.quality);
		if (seen.has(key)) return "INVALID_INPUT";
		seen.add(key);
	}
	return null;
}

/**
 * A change without part ("display:standard", e.g. from a page loaded before the brand switched to Original) goes to the
 * part this device uses for that repair, or, if the device has none, the only part its brand+category uses.
 */
export function resolvePart(c: PriceChange, rows: RepairRow[], poolSlots: () => Set<string>): PriceChange {
	if (SERVICE_REPAIRS.has(c.repair)) return { ...c, quality: "standard" };
	if (quality(c.quality) !== "standard") return c;
	const own = QUALITY_ORDER.filter(q => rows.some(r => r.repair === c.repair && quality(r.quality) === q));
	if (own.includes("standard") || own.length > 1) return c;
	if (own.length === 1) return { ...c, quality: own[0] };
	const pool = poolSlots();
	const parts = QUALITY_ORDER.filter(q => pool.has(slot(c.repair, q)));
	return parts.length === 1 && parts[0] !== "standard" ? { ...c, quality: parts[0] } : c;
}

export function applyChanges(rows: RepairRow[], changes: PriceChange[], repairOrder: string[]): RepairRow[] {
	const out = rows.map((r) => (SERVICE_REPAIRS.has(r.repair) ? { ...r, quality: "standard" } : { ...r }));
	const rank = (r: { repair: string; quality?: string | null }) => repairOrder.indexOf(r.repair) * 10 + QUALITY_ORDER.indexOf(quality(r.quality));
	for (const c0 of changes) {
		const c = SERVICE_REPAIRS.has(c0.repair) ? { ...c0, quality: "standard" } : c0;
		const i = out.findIndex((r) => slot(r.repair, r.quality) === slot(c.repair, c.quality));
		if (c.price === null) { if (i >= 0) out.splice(i, 1); continue; }
		const price = roundPrice(c.price);
		if (i >= 0) { out[i] = { ...out[i], price, ...(c.price_from === undefined ? {} : { price_from: c.price_from }) }; continue; }
		const row = { repair: c.repair, quality: quality(c.quality), price, price_from: !!c.price_from, note: "" };
		const at = out.findIndex((r) => rank(r) > rank(row));
		out.splice(at < 0 ? out.length : at, 0, row);
	}
	return out;
}

export const normTitle = (s: string) => s.toLowerCase().replace(/\+/g, "plus").replace(/[^a-z0-9äöüß]+/g, "");
const normHead = (s: string) => s.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/[^a-z]+/g, "");
const SYNONYMS: Record<string, string> = {
	ladestecker: "ladebuchse", ohrlautsprecher: "lautsprecher", einschaltknopf: "power-button", simkartenleser: "sim", simleser: "sim",
	fehleranaylse: "fehleranalyse", wasserschadenbehebung: "wasserschaden", rueckseite: "backcover", hauptkamera: "kamera",
};

/** Excel header like "Akku Drittanbieter**" or "Ladestecker" -> slot "akku:drittanbieter" / "ladebuchse:standard". */
export function headerSlot(header: string, repairs: string[], labels: Record<string, string> = {}): string | null {
	let h = normHead(header);
	if (!h) return null;
	let q = "standard";
	for (const k of ["original", "drittanbieter"]) if (h.length > k.length && h.endsWith(k)) { q = k; h = h.slice(0, -k.length); }
	const byKey = repairs.find(r => normHead(r) === h || normHead(labels[r] ?? "") === h);
	const repair = byKey ?? (SYNONYMS[h] && repairs.includes(SYNONYMS[h]) ? SYNONYMS[h] : null);
	return repair ? slot(repair, q) : null;
}

export type SheetRow = { title: string; series?: string; id?: string; cells: Record<string, string> };
export type Sheet = { corner: string; slots: (string | null)[]; unknown: string[]; rows: SheetRow[] };

/** Tab separated block copied from Excel, first row = header (model column + repair columns). */
export function parseSheet(text: string, repairs: string[], labels: Record<string, string> = {}): Sheet {
	return parseGrid(text.replace(/\r/g, "").split("\n").map(l => l.split("\t")), repairs, labels);
}

export const SERIES_HEADER = "Serie";
export const ID_HEADER = "ID";

/** Rows of one sheet (pasted or from an .xlsx). Column A = model, optional "Serie" and "ID" columns. */
export function parseGrid(grid: string[][], repairs: string[], labels: Record<string, string> = {}): Sheet {
	const lines = grid.filter(c => c.some(x => (x ?? "").trim()));
	const [head = [], ...body] = lines;
	const special = (h: string) => { const n = normHead(h ?? ""); return n === "serie" || n === "series" ? "series" : n === "id" ? "id" : null; };
	const slots = head.map((h, i) => (i === 0 || special(h) ? null : headerSlot(h ?? "", repairs, labels)));
	const seriesCol = head.findIndex((h, i) => i > 0 && special(h) === "series");
	const idCol = head.findIndex((h, i) => i > 0 && special(h) === "id");
	const unknown = head.filter((h, i) => i > 0 && (h ?? "").trim() && !slots[i] && !special(h)).map(h => h.trim());
	const rows: SheetRow[] = [];
	for (const cells of body) {
		const title = (cells[0] ?? "").replace(/\s+/g, " ").trim();
		if (!title) continue;
		const out: Record<string, string> = {};
		slots.forEach((s, i) => { if (s && !(s in out)) out[s] = (cells[i] ?? "").trim(); });
		const row: SheetRow = { title, cells: out };
		if (seriesCol > 0) row.series = (cells[seriesCol] ?? "").replace(/\s+/g, " ").trim();
		if (idCol > 0 && (cells[idCol] ?? "").trim()) row.id = cells[idCol].trim();
		rows.push(row);
	}
	return { corner: (head[0] ?? "").trim(), slots, unknown, rows };
}

/** Sheet name ("Samsung Tablets", "iPad", "Goolge") -> brand + category. */
export function sheetTarget(name: string, corner: string, brands: string[], labels: Record<string, string>): { brand: string; category: string } | null {
	const hay = normTitle(name + " " + corner);
	const brand = /ipad|iphone|mac|watch/.test(hay) ? "apple"
		: brands.find(b => hay.includes(normTitle(labels[b] ?? b))) ?? brands.find(b => [name, corner].some(s => normTitle(s).slice(0, 3) === normTitle(labels[b] ?? b).slice(0, 3)));
	if (!brand || !brands.includes(brand)) return null;
	return { brand, category: categoryOf(name + " " + corner) };
}

const CATEGORY_ORDER = ["smartphone", "tablet", "mac", "watch"];
/** iPhone, iPad, Mac, Watch: the order of the site's navigation. */
export const byCategory = (a: string, b: string) => (CATEGORY_ORDER.indexOf(a) + 1 || 99) - (CATEGORY_ORDER.indexOf(b) + 1 || 99) || a.localeCompare(b);

/** Columns shown for a category even before any of its devices has a price (Macs and Watches start empty). */
export const BASE_SLOTS: Record<string, string[]> = {
	mac: ["display:standard", "akku:standard", "tastatur:standard", "trackpad:standard", "ssd:standard", "ladebuchse:standard", "datenrettung:standard", "wasserschaden:standard", "fehleranalyse:standard"],
	watch: ["display:standard", "akku:standard", "fehleranalyse:standard"],
};

/** "iPad", "MacBook Air", "Apple Watch Series 9" -> collection category. */
export const categoryOf = (text: string) =>
	/watch/i.test(text) ? "watch" : /mac|imac/i.test(text) ? "mac" : /tablet|ipad|\btab\b/i.test(text) ? "tablet" : "smartphone";

export type ExportDevice = { id: string; title: string; brand: string; category: string; series: string; sort: number; repairs: RepairRow[] };
export type ExportSheet = { name: string; rows: (string | number | null)[][]; hidden: number[]; widths: number[] };

/** One sheet per brand + category, like the shop's Excel list. Prices are numbers, "ab" prices text, hidden ID column for re-import. */
export function exportSheets(devices: ExportDevice[], o: { repairOrder: string[]; brandOrder: string[]; sheetName: (brand: string, category: string) => string; slotLabel: (repair: string, quality: string) => string }): ExportSheet[] {
	const groups = new Map<string, ExportDevice[]>();
	const sorted = groupSeries([...devices].sort((a, b) => (o.brandOrder.indexOf(a.brand) + 1 || 99) - (o.brandOrder.indexOf(b.brand) + 1 || 99)
		|| byCategory(a.category, b.category) || a.sort - b.sort || a.title.localeCompare(b.title, "de")));
	for (const d of sorted) { const k = d.brand + "|" + d.category; if (!groups.has(k)) groups.set(k, []); groups.get(k)!.push(d); }
	const rank = (s: string) => { const [r, q] = s.split(":"); return (o.repairOrder.indexOf(r) + 1 || 99) * 10 + QUALITY_ORDER.indexOf(q); };
	return [...groups].map(([k, list]) => {
		const [brand, category] = k.split("|");
		const slots = [...new Set(list.flatMap(d => d.repairs.map(r => slot(r.repair, r.quality))))].sort((a, b) => rank(a) - rank(b));
		const head = ["Modell", SERIES_HEADER, ...slots.map(s => { const [r, q] = s.split(":"); return o.slotLabel(r, q); }), ID_HEADER];
		const rows = list.map(d => [d.title, d.series || null, ...slots.map(s => {
			const r = d.repairs.find(x => slot(x.repair, x.quality) === s);
			return !r ? null : r.price_from ? formatCell(r) : r.price;
		}), d.id]);
		return { name: o.sheetName(brand, category), rows: [head, ...rows], hidden: [head.length - 1], widths: [30, 16, ...slots.map(() => 13), 30] };
	});
}

/** First word most models of a brand share ("Galaxy", "Huawei"), so "S26" from Excel becomes "Galaxy S26". */
export function brandPrefix(titles: string[]): string {
	const counts = new Map<string, number>();
	for (const t of titles) { const w = t.split(" ")[0]; if (w) counts.set(w, (counts.get(w) ?? 0) + 1); }
	const [word, n] = [...counts].sort((a, b) => b[1] - a[1])[0] ?? ["", 0];
	return titles.length >= 3 && n / titles.length >= 0.8 ? word : "";
}

const noYear = (s: string) => normTitle(s.replace(/\([^)]*\)/g, ""));
export function matchTitle<T extends { title: string }>(title: string, devices: T[], prefix = ""): T | null {
	const want = [normTitle(title), normTitle(prefix + " " + title)];
	const exact = devices.find(d => want.includes(normTitle(d.title)));
	if (exact) return exact;
	const loose = [noYear(title), noYear(prefix + " " + title)];
	const hits = devices.filter(d => loose.includes(noYear(d.title)));
	return hits.length === 1 ? hits[0] : null;
}

export const withPrefix = (title: string, prefix: string) =>
	prefix && !title.toLowerCase().startsWith(prefix.toLowerCase()) ? prefix + " " + title : title;

/** Existing model whose name shares the longest start, to suggest its series ("Galaxy A54 / A55" -> "Galaxy A"). */
export function closest<T extends { title: string }>(title: string, devices: T[]): T | null {
	const n = normTitle(title);
	let best: T | null = null, len = 0;
	for (const d of devices) {
		const o = normTitle(d.title);
		let i = 0;
		while (i < n.length && i < o.length && n[i] === o[i]) i++;
		if (i > len) { best = d; len = i; }
	}
	return len >= Math.min(4, n.length) ? best : null;
}

const parts = (title: string, prefix: string) =>
	title.replace(new RegExp("^" + prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*", "i"), "").split("/").map(normTitle).filter(p => p.length > 1);
/** Existing models that already cover one of the variants, e.g. "A54 / A55" vs "Galaxy A54 / A55 / A56 / A57". */
export function overlaps<T extends { title: string }>(title: string, devices: T[], prefix = ""): T[] {
	const mine = new Set(parts(title, prefix));
	return devices.filter(d => parts(d.title, prefix).some(p => mine.has(p)));
}
export const searchTerms = (title: string) => [title, title.replace(/[^\p{L}\p{N}]+/gu, "")].join(" ");

/** Admin preview URL of an image-field value (local media via storageKey). */
export function imageUrl(value: unknown): string | null {
	const img = value && typeof value === "object" ? value as { id?: string; src?: string; previewUrl?: string; filename?: string; meta?: { storageKey?: unknown } } : null;
	if (!img) return null;
	const key = typeof img.meta?.storageKey === "string" ? img.meta.storageKey : null;
	return img.previewUrl ?? img.src ?? (key ? "/_emdash/api/media/file/" + encodeURIComponent(key) : img.id && img.filename ? "/_emdash/api/media/asset/" + encodeURIComponent(img.id) + "/" + encodeURIComponent(img.filename) : null);
}

/** Short facts for list columns, editor panel and dashboard. */
export function deviceFacts(data: Record<string, unknown>) {
	const repairs = (Array.isArray(data.repairs) ? data.repairs : []) as RepairRow[];
	const display = repairs.filter(r => r.repair === "display" && typeof r.price === "number").map(r => r.price);
	return { count: repairs.length, displayFrom: display.length ? Math.min(...display) : null, image: imageUrl(data.image) };
}

/** True when the raw cell text leaves the saved row unchanged. */
export function sameCell(repairs: RepairRow[], key: string, raw: string) {
	const v = parseCell(raw), old = repairs.find(r => slot(r.repair, r.quality) === key);
	return v === null ? !old : v !== "invalid" && !!old && old.price === v.price && !!old.price_from === v.price_from;
}

export const INFO_SHEET = "_Info";
export const INFO_EXPORTED = "Exportiert";
/** Server time written into the hidden info sheet on export. */
export function exportStamp(grids: { name: string; rows: string[][] }[]): string | null {
	const stamp = grids.find(g => g.name === INFO_SHEET)?.rows.find(r => r[0]?.trim() === INFO_EXPORTED)?.[1]?.trim() ?? "";
	return /^\d{4}-\d\d-\d\dT\d\d:\d\d/.test(stamp) && !Number.isNaN(Date.parse(stamp)) ? new Date(stamp).toISOString() : null;
}
export type PlanDevice = { id: string; title: string; brand: string; category: string; series: string; sort: number; repairs: RepairRow[]; pending?: boolean; status?: string; updatedAt?: string };
export type ImportSheet = { brand: string; category: string; sheet: Sheet };
export type SkipReason = "pending" | "stale" | "mismatch";
export type ImportPlan = {
	updates: { device: PlanDevice; cells: Record<string, string>; title?: string; series?: string }[];
	creates: { brand: string; category: string; title: string; series: string; sort?: number; cells: Record<string, string> }[];
	skipped: { title: string; reason: SkipReason }[];
	matched: number; changed: number; removals: number; slots: string[]; unknown: string[];
};

/**
 * Turns imported sheets into staged edits. Guards against data loss:
 * blank cells keep the saved price unless blankRemoves is set ("-" always removes),
 * rows of devices changed after the export (exportedAt) are skipped,
 * and an ID whose row names a different existing model (sorted without the hidden ID column) is skipped.
 */
export function planImport(sheets: ImportSheet[], devices: PlanDevice[], o: { blankRemoves: boolean; exportedAt?: string | null }): ImportPlan {
	const plan: ImportPlan = { updates: [], creates: [], skipped: [], matched: 0, changed: 0, removals: 0, slots: [], unknown: [] };
	const slots = new Set<string>(), unknown = new Set<string>();
	for (const { brand, category, sheet } of sheets) {
		const pool = devices.filter(d => d.brand === brand && d.category === category);
		/** A header without part ("Ladebuchse") means the only part the brand uses, e.g. "original" for Samsung. */
		const used = new Set(pool.flatMap(d => (d.repairs ?? []).map(r => slot(r.repair, r.quality))));
		const fix = (key: string) => {
			const [repair, q] = key.split(":");
			const parts = QUALITY_ORDER.filter(x => used.has(slot(repair, x)));
			return q === "standard" && !used.has(key) && parts.length === 1 ? slot(repair, parts[0]) : key;
		};
		const cellsOf = (r: SheetRow) => Object.fromEntries(Object.entries(r.cells).map(([k, v]) => [fix(k), v]));
		sheet.slots.forEach(s => s && slots.add(fix(s)));
		sheet.unknown.forEach(u => unknown.add(u));
		const prefix = brandPrefix(pool.map(d => d.title));
		const hits = sheet.rows.map(r => {
			const byId = r.id ? devices.find(d => d.id === r.id) : undefined;
			if (!byId) return { device: matchTitle(r.title, pool, prefix), byId: false };
			const same = normTitle(r.title) === normTitle(byId.title);
			const named = same ? null : matchTitle(r.title, devices.filter(d => d.brand === byId.brand), prefix);
			return { device: byId, byId: true, mismatch: !!named && named.id !== byId.id };
		});
		sheet.rows.forEach((r, i) => {
			const { device: d, byId, mismatch } = hits[i] as { device: PlanDevice | null; byId: boolean; mismatch?: boolean };
			const keep = (raw: string) => o.blankRemoves || raw.trim() !== "";
			if (!d) {
				const below = hits.slice(i + 1).map(h => h.device).find(Boolean), above = hits.slice(0, i).reverse().map(h => h.device).find(Boolean);
				const title = withPrefix(r.title, prefix);
				const cells = Object.fromEntries(Object.entries(cellsOf(r)).filter(([, raw]) => { const v = parseCell(raw); return v !== null; }));
				plan.creates.push({ brand, category, title, series: r.series || ((closest(title, pool) ?? above ?? below)?.series ?? ""), cells, ...(below ? { sort: below.sort - 1 } : above ? { sort: above.sort + 1 } : {}) });
				return;
			}
			if (mismatch) { plan.skipped.push({ title: r.title, reason: "mismatch" }); return; }
			if (d.pending || (d.status && d.status !== "published")) { plan.skipped.push({ title: d.title, reason: "pending" }); return; }
			if (o.exportedAt && d.updatedAt && d.updatedAt > o.exportedAt) { plan.skipped.push({ title: d.title, reason: "stale" }); return; }
			plan.matched++;
			const cells: Record<string, string> = {};
			for (const [key, raw] of Object.entries(cellsOf(r))) {
				if (!keep(raw) || sameCell(d.repairs, key, raw)) continue;
				cells[key] = raw;
				if (parseCell(raw) === null) plan.removals++;
			}
			const title = byId && r.title !== d.title ? r.title : undefined;
			const series = r.series !== undefined && (r.series !== "" || o.blankRemoves) && r.series !== d.series ? r.series : undefined;
			if (Object.keys(cells).length || title !== undefined || series !== undefined) {
				plan.changed++;
				plan.updates.push({ device: d, cells, ...(title !== undefined ? { title } : {}), ...(series !== undefined ? { series } : {}) });
			}
		});
	}
	plan.slots = [...slots]; plan.unknown = [...unknown];
	return plan;
}

