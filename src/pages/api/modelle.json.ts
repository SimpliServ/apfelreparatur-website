import type { APIRoute } from "astro";
import { DEVICE_OF, hint, loadModels, modelPath } from "../../lib/devices";

// Compact catalogue for the model search in the global nav.
export const GET: APIRoute = async () => {
	const { models } = await loadModels().catch(() => ({ models: [] }));
	const body = models.map((m) => ({ t: m.title, u: modelPath(m), d: DEVICE_OF[m.category], h: hint(m), q: [m.title, m.model_numbers ?? ""].join(" ").toLowerCase() }));
	return new Response(JSON.stringify(body), { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=300" } });
};
