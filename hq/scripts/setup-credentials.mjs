// Interactive local credential generator for Solivant Studios HQ (never commits secrets).
import { createInterface } from "node:readline/promises";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { stdin, stdout } from "node:process";
import {
  buildOtpAuthUri,
  generateTotpCode,
  generateTotpSecret,
  hashPassword,
  toBase64Url,
} from "../src/crypto.mjs";

const rl = createInterface({ input: stdin, output: stdout });
try {
  console.log("\n=== Solivant Studios HQ · 2FA & Credential Setup ===");
  console.log("(Press Return to accept contact@solivantstudios.com, or type a different email and press Return.)\n");
  const emailInput = (await rl.question("Admin email [contact@solivantstudios.com]: ")).trim();
  const adminEmail = emailInput || "contact@solivantstudios.com";

  const password = await rl.question("Choose a new HQ password (at least 12 characters, then press Return): ");
  const passwordHash = await hashPassword(password);
  const totpSecret = generateTotpSecret(20);
  const sessionSecret = toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  const otpauthUri = buildOtpAuthUri({ secret: totpSecret, accountName: adminEmail });
  const sampleCode = await generateTotpCode(totpSecret);

  // Preserve any existing API keys in hq/.dev.vars while updating HQ_* auth credentials.
  const devVarsPath = resolve("hq/.dev.vars");
  let preservedLines = [];
  try {
    const existing = await readFile(devVarsPath, "utf8");
    preservedLines = existing
      .split(/\r?\n/)
      .filter(line => line.trim() && !/^HQ_(?:ADMIN_EMAIL|PASSWORD_HASH|TOTP_SECRET|SESSION_SECRET)=/.test(line.trim()));
  } catch {
    // No existing hq/.dev.vars yet.
  }

  const nextDevVars = [
    `HQ_ADMIN_EMAIL="${adminEmail}"`,
    `HQ_PASSWORD_HASH="${passwordHash}"`,
    `HQ_TOTP_SECRET="${totpSecret}"`,
    `HQ_SESSION_SECRET="${sessionSecret}"`,
    ...preservedLines,
    "",
  ].join("\n");
  await writeFile(devVarsPath, nextDevVars, { mode: 0o600 });

  console.log("\n✓ Saved local credentials automatically to hq/.dev.vars (gitignored).");
  console.log("\n1. Add this 2FA Setup Key to Apple Passwords, 1Password, or Google Authenticator:");
  console.log("   Account:   " + adminEmail);
  console.log("   Setup Key: " + totpSecret);
  console.log("   URI:       " + otpauthUri);
  console.log("   (Current 6-digit code right now: " + sampleCode + ")");
  console.log("\n2. Open http://127.0.0.1:8788 in your browser (refresh if already open) and sign in!\n");
} finally {
  rl.close();
}
