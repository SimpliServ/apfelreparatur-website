import { definePlugin } from "emdash";
import { env } from "cloudflare:workers";
import { deliverResend, type ProviderConfig, type ProviderMessage } from "../lib/email-provider";

// Resend transport. Locally EmDash keeps its console sink until this plugin is picked as the email:deliver provider.
export function createPlugin() {
	return definePlugin({
		id: "apfel-email",
		version: "1.0.0",
		capabilities: ["hooks.email-transport:register", "network:request"],
		allowedHosts: ["api.resend.com"],
		hooks: {
			"email:deliver": {
				exclusive: true,
				handler: async ({ message, source }, ctx) => {
					try {
						await deliverResend(message as ProviderMessage, env as unknown as ProviderConfig, (url, init) => ctx.http!.fetch(url, init));
					} catch (error) {
						ctx.log.error("email delivery failed", { source, reason: error instanceof Error ? error.message : "UNKNOWN" });
						throw error;
					}
				},
			},
		},
	});
}
