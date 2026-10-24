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
// ICO with one embedded 32px PNG (supported by all current browsers).
const p32 = await png(32);
const head = Buffer.alloc(22);
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(1, 4);
head.writeUInt8(32, 6); head.writeUInt8(32, 7); head.writeUInt16LE(1, 10); head.writeUInt16LE(32, 12);
head.writeUInt32LE(p32.length, 14); head.writeUInt32LE(22, 18);
writeFileSync("public/favicon.ico", Buffer.concat([head, p32]));
console.log("icons written");
