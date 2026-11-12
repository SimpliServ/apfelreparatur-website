// Federal-state pages /iphone-reparieren-<land> (owner 2026-11-12: rank in all of Austria, focus Wien, NÖ, Burgenland).
// Keywords stay apart from mobinil.at ("Handyreparatur/iPhone Reparatur <Land>") and laptopreparaturwien.at ("Laptop Reparatur <Land>").
// Copy is hand-written per state. Distances are straight lines from the store coordinates in business.ts, so they cannot drift
// from the store data. Repairs are only done in the stores (no repair mail-in on this site); the Ankauf form does take parcels.
import { business, fallbackLocations, type Location } from "./business";
import type { QA } from "../components/FAQ.astro";

type StoreKey = "hbf" | "scs" | "g3";
export const STORES: Record<StoreKey, string> = { hbf: "Wien Hauptbahnhof", scs: "Shopping City Süd", g3: "G3 Gerasdorf" };
// Distance table on phones.
const SHORT: Record<StoreKey, string> = { hbf: "Wien Hbf", scs: "SCS", g3: "G3" };
const at = (k: StoreKey) => fallbackLocations.find((l) => l.name === STORES[k])!;

// Town centres (town hall / main square), WGS84.
const TOWNS: Record<string, [number, number]> = {
	"Wien-Favoriten": [48.1747, 16.378],
	Stephansplatz: [48.2085, 16.3731],
	"Wien-Hietzing": [48.1875, 16.3036],
	"Wien-Ottakring": [48.2125, 16.311],
	"Wien-Simmering": [48.17, 16.42],
	"Wien-Döbling": [48.244, 16.341],
	"Wien-Liesing": [48.135, 16.283],
	"Wien-Floridsdorf": [48.2565, 16.3995],
	"Wien-Donaustadt": [48.2436, 16.44],
	Stammersdorf: [48.306, 16.406],
	Mödling: [48.0858, 16.2836],
	Perchtoldsdorf: [48.119, 16.266],
	Baden: [48.005, 16.231],
	"Wiener Neustadt": [47.8151, 16.2464],
	Neunkirchen: [47.721, 16.081],
	Schwechat: [48.14, 16.47],
	"Bruck an der Leitha": [48.025, 16.779],
	Klosterneuburg: [48.305, 16.325],
	Korneuburg: [48.345, 16.333],
	Stockerau: [48.386, 16.211],
	Wolkersdorf: [48.383, 16.517],
	"Deutsch-Wagram": [48.299, 16.565],
	Gänserndorf: [48.339, 16.72],
	Mistelbach: [48.57, 16.577],
	Hollabrunn: [48.563, 16.08],
	Tulln: [48.329, 16.058],
	"St. Pölten": [48.2047, 15.6256],
	Krems: [48.41, 15.61],
	Melk: [48.227, 15.331],
	Horn: [48.664, 15.656],
	Zwettl: [48.605, 15.168],
	Amstetten: [48.123, 14.872],
	Eisenstadt: [47.8456, 16.5233],
	"Neufeld an der Leitha": [47.865, 16.375],
	Siegendorf: [47.78, 16.54],
	Mattersburg: [47.7369, 16.397],
	Rust: [47.802, 16.672],
	Purbach: [47.913, 16.697],
	"Neusiedl am See": [47.9486, 16.8418],
	Parndorf: [47.999, 16.861],
	Bruckneudorf: [48.018, 16.786],
	Podersdorf: [47.854, 16.839],
	Frauenkirchen: [47.836, 16.923],
	Oberpullendorf: [47.503, 16.505],
	Pinkafeld: [47.372, 16.122],
	Oberwart: [47.288, 16.203],
	Güssing: [47.059, 16.324],
	Jennersdorf: [46.938, 16.141],
	Graz: [47.0707, 15.4395],
	Mürzzuschlag: [47.607, 15.673],
	Kapfenberg: [47.444, 15.293],
	"Bruck an der Mur": [47.4106, 15.269],
	Leoben: [47.3765, 15.091],
	Hartberg: [47.281, 15.97],
	Weiz: [47.219, 15.622],
	Fürstenfeld: [47.05, 16.08],
	Feldbach: [46.953, 15.889],
	Leibnitz: [46.782, 15.538],
	Judenburg: [47.172, 14.66],
	Linz: [48.3069, 14.2858],
	Enns: [48.213, 14.476],
	Perg: [48.25, 14.633],
	Steyr: [48.0427, 14.4213],
	Freistadt: [48.511, 14.504],
	Wels: [48.1575, 14.0289],
	Gmunden: [47.918, 13.799],
	Vöcklabruck: [48.004, 13.656],
	"Ried im Innkreis": [48.21, 13.488],
	Schärding: [48.456, 13.431],
	"Braunau am Inn": [48.258, 13.034],
	Salzburg: [47.8095, 13.055],
	Seekirchen: [47.9, 13.133],
	Hallein: [47.683, 13.097],
	Bischofshofen: [47.417, 13.219],
	Radstadt: [47.383, 13.46],
	"Zell am See": [47.323, 12.796],
	Saalfelden: [47.426, 12.848],
	Tamsweg: [47.128, 13.811],
	Wolfsberg: [46.841, 14.844],
	Völkermarkt: [46.662, 14.635],
	"St. Veit an der Glan": [46.768, 14.36],
	Klagenfurt: [46.6247, 14.3053],
	Feldkirchen: [46.724, 14.092],
	Villach: [46.6103, 13.8558],
	"Spittal an der Drau": [46.799, 13.495],
	Kufstein: [47.583, 12.17],
	Wörgl: [47.489, 12.061],
	Kitzbühel: [47.446, 12.392],
	Schwaz: [47.351, 11.708],
	"Hall in Tirol": [47.283, 11.508],
	Innsbruck: [47.2692, 11.4041],
	Telfs: [47.307, 11.072],
	Imst: [47.245, 10.74],
	Landeck: [47.14, 10.567],
	Reutte: [47.485, 10.718],
	Lienz: [46.829, 12.769],
	Bregenz: [47.5031, 9.7471],
	Lustenau: [47.426, 9.658],
	Dornbirn: [47.4125, 9.7417],
	Hohenems: [47.366, 9.688],
	Feldkirch: [47.238, 9.598],
	Bludenz: [47.155, 9.822],
};

