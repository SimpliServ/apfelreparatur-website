import { useEffect, useMemo, useRef, useState, type ClipboardEvent, type CSSProperties, type KeyboardEvent } from "react";
import { Badge, Banner, Button, buttonVariants, Checkbox, Dialog, DropdownMenu, InputArea, InputGroup, Popover, Select, SkeletonLine, Tabs, Toast } from "@cloudflare/kumo";
import {
	ArrowRightIcon as ArrowRight, ArrowSquareOutIcon as ArrowSquareOut, DownloadSimpleIcon as DownloadSimple, ImageSquareIcon as ImageSquare, InfoIcon as Info,
	ArrowClockwiseIcon as ArrowClockwise, ArrowCounterClockwiseIcon as ArrowCounterClockwise, MagnifyingGlassIcon as MagnifyingGlass, PlusIcon as Plus, CaretDownIcon as CaretDown, DotsThreeIcon as DotsThree, QuestionIcon as Question, UploadSimpleIcon as UploadSimple, WarningIcon as Warning, XIcon as X,
	ArrowUpIcon as ArrowUp, ArrowDownIcon as ArrowDown,
} from "@phosphor-icons/react";
import { Link, MediaPickerModal, type ContentEditorPanelContext, type ContentListColumnCellContext, type ContentListColumnExtension, type ContentEditorPanelExtension } from "@emdash-cms/admin";
import { useBlocker } from "@tanstack/react-router";
import { prices as copy } from "../i18n/prices";
import { brandLabels, repairLabels } from "../i18n/ui";
import {
	BASE_SLOTS, brandPrefix, byCategory, categoryOf, COVER_DISPLAY, deviceFacts, exportSheets, exportStamp, formatCell, groupSeries, hasCoverDisplay, INFO_EXPORTED, INFO_SHEET, matchTitle, normTitle, overlaps, parseCell, parseGrid, parseSheet, planImport, QUALITY_ORDER, sameCell as sameRows, sheetTarget, slot, sortRows,
	type ImportSheet, type PriceChange, type RepairRow, type SortDir,
} from "../lib/prices";
import { readXlsx, writeXlsx } from "../lib/xlsx";
import { NAV_KEYS, nextCell, type NavKey, type Pos } from "../lib/grid";

type Pic = { id: string; url: string; alt?: string; storageKey?: string };
type Device = { id: string; slug: string | null; title: string; brand: string; category: string; series: string; sort: number; status: string; pending: boolean; updatedAt: string; repairs: RepairRow[]; image: Pic | null; isNew?: boolean; fixedSort?: boolean };
type Options = { repairs: string[]; qualities: string[]; brands: string[]; categories: string[] };
type Edits = Record<string, Record<string, string>>;
type Meta = Record<string, { title?: string; series?: string; image?: Pic | null }>;
type Col = { key: string; repair: string; quality: string };
type Notice = { kind: "ok" | "error"; lines: string[] };

async function call<T>(route: string, body: unknown): Promise<T> {
	const res = await fetch("/_emdash/api/plugins/apfel-prices/" + route, {
		method: "POST", credentials: "same-origin",
		headers: { "X-EmDash-Request": "1", "Content-Type": "application/json" }, body: JSON.stringify(body),
	});
	const json = await res.json().catch(() => null) as { success?: boolean; data?: T & { ok?: boolean; message?: string }; error?: { message?: string } } | null;
	if (!res.ok || !json?.success) throw new Error(json?.error?.message ?? copy.error.UNAVAILABLE);
	if (json.data?.ok === false) throw new Error(json.data.message ?? copy.error.UNAVAILABLE);
	return json.data as T;
}

