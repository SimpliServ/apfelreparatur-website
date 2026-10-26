import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, writeFileSync } from "node:fs";
import { applyChanges, brandPrefix, checkChanges, closest, defaultSort, exportSheets, exportStamp, formatCell, groupSeries, hasCoverDisplay, headerSlot, INFO_SHEET, normTitle, matchTitle, overlaps, parseCell, parseGrid, parseSheet, planImport, resolvePart, sheetTarget, sortRows, withPrefix, type ExportDevice, type PlanDevice, type RepairRow } from "../src/lib/prices.ts";
import { readXlsx, writeXlsx } from "../src/lib/xlsx.ts";

const order = ["display", "akku", "kamera", "ladebuchse", "face-id"];
const rows: RepairRow[] = [
	{ repair: "display", quality: "original", price: 579.99, price_from: false, note: "" },
	{ repair: "display", quality: "drittanbieter", price: 219.99, price_from: false, note: "" },
	{ repair: "ladebuchse", quality: "standard", price: 139.99, price_from: false, note: "Hinweis" },
	{ repair: "face-id", quality: "standard", price: 69.95, price_from: true, note: "" },
];

test("cells parse German prices and ab prefix", () => {
	assert.deepEqual(parseCell("89,99"), { price: 89.99, price_from: false });
	assert.deepEqual(parseCell(" ab 69,9 € "), { price: 69.9, price_from: true });
	assert.deepEqual(parseCell("Ab69.95"), { price: 69.95, price_from: true });
	assert.deepEqual(parseCell("120"), { price: 120, price_from: false });
	assert.equal(parseCell(""), null);
	assert.equal(parseCell("-"), null);
	assert.deepEqual(parseCell("1.049,99 €"), { price: 1049.99, price_from: false });
	for (const bad of ["0", "1.234", "12,345", "abc", "-5", "ab", "12.345,00"]) assert.equal(parseCell(bad), "invalid", bad);
	assert.equal(formatCell(rows[3]), "ab 69,95");
	assert.equal(formatCell({ price: 120, price_from: false }), "120,00");
});

test("changes update, insert in schema order and remove rows", () => {
	const out = applyChanges(rows, [
		{ repair: "display", quality: "original", price: 549.99 },
		{ repair: "akku", quality: "standard", price: 89.99, price_from: true },
		{ repair: "face-id", price: null },
		{ repair: "ladebuchse", quality: "standard", price: 129.99, price_from: true },
	], order);
	assert.deepEqual(out.map(r => [r.repair, r.quality, r.price, r.price_from]), [
		["display", "original", 549.99, false],
		["display", "drittanbieter", 219.99, false],
		["akku", "standard", 89.99, true],
		["ladebuchse", "standard", 129.99, true],
	]);
	assert.equal(out[3].note, "Hinweis");
	assert.equal(rows[0].price, 579.99);
});

test("unknown repairs, bad prices and duplicate rows are rejected", () => {
	const qualities = ["original", "drittanbieter", "standard"];
	assert.equal(checkChanges([{ repair: "display", quality: "original", price: 1 }], order, qualities), null);
	assert.equal(checkChanges([{ repair: "toaster", price: 1 }], order, qualities), "UNKNOWN_REPAIR");
	assert.equal(checkChanges([{ repair: "akku", quality: "gold", price: 1 }], order, qualities), "UNKNOWN_REPAIR");
	assert.equal(checkChanges([{ repair: "akku", price: 0 }], order, qualities), "INVALID_INPUT");
	assert.equal(checkChanges([{ repair: "akku", price: 1 }, { repair: "akku", quality: "standard", price: 2 }], order, qualities), "INVALID_INPUT");
});

const schema = ["display", "akku", "selfie-kamera", "kamera", "backcover", "ladebuchse", "lautsprecher", "face-id", "power-button", "home-button", "sim", "kopfhoererbuchse", "wasserschaden", "software-fehler", "software-update", "fehleranalyse"];

