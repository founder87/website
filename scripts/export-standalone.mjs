// A review-only, self-contained snapshot of the built site. No server required.
// Production files and their policies are left unchanged.
import { readFile, readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, relative, extname, sep } from "node:path";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { Script, runInNewContext } from "node:vm";

const root = resolve(fileURLToPath(new URL("../dist/", import.meta.url)));
const destination = new URL("../../solivant-studios-preview.html", import.meta.url);
const assets = {};
const assetKeys = new Map();
const pages = {};
const mimeTypes = { ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif", ".avif": "image/avif", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml" };
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(match => [match[1], match[2]]));
const sha = text => "'sha256-" + createHash("sha256").update(text).digest("base64") + "'";
async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? walk(resolve(directory, entry.name)) : resolve(directory, entry.name)))).flat();
}
function localPath(url) {
  assert.ok(url.startsWith("/") && !url.startsWith("//"), "Expected a local asset: " + url);
  const path = resolve(root, "." + decodeURIComponent(url));
  assert.ok(path.startsWith(root + sep), "Asset escaped the build directory");
  return path;
}
async function embed(url) {
  if (assetKeys.has(url)) return assetKeys.get(url);
  const type = mimeTypes[extname(url)];
  assert.ok(type, "Unsupported standalone asset: " + url);
  const token = "__SOLIVANT_EMBED_" + assetKeys.size + "__";
  assets[token] = "data:" + type + ";base64," + (await readFile(localPath(url))).toString("base64");
  assetKeys.set(url, token);
  return token;
}

// Each rendered page is isolated, so the site's existing scripts start fresh
// on navigation. Only the parent shell handles navigation between local pages.
const bridge = String.raw`
document.addEventListener("click", event => {
  const link = event.target instanceof Element ? event.target.closest("a") : null;
  if (!link) return;
  const href = link.getAttribute("href") || "";
  if (href.startsWith("/")) {
    event.preventDefault();
    parent.postMessage({ type: "solivant-preview:navigate", path: href }, "*");
  } else if (href.startsWith("#")) {
    event.preventDefault();
    const target = document.getElementById(href.slice(1));
    if (target) { target.scrollIntoView(); if (target.hasAttribute("tabindex")) target.focus({ preventScroll: true }); }
  } else if (/^(https?:|mailto:)/i.test(href)) {
    event.preventDefault();
    parent.postMessage({ type: "solivant-preview:external" }, "*");
  }
});
document.addEventListener("submit", event => {
  event.preventDefault();
  parent.postMessage({ type: "solivant-preview:form" }, "*");
}, true);
`;

