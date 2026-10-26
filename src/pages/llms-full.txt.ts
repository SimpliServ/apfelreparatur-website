import type { APIRoute } from "astro";
import { getLocations } from "../lib/mobinil";
import { llmsFullTxt } from "../lib/llms";
import { loadModels } from "../lib/devices";

export const GET: APIRoute = async () =>
	new Response(llmsFullTxt(await getLocations(), (await loadModels().catch(() => ({ models: [] }))).models), { headers: { "content-type": "text/markdown; charset=utf-8", "cache-control": "public, max-age=3600" } });
