// Solivant Studios Private HQ Worker (hq.solivantstudios.com).
// Enforces Email + PBKDF2 Password + RFC 6238 TOTP 2FA, HttpOnly session cookies, CSRF tokens, and strict CSP.

import {
  deriveCsrfToken,
  signToken,
  timingSafeEqualStrings,
  toBase64Url,
  verifyPassword,
  verifyToken,
  verifyTotpCode,
} from "./crypto.mjs";
import { fetchGa4Metrics } from "./connectors/ga4.mjs";
import { fetchSteamMetrics } from "./connectors/steam.mjs";
import { fetchAppleMetrics } from "./connectors/apple.mjs";
import { fetchInboxMessageDetail, fetchInboxSummary, sendApprovedReply } from "./connectors/gmail.mjs";
import { askStudioAnalyst, draftInboxReply, generateExecutiveBrief } from "./connectors/gemini.mjs";
import { HQ_CSS, HQ_JS, renderDashboardPage, renderLoginPage } from "./ui.mjs";

const SESSION_TTL_SEC = 12 * 3600;
const PRE_AUTH_TTL_SEC = 180;
const RATE_WINDOW_MS = 10 * 60_000;
const MAX_AUTH_FAILURES = 5;

const rateBuckets = new Map();
const usedTotpSteps = new Map();
let snapshotCache = { data: null, expiresAtMs: 0 };

function securityHeaders(contentType) {
  return {
    "content-type": contentType,
    "cache-control": "no-store, max-age=0",
    "x-robots-tag": "noindex, nofollow, noarchive",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "no-referrer",
    "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "strict-transport-security": "max-age=63072000; includeSubDomains; preload",
    "content-security-policy":
      "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self' https://solivantstudios.com; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
  };
}

function jsonResponse(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...securityHeaders("application/json; charset=utf-8"),
      ...extraHeaders,
    },
  });
}

function isAuthConfigured(env) {
  return Boolean(
    String(env.HQ_ADMIN_EMAIL || "").trim() &&
      String(env.HQ_PASSWORD_HASH || "").trim() &&
      String(env.HQ_TOTP_SECRET || "").trim() &&
      String(env.HQ_SESSION_SECRET || "").trim().length >= 32,
  );
}

function cookieNameFor(url) {
  const isHttps = url.protocol === "https:";
  return isHttps ? "__Host-solivant_hq" : "solivant_hq";
}

function buildSessionCookie(url, value, maxAgeSec) {
  const name = cookieNameFor(url);
  const parts = [`${name}=${value}`, "Path=/", "HttpOnly", "SameSite=Strict", `Max-Age=${maxAgeSec}`];
  if (url.protocol === "https:") parts.push("Secure");
  return parts.join("; ");
}

function parseCookies(cookieHeader) {
  const out = {};
  for (const pair of String(cookieHeader || "").split(";")) {
    const idx = pair.indexOf("=");
    if (idx <= 0) continue;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    out[key] = val;
  }
  return out;
}

function clientKey(request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateBuckets.get(ip);
  if (!entry || entry.resetAt <= now) return false;
  return entry.failures >= MAX_AUTH_FAILURES;
}

function recordAuthFailure(ip) {
  const now = Date.now();
  const entry = rateBuckets.get(ip);
  if (!entry || entry.resetAt <= now) {
    rateBuckets.set(ip, { failures: 1, resetAt: now + RATE_WINDOW_MS });
  } else {
    entry.failures += 1;
  }
}

function clearAuthFailures(ip) {
  rateBuckets.delete(ip);
}

function verifySameOrigin(request, url) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== url.origin) return false;
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") return false;
  return true;
}

async function getAuthenticatedSession(request, url, env) {
  if (!isAuthConfigured(env)) return null;
  const cookies = parseCookies(request.headers.get("cookie"));
  const raw = cookies[cookieNameFor(url)];
  if (!raw) return null;
  return verifyToken(raw, env.HQ_SESSION_SECRET, "session");
}

async function getLiveSnapshot(env, forceFresh = false) {
  const now = Date.now();
  if (!forceFresh && snapshotCache.data && snapshotCache.expiresAtMs > now) {
    return snapshotCache.data;
  }
  const [ga4, steam, apple, inbox] = await Promise.all([
    fetchGa4Metrics(env),
    fetchSteamMetrics(env),
    fetchAppleMetrics(env),
    fetchInboxSummary(env),
  ]);
  const snapshot = {
    generatedAt: new Date(now).toISOString(),
    ga4,
    steam,
    apple,
    inbox,
  };
  snapshotCache = { data: snapshot, expiresAtMs: now + 60_000 };
  return snapshot;
}

