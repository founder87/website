import test from "node:test";
import assert from "node:assert/strict";
import { safeExternalUrl, validateImage, defineProjects } from "../src/lib/content.mjs";
const project = { slug: "test-game", title: "Test Game", summary: "A test project.", description: ["A description."], workingTitle: true, status: "In development", tone: "sage", platforms: [] };
const image = { src: "/media/projects/test-game/cover.webp", alt: "A descriptive screenshot.", width: 1920, height: 1080 };
test("projects work with no media, dates, or store links", () => assert.deepEqual(defineProjects([project]), [project]));
test("project media, trailer and store data accept valid inputs", () => {
  assert.equal(defineProjects([{ ...project, cover: image, gallery: [image], trailer: { label: "Watch trailer", href: "https://example.com/trailer" }, links: [{ label: "Store page", href: "https://example.com/game" }] }]).length, 1);
});
test("reject duplicate slugs, traversal, missing names, unknown states and colors", () => {
  assert.throws(() => defineProjects([project, project]));
  for (const change of [{ slug: "../secret" }, { title: "" }, { status: "Probably ready" }, { tone: "unknown" }, { platforms: [""] }, { description: [] }]) assert.throws(() => defineProjects([{ ...project, ...change }]));
});
test("reject unsafe external destinations", () => {
  for (const url of ["javascript:alert(1)", "//example.com", "data:text/html,test", "http://example.com", "https://a:b@example.com", "https://example.com\\bad"]) assert.throws(() => safeExternalUrl(url));
  assert.equal(safeExternalUrl("https://example.com/game?ref=studio"), "https://example.com/game?ref=studio");
});
test("media require local raster files, meaningful alt, and dimensions", () => {
  assert.deepEqual(validateImage(image), image);
  for (const change of [{ src: "https://example.com/image.png" }, { src: "/media/projects/../secret.png" }, { src: "/media/projects/script.svg" }, { alt: " " }, { width: 0 }, { height: -1 }]) assert.throws(() => validateImage({ ...image, ...change }));
});
