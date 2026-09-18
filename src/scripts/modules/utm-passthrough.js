/**
 * Forward the landing page's query string (UTM parameters etc.) to every
 * outbound sia.ie link, so campaign attribution survives the hop to the
 * booking site.
 */
function mergeParams(href, landingParams) {
  const base = href.split('?')[0];
  const origSearch = href.indexOf('?') !== -1 ? href.split('?')[1] : '';
  const merged = origSearch ? origSearch + '&' + landingParams : landingParams;
  return base + '?' + merged;
}

function isDecoratable(href) {
  return href && href.indexOf('mailto:') !== 0 && href.indexOf('tel:') !== 0;
}

export function initUtmPassthrough() {
  const params = window.location.search;
  if (!params || params.length <= 1) return; // nothing to pass through
  const landingParams = params.substring(1);

  function decorateLinks() {
    document.querySelectorAll('a[href*="sia.ie"]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!isDecoratable(href)) return;
      link.setAttribute('href', mergeParams(href, landingParams));
    });
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
      const link = e.target.closest ? e.target.closest('a[href*="sia.ie"]') : null;
      if (!link) return;
      const href = link.getAttribute('href');
      if (!isDecoratable(href)) return;
      const origSearch = href.indexOf('?') !== -1 ? href.split('?')[1] : '';
      if (origSearch.indexOf(landingParams) === -1) {
        link.setAttribute('href', mergeParams(href, landingParams));
      }
    },
    true,
  );
}
