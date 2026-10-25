export type DeviceKey = "iphone" | "ipad" | "mac" | "apple-watch";
export type ServiceKey = "display" | "rueckglas" | "akku" | "datenrettung" | "datenuebertragung" | "kamera" | "ladebuchse" | "tastatur" | "sonstiges";

export const services: Record<ServiceKey, { label: string; short: string; icon: string }> = {
	display: { label: "Display", short: "Gesprungenes Glas, Streifen, Touch reagiert nicht.", icon: "ph:device-mobile" },
	rueckglas: { label: "Rückglas", short: "Gesprungene Rückseite, sauber getauscht.", icon: "ph:cards" },
	akku: { label: "Akku", short: "Hält nicht mehr den Tag durch oder wurde geprüft als „Service“.", icon: "ph:battery-full" },
	datenrettung: { label: "Datenrettung", short: "Gerät startet nicht mehr. Fotos und Dateien zurückholen.", icon: "ph:database" },
	datenuebertragung: { label: "Datenübertragung", short: "Vom alten aufs neue Gerät, vollständig und sicher.", icon: "ph:arrows-left-right" },
	kamera: { label: "Kamera", short: "Unscharf, Flecken oder gesprungenes Kameraglas.", icon: "ph:camera" },
	ladebuchse: { label: "Ladebuchse", short: "Lädt nur noch mit Wackeln oder gar nicht.", icon: "ph:plug" },
	tastatur: { label: "Tastatur & Trackpad", short: "Klemmende Tasten, Trackpad ohne Klick.", icon: "ph:laptop" },
	sonstiges: { label: "Etwas anderes", short: "Beschreiben Sie einfach, was nicht stimmt.", icon: "ph:wrench" },
};

// Apple Watch is feminine ("Ihre Apple Watch"), the other devices neuter.
export const de = (n: string) =>
	n === "Apple Watch"
		? { ihr: "Ihre", ihres: "Ihrer", mein: "meine", dem: "der", beim: "bei der", es: "sie" }
		: { ihr: "Ihr", ihres: "Ihres", mein: "mein", dem: "dem", beim: "beim", es: "es" };

type Repair = { key: ServiceKey; title: string; text: string; points: string[] };

export type Device = {
	key: DeviceKey;
	name: string;
	headline: string;
	sub: string;
	tile: string;
	image: string;
	imageAlt: string;
	repairs: Repair[];
	models: string[];
};

