import type { PlusCard } from "../components/PlusCards.astro";
import type { QA } from "../components/FAQ.astro";
import { business } from "./business";
import { de, type Device, type DeviceKey, type ServiceKey } from "./content";
import type { PhotoKey } from "./photos";

export const whyCards: PlusCard[] = [
	{
		icon: "ph:seal-check",
		pre: "Repariert mit",
		hl: "Original Apple Teilen.",
		detailTitle: "Original Apple Teile. Keine Kompromisse.",
		detail: [
			"Wir beziehen Original Apple Ersatzteile für Display, Akku und viele weitere Bauteile. So bleiben Farbtreue, Helligkeit, Touch-Gefühl und Akkulaufzeit genau so, wie Apple sie entwickelt hat.",
			"Ist für Ihr Modell oder Ihre Reparatur kein Originalteil erhältlich, sagen wir es Ihnen vorher. Ohne Ihre Zustimmung bauen wir nichts anderes ein.",
		],
	},
	{
		icon: "ph:receipt",
		pre: "Ein",
		hl: "fixer Preis",
		post: "vor jeder Reparatur.",
		detailTitle: "Erst der Preis. Dann die Reparatur.",
		detail: [
			"Bevor wir einen Schraubendreher ansetzen, wissen Sie, was die Reparatur kostet. Repariert wird erst, wenn Sie zustimmen.",
			"Sagen Sie Nein, bekommen Sie Ihr Gerät unverändert zurück. Ohne versteckte Gebühren.",
		],
	},
	{
		icon: "ph:shield-check",
		hl: `${business.warrantyMonths} Monate Garantie`,
		post: "auf Teile und Arbeit.",
		detailTitle: "Garantie, auf die Sie sich verlassen können.",
		detail: [
			`Auf jede Reparatur geben wir ${business.warrantyMonths} Monate Garantie auf das getauschte Teil und unsere Arbeit. Sollte etwas nicht stimmen, kümmern wir uns darum.`,
			"Ihre gesetzlichen Gewährleistungsrechte bleiben selbstverständlich bestehen.",
		],
	},
];

export const dataCards: PlusCard[] = [
	{
		icon: "ph:lock-simple",
		pre: "Ihre Daten bleiben",
		hl: "privat.",
		detailTitle: "Diskretion ist Teil der Reparatur.",
		detail: [
			"Für eine Reparatur brauchen wir weder Ihren Code noch Zugriff auf Fotos oder Nachrichten. Nur wenn Sie Datenrettung oder Datenübertragung beauftragen, arbeiten wir mit Ihren Daten, und das ausschließlich dafür.",
			"Rettungskopien löschen wir nach der Übergabe sicher.",
		],
	},
	{
		icon: "ph:cpu",
		pre: "Diagnose auf",
		hl: "jedem Detail.",
		detailTitle: "Wir finden den Fehler. Nicht nur das Symptom.",
		detail: [
			"Wir prüfen Display, Akku, Anschlüsse und Kamera, bevor wir etwas tauschen. So ersetzen wir nur, was wirklich defekt ist, und testen nach der Reparatur jede Funktion.",
		],
	},
	{
		icon: "ph:arrows-left-right",
		pre: "Vom alten aufs neue Gerät.",
		hl: "Vollständig.",
		detailTitle: "Alles da. Vom ersten Moment an.",
		detail: [
			"Fotos, Kontakte, Nachrichten, Apps und Einstellungen: Wir übertragen Ihre Daten auf Ihr neues iPhone, iPad oder Ihren neuen Mac und prüfen vor der Übergabe, dass alles angekommen ist.",
		],
	},
];

export const steps = [
	{ n: "01", title: "Anfragen.", text: "Gerät und Problem im Formular angeben. Wir melden uns mit einer ersten Einschätzung. Sie können auch direkt vorbeikommen." },
	{ n: "02", title: "Vorbeikommen.", text: "Ohne Termin an einen unserer Standorte in Wien und Umgebung. Ist das Teil lagernd, ist Ihr Gerät oft in rund einer Stunde fertig." },
	{ n: "03", title: "Preis vorab.", text: "Nach der Diagnose kennen Sie den genauen Preis. Repariert wird erst, wenn Sie zustimmen." },
	{ n: "04", title: "Wie neu abholen.", text: "Getestet, gereinigt und mit Garantie. Sie zahlen erst bei Abholung." },
];

