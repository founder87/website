import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import { readSettings } from "./src/config/settings.mjs";

const settings = readSettings({ ...loadEnv(process.env.NODE_ENV || "development", process.cwd(), ""), ...process.env });
export default defineConfig({
    site: settings.origin,
    output: "static",
    trailingSlash: "always",
    build: { assets: "_astro", inlineStylesheets: "never" },
    devToolbar: { enabled: false },
    markdown: { syntaxHighlight: false },
    security: {
      csp: {
        directives: [
          "default-src 'self'", "base-uri 'none'", "object-src 'none'",
          "frame-src 'none'", "form-action 'self'", "img-src 'self' data:",
          "font-src 'self'", "media-src 'self'", "connect-src 'self'",
        ],
        scriptDirective: { resources: [{ resource: "'self'", kind: "element" }, { resource: "'none'", kind: "attribute" }] },
        styleDirective: { resources: [{ resource: "'self'", kind: "element" }, { resource: "'none'", kind: "attribute" }] },
      },
    },
    // Allowlist public settings; never serialize the environment into the client.
    vite: { define: { __SITE_SETTINGS__: JSON.stringify(settings) } },
    integrations: [{
      name: "solivant-host-headers",
      hooks: {
        "astro:build:done": async ({ dir }) => {
          const { writeFile } = await import("node:fs/promises");
          const { securityHeaders } = await import("./src/config/security.mjs");
          const headers = { ...securityHeaders, ...(!settings.indexable ? { "X-Robots-Tag": "noindex, nofollow" } : {}) };
          const lines = ["/*", ...Object.entries(headers).map(([name, value]) => "  " + name + ": " + value), "", "/_astro/*", "  Cache-Control: public, max-age=31536000, immutable", ""];
          await writeFile(new URL("_headers", dir), lines.join("\n"));
        },
      },
    }],
});
