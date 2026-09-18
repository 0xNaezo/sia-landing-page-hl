const DURATION_MS = 1800;

function format(n) {
  return n >= 1000 ? Math.round(n / 1000) + 'k' : String(Math.round(n));
}

function animate(el) {
  const target = Number(el.dataset.target);
  const start = performance.now();
  (function step(ts) {
    const p = Math.min((ts - start) / DURATION_MS, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = format(target * ease);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = format(target);
  })(start);
}

/** Animated number counters (`.counter[data-target]`) in the stats section. */
export function initCounters() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.5 },
  );
  document.querySelectorAll('.counter').forEach((el) => observer.observe(el));
}
