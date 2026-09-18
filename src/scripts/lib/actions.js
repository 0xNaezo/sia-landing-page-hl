/**
 * Tiny event-delegation helper.
 *
 * Markup declares intent with `data-action="name"` (plus any extra data-* attributes),
 * modules register a handler for that name. One document-level listener serves all of them,
 * so no inline `onclick` handlers and no globals are needed.
 *
 * Elements that are not real <button>s but carry `role="button" tabindex="0"` are also
 * activated by Enter/Space, so keyboard users get what the ARIA role promises.
 */
const handlers = new Map();
let bound = false;

// Controls the browser already activates from the keyboard by itself: reacting to
// keydown for these too would run the handler twice.
const NATIVELY_ACTIVATABLE = 'button,a[href],input,select,textarea,[contenteditable]';

function resolve(event) {
  const { target } = event;
  // A synthetic event retargeted to `document` has no `closest`.
  if (!target || typeof target.closest !== 'function') return null;
  const el = target.closest('[data-action]');
  return el && handlers.has(el.dataset.action) ? el : null;
}

function onClick(event) {
  const el = resolve(event);
  if (el) handlers.get(el.dataset.action)(el, event);
}

function onKeydown(event) {
  if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return;
  if (event.repeat) return;
  const { target } = event;
  if (!target || typeof target.closest !== 'function') return;
  if (target.closest(NATIVELY_ACTIVATABLE)) return;
  const el = resolve(event);
  if (!el) return;
  event.preventDefault(); // Space would otherwise scroll the page
  handlers.get(el.dataset.action)(el, event);
}

export function onAction(name, handler) {
  handlers.set(name, handler);
  if (!bound) {
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeydown);
    bound = true;
  }
}
