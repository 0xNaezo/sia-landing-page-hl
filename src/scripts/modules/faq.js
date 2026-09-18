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
}
