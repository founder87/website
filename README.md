# Solivant Studios Website

Official website for **Solivant Studios** (`https://solivantstudios.com`).
Slogan: *Mundi sine fine*.

## Projects

- **Byzantium** (initial release, in development): `/projects/byzantium/`
- **Hexagonal** (upcoming codename)
- **Cubes** (upcoming codename)
- **Horizon** (upcoming codename)

## Run locally

Use Node 22.12 or newer (`.nvmrc` specifies Node 22).

```sh
npm ci --ignore-scripts
npm run dev
```

Verification and offline review:

```sh
npm run verify              # unit tests, Astro type checks, static build + artifact audit
npm run test:build-modes     # preview, email, and production GTM/indexing modes
npm run audit:dependencies  # dependency audit across runtime and build tooling
npm run preview:standalone  # self-contained offline review file at ../solivant-studios-preview.html
```

## Architecture & Brand

- Palette: Obsidian (`#090807`), Smoked Basalt (`#12100e`), Burnished Imperial Gold (`#d8a650`), and Warm Ivory (`#f3efe6`).
- `src/data/projects.ts`: Project metadata and optional media, trailer, and storefront/community links.
- `src/data/site.ts`: Studio metadata, primary navigation (`Byzantium`, `Contact`), and plug-in `socials` slots (`x`, `youtube`, `discord`, `steam`, `instagram`, `bluesky`, `reddit`, `tiktok`, `linkedin`, `github`). Paste any HTTPS profile URL into `socials` to publish it across the footer, Contact page, Open Graph tags, and `Organization` JSON-LD `sameAs` schema.
- `src/pages/privacy.astro`, `src/pages/terms.astro`, `src/pages/support.astro`: Apple App Store (iOS/macOS) and Steam compliant legal and player support pages.
- `scripts/export-brand.mjs`: Mechanical exports of the Sun Moth branding to `public/` (`favicon.ico`, `brand/logo-gold.webp`, `brand/favicon-gold.png`, `brand/icon-512.png`, `brand/apple-touch-icon.png`, `brand/social.png`, `brand/social-byzantium.png`).
- `hq/`: Private, 2FA-protected founder command center (`hq.solivantstudios.com` Cloudflare Worker) unifying Email + TOTP 2FA login, Gemini Studio Intelligence, GA4 analytics, Steamworks sales, Apple App Store Connect proceeds, and the `contact@solivantstudios.com` inbox. See `hq/README.md`.

## Configuration

| Variable | Behavior |
| --- | --- |
| `SITE_URL` | `https://solivantstudios.com` (HTTPS origin only) |
| `SITE_INDEXABLE` | `true` on production builds; `false` on local/preview builds |
| `CONTACT_EMAIL` | Published studio email (`contact@solivantstudios.com`) |
| `GA_MEASUREMENT_ID` | Optional GTM or GA4 ID (`GTM-54ZF68NB` in production) |
