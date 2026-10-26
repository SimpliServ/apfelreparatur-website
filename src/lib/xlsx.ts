import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";

export type Cell = string | number | null | undefined;
export type SheetData = { name: string; rows: Cell[][]; hidden?: number[]; widths?: number[]; state?: "hidden" };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const unesc = (s: string) => s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
	.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
const colName = (i: number) => { let s = ""; for (i++; i > 0; i = Math.floor((i - 1) / 26)) s = String.fromCharCode(65 + ((i - 1) % 26)) + s; return s; };
const colIndex = (ref: string) => { let n = 0; for (const ch of ref.replace(/\d+$/, "")) n = n * 26 + ch.charCodeAt(0) - 64; return n - 1; };
export const safeSheetName = (s: string) => s.replace(/[\\/?*[\]:]/g, " ").slice(0, 31).trim() || "Blatt";

function sheetXml(sheet: SheetData): string {
	const cols = Math.max(0, ...sheet.rows.map(r => r.length));
	const colDefs = Array.from({ length: cols }, (_, i) => {
		const w = sheet.widths?.[i] ?? 12;
		return '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"' + (sheet.hidden?.includes(i) ? ' hidden="1"' : "") + "/>";
	}).join("");
	const rows = sheet.rows.map((row, r) => '<row r="' + (r + 1) + '">' + row.map((v, c) => {
		if (v === null || v === undefined || v === "") return "";
		const ref = colName(c) + (r + 1);
		const style = r === 0 ? ' s="1"' : "";
		if (typeof v === "number") return '<c r="' + ref + '" s="' + (r === 0 ? 1 : 2) + '"><v>' + v + "</v></c>";
		return '<c r="' + ref + '"' + style + ' t="inlineStr"><is><t xml:space="preserve">' + esc(v) + "</t></is></c>";
	}).join("") + "</row>").join("");
	return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
		+ '<sheetViews><sheetView workbookViewId="0"><pane xSplit="1" ySplit="1" topLeftCell="B2" activePane="bottomRight" state="frozen"/></sheetView></sheetViews>'
		+ (colDefs ? "<cols>" + colDefs + "</cols>" : "") + "<sheetData>" + rows + "</sheetData></worksheet>";
}

export function writeXlsx(sheets: SheetData[]): Uint8Array {
	const names = new Set<string>();
	const list = sheets.map(s => { let n = safeSheetName(s.name), i = 2; while (names.has(n.toLowerCase())) n = safeSheetName(s.name).slice(0, 28) + " " + i++; names.add(n.toLowerCase()); return { ...s, name: n }; });
	const files: Record<string, Uint8Array> = {
		"[Content_Types].xml": strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
			+ list.map((_, i) => '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join("") + "</Types>"),
		"_rels/.rels": strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'),
		"xl/workbook.xml": strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'
			+ list.map((s, i) => '<sheet name="' + esc(s.name) + '" sheetId="' + (i + 1) + '"' + (s.state === "hidden" ? ' state="hidden"' : "") + ' r:id="rId' + (i + 1) + '"/>').join("") + "</sheets></workbook>"),
		"xl/_rels/workbook.xml.rels": strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
			+ list.map((_, i) => '<Relationship Id="rId' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>').join("")
			+ '<Relationship Id="rId' + (list.length + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'),
		"xl/styles.xml": strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="4" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>'),
	};
	list.forEach((s, i) => { files["xl/worksheets/sheet" + (i + 1) + ".xml"] = strToU8(sheetXml(s)); });
	return zipSync(files, { level: 6 });
}

const text = (xml: string) => [...xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map(m => unesc(m[1])).join("");
const num = (v: string) => (/^-?\d+(\.\d+)?(E[-+]?\d+)?$/i.test(v) ? String(Number(Number(v).toPrecision(12))) : v);
const attr = (tag: string, name: string) => new RegExp("\\s" + name + '="([^"]*)"').exec(tag)?.[1];

/** Reads all sheets as text grids. Numbers come back as written by Excel ("119.99"). */
export function readXlsx(bytes: Uint8Array): { name: string; rows: string[][] }[] {
	const zip = unzipSync(bytes);
	const file = (p: string) => (zip[p] ? strFromU8(zip[p]) : "");
	const shared = [...file("xl/sharedStrings.xml").matchAll(/<si>([\s\S]*?)<\/si>/g)].map(m => text(m[1]));
	const rels = Object.fromEntries([...file("xl/_rels/workbook.xml.rels").matchAll(/<Relationship\b[^>]*>/g)].map(m => [attr(m[0], "Id"), attr(m[0], "Target")]));
	return [...file("xl/workbook.xml").matchAll(/<sheet\b[^>]*>/g)].map(m => {
		const target = String(rels[attr(m[0], "r:id") ?? ""] ?? "").replace(/^\/?(xl\/)?/, "");
		const xml = file("xl/" + target);
		const rows: string[][] = [];
		for (const row of xml.matchAll(/<row\b([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/g)) {
			const r = Number(attr(row[0], "r") ?? rows.length + 1) - 1;
			const out: string[] = [];
			let next = 0;
			for (const c of (row[2] ?? "").matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
				const ref = attr(c[0], "r");
				const i = ref ? colIndex(ref) : next;
				next = i + 1;
				const type = attr(c[0], "t"), body = c[2] ?? "";
				const v = /<v>([\s\S]*?)<\/v>/.exec(body)?.[1];
				out[i] = type === "s" ? shared[Number(v)] ?? "" : type === "inlineStr" ? text(body) : v === undefined ? "" : type === "str" || type === "b" || type === "e" ? unesc(v) : num(unesc(v));
			}
			rows[r] = Array.from(out, x => x ?? "");
		}
		return { name: unesc(attr(m[0], "name") ?? ""), rows: Array.from(rows, x => x ?? []) };
	});
}
