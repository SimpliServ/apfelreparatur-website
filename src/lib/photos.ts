// Pexels photos (free licence, credited in the Impressum). Sizes are the 2400w export.
// retouched: hero/display/rueckglas/mac-hero/watch* moved onto --gray with AI editing (display/rueckglas/watch-display cracks added, watch-akku restaged on a charger). ai: fully generated.
// v: bump when a photo's files change (URLs keep their name, assets are cached 30 days).
// seamless: background is exactly --gray, so tiles show the whole shot without a fade.
export const photos = {
	// hero: composite of real photos (mac-hero, hero-iphone rectified upright, hero-watch, this iPad Air with screen replaced); AI only added shadows, device pixels are the originals.
	hero: { w: 2400, h: 1530, alt: "MacBook, iPad, iPhone und Apple Watch auf hellem Hintergrund", by: "Luis Quintero", id: 13570171, retouched: true, seamless: true, v: 6 },
	// credit only: parts of the hero composite, no files of their own.
	"hero-iphone": { w: 2400, h: 1530, alt: "Goldenes iPhone auf hellem Hintergrund", by: "webber Amir", id: 28919442, retouched: true },
	"hero-watch": { w: 2400, h: 3600, alt: "Apple Watch mit hellem Sportarmband", by: "Deise Elen", id: 31406903, retouched: true },
	iphone: { w: 2400, h: 1600, alt: "Geöffnetes Smartphone mit Einzelteilen auf einer blauen Werkstattmatte", by: "Fotografia Lui Vlad", id: 31862953, retouched: true },
	ipad: { w: 2400, h: 1600, alt: "Hand mit Eingabestift an einem Tablet auf einem weißen Schreibtisch", by: "cottonbro studio", id: 3944397 },
	mac: { w: 2400, h: 1350, alt: "Geöffneter Laptop mit sichtbarer Platine auf einer Werkstattmatte", by: "Found GHI", id: 34514242 },
	"mac-hero": { w: 2400, h: 1530, alt: "MacBook Pro in der Frontansicht auf hellem Hintergrund", by: "Meet Patel", id: 37085303, retouched: true, seamless: true, v: 3 },
	// Wikimedia Commons (CC BY), same shot as the iMac 24″ model photos; credited with source + licence instead of Pexels.
	"imac-hero": { w: 2400, h: 1530, alt: "iMac 24″ in Blau, Vorderansicht auf hellem Hintergrund", by: "Seasider53, CC BY 4.0", id: "imac-hero", retouched: true, seamless: true, source: "https://commons.wikimedia.org/wiki/File:IMac_M4_2024_2_(cropped).jpg", license: "https://creativecommons.org/licenses/by/4.0" },
	watch: { w: 2400, h: 1530, alt: "Apple Watch mit schwarzem Sportarmband auf hellem Hintergrund", by: "Torsten Dettlaff", id: 437037, retouched: true, seamless: true },
	"watch-display": { w: 2400, h: 1530, alt: "Apple Watch mit gesprungenem Display auf hellem Hintergrund", by: "Torsten Dettlaff", id: 437037, retouched: true, seamless: true },
	"watch-akku": { w: 2400, h: 1530, alt: "Apple Watch auf einem Ladepuck mit Ladeanzeige", by: "Torsten Dettlaff", id: 437037, retouched: true, seamless: true },
	display: { w: 2400, h: 1530, alt: "iPhone mit gesprungenem Display auf hellem Hintergrund", by: "Jakub Zerdzicki", id: 25922596, retouched: true, seamless: true, v: 3 },
	rueckglas: { w: 2400, h: 1530, alt: "iPhone Pro mit gesprungenem Rückglas auf hellem Hintergrund", by: "Akaaljotsingh Anandpuria", id: 10885666, retouched: true, seamless: true, v: 3 },
	akku: { w: 2400, h: 1530, alt: "Geöffnetes Smartphone mit sichtbarem Akku und Schraubendreher", by: "KI-generiert", id: "ki-akku", ai: true, seamless: true, v: 2 },
	daten: { w: 2400, h: 1600, alt: "Geöffnete Festplatte mit Schreib-Lese-Kopf", by: "Pixabay", id: 209666 },
	werkstatt: { w: 2400, h: 1600, alt: "Techniker an einem Reparaturplatz", by: "Tima Miroshnichenko", id: 6755092 },
	labor: { w: 2400, h: 1600, alt: "Techniker am Reparaturplatz", by: "Tima Miroshnichenko", id: 6754839 },
	schraube: { w: 2400, h: 1601, alt: "Präzisionsschraubendreher an einem geöffneten Smartphone", by: "Tima Miroshnichenko", id: 6755075 },
} as const;

export type PhotoKey = keyof typeof photos;