async function loadAll(onOptions?: (o: Options) => void) {
	const all: Device[] = []; let cursor: string | null | undefined; let now = "";
	do {
		const page = await call<{ devices: Device[]; cursor: string | null; options?: Options; now?: string }>("list", cursor ? { cursor } : { all: true });
		if (page.options) onOptions?.(page.options);
		if (page.now) now = page.now;
		all.push(...page.devices); cursor = page.cursor;
	} while (cursor);
	return { all, now };
}
/** Always exports the current server state, stamped with server time so a later import can spot rows changed since. */
async function download() {
	let opts: Options | null = null;
	const { all: devices, now } = await loadAll(o => { opts = o; });
	if (!opts) throw new Error(copy.error.UNAVAILABLE);
	const o = opts as Options;
	const sheets = [
		...exportSheets(devices, { repairOrder: o.repairs, brandOrder: Object.keys(brandLabels), sheetName, slotLabel: label }),
		{ name: INFO_SHEET, rows: [[INFO_EXPORTED, now], [copy.infoNoteLabel, copy.infoNote]], state: "hidden" as const },
	];
	const blob = new Blob([writeXlsx(sheets) as BlobPart], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
	const a = document.createElement("a");
	a.href = URL.createObjectURL(blob);
	a.download = copy.exportFile(new Date().toISOString().slice(0, 10));
	a.click();
	setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
const euro = (n: number) => formatCell({ price: n, price_from: false });
/** Route-typed links into the admin; the plugin is not part of the admin's route type registry. */
const AdminLink = Link as unknown as (p: { to: string; params?: Record<string, string>; search?: Record<string, string>; className?: string; children: React.ReactNode; title?: string; "aria-label"?: string }) => React.ReactElement;
type ButtonLook = { variant?: "secondary" | "ghost"; size?: "xs" | "sm" | "base" | "lg"; shape?: "base" | "square" };
/** Same as EmDash's RouterLinkButton: a router link styled with Kumo button classes. */
function LinkButton({ variant, size, shape, icon, className, children, ...link }: ButtonLook & { icon?: React.ReactNode; to: string; params?: Record<string, string>; search?: Record<string, string>; className?: string; children?: React.ReactNode; title?: string; "aria-label"?: string }) {
	return <AdminLink {...link} className={[buttonVariants({ variant, size, shape }), "flex items-center no-underline!", className].filter(Boolean).join(" ")}>{icon}{children}</AdminLink>;
}
const toPrices = (search: Record<string, string> = {}) => ({ to: "/plugins/$pluginId/$", params: { pluginId: "apfel-prices", _splat: "prices" }, search });
const toEditor = (id: string) => ({ to: "/content/$collection/$id", params: { collection: "devices", id } });

const cellOf = (d: Device, key: string) => d.repairs.find(r => slot(r.repair, r.quality) === key);
const sameCell = (d: Device, key: string, raw: string) => sameRows(d.repairs, key, raw);
function changesOf(d: Device, edits: Record<string, string> = {}): PriceChange[] | "invalid" {
	const out: PriceChange[] = [];
	for (const [key, raw] of Object.entries(edits)) {
		const v = parseCell(raw);
		if (v === "invalid") return "invalid";
		const [repair, quality] = key.split(":");
		const old = cellOf(d, key);
		if (v === null) { if (old) out.push({ repair, quality, price: null }); continue; }
		if (!old || old.price !== v.price || !!old.price_from !== v.price_from) out.push({ repair, quality, ...v });
	}
	return out;
}
const label = (repair: string, quality: string) => (repairLabels.de[repair] ?? repair) + (copy.quality[quality] ? " " + copy.quality[quality] : "");
const tidy = (raw: string) => { const v = parseCell(raw); return v && v !== "invalid" ? formatCell(v) : v === null ? "" : raw; };
const sheetName = (brand: string, category: string) => (brandLabels[brand] ?? brand) + " " + (copy.categories[category] ?? category);
let newId = 0;

const css = `
.mp-wrap{overflow:auto;max-height:max(20rem,calc(100vh - 17rem))}
.mp-table{border-collapse:separate;border-spacing:0;font-size:.8125rem;width:100%}
.mp-table th,.mp-table td{border-bottom:1px solid var(--color-kumo-line);padding:.1rem .15rem;white-space:nowrap}
.mp-table td+td,.mp-table th+th{border-left:1px solid var(--color-kumo-hairline)}
.mp-table thead th{position:sticky;top:0;z-index:2;background:color-mix(in srgb,var(--color-kumo-tint) 50%,var(--color-kumo-base));text-align:start;font-weight:500;vertical-align:bottom;padding:.4rem .4rem .35rem}
.mp-table thead th small{display:block;font-size:.75rem;font-weight:400;color:var(--text-color-kumo-subtle)}
.mp-table thead th:not(.mp-model){white-space:normal;line-height:1.25}
.mp-sort{all:unset;display:block;cursor:pointer;border-radius:.25rem}
.mp-sort:hover .mp-sort-l{text-decoration:underline;text-underline-offset:2px}
.mp-sort:focus-visible{outline:2px solid var(--color-kumo-focus);outline-offset:2px}
.mp-sort-i{display:inline;width:.75rem;height:.75rem;margin-inline-start:.125rem;vertical-align:-.1em}
.mp-table thead th[aria-sort]{background:color-mix(in srgb,var(--color-kumo-tint) 90%,var(--color-kumo-base))}
.mp-table .mp-model{position:sticky;left:0;z-index:1;background:var(--color-kumo-base);min-width:17rem;text-align:start;font-weight:400;padding:.1rem .35rem;border-right:1px solid var(--color-kumo-line)}
.mp-table thead .mp-model{z-index:3;background:color-mix(in srgb,var(--color-kumo-tint) 50%,var(--color-kumo-base));padding:.4rem .5rem .35rem}
.mp-model-in{display:flex;gap:.35rem;align-items:center}
.mp-model-txt{flex:1;min-width:0}
.mp-line{display:flex;align-items:center;gap:.25rem}
.mp-pic{position:relative;flex:none}
.mp-thumb{width:2.25rem;height:2.25rem;border-radius:.375rem;border:1px dashed var(--color-kumo-line);background:var(--color-kumo-tint);display:grid;place-items:center;cursor:pointer;color:var(--text-color-kumo-subtle);padding:0;overflow:hidden}
.mp-thumb img{width:100%;height:100%;object-fit:contain}
.mp-thumb--set{border-style:solid;background:var(--color-kumo-base)}
.mp-thumb:hover{border-color:var(--color-kumo-focus)}
.mp-thumb:disabled{cursor:not-allowed;opacity:.6}
.mp-unpic{position:absolute;top:-.375rem;right:-.375rem;width:1.125rem;height:1.125rem;border-radius:999px;border:1px solid var(--color-kumo-line);background:var(--color-kumo-base);color:var(--text-color-kumo-default);display:none;place-items:center;padding:0;cursor:pointer}
.mp-pic:hover .mp-unpic,.mp-unpic:focus-visible{display:grid}
@media (hover:none){.mp-unpic{display:grid}}
.mp-name,.mp-series,.mp-cell{border:1px solid transparent;border-radius:.375rem;background:transparent;font:inherit;color:inherit;min-width:0;transition:border-color .1s}
.mp-name,.mp-series{width:100%;line-height:1.25;padding:.05rem .3rem}
.mp-name{font-weight:500}
.mp-series{font-size:.6875rem;color:var(--text-color-kumo-subtle)}
.mp-cell{box-sizing:border-box;width:100%;min-width:max(4.75rem,calc(var(--n,0) * 1ch + 1rem));padding:.25rem .4rem;text-align:end;font-variant-numeric:tabular-nums}
.mp-name:hover,.mp-series:hover,.mp-cell:hover{border-color:var(--color-kumo-line)}
.mp-name:focus,.mp-series:focus,.mp-cell:focus{outline:none;border-color:var(--color-kumo-focus);box-shadow:0 0 0 1.5px color-mix(in srgb,var(--color-kumo-focus) 50%,transparent);background:var(--color-kumo-base)}
.mp-name:disabled,.mp-series:disabled,.mp-cell:disabled{cursor:not-allowed;color:var(--text-color-kumo-subtle)}
.mp-changed{background:var(--color-kumo-warning-tint)!important;border-color:var(--color-kumo-warning)!important}
.mp-removed{background:var(--color-kumo-danger-tint)!important;border-color:var(--color-kumo-danger)!important;border-style:dashed!important}
.mp-removed::placeholder{color:var(--text-color-kumo-danger);opacity:1;font-style:italic}
.mp-invalid{background:var(--color-kumo-danger-tint)!important;border-color:var(--color-kumo-danger)!important}
.mp-row--new>*{background:color-mix(in srgb,var(--color-kumo-success-tint) 70%,var(--color-kumo-base))!important}
.mp-row--new .mp-name{border-color:var(--color-kumo-line);background:var(--color-kumo-base)}
.mp-row--hl>*{background:var(--color-kumo-info-tint)!important}
.mp-clash{display:flex;gap:.25rem;align-items:flex-start;font-size:.75rem;background:var(--color-kumo-warning-tint);border-radius:.375rem;padding:.25rem .5rem;margin-top:.25rem;white-space:normal;max-width:22rem}
.mp-group td{background:color-mix(in srgb,var(--color-kumo-tint) 30%,var(--color-kumo-base));font-weight:500;padding:.3rem .5rem}
.mp-gl{position:sticky;left:.5rem}
.mp-sgroup td{padding:.6rem .5rem .25rem;font-size:.75rem;font-weight:600;color:var(--color-kumo-subtle);border-bottom:1px solid var(--color-kumo-line)}
div.mp-sgroup{padding:.6rem .75rem .25rem;font-size:.75rem;font-weight:600;color:var(--color-kumo-subtle);border-bottom:1px solid var(--color-kumo-line)}
.mp-skcell{width:6rem;padding:.4rem .4rem}
.mp-skcell--num .skeleton-line{margin-inline-start:auto}
.mp-skgroup{width:9rem;padding:.15rem 0}
.mp-thumb--sk{border-style:solid;border-color:transparent;cursor:default}

.mp-cell{scroll-margin-top:3.75rem;scroll-margin-left:17.75rem;scroll-margin-bottom:.5rem;scroll-margin-right:.75rem}
.mp-table thead th.mp-on{color:var(--text-color-kumo-strong);box-shadow:inset 0 -2px 0 var(--color-kumo-focus)}
.mp-table .mp-model.mp-on{box-shadow:inset 3px 0 0 var(--color-kumo-focus)}
.mp-table td{position:relative}
.mp-fill{position:absolute;right:calc(.15rem - 4px);bottom:calc(.1rem - 4px);width:8px;height:8px;border-radius:2px;background:var(--color-kumo-focus);border:1.5px solid var(--color-kumo-base);cursor:crosshair;touch-action:none}
.mp-fill::before{content:"";position:absolute;inset:-6px}
.mp-cell:disabled~.mp-fill{display:none}
@media (pointer:coarse){.mp-fill{width:14px;height:14px;right:calc(.15rem - 7px);bottom:calc(.1rem - 7px);border-radius:999px;border-width:2px}.mp-fill::before{inset:-10px}}
.mp-fillsel{background:color-mix(in srgb,var(--color-kumo-focus) 10%,var(--color-kumo-base))!important;border:1px dashed var(--color-kumo-focus)!important}
.mp-filling,.mp-filling *{cursor:crosshair!important;user-select:none!important;-webkit-user-select:none!important}
.mp-top{position:sticky;top:-1.5rem;z-index:10;margin-inline:-1.5rem;padding-inline:1.5rem}
.mp-top--stuck{background:var(--color-kumo-elevated);box-shadow:0 -1.5rem 0 var(--color-kumo-elevated),0 6px 8px -6px rgb(0 0 0 / .12)}
.mp-sentinel{height:1px;margin-bottom:-1px}
.mp-top-in{background:color-mix(in srgb,var(--color-kumo-tint) 40%,var(--color-kumo-base))}
.mp-short{display:none}
.mp-dialog{min-width:0}
.mp-dialog>div{min-width:0}
.mp-dfoot{display:flex;justify-content:flex-end;gap:.5rem;flex-wrap:wrap}
.mp-16{font-size:16px!important}
.mp-scrollx{overflow-x:auto;scrollbar-width:none;flex-wrap:nowrap}
.mp-scrollx>*{flex:none}
.mp-scrollx::-webkit-scrollbar{display:none}
.mp-mgroup{padding:.5rem .75rem;font-size:.8125rem;font-weight:500;background:color-mix(in srgb,var(--color-kumo-tint) 50%,var(--color-kumo-base));border-bottom:1px solid var(--color-kumo-line)}
.mp-mrow{border-bottom:1px solid var(--color-kumo-line)}
.mp-mrow:last-child{border-bottom:0}
.mp-mhead{display:flex;width:100%;align-items:center;gap:.625rem;padding:.5rem .75rem;background:transparent;border:0;text-align:start;cursor:pointer;color:inherit;font:inherit;font-size:.9375rem;min-height:3.25rem}
.mp-mhead .mp-thumb{width:2rem;height:2rem;cursor:inherit}
.mp-mbody{display:grid;gap:.75rem;padding:.25rem .75rem 1rem}
.mp-mfield{display:grid;gap:.25rem;font-size:.8125rem;font-weight:500}
.mp-field{width:100%;font-size:16px;line-height:1.3;padding:.5rem .625rem;border:1px solid var(--color-kumo-line);border-radius:.5rem;background:var(--color-kumo-base);color:inherit;font-family:inherit;font-weight:400}
.mp-field:focus{outline:none;border-color:var(--color-kumo-focus);box-shadow:0 0 0 1.5px color-mix(in srgb,var(--color-kumo-focus) 50%,transparent)}
.mp-field:disabled{color:var(--text-color-kumo-subtle);background:var(--color-kumo-tint)}
.mp-fieldnum{width:7.5rem;text-align:end;font-variant-numeric:tabular-nums}
.mp-thumb--lg{width:3.5rem;height:3.5rem}
.mp-mprices{display:grid;border:1px solid var(--color-kumo-line);border-radius:.5rem;overflow:hidden}
.mp-mprice{display:flex;align-items:center;justify-content:space-between;gap:.75rem;padding:.375rem .375rem .375rem .75rem;font-size:.9375rem}
.mp-mprice+.mp-mprice{border-top:1px solid var(--color-kumo-hairline)}
.mp-mprice small{display:block;font-size:.75rem;color:var(--text-color-kumo-subtle)}
.mp-paste textarea,.mp-paste{font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre;tab-size:14;min-height:11rem}
@media (max-width:700px){
.mp-long{display:none}
.mp-short{display:inline}
.mp-wrap{max-height:calc(100dvh - 11rem)}
.mp-table .mp-model{min-width:12.5rem;max-width:12.5rem;white-space:normal;padding:.1rem .25rem}
.mp-thumb{width:1.75rem;height:1.75rem}
.mp-model-in{gap:.375rem}
.mp-cell{min-width:max(4.9rem,calc(var(--n,0) * 1ch + .8rem));padding:.35rem .3rem;scroll-margin-left:13rem}
.mp-cell,.mp-name{font-size:16px}
.mp-series{font-size:13px}
.mp-desk{display:none!important}
.mp-bleed{margin-inline:-1.5rem;border-inline:0;border-radius:0}
.mp-row--new .mp-line+.mp-line{flex-wrap:wrap;row-gap:.25rem;margin-top:.25rem}
.mp-row--new .mp-series{flex:1 1 100%}
.mp-row--new .mp-model{padding-block:.35rem}
.mp-dialog{padding:1.25rem!important}
.mp-dfoot{flex-direction:column-reverse}
.mp-dfoot>*{width:100%;justify-content:center}
}
`;

function readSheets(grids: { name: string; rows: string[][] }[], opts: Options, devices: Device[]): { sheets: ImportSheet[]; skipped: string[]; exportedAt: string | null } {
	const sheets: ImportSheet[] = [], skipped: string[] = [];
	const exportedAt = exportStamp(grids);
	for (const g of grids) {
		if (g.name.startsWith("_")) continue;
		const sheet = parseGrid(g.rows, opts.repairs, repairLabels.de);
		if (!sheet.rows.length) continue;
		const byId = sheet.rows.map(r => devices.find(d => d.id === r.id)).find(Boolean);
		const target = sheetTarget(g.name, sheet.corner, opts.brands, brandLabels) ?? (byId ? { brand: byId.brand, category: byId.category } : null);
		if (!target) { skipped.push(copy.importSheetUnknown(g.name)); continue; }
		sheets.push({ ...target, sheet });
	}
	return { sheets, skipped, exportedAt };
}

function ImportDialog({ open, opts, devices, initialBrand, onClose, onApply }: {
	open: boolean; opts: Options; devices: Device[]; initialBrand: string; onClose: () => void; onApply: (sheets: ImportSheet[], extra: string[], o: { blankRemoves: boolean; exportedAt: string | null }) => void;
}) {
	const [text, setText] = useState("");
	const [brand, setBrand] = useState(initialBrand || opts.brands[0] || "");
	const [category, setCategory] = useState("");
	const [file, setFile] = useState<{ name: string; sheets: ImportSheet[]; skipped: string[]; exportedAt: string | null } | null>(null);
	const [blankRemoves, setBlankRemoves] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const input = useRef<HTMLInputElement>(null);
	useEffect(() => { if (open) { setText(""); setFile(null); setError(null); setCategory(""); setBlankRemoves(false); if (initialBrand) setBrand(initialBrand); } }, [open]);

	const pasted = useMemo(() => parseSheet(text, opts.repairs, repairLabels.de), [text, opts.repairs]);
	useEffect(() => {
		const t = pasted.corner && sheetTarget("", pasted.corner, opts.brands, brandLabels);
		if (t && !initialBrand) setBrand(t.brand);
	}, [pasted.corner]);
	const counts = new Map<string, number>();
	for (const r of pasted.rows) { const c = categoryOf(r.title); counts.set(c, (counts.get(c) ?? 0) + 1); }
	const autoCategory = [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "smartphone";
	const cat = category || autoCategory;
	const sheets: ImportSheet[] = file ? file.sheets : text.trim() ? [{ brand, category: cat, sheet: pasted }] : [];
	const stats = sheets.reduce((s, { brand: b, category: c, sheet }) => {
		const pool = devices.filter(d => d.brand === b && d.category === c);
		const prefix = brandPrefix(pool.map(d => d.title));
		const hits = sheet.rows.filter(r => devices.some(d => d.id === r.id) || matchTitle(r.title, pool, prefix)).length;
		return { rows: s.rows + sheet.rows.length, matched: s.matched + hits, cols: s.cols + sheet.slots.filter(Boolean).length };
	}, { rows: 0, matched: 0, cols: 0 });
	const unknown = [...new Set(sheets.flatMap(s => s.sheet.unknown))];

	const pick = async (f: File | undefined) => {
		if (!f) return;
		setError(null); setText("");
		try {
			const grids = readXlsx(new Uint8Array(await f.arrayBuffer()));
			const res = readSheets(grids, opts, devices);
			if (!res.sheets.length) throw new Error();
			setFile({ name: f.name, ...res });
		} catch { setFile(null); setError(copy.importBadFile); }
	};

	return (
		<Dialog.Root open={open} onOpenChange={o => { if (!o) onClose(); }}>
			<Dialog size="xl" className="mp-dialog p-6">
				<div className="grid gap-4">
					<Dialog.Title className="text-lg font-semibold">{copy.importTitle}</Dialog.Title>
					<Dialog.Description className="text-sm text-kumo-subtle">{copy.importHelp}</Dialog.Description>
					<div className="flex flex-wrap items-center gap-3">
						<input ref={input} type="file" hidden accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={e => { void pick(e.target.files?.[0]); e.target.value = ""; }} />
						<Button icon={<UploadSimple />} onClick={() => input.current?.click()}>{copy.importFile}</Button>
						{file && <span className="text-sm">{file.name}</span>}
					</div>
					{!file && <>
						<p className="text-sm text-kumo-subtle">{copy.importOr}</p>
						<div className="flex flex-wrap gap-3">
							<Select size="sm" label={copy.brand} value={brand} onValueChange={v => setBrand(String(v))} items={Object.fromEntries(opts.brands.map(b => [b, brandLabels[b] ?? b]))} />
							<Select size="sm" label={copy.categoryLabel} value={cat} onValueChange={v => setCategory(String(v))} items={Object.fromEntries(opts.categories.map(c => [c, copy.category[c] ?? c]))} />
						</div>
						<InputArea className="mp-paste" placeholder={copy.importPlaceholder} value={text} onChange={e => setText(e.target.value)} spellCheck={false} aria-label={copy.importPlaceholder} />
					</>}
					<Checkbox label={copy.blankRemoves} checked={blankRemoves} onCheckedChange={v => setBlankRemoves(!!v)} />
					{file && <p className="text-xs text-kumo-subtle">{file.exportedAt ? copy.importStamp(new Date(file.exportedAt).toLocaleString("de-AT", { dateStyle: "medium", timeStyle: "short" })) : copy.importNoStamp}</p>}
					{error && <Banner variant="error" icon={<Warning weight="fill" />} description={error} />}
					{sheets.length > 0 && (stats.cols ? (
						<div className="grid gap-1 text-sm text-kumo-subtle">
							{file && <div>{copy.importFileSummary(file.sheets.length, stats.rows)}</div>}
							<div><b className="font-medium text-kumo-default">{stats.rows}</b> Modelle · <b className="font-medium text-kumo-default">{stats.matched}</b> vorhanden · <b className="font-medium text-kumo-default">{stats.rows - stats.matched}</b> neu</div>
							{!file && <div>{pasted.slots.filter((s): s is string => !!s).map(s => label(...(s.split(":") as [string, string]))).join(", ")}</div>}
							{unknown.length > 0 && <div>{copy.importUnknown(unknown)}</div>}
							{file?.skipped.map(s => <div key={s}>{s}</div>)}
						</div>
					) : <Banner variant="error" icon={<Warning weight="fill" />} description={copy.importEmpty} />)}
					<div className="mp-dfoot">
						<Button onClick={onClose}>{copy.importCancel}</Button>
						<Button variant="primary" disabled={!stats.cols || !stats.rows} onClick={() => onApply(sheets, file?.skipped ?? [], { blankRemoves, exportedAt: file?.exportedAt ?? null })}>{copy.importApply}</Button>
					</div>
				</div>
			</Dialog>
		</Dialog.Root>
	);
}

const SKELETON_ROWS = 12;
/** Kumo skeleton lines are very faint on white; the price list's placeholders use the thumbnail tint so they read clearly. */
const skCss = ".mp-sk.mp-sk .skeleton-line{height:.625rem;border-radius:.25rem;background-color:color-mix(in srgb,var(--color-kumo-tint) 60%,var(--color-kumo-line))}";
/** Placeholder in the shape of the real table, like EmDash's dashboard skeletons. */
function TableSkeleton() {
	return (
		<div className="mp-sk mp-wrap mp-bleed rounded-md border bg-kumo-base" role="status" aria-busy="true" aria-label={copy.loading}>
			<table className="mp-table" aria-hidden="true">
				<thead><tr>
					<th className="mp-model"><SkeletonLine minWidth={25} maxWidth={35} /></th>
					{Array.from({ length: 8 }, (_, i) => <th key={i}><div className="mp-skcell"><SkeletonLine minWidth={55} maxWidth={90} /><SkeletonLine className="mt-1.5" minWidth={40} maxWidth={70} /></div></th>)}
				</tr></thead>
				<tbody>
					<tr className="mp-group"><td colSpan={9}><div className="mp-skgroup"><SkeletonLine minWidth={60} maxWidth={90} /></div></td></tr>
					{Array.from({ length: SKELETON_ROWS }, (_, r) => (
						<tr key={r}>
							<th className="mp-model">
								<div className="mp-model-in">
									<span className="mp-thumb mp-thumb--sk" />
									<div className="mp-model-txt grid gap-1.5 py-1"><SkeletonLine minWidth={45} maxWidth={80} /><SkeletonLine minWidth={20} maxWidth={35} /></div>
								</div>
							</th>
							{Array.from({ length: 8 }, (_, i) => <td key={i}><div className="mp-skcell mp-skcell--num"><SkeletonLine minWidth={55} maxWidth={85} /></div></td>)}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function ListSkeleton() {
	return (
		<div className="mp-sk mp-bleed overflow-hidden rounded-md border bg-kumo-base" role="status" aria-busy="true" aria-label={copy.loading}>
			<div className="mp-mgroup" aria-hidden="true"><div className="w-40"><SkeletonLine minWidth={60} maxWidth={90} /></div></div>
			{Array.from({ length: 9 }, (_, i) => (
				<div key={i} className="mp-mrow" aria-hidden="true">
					<div className="mp-mhead">
						<span className="mp-thumb mp-thumb--sk" />
						<div className="grid flex-1 gap-1.5"><SkeletonLine minWidth={40} maxWidth={70} /><SkeletonLine minWidth={25} maxWidth={45} /></div>
					</div>
				</div>
			))}
		</div>
	);
}

function useNarrow(query = "(max-width: 700px)") {
	const [narrow, setNarrow] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
	useEffect(() => {
		const mq = window.matchMedia(query);
		const on = () => setNarrow(mq.matches);
		mq.addEventListener("change", on);
		return () => mq.removeEventListener("change", on);
	}, [query]);
	return narrow;
}

function PricesPage() {
	const [devices, setDevices] = useState<Device[] | null>(null);
	const [fresh, setFresh] = useState<Device[]>([]);
	const [opts, setOpts] = useState<Options>({ repairs: [], qualities: [], brands: [], categories: [] });
	const [edits, setEdits] = useState<Edits>({});
	const [meta, setMeta] = useState<Meta>({});
	const [extraCols, setExtraCols] = useState<string[]>([]);
	const params = useMemo(() => new URLSearchParams(window.location.search), []);
	const [q, setQ] = useState(""); const [brand, setBrand] = useState("all"); const [category, setCategory] = useState("all"); const [onlyChanged, setOnlyChanged] = useState(false);
	const [sortBy, setSortBy] = useState<{ key: string; dir: SortDir } | null>(null);
	const [show, setShow] = useState(["noImage", "noPrices"].includes(params.get("show") ?? "") ? params.get("show")! : "all");
	const [highlight, setHighlight] = useState<string | null>(null);
	const narrow = useNarrow();
	const [open, setOpen] = useState<string | null>(null);
	const [mView, setMView] = useState<"table" | "list">(() => (typeof localStorage !== "undefined" && localStorage.getItem("apfel-prices-view") === "list" ? "list" : "table"));
	const pickView = (v: string) => { const next = v === "list" ? "list" : "table"; setMView(next); try { localStorage.setItem("apfel-prices-view", next); } catch { /* private mode */ } };
	const toast = Toast.useToastManager();
	const [busy, setBusy] = useState<string | null>(null);
	const [importing, setImporting] = useState(false);
	const [picking, setPicking] = useState<Device | null>(null);
	const [notice, setNotice] = useState<Notice | null>(null);
	const focusId = useRef<string | null>(null);
	const sentinel = useRef<HTMLDivElement>(null);
	const [stuck, setStuck] = useState(false);
	useEffect(() => {
		const el = sentinel.current;
		if (!el) return;
		const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting && e.boundingClientRect.top < (e.rootBounds?.top ?? 0) + 40), { threshold: [0, 1] });
		io.observe(el);
		return () => io.disconnect();
	}, []);

	const load = async () => {
		const { all } = await loadAll(setOpts);
		setDevices(all);
		const target = all.find(d => d.id === params.get("device"));
		if (target) { setBrand(target.brand); setCategory(target.category); setHighlight(target.id); setOpen(target.id); focusId.current = target.id; }
	};
	useEffect(() => { load().catch(e => setNotice({ kind: "error", lines: [e instanceof Error ? e.message : copy.error.UNAVAILABLE] })); }, []);

	const dirty = Object.keys(edits).length > 0 || Object.keys(meta).length > 0 || fresh.length > 0;
	useBlocker({ shouldBlockFn: () => !window.confirm(copy.leave), disabled: !dirty, enableBeforeUnload: () => dirty });
	useEffect(() => {
		if (!focusId.current) return;
		const el = document.querySelector<HTMLInputElement>(`[data-title="${focusId.current}"]`);
		focusId.current = null;
		el?.scrollIntoView({ block: "center" }); el?.focus();
	});

	const brandOrder = Object.keys(brandLabels);
	const all = useMemo(() => [...fresh, ...(devices ?? [])], [devices, fresh]);
	const sorted = useMemo(() => groupSeries([...all].sort((a, b) =>
		(brandOrder.indexOf(a.brand) + 1 || 99) - (brandOrder.indexOf(b.brand) + 1 || 99) || byCategory(a.category, b.category) || a.sort - b.sort || a.title.localeCompare(b.title, "de")), d => !!d.isNew), [all]);
	const brands = useMemo(() => [...new Set([...opts.brands, ...sorted.map(d => d.brand)])], [sorted, opts]);
	const seriesOf = useMemo(() => {
		const m: Record<string, string[]> = {};
		for (const d of devices ?? []) if (d.series && !(m[d.brand] ??= []).includes(d.series)) m[d.brand].push(d.series);
		return m;
	}, [devices]);
	const filtered = useMemo(() => {
		const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
		return sorted.filter(d => (brand === "all" || d.brand === brand) && (category === "all" || d.category === category)
			&& (!onlyChanged || d.isNew || edits[d.id] || meta[d.id])
			&& (show === "all" || d.isNew || (show === "noImage" ? !d.image : !d.repairs.length))
			&& (d.isNew || tokens.every(t => (d.title + " " + d.series).toLowerCase().includes(t))));
	}, [sorted, q, brand, category, onlyChanged, show, edits, meta]);
	/** Sorts by saved prices, so rows do not jump while typing. */
	const visible = useMemo(() => !sortBy ? filtered : sortRows(filtered, d => d.brand + "|" + d.category,
		d => d.repairs.find(x => slot(x.repair, x.quality) === sortBy.key)?.price ?? null, sortBy.dir, d => !!d.isNew), [filtered, sortBy]);
	const toggleSort = (key: string) => setSortBy(s => s?.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null);
	const seriesHead = (r: number) => {
		const d = visible[r], p = visible[r - 1];
		return !sortBy && !d.isNew && (!p || p.isNew || p.brand !== d.brand || p.category !== d.category || p.series !== d.series);
	};
	const cols = useMemo<Col[]>(() => {
		const pool = all.filter(d => (brand === "all" || d.brand === brand) && (category === "all" || d.category === category));
		const cover = opts.repairs.includes(COVER_DISPLAY) && pool.some(d => hasCoverDisplay(d.title)) ? [slot(COVER_DISPLAY)] : [];
		const base = [...new Set(pool.map(d => d.category))].flatMap(c => BASE_SLOTS[c] ?? []).filter(k => opts.repairs.includes(k.split(":")[0]));
		const keys = new Set([...base, ...pool.flatMap(d => d.repairs.map(r => slot(r.repair, r.quality))), ...visible.flatMap(d => Object.keys(edits[d.id] ?? {})), ...extraCols, ...cover]);
		const rank = (c: Col) => (opts.repairs.indexOf(c.repair) + 1 || 99) * 10 + QUALITY_ORDER.indexOf(c.quality);
		return [...keys].map(key => { const [repair, quality] = key.split(":"); return { key, repair, quality }; }).sort((a, b) => rank(a) - rank(b));
	}, [visible, all, brand, category, opts, extraCols, edits]);
	const rankSlot = (key: string) => { const [repair, quality] = key.split(":"); return (opts.repairs.indexOf(repair) + 1 || 99) * 10 + QUALITY_ORDER.indexOf(quality); };
	const slotsFor = (d: Device) => [...new Set([
		...all.filter(o => o.brand === d.brand && o.category === d.category).flatMap(o => o.repairs.map(x => slot(x.repair, x.quality))),
		...(BASE_SLOTS[d.category] ?? []).filter(k => opts.repairs.includes(k.split(":")[0])),
		...Object.keys(edits[d.id] ?? {}), ...extraCols,
		...(opts.repairs.includes(COVER_DISPLAY) && hasCoverDisplay(d.title) ? [slot(COVER_DISPLAY)] : []),
	])].sort((a, b) => rankSlot(a) - rankSlot(b));
	const missingCols = opts.repairs.flatMap(r => opts.qualities.map(qu => ({ key: slot(r, qu), repair: r, quality: qu }))).filter(c => !cols.some(x => x.key === c.key));

	const titleOf = (d: Device) => (d.isNew ? d.title : meta[d.id]?.title ?? d.title).trim();
	const imageOf = (d: Device) => (d.isNew || meta[d.id]?.image === undefined ? d.image : meta[d.id]!.image ?? null);
	const titleProblem = (d: Device) => {
		const t = titleOf(d);
		if (!t) return copy.needTitle;
		const n = normTitle(t);
		return all.some(o => o.id !== d.id && o.brand === d.brand && normTitle(titleOf(o)) === n) ? copy.duplicateTitle : null;
	};
	const overlapOf = (d: Device) => {
		const pool = (devices ?? []).filter(o => o.brand === d.brand && o.category === d.category);
		return overlaps(d.title, pool, brandPrefix(pool.map(o => o.title)));
	};

	const plan = useMemo(() => all.flatMap(d => {
		if (d.isNew) return [{ device: d, changes: changesOf(d, edits[d.id]), fields: {} as Record<string, unknown>, problem: titleProblem(d) }];
		const m = meta[d.id] ?? {};
		const fields: Record<string, unknown> = {};
		if (m.title !== undefined && m.title.trim() !== d.title) fields.title = m.title.trim();
		if (m.series !== undefined && m.series.trim() !== d.series) fields.series = m.series.trim();
		if (m.image !== undefined && (m.image?.id ?? null) !== (d.image?.id ?? null)) fields.image = m.image?.storageKey ? { id: m.image.id, storageKey: m.image.storageKey } : null;
		if (!edits[d.id] && !Object.keys(fields).length) return [];
		return [{ device: d, changes: changesOf(d, edits[d.id]), fields, problem: "title" in fields ? titleProblem(d) : null }];
	}), [all, edits, meta]);
	const invalid = plan.some(p => p.changes === "invalid");
	const problem = plan.find(p => p.problem);
	const real = plan.filter((p): p is typeof p & { changes: PriceChange[] } => p.changes !== "invalid" && (!!p.device.isNew || p.changes.length > 0 || Object.keys(p.fields).length > 0));
	const created = real.filter(p => p.device.isNew).length;
	const cellCount = real.filter(p => !p.device.isNew).reduce((n, p) => n + p.changes.length + Object.keys(p.fields).length, 0);
	const updatedCount = real.length - created;
	const removedCount = real.reduce((n, p) => n + p.changes.filter(c => c.price === null).length, 0);
	const renamed = real.filter(p => "title" in p.fields).map(p => p.device.title + " → " + String(p.fields.title));
	const unpictured = real.filter(p => "image" in p.fields && p.fields.image === null).length;
	const needsReview = removedCount > 0 || renamed.length > 0 || unpictured > 0 || real.length > 10;
	const [reviewing, setReviewing] = useState(false);

	const putCell = (prev: Edits, d: Device, key: string, raw: string) => {
		const next = { ...prev, [d.id]: { ...prev[d.id], [key]: raw } };
		if (!d.isNew && sameCell(d, key, raw)) { delete next[d.id][key]; if (!Object.keys(next[d.id]).length) delete next[d.id]; }
		return next;
	};
	const putMeta = (prev: Meta, d: Device, field: "title" | "series", value: string) => {
		const next = { ...prev, [d.id]: { ...prev[d.id], [field]: value } };
		if (value.trim() === (field === "title" ? d.title : d.series)) delete next[d.id][field];
		if (!Object.keys(next[d.id]).length) delete next[d.id];
		return next;
	};
	/** Own undo stack (⌘/Ctrl+Z): the browser's undo only knows typing inside one field, not fills, pastes or imports. */
	type Snap = { edits: Edits; meta: Meta; fresh: Device[] };
	const live = useRef({ visible: [] as Device[], cols: [] as Col[], edits, meta, fresh, busy: false });
	const past = useRef<Snap[]>([]), future = useRef<Snap[]>([]), armed = useRef(true);
	const [, setDepth] = useState(0);
	const syncDepth = () => setDepth(past.current.length * 1000 + future.current.length);
	const snapshot = () => {
		const { edits: e, meta: m, fresh: f } = live.current;
		past.current = [...past.current.slice(-99), { edits: e, meta: m, fresh: f }];
		future.current = []; armed.current = true; syncDepth();
	};
	/** One undo step per field: snapshot on the first change after focusing it. */
	const record = () => { if (armed.current) { snapshot(); armed.current = false; } };
	const travel = (from: typeof past, to: typeof past) => {
		const snap = from.current.at(-1);
		if (!snap) return;
		const { edits: e, meta: m, fresh: f } = live.current;
		from.current = from.current.slice(0, -1);
		to.current = [...to.current, { edits: e, meta: m, fresh: f }];
		setEdits(snap.edits); setMeta(snap.meta); setFresh(snap.fresh);
		armed.current = true; syncDepth();
		const el = document.activeElement;
		if (el instanceof HTMLInputElement) requestAnimationFrame(() => el.select());
	};
	const undo = () => travel(past, future), redo = () => travel(future, past);
	const forget = () => { past.current = []; future.current = []; armed.current = true; syncDepth(); };
	const setCell = (d: Device, key: string, raw: string) => { record(); setEdits(prev => putCell(prev, d, key, raw)); };
	const setField = (d: Device, field: "title" | "series", value: string) => {
		record();
		if (d.isNew) { setFresh(prev => prev.map(f => f.id === d.id ? { ...f, [field]: value } : f)); return; }
		setMeta(prev => putMeta(prev, d, field, value));
	};
	const setImage = (d: Device, pic: Pic | null) => {
		snapshot();
		if (d.isNew) { setFresh(prev => prev.map(f => f.id === d.id ? { ...f, image: pic } : f)); return; }
		setMeta(prev => {
			const next = { ...prev, [d.id]: { ...prev[d.id], image: pic } };
			if ((pic?.id ?? null) === (d.image?.id ?? null)) delete next[d.id].image;
			if (!Object.keys(next[d.id]).length) delete next[d.id];
			return next;
		});
	};
	const setNewProp = (d: Device, patch: Partial<Device>) => { snapshot(); setFresh(prev => prev.map(f => f.id === d.id ? { ...f, ...patch } : f)); };
	const removeNew = (d: Device) => { snapshot(); setFresh(prev => prev.filter(f => f.id !== d.id)); setEdits(prev => { const n = { ...prev }; delete n[d.id]; return n; }); };

	const blank = (b: string, c: string, patch: Partial<Device> = {}): Device => {
		const sorts = all.filter(d => d.brand === b && d.category === c).map(d => d.sort);
		return { id: "new-" + ++newId, slug: null, title: "", brand: b, category: c, series: "", sort: (sorts.length ? Math.min(...sorts) : 1) - 1, status: "new", pending: false, updatedAt: "", repairs: [], image: null, isNew: true, ...patch };
	};
	const addRow = () => {
		snapshot();
		const row = blank(brand !== "all" ? brand : opts.brands[0] || "apple", category !== "all" ? category : "smartphone");
		focusId.current = row.id;
		setOpen(row.id);
		setFresh(prev => [row, ...prev]);
	};

	const applyImport = (sheets: ImportSheet[], extra: string[], o: { blankRemoves: boolean; exportedAt: string | null }) => {
		snapshot();
		const plan = planImport(sheets, devices ?? [], o);
		let nextEdits = edits, nextMeta = meta;
		for (const u of plan.updates) {
			const d = u.device as Device;
			for (const [key, raw] of Object.entries(u.cells)) nextEdits = putCell(nextEdits, d, key, tidy(raw));
			if (u.title !== undefined) nextMeta = putMeta(nextMeta, d, "title", u.title);
			if (u.series !== undefined) nextMeta = putMeta(nextMeta, d, "series", u.series);
		}
		const rows = plan.creates.map(c => blank(c.brand, c.category, { title: c.title, series: c.series, ...(c.sort !== undefined ? { sort: c.sort, fixedSort: true } : {}) }));
		plan.creates.forEach((c, i) => { for (const [key, raw] of Object.entries(c.cells)) nextEdits = putCell(nextEdits, rows[i], key, tidy(raw)); });
		setFresh(prev => [...rows, ...prev]);
		setEdits(nextEdits); setMeta(nextMeta);
		setExtraCols(prev => [...new Set([...prev, ...plan.slots])]);
		const one = sheets.length === 1 ? sheets[0] : null;
		setBrand(one ? one.brand : "all"); setCategory(one ? one.category : "all"); setQ(""); setOnlyChanged(true); setImporting(false);
		const skipped = plan.skipped.map(x => x.title + ": " + copy.skip[x.reason]);
		setNotice({
			kind: skipped.length || extra.length ? "error" : "ok",
			lines: [copy.importSummary(plan.matched, plan.changed, rows.length), ...(plan.removals ? [copy.importRemovals(plan.removals)] : []), ...(plan.unknown.length ? [copy.importUnknown(plan.unknown)] : []), ...extra, ...skipped],
		});
	};

	const [exporting, setExporting] = useState(false);
	const exportExcel = async () => {
		setExporting(true);
		try { await download(); if (dirty) toast.add({ title: copy.exportDirty, type: "info" }); }
		catch (e) { setNotice({ kind: "error", lines: [e instanceof Error ? e.message : copy.error.UNAVAILABLE] }); }
		setExporting(false);
	};

	const tableRef = useRef<HTMLTableElement>(null);
	const editing = useRef(false);
	const justFocused = useRef(false);
	live.current = { visible, cols, edits, meta, fresh, busy: !!busy };
	const fill = useRef<HTMLSpanElement | null>(null);
	/** Excel fill handle: drag the dot on the active price cell up or down to copy its value to the visible rows in between. */
	useEffect(() => {
		const h = document.createElement("span");
		h.className = "mp-fill"; h.title = copy.fillHint; h.setAttribute("aria-hidden", "true");
		h.addEventListener("pointerdown", e => {
			const src = h.parentElement?.querySelector<HTMLInputElement>("input.mp-cell");
			const table = tableRef.current, wrap = table?.parentElement;
			if (!src || src.disabled || !table || !wrap || e.button > 0) return;
			e.preventDefault(); e.stopPropagation();
			const c = src.dataset.c!, r0 = Number(src.dataset.r);
			let y = e.clientY, end = r0, raf = 0, marked: Element[] = [];
			const mark = () => {
				marked.forEach(n => n.classList.remove("mp-fillsel")); marked = [];
				for (let r = Math.min(r0, end); r <= Math.max(r0, end); r++) {
					const n = r === r0 ? null : table.querySelector('[data-r="' + r + '"][data-c="' + c + '"]');
					if (n && !(n as HTMLInputElement).disabled) { n.classList.add("mp-fillsel"); marked.push(n); }
				}
			};
			const track = () => {
				const w = wrap.getBoundingClientRect();
				const top = Math.max(0, w.top + (table.tHead?.offsetHeight ?? 0)), bottom = Math.min(window.innerHeight, w.bottom);
				const edge = 32, speed = (d: number) => Math.min(24, Math.ceil(d / 2));
				if (y < top + edge) { if (wrap.scrollTop > 0) wrap.scrollTop -= speed(top + edge - y); else window.scrollBy(0, -speed(top + edge - y)); }
				else if (y > bottom - edge) { if (wrap.scrollTop + wrap.clientHeight < wrap.scrollHeight - 1) wrap.scrollTop += speed(y - bottom + edge); else window.scrollBy(0, speed(y - bottom + edge)); }
				const b = src.getBoundingClientRect();
				const hit = document.elementFromPoint(b.left + b.width / 2, Math.min(bottom - 2, Math.max(top + 2, y)));
				const cell = hit?.closest("tr")?.querySelector<HTMLInputElement>('[data-c="' + c + '"]');
				if (cell && Number(cell.dataset.r) !== end) { end = Number(cell.dataset.r); mark(); }
				raf = requestAnimationFrame(track);
			};
			const onMove = (ev: PointerEvent) => { y = ev.clientY; };
			const stop = (apply: boolean) => {
				cancelAnimationFrame(raf);
				window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); window.removeEventListener("pointercancel", onCancel);
				document.body.classList.remove("mp-filling");
				const rows = marked.map(n => Number((n as HTMLInputElement).dataset.r));
				marked.forEach(n => n.classList.remove("mp-fillsel"));
				const value = src.value.trim();
				if (!apply || !rows.length || !value || parseCell(value) === "invalid") return;
				const { visible: v, cols: cs } = live.current;
				const key = cs[Number(c)]?.key;
				if (key) { snapshot(); setEdits(prev => rows.reduce((next, r) => (v[r] ? putCell(next, v[r], key, value) : next), prev)); }
				src.focus({ preventScroll: true });
			};
			const onUp = () => stop(true), onCancel = () => stop(false);
			window.addEventListener("pointermove", onMove); window.addEventListener("pointerup", onUp); window.addEventListener("pointercancel", onCancel);
			document.body.classList.add("mp-filling");
			raf = requestAnimationFrame(track);
		});
		fill.current = h;
		return () => { h.remove(); };
	}, []);
	const cellAt = (p: Pos) => tableRef.current?.querySelector<HTMLInputElement>('[data-r="' + p.r + '"][data-c="' + (p.c < 0 ? "t" : p.c) + '"]') ?? null;
	const focusCell = (p: Pos) => {
		const el = cellAt(p);
		if (!el) return;
		editing.current = false;
		el.focus({ preventScroll: true });
		el.select();
		el.scrollIntoView({ block: "nearest", inline: "nearest" });
	};
	/** Excel keys: arrows/Tab/Enter/Home/End/PageUp/PageDown move, F2 or a second click edits, Esc reverts. */
	const move = (e: KeyboardEvent<HTMLInputElement>, reset: () => void) => {
		const el = e.currentTarget;
		if (e.key === "Escape") { reset(); editing.current = false; requestAnimationFrame(() => el.select()); return; }
		if (e.key === "F2") { e.preventDefault(); editing.current = true; el.setSelectionRange(el.value.length, el.value.length); return; }
		if (!NAV_KEYS.has(e.key) || e.altKey) return;
		if (editing.current && ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
		if (e.shiftKey && e.key.startsWith("Arrow")) return;
		const from = { r: Number(el.dataset.r), c: el.dataset.c === "t" ? -1 : Number(el.dataset.c) };
		const wrap = tableRef.current?.parentElement;
		const rowH = el.closest("tr")?.getBoundingClientRect().height || 41;
		const page = Math.max(1, Math.floor(((wrap?.clientHeight ?? 600) - 60) / rowH) - 1);
		const to = nextCell(from, e.key as NavKey, { shift: e.shiftKey, jump: e.ctrlKey || e.metaKey }, {
			rows: visible.length, cols: cols.length, page, enabled: p => { const c = cellAt(p); return !!c && !c.disabled; },
		});
		if (!to) { if (e.key !== "Tab") e.preventDefault(); return; }
		e.preventDefault();
		focusCell(to);
	};
	const cellMouse = {
		onMouseDown: (e: React.MouseEvent<HTMLInputElement>) => { justFocused.current = document.activeElement !== e.currentTarget; },
		onMouseUp: (e: React.MouseEvent<HTMLInputElement>) => {
			if (justFocused.current) { e.preventDefault(); justFocused.current = false; editing.current = false; return; }
			editing.current = true;
		},
		onDoubleClick: () => { editing.current = true; },
	};
	/** Highlight the active cell's column header and model name, like Excel's row/column headers. */
	const markActive = (target: EventTarget | null) => {
		const t = tableRef.current;
		if (!t) return;
		t.querySelectorAll(".mp-on").forEach(n => n.classList.remove("mp-on"));
		const el = target instanceof HTMLInputElement && el2pos(target);
		const h = fill.current;
		if (h) { if (el && target instanceof HTMLInputElement && target.classList.contains("mp-cell")) target.parentElement?.appendChild(h); else h.remove(); }
		if (!el) return;
		t.querySelector('thead [data-col="' + el.c + '"]')?.classList.add("mp-on");
		t.querySelector('[data-row="' + el.r + '"]')?.classList.add("mp-on");
	};
	const el2pos = (el: HTMLInputElement) => (el.dataset.r === undefined || el.dataset.c === undefined ? null : { r: Number(el.dataset.r), c: el.dataset.c === "t" ? "t" : Number(el.dataset.c) });
	const paste = (e: ClipboardEvent<HTMLInputElement>, row: number, col: number) => {
		const text = e.clipboardData.getData("text/plain");
		if (!/[\t\n]/.test(text.trim())) return;
		e.preventDefault();
		const grid = text.replace(/\r/g, "").replace(/\n$/, "").split("\n").map(l => l.split("\t"));
		snapshot();
		armed.current = false;
		let next = edits;
		grid.forEach((line, i) => {
			const d = visible[row + i];
			if (!d || d.pending || (!d.isNew && d.status !== "published")) return;
			line.forEach((raw, j) => {
				const ci = col + j;
				if (ci === -1) { setField(d, "title", raw.trim()); return; }
				if (cols[ci] && raw.trim()) next = putCell(next, d, cols[ci].key, raw.trim());
			});
		});
		setEdits(next);
		armed.current = true;
	};

	const save = async () => {
		setNotice(null); const failed: string[] = []; let ok = 0;
		for (const [i, p] of real.entries()) {
			setBusy(copy.saving(i + 1, real.length));
			const d = p.device;
			try {
				if (d.isNew) {
					const res = await call<{ device: Device }>("create", { title: d.title.trim(), brand: d.brand, category: d.category, series: d.series.trim(), ...(d.fixedSort ? { sort: d.sort } : {}), changes: p.changes, ...(d.image?.storageKey ? { image: { id: d.image.id, storageKey: d.image.storageKey } } : {}) });
					setDevices(prev => [...(prev ?? []), res.device]);
					setFresh(prev => prev.filter(f => f.id !== d.id));
				} else {
					const res = await call<{ device: Device }>("update", { id: d.id, changes: p.changes, fields: p.fields, expected: d.updatedAt });
					setDevices(prev => prev?.map(x => x.id === d.id ? res.device : x) ?? null);
					setMeta(prev => { const n = { ...prev }; delete n[d.id]; return n; });
				}
				ok++;
				setEdits(prev => { const n = { ...prev }; delete n[d.id]; return n; });
			} catch (e) { failed.push((titleOf(d) || copy.newTag) + ": " + (e instanceof Error ? e.message : copy.error.UNAVAILABLE)); }
		}
		setBusy(null);
		forget();
		if (failed.length) setNotice({ kind: "error", lines: [...(ok ? [copy.saved(ok)] : []), copy.failed, ...failed] });
		else toast.add({ title: copy.savedToast, description: copy.saved(ok), type: "success" });
	};

	const moveNext = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key !== "Enter") return;
		e.preventDefault();
		const list = [...document.querySelectorAll<HTMLInputElement>("[data-m='" + e.currentTarget.dataset.m + "']:not(:disabled)")];
		const next = list[list.indexOf(e.currentTarget) + 1];
		if (next) { next.focus(); next.select(); } else e.currentTarget.blur();
	};
	const mobileList = () => (
		<div className="mp-mlist mp-bleed overflow-hidden rounded-md border bg-kumo-base">
			{Object.entries(seriesOf).map(([b, list]) => <datalist key={b} id={"mp-series-" + b}>{list.map(x => <option key={x} value={x} />)}</datalist>)}
			{visible.map((d, r) => {
				const head = r === 0 || visible[r - 1].brand !== d.brand || visible[r - 1].category !== d.category;
				const locked = d.pending || (!d.isNew && d.status !== "published") || !!busy;
				const isOpen = open === d.id;
				const pic = imageOf(d);
				const tProblem = (d.isNew || meta[d.id]?.title !== undefined) ? titleProblem(d) : null;
				const changes = Object.keys(edits[d.id] ?? {}).length + Object.keys(meta[d.id] ?? {}).length;
				const facts = d.repairs.length;
				const clash = d.isNew && d.title.trim() ? overlapOf(d) : [];
				const slots = isOpen ? slotsFor(d) : [];
				const extra = isOpen ? opts.repairs.flatMap(x => opts.qualities.map(qu => slot(x, qu))).filter(k => !slots.includes(k)) : [];
				return [
					head && <div key={d.id + "-h"} className="mp-mgroup">{sheetName(d.brand, d.category)}</div>,
					seriesHead(r) && <div key={d.id + "-s"} className="mp-sgroup">{d.series || copy.otherSeries}</div>,
					<div key={d.id} className={"mp-mrow" + (d.isNew ? " mp-row--new" : d.id === highlight ? " mp-row--hl" : "")}>
						<button type="button" className="mp-mhead" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : d.id)}>
							<span className={"mp-thumb" + (pic ? " mp-thumb--set" : "")} aria-hidden="true">{pic ? <img src={pic.url} alt="" loading="lazy" /> : <ImageSquare className="h-4 w-4" />}</span>
							<span className="min-w-0 flex-1 text-start">
								<span className="block truncate font-medium">{titleOf(d) || <span className="text-kumo-subtle">{copy.titlePlaceholder}</span>}</span>
								<span className="block truncate text-xs text-kumo-subtle">{[(d.isNew ? d.series : meta[d.id]?.series ?? d.series), d.isNew ? null : facts ? copy.priceCount(facts) : copy.noPrices].filter(Boolean).join(" · ")}</span>
							</span>
							{d.isNew && <Badge variant="green">{copy.newTag}</Badge>}
							{!d.isNew && changes > 0 && <Badge variant="warning">{copy.changedBadge(changes)}</Badge>}
							{!d.isNew && d.status !== "published" && <Badge variant="warning">{copy.draft}</Badge>}
							{d.status === "published" && d.pending && <Badge variant="warning">{copy.pendingDraft}</Badge>}
							<CaretDown className={"h-4 w-4 shrink-0 text-kumo-subtle transition-transform" + (isOpen ? " rotate-180" : "")} aria-hidden="true" />
						</button>
						{isOpen && (
							<div className="mp-mbody">
								{d.pending && <p className="text-sm text-kumo-subtle">{copy.pendingDraftHint}</p>}
								<label className="mp-mfield"><span>{copy.model}</span>
									<input className={"mp-field" + (tProblem ? " mp-invalid" : !d.isNew && meta[d.id]?.title !== undefined ? " mp-changed" : "")} value={d.isNew ? d.title : meta[d.id]?.title ?? d.title}
										placeholder={copy.titlePlaceholder} disabled={locked} data-m={d.id} data-title={d.id} enterKeyHint="next" onKeyDown={moveNext} onChange={e => setField(d, "title", e.target.value)} />
								</label>
								{tProblem && <p className="text-sm text-kumo-danger">{tProblem}</p>}
								<label className="mp-mfield"><span>{copy.seriesLabel}</span>
									<input className={"mp-field" + (!d.isNew && meta[d.id]?.series !== undefined ? " mp-changed" : "")} value={d.isNew ? d.series : meta[d.id]?.series ?? d.series}
										placeholder={copy.seriesPlaceholder} list={"mp-series-" + d.brand} disabled={locked} data-m={d.id} enterKeyHint="next" onKeyDown={moveNext} onChange={e => setField(d, "series", e.target.value)} />
								</label>
								{d.isNew && <div className="grid grid-cols-2 gap-2">
									<Select size="sm" label={copy.brand} value={d.brand} onValueChange={v => setNewProp(d, { brand: String(v) })} items={Object.fromEntries(opts.brands.map(b => [b, brandLabels[b] ?? b]))} />
									<Select size="sm" label={copy.categoryLabel} value={d.category} onValueChange={v => setNewProp(d, { category: String(v) })} items={Object.fromEntries(opts.categories.map(c => [c, copy.category[c] ?? c]))} />
								</div>}
								{clash.length > 0 && <div className="mp-clash"><Warning className="mt-0.5 h-3.5 w-3.5 shrink-0 text-kumo-warning" aria-hidden="true" />{copy.overlap(clash.map(c => c.title))}</div>}
								<div className="flex items-center gap-3">
									<button type="button" className={"mp-thumb mp-thumb--lg" + (pic ? " mp-thumb--set" : "") + (!d.isNew && meta[d.id]?.image !== undefined ? " mp-changed" : "")} disabled={locked} aria-label={copy.chooseImage} onClick={() => setPicking(d)}>
										{pic ? <img src={pic.url} alt="" /> : <ImageSquare className="h-5 w-5" aria-hidden="true" />}
									</button>
									<div className="flex flex-wrap gap-2">
										<Button size="sm" disabled={locked} onClick={() => setPicking(d)}>{pic ? copy.changeImage : copy.chooseImage}</Button>
										{pic && <Button size="sm" variant="ghost" disabled={locked} onClick={() => setImage(d, null)}>{copy.removeImage}</Button>}
									</div>
								</div>
								<div className="mp-mprices">
									{slots.map(key => {
										const [repair, quality] = key.split(":");
										const raw = edits[d.id]?.[key];
										const old = cellOf(d, key);
										const removing = raw !== undefined && !d.isNew && parseCell(raw) === null && !!old;
										const state = raw === undefined || (d.isNew && !raw.trim()) ? "" : removing ? " mp-removed" : parseCell(raw) === "invalid" ? " mp-invalid" : " mp-changed";
										return (
											<label key={key} className="mp-mprice">
												<span>{repairLabels.de[repair] ?? repair}{copy.quality[quality] && <small>{copy.quality[quality]}</small>}</span>
												<input className={"mp-field mp-fieldnum" + state} inputMode="decimal" enterKeyHint="next" value={raw ?? formatCell(old)} disabled={locked} data-m={d.id}
													placeholder={removing ? copy.removed : "–"} aria-label={(titleOf(d) || copy.newTag) + ": " + label(repair, quality)}
													onKeyDown={moveNext} onChange={e => setCell(d, key, e.target.value)} />
											</label>
										);
									})}
								</div>
								{!locked && extra.length > 0 && <Select size="sm" aria-label={copy.addRepair} placeholder={copy.addRepair} value={null as unknown as string}
									onValueChange={v => v && setExtraCols(prev => [...new Set([...prev, String(v)])])} items={Object.fromEntries(extra.map(k => { const [x, qu] = k.split(":"); return [k, label(x, qu)]; }))} />}
								<div className="flex flex-wrap gap-2 pt-1">
									{d.isNew
										? <Button size="sm" variant="ghost" icon={<X />} onClick={() => removeNew(d)}>{copy.removeRow}</Button>
										: <LinkButton {...toEditor(d.id)} size="sm" variant="ghost" icon={<ArrowSquareOut aria-hidden="true" />}>{copy.openEditorShort}</LinkButton>}
								</div>
							</div>
						)}
					</div>,
				];
			})}
		</div>
	);

	const status = busy ?? (invalid ? copy.invalid : problem ? (titleOf(problem.device) || copy.newTag) + ": " + problem.problem : (cellCount || created) ? copy.changes(cellCount, updatedCount, created) : copy.noChanges);
	const brandItems = { all: copy.allBrands, ...Object.fromEntries(brands.map(b => [b, brandLabels[b] ?? b])) };
	const categoryItems = { all: copy.allCategories, ...copy.categories };
	const discard = () => { if (!window.confirm(copy.discardConfirm)) return; setEdits({}); setMeta({}); setFresh([]); setNotice(null); forget(); };
	useEffect(() => {
		const on = (e: globalThis.KeyboardEvent) => {
			const k = e.key.toLowerCase();
			if (!(e.metaKey || e.ctrlKey) || e.altKey || (k !== "z" && k !== "y")) return;
			const t = e.target instanceof HTMLElement ? e.target : null;
			if (!(t === document.body || t?.closest(".mp-wrap, .mp-mlist")) || live.current.busy || document.querySelector("[role=dialog]")) return;
			e.preventDefault();
			if (k === "y" || e.shiftKey) redo(); else undo();
		};
		document.addEventListener("keydown", on);
		return () => document.removeEventListener("keydown", on);
	}, []);
	return (
		<div className="space-y-4" onFocusCapture={() => { armed.current = true; }}>
			<style>{css + skCss}</style>
			<div className="flex items-center justify-between gap-3 sm:flex-row">
				<div className="flex items-center gap-2">
					<h1 className="text-2xl font-semibold leading-tight">{copy.pageTitle}</h1>
					<Popover>
						<Popover.Trigger render={<Button variant="ghost" size="sm" shape="square" icon={<Question />} aria-label={copy.helpTitle} />} />
						<Popover.Content className="max-w-sm">
							<Popover.Title>{copy.helpTitle}</Popover.Title>
							<Popover.Description><span className="grid gap-1.5">{copy.help.map(h => <span key={h}>{h}</span>)}</span></Popover.Description>
						</Popover.Content>
					</Popover>
				</div>
				{narrow ? (
					<div className="flex items-center gap-2">
						<Button icon={<Plus />} disabled={!devices || !!busy} onClick={addRow}>{copy.newDevice}</Button>
						<DropdownMenu>
							<DropdownMenu.Trigger render={<Button shape="square" icon={<DotsThree weight="bold" />} aria-label={copy.more} disabled={!devices || !!busy} />} />
							<DropdownMenu.Content>
								<DropdownMenu.Item icon={DownloadSimple} onClick={() => void exportExcel()}>{copy.exportExcel}</DropdownMenu.Item>
								<DropdownMenu.Item icon={UploadSimple} onClick={() => setImporting(true)}>{copy.importExcel}</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu>
					</div>
				) : (
					<div className="flex flex-wrap items-center gap-2">
						<Button icon={<DownloadSimple />} loading={exporting} disabled={!devices || !!busy} onClick={exportExcel}>{copy.exportExcel}</Button>
						<Button icon={<UploadSimple />} disabled={!devices || !!busy} onClick={() => setImporting(true)}>{copy.importExcel}</Button>
						<Button icon={<Plus />} disabled={!devices || !!busy} onClick={addRow}>{copy.newDevice}</Button>
					</div>
				)}
			</div>
			<div ref={sentinel} className="mp-sentinel" aria-hidden="true" />
			<div className={"mp-top" + (stuck ? " mp-top--stuck" : "")} role="region" aria-label={copy.save}>
				<div className="mp-top-in flex items-center justify-between gap-3 rounded-md border px-4 py-2">
					<span className={"min-w-0 text-sm " + (dirty ? "font-medium" : "text-kumo-subtle")}>{status}</span>
					<div className="flex shrink-0 items-center gap-2">
						<Button size="sm" shape="square" icon={<ArrowCounterClockwise />} aria-label={copy.undo} title={copy.undo + " (⌘Z / Strg+Z)"} disabled={!past.current.length || !!busy} onClick={undo} />
						<Button size="sm" disabled={!dirty || !!busy} onClick={discard}>{copy.discard}</Button>
						<Button size="sm" variant="primary" loading={!!busy} disabled={!real.length || invalid || !!problem || !!busy} onClick={() => (needsReview ? setReviewing(true) : void save())}>
							<span className="mp-long">{copy.save}</span><span className="mp-short">{copy.saveShort}</span>
						</Button>
					</div>
				</div>
			</div>
			{narrow ? (
				<div className="grid gap-2">
					<InputGroup size="base">
						<InputGroup.Addon><MagnifyingGlass className="h-4 w-4" aria-hidden="true" /></InputGroup.Addon>
						<InputGroup.Input className="mp-16" type="search" placeholder={copy.search} aria-label={copy.search} value={q} onChange={e => setQ(e.target.value)} />
					</InputGroup>
					<div className="mp-scrollx flex gap-2">
						<Select size="sm" aria-label={copy.allBrands} value={brand} onValueChange={v => setBrand(String(v ?? "all"))} items={brandItems} />
						<Select size="sm" aria-label={copy.allCategories} value={category} onValueChange={v => setCategory(String(v ?? "all"))} items={categoryItems} />
						<Select size="sm" aria-label={copy.show.all} value={show} onValueChange={v => setShow(String(v ?? "all"))} items={copy.show} />
					</div>
					<div className="flex items-center justify-between gap-3">
						<Tabs size="sm" variant="segmented" value={mView} onValueChange={pickView} tabs={[{ value: "table", label: copy.viewTable }, { value: "list", label: copy.viewList }]} />
						<Checkbox label={copy.onlyChanged} checked={onlyChanged} onCheckedChange={v => setOnlyChanged(!!v)} />
						{devices && <span className="ms-auto text-sm text-kumo-subtle tabular-nums">{visible.length}/{all.length}</span>}
					</div>
				</div>
			) : (
				<div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
					<div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
						<InputGroup size="sm" className="w-full min-w-0 sm:w-64 sm:flex-none">
							<InputGroup.Addon><MagnifyingGlass className="h-4 w-4" aria-hidden="true" /></InputGroup.Addon>
							<InputGroup.Input type="search" placeholder={copy.search} aria-label={copy.search} value={q} onChange={e => setQ(e.target.value)} />
						</InputGroup>
						<Select size="sm" aria-label={copy.allBrands} value={brand} onValueChange={v => setBrand(String(v ?? "all"))} items={brandItems} />
						<Select size="sm" aria-label={copy.allCategories} value={category} onValueChange={v => setCategory(String(v ?? "all"))} items={categoryItems} />
						<Select size="sm" aria-label={copy.show.all} value={show} onValueChange={v => setShow(String(v ?? "all"))} items={copy.show} />
						<Checkbox label={copy.onlyChanged} checked={onlyChanged} onCheckedChange={v => setOnlyChanged(!!v)} />
					</div>
					<div className="flex shrink-0 flex-wrap items-center gap-2">
						{devices && <span className="text-sm text-kumo-subtle">{copy.shown(visible.length, all.length)}</span>}
						{missingCols.length > 0 && <Select size="sm" aria-label={copy.addColumn} placeholder={copy.addColumn} value={null as unknown as string} onValueChange={v => v && setExtraCols(prev => [...prev, String(v)])}
							items={Object.fromEntries(missingCols.map(c => [c.key, label(c.repair, c.quality)]))} />}
					</div>
				</div>
			)}
			{notice && <Banner variant={notice.kind === "error" ? "error" : "default"} icon={notice.kind === "error" ? <Warning weight="fill" /> : <Info weight="fill" />}
				description={<>{notice.lines.map((l, i) => <div key={i}>{l}</div>)}</>} />}
			{!devices && !notice && (narrow && mView === "list" ? <ListSkeleton /> : <TableSkeleton />)}
			{devices && (visible.length === 0 ? <div className="rounded-md border bg-kumo-base px-4 py-8 text-center text-kumo-subtle">{copy.empty}</div> : narrow && mView === "list" ? mobileList() : (
				<div className="mp-wrap mp-bleed rounded-md border bg-kumo-base">
					{Object.entries(seriesOf).map(([b, list]) => <datalist key={b} id={"mp-series-" + b}>{list.map(s => <option key={s} value={s} />)}</datalist>)}
					<table className="mp-table" ref={tableRef} onFocus={e => markActive(e.target)} onBlur={e => { if (!tableRef.current?.contains(e.relatedTarget as Node | null)) markActive(null); }}>
						<thead><tr>
							<th className="mp-model" scope="col" data-col="t">{copy.model}</th>
							{cols.map((c, ci) => {
								const dir = sortBy?.key === c.key ? sortBy.dir : null;
								return <th key={c.key} scope="col" data-col={ci} aria-sort={dir ? (dir === "asc" ? "ascending" : "descending") : undefined}>
									<button type="button" className="mp-sort" title={copy.sortHint[dir ?? "none"]} onClick={() => toggleSort(c.key)}>
										<span className="mp-sort-l">{repairLabels.de[c.repair] ?? c.repair}</span>
										{dir && (dir === "asc" ? <ArrowUp className="mp-sort-i" weight="bold" aria-hidden="true" /> : <ArrowDown className="mp-sort-i" weight="bold" aria-hidden="true" />)}
										{copy.quality[c.quality] && <small>{copy.quality[c.quality]}</small>}
									</button>
								</th>;
							})}
						</tr></thead>
						<tbody>
							{visible.map((d, r) => {
								const head = r === 0 || visible[r - 1].brand !== d.brand || visible[r - 1].category !== d.category;
								const locked = d.pending || (!d.isNew && d.status !== "published") || !!busy;
								const tProblem = (d.isNew || meta[d.id]?.title !== undefined) ? titleProblem(d) : null;
								const tChanged = !d.isNew && meta[d.id]?.title !== undefined;
								const sChanged = !d.isNew && meta[d.id]?.series !== undefined;
								const pic = imageOf(d);
								const iChanged = !d.isNew && meta[d.id]?.image !== undefined;
								const clash = d.isNew && d.title.trim() ? overlapOf(d) : [];
								return [
									head && <tr key={d.id + "-h"} className="mp-group"><td colSpan={cols.length + 1}><span className="mp-gl">{sheetName(d.brand, d.category)}</span></td></tr>,
									seriesHead(r) && <tr key={d.id + "-s"} className="mp-sgroup"><td colSpan={cols.length + 1}><span className="mp-gl">{d.series || copy.otherSeries}</span></td></tr>,
									<tr key={d.id} className={d.isNew ? "mp-row--new" : d.id === highlight ? "mp-row--hl" : undefined}>
										<th className="mp-model" scope="row" data-row={r}>
											<div className="mp-model-in">
												<span className="mp-pic">
													<button type="button" className={"mp-thumb" + (pic ? " mp-thumb--set" : "") + (iChanged ? " mp-changed" : "")} disabled={locked}
														title={copy.chooseImage} aria-label={copy.chooseImage + ": " + (titleOf(d) || copy.newTag)} onClick={() => setPicking(d)}>
														{pic ? <img src={pic.url} alt="" loading="lazy" /> : <ImageSquare className="h-4 w-4" aria-hidden="true" />}
													</button>
													{pic && !locked && <button type="button" className="mp-unpic" title={copy.removeImage} aria-label={copy.removeImage + ": " + titleOf(d)} onClick={() => setImage(d, null)}><X className="h-3 w-3" aria-hidden="true" /></button>}
												</span>
												<div className="mp-model-txt">
													<div className="mp-line">
														{d.isNew && <span className="mp-desk"><Badge variant="green">{copy.newTag}</Badge></span>}
														<input className={"mp-name" + (tProblem ? " mp-invalid" : tChanged ? " mp-changed" : "")} value={d.isNew ? d.title : meta[d.id]?.title ?? d.title}
															placeholder={copy.titlePlaceholder} aria-label={copy.model} title={tProblem ?? undefined} disabled={locked} data-r={r} data-c="t" data-title={d.id}
															onChange={e => setField(d, "title", e.target.value)} onPaste={e => paste(e, r, -1)} {...cellMouse}
															onFocus={e => { editing.current = false; e.target.select(); }}
															onKeyDown={e => move(e, () => !d.isNew && setField(d, "title", d.title))} />
														{d.status !== "published" && !d.isNew && <Badge variant="warning">{copy.draft}</Badge>}
														{d.status === "published" && d.pending && <span title={copy.pendingDraftHint}><Badge variant="warning">{copy.pendingDraft}</Badge></span>}
														{d.isNew
															? <Button variant="ghost" size="xs" shape="square" icon={<X />} aria-label={copy.removeRow} title={copy.removeRow} onClick={() => removeNew(d)} />
															: <LinkButton {...toEditor(d.id)} variant="ghost" size="xs" shape="square" className="mp-desk text-kumo-subtle" icon={<ArrowSquareOut aria-hidden="true" />} title={copy.openEditor} aria-label={copy.openEditor} />}
													</div>
													<div className="mp-line">
														{d.isNew && <>
															<Select size="xs" aria-label={copy.brand} value={d.brand} onValueChange={v => setNewProp(d, { brand: String(v) })} items={Object.fromEntries(opts.brands.map(b => [b, brandLabels[b] ?? b]))} />
															<Select size="xs" aria-label={copy.categoryLabel} value={d.category} onValueChange={v => setNewProp(d, { category: String(v) })} items={Object.fromEntries(opts.categories.map(c => [c, copy.category[c] ?? c]))} />
														</>}
														<input className={"mp-series" + (sChanged ? " mp-changed" : "")} value={d.isNew ? d.series : meta[d.id]?.series ?? d.series} placeholder={copy.seriesPlaceholder}
															aria-label={copy.seriesPlaceholder} list={"mp-series-" + d.brand} disabled={locked} onChange={e => setField(d, "series", e.target.value)} />
													</div>
													{clash.length > 0 && <div className="mp-clash"><Warning className="mt-0.5 h-3.5 w-3.5 shrink-0 text-kumo-warning" aria-hidden="true" />{copy.overlap(clash.map(c => c.title))}</div>}
												</div>
											</div>
										</th>
										{cols.map((c, ci) => {
											const raw = edits[d.id]?.[c.key];
											const value = raw ?? formatCell(cellOf(d, c.key));
											const removing = raw !== undefined && !d.isNew && parseCell(raw) === null && !!cellOf(d, c.key);
											const state = raw === undefined || (d.isNew && !raw.trim()) ? "" : removing ? " mp-removed" : parseCell(raw) === "invalid" ? " mp-invalid" : " mp-changed";
											return <td key={c.key}><input className={"mp-cell" + state} size={1} style={{ "--n": value.length } as CSSProperties} inputMode="decimal" value={value} disabled={locked} data-r={r} data-c={ci}
												aria-label={(titleOf(d) || copy.newTag) + ": " + label(c.repair, c.quality)} title={state.includes("invalid") ? copy.invalid : removing ? copy.removedHint(formatCell(cellOf(d, c.key))) : undefined} placeholder={removing ? copy.removed : undefined}
												onChange={e => setCell(d, c.key, e.target.value)} onPaste={e => paste(e, r, ci)}
												onKeyDown={e => move(e, () => setEdits(prev => { const n = { ...prev, [d.id]: { ...prev[d.id] } }; delete n[d.id][c.key]; if (!Object.keys(n[d.id]).length) delete n[d.id]; return n; }))}
												{...cellMouse} onFocus={e => { editing.current = false; e.target.select(); }} /></td>;
										})}
									</tr>,
								];
							})}
						</tbody>
					</table>
				</div>
			))}
			<Dialog.Root open={reviewing} onOpenChange={setReviewing}>
				<Dialog size="base" className="mp-dialog p-6">
					<div className="grid gap-4">
						<Dialog.Title className="text-lg font-semibold">{copy.reviewTitle}</Dialog.Title>
						<Dialog.Description className="text-sm text-kumo-subtle">{copy.reviewIntro}</Dialog.Description>
						<ul className="grid gap-1 text-sm">
							{updatedCount > 0 && <li>{copy.reviewUpdated(updatedCount)}</li>}
							{created > 0 && <li>{copy.reviewCreated(created)}</li>}
							{removedCount > 0 && <li className="font-medium text-kumo-danger">{copy.reviewRemoved(removedCount)}</li>}
							{unpictured > 0 && <li className="font-medium text-kumo-danger">{copy.reviewUnpictured(unpictured)}</li>}
							{renamed.length > 0 && <li>{copy.reviewRenamed(renamed.length)}<ul className="mt-1 grid gap-0.5 text-kumo-subtle" style={{ paddingInlineStart: "1rem", listStyle: "disc" }}>{renamed.slice(0, 8).map(t => <li key={t}>{t}</li>)}{renamed.length > 8 && <li>…</li>}</ul></li>}
						</ul>
						<div className="mp-dfoot">
							<Button onClick={() => setReviewing(false)}>{copy.reviewBack}</Button>
							<Button variant="primary" onClick={() => { setReviewing(false); void save(); }}>{copy.save}</Button>
						</div>
					</div>
				</Dialog>
			</Dialog.Root>
			{devices && <ImportDialog open={importing} opts={opts} devices={devices} initialBrand={brand === "all" ? "" : brand} onClose={() => setImporting(false)} onApply={applyImport} />}
			<MediaPickerModal open={!!picking} onOpenChange={o => { if (!o) setPicking(null); }} mimeTypeFilter="image/" hideUrlInput localOnly
				title={picking ? copy.pickerTitle(titleOf(picking) || copy.newTag) : undefined}
				onSelect={item => { if (picking) if (item.storageKey) setImage(picking, { id: item.id, url: item.url, alt: item.alt, storageKey: item.storageKey }); setPicking(null); }} />
		</div>
	);
}

type Summary = { total: number; noImage: number; noPrices: number; pending: number; updatedAt: string };

function OverviewWidget() {
	const [data, setData] = useState<Summary | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	useEffect(() => { call<Summary>("summary", {}).then(setData, e => setError(e instanceof Error ? e.message : copy.error.UNAVAILABLE)); }, []);
	const exportNow = async () => {
		setBusy(true);
		try { await download(); }
		catch (e) { setError(e instanceof Error ? e.message : copy.error.UNAVAILABLE); }
		setBusy(false);
	};
	if (error) return <Banner variant="error" icon={<Warning weight="fill" />} description={error} />;
	if (!data) return (
		<div className="mp-sk grid gap-4 pb-1" role="status" aria-busy="true" aria-label={copy.loading}>
			<style>{skCss}</style>
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-4" aria-hidden="true">
				{[1, 2, 3, 4].map(i => <div key={i} className="grid gap-2"><SkeletonLine blockHeight={30} minWidth={30} maxWidth={55} /><SkeletonLine minWidth={45} maxWidth={80} /></div>)}
			</div>
			<div className="w-64" aria-hidden="true"><SkeletonLine blockHeight={26} minWidth={70} maxWidth={90} /></div>
		</div>
	);
	const stat = (key: keyof Summary, show?: string) => {
		const n = data[key] as number;
		const label = <span className="text-sm text-kumo-subtle">{copy.stats[key]}</span>;
		return (
			<div className="grid gap-1.5">
				<span className="text-3xl font-semibold leading-none tabular-nums">{n}</span>
				{show && n > 0
					? <AdminLink {...toPrices({ show })} className="group inline-flex items-center gap-1 rounded-sm text-sm text-kumo-subtle hover:text-kumo-default">{copy.stats[key]}<ArrowRight aria-hidden="true" className="size-3.5 opacity-60 group-hover:opacity-100" /></AdminLink>
					: label}
			</div>
		);
	};
	return (
		<div className="grid gap-4 pb-1">
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
				{stat("total")}{stat("noImage", "noImage")}{stat("noPrices", "noPrices")}{stat("pending")}
			</div>
			<div className="flex flex-wrap items-center gap-2">
				<LinkButton {...toPrices()} size="sm">{copy.openList}</LinkButton>
				<Button size="sm" icon={<DownloadSimple />} loading={busy} onClick={exportNow}>{copy.exportExcel}</Button>
				{data.updatedAt && <span className="text-xs text-kumo-subtle">{copy.lastChange(new Date(data.updatedAt).toLocaleString("de-AT", { dateStyle: "medium", timeStyle: "short" }))}</span>}
			</div>
		</div>
	);
}

function DevicePanel({ entry }: ContentEditorPanelContext) {
	const f = deviceFacts(entry.data);
	const open = !!entry.draftRevisionId && entry.draftRevisionId !== entry.liveRevisionId;
	return (
		<div className="grid gap-3 text-sm">
			<div className="flex items-center gap-3">
				{f.image
					? <img src={f.image} alt="" className="h-12 w-12 rounded-md border object-contain" />
					: <span className="grid h-12 w-12 place-items-center rounded-md border border-dashed bg-kumo-tint text-kumo-subtle"><ImageSquare className="h-5 w-5" aria-hidden="true" /></span>}
				<div className="grid gap-0.5">
					<span className="font-medium">{f.count ? copy.priceCount(f.count) : copy.noPrices}</span>
					{f.displayFrom !== null && <span className="text-kumo-subtle">{copy.displayFrom(euro(f.displayFrom))}</span>}
					<span className="text-kumo-subtle">{f.image ? copy.hasImage : copy.noImage}</span>
				</div>
			</div>
			<p className="text-kumo-subtle">{open ? copy.panelDraft : copy.panelHint}</p>
			<LinkButton {...toPrices({ device: entry.id })} size="sm" className="w-fit">{copy.openInList}</LinkButton>
		</div>
	);
}

function ImageCell({ item }: ContentListColumnCellContext) {
	const url = deviceFacts(item.data).image;
	return url
		? <img src={url} alt="" loading="lazy" className="h-8 w-8 rounded-md object-contain" />
		: <span className="grid h-8 w-8 place-items-center rounded-md bg-kumo-tint text-kumo-subtle" title={copy.noImage}><ImageSquare className="h-4 w-4" aria-label={copy.noImage} /></span>;
}

function PricesCell({ item }: ContentListColumnCellContext) {
	const f = deviceFacts(item.data);
	return (
		<AdminLink {...toPrices({ device: item.id })} className="text-sm hover:underline" title={copy.openInList}>
			{f.count ? <span className="tabular-nums">{copy.priceCount(f.count)}</span> : <span className="text-kumo-subtle">{copy.noPrices}</span>}
			{f.displayFrom !== null && <span className="block text-xs text-kumo-subtle tabular-nums">{copy.displayFrom(euro(f.displayFrom))}</span>}
		</AdminLink>
	);
}

export const pages = { "/prices": PricesPage };
export const widgets = { overview: OverviewWidget };
export const contentEditorPanels: readonly ContentEditorPanelExtension[] = [{ id: "prices", title: copy.pageTitle, component: DevicePanel, collections: ["devices"], order: 10 }];
export const contentListColumns: readonly ContentListColumnExtension[] = [
	{ id: "image", label: copy.colImage, cell: ImageCell, collections: ["devices"], order: 10 },
	{ id: "prices", label: copy.colPrices, cell: PricesCell, collections: ["devices"], order: 20, align: "end" },
];






























