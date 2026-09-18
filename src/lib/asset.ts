// Files in public/ are referenced by absolute path, so Astro cannot prefix them
// with `base` the way it does for bundled assets. On a GitHub Pages project site
// the page lives under /<repo>/, so an unprefixed /assets/... 404s.
// BASE_URL is "/" at the site root and "/<repo>" under a base, hence the collapse.
export const asset = (path: string) =>
  `${import.meta.env.BASE_URL}/${path}`.replace(/\/{2,}/g, '/');
