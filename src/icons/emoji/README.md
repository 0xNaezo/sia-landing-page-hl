# Emoji icons

Colour emoji, as SVG, so a glyph looks the same on Windows, macOS and Android
instead of being rendered by whatever emoji font the visitor's OS ships.

**Source:** [googlefonts/noto-emoji](https://github.com/googlefonts/noto-emoji),
tag `v2.047`, directory `svg/` (`emoji_u<codepoint>.svg`).
**Licence:** Apache 2.0 — see `LICENSE`, copied verbatim from `svg/LICENSE`
upstream. Attribution in this file is enough; no visible credit is required on
the page.

Noto was picked over Twemoji and OpenMoji because it is the closest free match
to what most visitors already see (Android renders it directly, and Apple Color
Emoji shares its shaded, volumetric look), and because Apple's artwork cannot be
redistributed.

## Adding or replacing an icon

Files are named after what they depict, not after the codepoint — `src/data/*.json`
carries `"icon": "headstone"`, and `src/lib/emoji.ts` turns the file name into the
sprite id `#e-headstone`. Drop a new file in and it is in the sprite; nothing else
registers it.

Download and optimise with the same settings the existing files went through:

```bash
curl -O https://raw.githubusercontent.com/googlefonts/noto-emoji/v2.047/svg/emoji_u1f383.svg
npx svgo@3 emoji_u1f383.svg -o pumpkin.svg --config ../../../svgo.config.mjs
```

`prefixIds` in that config is not optional. Noto ships Illustrator ids (`SVGID_1_`,
`eyes`, `mouth`) that repeat across files; inlined into one sprite document they
collide and gradients start resolving against the wrong element.