export const devices: Record<DeviceKey, Device> = {
	iphone: {
		key: "iphone",
		name: "iPhone",
		headline: "iPhone Reparatur.",
		sub: "Mit Original Apple Teilen. Zurück wie am ersten Tag.",
		tile: "Display, Rückglas und Akku. Präzise getauscht, mit Original Apple Teilen.",
		image: "iphone",
		imageAlt: "Geöffnetes iPhone mit Einzelteilen auf einer blauen Werkstattmatte",
		models: ["iPhone 17 Pro Max", "iPhone 17 Pro", "iPhone Air", "iPhone 17", "iPhone 16e", "iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16 Plus", "iPhone 16", "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15 Plus", "iPhone 15", "iPhone 14 Pro Max", "iPhone 14 Pro", "iPhone 14 Plus", "iPhone 14", "iPhone 13 Pro Max", "iPhone 13 Pro", "iPhone 13", "iPhone 13 mini", "iPhone 12 Pro Max", "iPhone 12 Pro", "iPhone 12", "iPhone 12 mini", "iPhone SE (3. Generation)", "iPhone 11 Pro Max", "iPhone 11 Pro", "iPhone 11", "Älteres iPhone"],
		repairs: [
			{ key: "display", title: "Neues Display. Gleiches iPhone.", text: "Wir tauschen das komplette Displaymodul. Farben, Helligkeit und True Tone bleiben, wie Apple sie vorgesehen hat.", points: ["Original Apple Displaymodul", "True Tone und Face ID bleiben erhalten", "Ihre Daten bleiben auf dem Gerät"] },
			{ key: "rueckglas", title: "Rückglas. Wieder makellos.", text: "Eine gesprungene Rückseite ist mehr als ein Schönheitsfehler. Feuchtigkeit und Splitter gefährden das Innere. Wir ersetzen das Rückglas sauber und dicht.", points: ["Passgenau, in Originalfarbe", "MagSafe und kabelloses Laden funktionieren wie zuvor", "Kameraglas auf Wunsch gleich mit"] },
			{ key: "akku", title: "Akku. Wieder volle Kraft.", text: "Mit sinkender Kapazität kann iOS die Spitzenleistung drosseln. Ein neuer Akku bringt Laufzeit und Geschwindigkeit zurück.", points: ["Original Apple Akku", "Batteriezustand wieder bei 100 %", "Alter Akku wird fachgerecht recycelt"] },
			{ key: "kamera", title: "Kamera. Wieder gestochen scharf.", text: "Unscharfe Bilder, Flecken oder ein gesprungenes Linsenglas. Wir prüfen Modul und Glas und tauschen nur, was nötig ist.", points: ["Kameraglas oder komplettes Modul", "Bildstabilisierung geprüft", "Vor der Übergabe getestet"] },
			{ key: "ladebuchse", title: "Ladebuchse. Lädt wieder.", text: "Oft reicht eine professionelle Reinigung. Ist der Anschluss defekt, tauschen wir ihn.", points: ["Reinigung oder Tausch", "Lightning und USB-C", "Mikrofon gleich mitgeprüft"] },
		],
	},
	ipad: {
		key: "ipad",
		name: "iPad",
		headline: "iPad Reparatur.",
		sub: "Glas, Display und Akku. Mit der Sorgfalt, die ein iPad verdient.",
		tile: "Gesprungenes Glas oder schwacher Akku. Wir machen es wieder wie neu.",
		image: "ipad",
		imageAlt: "Hand mit Eingabestift an einem Tablet auf einem weißen Schreibtisch",
		models: ["iPad Pro 13\" (M4/M5)", "iPad Pro 11\" (M4/M5)", "iPad Pro 12,9\"", "iPad Pro 11\"", "iPad Air 13\"", "iPad Air 11\"", "iPad Air (ältere Generation)", "iPad (A16)", "iPad (10. Generation)", "iPad (9. Generation)", "iPad mini (A17 Pro)", "iPad mini (6. Generation)", "Älteres iPad"],
		repairs: [
			{ key: "display", title: "Glas und Display. Klar wie am ersten Tag.", text: "Ob nur das Glas gesprungen ist oder das Bild ausfällt: Wir finden heraus, was getauscht werden muss, und verkleben das neue Display staubfrei.", points: ["Staubfreie Verklebung", "Touch und Stifteingabe getestet", "Ihre Daten bleiben erhalten"] },
			{ key: "akku", title: "Akku. Den ganzen Tag.", text: "Ein neuer Akku gibt Ihrem iPad die Laufzeit zurück, die es einmal hatte.", points: ["Hochwertiger Akku mit voller Kapazität", "Fachgerechte Entsorgung des alten Akkus", "Ladezyklen geprüft"] },
			{ key: "ladebuchse", title: "Ladebuchse. Wieder verbunden.", text: "Lädt Ihr iPad nur noch in bestimmten Winkeln? Wir reinigen oder ersetzen den Anschluss.", points: ["Lightning und USB-C", "Reinigung oder Tausch", "Datenübertragung geprüft"] },
		],
	},
	mac: {
		key: "mac",
		name: "Mac",
		headline: "Mac Reparatur.",
		sub: "MacBook Air, MacBook Pro und iMac. Sorgfältig repariert, mit Original Apple Teilen.",
		tile: "Display, Akku, Tastatur und SSD. Damit Ihr Mac wieder arbeitet wie Sie.",
		image: "mac",
		imageAlt: "Geöffnetes MacBook mit sichtbarer Platine auf einer Werkstattmatte",
		models: ["MacBook Air 13\" (Apple Silicon)", "MacBook Air 15\" (Apple Silicon)", "MacBook Pro 14\" (Apple Silicon)", "MacBook Pro 16\" (Apple Silicon)", "MacBook Pro 13\" (Apple Silicon)", "MacBook Air (Intel)", "MacBook Pro (Intel)", "iMac 24\"", "iMac 27\"", "Mac mini", "Mac Studio", "Anderer Mac"],
		repairs: [
			{ key: "display", title: "Display. Wieder brillant.", text: "Gesprungen, Streifen oder Flecken im Bild: Wir tauschen das Display und kalibrieren es, damit Farben stimmen.", points: ["Original Apple Display", "Kalibrierung nach dem Tausch", "Gehäuse sauber verschlossen"] },
			{ key: "akku", title: "Akku. Wieder unterwegs.", text: "Meldet macOS „Service empfohlen“, ist es Zeit. Ein neuer Akku bringt Laufzeit und Ruhe zurück.", points: ["Original Apple Akku", "Zustand danach wieder „Normal“", "Fachgerechtes Recycling"] },
			{ key: "tastatur", title: "Tastatur und Trackpad. Wieder präzise.", text: "Klemmende Tasten, Flüssigkeitsschaden oder ein Trackpad ohne Klick. Wir reinigen, reparieren oder tauschen.", points: ["Einzelne Tasten oder ganze Tastatur", "Flüssigkeitsschäden", "Trackpad-Klick und Gesten geprüft"] },
			{ key: "datenrettung", title: "SSD und Daten. Nichts geht verloren.", text: "Startet Ihr Mac nicht mehr, holen wir Ihre Dateien, wenn es technisch möglich ist, und übertragen sie auf Wunsch auf ein neues Gerät.", points: ["Diagnose vor jeder Arbeit", "Vertraulicher Umgang mit Ihren Daten", "Übergabe auf Datenträger oder neuen Mac"] },
		],
	},
	"apple-watch": {
		key: "apple-watch",
		name: "Apple Watch",
		headline: "Apple Watch Reparatur.",
		sub: "Display und Akku. Mit der Sorgfalt, die eine Apple Watch verdient.",
		tile: "Gesprungenes Display oder schwacher Akku. Wieder bereit für jeden Tag.",
		image: "watch",
		imageAlt: "Apple Watch mit schwarzem Sportarmband auf hellem Hintergrund",
		models: ["Apple Watch Ultra 3", "Apple Watch Ultra 2", "Apple Watch Ultra", "Apple Watch Series 11", "Apple Watch Series 10", "Apple Watch Series 9", "Apple Watch Series 8", "Apple Watch Series 7", "Apple Watch SE (3. Generation)", "Apple Watch SE (2. Generation)", "Apple Watch SE", "Apple Watch Series 6", "Apple Watch Series 5", "Apple Watch Series 4", "Ältere Apple Watch"],
		repairs: [
			{ key: "display", title: "Display. Wieder klar.", text: "Ein Sprung im Glas oder ein Touchscreen, der nicht mehr reagiert: Wir tauschen das Display und verkleben die Uhr wieder sorgfältig.", points: ["Neu verklebt und verschlossen", "Touch und Helligkeit getestet", "Ihre Daten bleiben erhalten"] },
			{ key: "akku", title: "Akku. Wieder durch den Tag.", text: "Hält Ihre Apple Watch nicht mehr bis zum Abend durch? Ein neuer Akku bringt die Laufzeit zurück.", points: ["Hochwertiger Akku mit voller Kapazität", "Kabelloses Laden geprüft", "Alter Akku wird fachgerecht recycelt"] },
		],
	},
};

export const deviceList = Object.values(devices);
