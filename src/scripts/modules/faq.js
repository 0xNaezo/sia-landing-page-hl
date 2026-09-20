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

/** Spider on the corner web: `.drop` lowers it down its thread once it scrolls into view (faq.css). */
function initSpider() {
  const line = document.querySelector('.faq-line');
  if (!line) return;
  new IntersectionObserver(
    (entries, io) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      line.classList.add('drop');
      io.disconnect();
    },
    { threshold: 0.4 },
  ).observe(line);
}
