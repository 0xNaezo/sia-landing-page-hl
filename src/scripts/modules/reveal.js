/**
 * Fade-up reveal for `.reveal` elements when they enter the viewport. The footer
 * `.horizon` rides along: it gets the same `.visible`, which lights its lamps, and so
 * does `.seam`, which draws its spiral.
 */
export function initReveal() {
  const els = document.querySelectorAll('.reveal, .horizon, .seam');
  const show = (el) => el.classList.add('visible');

  // No observer, or the visitor asked for less motion: just show everything.
  if (
    !('IntersectionObserver' in window) ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    els.forEach(show);
    return;
  }

  // Only now is anything allowed to start hidden — see .reveal-ready in
  // styles/animations.css. Until this line runs the content is plain visible,
  // so a blocked or broken bundle can never blank the page.
  document.documentElement.classList.add('reveal-ready');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        show(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
  );
  els.forEach((el) => observer.observe(el));
}
