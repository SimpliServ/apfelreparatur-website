// Copy for model pages (/<gerät>/<modell>). Titles target price searches ("<Modell> Reparatur Kosten", Original Apple Display)
// and Mac model numbers, not MobiNil's "<Modell> Reparatur Wien – Display ab …" (AGENTS.md: keep keywords apart).
import type { QA } from "../components/FAQ.astro";
import { business } from "./business";
import { euro, fromPrice, type Model } from "./devices";

const price = (m: Model, repair: string, quality?: string) => {
	const rows = m.repairs.filter((r) => r.repair === repair && (!quality || r.quality === quality));
	if (!rows.length) return null;
	const r = rows.reduce((a, b) => (b.price < a.price ? b : a));
	return (r.price_from ? "ab " : "") + euro(r.price);
};

const article = (m: Model) => (m.category === "watch" ? "die" : m.category === "mac" ? "den" : "das");
/** Nominative: "das MacBook", "der iMac", "die Apple Watch". */
const nom = (m: Model) => (m.category === "watch" ? "die" : m.category === "mac" && !/^MacBook/.test(m.title) ? "der" : "das");
const dat = (m: Model) => (m.category === "watch" ? "der" : "dem");
/** "beim iPhone 16" / "bei der Apple Watch Series 9" */
const bei = (m: Model) => (m.category === "watch" ? `bei der ${m.title}` : `beim ${m.title}`);

export function modelTitle(m: Model): string {
	const display = price(m, "display", "original") ?? price(m, "display");
	if (m.category === "mac") return `${m.title} Reparatur${m.model_numbers ? ` (${m.model_numbers.split(",")[0]})` : ""}: Display, Batterie, Tastatur`;
	if (m.category === "watch") return `${m.title} Reparatur: Display und Batterie in Wien`;
	if (!display) return `${m.title} Reparatur Kosten und Preise`;
	return m.category === "smartphone" && price(m, "display", "original") ? `${m.title} Reparatur Kosten: Original Display ${display}` : `${m.title} Reparatur Kosten: Display ${display}`;
}

export function modelDescription(m: Model): string {
	const g = business.warrantyMonths;
	if (!m.repairs.length) {
		const what = m.category === "watch" ? "Display und Batterie" : "Display, Batterie, Tastatur, Trackpad und SSD";
		return `${m.title}${m.model_numbers ? ` (${m.model_numbers})` : ""} Reparatur in Wien: ${what}. Preis nach Diagnose, vor der Reparatur. ${g} Monate Garantie, ohne Termin.`;
	}
	const parts = [
		price(m, "display", "original") && `Original Apple Display ${price(m, "display", "original")}`,
		!price(m, "display", "original") && price(m, "display") && `Display ${price(m, "display")}`,
		price(m, "akku") && `Batterie ${price(m, "akku")}`,
		price(m, "backcover") && `Rückglas ${price(m, "backcover")}`,
		!price(m, "backcover") && price(m, "ladebuchse") && `Ladeanschluss ${price(m, "ladebuchse")}`,
	].filter(Boolean);
	const quick = m.category === "mac" ? "" : " Oft in rund 1 Stunde,";
	return `Was kostet die ${m.title} Reparatur? ${parts.join(", ")}.${quick} ohne Termin in Wien, ${g} Monate Garantie.`.replace(". ohne", ". Ohne");
}

export function modelSub(m: Model): string {
	if (m.category === "smartphone") return "Premium-Reparatur zum Fixpreis. Wahlweise mit Original Apple Teilen.";
	if (m.category === "tablet") return "Neues Glas, neue Batterie, neuer Anschluss. Fixpreise, transparent vorab.";
	if (m.category === "mac") return "Display, Batterie, Tastatur und SSD. Sorgfältig repariert, Preis vor der Reparatur.";
	return "Neues Display oder neue Batterie. Sorgfältig verklebt, Preis vor der Reparatur.";
}

