// Mechanical web exports of the approved Sun Moth art, not a redrawn logo.
// Run from website/ after changing the approved art in concept-art/.
import sharp from "sharp";
import { mkdir, copyFile } from "node:fs/promises";

const source = new URL("../../concept-art/sun-moth-verdant-and-mono/", import.meta.url);
const output = new URL("../public/brand/", import.meta.url);
await mkdir(output, { recursive: true });
const path = name => new URL(name, output).pathname;
const logo = new URL("logo-verdant.png", source).pathname;
await sharp(logo).extract({ left: 320, top: 100, width: 1145, height: 740 }).resize(688).webp({ quality: 95 }).toFile(path("lockup-verdant.webp"));
// This crop stops above the lettering and retains the complete moth silhouette.
const mark = await sharp(logo).extract({ left: 345, top: 100, width: 1085, height: 405 }).png().toBuffer();
await sharp(mark).flatten({ background: "#142b26" }).resize(256, 256, { fit: "contain", background: "#142b26" }).png().toFile(path("icon.png"));
await sharp(mark).flatten({ background: "#142b26" }).resize(180, 180, { fit: "contain", background: "#142b26" }).png().toFile(path("apple-touch-icon.png"));
for (const [directory, suffix] of [["verdant", "verdant"], ["white-on-black", "mono"]]) {
  await sharp(new URL(directory + "/motion-poster.png", source).pathname).resize(1200, 675).webp({ quality: 92 }).toFile(path("poster-" + suffix + ".webp"));
  await copyFile(new URL(directory + "/sunrise.gif", source), path("sunrise-" + suffix + ".gif"));
}
await sharp(new URL("verdant/motion-poster.png", source).pathname).resize(1200, 630, { fit: "contain", background: "#142b26" }).png().toFile(path("social.png"));
console.log("Exported approved Sun Moth branding to public/brand/.");
