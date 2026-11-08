// Audit the generated static artifact, not just the source templates.
import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { resolve, relative, extname } from "node:path";
import { createHash } from "node:crypto";
const root = resolve("dist");
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? walk(resolve(dir, e.name)) : resolve(dir, e.name)))).flat();
}
const files = await walk(root);
const htmlFiles = files.filter(file => extname(file) === ".html");
const inlineScripts = new Set();
const decode = text => text.replaceAll("&quot;", '"').replaceAll("&#39;", "'").replaceAll("&amp;", "&");
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)].map(match => [match[1].toLowerCase(), decode(match[2])]));
const required = ["index.html", "projects/index.html", "projects/byzantium/index.html", "studio/index.html", "contact/index.html", "privacy/index.html", "terms/index.html", "support/index.html", "contact/success/index.html", "404.html", "robots.txt", "sitemap.xml", "_headers", ".well-known/security.txt"];
for (const file of required) assert.ok(files.includes(resolve(root, file)), "Missing route: " + file);

for (const file of files) {
  const path = relative(root, file);
  assert.ok(!/(^|\/)(?:\.env|\.git|node_modules|src|archive)(?:[./]|$)/.test(path), "Private/source file in build: " + path);
  assert.ok(!path.endsWith(".map"), "Source map in public output: " + path);
  assert.ok(!path.includes("solivant-logo-animation"), "Legacy game intro leaked into production");
}
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const label = relative(root, file);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, label + ": duplicate element IDs");
  for (const [, fragment] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(fragment), label + ": broken fragment " + fragment);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, label + ": exactly one h1 required");
  assert.match(html, /<html[^>]+lang="en"/, label + ": missing language");
  assert.match(html, /href="#main-content"/, label + ": missing skip link");
  assert.match(html, /<main[^>]+id="main-content"/, label + ": missing main landmark");
  assert.match(html, /<title>[^<]+<\/title>/, label + ": missing title");
  const tags = [...html.matchAll(/<(?:a|link|img|script|meta|form|input|textarea|select)\b[^>]*>/g)].map(match => ({ tag: match[0], attrs: attributes(match[0]) }));
  const csp = tags.find(t => t.attrs["http-equiv"]?.toLowerCase() === "content-security-policy")?.attrs.content;
  assert.ok(csp, label + ": missing CSP");
  for (const directive of ["default-src 'self'", "base-uri 'none'", "object-src 'none'", "frame-src 'none'", "form-action 'self'", "script-src-attr 'none'", "style-src-attr 'none'"]) assert.ok(csp.includes(directive), label + ": missing " + directive);
  assert.ok(!/unsafe-inline|unsafe-eval/.test(csp), label + ": unsafe CSP");
  assert.ok(!/\s(?:on[a-z]+|style)\s*=/i.test(html), label + ": inline handler or style");
  for (const [, script] of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) {
    if (script.trim()) {
      inlineScripts.add(script);
      assert.ok(csp.includes("sha256-" + createHash("sha256").update(script).digest("base64")), label + ": inline script missing CSP hash");
    }
  }
  const canonical = tags.find(t => t.attrs.rel === "canonical")?.attrs.href;
  assert.ok(canonical?.startsWith("https://"), label + ": missing HTTPS canonical");
  for (const { tag, attrs } of tags) {
    if (tag.startsWith("<img")) {
      assert.ok("alt" in attrs, label + ": image missing alt");
      assert.ok(Number(attrs.width) > 0 && Number(attrs.height) > 0, label + ": image dimensions missing");
    }
    if (attrs.target === "_blank") assert.ok(attrs.rel?.includes("noopener"), label + ": unsafe external tab");
    for (const value of [attrs.href, attrs.src, attrs.action].filter(Boolean)) {
      assert.ok(!/^(?:javascript:|data:text\/html|\/\/)/i.test(value), label + ": unsafe URL");
      if (!value.startsWith("/")) continue;
      const url = new URL(value, "https://local.invalid");
      let target = resolve(root, "." + decodeURIComponent(url.pathname));
      assert.ok(target === root || target.startsWith(root + "/"), label + ": path outside build");
      let info;
      try { info = await stat(target); } catch { assert.fail(label + ": missing local target " + value); }
      if (info.isDirectory()) target = resolve(target, "index.html");
      assert.ok(files.includes(target), label + ": missing file " + value);
    }
  }
}
const headers = await readFile(resolve(root, "_headers"), "utf8");
for (const header of ["Content-Security-Policy: frame-ancestors 'none'", "X-Frame-Options: DENY", "X-Content-Type-Options: nosniff", "Referrer-Policy:", "Permissions-Policy:", "Strict-Transport-Security:", "Cache-Control: public, max-age=31536000, immutable"]) assert.ok(headers.includes(header), "Missing response header: " + header);
const home = await readFile(resolve(root, "index.html"), "utf8");
const robots = await readFile(resolve(root, "robots.txt"), "utf8");
const sitemap = await readFile(resolve(root, "sitemap.xml"), "utf8");
if (home.includes('content="noindex, nofollow"')) {
  assert.match(robots, /Disallow: \//);
  assert.ok(!sitemap.includes("<url>"));
  assert.match(headers, /X-Robots-Tag: noindex, nofollow/);
} else {
  assert.match(robots, /Sitemap: https:\/\//);
  assert.equal((sitemap.match(/<url>/g) || []).length, 8);
  assert.ok(!/404|success/.test(sitemap));
}
const contact = await readFile(resolve(root, "contact/index.html"), "utf8");
if (contact.includes("<form")) {
  for (const expected of ['method="POST"', 'action="/contact/success/"', 'data-netlify="true"', 'netlify-honeypot="company-site"', 'maxlength="5000"', 'maxlength="254"', 'name="form-name"']) assert.ok(contact.includes(expected), "Form missing " + expected);
  assert.ok(!contact.includes('type="file"'), "File uploads are not supported");
} else {
  assert.ok(!contact.includes('type="submit"'), "Disabled contact must not offer submission");
}
const bytes = (await Promise.all(files.filter(f => /\.(js|css)$/.test(f)).map(f => stat(f)))).reduce((sum, s) => sum + s.size, 0) + [...inlineScripts].reduce((sum, script) => sum + Buffer.byteLength(script), 0);
assert.ok(bytes < 100_000, "Static site JS/CSS budget exceeded: " + bytes);
console.log("Verified " + htmlFiles.length + " HTML pages: routes, local assets, SEO, CSP, headers, contact states, and " + Math.ceil(bytes / 1024) + " KB JS/CSS.");