export function modelFaq(m: Model): QA[] {
	const g = business.warrantyMonths;
	const out: QA[] = [];
	const dOrig = price(m, "display", "original"), dComp = price(m, "display", "drittanbieter"), dAny = price(m, "display");
	if (dOrig && dComp)
		out.push({ q: `Was kostet ein neues Display für ${article(m)} ${m.title}?`, a: `Mit Original Apple Display ${dOrig}, mit kompatiblem Display ${dComp}. Den Preis bestätigen wir Ihnen vor der Reparatur.` });
	else if (dAny)
		out.push({ q: `Was kostet ein neues Display für ${article(m)} ${m.title}?`, a: `Der Displaytausch ${bei(m)} kostet ${dAny}. Den Preis bestätigen wir Ihnen vor der Reparatur.` });
	const akku = price(m, "akku");
	if (akku) out.push({ q: `Was kostet ein Batterietausch ${bei(m)}?`, a: `Eine neue Batterie ${bei(m)} kostet ${akku}${price(m, "akku", "original") && price(m, "akku", "drittanbieter") ? ` (Original Apple ${price(m, "akku", "original")}, kompatibel ${price(m, "akku", "drittanbieter")})` : ""}.` });
	const back = price(m, "backcover");
	if (back) out.push({ q: `Was kostet ein neues Rückglas ${bei(m)}?`, a: `Das Rückglas ${bei(m)} ersetzen wir für ${back}. Kabelloses Laden prüfen wir danach.` });
	if (dOrig && dComp)
		out.push({ q: "Original Apple Display oder kompatibles Display?", a: `Das Original Apple Display entspricht in Farben, Helligkeit und Touch dem Werkszustand. Das kompatible Display ist günstiger, iOS kann dazu einen Hinweis zum verbauten Teil anzeigen. Auf beide geben wir ${g} Monate Garantie.` });
	if (!m.repairs.length)
		out.push({ q: `Was kostet die Reparatur ${bei(m)}?`, a: `Das hängt vom Schaden ab. Wir prüfen ${article(m)} ${m.title} und nennen Ihnen den Preis vor der Reparatur. Repariert wird erst nach Ihrer Zustimmung.` });
	if (m.category === "mac") {
		out.push({ q: `Woran erkenne ich, ob ich ${article(m)} ${m.title} habe?`, a: `Im Apple Menü unter „Über diesen Mac“ stehen Modell und Jahr.${m.model_numbers ? ` Die Modellnummer ${m.model_numbers} finden Sie außerdem klein gedruckt auf der Unterseite des Geräts.` : ""}` });
		out.push({ q: "Bleiben meine Daten bei der Reparatur erhalten?", a: "Bei Display, Batterie und Tastatur bleibt die SSD unberührt. Startet Ihr Mac nicht mehr, hilft unsere Datenrettung." });
	} else {
		out.push({ q: `Wie lange dauert die Reparatur ${bei(m)}?`, a: "Ein Display- oder Batterietausch ist oft in rund einer Stunde erledigt. Bei aufwendigeren Reparaturen nennen wir Ihnen die Dauer vorab." });
		out.push({ q: "Bleiben meine Daten erhalten?", a: `Ja, bei Display, Batterie und Rückglas bleiben Ihre Daten auf ${dat(m)} ${m.title}.` });
	}
	out.push({ q: "Welche Garantie bekomme ich?", a: `${g} Monate auf das getauschte Teil und unsere Arbeit, an allen Standorten. Ihre gesetzlichen Gewährleistungsrechte bleiben bestehen.` });
	out.push({ q: "Brauche ich einen Termin?", a: "Nein. Kommen Sie ohne Termin an einen unserer Standorte in Wien und Umgebung, auch am Wochenende." });
	return out;
}

export type RepairDetail = { id: string; repair: string; title: string; text: string; price: string | null };

