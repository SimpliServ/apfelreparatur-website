// Store data from the operator's main site (public JSON API). Every call falls back to the static snapshot, so the site
// never breaks when that API is slow or down. Responses never carry the source brand, URLs or e-mail addresses.
import { fallbackLocations, type Location } from "./business";
import { devices as staticDevices, type DeviceKey } from "./content";
import { loadModels } from "./devices";

const API = "https://www.mobinil.at/api/v1";
const TTL = 600_000;
const VIENNA = { lat: 48.2082, lng: 16.3738 };
const MAX_KM = 40;
// Owner decision 2026-10-27: SCS Galerie (1. OG, Top 25) is not listed on this site.
const HIDDEN = /Shopping City Süd – Galerie/i;

type Cached<T> = { at: number; value: T };
const memo = new Map<string, Cached<unknown>>();

async function getJson<T>(path: string): Promise<T | null> {
	const hit = memo.get(path) as Cached<T> | undefined;
	if (hit && Date.now() - hit.at < TTL) return hit.value;
	try {
		const res = await fetch(API + path, {
			headers: { accept: "application/json" },
			signal: AbortSignal.timeout(4000),
			cf: { cacheTtl: 900, cacheEverything: true },
		} as RequestInit);
		if (!res.ok) return hit?.value ?? null;
		const value = (await res.json()) as T;
		memo.set(path, { at: Date.now(), value });
		return value;
	} catch {
		return hit?.value ?? null;
	}
}

// ---- Stores ----

type ApiStore = {
	name: string;
	venue: string;
	address: { street: string; zip: string; city: string };
	geo: { lat: number; lng: number };
	phone: string | null;
	openingHours: { days: string[]; opens: string; closes: string }[];
};

const DAY = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_DE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function dayLabel(days: string[]) {
	const idx = days.map((d) => DAY.indexOf(d)).filter((i) => i >= 0).sort((a, b) => a - b);
	if (!idx.length) return "";
	const contiguous = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
	if (idx.length === 1) return DAY_DE[idx[0]];
	return contiguous ? `${DAY_DE[idx[0]]} – ${DAY_DE[idx[idx.length - 1]]}` : idx.map((i) => DAY_DE[i]).join(", ");
}

function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
	const r = Math.PI / 180;
	const x = (b.lng - a.lng) * r * Math.cos(((a.lat + b.lat) / 2) * r);
	const y = (b.lat - a.lat) * r;
	return Math.sqrt(x * x + y * y) * 6371;
}

// Store names drop the operator brand: "MobiNil Wien Hauptbahnhof UG" -> "Wien Hauptbahnhof UG".
const plain = (name: string) => name.replace(/^MobiNil\s+/i, "").trim();
// Groups stores in the same mall/station: "Shopping City Süd – Eingang 4" -> "Shopping City Süd".
const group = (name: string) => plain(name).replace(/\s+(–|-)\s+.*$/, "").replace(/\s+UG$/, "");

export async function getLocations(): Promise<Location[]> {
	const data = await getJson<{ stores: ApiStore[] }>("/filialen.json");
	const stores = data?.stores?.filter((s) => s.geo && km(VIENNA, s.geo) <= MAX_KM && !HIDDEN.test(s.name)) ?? [];
	if (!stores.length) return fallbackLocations;
	return stores.map((s) => {
		const [street, ...unit] = s.address.street.split(", ");
		return {
			name: group(s.name),
			venue: [plain(s.venue), unit.join(", ")].filter(Boolean).join(", "),
			street,
			zip: s.address.zip,
			city: s.address.city,
			phone: s.phone ?? undefined,
			hours: s.openingHours.map((h) => [dayLabel(h.days), `${h.opens} – ${h.closes}`] as [string, string]),
			lat: s.geo.lat,
			lng: s.geo.lng,
		};
	});
}

// ---- Devices ----

export type Model = { slug: string; title: string };

/** Model names from the CMS catalogue (Admin → Preisliste), static list as fallback. */
export async function getModels(device: DeviceKey): Promise<Model[]> {
	const list = await loadModels(device).then((r) => r.models.map((m) => ({ slug: m.slug, title: m.title }))).catch(() => []);
	return list.length ? list : staticDevices[device].models.map((title) => ({ slug: "", title }));
}
