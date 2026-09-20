# CLAUDE.md

## Repository status

This is a **fork** (`0xNaezo/sia-landing-page-hl`), not the production repository.

**Nothing here deploys to production.** The owner deploys manually at the end of
the work. Do not treat pushes to `main` as going live, and do not try to trigger,
fix, or reason about production deployment as part of a task.

`.github/workflows/deploy.yml` (GitHub Pages) exists but is inherited from
upstream — treat it as inactive for this fork.

### Consequence for debugging

The live site at camps.sia.ie is served from upstream and can be **several
commits behind this fork**. As of the Astro migration (`2e402ae`) it was still
serving the pre-migration monolithic `index.html` — no `_astro/` assets at all.
So a fix made here will not show up there until the owner deploys. When a bug is
reported against the live site, check whether the live HTML even contains the
code you are looking at before hunting for the cause.

## Project

Astro 7 static landing page for the School of Irish Archaeology summer camps.

```bash
npm run dev      # localhost:4321
npm run build    # -> dist/
npm run check    # astro check
```

Content lives in `src/data/*.json`; sections in `src/components/sections/`;
one stylesheet per section in `src/styles/`, all imported via `main.css`.
Client JS is one bundle: `src/scripts/main.js` calls each `src/scripts/modules/*`
initialiser, and each module no-ops when its markup is absent.

### Reveal animations

Content blocks marked `.reveal` fade in on scroll. The hidden state is gated
behind a `.reveal-ready` class that `src/scripts/modules/reveal.js` sets on
`<html>` only once it has an observer ready to undo it. Never move `opacity:0`
back onto a bare `.reveal` selector: that makes invisible the default state of
~50 content blocks, so any load where the bundle fails or the viewport never
scrolls (print, full-page screenshot, crawler) renders a blank page.

### Emoji icons

There are no raw emoji in `src/`. Every one is an SVG `<symbol>` in a sprite that
`src/components/Sprite.astro` inlines once in `<body>`, referenced through
`<Emoji name="pumpkin" />`; `src/data/*.json` carries the icon name, not the glyph.
The artwork is Noto Color Emoji (`src/icons/emoji/`, Apache 2.0) plus two monochrome
marks of our own (`src/icons/ui/`) for `★` and `✓`, which the stylesheets colour
themselves and so have to follow `currentColor`.

`.emoji` is sized in `em`, so the `font-size` rules that used to size the emoji —
`.acard-icon`, `.stl-icon`, `.picon`, `.why-mcard-icon` and their mobile overrides —
still control it. Keep it that way: switching those to `width`/`height` in `px` means
re-deriving every breakpoint.

Two guards, both wired into `npm run check` or the build: `scripts/check-no-emoji.mjs`
fails on a literal emoji anywhere in `src/` (`✕` in `VideoModal.astro` is the one
allowed text symbol), and an unknown `name` throws at build time rather than rendering
an empty `<use>`. Adding a glyph: see `src/icons/emoji/README.md` — the `prefixIds`
step is required, Noto reuses ids like `SVGID_1_` across files and they collide once
inlined into one sprite document.
