import handler, { createScheduledHandler, PluginBridge } from "@emdash-cms/cloudflare/worker";
import { refreshCatalog } from "./lib/catalog-sync";

export { PluginBridge };

const emdashScheduled = createScheduledHandler();

export default {
	...handler,
	scheduled(event, env, ctx) {
		// MobiNil catalogue every 10 min; EmDash's own tasks every minute.
		if (new Date(event.scheduledTime).getUTCMinutes() % 10 === 0) ctx.waitUntil(refreshCatalog().catch(() => false));
		return emdashScheduled(event, env, ctx);
	},
} satisfies ExportedHandler;