for (const path of (await walk(root)).filter(path => path.endsWith(".html"))) {
  let html = await readFile(path, "utf8");
  const file = relative(root, path).split(sep).join("/");
  const route = file === "index.html" ? "/" : file === "404.html" ? "/404/" : "/" + file.replace(/index\.html$/, "");

  // Metadata used by crawlers/hosts is not relevant to a local review file.
  html = html.replace(/<meta\b[^>]*http-equiv="content-security-policy"[^>]*>/gi, "");
  html = html.replace(/<meta\b[^>]*(?:property="og:[^"]+"|name="twitter:[^"]+")[^>]*>/gi, "");
  html = html.replace(/<meta\b[^>]*name="robots"[^>]*>/gi, '<meta name="robots" content="noindex, nofollow">');
  for (const match of [...html.matchAll(/<link\b[^>]*>/g)]) {
    const tag = match[0];
    const attrs = attributes(tag);
    if (["canonical", "manifest", "preload", "modulepreload"].includes(attrs.rel)) {
      html = html.replace(tag, "");
    } else if (attrs.rel === "stylesheet") {
      const css = await readFile(localPath(attrs.href), "utf8");
      assert.ok(!/url\(|@import|<\/style/i.test(css), "Standalone CSS must not request other files");
      html = html.replace(tag, "<style>" + css + "</style>");
    } else if (["icon", "apple-touch-icon"].includes(attrs.rel)) {
      html = html.replace(tag, tag.replace(attrs.href, await embed(attrs.href)));
    } else throw new Error("Unexpected link resource: " + tag);
  }
  for (const match of [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>\s*<\/script>/g)]) {
    const script = await readFile(localPath(match[1]), "utf8");
    html = html.replace(match[0], '<script type="module">' + script + "</script>");
  }
  for (const match of [...html.matchAll(/\b(src|data-poster|data-motion)="(\/[^\"]+)"/g)]) {
    html = html.replace(match[0], match[1] + '="' + await embed(match[2]) + '"');
  }
  // A URL fragment restarts the existing GIF without appending a query to its
  // base64 payload. This change is confined to the offline export.
  html = html.replaceAll("?play=", "#play=");
  html = html.replace("</body>", "<script>" + bridge + "</script></body>");
  const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  const styles = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map(match => match[1]);
  const policy = ["default-src 'none'", "img-src data:", "font-src data:", "style-src " + [...new Set(styles.map(sha))].join(" "), "script-src " + [...new Set(scripts.map(sha))].join(" "), "connect-src 'none'", "form-action 'none'", "object-src 'none'", "base-uri 'none'"];
  html = html.replace('<meta charset="UTF-8">', '<meta charset="UTF-8"><meta http-equiv="content-security-policy" content="' + policy.join("; ") + '">');
  const title = html.match(/<title>(.*?)<\/title>/)?.[1] || "Solivant Studios";
  assert.ok(!/<(?:script|img)[^>]+src="\//.test(html), "Unembedded resource on " + route);
  assert.ok(!/<link[^>]+href="\//.test(html), "Unembedded link resource on " + route);
  assert.ok(!/<form\b/.test(html), "Export a build with CONTACT_PROVIDER=disabled for offline review");
  pages[route] = { html, title };
}

const bundle = { pages, assets };
function expand(html) { return html.replace(/__SOLIVANT_EMBED_\d+__/g, token => assets[token]); }
const escapedHome = expand(pages["/"].html).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
const payload = JSON.stringify(bundle).replaceAll("<", "\\u003c");
const shellScript = String.raw`
const bundle = JSON.parse(document.getElementById("preview-bundle").textContent);
const frame = document.getElementById("site-preview");
const notice = document.getElementById("preview-notice");
let lastRoute;
let noticeTimer;
function render() {
  const requested = window.location.hash.slice(1) || "/";
  const route = Object.hasOwn(bundle.pages, requested) ? requested : "/404/";
  if (route === lastRoute) return;
  lastRoute = route;
  const page = bundle.pages[route];
  frame.srcdoc = page.html.replace(/__SOLIVANT_EMBED_\d+__/g, token => bundle.assets[token]);
  document.title = page.title + " - offline appearance preview";
}
window.addEventListener("hashchange", render);
window.addEventListener("message", event => {
  if (event.source !== frame.contentWindow || !event.data) return;
  if (event.data.type === "solivant-preview:navigate") {
    const path = event.data.path;
    if (typeof path === "string" && Object.hasOwn(bundle.pages, path)) {
      if (path === lastRoute) lastRoute = undefined;
      window.location.hash = path;
      render();
    }
  } else if (["solivant-preview:external", "solivant-preview:form"].includes(event.data.type)) {
    notice.textContent = "Appearance preview only. External links and form submissions are disabled.";
    notice.hidden = false;
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => { notice.hidden = true; }, 5000);
  }
});
render();
`;

// Verify the standalone shell and every expanded page without a server/browser.
// This exercises the actual embedded router, not a duplicate implementation.
const listeners = {};
const previewFrame = { srcdoc: "", contentWindow: {} };
const elements = { "preview-bundle": { textContent: JSON.stringify(bundle) }, "site-preview": previewFrame, "preview-notice": { hidden: true } };
let hash = "";
const location = { get hash() { return hash; }, set hash(value) { hash = value.startsWith("#") ? value : "#" + value; } };
const window = { location, addEventListener: (name, handler) => { listeners[name] = handler; } };
const document = { getElementById: id => elements[id], title: "" };
runInNewContext(shellScript, { window, document, setTimeout: () => 0, clearTimeout: () => {} });
for (const route of Object.keys(pages)) {
  location.hash = route;
  listeners.hashchange();
  const rendered = previewFrame.srcdoc;
  assert.ok(rendered.includes("<h1"), "Missing page content: " + route);
  assert.ok(!rendered.includes("__SOLIVANT_EMBED_"), "Unresolved embedded asset: " + route);
  assert.ok(!/\b(?:src|data-motion|data-poster)="(?!data:)[^"]+"/.test(rendered), "Resource needs a server: " + route);
  const policy = rendered.match(/http-equiv="content-security-policy" content="([^"]+)"/)?.[1];
  for (const [, script] of rendered.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) {
    new Script(script);
    assert.ok(policy.includes(sha(script)), "CSP script hash mismatch: " + route);
  }
  for (const [, css] of rendered.matchAll(/<style>([\s\S]*?)<\/style>/g)) assert.ok(policy.includes(sha(css)), "CSP style hash mismatch: " + route);
}
listeners.message({ source: previewFrame.contentWindow, data: { type: "solivant-preview:navigate", path: "/projects/byzantium/" } });
assert.equal(location.hash, "#/projects/byzantium/");
assert.ok(document.title.startsWith("Byzantium"));
location.hash = "/missing/";
listeners.hashchange();
assert.ok(document.title.startsWith("Page not found"));
listeners.message({ source: previewFrame.contentWindow, data: { type: "solivant-preview:external" } });
assert.equal(elements["preview-notice"].hidden, false);
for (const data of Object.values(assets)) {
  const encoded = data.split(",")[1];
  assert.equal(Buffer.from(encoded, "base64").toString("base64"), encoded, "Invalid embedded asset");
}

const output = '<!doctype html>\n<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#090807"><title>Solivant Studios - offline appearance preview</title><style>html,body{margin:0;width:100%;height:100%;background:#090807}#site-preview{display:block;border:0;width:100%;height:100%;height:100dvh}#preview-notice{position:fixed;bottom:1rem;left:50%;transform:translateX(-50%);z-index:10;max-width:calc(100% - 2rem);padding:1rem 1.25rem;background:#ebe4d5;color:#090807;font:14px/1.5 system-ui,sans-serif;box-shadow:0 6px 24px #0008}[hidden]{display:none!important}</style></head><body><iframe id="site-preview" title="Solivant Studios website appearance preview" sandbox="allow-scripts" srcdoc="' + escapedHome + '"></iframe><p id="preview-notice" role="status" hidden></p><script id="preview-bundle" type="application/json">' + payload + '</script><script>' + shellScript + '</script></body></html>\n';
await writeFile(destination, output);
console.log("Standalone preview: " + fileURLToPath(destination));
console.log(Object.keys(pages).length + " pages, " + Object.keys(assets).length + " embedded assets, " + (Buffer.byteLength(output) / 1024 / 1024).toFixed(2) + " MB. No external asset requests.");
