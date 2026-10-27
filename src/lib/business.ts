// Single source for company facts. Apfelreparatur is a brand of Mobi GmbH (MobiNil); name the company only where the law requires it
// (Impressum, Datenschutz, AGB, Widerruf, mail footer), never in marketing copy.
export const business = {
	brand: "Apfelreparatur",
	domain: "apfelreparatur.at",
	legalName: "Mobi GmbH",
	legalForm: "Gesellschaft mit beschränkter Haftung",
	seat: "Vösendorf",
	street: "SCS Allee 4",
	zip: "2331",
	city: "Vösendorf",
	country: "Österreich",
	phone: "+43 1 399 23 49",
	email: "office@apfelreparatur.at",
	// Free service hotline shared with the operator's stores.
	hotline: "0800 999 197",
	whatsapp: "+43 664 99022282",
	vatId: "ATU68056505",
	registerNo: "FN 397203y",
	registerCourt: "Landesgericht Wiener Neustadt",
	trades: [
		"Austausch von Standardindustriekomponenten von Personalcomputern unter Ausschluss der den Mechatronikern für Elektronik, Büro- und EDV-Systemtechnik vorbehaltenen Tätigkeiten (GISA 34729168)",
		"Handelsgewerbe mit Ausnahme der reglementierten Handelsgewerbe (GISA 13734114)",
	],
	authority: "Bezirkshauptmannschaft Mödling",
	chamber: "Wirtschaftskammer Niederösterreich",
	warrantyMonths: 6,
};

export type Location = {
	name: string;
	venue: string;
	street: string;
	zip: string;
	city: string;
	phone?: string;
	hours: [string, string][];
	lat: number;
	lng: number;
};

// Snapshot of the stores (2026-10-24); live data comes from src/lib/mobinil.ts, this is only the fallback.
export const fallbackLocations: Location[] = [
	{
		name: "Wien Hauptbahnhof",
		venue: "BahnhofCity Wien Hauptbahnhof, Erdgeschoss",
		street: "Am Hauptbahnhof 1, Top 133",
		zip: "1100",
		city: "Wien",
		phone: "+43 1 600 73 06",
		hours: [["Mo – Fr", "09:00 – 21:00"], ["Sa – So", "09:00 – 18:00"]],
		lat: 48.18449,
		lng: 16.37634,
	},
	{
		name: "Wien Hauptbahnhof",
		venue: "BahnhofCity Wien Hauptbahnhof, Untergeschoss",
		street: "Am Hauptbahnhof 1, Top 117",
		zip: "1100",
		city: "Wien",
		phone: "+43 1 602 39 77",
		hours: [["Mo – Fr", "09:00 – 21:00"], ["Sa", "09:00 – 18:00"]],
		lat: 48.18432,
		lng: 16.37661,
	},
	{
		name: "Shopping City Süd",
		venue: "Westfield Shopping City Süd, Eingang 4",
		street: "SCS-Allee 224/155",
		zip: "2334",
		city: "Vösendorf",
		phone: "+43 1 699 19 00",
		hours: [["Mo – Mi", "09:00 – 19:00"], ["Do – Fr", "09:00 – 20:00"], ["Sa", "09:00 – 18:00"]],
		lat: 48.10952,
		lng: 16.31774,
	},
	{
		name: "Shopping City Süd",
		venue: "Westfield Shopping City Süd, Eingang 7",
		street: "Allee 4, Erdgeschoss",
		zip: "2334",
		city: "Vösendorf",
		phone: "+43 1 609 23 66",
		hours: [["Mo – Mi", "09:00 – 19:00"], ["Do – Fr", "09:00 – 20:00"], ["Sa", "09:00 – 18:00"]],
		lat: 48.10991,
		lng: 16.31712,
	},
	{
		name: "G3 Gerasdorf",
		venue: "G3 Shopping Resort, Eingang B",
		street: "G3 Platz 1, Top E127A",
		zip: "2201",
		city: "Gerasdorf bei Wien",
		phone: "+43 2246 277 49",
		hours: [["Mo – Mi", "09:30 – 19:00"], ["Do – Fr", "09:30 – 20:00"], ["Sa", "09:00 – 18:00"]],
		lat: 48.34326,
		lng: 16.46181,
	},
];

export const address = `${business.street}, ${business.zip} ${business.city}`;
export const legalLine = `${business.legalName}, ${address}, ${business.registerNo}, ${business.registerCourt}`;

export const telHref = (n: string) => `tel:${n.replace(/[^\d+]/g, "")}`;
export const whatsappHref = `https://wa.me/${business.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Hallo, ich habe eine Frage")}`;
