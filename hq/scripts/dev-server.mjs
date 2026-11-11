// Local Node 22+ preview server for Solivant Studios HQ (`npm run hq:dev`).
// Serves a browser-based first-time password + 2FA onboarding wizard on 127.0.0.1 when hq/.dev.vars is not set up yet.
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  buildOtpAuthUri,
  generateTotpSecret,
  hashPassword,
  signToken,
  timingSafeEqualStrings,
  toBase64Url,
  verifyTotpCode,
} from "../src/crypto.mjs";
import { renderLocalOnboardingPage } from "../src/ui.mjs";
import worker from "../src/worker.mjs";

const devVarsPath = resolve("hq/.dev.vars");
let pendingLocalSetup = null;

async function loadDotDevVars() {
  const vars = {};
  try {
    const raw = await readFile(devVarsPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      vars[key] = val;
    }
  } catch {
    // hq/.dev.vars is optional until onboarding completes.
  }
  return { ...vars, ...process.env };
}

function isConfigured(env) {
  return Boolean(
    String(env.HQ_ADMIN_EMAIL || "").trim() &&
      String(env.HQ_PASSWORD_HASH || "").trim() &&
      String(env.HQ_TOTP_SECRET || "").trim() &&
      String(env.HQ_SESSION_SECRET || "").trim().length >= 32,
  );
}

function sendJson(res, status, payload, extraHeaders = {}) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...extraHeaders,
  });
  res.end(JSON.stringify(payload));
}

const port = Number(process.env.HQ_PORT || 8788);

const server = createServer(async (req, res) => {
  try {
    const env = await loadDotDevVars();
    const expectedOrigin = `http://${req.headers.host || `127.0.0.1:${port}`}`;
    const url = new URL(req.url || "/", expectedOrigin);

    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const bodyBuffer = Buffer.concat(chunks);

    // Local 127.0.0.1 first-time browser setup wizard (permanently disabled once credentials exist)
    if (!isConfigured(env)) {
      if (req.method === "GET" && url.pathname === "/") {
        const html = renderLocalOnboardingPage();
        res.writeHead(200, {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
          "content-security-policy":
            "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self' https://solivantstudios.com; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
        });
        res.end(html);
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/local-setup/init") {
        if (req.headers.origin !== expectedOrigin) {
          sendJson(res, 403, { error: "Forbidden origin." });
          return;
        }
        const body = JSON.parse(bodyBuffer.toString("utf8") || "{}");
        const email = String(body.email || "").trim().toLowerCase();
        const password = String(body.password || "");
        if (!email || !email.includes("@")) {
          sendJson(res, 400, { error: "Enter a valid studio email address." });
          return;
        }
        const passwordHash = await hashPassword(password);
        const totpSecret = generateTotpSecret(20);
        const sessionSecret = toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
        const setupToken = toBase64Url(crypto.getRandomValues(new Uint8Array(24)));
        const otpauthUri = buildOtpAuthUri({ secret: totpSecret, accountName: email });
        const formattedSecret = totpSecret.match(/.{1,4}/g).join(" ");

        pendingLocalSetup = {
          setupToken,
          email,
          passwordHash,
          totpSecret,
          sessionSecret,
          expiresAt: Date.now() + 10 * 60_000,
        };

        sendJson(res, 200, { setupToken, otpauthUri, formattedSecret });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/local-setup/complete") {
        if (req.headers.origin !== expectedOrigin) {
          sendJson(res, 403, { error: "Forbidden origin." });
          return;
        }
        const body = JSON.parse(bodyBuffer.toString("utf8") || "{}");
        if (
          !pendingLocalSetup ||
          pendingLocalSetup.expiresAt <= Date.now() ||
          !timingSafeEqualStrings(String(body.setupToken || ""), pendingLocalSetup.setupToken)
        ) {
          sendJson(res, 400, { error: "Setup session expired. Refresh the page and try again." });
          return;
        }

        const check = await verifyTotpCode(pendingLocalSetup.totpSecret, body.code);
        if (!check.valid) {
          sendJson(res, 401, { error: "That 6-digit code did not match yet. Make sure you entered the live code from Passwords or your Authenticator app." });
          return;
        }

        const lines = [
          `HQ_ADMIN_EMAIL="${pendingLocalSetup.email}"`,
          `HQ_PASSWORD_HASH="${pendingLocalSetup.passwordHash}"`,
          `HQ_TOTP_SECRET="${pendingLocalSetup.totpSecret}"`,
          `HQ_SESSION_SECRET="${pendingLocalSetup.sessionSecret}"`,
          "",
        ].join("\n");
        await writeFile(devVarsPath, lines, { mode: 0o600 });

        const nowSec = Math.floor(Date.now() / 1000);
        const sessionId = toBase64Url(crypto.getRandomValues(new Uint8Array(18)));
        const sessionToken = await signToken(
          {
            purpose: "session",
            sub: pendingLocalSetup.email,
            sid: sessionId,
            iat: nowSec,
            exp: nowSec + 12 * 3600,
          },
          pendingLocalSetup.sessionSecret,
        );
        pendingLocalSetup = null;

        sendJson(
          res,
          200,
          { authenticated: true },
          { "set-cookie": `solivant_hq=${sessionToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=43200` },
        );
        return;
      }
    }

    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      if (Array.isArray(v)) headers.set(k, v.join(", "));
      else if (typeof v === "string") headers.set(k, v);
    }

    const request = new Request(url.href, {
      method: req.method || "GET",
      headers,
      body: ["GET", "HEAD"].includes(req.method || "GET") ? undefined : bodyBuffer,
    });

    const response = await worker.fetch(request, env);
    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    const arrayBuf = await response.arrayBuffer();
    res.end(Buffer.from(arrayBuf));
  } catch (err) {
    sendJson(res, 500, { error: err instanceof Error ? err.message : "Server error" });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Solivant Studios HQ running locally at http://127.0.0.1:${port}`);
});
