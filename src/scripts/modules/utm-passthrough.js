/**
 * Forward the landing page's query string (UTM parameters etc.) to every
 * outbound sia.ie link, so campaign attribution survives the hop to the
 * booking site.
 */

/**
 * Merge the landing page's parameters into `href`'s query string.
 *
 * Parsed with `URL` so a fragment stays a fragment: `/summer-camps/#book`
 * becomes `/summer-camps/?utm_source=…#book`, not `…#book?utm_source=…`.
 * Parameters the link already declares win, and re-running this is a no-op.
 */
function mergeParams(href, landingParams) {
  try {
    const url = new URL(href, window.location.href);
    new URLSearchParams(landingParams).forEach((value, key) => {
      if (!url.searchParams.has(key)) url.searchParams.set(key, value);
    });
    return url.href;
  } catch {
    return href; // not a URL we can parse — leave it untouched
  }
}

function isDecoratable(href) {
  return href && href.indexOf('mailto:') !== 0 && href.indexOf('tel:') !== 0;
}

export function initUtmPassthrough() {
  const params = window.location.search;
  if (!params || params.length <= 1) return; // nothing to pass through
  const landingParams = params.substring(1);

  function decorate(link) {
    const href = link.getAttribute('href');
    if (!isDecoratable(href)) return;
    link.setAttribute('href', mergeParams(href, landingParams));
  }

  function decorateLinks() {
    document.querySelectorAll('a[href*="sia.ie"]').forEach(decorate);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', decorateLinks);
  } else {
    decorateLinks();
  }

  // Also decorate on click (catches any dynamically added links).
  document.addEventListener(
    'click',
    (e) => {
      const target = e.target;
      if (!target || typeof target.closest !== 'function') return;
      const link = target.closest('a[href*="sia.ie"]');
      if (link) decorate(link);
    },
    true,
  );
}
