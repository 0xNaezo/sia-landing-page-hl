import { onAction } from '../lib/actions.js';

/**
 * Cookie consent banner + preferences modal (Google Consent Mode v2).
 *
 * The consent *defaults* are set by the inline script in the <head> (it must run
 * before GTM loads). This module only handles the UI and sends `consent update`.
 * Both places read/write the same localStorage key.
 */
const STORAGE_KEY = 'cookie_consent_v1';

function buildConsent(analytics, marketing) {
  return {
    // strictly necessary: always granted, never offered as a toggle
    functionality_storage: 'granted',
    security_storage: 'granted',
    // analytics toggle
    analytics_storage: analytics ? 'granted' : 'denied',
    // marketing toggle controls all three ads-related signals together
    ad_storage: marketing ? 'granted' : 'denied',
    ad_user_data: marketing ? 'granted' : 'denied',
    ad_personalization: marketing ? 'granted' : 'denied',
  };
}

function getSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function gtag() {
  if (typeof window.gtag === 'function') window.gtag.apply(null, arguments);
  else (window.dataLayer = window.dataLayer || []).push(arguments);
}

export function initCookieConsent() {
  const banner = document.getElementById('cc-banner');
  const modal = document.getElementById('cc-modal');
  if (!banner || !modal) return;
  const toggleAnalytics = document.getElementById('cc-toggle-analytics');
  const toggleMarketing = document.getElementById('cc-toggle-marketing');

  function apply(consent) {
    gtag('consent', 'update', consent);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch {
      /* storage unavailable (private mode etc.) */
    }
    banner.classList.remove('show');
    modal.classList.remove('show');
  }

  function openModal() {
    const saved = getSaved();
    toggleAnalytics.checked = saved ? saved.analytics_storage === 'granted' : false;
    toggleMarketing.checked = saved ? saved.ad_storage === 'granted' : false;
    modal.classList.add('show');
  }

  onAction('cc-accept', () => apply(buildConsent(true, true)));
  onAction('cc-reject', () => apply(buildConsent(false, false)));
  onAction('cc-manage', openModal);
  onAction('cc-close', () => modal.classList.remove('show'));
  onAction('cc-save', () => apply(buildConsent(toggleAnalytics.checked, toggleMarketing.checked)));

  // Show the banner only if the user hasn't made a choice yet.
  if (!getSaved()) banner.classList.add('show');

  // Public hook so a footer link or GTM tag can reopen the preferences later.
  window.ccReopenPreferences = openModal;
}
