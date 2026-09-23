import { leaf, rib, spiral } from '../lib/vine.js';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Header Halloween decor: the pumpkin garland under the bar, the spider on the book button. */
export function initNavDecor() {
  initGarland();
  initSpider();
}

/**
 * Garland: swags from the left edge, one pumpkin per swag, 2-3 on a phone and up to 6 on
 * desktop, then a short bare swag that climbs steeply and is tied round the book button's
 * bottom-left corner, clear of the middle of its bottom edge where the spider's thread hangs.
 * With the button hidden (burger menu) it runs to the right edge instead. Drawn in real
 * pixels, like the schedule vine, so leaves and tendrils keep their shape at any width;
 * redrawn whenever the bar or the button changes size (resize, web fonts).
 */
function initGarland() {
  const garland = document.querySelector('.garland');
  if (!garland) return;
  const nav = garland.parentElement;
  const book = nav.querySelector('.nav-book');
  const line = garland.querySelector('.garland-line');
  const leaves = garland.querySelector('.garland-leaf');
  const pumpkins = [...garland.querySelectorAll('.garland-pumpkin')];
  const sags = [1, 0.86, 1.06, 0.92, 1.02, 0.88]; // uneven, as if hung by hand
  const Y = 2; // attachment points, just under the bar's bottom edge
  const TAIL = 90; // length of the last swag, the one tied to the button

  const draw = () => {
    const bar = nav.getBoundingClientRect();
    const b = book && book.getBoundingClientRect();
    const tied = b && b.width > 0;
    const sag = bar.width > 480 ? 13 : 10; // keeps the whole garland about half the bar's height
    const end = tied ? b.left - bar.left - TAIL : bar.width;
    const n = Math.min(pumpkins.length, Math.max(2, Math.round(end / 150)));
    const span = end / n;
    let d = '';
    let f = '';
    for (let i = 0; i <= n; i++) {
      const x = i * span;
      const s = i % 2 ? 1 : -1;
      // knot: a leaf up one side, one down the other, a tendril on every other knot
      d += `M${x - 1.2} ${Y}a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0`;
      d += rib(x, Y, s) + leaf(x, Y, s) + rib(x, Y, -s, -1) + leaf(x, Y, -s, -1);
      f += leaf(x, Y, s) + leaf(x, Y, -s, -1);
      if (i % 2) d += spiral(x + s, Y + 2, s);
      if (i === n) break;
      const mx = x + span / 2;
      const my = sag * sags[i];
      d += `M${x} ${Y}Q${mx} ${2 * my - Y} ${x + span} ${Y}`; // vertex at (mx, my)
      pumpkins[i].style.left = `${mx}px`;
      pumpkins[i].style.top = `${my}px`;
    }
    if (tied) {
      // the corner, in garland coordinates (0 = the bar's bottom edge): sag, then straight up
      // into it across the bar's edge; two turns lashed across the corner, a leaf either side
      // and a tendril hanging below, all within the corner and clear of the label
      const cx = b.left - bar.left;
      const cy = b.bottom - bar.bottom;
      d += `M${end} ${Y}C${end + TAIL * 0.45} ${Y + sag * 1.9} ${cx - 2} ${Y + sag * 1.2} ${cx + 3} ${cy - 3}`;
      d += [7, 12].map((r) => `M${cx + r + 1.5} ${cy + 1.5}L${cx - 1.5} ${cy - r - 1.5}`).join('');
      d += rib(cx - 1, cy + 1, -1) + leaf(cx - 1, cy + 1, -1) + rib(cx + 2, cy + 2, 1, -1) + leaf(cx + 2, cy + 2, 1, -1);
      f += leaf(cx - 1, cy + 1, -1) + leaf(cx + 2, cy + 2, 1, -1);
      d += spiral(cx - 2, cy + 9, -1);
    }
    pumpkins.forEach((p, i) => (p.hidden = i >= n));
    line.setAttribute('d', d);
    leaves.setAttribute('d', f);
    garland.classList.add('ready');
  };
  const ro = new ResizeObserver(draw);
  ro.observe(nav);
  if (book) ro.observe(book);

  if (!reducedMotion()) sway(pumpkins);
}

/**
 * Scroll sway: every pumpkin is a damped pendulum pushed by the scroll speed, so it leans
 * while the page moves and swings itself calm once it stops. A couple of degrees at most;
 * slightly different lengths keep them out of step. The loop only runs while something moves.
 */
function sway(pumpkins) {
  const bobs = pumpkins.map((el, i) => ({ el, a: 0, v: 0, k: (5 + i * 0.35) ** 2 }));
  let raf = 0;
  let lastY = window.scrollY;
  let lastT = 0;
  const step = (t) => {
    const dt = lastT ? Math.min((t - lastT) / 1000, 0.05) : 1 / 60;
    const speed = Math.max(-3000, Math.min(3000, (window.scrollY - lastY) / dt)); // px/s
    lastT = t;
    lastY = window.scrollY;
    let moving = speed !== 0;
    for (const b of bobs) {
      b.v += (0.035 * speed - b.k * b.a - 1.4 * b.v) * dt;
      b.a = Math.max(-3, Math.min(3, b.a + b.v * dt));
      b.el.style.rotate = `${b.a.toFixed(2)}deg`;
      if (Math.abs(b.a) > 0.02 || Math.abs(b.v) > 0.05) moving = true;
    }
    raf = moving ? requestAnimationFrame(step) : 0;
    if (!raf) lastT = 0;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!raf) raf = requestAnimationFrame(step);
    },
    { passive: true },
  );
}

/**
 * Spider on the book button (nav.css has the motion): drops on hover, climbs back when the
 * pointer leaves, bolts up on click. Once per session it drops by itself a moment after load
 * so it gets noticed; on touch screens, with no hover, that is its only appearance and it
 * hangs there until the button is tapped.
 */
function initSpider() {
  const spider = document.querySelector('.nav-spider');
  const book = document.querySelector('.nav-book');
  if (!spider || !book) return;
  const drop = (on) => spider.classList.toggle('drop', on);

  book.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'touch') return;
    spider.classList.remove('fled');
    drop(true);
  });
  book.addEventListener('pointerleave', () => {
    spider.classList.remove('fled');
    drop(false);
  });
  book.addEventListener('click', () => {
    drop(false);
    spider.classList.add('fled');
  });

  if (reducedMotion() || !book.offsetWidth) return; // no teaser, or the button is in the burger menu
  try {
    if (sessionStorage.getItem('sia-spider-teased')) return;
    sessionStorage.setItem('sia-spider-teased', '1');
  } catch {
    // storage blocked: tease on every load
  }
  const touch = window.matchMedia('(hover: none)').matches;
  setTimeout(() => {
    drop(true);
    if (!touch) setTimeout(() => book.matches(':hover') || drop(false), 2800);
  }, 2000);
}
