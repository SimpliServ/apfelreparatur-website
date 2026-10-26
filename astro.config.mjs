import { fileURLToPath } from "node:url";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { d1, r2 } from "@emdash-cms/cloudflare";
import icon from "astro-iconset";
import { defineConfig } from "astro/config";
import emdash from "emdash/astro";

const inquiry = {
	id: "apfel-inquiry",
	version: "1.0.0",
	format: "native",
	entrypoint: fileURLToPath(new URL("./src/plugins/inquiry.ts", import.meta.url)),
};

const email = {
	id: "apfel-email",
	version: "1.0.0",
	format: "native",
	entrypoint: fileURLToPath(new URL("./src/plugins/email.ts", import.meta.url)),
};

const prices = {
	id: "apfel-prices",
	version: "1.0.0",
	format: "native",
	entrypoint: fileURLToPath(new URL("./src/plugins/prices.ts", import.meta.url)),
	adminEntry: fileURLToPath(new URL("./src/plugins/prices-admin.tsx", import.meta.url)),
};

export default defineConfig({
	site: "https://apfelreparatur.at",
	output: "server",
	adapter: cloudflare(),
	build: {
		inlineStylesheets: "always",
	},
	i18n: {
		defaultLocale: "de",
		locales: ["de"],
		routing: { prefixDefaultLocale: false },
	},
	image: {
		layout: "constrained",
		responsiveStyles: true,
	},
	vite: {
		define: {
			__BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
		},
		ssr: {
			optimizeDeps: {
				// Pre-bundle so it isn't discovered mid-render under the workerd dev runner.
				include: ["astro-iconset/components"],
			},
		},
	},
	integrations: [
		react(),
		icon({
			include: {
				ph: [
					"caret-right",
					"caret-down",
					"arrow-right",
					"check",
					"check-circle-fill",
					"x",
					"list",
					"device-mobile",
					"device-tablet",
					"watch",
					"laptop",
					"devices",
					"battery-full",
					"cards",
					"database",
					"arrows-left-right",
					"seal-check",
					"shield-check",
					"lock-simple",
					"clock",
					"receipt",
					"wrench",
					"envelope-simple",
					"phone",
					"phone-fill",
					"whatsapp-logo",
					"map-pin",
					"warning-circle",
					"magnifying-glass",
					"cpu",
					"camera",
					"speaker-high",
					"plug",
					"drop",
					"fingerprint",
					"keyboard",
					"cursor-click",
					"hard-drives",
					"power",
					"sim-card",
					"headphones",
					"user-focus",
					"device-mobile-camera",
					"arrows-clockwise",
					"stethoscope",
					"code",
					"circle",
					"storefront",
					"tag",
					"calendar-x",
					"info",
				],
			},
		}),
		emdash({
			database: d1({ binding: "DB", session: "auto", coalesce: true }),
			storage: r2({ binding: "MEDIA" }),
			plugins: [inquiry, email, prices],
		}),
	],
	devToolbar: { enabled: false },
});