function dist(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
	const r = Math.PI / 180;
	const x = (b.lng - a.lng) * r * Math.cos(((a.lat + b.lat) / 2) * r);
	const y = (b.lat - a.lat) * r;
	return Math.sqrt(x * x + y * y) * 6371;
}
const pt = (town: string) => ({ lat: TOWNS[town][0], lng: TOWNS[town][1] });
const round = (v: number) => (v < 100 ? Math.round(v) : Math.round(v / 5) * 5);

/** Rounded straight-line km from a town to a store. */
export const km = (town: string, store: StoreKey) => round(dist(pt(town), at(store)));
const rund = (town: string, store: StoreKey) => `rund ${km(town, store)} km`;

export function nearest(town: string) {
	const [k] = (Object.keys(STORES) as StoreKey[]).sort((a, b) => dist(pt(town), at(a)) - dist(pt(town), at(b)));
	return { store: STORES[k], short: SHORT[k], km: km(town, k) };
}

type Ctx = { sunday: Location[] };

const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
// Hours labels look like "Mo – Fr", "Sa – So" or "Mo, Mi".
export const opensSunday = (l: Location) =>
	l.hours.some(([label]) =>
		label.split(", ").some((part) => {
			const [from, to = from] = part.split(" – ").map((d) => DAYS.indexOf(d.trim()));
			return from <= 6 && 6 <= to;
		}),
	);

export type Region = {
	slug: string;
	name: string;
	/** "in Wien", "im Burgenland", "in der Steiermark". */
	inName: string;
	wikidata: string;
	center: [number, number];
	title: string;
	description: string;
	lead: string;
	/** Towns for the distance table, north to south or by importance. */
	towns: string[];
	guide: { h: string; p: string[] }[];
	faq: (c: Ctx) => QA[];
};

const sundayText = ({ sunday }: Ctx, no: string) =>
	sunday.length ? `Sonntags hat ${sunday.map((l) => `unser Standort ${l.name}${/geschoss/.test(l.venue) ? ` im ${l.venue.split(", ").find((x) => x.includes("geschoss"))}` : ""}`).join(" und ")} geöffnet.` : no;

const W = business.warrantyMonths;

