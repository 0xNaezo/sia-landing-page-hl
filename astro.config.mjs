// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://camps.sia.ie',
  output: 'static',

  vite: {
    build: {
      // Vite 8 minifies CSS with lightningcss, which collapses a
      // -webkit-/standard property pair down to whichever was written last
      // (so `backdrop-filter` loses either Firefox or Safari <18).
      // esbuild leaves the authored declarations alone.
      cssMinify: 'esbuild',
    },
  },
});
