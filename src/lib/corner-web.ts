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

export interface HeroWeb {
  /** one path per radial */
  radials: string[];
  /** one path per ring, then the torn thread left hanging */
  rings: string[];
  /** dew drops, on ring/radial intersections */
  dew: [number, number][];
}

/**
 * The hero's corner web (viewBox 400x440, centre at 0,0). Unlike `cornerWeb` this one is
 * split into groups so the stylesheet can weight and animate the radials and the rings
 * apart. It is an even fan across the whole quadrant — seven radials of roughly equal
 * reach and seven rings whose spacing only grows 1.1x a step, so the mesh stays dense out
 * to the rim instead of opening up into a spike. The irregularity is small on purpose
 * (a few degrees on the radials, a few percent on each ring), with two torn segments and
 * one thread left hanging. The threads down the left edge run longest, into the rim fade. Threads do run over the logo; the CSS mask punches them out.
 */
export function heroWeb(seed = 12): HeroWeb {
  const rnd = rng(seed);
  const ang = [0, 13, 27, 42, 58, 73, 90].map((d) => (d * Math.PI) / 180);
  const len = [312, 322, 318, 332, 340, 372, 404];
  // seven rings, each gap 1.1x the one before it, the outermost at 0.9 of each radial
  const t: number[] = [];
  for (let k = 0, gap = 1, sum = 0, total = 9.487; k < 7; k++, gap *= 1.1) t.push(((sum += gap) / total) * 0.9);
  // per-ring, per-radial wobble, so no ring closes as a clean arc
  const wob = t.map(() => ang.map(() => 0.97 + rnd() * 0.06));
  const pt = (i: number, k: number): [number, number] => {
    const d = len[i] * t[k] * wob[k][i];
    return [f(Math.cos(ang[i]) * d), f(Math.sin(ang[i]) * d)];
  };

  const radials = ang.map((a, i) => `M0 0L${f(Math.cos(a) * len[i])} ${f(Math.sin(a) * len[i])}`);

  // torn segments, `ring-radial`, outer rings only; 5-5 is the one the hanging thread drops from
  const torn = new Set(['6-2', '5-5']);
  const rings = t.map((_, k) => {
    let d = '';
    for (let i = 0; i < ang.length - 1; i++) {
      if (torn.has(`${k}-${i}`)) continue;
      const [x1, y1] = pt(i, k);
      const [x2, y2] = pt(i + 1, k);
      const sag = 0.085 * (0.8 + rnd() * 0.4); // arcs bow back towards the centre, depth +/-20%
      d += `M${x1} ${y1}Q${f(((x1 + x2) / 2) * (1 - sag))} ${f(((y1 + y2) / 2) * (1 - sag))} ${x2} ${y2}`;
    }
    return d;
  });
  const [hx, hy] = pt(5, 5);
  rings.push(`M${hx} ${hy}Q${f(hx + 7)} ${f(hy + 34)} ${f(hx - 9)} ${f(hy + 60)}`);

  const dew: [number, number][] = [
    [1, 1], [3, 2], [5, 3], [2, 4], [6, 3], [4, 5], [0, 2], [6, 5], [2, 6],
  ].map(([i, k]) => pt(i, k));

  return { radials, rings, dew };
}
