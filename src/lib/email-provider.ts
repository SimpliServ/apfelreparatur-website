export type Attachment = { filename: string; content: string };
export type ProviderMessage = { to: string; cc?: string[]; replyTo?: string; subject: string; text: string; html?: string; attachments?: Attachment[]; idempotencyKey?: string };
export type ProviderConfig = { RESEND_API_KEY?: string; EMAIL_FROM?: string; EMAIL_REPLY_TO?: string; MAILIN_EMAIL_FROM?: string; MAILIN_EMAIL_REPLY_TO?: string };
type Fetch = (url: string, init: RequestInit) => Promise<Response>;

export function senderConfig(config: ProviderConfig) {
	return { apiKey: config.RESEND_API_KEY, from: config.EMAIL_FROM || config.MAILIN_EMAIL_FROM, replyTo: config.EMAIL_REPLY_TO || config.MAILIN_EMAIL_REPLY_TO };
}

export async function deliverResend(message: ProviderMessage, config: ProviderConfig, fetch: Fetch): Promise<void> {
	const { apiKey, from, replyTo } = senderConfig(config);
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
