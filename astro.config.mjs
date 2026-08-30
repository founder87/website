import { defineConfig } from "astro/config";

export default defineConfig({
  // Netlify provides URL for the production site. SITE_URL can override it
  // later if the canonical domain differs from the default Netlify URL.
  site: process.env.SITE_URL || process.env.URL,
  output: "static",
  build: {
    assets: "_astro",
  },
});
