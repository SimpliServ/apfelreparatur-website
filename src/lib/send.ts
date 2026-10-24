import { getPublicPluginApiRouteHandler } from "emdash/plugin-utils";

const PLUGIN = "apfel-inquiry";
type Outcome = { ok: true } | { ok: false; error: string };

export async function sendToPlugin(locals: App.Locals, url: URL, route: "repair" | "withdrawal", body: Record<string, unknown>, original: Request): Promise<Outcome> {
	const handler = getPublicPluginApiRouteHandler(locals);
	if (!handler) return { ok: false, error: "UNAVAILABLE" };
	// Forward the visitor's IP, otherwise the per-IP limit would count every visitor together.
	const headers = new Headers({ "content-type": "application/json" });
	const ip = original.headers.get("cf-connecting-ip");
	if (ip) headers.set("cf-connecting-ip", ip);
	const req = new Request(new URL(`/_emdash/api/plugins/${PLUGIN}/${route}`, url), { method: "POST", headers, body: JSON.stringify(body) });
	const res = await handler(PLUGIN, "POST", route, req);
	if (!res.success) return { ok: false, error: res.error?.code ?? "UNAVAILABLE" };
	return res.data as Outcome;
}
