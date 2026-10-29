// Builds favicon.ico, apple-touch-icon.png and the manifest icons from public/favicon.svg.
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";

const svg = readFileSync("public/favicon.svg");
const png = (size) => sharp(svg, { density: 72 * (size / 64) * 2 }).resize(size, size).png().toBuffer();
// Apple touch icons get no rounding from us: iOS masks them itself.
const square = Buffer.from(readFileSync("public/favicon.svg", "utf8").replace('rx="14"', 'rx="0"'));
writeFileSync("public/apple-touch-icon.png", await sharp(square, { density: 600 }).resize(180, 180).png().toBuffer());
writeFileSync("public/icon-192.png", await png(192));
writeFileSync("public/icon-512.png", await png(512));
// ICO with 16/32/48px PNGs; Google Search wants a favicon in a multiple of 48px.
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map(png));
const head = Buffer.alloc(6 + 16 * sizes.length);
head.writeUInt16LE(1, 2); head.writeUInt16LE(sizes.length, 4);
let offset = head.length;
sizes.forEach((s, i) => {
	const e = 6 + 16 * i;
	head.writeUInt8(s, e); head.writeUInt8(s, e + 1); head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
	head.writeUInt32LE(pngs[i].length, e + 8); head.writeUInt32LE(offset, e + 12);
	offset += pngs[i].length;
});
writeFileSync("public/favicon.ico", Buffer.concat([head, ...pngs]));
console.log("icons written");
