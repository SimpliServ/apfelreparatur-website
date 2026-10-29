import { definePlugin } from "emdash";
import type { RouteContext } from "emdash";
import { env } from "cloudflare:workers";
import { mailHtml, mailText, type MailContent } from "../lib/mail";
import { inquiry as q } from "../lib/inquiry-copy";

// Repair, buyback and withdrawal requests only go out as mails (office + confirmation to the customer); nothing is stored.
type Limit = { count: number; expiresAt: number };
type Store<T> = {
	get(id: string): Promise<T | null>;
	put(id: string, data: T): Promise<void>;
	query(q: object): Promise<{ items: { id: string; data: T }[] }>;
	deleteMany(ids: string[]): Promise<unknown>;
};
type Fact = [string, string];
type Send = Parameters<NonNullable<RouteContext["email"]>["send"]>[0];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HOUR = 3600_000;
const cfg = env as unknown as Record<string, string | undefined>;

const str = (v: unknown, max = 200) => (typeof v === "string" ? v.replace(/\r\n?/g, "\n").trim().slice(0, max) : "");
const line = (v: unknown, max = 200) => str(v, max).replace(/\s+/g, " ");
const fail = (error: string) => ({ ok: false as const, error });
const hash = async (v: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v))), (b) => b.toString(16).padStart(2, "0")).join("");
const received = () => new Intl.DateTimeFormat("de-AT", { timeZone: "Europe/Vienna", dateStyle: "medium", timeStyle: "short" }).format(Date.now()) + " Uhr";
const facts = (rows: [string, string | undefined][]): Fact[] => rows.filter((r): r is Fact => Boolean(r[1]));

async function limit(store: Store<Limit>, key: string, max: number): Promise<boolean> {
	const now = Date.now();
	const id = await hash(key);
	const cur = await store.get(id);
	const next = cur && cur.expiresAt > now ? cur : { count: 0, expiresAt: now + HOUR };
	if (next.count >= max) return false;
	await store.put(id, { ...next, count: next.count + 1 });
	return true;
}

async function deliver(ctx: RouteContext, kind: string, staff: MailContent & { subject: string }, customer: (MailContent & { subject: string }) | null, replyTo: string) {
	const limits = ctx.storage.limits as unknown as Store<Limit>;
	if (!(await limit(limits, "ip:" + (ctx.requestMeta.ip ?? "local"), 10)) || !(await limit(limits, "email:" + replyTo, 5))) return fail("RATE_LIMIT");
	if (!ctx.email) return fail("UNAVAILABLE");
	const siteUrl = cfg.EMDASH_SITE_URL || "https://apfelreparatur.at";
	const key = await hash(JSON.stringify(staff.facts));
	try {
		await ctx.email.send({ to: cfg.INQUIRY_EMAIL || "office@apfelreparatur.at", replyTo, subject: staff.subject, text: mailText(staff), html: mailHtml(staff, siteUrl), idempotencyKey: `ar-${kind}-${key}` } as Send);
		if (customer) await ctx.email.send({ to: replyTo, subject: customer.subject, text: mailText(customer), html: mailHtml(customer, siteUrl), idempotencyKey: `ar-${kind}-c-${key}` } as Send);
	} catch (error) {
		ctx.log.error("inquiry mail failed", { kind, reason: error instanceof Error ? error.message : "UNKNOWN" });
		return fail("UNAVAILABLE");
	}
	ctx.log.info("inquiry mailed", { kind });
	const expired = await limits.query({ where: { expiresAt: { lt: Date.now() } }, limit: 20 });
	if (expired.items.length) await limits.deleteMany(expired.items.map((r) => r.id));
	return { ok: true as const };
}

