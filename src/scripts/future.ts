import { gsap, reduced, revealSplit, tilt } from './core';

export function initFuture() {
  const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-bp-card]'));
  if (reduced) return;

  const title = document.querySelector<HTMLElement>('.bp-title');
  if (title) revealSplit(title, 0.1);

  // Flow line across the top draws itself
  const draws = Array.from(document.querySelectorAll<SVGPathElement>('[data-draw]'));
  draws.forEach((p) => {
    const len = p.getTotalLength();
    gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.6, ease: 'expo.inOut', delay: 0.4 });
  });
  gsap.from('[data-dot]', { scale: 0, transformOrigin: '50% 50%', duration: 0.6, ease: 'back.out(3)', stagger: 0.35, delay: 0.6 });

  // Cards fly in per lane; their sketches draw as they arrive
  cards.forEach((card, i) => {
    const paths = Array.from(card.querySelectorAll<SVGGeometryElement>('.bp-sketch path, .bp-sketch rect, .bp-sketch circle'));
    paths.forEach((p) => {
      const len = p.getTotalLength?.() ?? 200;
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    });
    const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 90%' } });
    // Tilt is attached only after the entrance, so the two never fight over the transform.
    tl.from(card, { opacity: 0, y: 60, rotate: i % 2 ? 2 : -2, duration: 1, ease: 'expo.out', delay: (i % 3) * 0.08, onComplete: () => tilt(card, 4) })
      .to(paths, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', stagger: 0.12 }, '-=0.6');
  });
}
