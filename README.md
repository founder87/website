# Solivant Studios website

Static-first Astro foundation for **BoomTown**, **The Grid**, **Horizon** and
**Bastion**, in that order. Horizon and Bastion are working titles. No hosting,
DNS changes, deployment, database, or live inbox have been provisioned.

## Run locally

Use Node 22.12 or newer (CI and `.nvmrc` use Node 22).

```sh
npm ci --ignore-scripts
npm run dev
```

Open the localhost address printed by the server. Do not double-click `dist`
HTML files: root-relative paths and the security policy require HTTP.

For a **single-file appearance review**, run `npm run preview:standalone`.
Open `../solivant-studios-preview.html` directly in a browser. It embeds all
pages, styles, logos and animations; navigation works offline. External links
and submissions are disabled. This is a review snapshot, not a deployment file.

```sh
npm run verify              # unit tests, type/template checks, build + artifact audit
npm run test:build-modes     # preview, email-only, enabled form; restores safe defaults
npm run audit:dependencies  # all dependencies, including build tooling
npm run preview             # serve the production artifact
```

Publish **only `dist/`**, never this repository root. The ignored root
`index.html` is an old game-build reference, not the homepage. Old pulse-logo
exports are preserved in `archive/legacy-brand/`, outside the public build.

Browser regression suite:

```sh
npx playwright install chromium
npm run build
npm run test:browser
```

CI runs desktop/mobile browser checks on Linux. A restricted macOS environment
may deny Chromium's Mach-port bootstrap; use an ordinary terminal or CI then.
Static checks are not a replacement for a visual browser review.

## Design and content

The direction is Verdant: forest green, sage, and gold. The approved Sun Moth
is used in the header and home ident; the studio page and footer use the
approved white-on-black version. Sunrise is opt-in, silent, stoppable, and
automatically returns to a still after one play. Reduced motion gets a still.

No game art, genres, platforms, dates, team biographies, social accounts, or
store links have been invented. Typography-only panels hold each project's
place until artwork arrives; unavailable features do not get fake buttons.

- `src/data/projects.ts`: project order, titles, descriptions and optional media.
- `src/data/site.ts`: studio metadata and navigation.
- `src/styles/global.css`: color, typography, spacing and responsive layouts.
- `src/components/`: shared navigation, brand, motion and project components.
- `public/brand/`: optimized exports and the existing motion-study GIFs.
- `scripts/export-brand.mjs`: mechanical exports from the approved sources in
  `../concept-art/sun-moth-verdant-and-mono/`; run `npm run brand:export` after
  approved source art changes. It does not redraw the logo.

The logo is still a raster production study. A clean vector master remains a
separate branding task.

### Add artwork, trailers, and store links

Put optimized images in `public/media/projects/<slug>/` and add optional fields
to that project in `src/data/projects.ts`:

```ts
cover: {
  src: "/media/projects/boomtown/cover.webp",
  alt: "Describe the actual artwork or gameplay shown.",
  width: 1920, height: 1080,
  caption: "Optional caption",
},
gallery: [
  { src: "/media/projects/boomtown/screenshot-01.webp", alt: "Describe the screenshot.", width: 1920, height: 1080 },
],
trailer: { label: "Watch the trailer", href: "https://your-confirmed-trailer-url.example/" },
links: [{ label: "View store page", href: "https://your-confirmed-store-url.example/" }],
platforms: ["Only confirmed platforms"],
release: "Only announced release information",
```

Replace example URLs; do not publish them. Local paths, alt text, dimensions,
unique slugs, status values and HTTPS links are validated. The artifact audit
fails for missing images or local link targets. Prefer WebP/AVIF, keep original
large art outside `public/`, and check mobile cropping. Card covers use 16:10;
the project page displays natural proportions. Gallery and link sections appear
automatically when supplied. Trailers link out rather than embedding trackers.

## Configuration

Copy `.env.example` to `.env` locally, or use the host's build environment.
Changes require a rebuild. None of these values are secrets.

| Variable | Default / behavior |
| --- | --- |
| `SITE_URL` | `https://solivantstudios.com`; HTTPS origin only |
| `SITE_INDEXABLE` | `false`; robots, HTML and headers discourage indexing |
| `CONTACT_EMAIL` | blank; optional **published**, real mailbox |
| `CONTACT_PROVIDER` | `disabled` or `netlify` |
| `CONTACT_PRIVACY_REVIEWED` | `false`; production form requires review |

