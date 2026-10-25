import { business, type Location } from "./business";
import type { QA } from "../components/FAQ.astro";
import { deviceList } from "./content";
import { repairPages } from "./repair-pages";

export const SITE = "https://apfelreparatur.at";
const clean = <T extends object>(o: T) => JSON.parse(JSON.stringify(o)) as T;

const WIEN = { "@type": "City", name: "Wien", sameAs: "https://www.wikidata.org/wiki/Q1741" };
const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// One ElectronicsStore per location; the brand is the same, so they share the parent organisation.
export function localBusinessLd(locations: Location[] = []): object[] {
	const stores: object[] = locations.map((l) =>
		clean({
			"@context": "https://schema.org",
			"@type": "ElectronicsStore",
			"@id": `${SITE}/#standort-${slug(`${l.name} ${l.venue}`)}`,
			name: `${business.brand} ${l.name}`,
			description: `iPhone, iPad und Mac Reparatur ohne Termin: ${l.venue}.`,
			url: `${SITE}/kontakt`,
			image: `${SITE}/img/hero-1600.webp?v=2`,
			email: business.email,
			telephone: l.phone,
			parentOrganization: { "@id": `${SITE}/#business` },
			address: { "@type": "PostalAddress", streetAddress: l.street, postalCode: l.zip, addressLocality: l.city, addressCountry: "AT" },
			geo: { "@type": "GeoCoordinates", latitude: l.lat, longitude: l.lng },
			hasMap: `https://www.google.com/maps/search/?api=1&query=${l.lat},${l.lng}`,
			openingHoursSpecification: l.hours.flatMap(([days, time]) => {
				const [opens, closes] = time.split(" – ");
				return [{ "@type": "OpeningHoursSpecification", dayOfWeek: dayRange(days), opens, closes }];
			}),
			areaServed: WIEN,
		}),
	);
	return [...stores, organizationLd()];
}

export function organizationLd() {
	return clean({
		"@context": "https://schema.org",
		"@type": "Organization",
		"@id": `${SITE}/#business`,
		name: business.brand,
		url: SITE,
		logo: `${SITE}/icon-512.png`,
		image: `${SITE}/og/default.jpg?v=4`,
		description: "Unabhängiger Reparaturbetrieb für iPhone, iPad und Mac in Wien, mit Original Apple Teilen, Datenrettung und Datenübertragung.",
		email: business.email,
		telephone: intl(business.hotline),
		contactPoint: { "@type": "ContactPoint", telephone: intl(business.hotline), contactType: "customer service", areaServed: "AT", availableLanguage: "de" },
		areaServed: WIEN,
		knowsAbout: ["iPhone Reparatur", "iPad Reparatur", "MacBook Reparatur", "Display Reparatur", "Akkutausch", "Rückglas Reparatur", "Datenrettung", "Datenübertragung"],
		hasOfferCatalog: offerCatalog(),
	});
}

const intl = (phone: string) => "+43 " + phone.replace(/^0/, "");

function offerCatalog() {
	const offer = (name: string, path: string) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name, url: SITE + path, areaServed: WIEN } });
	return {
		"@type": "OfferCatalog",
		name: "Reparaturen und Datenservice in Wien",
		itemListElement: [
			...deviceList.map((d) => {
				const dn = d.key === "mac" ? "MacBook" : d.name;
				return {
					"@type": "OfferCatalog",
					name: `${dn} Reparatur`,
					url: `${SITE}/${d.key}`,
					itemListElement: repairPages.filter((p) => p.device === d.key).map((p) => offer(`${dn} ${p.copy.label}`, p.path)),
				};
			}),
			{
				"@type": "OfferCatalog",
				name: "Daten",
				url: `${SITE}/datenrettung`,
				itemListElement: [offer("Datenrettung", "/datenrettung"), offer("Datenübertragung", "/datenrettung#uebertragung")],
			},
		],
	};
}

const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
function dayRange(label: string) {
	const [from, to = from] = label.split(" – ").map((d) => DAYS.indexOf(d.trim()));
	return DAY_NAMES.slice(from, to + 1);
}

export function serviceLd(name: string, description: string, path: string, serviceType = name) {
	return {
		"@context": "https://schema.org",
		"@type": "Service",
		"@id": path.includes("#") ? SITE + path : `${SITE}${path}#service`,
		name,
		description,
		serviceType,
		url: SITE + path,
		provider: { "@id": `${SITE}/#business` },
		areaServed: WIEN,
		availableChannel: { "@type": "ServiceChannel", serviceUrl: `${SITE}/reparatur-anfragen`, servicePhone: intl(business.hotline) },
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

export function websiteLd() {
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		"@id": `${SITE}/#website`,
		name: business.brand,
		url: SITE,
		inLanguage: "de-AT",
		publisher: { "@id": `${SITE}/#business` },
	};
}
