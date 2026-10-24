// Pexels photos (free licence, credited in the Impressum). Sizes are the 2400w export.
// retouched: hero/display/rueckglas/mac-hero moved onto --gray with AI editing (rueckglas cracks added). ai: fully generated.
// seamless: background is exactly --gray, so tiles show the whole shot without a fade.
export const photos = {
	hero: { w: 2400, h: 1530, alt: "Goldenes iPhone auf hellem Hintergrund", by: "webber Amir", id: 28919442, retouched: true, seamless: true },
	iphone: { w: 2400, h: 1600, alt: "Geöffnetes Smartphone mit Einzelteilen auf einer blauen Werkstattmatte", by: "Fotografia Lui Vlad", id: 31862953, retouched: true },
	ipad: { w: 2400, h: 1600, alt: "Hand mit Eingabestift an einem Tablet auf einem weißen Schreibtisch", by: "cottonbro studio", id: 3944397 },
	mac: { w: 2400, h: 1350, alt: "Geöffneter Laptop mit sichtbarer Platine auf einer Werkstattmatte", by: "Found GHI", id: 34514242 },
	"mac-hero": { w: 2400, h: 1530, alt: "MacBook Air in der Frontansicht auf hellem Hintergrund", by: "Tuur Tisseghem", id: 812264, retouched: true, seamless: true },
	display: { w: 2400, h: 1530, alt: "iPhone mit gesprungenem Display auf hellem Hintergrund", by: "ClickerHappy", id: 1388947, retouched: true, seamless: true },
	rueckglas: { w: 2400, h: 1530, alt: "iPhone mit gesprungenem Rückglas auf hellem Hintergrund", by: "Tuur Tisseghem", id: 818043, retouched: true, seamless: true },
	akku: { w: 2400, h: 1530, alt: "Geöffnetes Smartphone mit sichtbarem Akku und Schraubendreher", by: "KI-generiert", id: "ki-akku", ai: true, seamless: true },
	daten: { w: 2400, h: 1600, alt: "Geöffnete Festplatte mit Schreib-Lese-Kopf", by: "Pixabay", id: 209666 },
	werkstatt: { w: 2400, h: 1600, alt: "Techniker an einem Reparaturplatz", by: "Tima Miroshnichenko", id: 6755092 },
	labor: { w: 2400, h: 1600, alt: "Techniker am Reparaturplatz", by: "Tima Miroshnichenko", id: 6754839 },
	schraube: { w: 2400, h: 1601, alt: "Präzisionsschraubendreher an einem geöffneten Smartphone", by: "Tima Miroshnichenko", id: 6755075 },
} as const;

export type PhotoKey = keyof typeof photos;
