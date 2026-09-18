# SIA Summer Camps — landing page

Landing page for the School of Irish Archaeology summer camps, served at
[camps.sia.ie](https://camps.sia.ie) via GitHub Pages.

Built with [Astro](https://astro.build) as a fully static site: no runtime framework,
one HTML page, one CSS bundle, one small JS bundle.

## Quick start

```bash
npm install
npm run dev       # http://localhost:4321 with hot reload
npm run build     # static output in dist/
npm run preview   # serve dist/ locally
```

Node 22 or newer.

## Where to change things

| What                                   | Where                                      |
| -------------------------------------- | ------------------------------------------ |
| Phone, email, booking URL, GTM id, social links | `src/data/site.json`              |
| Nav links                              | `src/data/nav.json`                        |
| Camp day schedule                      | `src/data/schedule.json`                   |
| Activity tabs and cards                | `src/data/activities.json`                 |
| "Why SIA" comparison table             | `src/data/why.json`                        |
| Locations                              | `src/data/locations.json`                  |
| Testimonials                           | `src/data/testimonials.json`               |
| Pricing                                | `src/data/pricing.json`                    |
| Partner logos                          | `src/data/partners.json` + `public/assets/images/Logo/` |
| Gallery photos                         | `src/data/gallery.json` + `public/assets/images/gallery/` |
| FAQ                                    | `src/data/faq.json`                        |
| Stats counters                         | `src/data/stats.json`                      |
| Hero / Who we are / Founder copy       | `src/components/sections/*.astro`          |

Text in JSON is plain text. A few fields (`why.json` cells) allow inline HTML for the
amber highlight `<span class="hl">…</span>`.

## Project layout

```
public/                 served as-is at the site root
  CNAME                 custom domain for GitHub Pages
  assets/images/        photos, logos, favicon
src/
  pages/index.astro     the single page: composes the sections in order
  layouts/Base.astro    <head>, fonts, Consent Mode + GTM (inline by design), <body> shell
  components/
    Nav.astro, Footer.astro, SectionHead.astro
    VideoModal.astro, Lightbox.astro, CookieConsent.astro
    icons/              small inline SVG icons
    sections/           one component per page section, top to bottom
  data/                 content as JSON (see table above)
  styles/
    main.css            import manifest; ORDER MATTERS (see comment inside)
    tokens.css          colour/font variables
    <section>.css       desktop rules per section
    mobile.css          the ≤480px block, mobile-extras.css, responsive.css
    polish.css          late desktop overrides (schedule timeline, gallery, lightbox, marquee…)
  scripts/
    main.js             entry point, calls each module's init()
    lib/actions.js      `data-action` click delegation helper
    modules/            one file per feature (nav, gallery, cookie consent, …)
.github/workflows/deploy.yml   builds and publishes to GitHub Pages on push to main
```

### Conventions

- **No inline `onclick`.** Interactive elements declare `data-action="name"` (plus
  `data-*` params); the matching module registers a handler via `onAction()` in
  `src/scripts/lib/actions.js`.
- **Consent before GTM.** The Consent Mode v2 defaults and the GTM loader live inline in
  `Base.astro` on purpose: they must run synchronously before `gtm.js` is requested.
  Do not move them into the bundle.
- **CSS order.** `src/styles/main.css` imports files in the order the rules originally
  appeared. Later files (`mobile*.css`, `polish.css`) override earlier ones with
  equal-specificity selectors, so reordering changes the rendering.
- **Images** live in `public/assets/images/` and are referenced by absolute path
  (`/assets/images/...`) from both markup and CSS.

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which runs `astro build` and
publishes `dist/` to GitHub Pages. The repository's Pages source must be set to
**GitHub Actions** (Settings → Pages → Build and deployment → Source).
`public/CNAME` keeps the custom domain.
