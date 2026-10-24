// Submits all sitemap URLs to IndexNow (Bing/Copilot, ChatGPT search via Bing, Yandex, Seznam).
// Skips unless the key file is live on the target host, so it is a no-op until mobinil.at points at this site.
const KEY = "7b9e94448eddaecf6305ada0620da6bd";
const site = (process.argv[2] ?? "https://apfelreparatur.at").replace(/\/$/, "");
const keyLocation = `${site}/${KEY}.txt`;
const live = await fetch(keyLocation).then((r) => (r.ok ? r.text() : "")).catch(() => "");
if (live.trim() !== KEY) {
	console.log(`IndexNow skipped: ${keyLocation} is not served by this site yet`);
	process.exit(0);
}
const xml = await (await fetch(`${site}/sitemap.xml`)).text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, "&")).filter((u) => u.startsWith(site + "/"));
const host = new URL(site).host;
for (let i = 0; i < urls.length; i += 10000) {
	const urlList = urls.slice(i, i + 10000);
	const res = await fetch("https://api.indexnow.org/indexnow", {
		method: "POST",
		headers: { "content-type": "application/json; charset=utf-8" },
		body: JSON.stringify({ host, key: KEY, keyLocation, urlList }),
	});
	console.log(`IndexNow: HTTP ${res.status} for ${urlList.length} URLs`);
}
