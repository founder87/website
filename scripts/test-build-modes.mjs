import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
const run = promisify(execFile);
const base = { ...process.env, ASTRO_TELEMETRY_DISABLED: "1", SITE_URL: "https://solivantstudios.com", SITE_INDEXABLE: "false", CONTACT_EMAIL: "", GA_MEASUREMENT_ID: "", CONTEXT: "" };
async function build(overrides = {}) {
  await run(process.execPath, ["node_modules/astro/bin/astro.mjs", "build"], { env: { ...base, ...overrides }, maxBuffer: 2_000_000 });
  await run(process.execPath, ["scripts/verify-build.mjs"], { env: base });
  return {
    home: await readFile("dist/index.html", "utf8"),
    contact: await readFile("dist/contact/index.html", "utf8"),
    privacy: await readFile("dist/privacy/index.html", "utf8"),
  };
}
try {
  const preview = await build({ SITE_INDEXABLE: "true", CONTEXT: "deploy-preview" });
  assert.ok(preview.home.includes('content="noindex, nofollow"'));
  assert.ok(!preview.contact.includes("<form"));
  console.log("PASS: deploy previews stay noindex.");
  const email = await build({ CONTACT_EMAIL: "studio@example.com" });
  assert.ok(email.contact.includes("mailto:studio%40example.com"));
  assert.ok(!email.contact.includes("<form"));
  console.log("PASS: contact page renders verified studio email.");
  const production = await build({ SITE_INDEXABLE: "true", CONTEXT: "production", CONTACT_EMAIL: "contact@solivantstudios.com", GA_MEASUREMENT_ID: "GTM-54ZF68NB" });
  assert.ok(production.home.includes('content="index, follow"'));
  assert.ok(production.home.includes('data-ga-id="GTM-54ZF68NB"'));
  assert.ok(production.home.includes("https://www.googletagmanager.com"));
  assert.ok(production.privacy.includes("Google Tag Manager"));
  console.log("PASS: production GTM, sitemap, and indexing.");
} finally {
  await build();
  console.log("Restored the safe default build (no indexing).");
}
