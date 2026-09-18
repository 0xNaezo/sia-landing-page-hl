import { onAction } from '../lib/actions.js';

const AUTOPLAY_MS = 5500;

/** Testimonials slider with dots, arrows and autoplay (paused on hover). */
export function initTestimonials() {
  const track = document.getElementById('ttrack');
  if (!track) return;
  const cards = track.querySelectorAll('.tcard');
  const dots = document.querySelectorAll('.tdot');
  const total = cards.length;
  if (!total) return;
  let slide = 0;

  function update() {
    const w = cards[0].offsetWidth;
    track.style.transform = `translateX(-${slide * w}px)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === slide));
  }
  function go(n) {
    slide = (n + total) % total;
    update();
  }
  const next = () => go(slide + 1);

  onAction('testi-go', (el) => go(Number(el.dataset.index)));
  onAction('testi-next', next);
  onAction('testi-prev', () => go(slide - 1));

  let timer = setInterval(next, AUTOPLAY_MS);
  const wrap = document.querySelector('.testi-wrap');
  if (wrap) {
    wrap.addEventListener('mouseenter', () => clearInterval(timer));
    wrap.addEventListener('mouseleave', () => {
      timer = setInterval(next, AUTOPLAY_MS);
    });
  }
  window.addEventListener('resize', update);
}
