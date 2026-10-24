// Renders public/og/<key>.jpg for every card in cards.mjs. The Worker never draws images (free-plan CPU), so commit the JPEGs.
// Usage: node scripts/og/render.mjs [--only=key,key]
import { execFile } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { mkdirSync } from "node:fs";
import { promisify } from "node:util";
import sharp from "sharp";
import { cards } from "./cards.mjs";

const run = promisify(execFile);
const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7).split(",");
const ab = (...a) => run(join(root, "node_modules/.bin/agent-browser"), ["--session", "apfel-og", ...a], { cwd: root });
const out = join(root, "public/og");
mkdirSync(out, { recursive: true });

await ab("set", "viewport", "1200", "630");
await ab("open", pathToFileURL(join(root, "scripts/og/card.html")).href);
for (const c of cards.filter((c) => !only || only.includes(c.key))) {
	const image = pathToFileURL(join(root, "public/img", c.photo + "-1600.webp")).href;
	await ab("eval", "render(" + JSON.stringify({ ...c, image }) + ")");
	await ab("wait", "300");
	const png = join(out, c.key + ".png");
	await ab("screenshot", png);
	await sharp(png).jpeg({ quality: 84, mozjpeg: true }).toFile(join(out, c.key + ".jpg"));
	await run("rm", [png]);
	console.log("og/" + c.key + ".jpg");
}
await ab("close").catch(() => {});