export const homeFaq: QA[] = [
	{ q: "Wo kann ich mein iPhone in Wien reparieren lassen?", a: "An unseren Standorten in Wien und Umgebung, unter anderem am Wiener Hauptbahnhof. Kommen Sie einfach ohne Termin vorbei oder stellen Sie vorab online eine Anfrage. Ist das Teil lagernd, ist ein Display- oder Akkutausch oft in rund einer Stunde erledigt." },
	{ q: "Verwenden Sie Original Apple Teile?", a: "Ja. Wir verwenden Original Apple Ersatzteile, sofern Apple sie für Ihr Modell und die jeweilige Reparatur bereitstellt. Ist das nicht der Fall, besprechen wir die Alternative vorher mit Ihnen." },
	{ q: "Was kostet eine iPhone Reparatur?", a: "Das hängt von Modell und Schaden ab. Die Fixpreise für jedes iPhone und iPad Modell finden Sie auf der jeweiligen Modellseite, zum Beispiel unter iPhone Reparatur › Wählen Sie Ihr iPhone. Repariert wird erst, wenn Sie zustimmen." },
	{ q: "Bleiben meine Daten bei der Reparatur erhalten?", a: "Bei Display-, Rückglas- und Akkureparaturen bleiben Ihre Daten auf dem Gerät. Wir empfehlen trotzdem vorab ein Backup in iCloud oder auf Ihrem Computer." },
	{ q: "Sind Sie ein Apple Store oder Apple Partner?", a: "Nein. Apfelreparatur ist ein unabhängiger Reparaturbetrieb in Wien und steht in keiner Verbindung zu Apple Inc. Wir sind auf Apple Geräte spezialisiert und arbeiten mit Original Apple Teilen." },
	{ q: "Gibt es Garantie auf die Reparatur?", a: `Ja, ${business.warrantyMonths} Monate auf getauschte Teile und unsere Arbeit. Ihre gesetzlichen Gewährleistungsrechte bleiben bestehen.` },
];


const photoFor: Partial<Record<ServiceKey, PhotoKey>> = {
	display: "display",
	rueckglas: "rueckglas",
	akku: "akku",
	kamera: "schraube",
	ladebuchse: "labor",
	tastatur: "mac",
	datenrettung: "daten",
};

export function repairPhoto(device: DeviceKey, service: ServiceKey): PhotoKey {
	if (device === "ipad" && service === "display") return "ipad";
	if (device === "apple-watch") return service === "akku" ? "watch-akku" : "watch-display";
	if (device === "mac" && service === "display") return "mac-hero";
	if (device === "mac" && service === "akku") return "werkstatt";
	return photoFor[service] ?? "werkstatt";
}

export function deviceFaq(d: Device): QA[] {
	const n = d.name;
	const g = de(n);
	return [
		{ q: `Wo lasse ich ${g.mein} ${n} in Wien reparieren?`, a: `An unseren Standorten in Wien und Umgebung, unter anderem am Wiener Hauptbahnhof. Kommen Sie ohne Termin vorbei oder stellen Sie vorab online eine Anfrage. Sie bringen ${g.ihr} ${n} vorbei und holen ${g.es} repariert wieder ab.` },
		{ q: `Was kostet eine ${n} Reparatur?`, a: d.key === "iphone" || d.key === "ipad" ? `Das hängt vom Modell ab. Oben unter „Wählen Sie Ihr ${n}“ finden Sie die Fixpreise für jedes Modell, mit Original Apple Teilen oder als günstigere Alternative.` : `Der Preis hängt von Modell und Schaden ab. Den Preis nennen wir Ihnen nach der Diagnose, vor der Reparatur. Repariert wird erst nach Ihrer Zustimmung.` },
		{ q: `Wie lange dauert die Reparatur?`, a: `Ist das Teil lagernd, ist ein Display- oder Akkutausch oft in rund einer Stunde erledigt. Bei aufwendigeren Reparaturen nennen wir Ihnen die Dauer mit dem Kostenvoranschlag.` },
		{ q: `Werden Original Apple Teile verbaut?`, a: `Ja, sofern Apple das Teil für Ihr Modell bereitstellt. Ansonsten besprechen wir die Alternative vorab mit Ihnen.` },
		{ q: `Bleiben meine Daten erhalten?`, a: `Bei Hardware-Reparaturen wie Display oder Akku bleiben Ihre Daten auf ${g.dem} ${n}. Ein aktuelles Backup empfehlen wir trotzdem.` },
		{ q: `Welche Garantie bekomme ich?`, a: `${business.warrantyMonths} Monate auf getauschte Teile und unsere Arbeit. Ihre gesetzlichen Gewährleistungsrechte bleiben bestehen.` },
	];
}
