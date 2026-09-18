/**
 * Tiny event-delegation helper.
 *
 * Markup declares intent with `data-action="name"` (plus any extra data-* attributes),
 * modules register a handler for that name. One document-level listener serves all of them,
 * so no inline `onclick` handlers and no globals are needed.
 */
const handlers = new Map();
let bound = false;

function dispatch(event) {
  const el = event.target.closest('[data-action]');
  if (!el) return;
  const handler = handlers.get(el.dataset.action);
  if (handler) handler(el, event);
}

export function onAction(name, handler) {
  handlers.set(name, handler);
  if (!bound) {
    document.addEventListener('click', dispatch);
    bound = true;
  }
}
