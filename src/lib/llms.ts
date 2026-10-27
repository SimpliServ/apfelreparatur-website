// llms.txt (index) and llms-full.txt (all facts in one file) for AI agents, built from the same data as the pages.
import { business, type Location } from "./business";
import { dataCards, deviceFaq, homeFaq, steps, whyCards } from "./copy";
import { deviceList, imac, services, type DeviceKey } from "./content";
import { repairPages } from "./repair-pages";
import { guides, richText, type GuideKey } from "./device-guide";
import { SITE } from "./seo";
import { CATEGORY, euro, modelPath, priceGroups, type Model } from "./devices";
import { qualityLabels } from "../i18n/ui";
import type { PlusCard } from "../components/PlusCards.astro";

const dn = (key: DeviceKey, name: string) => (key === "mac" ? "MacBook" : name);
const repairName = (p: (typeof repairPages)[number]) => `${dn(p.device, deviceList.find((d) => d.key === p.device)!.name)} ${p.copy.label}`;
const guideLines = (k: GuideKey) => {
	const g = guides[k];
	return [richText(g.intro, SITE), "", ...g.topics.flatMap((t) => [`#### ${t.h}`, "", ...t.p.map((p) => richText(p, SITE)), ""]), "Vorbereitung:", ...g.prep.map((p) => `- ${richText(p, SITE)}`), ""];
};
const card = (c: PlusCard) => `- **${[c.pre, c.hl, c.post].filter(Boolean).join(" ")}** ${c.detail.join(" ")}`;
const store = (l: Location) =>
	`- **${l.name}** (${l.venue}), ${l.street}, ${l.zip} ${l.city}${l.phone ? `, Tel. ${l.phone}` : ""}. Öffnungszeiten: ${l.hours.map(([d, t]) => `${d} ${t}`).join(", ")}.`;

const summary = `> Unabhängige Reparatur für iPhone, iPad und Mac in Wien und Umgebung. Premium-Reparaturen mit Original Apple Teilen (sofern Apple sie für das Modell bereitstellt), Display, Rückglas, Akku, Kamera, Ladebuchse, Tastatur, Datenrettung und Datenübertragung. Ohne Termin, Preis vor der Reparatur, ${business.warrantyMonths} Monate Garantie auf Teil und Arbeit. Nicht mit Apple Inc. verbunden, kein Apple Store und kein autorisierter Apple Service Provider.`;

const facts = (locations: Location[]) => [
	`- Standorte: ${[...new Set(locations.map((l) => l.name))].join(", ")} (Details: ${SITE}/kontakt)`,
	"- Termin: nicht nötig, einfach vorbeikommen.",
	"- Preise: iPhone und iPad zum Fixpreis je Modell (Preisliste unten bzw. auf der Modellseite), ohne Arbeitspauschale oder Arbeitszeit-Zuschlag. Mac und Apple Watch: Preis nach der Diagnose, vor der Reparatur. Repariert wird erst nach Zustimmung.",
	"- Dauer: ist das Teil lagernd, ist ein Display- oder Akkutausch oft in rund einer Stunde erledigt.",
	`- Garantie: ${business.warrantyMonths} Monate auf getauschte Teile und Arbeit, gesetzliche Gewährleistung bleibt bestehen.`,
	`- Kontakt: ${business.email}, gratis Service-Hotline ${business.hotline}`,
	"- Bezahlung: bei Abholung.",
];

export function llmsTxt(locations: Location[]): string {
	const rep = repairPages.map((p) => `- [${repairName(p)} Wien](${SITE}${p.path})`);
	return [
		`# ${business.brand}`,
		"",
		summary,
		"",
		...facts(locations),
		"",
		"## Geräte",
		...deviceList.map((d) => `- [${d.name} Reparatur Wien](${SITE}/${d.key}): ${d.repairs.map((r) => services[r.key].label).join(", ")}`),
		`- [iMac Reparatur Wien](${SITE}/imac): ${imac.repairs.map((r) => services[r.key].label).join(", ")}`,
		`- [Datenrettung und Datenübertragung](${SITE}/datenrettung): iPhone, iPad und Mac`,
		"",
		"## Reparaturen",
		...rep,
		"",
		"## Anfrage",
		`- [Reparatur anfragen](${SITE}/reparatur-anfragen): Formular mit Gerät, Anliegen, Name, E-Mail, optional Telefon und Modell. Vorauswahl per URL: \`?geraet=iphone|ipad|mac|apple-watch&anliegen=display|rueckglas|akku|kamera|ladebuchse|tastatur|datenrettung|datenuebertragung\`. Das Formular ist als WebMCP-Tool \`request_repair\` annotiert.`,
		`- [Standorte und Öffnungszeiten](${SITE}/kontakt)`,
		"",
		"## Optional",
		`- [Alle Inhalte in einer Datei](${SITE}/llms-full.txt)`,
		`- [Impressum](${SITE}/impressum)`,
		`- [Datenschutz](${SITE}/datenschutz)`,
		`- [AGB](${SITE}/agb)`,
		`- [Vertrag widerrufen](${SITE}/vertrag-widerrufen)`,
		"",
	].join("\n");
}

