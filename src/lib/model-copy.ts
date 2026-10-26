// Copy for model pages (/<gerät>/<modell>). Titles target price searches ("<Modell> Reparatur Kosten", Original Apple Display)
// and Mac model numbers, not MobiNil's "<Modell> Reparatur Wien – Display ab …" (AGENTS.md: keep keywords apart).
import type { QA } from "../components/FAQ.astro";
import { business } from "./business";
import { euro, fromPrice, type Model } from "./devices";

export const LABOUR_FEE = 19.99;

const price = (m: Model, repair: string, quality?: string) => {
	const rows = m.repairs.filter((r) => r.repair === repair && (!quality || r.quality === quality));
	if (!rows.length) return null;
	const r = rows.reduce((a, b) => (b.price < a.price ? b : a));
	return (r.price_from ? "ab " : "") + euro(r.price);
};

const article = (m: Model) => (m.category === "watch" ? "die" : m.category === "mac" ? "den" : "das");
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
	return `Was kostet die ${m.title} Reparatur? ${parts.join(", ")}. Premium-Reparatur in Wien ohne Termin, ${g} Monate Garantie.`;
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
		out.push({ q: `Was kostet ein neues Display für ${article(m)} ${m.title}?`, a: `Mit Original Apple Display ${dOrig}, mit kompatiblem Display ${dComp}. Dazu kommt die Arbeitspauschale von ${euro(LABOUR_FEE)} je Reparatur. Den Preis bestätigen wir Ihnen vor der Reparatur.` });
	else if (dAny)
		out.push({ q: `Was kostet ein neues Display für ${article(m)} ${m.title}?`, a: `Der Displaytausch ${bei(m)} kostet ${dAny}, zuzüglich ${euro(LABOUR_FEE)} Arbeitspauschale. Den Preis bestätigen wir Ihnen vor der Reparatur.` });
	const akku = price(m, "akku");
	if (akku) out.push({ q: `Was kostet ein Batterietausch ${bei(m)}?`, a: `Eine neue Batterie ${bei(m)} kostet ${akku}${price(m, "akku", "original") && price(m, "akku", "drittanbieter") ? ` (Original Apple ${price(m, "akku", "original")}, kompatibel ${price(m, "akku", "drittanbieter")})` : ""}, zuzüglich ${euro(LABOUR_FEE)} Arbeitspauschale.` });
	const back = price(m, "backcover");
	if (back) out.push({ q: `Was kostet ein neues Rückglas ${bei(m)}?`, a: `Das Rückglas ${bei(m)} ersetzen wir für ${back}, zuzüglich ${euro(LABOUR_FEE)} Arbeitspauschale. Kabelloses Laden prüfen wir danach.` });
	if (dOrig && dComp)
		out.push({ q: "Original Apple Display oder kompatibles Display?", a: `Das Original Apple Display entspricht in Farben, Helligkeit und Touch dem Werkszustand. Das kompatible Display ist günstiger, iOS kann dazu einen Hinweis zum verbauten Teil anzeigen. Auf beide geben wir ${g} Monate Garantie.` });
	if (!m.repairs.length)
		out.push({ q: `Was kostet die Reparatur ${bei(m)}?`, a: `Das hängt vom Schaden ab. Wir prüfen ${article(m)} ${m.title} und nennen Ihnen den Preis vor der Reparatur. Repariert wird erst nach Ihrer Zustimmung.` });
	if (m.category === "mac") {
		out.push({ q: `Woran erkenne ich, ob ich ${article(m)} ${m.title} habe?`, a: `Im Apple Menü unter „Über diesen Mac“ stehen Modell und Jahr.${m.model_numbers ? ` Die Modellnummer ${m.model_numbers} finden Sie außerdem klein gedruckt auf der Unterseite des Geräts.` : ""}` });
		out.push({ q: "Bleiben meine Daten bei der Reparatur erhalten?", a: "Bei Display, Batterie und Tastatur bleibt die SSD unberührt. Ein aktuelles Time Machine Backup empfehlen wir trotzdem. Startet Ihr Mac nicht mehr, hilft unsere Datenrettung." });
	} else {
		out.push({ q: `Wie lange dauert die Reparatur ${bei(m)}?`, a: "Ist das Teil lagernd, ist ein Display- oder Batterietausch oft in rund einer Stunde erledigt. Sonst nennen wir Ihnen die Dauer vorab." });
		out.push({ q: "Bleiben meine Daten erhalten?", a: `Ja, bei Display, Batterie und Rückglas bleiben Ihre Daten auf ${dat(m)} ${m.title}. Ein aktuelles Backup empfehlen wir trotzdem.` });
	}
	out.push({ q: "Welche Garantie bekomme ich?", a: `${g} Monate auf das getauschte Teil und unsere Arbeit, an allen Standorten. Ihre gesetzlichen Gewährleistungsrechte bleiben bestehen.` });
	out.push({ q: "Brauche ich einen Termin?", a: "Nein. Kommen Sie ohne Termin an einen unserer Standorte in Wien und Umgebung oder stellen Sie vorab online eine Anfrage." });
	return out;
}

/** Up to three headline prices for the hero. */
export function headline(m: Model): { label: string; value: string }[] {
	const pick: [string, string][] = m.category === "smartphone" ? [["display", "Display"], ["akku", "Batterie"], ["backcover", "Rückglas"]] : [["display", "Display"], ["akku", "Batterie"], ["ladebuchse", "Ladeanschluss"]];
	return pick
		.map(([k, label]) => ({ label, p: fromPrice(m, k), from: m.repairs.some((r) => r.repair === k && r.price_from) || m.repairs.filter((r) => r.repair === k).length > 1 }))
		.filter((x) => x.p !== null)
		.map((x) => ({ label: x.label, value: (x.from ? "ab " : "") + euro(x.p!) }));
}
