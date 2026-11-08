// Mechanical web exports of the approved Sun Moth art, not a redrawn logo.
// Run from website/ after changing the approved art in concept-art/.
import sharp from "sharp";
import { mkdir, copyFile } from "node:fs/promises";

const source = new URL("../../concept-art/sun-moth-verdant-and-mono/", import.meta.url);
const output = new URL("../public/brand/", import.meta.url);
await mkdir(output, { recursive: true });
const path = name => new URL(name, output).pathname;
const logo = new URL("logo-verdant.png", source).pathname;
const { data: lockupData, info: lockupInfo } = await sharp(logo).extract({ left: 320, top: 100, width: 1145, height: 740 }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < lockupData.length; i += 4) {
  const r = lockupData[i], b = lockupData[i + 2], a = lockupData[i + 3];
  if (a < 32) { lockupData[i + 3] = 0; continue; }
  if (r - b > 45) { lockupData[i] = 209; lockupData[i + 1] = 164; lockupData[i + 2] = 95; }
  else { lockupData[i] = 207; lockupData[i + 1] = 223; lockupData[i + 2] = 194; }
  lockupData[i + 3] = Math.min(255, Math.round(((a - 32) / (230 - 32)) * 255));
}
await sharp(lockupData, { raw: lockupInfo }).resize(688).webp({ quality: 95, alphaQuality: 100 }).toFile(path("lockup-verdant.webp"));
// This crop stops above the lettering and masks the top of the "l" ascender while retaining the complete moth silhouette.
const clearAscender = await sharp({ create: { width: 460, height: 25, channels: 4, background: { r: 20, g: 43, b: 38, alpha: 1 } } }).png().toBuffer();
const mark = await sharp(logo).extract({ left: 345, top: 100, width: 1085, height: 405 }).flatten({ background: "#142b26" }).composite([{ input: clearAscender, left: 0, top: 380 }]).png().toBuffer();
await sharp(mark).resize(256, 256, { fit: "contain", background: "#142b26" }).png().toFile(path("icon.png"));
await sharp(mark).resize(180, 180, { fit: "contain", background: "#142b26" }).png().toFile(path("apple-touch-icon.png"));
for (const [directory, suffix] of [["verdant", "verdant"], ["white-on-black", "mono"]]) {
  await sharp(new URL(directory + "/motion-poster.png", source).pathname).resize(1200, 675).webp({ quality: 92 }).toFile(path("poster-" + suffix + ".webp"));
  await copyFile(new URL(directory + "/sunrise.gif", source), path("sunrise-" + suffix + ".gif"));
}
await sharp(new URL("verdant/motion-poster.png", source).pathname).resize(1200, 630, { fit: "contain", background: "#142b26" }).png().toFile(path("social.png"));
console.log("Exported approved Sun Moth branding to public/brand/.");