/** One visible paragraph per main repair (symptoms, parts, duration, price), anchored for search-result jump links. */
export function repairDetails(m: Model): RepairDetail[] {
	const t = m.title;
	const has = (k: string) => m.repairs.some((r) => r.repair === k) || (m.category === "mac" || m.category === "watch" ? ["display", "akku", ...(m.category === "mac" ? ["tastatur"] : [])].includes(k) : false);
	const parts = (k: string) => {
		const o = price(m, k, "original"), c = price(m, k, "drittanbieter");
		if (o && c) return ` Sie wählen zwischen Original Apple Teil (${o}) und kompatiblem Teil (${c}).`;
		const p = price(m, k);
		return p ? ` ${p.startsWith("ab ") ? "Preis" : "Fixpreis"}: ${p}.` : " Den Preis nennen wir Ihnen nach der Diagnose, vor der Reparatur.";
	};
	const quick = m.category === "mac" ? "" : " Die Reparatur ist oft in rund einer Stunde erledigt.";
	const health =
		m.category === "smartphone"
			? " oder zeigt „Einstellungen > Batterie > Batteriezustand“ unter 80 %"
			: m.category === "mac"
				? " oder meldet macOS „Service empfohlen“ beim Batteriezustand"
				: m.category === "watch"
					? " oder zeigt die Watch beim Batteriezustand unter 80 %"
					: "";
	const out: (RepairDetail | false)[] = [
		has("display") && {
			id: "display-reparatur",
			repair: "display",
			title: `${t} Display tauschen\u00a0– Bildschirm\u00a0wechseln`,
			text:
				m.category === "mac"
					? `Gesprungenes Glas, Streifen, dunkle Flecken oder ein flackerndes Bild: Dann tauschen wir das Display Ihres ${t}.${parts("display")} Danach testen wir Bild, Helligkeit und Kamera.`
					: `Gesprungenes Glas, Streifen, dunkle Flecken oder ein Touch, der nicht mehr reagiert: Dann tauschen wir das Display ${m.category === "watch" ? "Ihrer" : "Ihres"} ${t}.${parts("display")}${quick} Danach testen wir Touch, Helligkeit und Sensoren.`,
			price: price(m, "display"),
		},
		has("akku") && {
			id: "batterietausch",
			repair: "akku",
			title: `${t} Akkutausch\u00a0– Akku wechseln & Batterie\u00a0tauschen`,
			text: `Hält der Akku nicht mehr durch den Tag, schaltet sich ${nom(m)} ${t} bei Restladung ab${health}, ist eine neue Batterie fällig.${parts("akku")}${quick}`,
			price: price(m, "akku"),
		},
		has("backcover") && {
			id: "rueckglas-reparatur",
			repair: "backcover",
			title: `${t} Rückglas tauschen`,
			text: `Ein gesprungenes Rückglas splittert weiter und lässt Feuchtigkeit ins Gerät. Wir ersetzen es ${bei(m)} und prüfen danach kabelloses Laden.${parts("backcover")}`,
			price: price(m, "backcover"),
		},
		has("ladebuchse") && {
			id: "ladeanschluss-reparatur",
			repair: "ladebuchse",
			title: `${t} lädt nicht: Ladeanschluss`,
			text: `Lädt ${nom(m)} ${t} nur, wenn das Kabel in einem bestimmten Winkel steckt, oder gar nicht mehr, tauschen wir den Ladeanschluss.${parts("ladebuchse")}`,
			price: price(m, "ladebuchse"),
		},
		has("kamera") && {
			id: "kamera-reparatur",
			repair: "kamera",
			title: `${t} Kamera Reparatur`,
			text: `Unscharfe Fotos, Flecken im Bild, ein wackelnder Fokus oder ein gesprungenes Kameraglas: Wir tauschen die Kamera ${bei(m)}.${parts("kamera")}`,
			price: price(m, "kamera"),
		},
		has("tastatur") && {
			id: "tastatur-reparatur",
			repair: "tastatur",
			title: `${t} Tastatur Reparatur`,
			text: `Klemmende Tasten, doppelte Anschläge oder Tasten ohne Reaktion: Wir prüfen die Tastatur ${bei(m)} und tauschen sie bei Bedarf.${parts("tastatur")}`,
			price: price(m, "tastatur"),
		},
	];
	return out.filter((x): x is RepairDetail => !!x);
}

/** Up to three headline prices for the hero. */
export function headline(m: Model): { label: string; value: string }[] {
	const pick: [string, string][] = m.category === "smartphone" ? [["display", "Display"], ["akku", "Batterie"], ["backcover", "Rückglas"]] : [["display", "Display"], ["akku", "Batterie"], ["ladebuchse", "Ladeanschluss"]];
	return pick
		.map(([k, label]) => ({ label, p: fromPrice(m, k), from: m.repairs.some((r) => r.repair === k && r.price_from) || m.repairs.filter((r) => r.repair === k).length > 1 }))
		.filter((x) => x.p !== null)
		.map((x) => ({ label: x.label, value: (x.from ? "ab " : "") + euro(x.p!) }));
}
