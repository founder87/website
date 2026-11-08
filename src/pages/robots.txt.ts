import type { APIRoute } from "astro";
import { settings } from "../data/site";
export const GET: APIRoute = () => new Response(
  settings.indexable
    ? "User-agent: *\nAllow: /\nSitemap: " + settings.origin + "/sitemap.xml\n"
    : "User-agent: *\nDisallow: /\n",
  { headers: { "Content-Type": "text/plain; charset=utf-8" } },
);
