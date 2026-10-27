// Landing pages per device × repair (/iphone/display-reparatur …). Titles lead with the symptom ("Display kaputt?") and avoid
// MobiNil's wording ("Display tauschen", "Akku tauschen", "Ladebuchse reparieren"): both sites are Mobi GmbH, so they target different searches.
// Claims follow AGENTS.md: prices only from the CMS price list, no fixed durations, no board-level work.
import type { QA } from "../components/FAQ.astro";
import { business } from "./business";
import { de, devices, type DeviceKey, type ServiceKey } from "./content";

type Copy = {
	slug: string;
	label: string;
	/** Page part of <title>; the layout appends the brand. Keep it under ~45 chars. */
	title: (n: string) => string;
	/** Meta description, ≤ 155 chars. */
	desc: (n: string) => string;
	sub: (n: string) => string;
	signs: { icon: string; title: string; text: string; skip?: string }[];
	steps: (n: string) => { n: string; title: string; text: string }[];
	faq: (n: string) => QA[];
};

const step = (title: string, text: string, i: number) => ({ n: String(i + 1).padStart(2, "0"), title, text });
const termin = (n: string, label: string): QA => ({
	q: `Brauche ich für die ${n} ${label} einen Termin?`,
	a: "Nein. Kommen Sie ohne Termin an einen unserer Standorte in Wien und Umgebung, zum Beispiel am Wiener Hauptbahnhof. Vorab können Sie online eine Anfrage stellen.",
});
// iPad and Apple Watch parts are not advertised as Original Apple (see content.ts), so copy only claims them for iPhone and Mac.
const original = (n: string) => (n === "iPad" || n === "Apple Watch" ? "" : ", mit Original Apple Teilen");

// iPhone and iPad have fixed prices per model (CMS price list); Mac and Watch are priced after diagnosis.
const priceAnswer = (n: string) =>
	n === "iPhone" || n === "iPad"
		? `Das hängt vom Modell ab. Die Fixpreise für jedes ${n} Modell stehen in der Preistabelle auf dieser Seite, ohne Arbeitszeit-Zuschlag. Repariert wird erst nach Ihrer Zustimmung.`
		: "Das hängt vom Modell und vom Schaden ab. Den genauen Preis nennen wir Ihnen nach der Diagnose, vor der Reparatur. Repariert wird erst nach Ihrer Zustimmung.";

const common = (n: string, work: string) =>
	[
		step("Vorbeikommen.", "Ohne Termin an einen unserer Standorte in Wien und Umgebung, oder vorab online anfragen.", 0),
		step("Diagnose und Preis.", `Wir prüfen ${de(n).ihr} ${n} und nennen Ihnen den Preis. Repariert wird erst nach Ihrer Zustimmung.`, 1),
		step("Reparatur.", work, 2),
		step("Test und Übergabe.", `Wir testen jede Funktion. Auf Teil und Arbeit gibt es ${business.warrantyMonths} Monate Garantie.`, 3),
	];

