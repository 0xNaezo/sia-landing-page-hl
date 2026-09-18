import { onAction } from '../lib/actions.js';

/** "Watch our story" YouTube modal. The trigger carries the embed URL in `data-video-src`. */
export function initVideo() {
  const overlay = document.getElementById('vid-overlay');
  const frame = document.getElementById('vid-frame');
  if (!overlay || !frame) return;

  function open(src) {
    frame.src = src;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    frame.src = '';
  }

  onAction('video-open', (el) => open(el.dataset.videoSrc));
  onAction('video-close', (el, event) => {
    // Clicking inside the player box must not close the modal, only the backdrop or the × button.
    if (el === overlay && event.target !== overlay) return;
    close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}
