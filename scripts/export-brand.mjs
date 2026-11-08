// Mechanical web exports of the approved Sun Moth art, not a redrawn logo.
// Run from website/ after changing the approved art in concept-art/.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const source = new URL("../../concept-art/sun-moth-verdant-and-mono/", import.meta.url);
const output = new URL("../public/brand/", import.meta.url);
await mkdir(output, { recursive: true });
const path = name => new URL(name, output).pathname;
const logo = new URL("logo-verdant.png", source).pathname;
const { data: lockupData, info: lockupInfo } = await sharp(logo).extract({ left: 320, top: 100, width: 1145, height: 740 }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < lockupData.length; i += 4) {
  const r = lockupData[i], b = lockupData[i + 2], a = lockupData[i + 3];
  if (a < 32) { lockupData[i + 3] = 0; continue; }
  if (r - b > 45) { lockupData[i] = 218; lockupData[i + 1] = 168; lockupData[i + 2] = 86; }
  else { lockupData[i] = 242; lockupData[i + 1] = 237; lockupData[i + 2] = 226; }
  lockupData[i + 3] = Math.min(255, Math.round(((a - 32) / (230 - 32)) * 255));
}
const remattedLockup = await sharp(lockupData, { raw: lockupInfo }).png().toBuffer();
await sharp(remattedLockup).resize(688).webp({ quality: 95, alphaQuality: 100 }).toFile(path("lockup-verdant.webp"));
// This crop stops above the lettering and masks the top of the "l" ascender while retaining the complete moth silhouette.
const clearAscender = await sharp({ create: { width: 460, height: 25, channels: 4, background: { r: 10, g: 9, b: 8, alpha: 1 } } }).png().toBuffer();
const mark = await sharp(remattedLockup).extract({ left: 25, top: 0, width: 1085, height: 405 }).flatten({ background: "#0a0908" }).composite([{ input: clearAscender, left: 0, top: 380 }]).png().toBuffer();
await sharp(mark).resize(256, 256, { fit: "contain", background: "#0a0908" }).png().toFile(path("icon.png"));
await sharp(mark).resize(180, 180, { fit: "contain", background: "#0a0908" }).png().toFile(path("apple-touch-icon.png"));
await sharp(remattedLockup).resize(1200, 630, { fit: "contain", background: "#0a0908" }).flatten({ background: "#0a0908" }).png().toFile(path("social.png"));
console.log("Exported approved Sun Moth branding to public/brand/.");
