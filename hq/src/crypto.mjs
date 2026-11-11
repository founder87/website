// Zero-dependency Web Crypto utilities compatible with Cloudflare Workers and Node 22+.

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function toBase64Url(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < u8.length; i++) binary += String.fromCharCode(u8[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function fromBase64Url(str) {
  const normalized = String(str).replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

export function timingSafeEqualBytes(a, b) {
  if (!(a instanceof Uint8Array) || !(b instanceof Uint8Array)) return false;
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  return diff === 0;
}

export function timingSafeEqualStrings(a, b) {
  return timingSafeEqualBytes(encoder.encode(String(a)), encoder.encode(String(b)));
}

export async function hashPassword(password, iterations = 210_000) {
  if (typeof password !== "string" || password.length < 12) {
    throw new Error("Password must be at least 12 characters.");
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    keyMaterial,
    256,
  );
  return `pbkdf2$sha256$${iterations}$${toBase64Url(salt)}$${toBase64Url(bits)}`;
}

export async function verifyPassword(password, storedHash) {
  if (typeof password !== "string" || typeof storedHash !== "string") return false;
  const parts = storedHash.split("$");
  if (parts.length !== 5 || parts[0] !== "pbkdf2" || parts[1] !== "sha256") return false;
  const iterations = Number(parts[2]);
  if (!Number.isInteger(iterations) || iterations < 100_000 || iterations > 1_000_000) return false;
  let salt;
  let expected;
  try {
    salt = fromBase64Url(parts[3]);
    expected = fromBase64Url(parts[4]);
  } catch {
    return false;
  }
  if (salt.length < 16 || expected.length !== 32) return false;
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const derived = new Uint8Array(
    await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, keyMaterial, 256),
  );
  return timingSafeEqualBytes(derived, expected);
}

export function encodeBase32(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bits = 0;
  let value = 0;
  let output = "";
  for (let i = 0; i < u8.length; i++) {
    value = (value << 8) | u8[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

export function decodeBase32(base32) {
  const cleaned = String(base32).toUpperCase().replace(/[\s=-]+/g, "");
  if (!cleaned || !/^[A-Z2-7]+$/.test(cleaned)) {
    throw new Error("Invalid Base32 TOTP secret.");
  }
  let bits = 0;
  let value = 0;
  const out = [];
  for (let i = 0; i < cleaned.length; i++) {
    value = (value << 5) | BASE32_ALPHABET.indexOf(cleaned[i]);
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

export function generateTotpSecret(byteLength = 20) {
  return encodeBase32(crypto.getRandomValues(new Uint8Array(byteLength)));
}

export function buildOtpAuthUri({ secret, accountName, issuer = "Solivant Studios" }) {
  const label = `${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}`;
  const params = new URLSearchParams({
    secret: secret.replace(/\s+/g, "").toUpperCase(),
    issuer,
    algorithm: "SHA1",
    digits: "6",
    period: "30",
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

export async function generateTotpCode(secretBase32, timestampMs = Date.now(), periodSec = 30, digits = 6) {
  const keyBytes = decodeBase32(secretBase32);
  const counter = Math.floor(timestampMs / 1000 / periodSec);
  const counterBytes = new Uint8Array(8);
  let remaining = counter;
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = remaining & 0xff;
    remaining = Math.floor(remaining / 256);
  }
  const hmacKey = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const digest = new Uint8Array(await crypto.subtle.sign("HMAC", hmacKey, counterBytes));
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  return String(binary % 10 ** digits).padStart(digits, "0");
}

export async function verifyTotpCode(secretBase32, code, timestampMs = Date.now(), windowSteps = 1) {
  const normalized = String(code ?? "").trim().replace(/\s+/g, "");
  if (!/^\d{6}$/.test(normalized)) return { valid: false, step: null };
  const periodMs = 30_000;
  let matchedStep = null;
  for (let offset = -windowSteps; offset <= windowSteps; offset++) {
    const candidateTime = timestampMs + offset * periodMs;
    const expected = await generateTotpCode(secretBase32, candidateTime);
    if (timingSafeEqualStrings(normalized, expected)) {
      matchedStep = Math.floor(candidateTime / periodMs);
    }
  }
  return { valid: matchedStep !== null, step: matchedStep };
}

async function importHmacKey(secret) {
  if (typeof secret !== "string" || secret.length < 32) {
    throw new Error("HQ_SESSION_SECRET must be at least 32 characters.");
  }
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

export async function signToken(payload, secret) {
  const key = await importHmacKey(secret);
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(body)));
  return `${body}.${toBase64Url(sig)}`;
}

export async function verifyToken(token, secret, expectedPurpose) {
  if (typeof token !== "string") return null;
  const dot = token.indexOf(".");
  if (dot <= 0 || dot !== token.lastIndexOf(".")) return null;
  const body = token.slice(0, dot);
  let actualSig;
  try {
    actualSig = fromBase64Url(token.slice(dot + 1));
  } catch {
    return null;
  }
  const key = await importHmacKey(secret);
  const expectedSig = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(body)));
  if (!timingSafeEqualBytes(actualSig, expectedSig)) return null;
  let payload;
  try {
    payload = JSON.parse(decoder.decode(fromBase64Url(body)));
  } catch {
    return null;
  }
  const nowSec = Math.floor(Date.now() / 1000);
  if (!payload || typeof payload !== "object") return null;
  if (expectedPurpose && payload.purpose !== expectedPurpose) return null;
  if (typeof payload.exp !== "number" || payload.exp <= nowSec) return null;
  return payload;
}

export async function deriveCsrfToken(sessionId, secret) {
  const key = await importHmacKey(secret);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(`csrf:${sessionId}`)));
  return toBase64Url(sig.slice(0, 24));
}

function pemToDer(pem) {
  const cleaned = String(pem)
    .replace(/\\n/g, "\n")
    .replace(/-----BEGIN [^-]+-----/g, "")
    .replace(/-----END [^-]+-----/g, "")
    .replace(/\s+/g, "");
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export async function signJwtRS256(claims, privateKeyPem) {
  const header = toBase64Url(encoder.encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const payload = toBase64Url(encoder.encode(JSON.stringify(claims)));
  const signingInput = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToDer(privateKeyPem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, encoder.encode(signingInput));
  return `${signingInput}.${toBase64Url(signature)}`;
}

export async function signJwtES256(claims, privateKeyPem, keyId) {
  const header = toBase64Url(encoder.encode(JSON.stringify({ alg: "ES256", kid: keyId, typ: "JWT" })));
  const payload = toBase64Url(encoder.encode(JSON.stringify(claims)));
  const signingInput = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToDer(privateKeyPem),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
  // Web Crypto ECDSA sign produces IEEE P1363 64-byte (r || s), matching RFC 7518 JWS ES256.
  const signature = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, encoder.encode(signingInput));
  return `${signingInput}.${toBase64Url(signature)}`;
}