test("Excel headers map to repair slots", () => {
	const map = (h: string) => headerSlot(h, schema);
	assert.equal(map("Akku Original"), "akku:original");
	assert.equal(map("Akku Drittanbieter**"), "akku:drittanbieter");
	assert.equal(map("Display"), "display:standard");
	assert.equal(map("Selfie Kamera"), "selfie-kamera:standard");
	assert.equal(map("Ladestecker"), "ladebuchse:standard");
	assert.equal(map("Ohrlautsprecher"), "lautsprecher:standard");
	assert.equal(map("Fehleranaylse"), "fehleranalyse:standard");
	assert.equal(map("Einschaltknopf"), "power-button:standard");
	assert.equal(map("Kopfhörerbuchse"), "kopfhoererbuchse:standard");
	assert.equal(map("Sim Karten Leser"), "sim:standard");
	assert.equal(map("Wasserschaden-Behebung"), "wasserschaden:standard");
	assert.equal(map("Face ID"), "face-id:standard");
	assert.equal(map("Toaster"), null);
});

test("pasted sheet rows match existing models and keep new ones", () => {
	const sheet = parseSheet("Samsung\tAkku\tDisplay\tFoo\r\nS26\t99,99\t199,99\tx\r\nS27 Ultra \t-\t1.099,99\t\r\n\t\t\t\r\n", schema);
	assert.equal(sheet.corner, "Samsung");
	assert.deepEqual(sheet.unknown, ["Foo"]);
	assert.deepEqual(sheet.rows, [
		{ title: "S26", cells: { "akku:standard": "99,99", "display:standard": "199,99" } },
		{ title: "S27 Ultra", cells: { "akku:standard": "-", "display:standard": "1.099,99" } },
	]);
	const devices = ["Galaxy S26", "Galaxy S26 Plus", "Galaxy S25", "Galaxy Z Fold 7"].map(title => ({ title }));
	const prefix = brandPrefix(devices.map(d => d.title));
	assert.equal(prefix, "Galaxy");
	assert.equal(matchTitle("S26", devices, prefix)?.title, "Galaxy S26");
	assert.equal(matchTitle("S27 Ultra", devices, prefix), null);
	assert.equal(withPrefix("S27 Ultra", prefix), "Galaxy S27 Ultra");
	assert.equal(matchTitle("Xiaomi 13 Pro5G", [{ title: "Xiaomi 13 Pro 5G" }])?.title, "Xiaomi 13 Pro 5G");
	assert.equal(matchTitle("12,9″ iPad Pro 7 (2024)", [{ title: "12,9″ iPad Pro 7" }, { title: "11″ iPad Pro 5 (2024)" }])?.title, "12,9″ iPad Pro 7");
	assert.equal(brandPrefix(["Xiaomi 15", "Redmi Note 14", "POCO F6"]), "");
});

test("new split models point at the combined existing model", () => {
	const pool = [{ title: "Galaxy A50 / A50s / A51 / A52 / A53", series: "Galaxy A" }, { title: "Galaxy A54 / A55 / A56 / A57", series: "Galaxy A" }, { title: "Galaxy S26", series: "Galaxy S" }];
	assert.deepEqual(overlaps("Galaxy A54 / A55", pool, "Galaxy").map(d => d.title), ["Galaxy A54 / A55 / A56 / A57"]);
	assert.deepEqual(overlaps("Galaxy S27", pool, "Galaxy"), []);
	assert.equal(closest("Galaxy A56 / A57", pool)?.series, "Galaxy A");
});

