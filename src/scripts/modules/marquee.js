/** Partner-logo marquee: duplicate the track for a seamless loop, pause on hover. */
export function initMarquee() {
  const tracks = document.querySelectorAll('.marquee-track');
  if (!tracks.length) return;

  tracks.forEach((track) => {
    if (track.dataset.loopReady === '1') return;
    Array.from(track.children).forEach((node) => {
      const clone = node.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
    track.dataset.loopReady = '1';
  });

  const setPlayState = (state) =>
    tracks.forEach((t) => {
      t.style.animationPlayState = state;
    });

  document.querySelectorAll('.mlogo').forEach((logo) => {
    logo.addEventListener('mouseenter', () => setPlayState('paused'));
    logo.addEventListener('mouseleave', () => setPlayState('running'));
  });
}
