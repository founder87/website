import test from "node:test";
import assert from "node:assert/strict";
import {
  deriveCsrfToken,
  generateTotpCode,
  generateTotpSecret,
  hashPassword,
  signJwtES256,
  signJwtRS256,
  toBase64Url,
  verifyPassword,
  verifyToken,
  verifyTotpCode,
} from "../hq/src/crypto.mjs";
import { parseAppleSummaryTsv } from "../hq/src/connectors/apple.mjs";
import { buildReplyMime } from "../hq/src/connectors/gmail.mjs";
import worker from "../hq/src/worker.mjs";

test("PBKDF2 password hashing and constant-time verification", async () => {
  const hash = await hashPassword("Solivant-Mundi-Sine-Fine-2026!");
  assert.equal(await verifyPassword("Solivant-Mundi-Sine-Fine-2026!", hash), true);
  assert.equal(await verifyPassword("Wrong-Password-Attempt-1234", hash), false);
  await assert.rejects(() => hashPassword("short"));
});

test("RFC 6238 TOTP generation and window verification", async () => {
  const secret = generateTotpSecret(20);
  const fixedNow = 1_760_000_000_000;
  const code = await generateTotpCode(secret, fixedNow);
  assert.match(code, /^\d{6}$/);
  const check = await verifyTotpCode(secret, code, fixedNow);
  assert.equal(check.valid, true);
  const wrong = await verifyTotpCode(secret, "000000" === code ? "111111" : "000000", fixedNow);
  assert.equal(wrong.valid, false);
});