async function readJsonBody(request) {
  const text = await request.text();
  if (text.length > 64_000) throw new Error("Request payload too large.");
  return text ? JSON.parse(text) : {};
}

export default {
  async fetch(request, env = {}) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === "GET" && pathname === "/robots.txt") {
      return new Response("User-agent: *\nDisallow: /\n", {
        status: 200,
        headers: securityHeaders("text/plain; charset=utf-8"),
      });
    }

    if (request.method === "GET" && pathname === "/assets/hq.css") {
      return new Response(HQ_CSS, {
        status: 200,
        headers: securityHeaders("text/css; charset=utf-8"),
      });
    }

    if (request.method === "GET" && pathname === "/assets/hq.js") {
      return new Response(HQ_JS, {
        status: 200,
        headers: securityHeaders("application/javascript; charset=utf-8"),
      });
    }

    if (request.method === "GET" && pathname === "/") {
      const session = await getAuthenticatedSession(request, url, env);
      if (!session) {
        return new Response(renderLoginPage({ configured: isAuthConfigured(env) }), {
          status: 200,
          headers: securityHeaders("text/html; charset=utf-8"),
        });
      }
      const csrfToken = await deriveCsrfToken(session.sid, env.HQ_SESSION_SECRET);
      return new Response(renderDashboardPage({ adminEmail: session.sub, csrfToken }), {
        status: 200,
        headers: securityHeaders("text/html; charset=utf-8"),
      });
    }

    // --- Unauthenticated Auth Endpoints ---
    if (request.method === "POST" && pathname === "/api/auth/login") {
      if (!verifySameOrigin(request, url)) {
        return jsonResponse({ error: "Cross-origin authentication requests are forbidden." }, 403);
      }
      if (!isAuthConfigured(env)) {
        return jsonResponse({ error: "Studio HQ credentials are not configured yet." }, 503);
      }
      const ip = clientKey(request);
      if (isRateLimited(ip)) {
        return jsonResponse({ error: "Too many failed sign-in attempts. Please wait 10 minutes." }, 429);
      }
      let body;
      try {
        body = await readJsonBody(request);
      } catch {
        return jsonResponse({ error: "Invalid request payload." }, 400);
      }
      const submittedEmail = String(body.email || "").trim().toLowerCase();
      const expectedEmail = String(env.HQ_ADMIN_EMAIL || "").trim().toLowerCase();
      const emailOk = timingSafeEqualStrings(submittedEmail, expectedEmail);
      const passwordOk = await verifyPassword(String(body.password || ""), env.HQ_PASSWORD_HASH);

      if (!emailOk || !passwordOk) {
        recordAuthFailure(ip);
        return jsonResponse({ error: "Invalid email or password." }, 401);
      }

      const nowSec = Math.floor(Date.now() / 1000);
      const preAuthToken = await signToken(
        {
          purpose: "pre_auth",
          sub: expectedEmail,
          nonce: toBase64Url(crypto.getRandomValues(new Uint8Array(12))),
          iat: nowSec,
          exp: nowSec + PRE_AUTH_TTL_SEC,
        },
        env.HQ_SESSION_SECRET,
      );
      return jsonResponse({ step: "totp_required", preAuthToken });
    }

    if (request.method === "POST" && pathname === "/api/auth/verify-2fa") {
      if (!verifySameOrigin(request, url)) {
        return jsonResponse({ error: "Cross-origin authentication requests are forbidden." }, 403);
      }
      if (!isAuthConfigured(env)) {
        return jsonResponse({ error: "Studio HQ credentials are not configured yet." }, 503);
      }
      const ip = clientKey(request);
      if (isRateLimited(ip)) {
        return jsonResponse({ error: "Too many failed verification attempts. Please wait 10 minutes." }, 429);
      }
      let body;
      try {
        body = await readJsonBody(request);
      } catch {
        return jsonResponse({ error: "Invalid request payload." }, 400);
      }

      const challenge = await verifyToken(String(body.preAuthToken || ""), env.HQ_SESSION_SECRET, "pre_auth");
      if (!challenge) {
        recordAuthFailure(ip);
        return jsonResponse({ error: "Your sign-in step expired. Please enter your password again." }, 401);
      }

      const totpResult = await verifyTotpCode(env.HQ_TOTP_SECRET, body.code);
      if (!totpResult.valid || totpResult.step === null) {
        recordAuthFailure(ip);
        return jsonResponse({ error: "Invalid 6-digit authenticator code." }, 401);
      }

      const lastUsedStep = usedTotpSteps.get(challenge.sub) || 0;
      if (totpResult.step <= lastUsedStep) {
        recordAuthFailure(ip);
        return jsonResponse({ error: "That 6-digit code was already used. Wait for the next code." }, 401);
      }
      usedTotpSteps.set(challenge.sub, totpResult.step);
      clearAuthFailures(ip);

      const nowSec = Math.floor(Date.now() / 1000);
      const sessionId = toBase64Url(crypto.getRandomValues(new Uint8Array(18)));
      const sessionToken = await signToken(
        {
          purpose: "session",
          sub: challenge.sub,
          sid: sessionId,
          iat: nowSec,
          exp: nowSec + SESSION_TTL_SEC,
        },
        env.HQ_SESSION_SECRET,
      );

      return jsonResponse(
        { authenticated: true },
        200,
        { "set-cookie": buildSessionCookie(url, sessionToken, SESSION_TTL_SEC) },
      );
    }

    if (request.method === "POST" && pathname === "/api/auth/logout") {
      if (!verifySameOrigin(request, url)) {
        return jsonResponse({ error: "Forbidden." }, 403);
      }
      return jsonResponse(
        { authenticated: false },
        200,
        { "set-cookie": buildSessionCookie(url, "", 0) },
      );
    }

    // --- Authenticated API Endpoints ---
    if (pathname.startsWith("/api/")) {
      const session = await getAuthenticatedSession(request, url, env);
      if (!session) {
        return jsonResponse({ error: "Authentication required." }, 401);
      }
      if (request.method === "POST") {
        if (!verifySameOrigin(request, url)) {
          return jsonResponse({ error: "Invalid request origin." }, 403);
        }
        const expectedCsrf = await deriveCsrfToken(session.sid, env.HQ_SESSION_SECRET);
        const submittedCsrf = request.headers.get("x-csrf-token") || "";
        if (!timingSafeEqualStrings(submittedCsrf, expectedCsrf)) {
          return jsonResponse({ error: "Invalid CSRF token." }, 403);
        }
      }

      try {
        if (request.method === "GET" && pathname === "/api/overview") {
          const fresh = url.searchParams.get("fresh") === "1";
          const snapshot = await getLiveSnapshot(env, fresh);
          return jsonResponse(snapshot);
        }

        if (request.method === "POST" && pathname === "/api/gemini/brief") {
          const fresh = url.searchParams.get("fresh") === "1";
          const snapshot = await getLiveSnapshot(env, fresh);
          const brief = await generateExecutiveBrief(env, snapshot);
          return jsonResponse(brief);
        }

        if (request.method === "POST" && pathname === "/api/gemini/chat") {
          const body = await readJsonBody(request);
          const snapshot = await getLiveSnapshot(env, false);
          const reply = await askStudioAnalyst(env, {
            history: body.history,
            question: body.question,
            snapshot,
          });
          return jsonResponse(reply);
        }

        if (request.method === "GET" && pathname === "/api/inbox/message") {
          const id = url.searchParams.get("id") || "";
          const message = await fetchInboxMessageDetail(env, id);
          return jsonResponse(message);
        }

        if (request.method === "POST" && pathname === "/api/gemini/draft-reply") {
          const body = await readJsonBody(request);
          const message = await fetchInboxMessageDetail(env, body.messageId);
          const draft = await draftInboxReply(env, { message, guidance: body.guidance });
          return jsonResponse(draft);
        }

        if (request.method === "POST" && pathname === "/api/inbox/send") {
          const body = await readJsonBody(request);
          const result = await sendApprovedReply(env, {
            messageId: body.messageId,
            bodyText: body.bodyText,
          });
          snapshotCache.expiresAtMs = 0;
          return jsonResponse(result);
        }
      } catch (error) {
        return jsonResponse(
          { error: error instanceof Error ? error.message : "Unexpected HQ error." },
          400,
        );
      }
    }

    return jsonResponse({ error: "Not found." }, 404);
  },
};
