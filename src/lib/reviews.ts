// Hand-entered from the MobiNil Google Maps + Trustpilot profiles. Quotes verbatim, shortened only with "…".
export const reviewsAsOf = "November 2026";

export const ratings = {
	google: {
		score: 4.3,
		count: 1353,
		stores: [
			{ name: "Wien Hauptbahnhof", score: 4.2, count: 560 },
			{ name: "Shopping City Süd – Eingang 4", score: 4.4, count: 430 },
			{ name: "Shopping City Süd – Eingang 7", score: 4.6, count: 149 },
			{ name: "G3 Gerasdorf", score: 4.4, count: 214 },
		],
	},
	trustpilot: {
		score: 4.5,
		count: 106,
		url: "https://at.trustpilot.com/review/www.mobinil.at",
	},
};

export type Review = { author: string; store: string; month: string; stars: number; source: "Google"; text: string };

export const reviews: Review[] = [
	{
		author: "Jaqueline Redak",
		store: "Wien Hauptbahnhof",
		month: "August 2026",
		stars: 5,
		source: "Google",
		text: "… Sie war sehr freundlich und hat uns sogar auf ein Problem hingewiesen, das wir übersehen hatten und uns dafür auch verschiedene Lösungen angeboten. … Sehr nett, höflich, humorvoll und kompetent. So wie man es sich wünscht!",
	},
	{
		author: "Ju Ha",
		store: "G3 Gerasdorf",
		month: "Juni 2026",
		stars: 5,
		source: "Google",
		text: "Guter Service und angenehme Beratung. Es wurde sich Zeit genommen, mein Anliegen zu erklären und mir verschiedene Optionen aufzuzeigen. Ich habe mich gut beraten gefühlt. Insgesamt eine positive Erfahrung.",
	},
	{
		author: "Niko Brickner",
		store: "Shopping City Süd – Eingang 4",
		month: "Mai 2026",
		stars: 5,
		source: "Google",
		text: "Akku war nach zwei Jahren total schwach, Austausch ging schneller als gedacht. Seitdem hält das Handy wieder locker den ganzen Tag, also hat sich gelohnt.",
	},
	{
		author: "Rik van Dartel",
		store: "Shopping City Süd – Eingang 4",
		month: "April 2026",
		stars: 5,
		source: "Google",
		text: "Meine Erfahrung war sehr positiv. Ich wurde im Vorfeld klar informiert, und die Kommunikation war hervorragend. Ich bin sehr zufrieden mit dem neuen Display meines Handys, und alle meine Dateien sind erhalten geblieben. Die Reparatur wurde zudem sehr schnell erledigt.",
	},
];

export const decimal = (n: number) => n.toFixed(1).replace(".", ",");
// de-AT ICU groups with a narrow space; the site writes 1.353.
export const thousands = (n: number) => String(n).replace(/\B(?=(\d{3})+$)/g, ".");
