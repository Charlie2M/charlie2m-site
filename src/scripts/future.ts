import { gsap, ScrollTrigger, reduced, revealSplit, tilt } from './core';

export function initFuture() {
  const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-bp-card]'));
  if (reduced) return;

  const title = document.querySelector<HTMLElement>('.bp-title');
  if (title) revealSplit(title, 0.1);

  // Roadmap line: dots pop in, then each segment grows toward the next lane
  const dots = gsap.utils.toArray<HTMLElement>('[data-dot]');
  const segs = gsap.utils.toArray<HTMLElement>('[data-seg]');
  const tl = gsap.timeline({ delay: 0.4 });
  dots.forEach((dot, i) => {
    tl.from(dot, { scale: 0, duration: 0.45, ease: 'back.out(3)' }, i === 0 ? 0 : '>-0.1');
    if (segs[i]) tl.from(segs[i], { scaleX: 0, duration: 0.6, ease: 'power2.inOut' }, '>-0.05');
  });

  // Sketches start undrawn and draw themselves when their card arrives
  const sketchPaths = (card: HTMLElement) =>
    Array.from(card.querySelectorAll<SVGGeometryElement>('.bp-sketch path, .bp-sketch rect, .bp-sketch circle'));
  cards.forEach((card) =>
    sketchPaths(card).forEach((p) => {
      const len = p.getTotalLength?.() ?? 200;
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    }),
  );

  // Cards rise straight up into their column (no rotation), then clear their
  // transform so nothing is left offset; tilt is attached only afterwards.
  gsap.set(cards, { opacity: 0, y: 40 });
  ScrollTrigger.batch(cards, {
    start: 'top 92%',
    once: true,
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.1, clearProps: 'transform',
        onComplete: () => (batch as HTMLElement[]).forEach((c) => tilt(c, 4)),
      });
      (batch as HTMLElement[]).forEach((c, i) =>
        gsap.to(sketchPaths(c), { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', stagger: 0.1, delay: 0.3 + i * 0.1 }),
      );
    },
  });
  // Fonts change card heights after load; re-measure so late cards still trigger.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}
