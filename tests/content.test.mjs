import test from "node:test";
import assert from "node:assert/strict";
import { safeExternalUrl, defineSocials, validateImage, defineProjects } from "../src/lib/content.mjs";
const project = { slug: "test-game", title: "Test Game", summary: "A test project.", lede: "A distinct project page lede.", description: ["A description."], workingTitle: false, status: "In development", tone: "ochre", platforms: [] };
const image = { src: "/media/projects/test-game/cover.webp", alt: "A descriptive screenshot.", width: 1920, height: 1080 };
test("projects work with no media, dates, or store links", () => assert.deepEqual(defineProjects([project]), [project]));
test("project tones accept ochre, slate, clay, and emerald", () => {
  for (const tone of ["ochre", "slate", "clay", "emerald"]) {
    assert.equal(defineProjects([{ ...project, slug: "test-" + tone, tone }]).length, 1);
  }
});
test("project media, trailer and store data accept valid inputs", () => {
  assert.equal(defineProjects([{ ...project, cover: image, gallery: [image], trailer: { label: "Watch trailer", href: "https://example.com/trailer" }, links: [{ label: "Store page", href: "https://example.com/game" }] }]).length, 1);
});
test("reject duplicate slugs, traversal, missing names, unknown states and colors", () => {
  assert.throws(() => defineProjects([project, project]));
  for (const change of [{ slug: "../secret" }, { title: "" }, { status: "Probably ready" }, { tone: "unknown" }, { tone: "sage" }, { lede: "   " }, { platforms: [""] }, { description: [] }]) assert.throws(() => defineProjects([{ ...project, ...change }]));
});
test("social channels omit blank slots cleanly and validate configured HTTPS URLs", () => {
  assert.deepEqual(defineSocials({ x: "", discord: "", youtube: "", steam: "" }), []);
  assert.deepEqual(
    defineSocials({
      x: "https://x.com/solivantstudios",
      discord: "https://discord.gg/solivant",
      youtube: "",
      steam: "https://store.steampowered.com/developer/solivantstudios",
    }),
    [
      { platform: "x", label: "X", href: "https://x.com/solivantstudios" },
      { platform: "discord", label: "Discord", href: "https://discord.gg/solivant" },
      { platform: "steam", label: "Steam", href: "https://store.steampowered.com/developer/solivantstudios" },
    ],
  );
  for (const invalid of [{ unknown: "https://example.com" }, { x: "http://x.com/solivant" }, { discord: "javascript:alert(1)" }, { youtube: "   " }]) {
    assert.throws(() => defineSocials(invalid));
  }
});
test("reject unsafe external destinations", () => {
  for (const url of ["javascript:alert(1)", "//example.com", "data:text/html,test", "http://example.com", "https://a:b@example.com", "https://example.com\\bad"]) assert.throws(() => safeExternalUrl(url));
  assert.equal(safeExternalUrl("https://example.com/game?ref=studio"), "https://example.com/game?ref=studio");
});
test("media require local raster files, meaningful alt, and dimensions", () => {
  assert.deepEqual(validateImage(image), image);
  for (const change of [{ src: "https://example.com/image.png" }, { src: "/media/projects/../secret.png" }, { src: "/media/projects/script.svg" }, { alt: " " }, { width: 0 }, { height: -1 }]) assert.throws(() => validateImage({ ...image, ...change }));
});
