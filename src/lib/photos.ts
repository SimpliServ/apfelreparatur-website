// Pexels photos (free licence, credited in the Impressum). Sizes are the 2400w export.
// hero + iphone are retouched: the Apple logo on the phone back and the battery was removed (nothing may suggest Apple affiliation).
export const photos = {
	hero: { w: 2400, h: 1603, alt: "Smartphone auf schwarzem Hintergrund", by: "Franklin Eduardo", id: 12436272, retouched: true },
	iphone: { w: 2400, h: 1600, alt: "Geöffnetes Smartphone mit Einzelteilen auf einer blauen Werkstattmatte", by: "Fotografia Lui Vlad", id: 31862953, retouched: true },
	ipad: { w: 2400, h: 1600, alt: "Hand mit Eingabestift an einem Tablet auf einem weißen Schreibtisch", by: "cottonbro studio", id: 3944397 },
	mac: { w: 2400, h: 1350, alt: "Geöffneter Laptop mit sichtbarer Platine auf einer Werkstattmatte", by: "Found GHI", id: 34514242 },
	"mac-hero": { w: 2400, h: 1600, alt: "Laptop-Tastatur im Halbdunkel", by: "Szymon Shields", id: 10948188 },
	display: { w: 2400, h: 1800, alt: "Gesprungenes Smartphone-Display vor schwarzem Hintergrund", by: "energepic.com", id: 288479 },
	rueckglas: { w: 2400, h: 1600, alt: "Gesprungenes Glas mit feinen Rissen auf dunklem Grund", by: "Tima Miroshnichenko", id: 6755147 },
	akku: { w: 2400, h: 1753, alt: "Smartphone mit sichtbarem Innenleben und Akku", by: "Tyler Lastovich", id: 719399 },
	daten: { w: 2400, h: 1600, alt: "Geöffnete Festplatte mit Schreib-Lese-Kopf", by: "Pixabay", id: 209666 },
	werkstatt: { w: 2400, h: 1600, alt: "Techniker arbeitet unter dem Mikroskop an einer Platine", by: "Tima Miroshnichenko", id: 6755092 },
	labor: { w: 2400, h: 1600, alt: "Techniker am Reparaturplatz mit Mikroskop", by: "Tima Miroshnichenko", id: 6754839 },
	schraube: { w: 2400, h: 1601, alt: "Präzisionsschraubendreher an einem geöffneten Smartphone", by: "Tima Miroshnichenko", id: 6755075 },
} as const;

export type PhotoKey = keyof typeof photos;
