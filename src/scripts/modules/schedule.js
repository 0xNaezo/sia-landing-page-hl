import { leaf, rib, spiral } from '../lib/vine.js';

/** Schedule timeline: cards expand on tap (mobile accordion, see mobile.css). */
export function initSchedule() {
  document.querySelectorAll('.stl-card').forEach((card) => {
    card.addEventListener('click', () => card.classList.toggle('expanded'));
  });

  // Vine: drawn in real pixels through the pumpkin centres, so it ends on the
  // final node and its leaves/tendrils keep their shape at any card height.
  // Redrawn on any reflow (web fonts, resize, accordion toggles).
  const vine = document.querySelector('.stl-vine');
  const dots = document.querySelectorAll('.stl-dot');
  if (!vine || !dots.length) return;
  const line = vine.querySelector('.stl-vine-line');
  const leaves = vine.querySelector('.stl-vine-leaf');
  const X = 11; // centre of the 22px-wide svg
  const centre = (el) => el.offsetTop + el.offsetHeight / 2;

  const draw = () => {
    const ys = [...dots].map(centre);
    const top = ys[0];
    vine.style.top = `${top}px`;
    vine.style.height = `${ys[ys.length - 1] - top}px`;
    let d = '';
    let f = '';
    for (let i = 1; i < ys.length; i++) {
      const y0 = ys[i - 1] - top;
      const h = ys[i] - ys[i - 1];
      const s = i % 2 ? 1 : -1; // S-bend direction alternates per gap
      d += `M${X} ${y0}C${X - 12 * s} ${y0 + h * 0.35} ${X + 12 * s} ${y0 + h * 0.65} ${X} ${y0 + h}`;
      if (i % 2 === 0) d += spiral(X - 3 * s, y0 + h * 0.3, -s); // tendril on every other gap
      const lx = X + 2.8 * s;
      const ly = y0 + h * 0.68;
      d += rib(lx, ly, s) + leaf(lx, ly, s);
      f += leaf(lx, ly, s);
    }
    line.setAttribute('d', d);
    leaves.setAttribute('d', f);
  };
  new ResizeObserver(draw).observe(vine.parentElement);
}
