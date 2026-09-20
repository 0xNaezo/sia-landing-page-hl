export default {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
          cleanupNumericValues: { floatPrecision: 2 },
          convertPathData: { floatPrecision: 2 },
        },
      },
    },
    // Noto ships Illustrator ids (SVGID_1_, eyes, mouth) that repeat across files.
    // Inlined into one sprite document they would collide, so namespace per file.
    { name: 'prefixIds', params: { delim: '-' } },
  ],
};
