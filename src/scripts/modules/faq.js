import { onAction } from '../lib/actions.js';

/** FAQ accordion: one item open at a time. */
export function initFaq() {
  onAction('faq-toggle', (btn) => {
    const item = btn.closest('.faq-item');
    if (!item) return;
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach((e) => e.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
  initSpider();
}

/**
 * Spider on the corner web. Scroll only sets its target: --p on .faq-line is the furthest
 * the section has climbed, from the bottom edge of the viewport (0) to 10% of its height
 * (1), and never goes back. faq.css transitions --p, so the spider crawls to the target
 * at its own pace, and turns it into the descent, the thread and the leg gait. `.landed`
 * once it arrives at 1 plays the bounce, then the swing and twirl.
 */
function initSpider() {
  const line = document.querySelector('.faq-line');
  if (!line || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const section = line.closest('section');
  let target = -1;
  const update = () => {
    const vh = window.innerHeight;
    const p = Math.min(1, Math.max(0, (vh - section.getBoundingClientRect().top) / (vh * 0.9)));
    if (p <= target) return;
    target = p;
    line.style.setProperty('--p', p.toFixed(4));
  };
  const settle = () => {
    if (target >= 1) line.classList.add('landed');
  };
  line.addEventListener('transitionend', (e) => {
    if (e.propertyName === '--p') settle();
  });
  // First position without the crawl (from the rest pose it would climb up on load), then live.
  update();
  settle();
  void line.offsetWidth;
  line.classList.add('live');
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
}