const labels: Record<string, string> = { display: "Display", akku: "Akku", "selfie-kamera": "Selfie-Kamera", kamera: "Hauptkamera", backcover: "Rückseite", ladebuchse: "Ladebuchse", lautsprecher: "Ohrlautsprecher", "face-id": "Face ID", "power-button": "Power-Button", "home-button": "Home-Button", sim: "SIM-Kartenleser", kopfhoererbuchse: "Kopfhörerbuchse", wasserschaden: "Wasserschaden-Behandlung", "software-fehler": "Software-Fehler beheben", "software-update": "Software-Update", fehleranalyse: "Fehleranalyse" };
const qLabel: Record<string, string> = { original: "Original", drittanbieter: "Drittanbieter", standard: "" };
const brandNames: Record<string, string> = { apple: "Apple", samsung: "Samsung", google: "Google" };
const row = (repair: string, quality: string, price: number, price_from = false): RepairRow => ({ repair: repair as RepairRow["repair"], quality: quality as RepairRow["quality"], price, price_from, note: "" });
const fleet: ExportDevice[] = [
	{ id: "01APPLE17", title: "iPhone 17 Pro Max", brand: "apple", category: "smartphone", series: "iPhone 17", sort: 1, repairs: [row("display", "original", 579.99), row("display", "drittanbieter", 219.99), row("face-id", "standard", 69.95, true), row("software-fehler", "standard", 39.95, true)] },
	{ id: "01IPAD", title: "12,9″ iPad Pro 7 & Co", brand: "apple", category: "tablet", series: "iPad Pro", sort: 1, repairs: [row("display", "standard", 699.99), row("kopfhoererbuchse", "standard", 49.99)] },
	{ id: "01FOLD", title: "Google Pixel 9 Pro Fold", brand: "google", category: "smartphone", series: "", sort: 2, repairs: [row("display", "standard", 1049.99), row("backcover", "standard", 149.99), row("wasserschaden", "standard", 49.99), row("sim", "standard", 69.99), row("kamera", "standard", 239.99)] },
	{ id: "01S26", title: "Galaxy S26", brand: "samsung", category: "smartphone", series: "Galaxy S", sort: 3, repairs: Object.keys(labels).map((k, i) => row(k, "standard", 10 + i + 0.99)) },
];

function roundtrip(sheets: { name: string; rows: string[][] }[]) {
	const back = new Map<string, { title: string; series?: string; brand: string; category: string; cells: Record<string, string> }>();
	for (const s of sheets) {
		const grid = parseGrid(s.rows, Object.keys(labels), labels);
		assert.deepEqual(grid.unknown, [], s.name);
		const target = sheetTarget(s.name, grid.corner, Object.keys(brandNames), brandNames);
		assert.ok(target, s.name);
		for (const r of grid.rows) back.set(r.id!, { ...r, ...target });
	}
	for (const d of fleet) {
		const r = back.get(d.id);
		assert.ok(r, d.title);
		assert.equal(r.title, d.title);
		assert.equal(r.series ?? "", d.series);
		assert.deepEqual([r.brand, r.category], [d.brand, d.category]);
		const filled = Object.entries(r.cells).filter(([, v]) => v);
		assert.equal(filled.length, d.repairs.length, d.title);
		for (const [key, raw] of filled) {
			const want = d.repairs.find(x => key === x.repair + ":" + x.quality);
			assert.deepEqual(parseCell(raw), { price: want!.price, price_from: !!want!.price_from }, d.title + " " + key);
		}
	}
}

test("Excel export reads back unchanged (roundtrip)", () => {
	const sheets = exportSheets(fleet, {
		repairOrder: Object.keys(labels), brandOrder: ["apple", "samsung", "google"],
		sheetName: (b, c) => brandNames[b] + " " + (c === "tablet" ? "Tablets" : "Smartphones"),
		slotLabel: (r, q) => labels[r] + (qLabel[q] ? " " + qLabel[q] : ""),
	});
	assert.deepEqual(sheets.map(s => s.name), ["Apple Smartphones", "Apple Tablets", "Samsung Smartphones", "Google Smartphones"]);
	assert.deepEqual(sheets[0].rows[0], ["Modell", "Serie", "Display Original", "Display Drittanbieter", "Face ID", "Software-Fehler beheben", "ID"]);
	const file = writeXlsx(sheets);
	roundtrip(readXlsx(file));
	if (process.env.XLSX_OUT) writeFileSync(process.env.XLSX_OUT, file);
});

test("files re-saved by a spreadsheet app (shared strings) still import", { skip: !process.env.XLSX_RESAVED }, () => {
	roundtrip(readXlsx(new Uint8Array(readFileSync(process.env.XLSX_RESAVED!))));
});

