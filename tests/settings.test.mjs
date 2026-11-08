import test from "node:test";
import assert from "node:assert/strict";
import { readSettings } from "../src/config/settings.mjs";

test("safe defaults: canonical domain, no indexing, no form, no guessed inbox", () => {
  const settings = readSettings();
  assert.equal(settings.origin, "https://solivantstudios.com");
  assert.equal(settings.indexable, false);
  assert.equal(settings.contactEnabled, false);
  assert.equal(settings.contactEmail, "");
  assert.equal(settings.gaMeasurementId, "");
});
test("production indexing is opt-in and deploy previews remain noindex", () => {
  assert.equal(readSettings({ SITE_INDEXABLE: "true" }).indexable, true);
  assert.equal(readSettings({ GA_MEASUREMENT_ID: "G-TEST123456" }).gaMeasurementId, "G-TEST123456");
  for (const CONTEXT of ["deploy-preview", "branch-deploy", "dev"]) {
    assert.equal(readSettings({ SITE_INDEXABLE: "true", CONTEXT }).indexable, false);
    assert.equal(readSettings({ GA_MEASUREMENT_ID: "G-TEST123456", CONTEXT }).gaMeasurementId, "");
  }
});
test("reject ambiguous/insecure canonical origins", () => {
  for (const SITE_URL of ["bad", "http://example.com", "https://user:pass@example.com", "https://example.com/path", "https://example.com/?x=1", "https://example.com/#x"]) {
    assert.throws(() => readSettings({ SITE_URL }));
  }
});
test("fail closed on invalid configuration and address/header injection", () => {
  for (const CONTACT_EMAIL of ["not an email", "mailto:a@example.com", "a@example.com\r\nBcc: b@example.com", "a@example.com?subject=test"]) {
    assert.throws(() => readSettings({ CONTACT_EMAIL }));
  }
  assert.equal(readSettings({ CONTACT_EMAIL: "studio+web@example.com" }).contactEmail, "studio+web@example.com");
  assert.throws(() => readSettings({ CONTACT_PROVIDER: "other" }));
  assert.throws(() => readSettings({ SITE_INDEXABLE: "yes" }));
  assert.throws(() => readSettings({ CONTACT_PRIVACY_REVIEWED: "yes" }));
  for (const GA_MEASUREMENT_ID of ["UA-12345-1", "G-bad", "G-123\"onload=alert(1)", "https://example.com"]) {
    assert.throws(() => readSettings({ GA_MEASUREMENT_ID }));
  }
});
test("form requires Netlify production and explicit privacy review", () => {
  assert.equal(readSettings({ CONTACT_PROVIDER: "netlify" }).contactEnabled, false);
  assert.equal(readSettings({ CONTACT_PROVIDER: "netlify", NETLIFY: "true", CONTEXT: "deploy-preview" }).contactEnabled, false);
  const production = { CONTACT_PROVIDER: "netlify", NETLIFY: "true", CONTEXT: "production" };
  assert.throws(() => readSettings(production), /Review/);
  assert.equal(readSettings({ ...production, CONTACT_PRIVACY_REVIEWED: "true" }).contactEnabled, true);
});
