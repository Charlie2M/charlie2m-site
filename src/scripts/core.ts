import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
export let lenis: Lenis | null = null;
export { gsap, ScrollTrigger };

const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel)) as T[];

let started = false;
/** Safe to call more than once: page scripts call it before their own setup. */
export function initCore() {
  if (started) return;
  started = true;
  if (!reduced) smoothScroll();
  anchors();
  nav();
  progress();
  if (!reduced) {
    if (finePointer) $$('[data-magnetic]').forEach(magnetic);
    $$('[data-split]').forEach(splitText);
    autoSplits();
    reveals();
  }
  (window as any).__motionReady = true;
}

/* ---------- Smooth scroll ---------- */
function smoothScroll() {
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function anchors() {
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href*="#"]');
    if (!a) return;
    const url = new URL(a.href, location.href);
    if (url.pathname.replace(/\/$/, '') !== location.pathname.replace(/\/$/, '') || !url.hash) return;
    const target = url.hash === '#main' ? document.body : document.querySelector(url.hash);
    if (!target) return;
    e.preventDefault();
    document.querySelector('[data-nav]')?.classList.remove('is-open');
    if (lenis) lenis.scrollTo(url.hash === '#main' ? 0 : (target as HTMLElement), { offset: -10, duration: 1.4 });
    else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    history.replaceState(null, '', url.hash === '#main' ? location.pathname : url.hash);
  });
}

/* ---------- Nav ---------- */
function nav() {
  const el = document.querySelector<HTMLElement>('[data-nav]');
  if (!el) return;
  const toggle = el.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  toggle?.addEventListener('click', () => {
    const open = el.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  let last = window.scrollY;
  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY;
      const down = y > last && y > 240;
      if (!el.classList.contains('is-open')) el.classList.toggle('is-hidden', down);
      last = y;
    },
    { passive: true },
  );
}

function progress() {
  const bar = document.querySelector('.progress');
  if (!bar) return;
  gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: reduced ? true : 0.3 } });
}

/* ---------- Magnetic ---------- */
export function magnetic(el: HTMLElement) {
  const strength = Number(el.dataset.magnetic) || 0.35;
  const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
  const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    x((e.clientX - r.left - r.width / 2) * strength);
    y((e.clientY - r.top - r.height / 2) * strength);
  });
  el.addEventListener('pointerleave', () => {
    gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.35)' });
  });
}

/* ---------- 3D tilt ---------- */
/**
 * Tilts toward the pointer using the CSS `rotate` property (not `transform`),
 * so it never conflicts with GSAP entrance tweens that animate transform.
 */
export function tilt(el: HTMLElement, max = 7) {
  if (reduced || !finePointer || el.dataset.tilted) return;
  el.dataset.tilted = '1';
  el.style.transition = [getComputedStyle(el).transition, 'rotate 0.5s cubic-bezier(0.22, 1, 0.36, 1)'].filter((s) => s && s !== 'all 0s ease 0s').join(', ');
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - 0.5;
    const dy = (e.clientY - r.top) / r.height - 0.5;
    const angle = Math.min(1, Math.hypot(dx, dy) * 2) * max;
    el.style.rotate = `${(-dy).toFixed(3)} ${dx.toFixed(3)} 0 ${angle.toFixed(2)}deg`;
    el.style.setProperty('--mx', `${(dx + 0.5) * 100}%`);
    el.style.setProperty('--my', `${(dy + 0.5) * 100}%`);
  });
  el.addEventListener('pointerleave', () => { el.style.rotate = ''; });
}

/* ---------- Split text ---------- */
export function splitText(el: HTMLElement) {
  if (el.dataset.splitDone) return;
  el.dataset.splitDone = '1';
  el.setAttribute('aria-label', el.textContent?.trim().replace(/\s+/g, ' ') ?? '');
  const walk = (node: Node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        (child.textContent ?? '').split(/(\s+)/).forEach((word) => {
          if (!word) return;
          if (/^\s+$/.test(word)) { frag.append(document.createTextNode(' ')); return; }
          const w = document.createElement('span');
          w.className = 'split-line';
          w.setAttribute('aria-hidden', 'true');
          for (const ch of word) {
            const c = document.createElement('span');
            c.className = 'split-char';
            c.textContent = ch;
            w.append(c);
          }
          frag.append(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    });
  };
  walk(el);
}

export function revealSplit(el: HTMLElement, delay = 0) {
  const chars = el.querySelectorAll('.split-char');
  gsap.set(el, { visibility: 'visible' });
  return gsap.fromTo(
    chars,
    { yPercent: 115, rotate: 6 },
    { yPercent: 0, rotate: 0, duration: 1.1, ease: 'expo.out', stagger: 0.022, delay },
  );
}

/** Split headings that aren't driven manually animate when scrolled into view. */
function autoSplits() {
  $$('[data-split]:not([data-split="manual"])').forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => revealSplit(el) });
  });
}

function reveals() {
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09, overwrite: true }),
  });
}
