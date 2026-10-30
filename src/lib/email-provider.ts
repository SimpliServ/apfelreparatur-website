export type Attachment = { filename: string; content: string };
export type ProviderMessage = { to: string; cc?: string[]; replyTo?: string; subject: string; text: string; html?: string; attachments?: Attachment[]; idempotencyKey?: string };
export type ProviderConfig = { RESEND_API_KEY?: string; EMAIL_FROM?: string; EMAIL_REPLY_TO?: string; MAILIN_EMAIL_FROM?: string; MAILIN_EMAIL_REPLY_TO?: string; SMTP_HOST?: string; SMTP_PORT?: string; SMTP_USER?: string; SMTP_PASS?: string; RESEND_EMAIL_FROM?: string };
type Fetch = (url: string, init: RequestInit) => Promise<Response>;
export type SmtpSocket = { readable: ReadableStream<Uint8Array>; writable: WritableStream<Uint8Array>; close(): Promise<void> };
export type Connect = (host: string, port: number) => SmtpSocket;

export function senderConfig(config: ProviderConfig) {
	return { apiKey: config.RESEND_API_KEY, from: config.EMAIL_FROM || config.MAILIN_EMAIL_FROM, replyTo: config.EMAIL_REPLY_TO || config.MAILIN_EMAIL_REPLY_TO };
}

export function smtpConfigured(config: ProviderConfig) {
	return Boolean(config.SMTP_HOST && config.SMTP_USER && config.SMTP_PASS && senderConfig(config).from);
}

export async function deliverResend(message: ProviderMessage, config: ProviderConfig, fetch: Fetch): Promise<void> {
	const { apiKey, replyTo } = senderConfig(config);
	// Resend only knows its verified domain, so the fallback may need its own sender.
	const from = config.RESEND_EMAIL_FROM || senderConfig(config).from;
	if (!apiKey || !from) throw new Error("EMAIL_PROVIDER_NOT_CONFIGURED");
	const reply = message.replyTo || replyTo;
	const res = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json", ...(message.idempotencyKey ? { "Idempotency-Key": message.idempotencyKey } : {}) },
		body: JSON.stringify({
			from, to: message.to, subject: message.subject, text: message.text,
			...(message.cc?.length ? { cc: message.cc } : {}), ...(message.html ? { html: message.html } : {}), ...(reply ? { reply_to: reply } : {}),
			...(message.attachments?.length ? { attachments: message.attachments.map(a => ({ filename: a.filename, content: a.content })) } : {}),
		}),
		signal: AbortSignal.timeout(10_000),
	});
	if (!res.ok) throw new Error("EMAIL_DELIVERY_FAILED_" + res.status);
}

const utf8 = new TextEncoder();
const b64 = (bytes: Uint8Array) => { let s = ""; for (const b of bytes) s += String.fromCharCode(b); return btoa(s); };
const wrap = (s: string) => s.replace(/.{1,76}/g, "$&\r\n");
const oneLine = (value: string) => value.replace(/[\r\n\t]+/g, " ");
// Strips CR/LF and brackets so user input cannot inject SMTP commands or headers.
const addressOf = (value: string) => (oneLine(value).match(/<([^>]+)>\s*$/)?.[1] ?? value).replace(/[\s<>]/g, "");

// RFC 2047 encoded words, split on code points so no word exceeds 75 chars.
function encodeWords(raw: string) {
	const value = oneLine(raw);
	if (/^[\x20-\x7e]*$/.test(value)) return value;
	const words: string[] = []; let chunk = "";
	for (const ch of value) {
		if (utf8.encode(chunk + ch).length > 45) { words.push(chunk); chunk = ""; }
		chunk += ch;
	}
	words.push(chunk);
	return words.map(w => `=?UTF-8?B?${b64(utf8.encode(w))}?=`).join("\r\n ");
}

