// Link preview cards (1200×630), rendered by scripts/og/render.mjs into public/og/<key>.jpg.
// seamless: photo is marked seamless in src/lib/photos.ts (background is exactly --gray).
export const cards = [
	{ key: "default", photo: "hero", seamless: true, eyebrow: "iPhone Reparatur in Wien", title: "Wie am ersten Tag.", sub: "Premium Reparaturen mit Original Apple Teilen.", pill: "Ohne Termin" },
	{ key: "iphone", photo: "iphone", eyebrow: "iPhone Reparatur in Wien", title: "Display, Rückglas, Akku.", sub: "Mit Original Apple Teilen. Oft in rund einer Stunde.", pill: "Ohne Termin" },
	{ key: "ipad", photo: "ipad", eyebrow: "iPad Reparatur in Wien", title: "Glas, Display, Akku.", sub: "iPad, iPad Air, iPad mini und iPad Pro.", pill: "Ohne Termin" },
	{ key: "mac", photo: "mac-hero", seamless: true, eyebrow: "Mac Reparatur in Wien", title: "MacBook, iMac. Wie neu.", sub: "MacBook Air, MacBook Pro und iMac: Display, Akku, Tastatur und SSD.", pill: "Preis vorab" },
	{ key: "datenrettung", photo: "daten", eyebrow: "Datenrettung in Wien", title: "Ihre Erinnerungen. Zurückgeholt.", sub: "Datenrettung und Datenübertragung für iPhone, iPad und Mac.", pill: "Vertraulich" },
	{ key: "kontakt", photo: "display", seamless: true, eyebrow: "Standorte in Wien und Umgebung", title: "Einfach vorbeikommen.", sub: "Wien Hauptbahnhof, Shopping City Süd, G3 Gerasdorf.", pill: "Ohne Termin" },
	{ key: "anfragen", photo: "schraube", eyebrow: "Kostenlos und ohne Verpflichtung", title: "Reparatur anfragen.", sub: "Gerät und Problem angeben, wir melden uns.", pill: "In 1 Minute" },
];
