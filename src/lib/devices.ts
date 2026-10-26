// Device catalogue from the CMS (`devices`, prices maintained in Admin → Preisliste). Model pages live at /<gerät>/<slug>.
import { getEmDashCollection, getEmDashEntry, type CacheHint } from "emdash";
import type { DeviceKey, ServiceKey } from "./content";
import { repairLabels } from "../i18n/ui";

export type RepairRow = { repair: string; quality?: string | null; price: number; price_from?: boolean | null; note?: string | null };
export type Img = {
	id?: string;
	src?: string;
	alt?: string;
	width?: number;
	height?: number;
	mimeType?: string;
	meta?: { storageKey?: string; caption?: string };
};
export type Model = {
	slug: string;
	title: string;
	category: Category;
	series: string;
	sort: number;
	image?: Img | null;
	model_numbers?: string;
	repairs: RepairRow[];
	notes?: string;
	updatedAt?: string;
};
export type Category = "smartphone" | "tablet" | "mac" | "watch";

const CATS: Category[] = ["smartphone", "tablet", "mac", "watch"];
export const CATEGORY: Record<DeviceKey, Category> = { iphone: "smartphone", ipad: "tablet", mac: "mac", "apple-watch": "watch" };
export const DEVICE_OF: Record<Category, DeviceKey> = { smartphone: "iphone", tablet: "ipad", mac: "mac", watch: "apple-watch" };
/** Landing page service -> repair key in the price list. */
export const REPAIR_OF: Partial<Record<ServiceKey, string>> = { display: "display", akku: "akku", rueckglas: "backcover", kamera: "kamera", ladebuchse: "ladebuchse", tastatur: "tastatur", datenrettung: "datenrettung" };

type Hintable = { cache?: { enabled?: boolean; set: (hint: CacheHint) => void } };
export function useHints(astro: Hintable, ...hints: (CacheHint | undefined)[]) {
	if (!astro.cache?.enabled) return;
	for (const h of hints) if (h) astro.cache.set(h);
}

const toModel = (e: { id: string; data: unknown; updatedAt?: Date | string }) => {
	const d = e.data as Omit<Model, "slug">;
	return { ...d, slug: e.id, sort: d.sort ?? 999, series: d.series ?? "", repairs: d.repairs ?? [], updatedAt: e.updatedAt ? new Date(e.updatedAt).toISOString() : undefined } as Model;
};

export async function loadModels(device?: DeviceKey) {
	const { entries, cacheHint } = await getEmDashCollection("devices");
	const models = entries.map(toModel).filter((m) => !device || m.category === CATEGORY[device]).sort((a, b) => CATS.indexOf(a.category) - CATS.indexOf(b.category) || a.sort - b.sort || a.title.localeCompare(b.title, "de"));
	return { models, cacheHint };
}

export async function loadModel(device: DeviceKey, slug: string) {
	const { entry, cacheHint } = await getEmDashEntry("devices", slug);
	const model = entry ? toModel(entry as never) : null;
	return { model: model && model.category === CATEGORY[device] ? model : null, entry, cacheHint };
}

export const modelPath = (m: Pick<Model, "slug" | "category">) => `/${DEVICE_OF[m.category]}/${m.slug}`;

export function imgSrc(img?: Img | null): string | undefined {
	if (!img) return undefined;
	if (img.src) return img.src;
	return img.meta?.storageKey ? `/_emdash/api/media/file/${img.meta.storageKey}` : undefined;
}

/** Lowest price per repair key. */
export function fromPrice(m: Model, repair: string): number | null {
	const p = m.repairs.filter((r) => r.repair === repair && typeof r.price === "number").map((r) => r.price);
	return p.length ? Math.min(...p) : null;
}

export const euro = (n: number) => n.toLocaleString("de-AT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

/** Series blocks in catalogue order. */
export function bySeries(models: Model[]) {
	const out = new Map<string, Model[]>();
	for (const m of models) out.set(m.series || "Weitere Modelle", [...(out.get(m.series || "Weitere Modelle") ?? []), m]);
	return [...out].map(([name, items]) => ({ name, items }));
}

export type PriceGroup = { repair: string; label: string; rows: RepairRow[] };
const ORDER = ["display", "aussendisplay", "akku", "backcover", "kamera", "selfie-kamera", "face-id", "ladebuchse", "lautsprecher", "power-button", "home-button", "sim", "kopfhoererbuchse", "tastatur", "trackpad", "ssd", "datenrettung", "datenuebertragung", "wasserschaden", "software-fehler", "software-update", "fehleranalyse"];
const Q = ["original", "drittanbieter", "standard"];

/** Repairs grouped by key, Original before compatible; foldables call the main screen "Innendisplay". */
export function priceGroups(m: Model): PriceGroup[] {
	const keys = [...new Set(m.repairs.map((r) => r.repair))].sort((a, b) => (ORDER.indexOf(a) + 1 || 99) - (ORDER.indexOf(b) + 1 || 99));
	const fold = m.repairs.some((r) => r.repair === "aussendisplay");
	return keys.map((k) => ({
		repair: k,
		label: (fold && k === "display" ? repairLabels.de.innendisplay : repairLabels.de[k]) ?? k,
		rows: m.repairs.filter((r) => r.repair === k).sort((a, b) => Q.indexOf(a.quality || "standard") - Q.indexOf(b.quality || "standard")),
	}));
}

/** Repairs a model page lists even without a price (Macs, Watches, or rows not priced yet). */
export const BASE_REPAIRS: Record<Category, string[]> = {
	smartphone: ["display", "akku", "backcover", "kamera", "ladebuchse"],
	tablet: ["display", "akku", "ladebuchse"],
	mac: ["display", "akku", "tastatur", "trackpad", "ssd", "ladebuchse"],
	watch: ["display", "akku"],
};

/** Shown on the home page and in the footer; missing slugs are skipped, so the CMS can rename freely. */
export const POPULAR = ["iphone-17-pro", "iphone-17", "iphone-16-pro", "iphone-16", "iphone-15", "iphone-13", "ipad-air-11-m3-2025", "macbook-air-13-m2-2022"];
export const popular = (models: Model[]) => POPULAR.map((s) => models.find((m) => m.slug === s)).filter((m): m is Model => !!m);

/** Short price hint for search results and form: "Display ab 209,99 €" or the model number. */
export function hint(m: Model): string {
	const d = fromPrice(m, "display"), a = fromPrice(m, "akku");
	if (d !== null) return `Display ab ${euro(d)}`;
	if (a !== null) return `Batterie ab ${euro(a)}`;
	return m.model_numbers ? `Modell ${m.model_numbers}` : "Preis nach Diagnose";
}
