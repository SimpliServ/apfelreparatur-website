// node upload.mjs <base> <token> [slug...] — upload out/<slug>.webp and set it as the device image via the price list plugin.
import { readFileSync, readdirSync } from "node:fs";
const [base, token, ...only] = process.argv.slice(2);
const H = { authorization: `Bearer ${token}`, "X-EmDash-Request": "1" };
const call = async (path, init) => { const r = await fetch(base + path, { ...init, headers: { ...H, ...init.headers } }); const j = await r.json(); if (!r.ok || j.data?.ok === false) throw new Error(path + " " + JSON.stringify(j).slice(0, 300)); return j.data ?? j; };
const slugs = readdirSync("/tmp/apfel-dev-img/out").map((f) => f.replace(".webp", "")).filter((s) => !only.length || only.includes(s));
for (const slug of slugs) {
	const found = await call("/_emdash/api/plugins/apfel-prices/find", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ query: slug.replace("-anschluesse", "").replace(/-/g, " ") }) });
	const dev = found.devices.find((d) => d.slug === slug);
	if (!dev) { console.log("?? not found", slug); continue; }
	const form = new FormData();
	form.set("file", new Blob([readFileSync(`/tmp/apfel-dev-img/out/${slug}.webp`)], { type: "image/webp" }), `${slug}.webp`);
	form.set("alt", `${dev.title}, Produktillustration`);
	form.set("caption", "Produktillustration, KI-generiert");
	const { item } = await call("/_emdash/api/media", { method: "POST", body: form });
	await call("/_emdash/api/plugins/apfel-prices/update", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: dev.id, fields: { image: { id: item.id, storageKey: item.storageKey } } }) });
	console.log("ok", slug);
}
