import { onAction } from '../lib/actions.js';

/** Sticky nav background on scroll + mobile menu toggle. */
export function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  window.addEventListener(
    'scroll',
    () => nav.classList.toggle('scrolled', window.scrollY > 40),
    { passive: true },
  );

  const menu = document.getElementById('mobmenu');
  if (!menu) return;
  onAction('nav-toggle', () => menu.classList.toggle('open'));
  onAction('nav-close', () => menu.classList.remove('open'));
}
