#!/bin/sh
set -eu
cd "$(dirname "$0")/.."

BASE=${APFEL_PROD_URL:-https://apfelreparatur-website.simpliserv.workers.dev}
node scripts/check-icons.mjs
npm run build
npx wrangler deploy

rollback() {
	echo "Deploy smoke test failed; rolling back…" >&2
	if npx wrangler rollback; then
		echo "Rollback complete" >&2
	else
		echo "Rollback failed; run: npx wrangler rollback" >&2
	fi
	exit 1
}

FAIL=0
TMP=$(mktemp)
trap 'rm -f "$TMP"' EXIT
for P in / /iphone /ipad /mac /apple-watch /datenrettung /reparatur-anfragen /kontakt /llms.txt /sitemap.xml; do
	if CODE=$(curl -sS -L -o "$TMP" -w "%{http_code}" --max-time 30 "$BASE$P"); then :; else CODE=000; fi
	echo "$CODE $P"
	[ "$CODE" = 200 ] || FAIL=1
	grep -Eiq "Unable to locate|Unhandled exception|Internal Server Error" "$TMP" && FAIL=1 || true
done
[ "$FAIL" = 0 ] || rollback

SITEMAP=$(curl -fsS --max-time 60 "$BASE/sitemap.xml")
URLS=$(printf '%s' "$SITEMAP" | grep -o '<loc>[^<]*' | sed 's|<loc>https*://[^/]*||')
[ -n "$URLS" ] || { echo "No sitemap URLs found" >&2; rollback; }
RESULTS=$(printf '%s\n' "$URLS" | xargs -P 4 -I{} curl -sS -o /dev/null --max-time 30 -w "%{http_code}\n" "$BASE{}")
printf '%s\n' "$RESULTS" | sort | uniq -c
if ! printf '%s\n' "$RESULTS" | awk '$1 != "200" { bad = 1; print "non-200: " $1 } END { exit bad }'; then
	rollback
fi

node scripts/indexnow.mjs || echo "IndexNow ping failed (non-fatal)" >&2
