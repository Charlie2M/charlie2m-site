import { gsap, reduced } from './core';
import { ACHIEVEMENTS, type AchievementId } from '../data/achievements';

/**
 * Site-wide easter eggs. Progress is kept in this browser only (localStorage),
 * and every read/write is guarded so private windows still work.
 */

const KEY = 'c2m-achievements';
const LANGS_KEY = 'c2m-langs';

const load = (key: string): string[] => {
  try { return JSON.parse(localStorage.getItem(key) ?? '[]'); } catch { return []; }
};
const save = (key: string, v: string[]) => {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
};

let found = new Set<string>(load(KEY));
let toastTimer = 0;

export function unlock(id: AchievementId) {
  if (found.has(id)) return;
  found.add(id);
  save(KEY, [...found]);
  render();
  toast(id);
  confetti();
}

function render() {
  const panel = document.querySelector('[data-ach-panel]');
  if (!panel) return;
  panel.querySelectorAll<HTMLElement>('[data-ach-id]').forEach((li) => li.classList.toggle('is-on', found.has(li.dataset.achId!)));
  const n = ACHIEVEMENTS.filter((a) => found.has(a)).length;
  document.querySelectorAll('[data-ach-count]').forEach((el) => (el.textContent = `${n}/${ACHIEVEMENTS.length}`));
  const bar = panel.querySelector<HTMLElement>('[data-ach-bar]');
  if (bar) bar.style.setProperty('--p', `${(n / ACHIEVEMENTS.length) * 100}%`);
}

function toast(id: string) {
  const t = document.querySelector<HTMLElement>('[data-ach-toast]');
  const name = document.querySelector(`[data-ach-id="${id}"] [data-ach-name]`)?.textContent ?? id;
  if (!t) return;
  t.querySelector('[data-ach-toast-name]')!.textContent = name;
  t.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => t.classList.remove('is-on'), 4200);
}

export function confetti(count = 70) {
  if (reduced) return;
  const cs = getComputedStyle(document.body);
  const colors = [cs.getPropertyValue('--accent'), cs.getPropertyValue('--accent-2'), '#6fd36b', '#e8d28f', '#ffffff'];
  for (let n = 0; n < count; n++) {
    const b = document.createElement('div');
    b.className = 'confetti';
    b.style.left = `${Math.random() * 100}vw`;
    b.style.background = colors[n % colors.length].trim();
    document.body.append(b);
    gsap.to(b, {
      y: innerHeight + 60, x: 'random(-120, 120)', rotation: 'random(-360, 360)',
      duration: 'random(1.6, 3.2)', delay: Math.random() * 0.5, ease: 'power1.in', onComplete: () => b.remove(),
    });
  }
}

function openPanel(open = true) {
  const d = document.querySelector<HTMLDialogElement>('[data-ach-panel]');
  if (!d) return;
  if (open && !d.open) {
    d.showModal();
    if (!reduced) gsap.fromTo(d.querySelectorAll('[data-ach-id]'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, stagger: 0.04, duration: 0.5, ease: 'expo.out' });
  } else if (!open && d.open) d.close();
}

const typing = (e: Event) => {
  const el = e.target as HTMLElement;
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
};

export function initAchievements() {
  render();

  // Panel: "?" key, footer button, click outside to close
  document.querySelectorAll('[data-ach-open]').forEach((b) => b.addEventListener('click', () => openPanel(true)));
  const dlg = document.querySelector<HTMLDialogElement>('[data-ach-panel]');
  dlg?.querySelector('[data-ach-close]')?.addEventListener('click', () => openPanel(false));
  dlg?.addEventListener('click', (e) => { if (e.target === dlg) openPanel(false); });

  // Key-driven eggs: Konami code, typing "gg", "?" for the panel
  const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let k = 0;
  let typed = '';
  window.addEventListener('keydown', (e) => {
    if (typing(e)) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === '?') { openPanel(!dlg?.open); return; }
    k = key === konami[k] ? k + 1 : key === konami[0] ? 1 : 0;
    if (k === konami.length) { k = 0; unlock('konami'); confetti(120); }
    if (key.length === 1) {
      typed = (typed + key).slice(-2);
      if (typed === 'gg') { typed = ''; unlock('gg'); }
    }
  });

  // Polyglot: visit the site in all three languages (remembered across visits)
  const langs = new Set(load(LANGS_KEY));
  langs.add(document.documentElement.lang);
  save(LANGS_KEY, [...langs]);
  if (['en', 'es', 'de'].every((l) => langs.has(l))) setTimeout(() => unlock('polyglot'), 1500);

  // Night owl: local time between 00:00 and 04:59
  if (new Date().getHours() < 5) setTimeout(() => unlock('nightowl'), 2500);

  // Source diver: a message for developers, plus a callable function
  console.log(
    '%cCharlie2M%c\nLooking under the hood? I like you already.\nType hire() to unlock a secret.',
    'font: 700 28px system-ui; color: #7cf5c8;',
    'font: 14px system-ui; color: inherit;',
  );
  (window as any).hire = () => {
    unlock('hacker');
    return 'Achievement unlocked. Let’s talk: charliesusv7@gmail.com';
  };
}