const T0 = "2026-10-13T10:00:00.000Z";
const shop: PlanDevice[] = [
	{ id: "A", title: "iPhone 17", brand: "apple", category: "smartphone", series: "iPhone 17", sort: 2, status: "published", updatedAt: "2026-10-12T00:00:00.000Z", repairs: [row("display", "original", 469.99), row("akku", "original", 119.99)] },
	{ id: "B", title: "iPhone 17 Pro", brand: "apple", category: "smartphone", series: "iPhone 17", sort: 1, status: "published", updatedAt: "2026-10-12T00:00:00.000Z", repairs: [row("display", "original", 499.99)] },
	{ id: "C", title: "iPhone 16", brand: "apple", category: "smartphone", series: "iPhone 16", sort: 3, status: "published", updatedAt: "2026-10-13T12:00:00.000Z", repairs: [row("display", "original", 349.99)] },
	{ id: "D", title: "iPhone 15", brand: "apple", category: "smartphone", series: "iPhone 15", sort: 4, status: "published", pending: true, updatedAt: "2026-10-01T00:00:00.000Z", repairs: [row("display", "original", 269.99)] },
];
const grid = (rows: string[][]) => [{ brand: "apple", category: "smartphone", sheet: parseGrid([["Modell", "Serie", "Display Original", "Akku Original", "ID"], ...rows], Object.keys(labels), labels) }];

test("import keeps prices on blank cells, removes only on '-' or when asked", () => {
	const sheets = grid([["iPhone 17", "", "", "-", "A"]]);
	const safe = planImport(sheets, shop, { blankRemoves: false, exportedAt: T0 });
	assert.deepEqual(safe.updates.map(u => [u.device.id, u.cells, u.series]), [["A", { "akku:original": "-" }, undefined]]);
	assert.equal(safe.removals, 1);
	const wipe = planImport(sheets, shop, { blankRemoves: true, exportedAt: T0 });
	assert.deepEqual(wipe.updates[0].cells, { "display:original": "", "akku:original": "-" });
	assert.equal(wipe.updates[0].series, "");
	assert.equal(wipe.removals, 2);
});

test("import skips rows changed after the export, open drafts and shifted IDs", () => {
	const plan = planImport(grid([
		["iPhone 16", "iPhone 16", "299,99", "", "C"],
		["iPhone 15", "iPhone 15", "199,99", "", "D"],
		["iPhone 17 Pro", "iPhone 17", "1,00", "", "A"],
		["iPhone 17 (2025)", "iPhone 17", "", "", "A"],
	]), shop, { blankRemoves: false, exportedAt: T0 });
	assert.deepEqual(plan.skipped, [{ title: "iPhone 16", reason: "stale" }, { title: "iPhone 15", reason: "pending" }, { title: "iPhone 17 Pro", reason: "mismatch" }]);
	assert.deepEqual(plan.updates.map(u => [u.device.id, u.title, u.cells]), [["A", "iPhone 17 (2025)", {}]]);
	assert.equal(plan.creates.length, 0);
	const noStamp = planImport(grid([["iPhone 16", "iPhone 16", "299,99", "", "C"]]), shop, { blankRemoves: false });
	assert.deepEqual(noStamp.updates[0].cells, { "display:original": "299,99" });
});

test("export stamp survives the xlsx roundtrip as a hidden sheet", () => {
	const file = writeXlsx([{ name: "Apple Smartphones", rows: [["Modell"], ["iPhone 17"]] }, { name: INFO_SHEET, rows: [["Exportiert", T0]], state: "hidden" }]);
	const back = readXlsx(file);
	assert.deepEqual(back.map(s => s.name), ["Apple Smartphones", INFO_SHEET]);
	assert.equal(exportStamp(back), T0);
	assert.equal(exportStamp([{ name: INFO_SHEET, rows: [["Exportiert", "gestern"]] }]), null);
	assert.equal(exportStamp([{ name: "Apple", rows: [["Exportiert", T0]] }]), null);
	if (process.env.XLSX_STAMPED) assert.match(exportStamp(readXlsx(new Uint8Array(readFileSync(process.env.XLSX_STAMPED)))) ?? "", /^\d{4}-/);
});

