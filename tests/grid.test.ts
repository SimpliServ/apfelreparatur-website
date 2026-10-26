import assert from "node:assert/strict";
import test from "node:test";
import { nextCell, type Grid } from "../src/lib/grid.ts";

const grid = (locked: number[] = []): Grid => ({ rows: 5, cols: 3, page: 2, enabled: p => !locked.includes(p.r) });

test("arrows move one cell and stop at the edges", () => {
	const g = grid();
	assert.deepEqual(nextCell({ r: 1, c: 0 }, "ArrowDown", {}, g), { r: 2, c: 0 });
	assert.deepEqual(nextCell({ r: 1, c: 0 }, "ArrowUp", {}, g), { r: 0, c: 0 });
	assert.deepEqual(nextCell({ r: 1, c: 0 }, "ArrowLeft", {}, g), { r: 1, c: -1 });
	assert.deepEqual(nextCell({ r: 1, c: 0 }, "ArrowRight", {}, g), { r: 1, c: 1 });
	assert.equal(nextCell({ r: 0, c: 0 }, "ArrowUp", {}, g), null);
	assert.equal(nextCell({ r: 4, c: 0 }, "ArrowDown", {}, g), null);
	assert.equal(nextCell({ r: 2, c: -1 }, "ArrowLeft", {}, g), null);
	assert.equal(nextCell({ r: 2, c: 2 }, "ArrowRight", {}, g), null);
});

test("ctrl/cmd + arrow, home/end and page keys jump", () => {
	const g = grid();
	assert.deepEqual(nextCell({ r: 2, c: 1 }, "ArrowDown", { jump: true }, g), { r: 4, c: 1 });
	assert.deepEqual(nextCell({ r: 2, c: 1 }, "ArrowRight", { jump: true }, g), { r: 2, c: 2 });
	assert.deepEqual(nextCell({ r: 2, c: 1 }, "ArrowLeft", { jump: true }, g), { r: 2, c: -1 });
	assert.deepEqual(nextCell({ r: 2, c: 1 }, "Home", {}, g), { r: 2, c: -1 });
	assert.deepEqual(nextCell({ r: 2, c: 1 }, "End", { jump: true }, g), { r: 4, c: 2 });
	assert.deepEqual(nextCell({ r: 2, c: 1 }, "Home", { jump: true }, g), { r: 0, c: -1 });
	assert.deepEqual(nextCell({ r: 0, c: 1 }, "PageDown", {}, g), { r: 2, c: 1 });
	assert.deepEqual(nextCell({ r: 3, c: 1 }, "PageDown", {}, g), { r: 4, c: 1 });
});

test("tab and enter wrap like Excel, locked rows are skipped", () => {
	const g = grid([2]);
	assert.deepEqual(nextCell({ r: 0, c: 2 }, "Tab", {}, g), { r: 1, c: -1 });
	assert.deepEqual(nextCell({ r: 1, c: -1 }, "Tab", { shift: true }, g), { r: 0, c: 2 });
	assert.deepEqual(nextCell({ r: 1, c: 0 }, "ArrowDown", {}, g), { r: 3, c: 0 });
	assert.deepEqual(nextCell({ r: 3, c: 0 }, "Enter", { shift: true }, g), { r: 1, c: 0 });
	assert.deepEqual(nextCell({ r: 1, c: 2 }, "Tab", {}, g), { r: 3, c: -1 });
	assert.equal(nextCell({ r: 4, c: 2 }, "Tab", {}, g), null);
});