const priceLine = (m: Model) =>
	`- [${m.title}](${SITE}${modelPath(m)})${m.model_numbers ? ` (${m.model_numbers})` : ""}: ` +
	(m.repairs.length
		? priceGroups(m).map((g) => `${g.label} ${g.rows.map((r) => `${r.price_from ? "ab " : ""}${euro(r.price)}${r.quality && r.quality !== "standard" ? ` (${qualityLabels.de[r.quality]})` : ""}`).join(" / ")}`).join(", ")
		: "Preis nach Diagnose");

export function llmsFullTxt(locations: Location[], models: Model[] = []): string {
	const qa = (q: string, a: string) => `**${q}**\n${a}\n`;
	const out = [
		`# ${business.brand}: iPhone, iPad und Mac Reparatur in Wien`,
		"",
		summary,
		"",
		`Quelle: ${SITE}. Diese Datei fasst alle Inhalte der Website zusammen.`,
		"",
		"## Auf einen Blick",
		...facts(locations),
		"",
		"## Warum Apfelreparatur",
		...whyCards.map(card),
		"",
		"## Ablauf",
		...steps.map((s) => `${Number(s.n)}. **${s.title}** ${s.text}`),
		"",
		"## Standorte",
		...locations.map(store),
		"",
	];
	for (const d of deviceList) {
		out.push(`## ${d.name} Reparatur Wien`, "", `${SITE}/${d.key}`, "", `${d.headline} ${d.sub}`, "");
		for (const r of d.repairs) {
			const page = repairPages.find((p) => p.device === d.key && p.service === r.key);
			out.push(`### ${r.title}`, "", r.text, "", ...r.points.map((p) => `- ${p}`));
			if (page) out.push(`- Mehr: ${SITE}${page.path}`);
			out.push("");
		}
		const own = models.filter((m) => m.category === CATEGORY[d.key]);
		out.push(own.length ? `### Modelle und Preise\n\n${own.map(priceLine).join("\n")}\n` : `Modelle: ${d.models.join(", ")}.`, "", `### Häufige Fragen zur ${d.name} Reparatur`, "", ...[...deviceFaq(d), ...guides[d.key].faq].map((f) => qa(f.q, f.a)));
		out.push("", `### Gut zu wissen: ${d.name}`, "", ...guideLines(d.key));
		if (d.key === "mac") out.push(`## iMac Reparatur Wien`, "", `${SITE}/imac`, "", `${imac.headline} ${imac.sub}`, "", ...guideLines("imac"), "### Häufige Fragen zur iMac Reparatur", "", ...[...deviceFaq(imac), ...guides.imac.faq].map((f) => qa(f.q, f.a)), "");
	}
	out.push("## Reparaturen im Detail", "");
	for (const p of repairPages) {
		const d = deviceList.find((x) => x.key === p.device)!;
		const n = dn(d.key, d.name);
		out.push(`### ${repairName(p)} Wien`, "", `${SITE}${p.path}`, "", p.copy.sub(n), "", "Typische Anzeichen:", ...p.copy.signs.filter((s) => !s.skip?.includes(n)).map((s) => `- ${s.title}: ${s.text}`), "");
		out.push(...p.copy.faq(n).map((f) => qa(f.q, f.a)));
	}
	out.push("## Datenrettung und Datenübertragung", "", `${SITE}/datenrettung`, "", ...dataCards.map(card), "");
	out.push("## Häufige Fragen", "", ...homeFaq.map((f) => qa(f.q, f.a)));
	out.push(
		"## Rechtliches",
		"",
		`Anbieterangaben: ${SITE}/impressum, Datenschutz: ${SITE}/datenschutz, AGB: ${SITE}/agb.`,
		"",
		"Apple, iPhone, iPad, Mac und MacBook sind Marken der Apple Inc. Apfelreparatur ist ein unabhängiger Reparaturbetrieb und steht in keiner Verbindung zu Apple Inc.",
		"",
	);
	return out.join("\n");
}
