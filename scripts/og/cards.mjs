// Link preview cards (1200×630), rendered by scripts/og/render.mjs into public/og/<key>.jpg.
// seamless: photo is marked seamless in src/lib/photos.ts (background is exactly --gray).
export const cards = [
	{ key: "default", photo: "hero", seamless: true, eyebrow: "iPhone Reparatur in Wien", title: "Wie am ersten Tag.", sub: "Premium Reparaturen mit Original Apple Teilen.", pill: "Ohne Termin" },
	{ key: "iphone", photo: "iphone", eyebrow: "iPhone Reparatur in Wien", title: "Display, Rückglas, Akku.", sub: "Mit Original Apple Teilen. Oft in rund einer Stunde.", pill: "Ohne Termin" },
	{ key: "ipad", photo: "ipad", eyebrow: "iPad Reparatur in Wien", title: "Glas, Display, Akku.", sub: "iPad, iPad Air, iPad mini und iPad Pro.", pill: "Ohne Termin" },
	{ key: "mac", photo: "mac-hero", seamless: true, eyebrow: "Mac Reparatur in Wien", title: "MacBook, iMac. Wie neu.", sub: "MacBook Air, MacBook Pro und iMac: Display, Akku, Tastatur und SSD.", pill: "Preis vorab" },
	{ key: "imac", photo: "imac-hero", seamless: true, eyebrow: "iMac Reparatur in Wien", title: "Ihr iMac. Wie neu.", sub: "iMac 24″, 27″ und 21,5″: Display und SSD.", pill: "Preis vorab" },
	{ key: "apple-watch", photo: "watch", seamless: true, eyebrow: "Apple Watch Reparatur in Wien", title: "Display, Akku. Wie neu.", sub: "Apple Watch Series, SE und Ultra.", pill: "Ohne Termin" },
	{ key: "datenrettung", photo: "daten", eyebrow: "Datenrettung in Wien", title: "Ihre Erinnerungen. Zurückgeholt.", sub: "Datenrettung und Datenübertragung für iPhone, iPad und Mac.", pill: "Vertraulich" },
	{ key: "kontakt", photo: "display", seamless: true, eyebrow: "Standorte in Wien und Umgebung", title: "Einfach vorbeikommen.", sub: "Wien Hauptbahnhof, Shopping City Süd, G3 Gerasdorf.", pill: "Ohne Termin" },
	{ key: "ankauf", photo: "hero", seamless: true, eyebrow: "iPhone Ankauf in Wien", title: "Wir kaufen Ihr altes Gerät.", sub: "iPhone, iPad, Mac und Watch, auch defekt.", pill: "Ohne Termin" },
	{ key: "anfragen", photo: "schraube", eyebrow: "Termin nicht nötig", title: "Eine Frage vorab?", sub: "Gerät und Problem angeben, wir melden uns.", pill: "In 1 Minute" },
];
