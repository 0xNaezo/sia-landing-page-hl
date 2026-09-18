import { onAction } from '../lib/actions.js';

/** Activity cards become a tap-to-expand accordion on mobile. */
function bindCards(panel) {
  panel.querySelectorAll('.acard').forEach((card) => {
    if (card.dataset.bound) return;
    card.dataset.bound = '1';
    card.addEventListener('click', () => {
      const wasOpen = card.classList.contains('mob-open');
      panel.querySelectorAll('.acard.mob-open').forEach((c) => c.classList.remove('mob-open'));
      if (!wasOpen) card.classList.add('mob-open');
    });
  });
}

/** Activities section: tab switching + card accordion. */
export function initActivities() {
  const panels = document.querySelectorAll('.act-panel');
  if (!panels.length) return;
  panels.forEach(bindCards);

  onAction('act-tab', (btn) => {
    const panel = document.getElementById('p-' + btn.dataset.tab);
    if (!panel) return;
    document.querySelectorAll('.act-tab').forEach((t) => t.classList.remove('active'));
    panels.forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    panel.classList.add('active');
    bindCards(panel);
  });
}
