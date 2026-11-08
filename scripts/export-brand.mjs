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
const clearAscender = await sharp({ create: { width: 460, height: 25, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } } }).png().toBuffer();
const mark = await sharp(remattedLockup).extract({ left: 25, top: 0, width: 1085, height: 405 }).flatten({ background: "#000000" }).composite([{ input: clearAscender, left: 0, top: 380 }]).png().toBuffer();
await sharp(mark).resize(256, 256, { fit: "contain", background: "#000000" }).png().toFile(path("icon.png"));
await sharp(mark).resize(256, 256, { fit: "contain", background: "#000000" }).png().toFile(path("favicon-gold.png"));
await sharp(mark).resize(512, 512, { fit: "contain", background: "#000000" }).png().toFile(path("icon-512.png"));
await sharp(mark).resize(180, 180, { fit: "contain", background: "#000000" }).png().toFile(path("apple-touch-icon.png"));
await sharp(remattedLockup).resize(1200, 630, { fit: "contain", background: "#0a0908" }).flatten({ background: "#0a0908" }).png().toFile(path("social.png"));

const byzantiumCardSvg = Buffer.from(`
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="50%" cy="48%" r="55%">
      <stop offset="0%" stop-color="#d8a650" stop-opacity="0.26"/>
      <stop offset="55%" stop-color="#804016" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#0a0705" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0a0705"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="44" y="44" width="1112" height="542" fill="none" stroke="#d8a650" stroke-opacity="0.32" stroke-width="1.5"/>
  <g transform="translate(600, 315)" stroke="#d8a650" fill="none">
    <circle r="220" stroke-opacity="0.14" stroke-width="1"/>
    <circle r="165" stroke-opacity="0.22" stroke-width="1.2"/>
    <circle r="105" stroke-opacity="0.32" stroke-width="1.2"/>
    <rect x="-116" y="-116" width="232" height="232" stroke-opacity="0.16" stroke-width="1"/>
    <rect x="-116" y="-116" width="232" height="232" transform="rotate(45)" stroke-opacity="0.16" stroke-width="1"/>
    <line x1="-460" y1="0" x2="460" y2="0" stroke-opacity="0.22" stroke-width="1"/>
    <line x1="0" y1="-235" x2="0" y2="235" stroke-opacity="0.14" stroke-width="1"/>
  </g>
  <text x="96" y="108" fill="#d8a650" font-family="monospace" font-size="16" letter-spacing="4">ANNO DOMINI 1000 · CONSTANTINOPLE</text>
  <text x="1104" y="108" fill="#f0d5a3" font-family="monospace" font-size="16" letter-spacing="4" text-anchor="end">IN DEVELOPMENT</text>
  <line x1="96" y1="132" x2="1104" y2="132" stroke="#f0d5a3" stroke-opacity="0.18" stroke-width="1"/>
  <text x="600" y="352" fill="#f0d5a3" font-family="Georgia, 'Times New Roman', serif" font-size="112" letter-spacing="6" text-anchor="middle">BYZANTIUM</text>
  <line x1="96" y1="498" x2="1104" y2="498" stroke="#f0d5a3" stroke-opacity="0.18" stroke-width="1"/>
  <text x="96" y="534" fill="#a69e92" font-family="monospace" font-size="15" letter-spacing="4">SOLIVANT STUDIOS</text>
  <text x="1104" y="534" fill="#d8a650" font-family="monospace" font-size="15" letter-spacing="4" text-anchor="end">INITIAL RELEASE</text>
</svg>
`);
await sharp(byzantiumCardSvg).png().toFile(path("social-byzantium.png"));
console.log("Exported approved Sun Moth branding to public/brand/.");
