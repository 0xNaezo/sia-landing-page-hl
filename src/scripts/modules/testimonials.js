import { onAction } from '../lib/actions.js';

const AUTOPLAY_MS = 5500;

/** Testimonials slider with dots, arrows and autoplay (paused on hover). */
export function initTestimonials() {
  const track = document.getElementById('ttrack');
  if (!track) return;
  const cards = track.querySelectorAll('.tcard');
  const dots = document.querySelectorAll('.tdot');
  const raven = document.querySelector('.testi-raven');
  const wing = raven?.querySelector('.raven-flap');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  const total = cards.length;
  if (!total) return;
  let slide = 0;

  function update() {
    const w = cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : 0;
    track.style.transform = `translateX(-${slide * w}px)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === slide));
  }
  // A switch slides the raven's perch away, so it flutters up and lands as the next card
  // settles: the whole flight takes exactly the track's transition time. It crouches, pushes
  // off stretched with the body pitched forward and the legs tucked back, beats twice, flares
  // and reaches down with its feet, and squashes a little once it has landed. A switch
  // mid-flight restarts it from the height it has reached, so it never snaps to the card.
  let moves = [];
  function flutter() {
    if (!raven || still.matches) return;
    const ms = parseFloat(getComputedStyle(track).transitionDuration) * 1000;
    const y = new DOMMatrix(getComputedStyle(raven).transform).m42;
    const h = raven.getBoundingClientRect().height * 0.22;
    // [offset, transform] pairs, eased per segment
    const play = (el, frames, duration = ms) =>
      el.animate(
        frames.map(([offset, transform]) => ({ offset, transform, easing: 'ease-in-out' })),
        duration,
      );
    moves.forEach((a) => a.cancel());
    raven.classList.add('fly');
    const hop = play(raven, [
      [0, `translateY(${y}px) scale(1, 1)`],
      [0.07, `translateY(${y}px) scale(1.05, 0.9)`],
      [0.2, `translateY(${-0.45 * h}px) scale(0.96, 1.07)`],
      [0.45, `translateY(${-h}px) scale(1, 1)`],
      [0.88, `translateY(${-0.2 * h}px) scale(0.98, 1.03)`],
      [1, 'translateY(0px) scale(1, 1)'],
    ]);
    moves = [
      hop,
      play(raven.querySelector('.raven-body'), [
        [0, 'rotate(0deg)'],
        [0.07, 'rotate(4deg)'],
        [0.22, 'rotate(10deg)'],
        [0.5, 'rotate(6deg)'],
        [0.8, 'rotate(-4deg)'],
        [0.93, 'rotate(-6deg)'],
        [1, 'rotate(0deg)'],
      ]),
      play(raven.querySelector('.raven-legs'), [
        [0, 'rotate(0deg) scaleY(1)'],
        [0.07, 'rotate(6deg) scaleY(0.88)'],
        [0.2, 'rotate(-6deg) scaleY(1.06)'],
        [0.36, 'rotate(40deg) scaleY(0.7)'],
        [0.66, 'rotate(32deg) scaleY(0.74)'],
        [0.86, 'rotate(-16deg) scaleY(0.98)'],
        [1, 'rotate(0deg) scaleY(1)'],
      ]),
      // folded, up, down, up, folded again
      play(wing, [-75, 12, -70, 12, -75].map((a, i) => [i / 4, `rotate(${a}deg)`])),
    ];
    hop.onfinish = () => {
      raven.classList.remove('fly');
      moves.push(play(raven, [[0, 'scale(1, 1)'], [0.35, 'scale(1.05, 0.92)'], [1, 'scale(1, 1)']], 240));
    };
  }
  function go(n) {
    const from = slide;
    slide = (n + total) % total;
    update();
    if (slide !== from) flutter();
  }
  const next = () => go(slide + 1);

  onAction('testi-go', (el) => go(Number(el.dataset.index)));
  onAction('testi-next', next);
  onAction('testi-prev', () => go(slide - 1));

  let timer = setInterval(next, AUTOPLAY_MS);
  const wrap = document.querySelector('.testi-wrap');
  if (wrap) {
    wrap.addEventListener('mouseenter', () => clearInterval(timer));
    wrap.addEventListener('mouseleave', () => {
      timer = setInterval(next, AUTOPLAY_MS);
    });
  }
  window.addEventListener('resize', update);
}
