// Client-side entry point. Astro bundles this as a deferred ES module,
// so the DOM is already parsed when it runs. Each module is self-contained
// and no-ops when its markup is not on the page.
import { initNav } from './modules/nav.js';
import { initHero } from './modules/hero.js';
import { initReveal } from './modules/reveal.js';
import { initCounters } from './modules/counters.js';
import { initVideo } from './modules/video.js';
import { initSchedule } from './modules/schedule.js';
import { initActivities } from './modules/activities.js';
import { initTestimonials } from './modules/testimonials.js';
import { initMarquee } from './modules/marquee.js';
import { initGallery } from './modules/gallery.js';
import { initFaq } from './modules/faq.js';
import { initCookieConsent } from './modules/cookie-consent.js';
import { initUtmPassthrough } from './modules/utm-passthrough.js';

initNav();
initHero();
initReveal();
initCounters();
initVideo();
initSchedule();
initActivities();
initTestimonials();
initMarquee();
initGallery();
initFaq();
initCookieConsent();
initUtmPassthrough();
