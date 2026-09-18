/**
 * Lock the hero height on small screens so the background photo does not
 * resize/jump when the mobile browser chrome shows or hides during scroll.
 */
export function initHero() {
  const hero = document.getElementById('home');
  if (!hero) return;

  function lockHeroHeight() {
    if (window.innerWidth <= 480) {
      hero.style.height = window.innerHeight + 'px';
      hero.style.minHeight = 'auto';
    } else {
      hero.style.height = '';
      hero.style.minHeight = '';
    }
  }

  let lastWidth = window.innerWidth;
  lockHeroHeight();
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastWidth) return; // ignore height-only changes (address bar)
    lastWidth = window.innerWidth;
    lockHeroHeight();
  });
}
