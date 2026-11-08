import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
const run = promisify(execFile);
const base = { ...process.env, ASTRO_TELEMETRY_DISABLED: "1", SITE_URL: "https://solivantstudios.com", SITE_INDEXABLE: "false", CONTACT_EMAIL: "", CONTACT_PROVIDER: "disabled", CONTACT_PRIVACY_REVIEWED: "false", NETLIFY: "false", CONTEXT: "" };
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
  const preview = await build({ SITE_INDEXABLE: "true", CONTACT_PROVIDER: "netlify", NETLIFY: "true", CONTEXT: "deploy-preview" });
  assert.ok(preview.home.includes('content="noindex, nofollow"'));
  assert.ok(!preview.contact.includes("<form"));
  console.log("PASS: deploy previews stay noindex with forms disabled.");
  const email = await build({ CONTACT_EMAIL: "studio@example.com" });
  assert.ok(email.contact.includes("mailto:studio%40example.com"));
  assert.ok(!email.contact.includes("<form"));
  console.log("PASS: email-only contact does not render an unbacked form.");
  const production = await build({ SITE_INDEXABLE: "true", CONTACT_PROVIDER: "netlify", NETLIFY: "true", CONTEXT: "production", CONTACT_PRIVACY_REVIEWED: "true" });
  assert.ok(production.home.includes('content="index, follow"'));
  assert.ok(production.contact.includes('data-netlify="true"'));
  assert.ok(production.privacy.includes("Netlify Forms"));
  console.log("PASS: explicitly configured production form, sitemap, and indexing.");
} finally {
  await build();
  console.log("Restored the safe default build (no form, no indexing).");
}
