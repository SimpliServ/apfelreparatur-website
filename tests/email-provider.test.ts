import { test } from "node:test";
import assert from "node:assert/strict";
import { buildMime, deliver, deliverSmtp, type ProviderConfig, type SmtpSocket } from "../src/lib/email-provider.ts";

const config: ProviderConfig = { SMTP_HOST: "mail.example.test", SMTP_USER: "noreply@example.test", SMTP_PASS: "pw", EMAIL_FROM: "Müller & Co <noreply@example.test>", EMAIL_REPLY_TO: "office@example.test" };

function fakeServer(codes: Record<string, number> = {}) {
	const log: string[] = []; let data = ""; let inData = false;
	let push!: (s: string) => void;
	const readable = new ReadableStream<Uint8Array>({ start(c) { push = s => c.enqueue(new TextEncoder().encode(s)); push("220 ready\r\n"); } });
	const writable = new WritableStream<Uint8Array>({ write(chunk) {
		const line = new TextDecoder().decode(chunk);
		if (inData) { data += line; if (data.endsWith("\r\n.\r\n")) { inData = false; push(`${codes.BODY ?? 250} ok\r\n`); } return; }
		log.push(line.trim()); const verb = line.slice(0, 4).toUpperCase();
		if (verb === "EHLO") push("250-mail.example.test\r\n250 AUTH PLAIN\r\n");
		else if (verb === "AUTH") push(`${codes.AUTH ?? 235} ok\r\n`);
		else if (verb === "MAIL" || verb === "RCPT") push("250 ok\r\n");
		else if (verb === "DATA") { inData = true; push("354 go\r\n"); }
		else if (verb === "QUIT") push("221 bye\r\n");
	} });
	const socket: SmtpSocket = { readable, writable, close: async () => {} };
	return { socket, log, data: () => data };
}

test("smtp delivers with auth, envelope and dot-stuffed body", async () => {
	const s = fakeServer();
	await deliverSmtp({ to: "Kunde <kunde@example.test>", cc: ["cc@example.test"], subject: "Ihr Auftrag – Bestätigung", text: ".leading dot", html: "<p>Hi</p>", attachments: [{ filename: "a.pdf", content: btoa("pdf") }] }, config, () => s.socket);
	assert.deepEqual(s.log.slice(0, 2), ["EHLO example.test", "AUTH PLAIN " + btoa("\0noreply@example.test\0pw")]);
	assert.deepEqual(s.log.slice(2, 6), ["MAIL FROM:<noreply@example.test>", "RCPT TO:<kunde@example.test>", "RCPT TO:<cc@example.test>", "DATA"]);
	assert.equal(s.log.at(-1), "QUIT");
	const raw = s.data();
	assert.match(raw, /^From: =\?UTF-8\?B\?/m); assert.match(raw, /^Reply-To: office@example.test\r$/m);
	assert.match(raw, /multipart\/mixed/); assert.match(raw, /multipart\/alternative/); assert.match(raw, /filename="a.pdf"/);
	assert.ok(raw.endsWith("\r\n.\r\n"));
});

test("smtp failure codes and missing config raise", async () => {
	await assert.rejects(deliverSmtp({ to: "x@example.test", subject: "S", text: "T" }, config, () => fakeServer({ AUTH: 535 }).socket), /SMTP_AUTH_535/);
	await assert.rejects(deliverSmtp({ to: "x@example.test", subject: "S", text: "T" }, {}, () => fakeServer().socket), /EMAIL_PROVIDER_NOT_CONFIGURED/);
});

test("header injection is neutralised", () => {
	const raw = buildMime({ to: "a@example.test\r\nBcc: evil@example.test", subject: "Hi\r\nBcc: evil@example.test", text: "T" }, "Site <noreply@example.test>", "x@example.test\r\nX: y", "id@example.test");
	assert.doesNotMatch(raw, /^Bcc:/m); assert.doesNotMatch(raw, /^X: y/m);
});

test("deliver falls back to resend only when smtp fails and resend is configured", async () => {
	const calls: string[] = [];
	const fetch = async (url: string) => { calls.push(url); return new Response("{}"); };
	const log = { warn() {} };
	assert.equal(await deliver({ to: "x@example.test", subject: "S", text: "T" }, config, { connect: () => fakeServer().socket, fetch, log }), "smtp");
	assert.equal(await deliver({ to: "x@example.test", subject: "S", text: "T" }, { ...config, RESEND_API_KEY: "re" }, { connect: () => fakeServer({ AUTH: 535 }).socket, fetch, log }), "resend");
	await assert.rejects(deliver({ to: "x@example.test", subject: "S", text: "T" }, config, { connect: () => fakeServer({ AUTH: 535 }).socket, fetch, log }), /SMTP_AUTH_535/);
	assert.equal(calls.length, 1);
});
