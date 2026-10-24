# Apfelreparatur

apple.com-style site for premium iPhone/iPad/Mac repair in Wien (apfelreparatur.at). German, formal "Sie".
Stack: EmDash (Astro SSR) on Cloudflare Workers + D1 + R2. npm, not pnpm.

## Rules

- **Brand of Mobi GmbH (MobiNil).** Name Mobi GmbH only where legally required (Impressum, Datenschutz, AGB, Widerruf, mail footer). Never "MobiNil", never in marketing copy.
- **Apple trademarks:** no Apple logo, no apple-shaped mark, no Apple renders or copy, no Apple slogans. Keep the trademark/independence disclaimer (Footer, Impressum). Photos with visible logos get retouched or replaced.
- **Claims must match MobiNil reality:** no appointment, price before repair (no "kostenloser KV"), 3 months warranty (`business.warrantyMonths`). "Original Apple Teile" always with footnote 1. No board-level/soldering/microscope claims (GISA licence excludes Mechatroniker work). No prices on this site.
- **Design:** tokens + motion classes in `src/styles/global.css` (`data-reveal`, `.rise`, `.sd-*` scroll animations, reduced-motion safe). System fonts only, no tracking, so no cookie banner.
- **SEO target "iPhone Reparatur Wien":** JSON-LD in `src/lib/seo.ts`; new pages go into `src/pages/sitemap.xml.ts`.

## Where things live

- Company facts + fallback stores: `src/lib/business.ts`. Copy: `src/lib/content.ts`, `src/lib/copy.ts`.
- Live data: `src/lib/mobinil.ts` reads www.mobinil.at/api/v1 (stores ≤ 40 km from Wien, iPhone/iPad model names), with the static snapshot as fallback. Macs stay static.
- Datenschutz + AGB = CMS `pages` (seed from `python3 scripts/build-seed.py`, after launch the CMS wins). Impressum = code.
- Forms → plugin `src/plugins/inquiry.ts` (mail to `INQUIRY_EMAIL`, default office@apfelreparatur.at, + customer confirmation). Transport: Resend plugin `src/plugins/email.ts`.

## Dev

- `npm run dev -- --port 4330`. Fresh DB: stop dev, move `.wrangler/`, start, open `/_emdash/api/setup/dev-bypass?redirect=/`.
- Local mail → console: option `emdash:exclusive_hook:email:deliver` = `"emdash-console-email"` in local D1.
- Check: `./node_modules/.bin/astro check`, `npm run build`.

## Production

- Worker `apfelreparatur-website` → https://apfelreparatur-website.simpliserv.workers.dev (same CF account as MobiNil, free-plan quota shared). D1/R2/KV `apfelreparatur-website-*`.
- `npm run deploy`, `npm run logs`, rollback `npx wrangler rollback`. Workers Cache is on; `src/middleware.ts` sets the TTLs.
- Secrets: `EMDASH_ENCRYPTION_KEY` (Keychain "Apfelreparatur EmDash encryption key"), `EMDASH_SITE_URL`. Missing: `RESEND_API_KEY`, `EMAIL_FROM`, so forms fail on prod until set.
- Open: admin passkey at `/_emdash/admin`; custom domain (uncomment `routes` in `wrangler.jsonc`, set `EMDASH_SITE_URL`).
