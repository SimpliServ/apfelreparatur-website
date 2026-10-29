import handler, { createScheduledHandler, PluginBridge } from "@emdash-cms/cloudflare/worker";
import { refreshCatalog } from "./lib/catalog-sync";

export { PluginBridge };

const emdashScheduled = createScheduledHandler();

export default {
	...handler,
	scheduled(event, env, ctx) {
		// MobiNil catalogue once an hour (owner: up to ~2 h delay is fine); EmDash's own tasks every minute.
		if (new Date(event.scheduledTime).getUTCMinutes() === 17) ctx.waitUntil(refreshCatalog().catch(() => false));
		return emdashScheduled(event, env, ctx);
	},
} satisfies ExportedHandler;
