import handler, { createScheduledHandler, PluginBridge } from "@emdash-cms/cloudflare/worker";
import { purgeAfterDeploy, refreshCatalog } from "./lib/catalog-sync";

export { PluginBridge };

const emdashScheduled = createScheduledHandler();

export default {
	...handler,
	scheduled(event, env, ctx) {
		// MobiNil catalogue once an hour (owner: up to ~2 h delay is fine); EmDash's own tasks every 15 min.
		if (new Date(event.scheduledTime).getUTCMinutes() === 17) ctx.waitUntil(refreshCatalog().catch(() => false));
		ctx.waitUntil(purgeAfterDeploy((env as { CF_VERSION_METADATA?: { id: string } }).CF_VERSION_METADATA?.id).catch(() => {}));
		return emdashScheduled(event, env, ctx);
	},
} satisfies ExportedHandler;
