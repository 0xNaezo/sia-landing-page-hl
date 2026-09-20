// Build-time registry behind the inline emoji sprite.
//
// Every icon under src/icons/ is inlined once into one hidden <svg> (Sprite.astro)
// and referenced from the page with <use href="#e-name"> (Emoji.astro). The glob
// runs at build time only, so none of this SVG source reaches the client twice and
// none of it costs a request.
//
// File name is the whole registry: drop `crystal-ball.svg` in and `#e-crystal-ball`
// exists. Sorted so the sprite markup is stable between builds.
const modules = {
  ...import.meta.glob<string>('../icons/emoji/*.svg', {
    query: '?raw',
    import: 'default',
    eager: true,
  }),
  ...import.meta.glob<string>('../icons/ui/*.svg', {
    query: '?raw',
    import: 'default',
    eager: true,
  }),
};

export interface EmojiSymbol {
  /** Sprite id, e.g. `e-pumpkin`. */
  id: string;
  viewBox: string;
  /** Everything between <svg> and </svg>. */
  body: string;
}

export const symbols: EmojiSymbol[] = Object.entries(modules)
  .map(([path, source]) => {
    const name = path.slice(path.lastIndexOf('/') + 1, -'.svg'.length);
    const viewBox = /viewBox="([^"]+)"/.exec(source)?.[1];
    // A <symbol> without a viewBox has no coordinate system to scale into, so it
    // would render at its raw size and blow out the layout. Fail the build instead.
    if (!viewBox) throw new Error(`${path}: no viewBox on the root <svg>.`);
    const body = source
      .replace(/^[\s\S]*?<svg\b[^>]*>/, '')
      .replace(/<\/svg>\s*$/, '')
      .trim();
    return { id: `e-${name}`, viewBox, body };
  })
  .sort((a, b) => a.id.localeCompare(b.id));

const names = new Set(symbols.map((symbol) => symbol.id.slice('e-'.length)));

/**
 * Sprite reference for `name`, or a build error. A typo in `src/data/*.json` would
 * otherwise render an empty <use> — visible to nobody until someone opens the page.
 */
export const symbolHref = (name: string): string => {
  if (!names.has(name)) {
    throw new Error(
      `Unknown icon "${name}". Available: ${[...names].sort().join(', ')}.`
    );
  }
  return `#e-${name}`;
};
