import { definePlugin } from "emdash";
import { env } from "cloudflare:workers";
import { connect } from "cloudflare:sockets";
import { deliver, type ProviderConfig, type ProviderMessage } from "../lib/email-provider";

const DAY = 86_400_000;

export function createPlugin() {
	return definePlugin({
		id: "apfel-email", version: "1.1.0",
		capabilities: ["hooks.email-transport:register", "network:request"],
		allowedHosts: ["api.resend.com"],
		hooks: {
			"email:deliver": { exclusive: true, handler: async ({ message, source }, ctx) => {
				const msg = message as ProviderMessage;
				// SMTP has no idempotency key: same key within 24 h is sent once.
				const key = msg.idempotencyKey ? "sent:" + msg.idempotencyKey : null;
				if (key) { const at = await ctx.kv.get<number>(key); if (at && Date.now() - at < DAY) { ctx.log.info("email skipped (duplicate)", { source }); return; } }
				try {
					const via = await deliver(msg, env as unknown as ProviderConfig, {
						connect: (hostname, port) => connect({ hostname, port }, { secureTransport: "on", allowHalfOpen: false }),
						fetch: (url, init) => ctx.http!.fetch(url, init), log: ctx.log,
					});
					ctx.log.info("email sent", { source, via });
				} catch (error) { ctx.log.error("email delivery failed", { source, reason: error instanceof Error ? error.message : "UNKNOWN" }); throw error; }
				if (key) {
					await ctx.kv.set(key, Date.now());
					if (Math.random() < 0.05) for (const row of await ctx.kv.list("sent:")) if (Date.now() - Number(row.value) > DAY) await ctx.kv.delete(row.key);
				}
			} },
		},
	});
}
