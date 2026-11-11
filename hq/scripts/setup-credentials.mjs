// Interactive local credential generator for Solivant Studios HQ (never commits secrets).
import { createInterface } from "node:readline/promises";
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
  console.log("\n=== Solivant Studios HQ · 2FA & Credential Generator ===\n");
  const emailInput = (await rl.question("Admin email [contact@solivantstudios.com]: ")).trim();
  const adminEmail = emailInput || "contact@solivantstudios.com";

  const password = await rl.question("Choose an HQ password (min 12 chars): ");
  const passwordHash = await hashPassword(password);
  const totpSecret = generateTotpSecret(20);
  const sessionSecret = toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  const otpauthUri = buildOtpAuthUri({ secret: totpSecret, accountName: adminEmail });
  const sampleCode = await generateTotpCode(totpSecret);

  console.log("\n1. Add this 2FA setup key to Apple Passwords, 1Password, or Google Authenticator:");
  console.log("   Account:   " + adminEmail);
  console.log("   Setup Key: " + totpSecret);
  console.log("   URI:       " + otpauthUri);
  console.log("   (Current 6-digit verification check: " + sampleCode + ")");

  console.log("\n2. For local preview (`npm run hq:dev`), save these in `hq/.dev.vars` (gitignored):");
  console.log(`HQ_ADMIN_EMAIL="${adminEmail}"`);
  console.log(`HQ_PASSWORD_HASH="${passwordHash}"`);
  console.log(`HQ_TOTP_SECRET="${totpSecret}"`);
  console.log(`HQ_SESSION_SECRET="${sessionSecret}"`);

  console.log("\n3. For Cloudflare production (`hq.solivantstudios.com`), upload each as an encrypted secret:");
  console.log("   npx wrangler secret put HQ_ADMIN_EMAIL --config hq/wrangler.toml");
  console.log("   npx wrangler secret put HQ_PASSWORD_HASH --config hq/wrangler.toml");
  console.log("   npx wrangler secret put HQ_TOTP_SECRET --config hq/wrangler.toml");
  console.log("   npx wrangler secret put HQ_SESSION_SECRET --config hq/wrangler.toml\n");
} finally {
  rl.close();
}