test("plus models stay distinct and match their long form", () => {
	assert.notEqual(normTitle("Galaxy Tab S10 FE+"), normTitle("Galaxy Tab S10 FE"));
	assert.equal(matchTitle("S25+", [{ title: "Galaxy S25" }, { title: "Galaxy S25 Plus" }], "Galaxy")?.title, "Galaxy S25 Plus");
	const tabs: PlanDevice[] = ["Galaxy Tab S10 FE", "Galaxy Tab S10 FE+"].map((title, i) => ({ id: "T" + i, title, brand: "samsung", category: "tablet", series: "", sort: i, status: "published", repairs: [] }));
	const sheet = [{ brand: "samsung", category: "tablet", sheet: parseGrid([["Modell", "Display", "ID"], ["Galaxy Tab S10 FE+", "199,99", "T1"]], Object.keys(labels), labels) }];
	const plan = planImport(sheet, tabs, { blankRemoves: false });
	assert.deepEqual(plan.skipped, []);
	assert.deepEqual(plan.updates.map(u => u.device.id), ["T1"]);
});

test("planImport: header without part maps to the brand's only part (Original), stays standard when ambiguous", () => {
	const row = (repair: string, quality: string, price: number): RepairRow => ({ repair, quality, price, price_from: false, note: "" });
	const phones: PlanDevice[] = [
		{ id: "S1", title: "Galaxy S24", brand: "samsung", category: "smartphone", series: "", sort: 1, status: "published", repairs: [row("ladebuchse", "original", 99.99)] },
		{ id: "I1", title: "iPhone 16", brand: "apple", category: "smartphone", series: "", sort: 1, status: "published", repairs: [row("display", "original", 299.99), row("display", "drittanbieter", 179.99)] },
	];
	const sheet = (brand: string, head: string[], cells: string[]) => [{ brand, category: "smartphone", sheet: parseGrid([["Modell", ...head], cells], Object.keys(labels), labels) }];
	const s = planImport(sheet("samsung", ["Ladebuchse"], ["Galaxy S24", "109,99"]), phones, { blankRemoves: false });
	assert.deepEqual(s.updates[0].cells, { "ladebuchse:original": "109,99" });
	const created = planImport(sheet("samsung", ["Ladebuchse"], ["Galaxy S99", "89,99"]), phones, { blankRemoves: false });
	assert.deepEqual(created.creates[0].cells, { "ladebuchse:original": "89,99" });
	const a = planImport(sheet("apple", ["Display"], ["iPhone 16", "249,99"]), phones, { blankRemoves: false });
	assert.deepEqual(a.updates[0].cells, { "display:standard": "249,99" });
});

test("sortRows: empty first ascending, highest first descending, groups and new rows stay put", () => {
	const rows = [
		{ id: "new", g: "a", p: null, isNew: true }, { id: "a1", g: "a", p: 50 }, { id: "a2", g: "a", p: null }, { id: "a3", g: "a", p: 90 }, { id: "a4", g: "a", p: 50 },
		{ id: "b1", g: "b", p: 10 }, { id: "b2", g: "b", p: null },
	];
	const ids = (dir: "asc" | "desc") => sortRows(rows, r => r.g, r => r.p, dir, r => !!r.isNew).map(r => r.id);
	assert.deepEqual(ids("asc"), ["new", "a2", "a1", "a4", "a3", "b2", "b1"]);
	assert.deepEqual(ids("desc"), ["new", "a3", "a1", "a4", "a2", "b1", "b2"]);
});

