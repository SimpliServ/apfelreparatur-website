# Apfelreparatur

apple.com-style site for premium iPhone/iPad/Mac repair in Wien (apfelreparatur.at). German, formal "Sie".
Stack: EmDash (Astro SSR) on Cloudflare Workers + D1 + R2. npm, not pnpm.

## Rules

- **Brand of Mobi GmbH (MobiNil).** Name Mobi GmbH only where legally required (Impressum, Datenschutz, AGB, Widerruf, mail footer). Never "MobiNil", never in marketing copy. Exception (owner 2026-10-28): every store card says "Im MobiNil Shop" (`StoreCard.astro`), so walk-ins find the right shop (SCS has several phone shops).
- **Apple trademarks:** never use the Apple logo or an apple-shaped mark as our own branding/graphics, no Apple renders or copy, no Apple slogans. Keep the trademark/independence disclaimer (Footer, Impressum). Product photos may show the Apple logo on the device (owner decision 2026-10-25).
- **Claims must match MobiNil reality:** no appointment, price before repair (no "kostenloser KV"). "Original Apple Teile" always with footnote 1, only for iPhone/Mac (iPad + Watch parts are imported without part label). No board-level/soldering/microscope claims (GISA licence excludes Mechatroniker work).
- **Owner decisions 2026-10-26:** 6 months warranty (`business.warrantyMonths`, also AGB § 8 in the CMS page + `scripts/build-seed.py`). Prices are shown: iPhone/iPad prices = MobiNil + 10 € per row (imported once, then the CMS is the source), NO Arbeitspauschale (owner 2026-10-27: fixed prices, no labour surcharge). Macs and Watches have no prices yet ("Preis nach Diagnose" until staff enter them).
- **Design:** accent is blue `--accent` (#1d4ed8), deeper than Apple blue (#0071e3), so the site does not read as apple.com. Product tiles are light (`--gray`) with product shots on matching light grey (bg colour-corrected to #f5f5f7); `--night` is only for the few dark sections. Tokens + motion classes in `src/styles/global.css` (`data-reveal`, `.rise`, `.sd-*` scroll animations, reduced-motion safe). System fonts only, no tracking, so no cookie banner.
- **SEO: keep keywords apart from mobinil.at** (same owner): MobiNil targets "iPhone Reparatur", "<Gerät> Display/Akku tauschen", "Ladebuchse reparieren", "MacBook & iMac Reparatur", model pages "Apple <Modell> Reparatur Wien – Display ab …". Apfelreparatur targets "Apple Reparatur Wien", symptom titles ("Display kaputt?", "Akku schwach? Batterietausch", "lädt nicht? Ladeanschluss"), Original Apple Teile, Apple Watch, Datenrettung; model pages "<Modell> Reparatur Kosten: Original Display …" and Mac model numbers ("MacBook Air 13″ (M1, 2020) Reparatur (A2337)"), copy in `src/lib/model-copy.ts`. Wording: Batterie, Rückglas, Ladeanschluss, Kompatibles Teil (labels `src/i18n/ui.ts`). Check mobinil.at titles before adding pages. JSON-LD in `src/lib/seo.ts`; new pages go into `src/pages/sitemap.xml.ts`. Repair landing pages `/<gerät>/<reparatur>` come from `src/lib/repair-pages.ts` (Mac pages say "MacBook"). Page titles over 65 chars drop the " – Apfelreparatur" suffix (`Base.astro`).
- **AI agents:** `/llms.txt` + `/llms-full.txt` are generated from the page data in `src/lib/llms.ts` (no static copy); `robots.txt.ts` allows search/AI bots by name. Forms carry WebMCP `toolname` attributes.
- **Lighthouse 100/100/100/100** (mobile + desktop, prod build via `astro build --outDir dist-lh` + `wrangler dev -c dist-lh/server/wrangler.json --persist-to .wrangler/state`). Keep it: hero image must not start at opacity 0 (LCP), links inside running text are underlined, text colours ≥ 4.5:1 (highlights use `--accent`, no extra colours). Photos ship as `public/img/<name>-{800,1200,1600,2400}.webp`.
- **Link previews:** `public/og/<key>.jpg` (1200×630) from `scripts/og/cards.mjs` + `card.html`; run `npm run og` after changing copy/photos and commit the JPEGs. Pages pick a card via `<Base og="…">`. Icons: `node scripts/icons.mjs`.
- **Redirects:** old Joomla URLs live in EmDash (group "Alte Website (apfelreparatur.at)", record in `scripts/build-seed.py`; existing DBs via `python3 scripts/redirects-sql.py`). EmDash skips paths with a file extension, so `.pdf`/`.php` ones are in `LEGACY_FILES` in `src/middleware.ts`.
- **Hosts:** everything except apfelreparatur.at gets `x-robots-tag: noindex` (middleware); www 301s to the bare domain. IndexNow key `public/<key>.txt`, `npm run deploy` pings it (no-op until the domain points here).

## Where things live

- Company facts + fallback stores: `src/lib/business.ts`. Copy: `src/lib/content.ts`, `src/lib/copy.ts`.
- Live data: `src/lib/mobinil.ts` reads www.mobinil.at/api/v1 for stores (≤ 40 km from Wien) with the static snapshot as fallback. Model names for the form come from the CMS catalogue.
- Device catalogue = CMS collection `devices` (title, brand = apple, category smartphone/tablet/mac/watch, series, sort, image, model_numbers, search_terms, repairs repeater, notes); `src/lib/devices.ts`. Model pages `/<gerät>/<slug>` (`src/components/ModelPage.astro`) share the route `src/pages/[device]/[slug].astro` with the repair landing pages (`RepairLanding.astro`, now with a price table per model); hub pages list models via `ModelGrid.astro` (search + series pills). Sitemap and `/llms-full.txt` include every model with prices. One-off import `scripts/import-devices.mjs` (schema + 193 devices; MobiNil API prices +10 €, device photos + CC credits scraped from mobinil.at/geraet/<slug>, Mac line photos from `../mobinil/src/assets/mac`, Mac models + A-numbers `scripts/data/mac-models.json`, Watches without photo → `watch` photo). Idempotent, needs a PAT (`--token`; local: `curl -X POST 'localhost:4330/_emdash/api/setup/dev-bypass?token=1'`).
- Price list = native plugin `apfel-prices` (port of MobiNil's `mobinil-prices`, see `../mobinil/AGENTS.md` for the full behaviour: Excel-like grid, xlsx export/import, fill handle, undo, merge-per-cell saves, MCP tools `apfel-prices__find_devices|update_prices|create_device`). Files: `src/plugins/prices.ts`, `prices-admin.tsx`, `src/lib/{prices,xlsx,grid}.ts`, copy `src/i18n/prices.ts`. Apfel changes: categories mac/watch (`categoryOf`, `byCategory`), `BASE_SLOTS` shows Mac/Watch columns before any price exists, services incl. datenrettung/datenuebertragung never get a part. Tests `npm test`.
- Datenschutz + AGB = CMS `pages` (seed from `python3 scripts/build-seed.py`, after launch the CMS wins). Impressum = code.
- Forms (`?geraet=&modell=` prefill) → plugin `src/plugins/inquiry.ts` (mail to `INQUIRY_EMAIL`, default office@apfelreparatur.at, + customer confirmation). Transport: Resend plugin `src/plugins/email.ts`.

## Dev

- `npm run dev -- --port 4330`. Fresh DB: stop dev, move `.wrangler/`, start, open `/_emdash/api/setup/dev-bypass?redirect=/`.
- Local mail → console: option `emdash:exclusive_hook:email:deliver` = `"emdash-console-email"` in local D1.
- Check: `./node_modules/.bin/astro check`, `npm run build`.

## Production

- Worker `apfelreparatur-website` → https://apfelreparatur-website.simpliserv.workers.dev (same CF account as MobiNil, free-plan quota shared). D1/R2/KV `apfelreparatur-website-*`.
- `npm run deploy`, `npm run logs`, rollback `npx wrangler rollback`. Workers Cache is on; `src/middleware.ts` sets the TTLs.
- Secrets: `EMDASH_ENCRYPTION_KEY` (Keychain "Apfelreparatur EmDash encryption key"), `EMDASH_SITE_URL`. Missing: `RESEND_API_KEY`, `EMAIL_FROM`, so forms fail on prod until set.
- Open: admin passkey at `/_emdash/admin`; custom domain (uncomment `routes` in `wrangler.jsonc`, set `EMDASH_SITE_URL`).
