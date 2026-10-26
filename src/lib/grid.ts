/** Excel-like cell navigation. Columns: -1 = model name, 0..cols-1 = prices. */
export type Pos = { r: number; c: number };
export type NavKey = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight" | "Enter" | "Tab" | "Home" | "End" | "PageUp" | "PageDown";
export type NavMods = { shift?: boolean; jump?: boolean };
export type Grid = { rows: number; cols: number; page: number; enabled: (p: Pos) => boolean };

export const NAV_KEYS = new Set<string>(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", "Tab", "Home", "End", "PageUp", "PageDown"]);
const FIRST = -1;

/** First enabled row from r going in direction dr (kept inside the table). */
function rowFrom(g: Grid, r: number, c: number, dr: number): number | null {
	for (let i = r; i >= 0 && i < g.rows; i += dr) if (g.enabled({ r: i, c })) return i;
	return null;
}

export function nextCell(from: Pos, key: NavKey, mods: NavMods, g: Grid): Pos | null {
	const last = g.cols - 1, lastRow = g.rows - 1;
	const vertical = (target: number, dr: number) => {
		const r = rowFrom(g, Math.max(0, Math.min(lastRow, target)), from.c, dr) ?? rowFrom(g, Math.max(0, Math.min(lastRow, target)), from.c, -dr);
		return r === null || r === from.r ? null : { r, c: from.c };
	};
	switch (key) {
		case "ArrowUp": return mods.jump ? vertical(0, 1) : vertical(from.r - 1, -1);
		case "ArrowDown": return mods.jump ? vertical(lastRow, -1) : vertical(from.r + 1, 1);
		case "Enter": return mods.shift ? vertical(from.r - 1, -1) : vertical(from.r + 1, 1);
		case "PageUp": return vertical(from.r - g.page, -1);
		case "PageDown": return vertical(from.r + g.page, 1);
		case "ArrowLeft": { const c = mods.jump ? FIRST : Math.max(FIRST, from.c - 1); return c === from.c ? null : { r: from.r, c }; }
		case "ArrowRight": { const c = mods.jump ? last : Math.min(last, from.c + 1); return c === from.c ? null : { r: from.r, c }; }
		case "Home": return mods.jump ? (rowFrom(g, 0, FIRST, 1) === null ? null : { r: rowFrom(g, 0, FIRST, 1)!, c: FIRST }) : from.c === FIRST ? null : { r: from.r, c: FIRST };
		case "End": return mods.jump ? (rowFrom(g, lastRow, last, -1) === null ? null : { r: rowFrom(g, lastRow, last, -1)!, c: last }) : from.c === last ? null : { r: from.r, c: last };
		case "Tab": {
			if (!mods.shift) {
				if (from.c < last) return { r: from.r, c: from.c + 1 };
				const r = rowFrom(g, from.r + 1, FIRST, 1);
				return r === null ? null : { r, c: FIRST };
			}
			if (from.c > FIRST) return { r: from.r, c: from.c - 1 };
			const r = rowFrom(g, from.r - 1, last, -1);
			return r === null ? null : { r, c: last };
		}
	}
}