test("RS256 (Google) and ES256 (Apple .p8) JWT signers produce valid 3-part JWS tokens", async () => {
  const rsaPair = await crypto.subtle.generateKey(
    { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["sign", "verify"],
  );
  const rsaPkcs8 = await crypto.subtle.exportKey("pkcs8", rsaPair.privateKey);
  const rsaPem = `-----BEGIN PRIVATE KEY-----\n${Buffer.from(rsaPkcs8).toString("base64")}\n-----END PRIVATE KEY-----`;
  const rsJwt = await signJwtRS256({ iss: "svc@example.iam.gserviceaccount.com", exp: 9999999999 }, rsaPem);
  assert.equal(rsJwt.split(".").length, 3);

  const ecPair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const ecPkcs8 = await crypto.subtle.exportKey("pkcs8", ecPair.privateKey);
  const ecPem = `-----BEGIN PRIVATE KEY-----\n${Buffer.from(ecPkcs8).toString("base64")}\n-----END PRIVATE KEY-----`;
  const esJwt = await signJwtES256({ iss: "issuer-id", aud: "appstoreconnect-v1", exp: 9999999999 }, ecPem, "KEY12345");
  const parts = esJwt.split(".");
  assert.equal(parts.length, 3);
  // ES256 signature must be raw 64-byte IEEE P1363 (86 base64url chars without padding)
  assert.equal(Buffer.from(parts[2], "base64url").length, 64);
});

test("Apple TSV parser and Gmail reply MIME builder sanitize and aggregate cleanly", () => {
  const sampleTsv = [
    "Provider\tProduct Type Identifier\tUnits\tDeveloper Proceeds\tCurrency of Proceeds",
    "APPLE\t1F\t10\t6.99\tUSD",
    "APPLE\t7F\t50\t0.00\tUSD",
    "APPLE\tIA1\t4\t2.10\tUSD",
  ].join("\n");
  const parsed = parseAppleSummaryTsv(sampleTsv);
  assert.equal(parsed.downloads, 14);
  assert.equal(parsed.paidUnits, 14);
  assert.equal(parsed.proceedsByCurrency.USD, 78.3);

  const rawMime = buildReplyMime({
    fromAddress: "contact@solivantstudios.com",
    toAddress: "press@example.com\r\nBcc: attacker@evil.test",
    subject: "Byzantium preview inquiry",
    bodyText: "Thank you for reaching out.\n\nSolivant Studios",
    inReplyTo: "<msg-1@example.com>",
    references: "<msg-1@example.com>",
  });
  const decoded = Buffer.from(rawMime, "base64url").toString("utf8");
  assert.ok(!decoded.includes("\r\nBcc:"), "Header injection must be stripped");
  assert.match(decoded, /From: Solivant Studios <contact@solivantstudios\.com>/);
});

test("HQ Worker enforces Email + Password + 2FA, replay defense, CSRF, and same-origin checks", async () => {
  const adminEmail = "contact@solivantstudios.com";
  const password = "Byzantium-Imperial-Guard-1000AD!";
  const passwordHash = await hashPassword(password, 100_000);
  const totpSecret = generateTotpSecret(20);
  const sessionSecret = toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  const env = {
    HQ_ADMIN_EMAIL: adminEmail,
    HQ_PASSWORD_HASH: passwordHash,
    HQ_TOTP_SECRET: totpSecret,
    HQ_SESSION_SECRET: sessionSecret,
  };
  const origin = "https://hq.solivantstudios.com";

  // 1. Unauthenticated /api/overview is blocked
  const unauthApi = await worker.fetch(new Request(`${origin}/api/overview`), env);
  assert.equal(unauthApi.status, 401);

  // 2. Cross-origin login attempt is blocked
  const crossOrigin = await worker.fetch(
    new Request(`${origin}/api/auth/login`, {
      method: "POST",
      headers: { origin: "https://evil.example", "content-type": "application/json" },
      body: JSON.stringify({ email: adminEmail, password }),
    }),
    env,
  );
  assert.equal(crossOrigin.status, 403);

  // 3. Step 1: Valid Email + Password returns short-lived preAuthToken (still cannot access /api/overview)
  const step1 = await worker.fetch(
    new Request(`${origin}/api/auth/login`, {
      method: "POST",
      headers: { origin, "content-type": "application/json" },
      body: JSON.stringify({ email: adminEmail, password }),
    }),
    env,
  );
  assert.equal(step1.status, 200);
  const { preAuthToken } = await step1.json();
  assert.ok(preAuthToken);

  // 4. Step 2: Valid 6-digit TOTP issues __Host-solivant_hq HttpOnly Secure SameSite=Strict cookie
  const validCode = await generateTotpCode(totpSecret);
  const step2 = await worker.fetch(
    new Request(`${origin}/api/auth/verify-2fa`, {
      method: "POST",
      headers: { origin, "content-type": "application/json" },
      body: JSON.stringify({ preAuthToken, code: validCode }),
    }),
    env,
  );
  assert.equal(step2.status, 200);
  const setCookie = step2.headers.get("set-cookie") || "";
  assert.match(setCookie, /^__Host-solivant_hq=[^;]+; Path=\/; HttpOnly; SameSite=Strict; Max-Age=43200; Secure$/);
  const cookiePair = setCookie.split(";")[0];

  // 5. Replaying the exact same 6-digit TOTP code in the same 30s step is rejected
  const replay = await worker.fetch(
    new Request(`${origin}/api/auth/verify-2fa`, {
      method: "POST",
      headers: { origin, "content-type": "application/json" },
      body: JSON.stringify({ preAuthToken, code: validCode }),
    }),
    env,
  );
  assert.equal(replay.status, 401);

  // 6. Authenticated GET /api/overview succeeds and reports clean Standby states before API keys are added
  const overviewRes = await worker.fetch(
    new Request(`${origin}/api/overview`, { headers: { cookie: cookiePair } }),
    env,
  );
  assert.equal(overviewRes.status, 200);
  const overview = await overviewRes.json();
  assert.equal(overview.ga4.connected, false);
  assert.equal(overview.steam.connected, false);
  assert.equal(overview.apple.connected, false);
  assert.equal(overview.inbox.connected, false);

  // 7. Mutating POST without valid CSRF token is rejected even with valid session cookie
  const missingCsrf = await worker.fetch(
    new Request(`${origin}/api/gemini/brief`, {
      method: "POST",
      headers: { origin, cookie: cookiePair, "content-type": "application/json" },
      body: "{}",
    }),
    env,
  );
  assert.equal(missingCsrf.status, 403);

  // 8. Mutating POST with derived CSRF token succeeds
  const rawToken = cookiePair.slice("__Host-solivant_hq=".length);
  const sessionPayload = await verifyToken(rawToken, sessionSecret, "session");
  const csrf = await deriveCsrfToken(sessionPayload.sid, sessionSecret);
  const briefRes = await worker.fetch(
    new Request(`${origin}/api/gemini/brief`, {
      method: "POST",
      headers: { origin, cookie: cookiePair, "x-csrf-token": csrf, "content-type": "application/json" },
      body: "{}",
    }),
    env,
  );
  assert.equal(briefRes.status, 200);
  const briefJson = await briefRes.json();
  assert.equal(briefJson.connected, false);
});
