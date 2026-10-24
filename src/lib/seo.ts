import { business, type Location } from "./business";
import type { QA } from "../components/FAQ.astro";

export const SITE = "https://apfelreparatur.at";
const clean = <T extends object>(o: T) => JSON.parse(JSON.stringify(o)) as T;

// One ElectronicsStore per location; the brand is the same, so they share the parent organisation.
export function localBusinessLd(locations: Location[] = []): object[] {
	const stores: object[] = locations.map((l, i) =>
		clean({
			"@context": "https://schema.org",
			"@type": "ElectronicsStore",
			"@id": `${SITE}/#standort-${i + 1}`,
			name: `${business.brand} ${l.name}`,
			url: `${SITE}/kontakt`,
			image: `${SITE}/img/hero-1600.webp`,
			email: business.email,
			telephone: l.phone,
			priceRange: "€€",
			parentOrganization: { "@id": `${SITE}/#business` },
			address: { "@type": "PostalAddress", streetAddress: l.street, postalCode: l.zip, addressLocality: l.city, addressCountry: "AT" },
			geo: { "@type": "GeoCoordinates", latitude: l.lat, longitude: l.lng },
			openingHoursSpecification: l.hours.flatMap(([days, time]) => {
				const [opens, closes] = time.split(" – ");
				return [{ "@type": "OpeningHoursSpecification", dayOfWeek: dayRange(days), opens, closes }];
			}),
			areaServed: { "@type": "City", name: "Wien" },
		}),
	);
	return [
		...stores,
		clean({
			"@context": "https://schema.org",
			"@type": "Organization",
			"@id": `${SITE}/#business`,
			name: business.brand,
			url: SITE,
			email: business.email,
			knowsAbout: ["iPhone Reparatur", "iPad Reparatur", "Mac Reparatur", "Display Reparatur", "Akku Tausch", "Rückglas Reparatur", "Datenrettung", "Datenübertragung"],
		}),
	];
}

const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
function dayRange(label: string) {
	const [from, to = from] = label.split(" – ").map((d) => DAYS.indexOf(d.trim()));
	return DAY_NAMES.slice(from, to + 1);
}

export function serviceLd(name: string, description: string, path: string) {
	return {
		"@context": "https://schema.org",
		"@type": "Service",
		name,
		description,
		serviceType: name,
		url: SITE + path,
		provider: { "@id": `${SITE}/#business` },
		areaServed: { "@type": "City", name: "Wien" },
	};
}

export function faqLd(items: QA[]) {
	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } })),
	};
}

export function breadcrumbLd(crumbs: [string, string][]) {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: crumbs.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: SITE + path })),
	};
}