export function createPlugin() {
	return definePlugin({
		id: "apfel-inquiry",
		version: "1.0.0",
		capabilities: ["email:send"],
		storage: { limits: { indexes: ["expiresAt"] } },
		routes: {
			repair: {
				public: true,
				methods: ["POST"],
				request: { body: "json" },
				handler: async (ctx) => {
					const i = (ctx.input ?? {}) as Record<string, unknown>;
					const f = q.field;
					const issues = (Array.isArray(i.issues) ? i.issues : []).map((v) => line(v, 40)).filter((v) => q.issues[v]);
					const d = {
						device: line(i.device, 20), model: line(i.model, 80), message: str(i.message, 3000),
						name: line(i.name, 120), email: line(i.email, 160).toLowerCase(), phone: line(i.phone, 40), contact: line(i.contact, 20),
					};
					if (str(i.website)) return fail("SPAM");
					if (i.consent !== true) return fail("CONSENT");
					if (!q.devices[d.device] || !issues.length || !d.name || !d.email) return fail("MISSING_FIELDS");
					if (!EMAIL_RE.test(d.email)) return fail("INVALID_EMAIL");
					if (d.contact === "telefon" && !d.phone) return fail("PHONE_REQUIRED");
					const device = [q.devices[d.device], d.model].filter(Boolean).join(" · ");
					const rows = facts([
						[f.device, device], [f.issues, issues.map((k) => q.issues[k]).join(", ")], [f.message, d.message],
						[f.name, d.name], [f.email, d.email], [f.phone, d.phone], [f.contact, q.contacts[d.contact]],
					]);
					return deliver(
						ctx,
						"repair",
						{ subject: `Reparaturanfrage · ${device} · ${d.name}`, preheader: device, title: "Neue Reparaturanfrage", lead: q.staffLead, facts: [...rows, [q.received, received()]], staff: true },
						{ subject: q.customer.subject, preheader: q.customer.lead, title: q.customer.title.replace("{name}", d.name.split(" ")[0]), lead: q.customer.lead, facts: rows, steps: q.customer.steps },
						d.email,
					);
				},
			},
			sell: {
				public: true,
				methods: ["POST"],
				request: { body: "json" },
				handler: async (ctx) => {
					const i = (ctx.input ?? {}) as Record<string, unknown>;
					const s = q.sell;
					const f = s.field;
					const d = {
						device: line(i.device, 20), model: line(i.model, 80), storage: line(i.storage, 20), condition: line(i.condition, 20), note: str(i.note, 2000),
						handoff: line(i.handoff, 10), store: line(i.store, 120), street: line(i.street, 120), zip: line(i.zip, 10), city: line(i.city, 80),
						name: line(i.name, 120), email: line(i.email, 160).toLowerCase(), phone: line(i.phone, 40),
					};
					if (str(i.website)) return fail("SPAM");
					if (i.consent !== true) return fail("CONSENT");
					if (!Object.hasOwn(s.devices, d.device) || !d.model || !Object.hasOwn(s.conditions, d.condition) || !Object.hasOwn(s.handoffs, d.handoff) || !d.name || !d.email) return fail("MISSING_FIELDS");
					if (d.handoff === "post" && (!d.street || !d.zip || !d.city)) return fail("ADDRESS_REQUIRED");
					if (!EMAIL_RE.test(d.email)) return fail("INVALID_EMAIL");
					const device = `${s.devices[d.device]} · ${d.model}`;
					const [condition, conditionDesc] = s.conditions[d.condition];
					const rows = facts([
						[f.device, device], [f.storage, s.storage.includes(d.storage) ? d.storage : ""], [f.condition, `${condition} (${conditionDesc})`], [f.note, d.note],
						[f.handoff, s.handoffs[d.handoff]], [f.store, d.handoff === "shop" ? d.store : ""], [f.address, d.handoff === "post" ? `${d.street}, ${d.zip} ${d.city}` : ""],
						[f.name, d.name], [f.email, d.email], [f.phone, d.phone],
					]);
					return deliver(
						ctx,
						"sell",
						{ subject: `Ankauf · ${device} · ${d.name}`, preheader: device, title: "Neue Ankauf-Anfrage", lead: s.staffLead, facts: [...rows, [q.received, received()]], staff: true },
						{ subject: s.customer.subject, preheader: s.customer.lead, title: s.customer.title.replace("{name}", d.name.split(" ")[0]), lead: s.customer.lead, facts: rows, steps: s.customer.steps },
						d.email,
					);
				},
			},
			withdrawal: {
				public: true,
				methods: ["POST"],
				request: { body: "json" },
				handler: async (ctx) => {
					const i = (ctx.input ?? {}) as Record<string, unknown>;
					const f = q.withdrawal.field;
					const d = { name: line(i.name, 120), email: line(i.email, 160).toLowerCase(), order: line(i.order, 80), date: line(i.date, 20), message: str(i.message, 2000) };
					if (str(i.website)) return fail("SPAM");
					if (!d.name || !d.email || !d.order) return fail("MISSING_FIELDS");
					if (!EMAIL_RE.test(d.email)) return fail("INVALID_EMAIL");
					const rows = facts([[f.name, d.name], [f.email, d.email], [f.order, d.order], [f.date, d.date], [f.message, d.message], [q.received, received()]]);
					return deliver(
						ctx,
						"withdrawal",
						{ subject: `Widerruf · ${d.order} · ${d.name}`, preheader: d.order, title: "Widerruf eingegangen", lead: q.withdrawal.staffLead, facts: rows, staff: true },
						{ subject: q.withdrawal.subject, preheader: q.withdrawal.lead, title: q.withdrawal.subject, lead: q.withdrawal.lead, facts: rows },
						d.email,
					);
				},
			},
		},
	});
}
