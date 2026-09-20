#!/usr/bin/env node
// Fails the build if a raw emoji character comes back into src/.
//
// Every emoji on the page is an SVG from the sprite (src/icons, components/Emoji.astro)
// precisely so a glyph does not change shape between Windows, macOS and Android. A
// literal emoji pasted into src/data/*.json or a component would silently reintroduce
// that, and look fine on the machine of whoever added it.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'src');

// The icon files are the SVG artwork itself; their README names the emoji they replace.
const SKIP_DIRS = new Set(['icons']);

// Text symbols that are deliberately still text. They render from the page's own
// fonts rather than the OS emoji font, so they do not drift between platforms.
const ALLOWED = new Map([['✕', 'VideoModal close button']]);

const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu;

const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return SKIP_DIRS.has(entry) ? [] : walk(path);
    return [path];
  });

const findings = [];
for (const path of walk(SRC)) {
  readFileSync(path, 'utf8')
    .split('\n')
    .forEach((line, index) => {
      for (const match of line.matchAll(EMOJI)) {
        if (ALLOWED.has(match[0])) continue;
        findings.push(`${relative(ROOT, path)}:${index + 1}  ${match[0]}`);
      }
    });
}

if (findings.length) {
  console.error(`Raw emoji in src/ (${findings.length}):\n  ${findings.join('\n  ')}\n`);
  console.error('Use an icon from the sprite instead: <Emoji name="pumpkin" />, or');
  console.error('"icon": "pumpkin" in src/data/*.json. See src/icons/emoji/README.md');
  console.error('for adding a glyph the sprite does not carry yet.');
  process.exit(1);
}

console.log(`No raw emoji in src/ (${ALLOWED.size} allowed text symbol kept).`);
