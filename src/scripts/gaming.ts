import { Flip } from 'gsap/Flip';
import { gsap, ScrollTrigger, reduced, finePointer, revealSplit, tilt } from './core';

gsap.registerPlugin(Flip);

const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));

export function initGaming() {
  // Shine element on every card with art
  $$('.gx-art').forEach((a) => a.append(Object.assign(document.createElement('i'), { className: 'shine' })));
  intro();
  feature();
  library();
  konami();
}

function intro() {
  if (reduced) return;
  const name = $('.gx-name');
  const tl = gsap.timeline({ delay: 0.15 });
  tl.from('.gx-banner', { clipPath: 'polygon(0 0, 0 0, 0 0, 0 100%, 0 100%, 0 100%)', duration: 1.1, ease: 'expo.inOut' })
    .fromTo('[data-g-in]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07 }, '-=0.45')
    .add(() => { if (name) revealSplit(name); }, '-=0.9')
    .from('[data-xp]', { scaleX: 0, duration: 1.6, ease: 'expo.out' }, '-=0.6')
    .from('.gx-avatar .vx', { y: -60, opacity: 0, duration: 0.7, ease: 'back.out(2)', stagger: 0.05 }, '-=1.4');

  const count = $('[data-gcount]');
  if (count) {
    const o = { v: 0 };
    tl.to(o, { v: Number(count.dataset.gcount), duration: 1.2, ease: 'power2.out', onUpdate: () => (count.textContent = String(Math.round(o.v))) }, '-=1.2');
  }
}

function feature() {
  const art = $('[data-terrain]');
  const card = $('[data-feature]');
  if (!art || !card || reduced) return;
  const svg = art.querySelector('svg')!;
  svg.classList.add('is-building');
  ScrollTrigger.create({
    trigger: card, start: 'top 75%', once: true,
    onEnter: () =>
      gsap.from(svg.querySelectorAll('.vx'), {
        y: -80, opacity: 0, duration: 0.6, ease: 'back.out(1.4)',
        stagger: { each: 0.004, from: 'start' },
        onComplete: () => { gsap.set(svg.querySelectorAll('.vx'), { clearProps: 'all' }); svg.classList.remove('is-building'); },
      }),
  });
  gsap.to(art, { yPercent: -10, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } });
  if (finePointer) {
    const rx = gsap.quickTo(art, 'rotationX', { duration: 0.8, ease: 'power3' });
    const ry = gsap.quickTo(art, 'rotationY', { duration: 0.8, ease: 'power3' });
    gsap.set(art, { transformPerspective: 900 });
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 16);
      rx((0.5 - (e.clientY - r.top) / r.height) * 12);
    });
    card.addEventListener('pointerleave', () => { rx(0); ry(0); });
  }
}

function library() {
  const grid = $('[data-grid]');
  if (!grid) return;
  const cards = $$('.gx-card', grid);
  cards.forEach((c) => c.hasAttribute('data-gtilt') && tilt(c, 5));
  if (!reduced) {
    gsap.from(cards, { opacity: 0, y: 50, rotateX: -12, duration: 1, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: grid, start: 'top 82%' } });
  }
  const buttons = $$('[data-filter]');
  buttons.forEach((btn) =>
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter!;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      const state = Flip.getState(cards);
      cards.forEach((c) => c.classList.toggle('is-hidden', !(f === 'all' || c.dataset.genre === f)));
      if (reduced) return;
      Flip.from(state, {
        duration: 0.6, ease: 'expo.inOut', absolute: true, scale: true,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.5 }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.85, duration: 0.4 }),
        onComplete: () => ScrollTrigger.refresh(),
      });
    }),
  );
}

function konami() {
  const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let i = 0;
  const toast = $('[data-toast]');
  window.addEventListener('keydown', (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    i = key === code[i] ? i + 1 : key === code[0] ? 1 : 0;
    if (i < code.length) return;
    i = 0;
    toast?.classList.add('is-on');
    setTimeout(() => toast?.classList.remove('is-on'), 4200);
    if (reduced) return;
    const colors = ['#6fd36b', '#8c6340', '#3aa0ff', '#38e1ff', '#8b5cf6', '#e8d28f'];
    for (let n = 0; n < 90; n++) {
      const b = document.createElement('div');
      b.className = 'confetti';
      b.style.left = `${Math.random() * 100}vw`;
      b.style.background = colors[n % colors.length];
      document.body.append(b);
      gsap.to(b, {
        y: innerHeight + 60, x: `random(-120, 120)`, rotation: `random(-360, 360)`,
        duration: `random(1.6, 3.2)`, delay: Math.random() * 0.6, ease: 'power1.in', onComplete: () => b.remove(),
      });
    }
  });
}
