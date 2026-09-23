// Generates the path data of the two boughs on the #pricing/#founder seam (components/sections/Founder.astro).
// Run `node tools/boughs.mjs` and paste the paths over the ones in .found-branch / .found-rim by hand.
// Designed in page px: x from the viewport centre, y from the seam; printed shifted into the 3000x120 box
// (x+1500, y+60). `hookUnder` checks the left bough's underside stays flat where the lantern can hang;
// `jackTop` / `batUnder` are where the pumpkin sits and the bat hangs (box coordinates).
const OX = 1500, OY = 60;
const f = (n) => Math.round(n * 10) / 10;
const lerpTable = (tbl, t) => {
  if (t <= tbl[0][0]) return tbl[0][1];
  for (let i = 1; i < tbl.length; i++) if (t <= tbl[i][0]) {
    const [t0, v0] = tbl[i - 1], [t1, v1] = tbl[i];
    const u = (t - t0) / (t1 - t0), s = u * u * (3 - 2 * u); // smoothstep between keys
    return v0 + (v1 - v0) * s;
  }
  return tbl[tbl.length - 1][1];
};

// quadratic-through-midpoints smoothing of a polyline (open)
function smooth(pts, move = true) {
  let d = (move ? 'M' : 'L') + f(pts[0][0] + OX) + ' ' + f(pts[0][1] + OY);
  for (let i = 1; i < pts.length - 1; i++) {
    const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2];
    d += 'Q' + f(pts[i][0] + OX) + ' ' + f(pts[i][1] + OY) + ' ' + f(m[0] + OX) + ' ' + f(m[1] + OY);
  }
  const l = pts[pts.length - 1];
  return d + 'L' + f(l[0] + OX) + ' ' + f(l[1] + OY);
}

// limb: centreline c(s) and width w(s) for s∈[0,1] base→tip. Returns the closed outline and both edges
function limb(c, w, n, bumps = []) {
  const top = [], bot = [];
  for (let i = 0; i <= n; i++) {
    const s = i / n, p = c(s), q = c(Math.min(1, s + 1e-3)), r = c(Math.max(0, s - 1e-3));
    let tx = q[0] - r[0], ty = q[1] - r[1]; const L = Math.hypot(tx, ty); tx /= L; ty /= L;
    let nx = -ty, ny = tx; if (ny > 0) { nx = -nx; ny = -ny; } // normal, always pointing up
    // bumps: [s, width, amplitude, side] — side 1 = top only, -1 = bottom only, 0 = both
    const bt = bumps.reduce((a, [bs, bw, amp, side]) => a + (side !== -1 ? Math.exp(-(((s - bs) / bw) ** 2)) * amp : 0), 0);
    const bb = bumps.reduce((a, [bs, bw, amp, side]) => a + (side !== 1 ? Math.exp(-(((s - bs) / bw) ** 2)) * amp : 0), 0);
    top.push([p[0] + nx * (w(s) / 2 + bt), p[1] + ny * (w(s) / 2 + bt)]);
    bot.push([p[0] - nx * (w(s) / 2 + bb), p[1] - ny * (w(s) / 2 + bb)]);
  }
  // closed outline: top base→tip, bottom tip→base
  const fill = smooth(top.concat([...bot].reverse())) + 'Z';
  return { fill, top, bot };
}

// ── stems ──
// y(x) through hand-placed nodes (Catmull-Rom): the bends sit at the nodes, like a real bough that
// changes direction where a twig sprang
const spline = (nodes) => (x) => {
  const N = [...nodes].sort((a, b) => a[0] - b[0]);
  let i = 0; while (i < N.length - 2 && x > N[i + 1][0]) i++;
  const p0 = N[Math.max(0, i - 1)], p1 = N[i], p2 = N[i + 1], p3 = N[Math.min(N.length - 1, i + 2)];
  const u = (x - p1[0]) / (p2[0] - p1[0]);
  const m1 = (p2[1] - p0[1]) / (p2[0] - p0[0]) * (p2[0] - p1[0]), m2 = (p3[1] - p1[1]) / (p3[0] - p1[0]) * (p2[0] - p1[0]);
  const u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * p1[1] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * p2[1] + (u3 - u2) * m2;
};
const wobble = (x, seed) => 0.7 * Math.sin(x / 83 + seed) + 0.4 * Math.sin(x / 37 + seed * 2.3);
const stemW = [[0, 1.6], [80, 3.2], [200, 5.2], [400, 9], [650, 15], [900, 20], [1200, 24], [1600, 27]];
const SPAN = 1595;

