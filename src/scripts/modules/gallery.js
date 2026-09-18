import { onAction } from '../lib/actions.js';

/**
 * Gallery: lazy grid backgrounds, lightbox, "show more" toggle and the
 * mobile auto-advancing slideshow. The image list is read once from the
 * `.gal-item[data-src]` elements, so the markup is the single source of truth.
 */
export function initGallery() {
  const items = Array.from(document.querySelectorAll('.gal-item'));
  if (!items.length) return;
  const images = items.map((el) => el.dataset.src);

  // Set grid backgrounds once each image has actually loaded.
  items.forEach((item, i) => {
    const img = new Image();
    img.onload = () => {
      item.querySelector('.gal-img').style.backgroundImage = `url(${images[i]})`;
      item.setAttribute('data-loaded', '1');
    };
    img.src = images[i];
  });

  initLightbox(images);
  initShowMore();
  initMobileSlideshow(images);
}

function initLightbox(images) {
  const box = document.getElementById('lightbox');
  if (!box) return;
  const img = document.getElementById('lb-img');
  const counter = document.getElementById('lb-counter');
  let idx = 0;

  function render() {
    img.style.animation = 'none';
    void img.offsetHeight; // restart the fade animation
    img.style.animation = '';
    img.src = images[idx];
    counter.textContent = `${idx + 1} / ${images.length}`;
  }
  function open(i) {
    idx = Math.min(i, images.length - 1);
    render();
    box.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    box.classList.remove('active');
    document.body.style.overflow = '';
  }
  function step(dir) {
    idx = (idx + dir + images.length) % images.length;
    render();
  }

  onAction('lb-open', (el) => open(Number(el.dataset.index)));
  onAction('lb-close', (el, event) => {
    if (el === box && event.target !== box) return; // click on the image itself
    close();
  });
  onAction('lb-prev', () => step(-1));
  onAction('lb-next', () => step(1));

  document.addEventListener('keydown', (e) => {
    if (!box.classList.contains('active')) return;
    if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'Escape') close();
  });
}

function initShowMore() {
  onAction('gal-more', (btn) => {
    const expanded = btn.classList.contains('expanded');
    const label = document.getElementById('gal-more-label');
    const grid = document.querySelector('.gal-grid');
    const isMobile = window.innerWidth <= 480;

    if (!expanded) {
      document.querySelectorAll('.gal-item.gal-hidden').forEach((el) => {
        el.classList.remove('gal-hidden');
        el.classList.add('gal-revealed');
      });
      if (isMobile && grid) grid.classList.add('mob-expanded');
      btn.classList.add('expanded');
      label.textContent = 'Show Less';
    } else {
      document.querySelectorAll('.gal-item.gal-revealed').forEach((el) => {
        el.classList.add('gal-hidden');
        el.classList.remove('gal-revealed');
      });
      if (isMobile && grid) grid.classList.remove('mob-expanded');
      btn.classList.remove('expanded');
      label.textContent = 'Show More Photos';
      document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
    }
  });
}

function initMobileSlideshow(photos) {
  const el = document.getElementById('mobGalImg');
  const progress = document.getElementById('mobGalProg');
  const counter = document.getElementById('mobGalCounter');
  const dotWrap = document.getElementById('mobGalDots');
  if (!el || !progress) return;

  const CIRCUMFERENCE = 113.1; // 2πr for the r=18 progress ring
  const INTERVAL_MS = 2500;
  const total = photos.length;
  const dotCount = Math.min(total, 5);
  let idx = 0;
  let t0 = null;
  const dots = [];

  if (dotWrap) {
    dotWrap.innerHTML = '';
    for (let i = 0; i < dotCount; i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'mob-gal-dot' + (i === 0 ? ' active' : '');
      b.setAttribute('aria-label', `Photo ${i + 1}`);
      b.addEventListener('click', () => show(i));
      dotWrap.appendChild(b);
      dots.push(b);
    }
  }

  const setProgress = (offset) => progress.setAttribute('stroke-dashoffset', offset.toFixed(2));

  function show(i) {
    idx = i;
    t0 = null;
    el.classList.add('fade');
    setTimeout(() => {
      el.style.backgroundImage = `url(${photos[idx]})`;
      el.classList.remove('fade');
    }, 350);
    setProgress(CIRCUMFERENCE);
    if (counter) counter.textContent = `${idx + 1} / ${total}`;
    dots.forEach((b, j) => b.classList.toggle('active', j === idx % dotCount));
  }

  el.style.backgroundImage = `url(${photos[0]})`;
  el.style.backgroundSize = 'cover';
  el.style.backgroundPosition = 'center';
  setProgress(CIRCUMFERENCE);
  if (counter) counter.textContent = `1 / ${total}`;

  function tick(ts) {
    if (!t0) t0 = ts;
    const f = Math.min((ts - t0) / INTERVAL_MS, 1);
    setProgress(CIRCUMFERENCE * (1 - f));
    if (f >= 1) {
      show((idx + 1) % total);
      t0 = ts;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
