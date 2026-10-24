import { business, legalLine } from "./business";

export type MailContent = {
	preheader: string;
	title: string;
	lead: string;
	facts?: [string, string][];
	steps?: string[];
	staff?: boolean;
};

const esc = (v: string) => v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const font = "-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif";
const ink = "#1d1d1f", muted = "#6e6e73", line = "#d2d2d7", gray = "#f5f5f7", accent = "#0b6e7d";

export function mailText(c: MailContent): string {
	const parts = [c.title, c.lead];
	if (c.facts?.length) parts.push(c.facts.map(([k, v]) => `${k}: ${v}`).join("\n"));
	if (c.steps?.length) parts.push("So geht es weiter:\n" + c.steps.map((s, i) => `${i + 1}. ${s}`).join("\n"));
	if (!c.staff) parts.push(`${business.brand} · ${business.email} · https://${business.domain}\n${business.brand} ist eine Marke der ${legalLine}.`);
	return parts.join("\n\n");
}

export function mailHtml(c: MailContent, siteUrl: string): string {
	const site = new URL("/", siteUrl).toString();
	const rows = (c.facts ?? [])
		.map(([k, v]) => `<tr><td valign="top" width="36%" style="padding:12px 16px 12px 0;border-bottom:1px solid ${line};font-size:14px;line-height:20px;color:${muted}">${esc(k)}</td><td valign="top" style="padding:12px 0;border-bottom:1px solid ${line};font-size:15px;line-height:21px;color:${ink}">${esc(v).replace(/\n/g, "<br>")}</td></tr>`)
		.join("");
	const facts = rows ? `<tr><td style="padding:8px 0 28px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${line}">${rows}</table></td></tr>` : "";
	const steps = c.steps?.length
		? `<tr><td style="padding:0 0 8px"><div style="font-size:17px;line-height:22px;font-weight:600;color:${ink};padding-bottom:12px">So geht es weiter</div>${c.steps.map((s, i) => `<div style="font-size:15px;line-height:22px;color:${ink};padding:0 0 10px"><span style="color:${accent};font-weight:600">${i + 1}.</span>&nbsp; ${esc(s)}</div>`).join("")}</td></tr>`
		: "";
	const footer = c.staff
		? ""
		: `<tr><td style="padding:24px 8px 0;font-family:${font};font-size:12px;line-height:18px;color:${muted};text-align:center">${esc(business.brand)}<br><a href="mailto:${esc(business.email)}" style="color:${muted}">${esc(business.email)}</a> · <a href="${esc(site)}" style="color:${muted}">${esc(business.domain)}</a><br><br>${esc(business.brand)} ist eine Marke der ${esc(legalLine)}.<br>Unabhängiger Reparaturbetrieb, nicht mit Apple Inc. verbunden.</td></tr>`;
	return `<!DOCTYPE html><html lang="de-AT"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>${esc(c.title)}</title></head><body style="margin:0;padding:0;background:${gray};-webkit-text-size-adjust:100%"><div style="display:none;max-height:0;overflow:hidden">${esc(c.preheader)}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${gray}"><tr><td align="center" style="padding:32px 12px 40px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;font-family:${font}"><tr><td style="padding:0 8px 18px;font-size:19px;color:${ink}"><a href="${esc(site)}" style="color:${ink};text-decoration:none"><b>Apfel</b>reparatur</a></td></tr><tr><td style="background:#ffffff;border-radius:18px;padding:40px 36px 32px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td><h1 style="margin:0 0 12px;font-family:${font};font-size:28px;line-height:32px;font-weight:600;letter-spacing:-0.3px;color:${ink}">${esc(c.title)}</h1><p style="margin:0 0 20px;font-size:17px;line-height:25px;color:${ink}">${esc(c.lead)}</p></td></tr>${facts}${steps}</table></td></tr>${footer}</table></td></tr></table></body></html>`;
}
