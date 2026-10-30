// Live "Geöffnet / Geschlossen" from the store hours, in Vienna time. Runs on the server and again in the browser,
// because pages are cached. Holidays are not known (same as on mobinil.at).
export type OpenState = { open: boolean; soon: boolean; word: string; rest: string };

const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const minutes = (hhmm: string) => {
	const [h, m] = hhmm.split(":").map(Number);
	return h * 60 + (m || 0);
};

// Labels look like "Mo – Fr", "Sa" or "Mo, Mi"; 0 = Monday.
const days = (label: string) =>
	label.split(", ").flatMap((part) => {
		const [from, to = from] = part.split(" – ").map((d) => DAYS.indexOf(d.trim()));
		return from < 0 || to < 0 ? [] : Array.from({ length: to - from + 1 }, (_, i) => from + i);
	});

function viennaNow(date: Date) {
	const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Vienna", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
	const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
	return { day: Math.max(0, EN.indexOf(get("weekday"))), minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export function openState(hours: [string, string][], date = new Date()): OpenState {
	const rows = hours.map(([label, time]) => {
		const [opens, closes] = time.split(" – ");
		return { days: days(label), opens, closes };
	});
	const on = (day: number) => rows.find((r) => r.days.includes(day));
	const now = viennaNow(date);
	const today = on(now.day);
	if (today && now.minutes >= minutes(today.opens) && now.minutes < minutes(today.closes))
		return { open: true, soon: minutes(today.closes) - now.minutes <= 60, word: "Geöffnet", rest: `bis ${today.closes}` };
	if (today && now.minutes < minutes(today.opens)) return { open: false, soon: false, word: "Geschlossen", rest: `heute ab ${today.opens}` };
	for (let k = 1; k <= 7; k++) {
		const day = (now.day + k) % 7;
		const h = on(day);
		if (h) return { open: false, soon: false, word: "Geschlossen", rest: `${k === 1 ? "morgen" : DAYS[day]} ab ${h.opens}` };
	}
	return { open: false, soon: false, word: "Geschlossen", rest: "" };
}
