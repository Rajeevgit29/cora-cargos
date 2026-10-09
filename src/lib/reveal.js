import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './env.js';

/**
 * Restrained reveal-on-scroll: elements with `.reveal` rise and fade in; image
 * frames with `.reveal-img` are uncovered like ink rolling down the page.
 * The visual states live in CSS — this only adds `.is-in`.
 */
export function initReveals(root) {
  const els = [...root.querySelectorAll('.reveal:not(.is-in), .reveal-img:not(.is-in)')];
  if (prefersReducedMotion()) {
    els.forEach((el) => el.classList.add('is-in'));
    return () => {};
  }
  const triggers = ScrollTrigger.batch(els, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) =>
      batch.forEach((el, i) => {
        el.style.transitionDelay = `${i * 70}ms`;
        el.classList.add('is-in');
      }),
  });
  return () => triggers.forEach((t) => t.kill());
}