function encodeAddress(value: string) {
	const m = oneLine(value).match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
	if (!m || !m[1]) return addressOf(value);
	const name = m[1].replace(/^"|"$/g, "");
	const address = addressOf(m[2]);
	const phrase = /^[\x20-\x7e]*$/.test(name) ? (/^[\w !#$%&'*+\-/=?^`{|}~]*$/.test(name) ? name : `"${name.replace(/(["\\])/g, "\\$1")}"`) : encodeWords(name);
	return `${phrase} <${address}>`;
}

function contentType(filename: string) {
	const ext = filename.split(".").pop()?.toLowerCase();
	return ({ pdf: "application/pdf", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", txt: "text/plain; charset=utf-8" } as Record<string, string>)[ext ?? ""] ?? "application/octet-stream";
}

export function buildMime(message: ProviderMessage, from: string, replyTo: string | undefined, messageId: string, date = new Date()): string {
	const tag = messageId.replace(/[^\w]/g, "").slice(0, 24);
	const text = (type: string, body: string) => `Content-Type: ${type}; charset=utf-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${wrap(b64(utf8.encode(body)))}`;
	const multipart = (kind: string, parts: string[]) => {
		const boundary = `=_${kind}_${tag}`;
		return `Content-Type: multipart/${kind}; boundary="${boundary}"\r\n\r\n${parts.map(p => `--${boundary}\r\n${p}\r\n`).join("")}--${boundary}--\r\n`;
	};
	let entity = message.html ? multipart("alternative", [text("text/plain", message.text), text("text/html", message.html)]) : text("text/plain", message.text);
	if (message.attachments?.length) {
		entity = multipart("mixed", [entity, ...message.attachments.map(a => {
			const name = encodeWords(a.filename).replace(/"/g, "");
			return `Content-Type: ${contentType(a.filename)}; name="${name}"\r\nContent-Disposition: attachment; filename="${name}"\r\nContent-Transfer-Encoding: base64\r\n\r\n${wrap(a.content.replace(/\s+/g, ""))}`;
		})]);
	}
	const headers = [
		`From: ${encodeAddress(from)}`,
		`To: ${encodeAddress(message.to)}`,
		...(message.cc?.length ? [`Cc: ${message.cc.map(encodeAddress).join(", ")}`] : []),
		...(replyTo ? [`Reply-To: ${encodeAddress(replyTo)}`] : []),
		`Subject: ${encodeWords(message.subject)}`,
		`Date: ${date.toUTCString().replace("GMT", "+0000")}`,
		`Message-ID: <${messageId}>`,
		"MIME-Version: 1.0",
	];
	return `${headers.join("\r\n")}\r\n${entity}`;
}

class SmtpSession {
	private buf = "";
	private decoder = new TextDecoder();
	private reader: ReadableStreamDefaultReader<Uint8Array>;
	private writer: WritableStreamDefaultWriter<Uint8Array>;
	constructor(socket: SmtpSocket) { this.reader = socket.readable.getReader(); this.writer = socket.writable.getWriter(); }

	async reply(): Promise<number> {
		for (;;) {
			const lines = this.buf.split("\r\n");
			for (let i = 0; i < lines.length - 1; i++) {
				if (/^\d{3}(?: |$)/.test(lines[i])) { this.buf = lines.slice(i + 1).join("\r\n"); return Number(lines[i].slice(0, 3)); }
			}
			const { value, done } = await this.reader.read();
			if (done) throw new Error("SMTP_CLOSED");
			this.buf += this.decoder.decode(value, { stream: true });
		}
	}

	async send(line: string, expect: number[], step: string): Promise<void> {
		await this.writer.write(utf8.encode(line + "\r\n"));
		await this.expect(expect, step);
	}

	async expect(expect: number[], step: string): Promise<void> {
		const code = await this.reply();
		if (!expect.includes(code)) throw new Error(`SMTP_${step}_${code}`);
	}
}

export async function deliverSmtp(message: ProviderMessage, config: ProviderConfig, connect: Connect, timeoutMs = 20_000): Promise<void> {
	const { from, replyTo } = senderConfig(config);
	if (!smtpConfigured(config)) throw new Error("EMAIL_PROVIDER_NOT_CONFIGURED");
	const user = config.SMTP_USER!;
	const domain = addressOf(user).split("@")[1] ?? "localhost";
	const id = `${message.idempotencyKey ? message.idempotencyKey.replace(/[^\w.-]/g, "") : crypto.randomUUID()}.${Date.now().toString(36)}@${domain}`;
	const data = buildMime(message, from!, message.replyTo || replyTo, id).replace(/\r?\n/g, "\r\n").replace(/^\./gm, "..");
	const recipients = [message.to, ...(message.cc ?? [])].map(addressOf);
	const socket = connect(config.SMTP_HOST!, Number(config.SMTP_PORT || 465));
	const session = new SmtpSession(socket);
	let timer: ReturnType<typeof setTimeout> | undefined;
	const timeout = new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("SMTP_TIMEOUT")), timeoutMs); });
	try {
		await Promise.race([timeout, (async () => {
			await session.expect([220], "GREETING");
			await session.send(`EHLO ${domain}`, [250], "EHLO");
			await session.send(`AUTH PLAIN ${b64(utf8.encode(`\0${user}\0${config.SMTP_PASS}`))}`, [235], "AUTH");
			await session.send(`MAIL FROM:<${addressOf(user)}>`, [250], "MAIL");
			for (const rcpt of recipients) await session.send(`RCPT TO:<${rcpt}>`, [250, 251], "RCPT");
			await session.send("DATA", [354], "DATA");
			await session.send(`${data.endsWith("\r\n") ? data : data + "\r\n"}.`, [250], "BODY");
		})()]);
		// Message is accepted at this point; QUIT failures must not trigger a resend.
		await Promise.race([session.send("QUIT", [221], "QUIT"), new Promise(r => setTimeout(r, 2_000))]).catch(() => {});
	} finally {
		clearTimeout(timer);
		await socket.close().catch(() => {});
	}
}

type Log = { warn(msg: string, data?: Record<string, unknown>): void };

// Own mail server first; Resend only when SMTP is not set up or fails before the server accepted the message.
export async function deliver(message: ProviderMessage, config: ProviderConfig, deps: { connect: Connect; fetch: Fetch; log: Log }): Promise<"smtp" | "resend"> {
	if (!smtpConfigured(config)) { await deliverResend(message, config, deps.fetch); return "resend"; }
	try { await deliverSmtp(message, config, deps.connect); return "smtp"; }
	catch (error) {
		if (!config.RESEND_API_KEY) throw error;
		deps.log.warn("smtp failed, falling back to resend", { reason: error instanceof Error ? error.message : "UNKNOWN" });
		await deliverResend(message, config, deps.fetch);
		return "resend";
	}
}
