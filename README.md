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
- `src/data/projects.ts`: Project metadata and optional media/store links.
- `src/data/site.ts`: Studio metadata and primary navigation (`Byzantium`, `Studio`, `Contact`).
- `src/pages/privacy.astro`, `src/pages/terms.astro`, `src/pages/support.astro`: Apple App Store (iOS/macOS) and Steam compliant legal and player support pages.
- `scripts/export-brand.mjs`: Mechanical exports of the Sun Moth branding to `public/brand/` (`lockup-verdant.webp`, `favicon-gold.png`, `icon-512.png`, `apple-touch-icon.png`, `social.png`, `social-byzantium.png`).

## Configuration

| Variable | Behavior |
| --- | --- |
| `SITE_URL` | `https://solivantstudios.com` (HTTPS origin only) |
| `SITE_INDEXABLE` | `true` on production builds; `false` on local/preview builds |
| `CONTACT_EMAIL` | Published studio email (`contact@solivantstudios.com`) |
| `GA_MEASUREMENT_ID` | Optional GTM or GA4 ID (`GTM-54ZF68NB` in production) |