test("groupSeries: series blocks in first-appearance order per brand, new rows on top", () => {
	const d = (id: string, series: string, brand = "samsung", isNew = false) => ({ id, series, brand, category: "smartphone", isNew });
	const rows = [d("fold8", "Fold"), d("flip8", "Flip"), d("new", "S", "samsung", true), d("fold7", "Fold"), d("s26", "S"), d("flip7", "Flip"), d("ip", "iPhone", "apple")];
	assert.deepEqual(groupSeries(rows, r => r.isNew).map(r => r.id), ["new", "fold8", "fold7", "flip8", "flip7", "s26", "ip"]);
});

test("defaultSort: top of own series, top of brand for a new series", () => {
	const g = [{ sort: 83, series: "Fold" }, { sort: 90, series: "Fold" }, { sort: 96, series: "S" }, { sort: 127, series: "S" }, { sort: 128, series: "A" }];
	assert.equal(defaultSort(g, "Fold"), 82);
	assert.equal(defaultSort(g, "S"), 95);
	assert.equal(defaultSort(g, "A"), 128);
	assert.equal(defaultSort(g, "Neu"), 82);
	assert.equal(defaultSort([], "S"), 1);
});

test("outer display: foldables detected, Excel header maps to its own column", () => {
	for (const t of ["Galaxy Z Fold 8 Ultra", "Galaxy Z Flip 7 FE", "iPhone Duo", "Google Pixel 10 Pro Fold"]) assert.ok(hasCoverDisplay(t), t);
	for (const t of ["Galaxy S26", "iPhone 17 Pro", "Galaxy A57"]) assert.ok(!hasCoverDisplay(t), t);
	const repairs = ["display", "aussendisplay", "akku"], labels = { display: "Display", aussendisplay: "Außendisplay" };
	assert.equal(headerSlot("Außendisplay", repairs, labels), "aussendisplay:standard");
	assert.equal(headerSlot("Aussendisplay", repairs, labels), "aussendisplay:standard");
	assert.equal(headerSlot("Display Original", repairs, labels), "display:original");
});

test("parallel edits merge: saves of different cells on the latest version keep both, a stale part-less cell lands on Original", () => {
	const order = ["display", "akku", "ladebuchse"];
	const r = (repair: string, quality: string, price: number): RepairRow => ({ repair, quality, price, price_from: false, note: "" });
	let latest = [r("display", "original", 199.99), r("akku", "original", 89.99)];
	const save = (changes: { repair: string; quality?: string; price: number | null }[], pool = new Set<string>()) => {
		latest = applyChanges(latest, changes.map(c => resolvePart(c, latest, () => pool)), order);
	};
	save([{ repair: "display", quality: "standard", price: 149.99 }]);
	save([{ repair: "akku", quality: "original", price: 79.99 }]);
	save([{ repair: "ladebuchse", quality: "standard", price: 119.99 }], new Set(["ladebuchse:original"]));
	assert.deepEqual(latest.map(x => [x.repair, x.quality, x.price]), [["display", "original", 149.99], ["akku", "original", 79.99], ["ladebuchse", "original", 119.99]]);
	const apple = [r("display", "original", 299.99), r("display", "drittanbieter", 179.99)];
	assert.equal(resolvePart({ repair: "display", quality: "standard", price: 1 }, apple, () => new Set()).quality, "standard");
});


test("services (Wasserschaden, Software, Fehleranalyse) never get a part, other repairs keep theirs", () => {
	const order = ["display", "wasserschaden", "fehleranalyse"];
	const r = (repair: string, quality: string, price: number): RepairRow => ({ repair, quality, price, price_from: false, note: "" });
	const out = applyChanges([r("display", "original", 99.99), r("wasserschaden", "original", 49.99)], [{ repair: "fehleranalyse", quality: "original", price: 29.99 }, { repair: "wasserschaden", quality: "original", price: 59.99 }], order);
	assert.deepEqual(out.map(x => [x.repair, x.quality, x.price]), [["display", "original", 99.99], ["wasserschaden", "standard", 59.99], ["fehleranalyse", "standard", 29.99]]);
	assert.equal(resolvePart({ repair: "fehleranalyse", quality: "standard", price: 1 }, [], () => new Set(["fehleranalyse:original"])).quality, "standard");
});