export const regions: Region[] = [
	{
		slug: "wien",
		name: "Wien",
		inName: "in Wien",
		wikidata: "Q1741",
		center: [48.2082, 16.3738],
		title: "iPhone reparieren lassen in Wien: Hauptbahnhof, SCS, G3",
		description: "iPhone reparieren lassen in Wien ohne Termin: zwei Standorte am Hauptbahnhof, dazu SCS und G3 am Stadtrand. Auch iPad, MacBook und Apple Watch.",
		lead: "Mitten in der Stadt am Hauptbahnhof, im Süden in der Shopping City Süd und im Norden im G3 Gerasdorf. Sie kommen ohne Termin, erfahren den Preis vor der Reparatur, und ein Display oder eine Batterie ist oft in rund einer Stunde getauscht.",
		towns: ["Stephansplatz", "Wien-Favoriten", "Wien-Simmering", "Wien-Hietzing", "Wien-Ottakring", "Wien-Döbling", "Wien-Floridsdorf", "Wien-Donaustadt", "Stammersdorf", "Wien-Liesing"],
		guide: [
			{
				h: "Am Hauptbahnhof: zwei Standorte in der BahnhofCity",
				p: [
					`Am Hauptbahnhof halten die U1, die S-Bahn, die Straßenbahnlinien D, O und 18 und alle Fernzüge. Unsere zwei Standorte liegen in der BahnhofCity, einer im Erdgeschoss und einer im Untergeschoss. Sie geben Ihr iPhone ab, ohne den Bahnhof zu verlassen.`,
					`Vom Stephansplatz sind es ${rund("Stephansplatz", "hbf")}, aus Simmering ${rund("Wien-Simmering", "hbf")} und aus Hietzing ${rund("Wien-Hietzing", "hbf")}. Für die meisten Bezirke ist der Hauptbahnhof damit der kürzeste Weg zu uns.`,
				],
			},
			{
				h: "Liesing und der Süden: Shopping City Süd",
				p: [
					`Aus Liesing ist die Shopping City Süd in Vösendorf mit ${rund("Wien-Liesing", "scs")} am nächsten, gleich hinter der Stadtgrenze. Dort finden Sie uns bei Eingang 4 und bei Eingang 7, geparkt wird direkt am Einkaufszentrum.`,
				],
			},
			{
				h: "Floridsdorf und Donaustadt: G3 oder Hauptbahnhof",
				p: [
					`Aus Stammersdorf liegt das G3 Gerasdorf mit ${rund("Stammersdorf", "g3")} am nächsten, Sie finden uns dort bei Eingang B. Aus Floridsdorf und der Donaustadt sind Hauptbahnhof und G3 ähnlich weit entfernt. Die U1 fährt von Leopoldau über Kagran ohne Umsteigen bis zum Hauptbahnhof.`,
				],
			},
		],
		faq: (c) => [
			{ q: "Wo kann ich mein iPhone in Wien ohne Termin reparieren lassen?", a: "Am Hauptbahnhof in der BahnhofCity (Erdgeschoss und Untergeschoss), in der Shopping City Süd direkt an der Stadtgrenze und im G3 Gerasdorf. Kommen Sie während der Öffnungszeiten an einen unserer Standorte." },
			{ q: "Kann ich mein iPhone in Wien auch am Sonntag reparieren lassen?", a: sundayText(c, "Sonntags sind unsere Standorte geschlossen. Von Montag bis Samstag kommen Sie ohne Termin vorbei.") },
			{ q: "Welcher Standort ist von Liesing oder Stammersdorf aus am nächsten?", a: `Aus Liesing die Shopping City Süd in Vösendorf, ${rund("Wien-Liesing", "scs")} Luftlinie. Aus Stammersdorf das G3 Gerasdorf, ${rund("Stammersdorf", "g3")}. Aus den inneren Bezirken ist der Hauptbahnhof am schnellsten erreicht.` },
			{ q: "Reparieren Sie in Wien auch iPad, MacBook und Apple Watch?", a: "Ja, an allen Standorten. Für iPhone und iPad gilt ein Fixpreis je Modell, er steht auf der jeweiligen Modellseite. Beim MacBook und iMac nennen wir den Preis nach der Diagnose. Repariert wird immer erst nach Ihrer Zustimmung." },
		],
	},
	{
		slug: "niederoesterreich",
		name: "Niederösterreich",
		inName: "in Niederösterreich",
		wikidata: "Q42497",
		center: [48.2, 15.95],
		title: "iPhone reparieren lassen in Niederösterreich: SCS & G3",
		description: "Apple Reparatur in Niederösterreich: iPhone, iPad und MacBook in der SCS Vösendorf oder im G3 Gerasdorf reparieren lassen. Ohne Termin, Preis vor der Reparatur.",
		lead: "Zwei unserer Standorte liegen in Niederösterreich: die Shopping City Süd in Vösendorf an der Südautobahn und das G3 Shopping Resort in Gerasdorf nördlich von Wien. Parkplatz vor der Tür, kein Termin, und der Preis steht vor der Reparatur fest.",
		towns: ["Mödling", "Baden", "Wiener Neustadt", "Neunkirchen", "Schwechat", "Klosterneuburg", "Korneuburg", "Wolkersdorf", "Gänserndorf", "Mistelbach", "Hollabrunn", "Tulln", "St. Pölten", "Krems", "Amstetten"],
		guide: [
			{
				h: "Industrieviertel und Thermenregion: Shopping City Süd",
				p: [
					`Aus Mödling sind es ${rund("Mödling", "scs")} bis zur Shopping City Süd, aus Baden ${rund("Baden", "scs")}, aus Wiener Neustadt ${rund("Wiener Neustadt", "scs")} und aus Neunkirchen ${rund("Neunkirchen", "scs")}. Die Südautobahn führt direkt am Einkaufszentrum vorbei.`,
					"In der SCS haben wir zwei Standorte, bei Eingang 4 und bei Eingang 7. Beide reparieren iPhone, iPad, Mac und Apple Watch.",
				],
			},
			{
				h: "Weinviertel und Marchfeld: G3 Gerasdorf",
				p: [
					`Für den Norden liegt das G3 Shopping Resort näher: aus Wolkersdorf ${rund("Wolkersdorf", "g3")}, aus Korneuburg ${rund("Korneuburg", "g3")}, aus Gänserndorf ${rund("Gänserndorf", "g3")}, aus Mistelbach ${rund("Mistelbach", "g3")} und aus Hollabrunn ${rund("Hollabrunn", "g3")}. Unser Standort ist bei Eingang B.`,
				],
			},
			{
				h: "St. Pölten, Mostviertel und Waldviertel",
				p: [
					`Aus St. Pölten erreichen Sie die SCS über die A1 und den Wiener Außenring (A21), ${rund("St. Pölten", "scs")} Luftlinie. Wer mit dem Railjet fährt, steigt am Wien Hauptbahnhof aus, dort sind wir in der BahnhofCity.`,
					`Aus Krems (${rund("Krems", "scs")}), Horn, Zwettl oder Amstetten (${rund("Amstetten", "scs")}) ist der Weg länger. Den Fixpreis für Ihr iPhone oder iPad sehen Sie vorab auf der Modellseite, andere Fragen beantworten wir per WhatsApp.`,
				],
			},
		],
		faq: () => [
			{ q: "Wo kann ich mein iPhone in Niederösterreich reparieren lassen?", a: "In der Shopping City Süd in Vösendorf (Eingang 4 und Eingang 7) und im G3 Shopping Resort in Gerasdorf (Eingang B). Ein Termin ist nicht nötig, kommen Sie einfach an einen unserer Standorte." },
			{ q: "Gibt es eine Apple Reparatur in St. Pölten?", a: `Einen eigenen Standort in St. Pölten haben wir nicht. Am nächsten ist die Shopping City Süd, ${rund("St. Pölten", "scs")} Luftlinie. Mit dem Zug kommen Sie direkt zu unseren Standorten am Wien Hauptbahnhof.` },
			{ q: "Welcher Standort ist von Baden oder Wiener Neustadt am schnellsten erreichbar?", a: `Die Shopping City Süd: von Baden ${rund("Baden", "scs")}, von Wiener Neustadt ${rund("Wiener Neustadt", "scs")}, jeweils über die A2.` },
			{ q: "Kann ich in der SCS auch mein MacBook reparieren lassen?", a: "Ja. MacBook und iMac reparieren wir an allen Standorten, zum Beispiel Display, Akku oder Tastatur. Den Preis nennen wir nach der Diagnose, repariert wird erst nach Ihrer Zustimmung." },
			{ q: "Gibt es bei der SCS und beim G3 Parkplätze?", a: "Ja. Beide Einkaufszentren haben große Parkflächen direkt vor dem Haus." },
		],
	},
	{
		slug: "burgenland",
		name: "Burgenland",
		inName: "im Burgenland",
		wikidata: "Q43210",
		center: [47.6, 16.45],
		title: "iPhone reparieren lassen im Burgenland: nächster Shop SCS",
		description: `iPhone, iPad oder MacBook aus dem Burgenland reparieren lassen: Shopping City Süd ${rund("Eisenstadt", "scs")} von Eisenstadt, Wien Hbf nah für den Bezirk Neusiedl. Ohne Termin.`,
		lead: `Im Burgenland haben wir keinen eigenen Standort, die Wege sind trotzdem kurz: Aus Eisenstadt sind es ${rund("Eisenstadt", "scs")} Luftlinie bis zur Shopping City Süd, aus dem Bezirk Neusiedl liegt der Wien Hauptbahnhof ähnlich nah. Ohne Termin, mit Preis vor der Reparatur.`,
		towns: ["Eisenstadt", "Neufeld an der Leitha", "Siegendorf", "Mattersburg", "Rust", "Purbach", "Neusiedl am See", "Parndorf", "Bruckneudorf", "Podersdorf", "Frauenkirchen", "Oberpullendorf", "Pinkafeld", "Oberwart", "Güssing", "Jennersdorf"],
		guide: [
			{
				h: "Eisenstadt, Mattersburg, Rust: über die A3 zur SCS",
				p: [
					`Die A3 bringt Sie von Eisenstadt bis an die Südautobahn, die Shopping City Süd liegt wenige Kilometer weiter nördlich. Aus Neufeld an der Leitha sind es ${rund("Neufeld an der Leitha", "scs")}, aus Siegendorf ${rund("Siegendorf", "scs")}, aus Mattersburg ${rund("Mattersburg", "scs")} und aus Rust ${rund("Rust", "scs")}.`,
					"In der SCS finden Sie uns bei Eingang 4 und bei Eingang 7. Ein Display- oder Batterietausch am iPhone ist oft in rund einer Stunde erledigt, Sie warten im Einkaufszentrum und fahren mit dem reparierten Gerät heim.",
				],
			},
			{
				h: "Bezirk Neusiedl: Hauptbahnhof oder SCS",
				p: [
					`Aus Bruckneudorf und Parndorf ist der Wien Hauptbahnhof knapp näher als die SCS, ${rund("Bruckneudorf", "hbf")} und ${rund("Parndorf", "hbf")}. Über die A4 kommen Sie bis an den Stadtrand, mit dem Zug aus Neusiedl am See zum Hauptbahnhof, in dem unsere zwei Standorte liegen.`,
					`Vom Seewinkel aus nehmen sich beide Ziele wenig: Podersdorf liegt ${rund("Podersdorf", "scs")} von der SCS und ${rund("Podersdorf", "hbf")} vom Hauptbahnhof entfernt.`,
				],
			},
			{
				h: "Mittel- und Südburgenland",
				p: [
					`Aus Oberpullendorf sind es ${rund("Oberpullendorf", "scs")}, aus Oberwart ${rund("Oberwart", "scs")} und aus Güssing ${rund("Güssing", "scs")} bis zur SCS. Aus dem Süden kommen Sie über die A2 ohne Umweg in Vösendorf an.`,
					"Bevor Sie losfahren, schicken Sie uns Modell und Schaden per WhatsApp. Den Fixpreis für iPhone und iPad finden Sie auch auf der Modellseite.",
				],
			},
		],
		faq: () => [
			{ q: "Kann ich mein iPhone in Eisenstadt reparieren lassen?", a: `In Eisenstadt selbst haben wir keinen Standort. Am nächsten ist die Shopping City Süd in Vösendorf, ${rund("Eisenstadt", "scs")} Luftlinie, über die A3 und die A2 erreichbar.` },
			{ q: "Welcher Standort ist vom Neusiedler See aus am nächsten?", a: `Das hängt vom Ort ab. Neusiedl am See liegt ${rund("Neusiedl am See", "scs")} von der SCS und ${rund("Neusiedl am See", "hbf")} vom Wien Hauptbahnhof entfernt, Parndorf und Bruckneudorf etwas näher am Hauptbahnhof.` },
			{ q: "Lohnt sich die Fahrt aus Oberwart oder Güssing?", a: "Ein Display- oder Batterietausch ist oft in rund einer Stunde fertig, Sie fahren also meist mit dem reparierten iPhone zurück. Fragen Sie vorher per WhatsApp, was für Ihr Modell nötig ist." },
			{ q: "Brauche ich aus dem Burgenland einen Termin?", a: "Nein. Sie kommen während der Öffnungszeiten an einen unserer Standorte, auch am Samstag." },
			{ q: "Reparieren Sie auch die Apple Watch?", a: "Ja, Display und Batterie, an allen Standorten. Die Preise stehen auf der Seite Apple Watch Reparatur." },
		],
	},
	{
		slug: "steiermark",
		name: "Steiermark",
		inName: "in der Steiermark",
		wikidata: "Q41358",
		center: [47.2, 15.4],
		title: "iPhone reparieren lassen in der Steiermark: A2 oder Railjet",
		description: "Apple Reparatur für die Steiermark: aus Graz über die Südautobahn zur Shopping City Süd oder per Railjet zum Wien Hbf. iPhone, iPad, MacBook, ohne Termin.",
		lead: `Von Graz führt die Südautobahn bis nach Vösendorf zur Shopping City Süd, ${rund("Graz", "scs")} Luftlinie. Mit dem Railjet steigen Sie am Wien Hauptbahnhof aus, wo zwei unserer Standorte in der BahnhofCity liegen. Ein Termin ist nicht nötig.`,
		towns: ["Mürzzuschlag", "Hartberg", "Kapfenberg", "Bruck an der Mur", "Weiz", "Fürstenfeld", "Leoben", "Graz", "Feldbach", "Leibnitz", "Judenburg"],
		guide: [
			{
				h: "Graz: auf der Südautobahn bis zur SCS",
				p: [
					"Aus Graz bleiben Sie auf der A2 bis Vösendorf. Die Shopping City Süd liegt direkt an der Autobahn, Sie müssen nicht durch die Stadt und parken vor dem Einkaufszentrum. Unsere Standorte sind bei Eingang 4 und Eingang 7.",
					"Mit dem Zug fahren die Railjets aus Graz über den Semmering zum Wien Hauptbahnhof. Dort liegen unsere Standorte im Bahnhof selbst, im Erdgeschoss und im Untergeschoss der BahnhofCity.",
				],
			},
			{
				h: "Mur- und Mürztal: entlang der Südbahn",
				p: [
					`Mürzzuschlag liegt ${rund("Mürzzuschlag", "scs")} von der SCS entfernt, Kapfenberg ${rund("Kapfenberg", "scs")}, Bruck an der Mur ${rund("Bruck an der Mur", "scs")} und Leoben ${rund("Leoben", "scs")}. Die Züge der Südbahn bringen Sie bis zum Wien Hauptbahnhof.`,
				],
			},
			{
				h: "Oststeiermark: Hartberg, Weiz, Fürstenfeld",
				p: [
					`Hartberg liegt selbst an der A2, ${rund("Hartberg", "scs")} von der SCS. Aus Weiz sind es ${rund("Weiz", "scs")}, aus Fürstenfeld ${rund("Fürstenfeld", "scs")}. Wer ohnehin nach Wien fährt, verbindet die Reparatur am besten mit diesem Weg.`,
				],
			},
		],
		faq: () => [
			{ q: "Gibt es Apfelreparatur in Graz?", a: `Nein, unser nächster Standort für Graz ist die Shopping City Süd in Vösendorf, ${rund("Graz", "scs")} Luftlinie über die A2. Mit dem Zug kommen Sie zu unseren Standorten am Wien Hauptbahnhof.` },
			{ q: "Wie lange dauert ein Displaytausch, wenn ich aus Graz anreise?", a: "Beim iPhone oft rund eine Stunde. Sie können also am selben Tag mit dem reparierten Gerät zurückfahren." },
			{ q: "Kann ich vorher fragen, ob sich die Reparatur lohnt?", a: `Ja. Per WhatsApp rund um die Uhr, über die gratis Service-Hotline ${business.hotline} oder mit dem Formular Reparatur anfragen.` },
			{ q: "Wird mein MacBook am selben Tag fertig?", a: "Das hängt vom Schaden ab. Beim Mac nennen wir Preis und Dauer nach der Diagnose, repariert wird erst nach Ihrer Zustimmung." },
		],
	},
	{
		slug: "oberoesterreich",
		name: "Oberösterreich",
		inName: "in Oberösterreich",
		wikidata: "Q41967",
		center: [48.2, 14.0],
		title: "iPhone reparieren lassen in Oberösterreich: über Westbahn & A1",
		description: "Aus Linz, Wels oder Steyr zur Apple Reparatur nach Wien: mit dem Railjet bis zum Hauptbahnhof, Standorte in der BahnhofCity. iPhone, iPad, MacBook, Preis vorab.",
		lead: `Aus Linz sind es ${rund("Linz", "hbf")} Luftlinie bis zum Wien Hauptbahnhof. Der Railjet hält dort, und unsere zwei Standorte liegen in der BahnhofCity. Mit dem Auto führt die Westautobahn über den Außenring zur Shopping City Süd.`,
		towns: ["Perg", "Enns", "Steyr", "Freistadt", "Linz", "Wels", "Gmunden", "Vöcklabruck", "Ried im Innkreis", "Schärding", "Braunau am Inn"],
		guide: [
			{
				h: "Linz, Enns, Perg: mit dem Zug in den Bahnhof",
				p: [
					"Die Railjets aus Linz fahren über St. Pölten zum Wien Hauptbahnhof. Unsere Standorte liegen im Erdgeschoss und im Untergeschoss der BahnhofCity, Sie geben Ihr iPhone ab, ohne auf die Straße zu müssen.",
					`Aus Enns sind es ${rund("Enns", "hbf")}, aus Perg ${rund("Perg", "hbf")} bis zum Hauptbahnhof.`,
				],
			},
			{
				h: "Wels, Steyr, Vöcklabruck: über die A1",
				p: [
					`Mit dem Auto nehmen Sie die Westautobahn bis zum Knoten Steinhäusl und den Außenring (A21) bis Vösendorf. Steyr liegt ${rund("Steyr", "scs")} von der SCS, Wels ${rund("Wels", "scs")} und Vöcklabruck ${rund("Vöcklabruck", "scs")}. In der SCS parken Sie direkt vor dem Haus.`,
				],
			},
			{
				h: "Mühlviertel und Innviertel",
				p: [
					`Aus Freistadt sind es ${rund("Freistadt", "scs")}, aus Ried im Innkreis ${rund("Ried im Innkreis", "scs")} und aus Braunau ${rund("Braunau am Inn", "scs")}. Für einen Batterietausch allein ist das weit. Planen Sie die Reparatur zu einem Wien-Besuch, ein Display- oder Batterietausch ist oft in rund einer Stunde erledigt.`,
					"Ein altes iPhone, iPad oder MacBook verkaufen können Sie auch ohne Anreise: Im Ankauf-Formular wählen Sie den Versand per Post.",
				],
			},
		],
		faq: () => [
			{ q: "Gibt es Apfelreparatur in Linz?", a: `Nein. Aus Linz kommen Sie am schnellsten mit dem Railjet zu unseren Standorten am Wien Hauptbahnhof, ${rund("Linz", "hbf")} Luftlinie. Mit dem Auto erreichen Sie die Shopping City Süd über die A1 und die A21.` },
			{ q: "Wo genau finde ich Sie am Wien Hauptbahnhof?", a: "In der BahnhofCity: ein Standort im Erdgeschoss, einer im Untergeschoss. Beide reparieren iPhone, iPad, Mac und Apple Watch ohne Termin." },
			{ q: "Was kostet die Reparatur?", a: "Für iPhone und iPad gilt ein Fixpreis je Modell, ohne Arbeitspauschale, er steht auf der Modellseite. Beim MacBook nennen wir den Preis nach der Diagnose. Repariert wird erst nach Ihrer Zustimmung." },
			{ q: "Kann ich mein altes iPhone aus Oberösterreich per Post verkaufen?", a: "Ja. Wählen Sie im Ankauf-Formular unter „Übergabe“ die Option „Per Post schicken“. Adresse und Ablauf für das Paket bekommen Sie danach per E-Mail." },
		],
	},
	{
		slug: "salzburg",
		name: "Salzburg",
		inName: "in Salzburg",
		wikidata: "Q43325",
		center: [47.55, 13.1],
		title: "iPhone reparieren lassen in Salzburg: Apple Reparatur in Wien",
		description: `Aus Salzburg, Hallein oder dem Pongau zur iPhone, iPad und MacBook Reparatur nach Wien: Railjet bis zum Hauptbahnhof. Ohne Termin, ${W} Monate Garantie.`,
		lead: `Die Stadt Salzburg liegt ${rund("Salzburg", "hbf")} Luftlinie vom Wien Hauptbahnhof entfernt. Wenn Sie mit dem Railjet nach Wien fahren, steigen Sie dort aus, wo wir sind: zwei Standorte in der BahnhofCity, ohne Termin und mit Preis vor der Reparatur.`,
		towns: ["Seekirchen", "Salzburg", "Hallein", "Bischofshofen", "Radstadt", "Tamsweg", "Saalfelden", "Zell am See"],
		guide: [
			{
				h: "Stadt Salzburg und Flachgau: im Railjet nach Wien",
				p: [
					`Die Railjets aus Salzburg fahren über Linz und St. Pölten bis zum Wien Hauptbahnhof. Aus Seekirchen sind es ${rund("Seekirchen", "hbf")} bis dorthin. Am Bahnhof gehen Sie in die BahnhofCity, unsere Standorte liegen im Erdgeschoss und im Untergeschoss.`,
				],
			},
			{
				h: "Tennengau, Pongau, Pinzgau und Lungau",
				p: [
					`Aus dem Süden des Landes kommen Sie über die Tauernautobahn und die Westautobahn nach Wien. Hallein liegt ${rund("Hallein", "scs")} von der Shopping City Süd, Bischofshofen ${rund("Bischofshofen", "scs")} und Zell am See ${rund("Zell am See", "scs")}. Aus dem Lungau ist es kaum kürzer: Tamsweg liegt ${rund("Tamsweg", "scs")} entfernt.`,
				],
			},
			{
				h: "Erst fragen, dann fahren",
				p: [
					"Schreiben Sie uns vorher per WhatsApp, welches Modell Sie haben und was kaputt ist. Den Fixpreis für iPhone und iPad finden Sie auch auf der Modellseite. Beim MacBook nennen wir den Preis nach der Diagnose vor Ort.",
				],
			},
		],
		faq: (c) => [
			{ q: "Kann ich mein iPhone in Salzburg bei Ihnen reparieren lassen?", a: "In Salzburg haben wir keinen Standort. Wir reparieren an unseren Standorten in Wien und Umgebung, am bequemsten für Bahnreisende am Wien Hauptbahnhof." },
			{ q: "Lohnt sich die Anreise nach Wien für eine Reparatur?", a: "Meist dann, wenn Sie ohnehin in Wien sind. Ein Display- oder Batterietausch am iPhone ist oft in rund einer Stunde erledigt und passt damit gut zwischen Ankunft und Termin." },
			{ q: "Ich bin am Wochenende in Wien. Haben Sie offen?", a: `Am Samstag haben alle unsere Standorte geöffnet. ${sundayText(c, "Sonntags sind sie geschlossen.")}` },
			{ q: "Reparieren Sie auch das iPad?", a: "Ja: Glas und Display, Akku und Ladebuchse. Für jedes iPad Modell gilt ein Fixpreis, er steht auf der Modellseite." },
		],
	},
	{
		slug: "kaernten",
		name: "Kärnten",
		inName: "in Kärnten",
		wikidata: "Q37985",
		center: [46.72, 14.2],
		title: "iPhone reparieren lassen in Kärnten: Südautobahn bis zur SCS",
		description: "iPhone, iPad und MacBook aus Kärnten reparieren lassen: Klagenfurt und Villach liegen an der A2, die bis zur Shopping City Süd führt. Ohne Termin, Preis vorab.",
		lead: `Aus Klagenfurt und Villach bringt Sie die Südautobahn bis zur Shopping City Süd in Vösendorf, ${rund("Klagenfurt", "scs")} Luftlinie ab Klagenfurt. Mit dem Railjet kommen Sie zum Wien Hauptbahnhof, wo zwei unserer Standorte in der BahnhofCity liegen.`,
		towns: ["Wolfsberg", "Völkermarkt", "St. Veit an der Glan", "Klagenfurt", "Feldkirchen", "Villach", "Spittal an der Drau"],
		guide: [
			{
				h: "Klagenfurt und Villach: einmal die A2 entlang",
				p: [
					`Die A2 verbindet Villach (${rund("Villach", "scs")}) und Klagenfurt (${rund("Klagenfurt", "scs")}) über Graz mit Vösendorf. Die Shopping City Süd liegt direkt an der Autobahn, Sie parken vor dem Haus und finden uns bei Eingang 4 und Eingang 7.`,
					"Mit der Bahn steigen Sie am Wien Hauptbahnhof aus. Unsere Standorte dort liegen im Bahnhof, Sie müssen nicht weiter in die Stadt.",
				],
			},
			{
				h: "Unterkärnten: Wolfsberg und Völkermarkt",
				p: [
					`Aus dem Lavanttal ist der Weg am kürzesten: Wolfsberg liegt ${rund("Wolfsberg", "scs")} von der SCS, Völkermarkt ${rund("Völkermarkt", "scs")} und St. Veit an der Glan ${rund("St. Veit an der Glan", "scs")}.`,
				],
			},
			{
				h: "Oberkärnten: Spittal an der Drau",
				p: [
					`Aus Spittal an der Drau sind es ${rund("Spittal an der Drau", "scs")}. Für eine Reparatur allein ist das eine weite Fahrt. Fragen Sie vorher per WhatsApp, was Ihr Gerät braucht, und verbinden Sie den Besuch mit einem Tag in Wien.`,
				],
			},
		],
		faq: () => [
			{ q: "Gibt es Apfelreparatur in Klagenfurt?", a: `Nein. Unser nächster Standort für Kärnten ist die Shopping City Süd in Vösendorf, ${rund("Klagenfurt", "scs")} Luftlinie ab Klagenfurt, über die A2.` },
			{ q: "Welcher Standort ist aus Kärnten am schnellsten erreichbar?", a: "Mit dem Auto die Shopping City Süd, sie liegt an der Südautobahn vor der Stadtgrenze. Mit dem Zug die Standorte am Wien Hauptbahnhof." },
			{ q: "Wie bezahle ich?", a: "Bei der Abholung. Vorher nennen wir Ihnen den Preis, repariert wird erst nach Ihrer Zustimmung." },
			{ q: "Welche Garantie gibt es?", a: `${W} Monate auf getauschte Teile und die Arbeit. Ihre gesetzlichen Gewährleistungsrechte bleiben davon unberührt.` },
		],
	},
	{
		slug: "tirol",
		name: "Tirol",
		inName: "in Tirol",
		wikidata: "Q42880",
		center: [47.25, 11.4],
		title: "iPhone reparieren lassen in Tirol: beim nächsten Wien-Besuch",
		description: "Aus Innsbruck, Kufstein oder Lienz: iPhone, iPad und MacBook beim nächsten Wien-Besuch reparieren lassen, direkt am Hauptbahnhof. Ohne Termin, Preis vorab.",
		lead: `Zwischen Innsbruck und dem Wien Hauptbahnhof liegen ${rund("Innsbruck", "hbf")} Luftlinie. Für eine Reparatur allein ist das weit. Kommen Sie aber ohnehin nach Wien, etwa mit dem Railjet, erledigen Sie sie in der BahnhofCity gleich nach der Ankunft.`,
		towns: ["Kufstein", "Kitzbühel", "Lienz", "Wörgl", "Schwaz", "Hall in Tirol", "Innsbruck", "Telfs", "Reutte", "Imst", "Landeck"],
		guide: [
			{
				h: "Innsbruck und das Unterinntal",
				p: [
					`Die Railjets aus Innsbruck fahren bis zum Wien Hauptbahnhof. Von Kufstein sind es ${rund("Kufstein", "hbf")} bis dorthin, von Schwaz ${rund("Schwaz", "hbf")} und von Innsbruck ${rund("Innsbruck", "hbf")}. Unsere Standorte liegen im Erdgeschoss und im Untergeschoss der BahnhofCity.`,
				],
			},
			{
				h: "Osttirol: über Kärnten nach Wien",
				p: [
					`Aus Lienz führt der Weg über Spittal und die Südautobahn, ${rund("Lienz", "scs")} Luftlinie bis zur Shopping City Süd. Die SCS liegt an der A2 vor der Stadtgrenze, Sie parken vor dem Haus.`,
				],
			},
			{
				h: "Oberland und Außerfern",
				p: [
					`Aus Imst (${rund("Imst", "hbf")}), Landeck (${rund("Landeck", "hbf")}) oder Reutte (${rund("Reutte", "hbf")}) ist Wien weit. Klären Sie Modell und Schaden vorher per WhatsApp und planen Sie die Reparatur zu einem Wien-Besuch.`,
					"Ein Gerät verkaufen können Sie auch ohne Anreise: Im Ankauf-Formular wählen Sie den Versand per Post.",
				],
			},
		],
		faq: () => [
			{ q: "Kann ich mein iPhone in Innsbruck bei Ihnen reparieren lassen?", a: "In Tirol haben wir keinen Standort. Wir reparieren an unseren Standorten in Wien und Umgebung, mit dem Zug am bequemsten am Wien Hauptbahnhof." },
			{ q: "Ich komme mit dem Zug nach Wien. Wo finde ich Sie?", a: "Direkt im Wien Hauptbahnhof, in der BahnhofCity: ein Standort im Erdgeschoss, einer im Untergeschoss." },
			{ q: "Schaffe ich die Reparatur bis zur Rückfahrt?", a: "Ein Display- oder Batterietausch am iPhone ist oft in rund einer Stunde erledigt. Beim Mac hängt die Dauer vom Schaden ab, das sagen wir Ihnen nach der Diagnose." },
			{ q: "Was sollte ich vor der Reparatur erledigen?", a: "Machen Sie ein Backup in iCloud oder am Computer und laden Sie das Gerät, wenn es noch geht. Den Rest besprechen wir bei der Abgabe." },
		],
	},
	{
		slug: "vorarlberg",
		name: "Vorarlberg",
		inName: "in Vorarlberg",
		wikidata: "Q38981",
		center: [47.3, 9.75],
		title: "iPhone reparieren lassen in Vorarlberg: Railjet bis Wien Hbf",
		description: "Von Bregenz, Dornbirn oder Feldkirch nach Wien: iPhone, iPad und MacBook ohne Termin am Hauptbahnhof reparieren lassen, Preis vorab. Ankauf auch per Post.",
		lead: `Rund ${km("Bregenz", "hbf")} km Luftlinie trennen Bregenz vom Wien Hauptbahnhof. Eine Reparatur extra dafür zu planen lohnt sich kaum, sie mit dem nächsten Wien-Besuch zu verbinden schon: Unsere zwei Standorte am Hauptbahnhof liegen direkt in der BahnhofCity.`,
		towns: ["Bregenz", "Lustenau", "Dornbirn", "Hohenems", "Feldkirch", "Bludenz"],
		guide: [
			{
				h: "Rheintal: Bregenz, Dornbirn, Hohenems",
				p: [
					`Bregenz liegt ${rund("Bregenz", "hbf")} vom Wien Hauptbahnhof entfernt, Dornbirn ${rund("Dornbirn", "hbf")}, Hohenems ${rund("Hohenems", "hbf")}. Steigen Sie am Hauptbahnhof aus, sind Sie schon da: Unsere Standorte liegen im Erdgeschoss und im Untergeschoss der BahnhofCity.`,
				],
			},
			{
				h: "Feldkirch, Bludenz und der Walgau",
				p: [
					`Die Railjets aus Feldkirch und Bludenz fahren über den Arlberg und Innsbruck bis zum Wien Hauptbahnhof. Bludenz liegt ${rund("Bludenz", "hbf")}, Feldkirch ${rund("Feldkirch", "hbf")} entfernt.`,
				],
			},
			{
				h: "Was ohne Anreise geht",
				p: [
					"Ob sich die Reparatur lohnt, klären Sie vorab per WhatsApp, rund um die Uhr. Den Fixpreis für iPhone und iPad sehen Sie auf der Modellseite.",
					"Ein altes Gerät verkaufen können Sie auch per Post: Anfrage über das Ankauf-Formular, Adresse und Ablauf für das Paket kommen per E-Mail.",
				],
			},
		],
		faq: (c) => [
			{ q: "Haben Sie einen Standort in Vorarlberg?", a: `Nein. Am nächsten sind unsere Standorte am Wien Hauptbahnhof, ${rund("Bregenz", "hbf")} Luftlinie von Bregenz.` },
			{ q: "Kann ich mein iPhone zur Reparatur einschicken?", a: "Reparaturen erledigen wir an unseren Standorten in Wien und Umgebung. Fragen Sie uns gerne per WhatsApp, was für Ihr Gerät möglich ist." },
			{ q: "Ich bin nur am Sonntag in Wien. Geht das?", a: sundayText(c, "Leider nein, sonntags sind unsere Standorte geschlossen.") },
			{ q: "Welche Apple Geräte reparieren Sie?", a: "iPhone, iPad, MacBook, iMac und Apple Watch. Dazu kommen Datenrettung und Datenübertragung." },
		],
	},
];

export const regionPath = (r: Region) => `/iphone-reparieren-${r.slug}`;
export const regionBySlug = (slug: string) => regions.find((r) => r.slug === slug);
export const h1Of = (r: Region) => `iPhone reparieren lassen ${r.inName}`;
