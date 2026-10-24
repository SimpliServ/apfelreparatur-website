import type { APIRoute } from "astro";
import { getLocations } from "../lib/mobinil";
import { llmsFullTxt } from "../lib/llms";

export const GET: APIRoute = async () =>
	new Response(llmsFullTxt(await getLocations()), { headers: { "content-type": "text/markdown; charset=utf-8", "cache-control": "public, max-age=3600" } });