// left: base at x=-1500 (off screen), tip at x=+95. Higher than the right; flat under the hook zone
// (x -570..-392, where the lantern hangs at every viewport width)
const yL = spline([[-1500, -46], [-1180, -38], [-940, -27], [-690, -17], [-560, -9.5], [-400, -8.5], [-250, -13], [-120, -8], [0, -1], [60, 3], [95, 1]]);
const cL = (x) => yL(x) + (x < -600 || x > -360 ? wobble(x, 1) * Math.min(1, Math.max(0, -x / 120)) : 0);
const L = limb((s) => { const x = -1500 + s * SPAN; return [x, cL(x)]; }, (s) => lerpTable(stemW, (1 - s) * SPAN), 56,
  [[(-690 + 1500) / SPAN, 0.012, 1.6, 1], [(-250 + 1500) / SPAN, 0.012, 1.2, 1], [(-900 + 1500) / SPAN, 0.012, 1.6, -1], [(-1150 + 1500) / SPAN, 0.03, 1.8, 0]]);

// right: base at x=+1500, tip at x=-95; comes in lower and sags at +440 before rising to meet the left.
// Slimmer than the left and tapering harder, so it does not read as a beam, and it frays into thin twigs
// near the centre instead of ending on one point
const stemWR = [[0, 1.3], [60, 2.2], [160, 3.6], [300, 5.8], [500, 8.8], [750, 12], [1000, 14.5], [1600, 18]];
const wR = (x) => lerpTable(stemWR, x + 95);
const yR = spline([[-95, -4], [-50, -1], [0, 2], [150, 5], [300, 8], [440, 13], [560, 11], [760, 2], [960, -12], [1200, -28], [1500, -36]]);
const cR = (x) => yR(x) + wobble(x, 4) * Math.min(1, Math.max(0, x / 120));
const R = limb((s) => { const x = 1500 - s * SPAN; return [x, cR(x)]; }, (s) => wR(1500 - s * SPAN), 56,
  [[(1500 - 300) / SPAN, 0.012, 1.4, 1], [(1500 - 660) / SPAN, 0.012, 1.4, 1], [(1500 - 830) / SPAN, 0.012, 1.6, -1], [(1500 - 1050) / SPAN, 0.03, 1.8, 0]]);

// ── twigs: quadratic centreline from a base on the stem's centreline; control and tip relative to it ──
const q = (a, b, c) => (s) => [(1 - s) ** 2 * a[0] + 2 * (1 - s) * s * b[0] + s * s * c[0], (1 - s) ** 2 * a[1] + 2 * (1 - s) * s * b[1] + s * s * c[1]];
const twigAt = (a, b, t, w0, n) => limb(q(a, [a[0] + b[0], a[1] + b[1]], [a[0] + t[0], a[1] + t[1]]), (s) => w0 * (1 - s) + 1.2 * s, n).fill;
const twig = (c, x, b, t, w0, n = 10) => twigAt([x, c(x)], b, t, w0, n);
const twigs = [
  // left bough: point towards the centre and up
  twig(cL, -690, [30, -32], [92, -52], 8, 12),
  twigAt([-656, cL(-690) - 26], [8, -14], [22, -36], 3.4, 8), // fork off the one above, from its middle
  twig(cL, -250, [24, -20], [70, -32], 5.5, 10),
  twig(cL, -900, [18, 14], [36, 22], 6, 5), // stub below
  // right bough
  twig(cR, 300, [-32, -28], [-92, -46], 6.5, 12),
  twigAt([266, cR(300) - 23.5], [-6, -12], [-2, -32], 3, 8),
  twig(cR, 660, [-26, -22], [-66, -36], 6, 10),
  twig(cR, 830, [-18, 12], [-30, 20], 5.5, 5), // stub below
  // the right bough's frayed end
  twig(cR, 170, [-40, -12], [-118, -24], 3.4, 10),
  twig(cR, 95, [-24, 6], [-64, 11], 2.4, 8),
  twig(cR, 40, [-12, -8], [-30, -20], 1.8, 6),
];

// the pumpkin sits on the right bough's top edge at +420 (inside the viewport down to 1025px); the bat hangs
// from its underside at +360, between it and the centre
const jackX = 420, jackTop = cR(jackX) - wR(jackX) / 2;
const batX = 360, batUnder = cR(batX) + wR(batX) / 2;
const nearJack = R.top.filter(([x]) => x > 260 && x < 580);

console.log(JSON.stringify({
  branch: [L.fill, R.fill, ...twigs],
  rimL: smooth(L.bot),
  rimJack: smooth(nearJack),
  hookUnder: [-392, -440, -480, -520, -570].map((x) => { const i = L.bot.reduce((b, p, j) => Math.abs(p[0] - x) < Math.abs(L.bot[b][0] - x) ? j : b, 0); return [x, f(L.bot[i][1])]; }),
  jackTop: [jackX + OX, f(jackTop + OY)],
  batUnder: [batX + OX, f(batUnder + OY)],
}, null, 1));
