// Deterministic corner spider web as SVG path data, fanning out of (0,0) into the
// +x/+y quadrant: spokes from the origin, rings whose spacing grows outwards, arcs
// sagging towards the corner, the odd torn segment. Same seed → same web, so every
// call site gets its own shape by picking a seed. Mirror with scale(-1,1) for a
// right-hand corner.

/** mulberry32 */
const rng = (a: number) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const f = (n: number) => +n.toFixed(1);

export interface CornerWebOptions {
  r?: number;
  spokes?: number;
  rings?: number;
  /** how far the ring arcs bow towards the corner, as a fraction of the chord midpoint */
  sag?: number;
  /** random angle offset of the inner spokes, radians */
  jitter?: number;
  seed?: number;
  /** explicit spoke lengths (overrides `r`) for an asymmetric fan */
  lengths?: number[];
}

export function cornerWeb({ r = 150, spokes = 6, rings = 5, sag = 0.18, jitter = 0.12, seed = 1, lengths }: CornerWebOptions = {}) {
  const rnd = rng(seed);
  const pt = (a: number, d: number) => [f(Math.cos(a) * d), f(Math.sin(a) * d)];
  const ang = Array.from({ length: spokes }, (_, i) =>
    (i / (spokes - 1)) * (Math.PI / 2) + (i && i < spokes - 1 ? (rnd() - 0.5) * jitter : 0),
  );
  const len = lengths ?? ang.map(() => r * (0.8 + rnd() * 0.25));
  let d = ang.map((a, i) => `M0 0L${pt(a, len[i]).join(' ')}`).join('');
  for (let k = 1; k <= rings; k++) {
    const t = (k / rings) ** 1.5; // ring spacing grows outwards
    for (let i = 0; i < spokes - 1; i++) {
      if (rnd() < 0.08) continue; // torn segment
      const [x1, y1] = pt(ang[i], len[i] * t);
      const [x2, y2] = pt(ang[i + 1], len[i + 1] * t);
      d += `M${x1} ${y1}Q${f(((x1 + x2) / 2) * (1 - sag))} ${f(((y1 + y2) / 2) * (1 - sag))} ${x2} ${y2}`;
    }
  }
  return d;
}
