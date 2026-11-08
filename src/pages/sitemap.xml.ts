import type { APIRoute } from "astro";
import { projects } from "../data/projects";
import { settings } from "../data/site";
export const GET: APIRoute = () => {
  const routes = ["/", "/projects/", "/studio/", "/contact/", "/privacy/", ...projects.map(p => "/projects/" + p.slug + "/")];
  const urls = settings.indexable ? routes.map(path => "<url><loc>" + new URL(path, settings.origin).href + "</loc></url>").join("") : "";
  return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + urls + "</urlset>", { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
