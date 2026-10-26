import fs from "node:fs";
import path from "node:path";

const root = new URL("..", import.meta.url).pathname;
const config = fs.readFileSync(path.join(root, "astro.config.mjs"), "utf8");
const start = config.indexOf("ph: [");
const include = config.slice(start, config.indexOf("],", start));
const included = new Set([...include.matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]));
const used = new Map();

function scan(dir) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const file = path.join(dir, entry.name);
		if (entry.isDirectory()) scan(file);
		else if (/\.(astro|[cm]?tsx?|[cm]?jsx?)$/.test(entry.name)) {
			const source = fs.readFileSync(file, "utf8");
			for (const match of source.matchAll(/ph:([a-z0-9-]+)/g)) {
				if (!used.has(match[1])) used.set(match[1], path.relative(root, file));
			}
		}
	}
}

scan(path.join(root, "src"));
const missing = [...used].filter(([name]) => !included.has(name));
if (missing.length) {
	console.error("Missing Phosphor icons:");
	for (const [name, file] of missing) console.error(`- ph:${name} (${file})`);
	process.exit(1);
}

console.log(`Icon check passed (${used.size} Phosphor icons).`);