Non-production Netlify contexts force noindex and disable forms even when they
inherit production settings. Other hosts should explicitly disable indexing
on previews. **Noindex is not access control**; use host authentication for
private previews. Do not put credentials in `public/`, content, or `PUBLIC_`
variables. Environment files other than `.env.example` are git-ignored.

## Contact delivery

The default page has no form or submit button; its confirmation page does not
claim a message was sent. Set a real `CONTACT_EMAIL` for email-only contact on
any static host. No address has been guessed.

If Netlify is chosen later:

1. Configure and verify the mailbox and form notification recipient.
2. Review `src/pages/privacy.astro`, including provider details, retention and
   deletion handling, and a contact route. This is technical starter copy, not
   a legal-compliance certification.
3. Enable Netlify form detection; set `CONTACT_PROVIDER=netlify` and
   `CONTACT_PRIVACY_REVIEWED=true` for production.
4. Build on Netlify. `NETLIFY=true` and `CONTEXT=production` are required; local
   development and deploy previews remain non-submitting.
5. Test real delivery, dashboard receipt, spam filtering, notification emails,
   failure behavior, and provider usage limits before opening inquiries.

The form includes a honeypot, browser validation and length limits, no uploads,
and a same-origin POST. These are **not server-side validation or rate limits**.
Abuse prevention and delivery must be checked with the actual provider. Do not
simulate Netlify flags and ship a form to an unrelated static host.

[Netlify's setup guide](https://docs.netlify.com/manage/forms/setup/) covers
form detection and deployment. Other hosts require a separately verified
backend, or email-only contact.

## Security boundaries

Implemented here:

- Static HTML/CSS and small progressive-enhancement scripts; no accounts,
  database, application server, analytics, cookies, remote fonts or embeds.
- Astro-generated CSP hashes, same-origin resources, no `unsafe-inline` or
  `unsafe-eval`, and blocked inline handlers/styles and frames.
- HTTP framing protection, `nosniff`, restricted browser permissions,
  `strict-origin-when-cross-origin` referrers, same-origin opener isolation,
  and one-year HSTS without `includeSubDomains` or preload.
- Immutable caching only for fingerprinted `/_astro/` files.
- Validated content/config, locked dependencies, full dependency audits,
  build regression checks, browser tests and read-only CI permissions.

Astro emits the resource CSP into built HTML. The build generates `dist/_headers`
from `src/config/security.mjs`; its separate `frame-ancestors` HTTP policy
intersects the HTML policy. Do not add another script policy blindly: it can
block correctly hashed scripts. CSP is tested on builds, not the dev server.

`_headers` is only a recipe until the chosen host applies it. Astro preview
does **not** verify production response headers. On another host, translate
these settings to its configuration. Verify live TLS before enabling HSTS.
Do not extend HSTS to subdomains until their HTTPS support is known.

Primary references: [Astro CSP](https://docs.astro.build/en/reference/configuration-reference/#securitycsp)
and [Netlify headers](https://docs.netlify.com/manage/routing/headers/).

This repository does not provide live TLS, DNS hardening, hosting-account
security, a WAF, backend abuse prevention or email authentication. Maintain
Node and dependencies. A clean audit is a point-in-time dependency check,
not a penetration test or a guarantee of security.

## Before public launch

- Choose a host and publish only `dist/`. Netlify configuration is preparation,
  not a hosting commitment.
- Review public copy, working titles, artwork rights and privacy/provider details.
- Complete real-browser visual/accessibility QA: mobile, keyboard, zoom,
  contrast, reduced motion and media cropping.
- Configure canonical-domain, HTTP and www redirects. Verify live HTTPS, 404
  status, response headers and cache behavior.
- Enable MFA/recovery on registrar, host, source control and email. Change
  Namecheap DNS only when the host supplies exact records; preserve mail records.
- Keep contact disabled until delivery and abuse-handling checks pass.
- Set `SITE_INDEXABLE=true` only for the public production build. Confirm the
  live robots file, nine-page sitemap, canonical links and social preview.
- Smoke-test the live site and retain a previous deployment for rollback.

CI repeats checks on future changes; it does not deploy the website.
