# Solivant Studios website

Static-first studio website built with Astro and configured for Netlify.

## Local development

```sh
npm install
npm run dev
```

The development server prints the local URL after startup.

## Quality checks

```sh
npm run check
npm run build
```

The production output is written to `dist/`.
GitHub Actions runs both checks automatically for pull requests and pushes to
`main`.

## Content structure

- `src/data/site.ts` — studio metadata and navigation
- `src/data/projects.ts` — project names, statuses, descriptions, media, and links
- `src/pages/` — public routes
- `src/components/` — reusable site components
- `src/layouts/` — shared document structure and metadata
- `src/styles/global.css` — global layout and visual tokens
- `public/media/projects/` — public-facing artwork and video

The working project names are intentionally centralized in
`src/data/projects.ts`. Update `publicTitle` when a final title is announced.

## Brand reference

The supplied root `index.html` is a local reference containing the current
Solivant logo animation inside a game build. It is ignored by Git and is not
part of the production site. The reusable website mark is implemented in
`src/components/StudioLogo.astro`.

## Netlify

`netlify.toml` sets the build command to `npm run build` and publishes `dist/`.
The contact form uses Netlify Forms and requires no client-side JavaScript.
Netlify's built-in `URL` environment variable supplies the canonical site URL;
set `SITE_URL` to override it when the final custom domain is connected.
