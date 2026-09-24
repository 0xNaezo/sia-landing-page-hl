const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Header Halloween decor: the spider on the book button (the logo's hat is CSS only). */
export function initNavDecor() {
  initSpider();
}

/**
 * Spider on the book button (nav.css has the motion): drops on hover, climbs back when the
 * pointer leaves, bolts up on click. Once per session it drops by itself a moment after load
 * so it gets noticed; on touch screens, with no hover, that is its only appearance and it
 * hangs there until the button is tapped.
 */
function initSpider() {
  const spider = document.querySelector('.nav-spider');
  const book = document.querySelector('.nav-book');
  if (!spider || !book) return;
  const drop = (on) => spider.classList.toggle('drop', on);

  book.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'touch') return;
    spider.classList.remove('fled');
    drop(true);
  });
  book.addEventListener('pointerleave', () => {
    spider.classList.remove('fled');
    drop(false);
  });
  book.addEventListener('click', () => {
    drop(false);
    spider.classList.add('fled');
  });

  if (reducedMotion() || !book.offsetWidth) return; // no teaser, or the button is in the burger menu
  try {
    if (sessionStorage.getItem('sia-spider-teased')) return;
    sessionStorage.setItem('sia-spider-teased', '1');
  } catch {
    // storage blocked: tease on every load
  }
  const touch = window.matchMedia('(hover: none)').matches;
  setTimeout(() => {
    drop(true);
    if (!touch) setTimeout(() => book.matches(':hover') || drop(false), 2800);
  }, 2000);
}