const COPY: Partial<Record<ServiceKey, Copy>> = {
	display: {
		slug: "display-reparatur",
		label: "Display Reparatur",
		title: (n) => `${n} Display kaputt? Glasbruch Reparatur Wien`,
		desc: (n) => `${n} Display kaputt in Wien: Glas gesprungen, Streifen oder ${n === "MacBook" ? "Flecken im Bild" : "Touch defekt"}? Wir ersetzen das Display${original(n)}. Ohne Termin, Preis vorab.`,
		sub: (n) => `Gesprungenes Glas, Streifen oder schwarzes Bild? Wir tauschen das Display ${de(n).ihres} ${n}${original(n)}.`,
		signs: [
			{ icon: "ph:device-mobile", title: "Glas gesprungen", text: "Risse oder Splitter im Displayglas." },
			{ icon: "ph:warning-circle", title: "Streifen oder Flecken", text: "Linien, dunkle Stellen oder flackerndes Bild." },
			{ icon: "ph:fingerprint", title: "Touch reagiert nicht", text: "Eingaben werden nicht oder falsch erkannt.", skip: "MacBook" },
			{ icon: "ph:laptop", title: "Druckstellen am Display", text: "Abdrücke der Tastatur oder helle Flecken im Bild.", skip: "iPhone iPad Apple Watch" },
			{ icon: "ph:x", title: "Schwarzes Bild", text: "Das Gerät läuft, aber das Display bleibt dunkel." },
		],
		steps: (n) => common(n, "Wir tauschen das Displaymodul, setzen es staubfrei ein und prüfen Helligkeit, Farben und Touch."),
		faq: (n) => [
			{ q: `Was kostet eine ${n} Display Reparatur in Wien?`, a: priceAnswer(n) },
			{ q: `Wie lange dauert der Displaytausch ${de(n).beim} ${n}?`, a: "Ist das Display lagernd, ist der Tausch oft in rund einer Stunde erledigt. Sonst nennen wir Ihnen die Dauer vorab." },
			{ q: "Bleiben meine Daten beim Displaytausch erhalten?", a: "Ja, beim Displaytausch bleiben Ihre Daten auf dem Gerät. Ein aktuelles Backup empfehlen wir trotzdem." },
			{ q: "Verwenden Sie ein Original Apple Display?", a: "Ja, sofern Apple das Display für Ihr Modell bereitstellt. Sonst besprechen wir die Alternative vorher mit Ihnen." },
			n === "iPhone"
				? { q: "Muss bei gesprungenem Glas das ganze Display getauscht werden?", a: "Beim iPhone sind Glas und Display fest miteinander verbunden. Deshalb tauschen wir das komplette Displaymodul, damit Bild, Touch und Abdichtung wieder stimmen." }
				: { q: "Muss bei gesprungenem Glas das ganze Display getauscht werden?", a: `Das hängt vom ${n} Modell ab. Wir prüfen zuerst, was getauscht werden muss, und nennen Ihnen dann den Preis.` },
			...(n === "iPhone" ? [{ q: "Funktionieren Face ID und True Tone nach dem Displaytausch?", a: "Ja. Face ID und True Tone bleiben erhalten. Wir prüfen beides vor der Übergabe." }] : []),
			termin(n, "Display Reparatur"),
		],
	},
	akku: {
		slug: "batterietausch",
		label: "Batterietausch",
		title: (n) => `${n} Akku schwach? Batterietausch in Wien`,
		desc: (n) => `${n} Akku schwach in Wien: kurze Laufzeit, plötzliches Ausschalten oder „Service“-Meldung? Wir wechseln die Batterie${original(n)}. Ohne Termin, Preis vorab.`,
		sub: (n) => (n === "iPad" || n === "Apple Watch" ? `Hält der Akku ${de(n).ihres} ${n} nicht mehr durch? Wir tauschen ihn gegen einen neuen Akku mit voller Kapazität.` : `Hält der Akku Ihres ${n} nicht mehr durch? Wir tauschen ihn, mit Original Apple Teilen, wo Apple sie bereitstellt.`),
		signs: [
			{ icon: "ph:battery-full", title: "Kurze Laufzeit", text: "Der Akku hält keinen Tag mehr durch." },
			{ icon: "ph:warning-circle", title: "„Service“ empfohlen", text: "Das System meldet einen verschlissenen Akku." },
			{ icon: "ph:x", title: "Plötzliches Ausschalten", text: "Das Gerät geht bei Restladung einfach aus." },
			{ icon: "ph:drop", title: "Gehäuse wölbt sich", text: "Ein aufgeblähter Akku drückt Display oder Gehäuse." },
		],
		steps: (n) => common(n, "Wir entnehmen den alten Akku sicher, setzen den neuen ein und prüfen Ladung und Kapazität."),
		faq: (n) => [
			{ q: `Was kostet ein ${n} Akkutausch in Wien?`, a: priceAnswer(n) },
			{ q: "Wann sollte ich den Akku tauschen?", a: "Wenn die maximale Kapazität deutlich gesunken ist, das System einen Service empfiehlt oder das Gerät unerwartet ausgeht." },
			{ q: `Wie lange dauert ein Akkutausch ${de(n).beim} ${n}?`, a: "Ist der Akku lagernd, oft rund eine Stunde. Sonst nennen wir Ihnen die Dauer vorab." },
			...(n === "iPhone"
				? [{ q: "Wo sehe ich den Batteriezustand meines iPhone?", a: "Unter Einstellungen › Batterie › Batteriezustand. Liegt die maximale Kapazität deutlich unter 80 % oder empfiehlt iOS einen Service, lohnt sich ein neuer Akku." }]
				: n === "MacBook"
					? [{ q: "Wo sehe ich den Batteriezustand meines MacBook?", a: "In den Systemeinstellungen unter Batterie › Batteriezustand. Steht dort „Service empfohlen“, ist es Zeit für einen neuen Akku." }]
					: []),
			{ q: "Was passiert mit dem alten Akku?", a: "Wir entsorgen ihn fachgerecht über das Recycling für Altbatterien." },
			termin(n, "Batterietausch"),
		],
	},
	rueckglas: {
		slug: "rueckglas-reparatur",
		label: "Rückglas Reparatur",
		title: (n) => `${n} Rückglas kaputt? Backcover Reparatur Wien`,
		desc: (n) => `${n} Rückglas Reparatur in Wien: gesprungene Rückseite (Backcover) passgenau ersetzt, MagSafe und kabelloses Laden geprüft. Ohne Termin, Preis vorab.`,
		sub: (n) => `Rückseite gesprungen? Wir ersetzen das Rückglas (Backcover) Ihres ${n} passgenau, damit Splitter und Feuchtigkeit draußen bleiben.`,
		signs: [
			{ icon: "ph:cards", title: "Risse in der Rückseite", text: "Feine Sprünge oder großflächig gesplittertes Glas." },
			{ icon: "ph:warning-circle", title: "Scharfe Kanten", text: "Splitter lösen sich, Verletzungsgefahr." },
			{ icon: "ph:camera", title: "Kameraglas beschädigt", text: "Die Linsenabdeckung ist mit gesprungen." },
			{ icon: "ph:drop", title: "Schutz vor Feuchtigkeit", text: "Durch Risse kann Feuchtigkeit ins Gerät." },
		],
		steps: (n) => common(n, "Wir ersetzen das Rückglas passgenau und prüfen kabelloses Laden und Kamera."),
		faq: (n) => [
			{ q: `Was kostet eine ${n} Rückglas Reparatur in Wien?`, a: priceAnswer(n) },
			{ q: "Funktioniert kabelloses Laden danach noch?", a: "Ja. Wir prüfen kabelloses Laden und MagSafe nach der Reparatur." },
			{ q: "Ist ein gesprungenes Rückglas gefährlich?", a: "Splitter können verletzen, und durch Risse kann Feuchtigkeit eindringen. Eine Reparatur schützt das Gerät." },
			{ q: "Ist Rückglas dasselbe wie das Backcover?", a: `Ja, gemeint ist die gläserne Rückseite Ihres ${n}. Wir ersetzen sie passgenau und in der Originalfarbe.` },
			{ q: "Kann das Kameraglas gleich mit getauscht werden?", a: "Ja. Ist die Linsenabdeckung mit gesprungen, tauschen wir sie auf Wunsch im selben Schritt." },
			termin(n, "Rückglas Reparatur"),
		],
	},
	kamera: {
		slug: "kamera-reparatur",
		label: "Kamera Reparatur",
		title: (n) => `${n} Kamera unscharf? Kameraglas Reparatur Wien`,
		desc: (n) => `${n} Kamera Reparatur in Wien: unscharfe Fotos, Flecken im Bild oder gesprungenes Kameraglas. Wir tauschen nur, was nötig ist. Ohne Termin, Preis vorab.`,
		sub: (n) => `Unscharfe Fotos oder gesprungenes Kameraglas? Wir prüfen und reparieren die Kamera Ihres ${n}.`,
		signs: [
			{ icon: "ph:camera", title: "Unscharfe Bilder", text: "Der Fokus sitzt nicht mehr." },
			{ icon: "ph:warning-circle", title: "Flecken im Bild", text: "Staub oder Schmutz hinter dem Linsenglas." },
			{ icon: "ph:cards", title: "Kameraglas gesprungen", text: "Die Abdeckung der Linse ist beschädigt." },
			{ icon: "ph:x", title: "Schwarzes Kamerabild", text: "Die Kamera-App zeigt kein Bild." },
		],
		steps: (n) => common(n, "Wir tauschen Kameraglas oder Kameramodul und prüfen Fokus und Bildstabilisierung."),
		faq: (n) => [
			{ q: `Was kostet eine ${n} Kamera Reparatur?`, a: "Das hängt davon ab, ob nur das Glas oder das Modul getauscht wird. Den Preis nennen wir vorab." },
			{ q: "Reicht es, nur das Kameraglas zu tauschen?", a: "Oft ja. Wir prüfen zuerst, ob das Modul selbst intakt ist, und tauschen nur, was nötig ist." },
			{ q: "Bleiben meine Fotos bei der Kamera Reparatur erhalten?", a: `Ja. Fotos und Daten bleiben auf Ihrem ${n}. Ein aktuelles Backup empfehlen wir trotzdem.` },
			termin(n, "Kamera Reparatur"),
		],
	},
	ladebuchse: {
		slug: "ladeanschluss-reparatur",
		label: "Ladeanschluss Reparatur",
		title: (n) => `${n} lädt nicht? Ladeanschluss Reparatur Wien`,
		desc: (n) => `${n} lädt nicht mehr oder nur mit Wackeln? Ladeanschluss Reparatur in Wien: Reinigung oder Tausch, Laden und Daten geprüft. Ohne Termin, Preis vorab.`,
		sub: (n) => `Lädt Ihr ${n} nur noch mit Wackeln oder gar nicht? Oft reicht eine Reinigung, sonst tauschen wir den Anschluss.`,
		signs: [
			{ icon: "ph:plug", title: "Lädt nur in einem Winkel", text: "Das Kabel muss gehalten werden." },
			{ icon: "ph:x", title: "Lädt gar nicht", text: "Keine Reaktion beim Anstecken." },
			{ icon: "ph:warning-circle", title: "Kabel sitzt locker", text: "Der Stecker rastet nicht mehr ein." },
			{ icon: "ph:speaker-high", title: "Mikrofon leise", text: "Bei vielen Modellen sitzt es am selben Bauteil." },
		],
		steps: (n) => common(n, "Wir reinigen den Anschluss professionell oder tauschen das Bauteil und prüfen Laden und Daten."),
		faq: (n) => [
			{ q: `Was kostet eine ${n} Ladeanschluss Reparatur?`, a: "Eine Reinigung ist günstiger als ein Tausch. Was nötig ist und was es kostet, sagen wir Ihnen nach der Prüfung." },
			{ q: `Mein ${n} lädt nicht. Liegt es am Ladeanschluss?`, a: "Oft sitzen Fusseln oder Schmutz im Anschluss, manchmal liegt es an Kabel oder Netzteil. Wir prüfen das und sagen Ihnen, was wirklich nötig ist." },
			{ q: "Kann ich den Anschluss selbst reinigen?", a: "Lieber nicht mit spitzen Gegenständen, die Kontakte sind empfindlich. Wir reinigen ihn sicher." },
			termin(n, "Ladeanschluss Reparatur"),
		],
	},
	tastatur: {
		slug: "tastatur-reparatur",
		label: "Tastatur Reparatur",
		title: (n) => `${n} Tasten klemmen? Tastatur & Trackpad Wien`,
		desc: (n) => `${n} Tastatur Reparatur in Wien: klemmende Tasten, Flüssigkeitsschaden oder Trackpad ohne Klick. Einzelne Tasten oder komplett. Preis vorab.`,
		sub: (n) => `Klemmende Tasten, Flüssigkeitsschaden oder ein Trackpad ohne Klick? Wir reparieren Tastatur und Trackpad Ihres ${n}.`,
		signs: [
			{ icon: "ph:laptop", title: "Tasten klemmen", text: "Einzelne Tasten reagieren nicht oder doppelt." },
			{ icon: "ph:drop", title: "Flüssigkeit verschüttet", text: "Nach Kaffee oder Wasser funktioniert die Tastatur nicht mehr." },
			{ icon: "ph:warning-circle", title: "Trackpad ohne Klick", text: "Klick oder Gesten werden nicht erkannt." },
			{ icon: "ph:x", title: "Beleuchtung aus", text: "Die Tastaturbeleuchtung fällt aus." },
		],
		steps: (n) => common(n, "Wir reinigen, tauschen einzelne Tasten oder die ganze Tastatur und prüfen Trackpad und Beleuchtung."),
		faq: (n) => [
			{ q: `Was kostet eine ${n} Tastatur Reparatur in Wien?`, a: "Das hängt davon ab, ob einzelne Tasten oder die ganze Tastatur getauscht werden. Den Preis nennen wir vorab." },
			{ q: "Kann man auch nur einzelne Tasten tauschen?", a: "Oft ja. Wir prüfen, ob einzelne Tasten reichen oder die ganze Tastatur getauscht werden muss, und nennen Ihnen den Preis vorab." },
			{ q: "Was tun nach einem Flüssigkeitsschaden?", a: "Gerät sofort ausschalten, nicht laden und so schnell wie möglich vorbeibringen." },
			termin(n, "Tastatur Reparatur"),
		],
	},
};

export type RepairPage = { device: DeviceKey; service: ServiceKey; slug: string; path: string; copy: Copy };

export const repairPages: RepairPage[] = Object.values(devices).flatMap((d) =>
	d.repairs
		.filter((r) => COPY[r.key])
		.map((r) => ({ device: d.key, service: r.key, slug: COPY[r.key]!.slug, path: `/${d.key}/${COPY[r.key]!.slug}`, copy: COPY[r.key]! })),
);

export const findRepairPage = (device: string, slug: string) => repairPages.find((p) => p.device === device && p.slug === slug);
