import { gsap, ScrollTrigger, reduced, finePointer, revealSplit, tilt, lenis } from './core';

const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));

export async function initHome() {
  packets();
  greetings();
  story();
  stackGraph();
  projects();
  experience();
  rates();
  hireForm();
  await boot();
  heroIntro();
}

/* ---------- Boot loader ---------- */
async function boot() {
  const loader = $('[data-loader]');
  if (!loader || loader.hidden) return;
  lenis?.stop();
  const type = (el: HTMLElement | null, speed = 0.045) =>
    new Promise<void>((res) => {
      if (!el) return res();
      const text = el.dataset.text ?? '';
      const o = { n: 0 };
      gsap.to(o, { n: text.length, duration: text.length * speed, ease: 'none', onUpdate: () => (el.textContent = text.slice(0, Math.round(o.n))), onComplete: res });
    });
  await type($('[data-loader-cmd]'));
  $('[data-loader-caret]')?.remove();
  await gsap.to($('[data-loader-bar]'), { scaleX: 1, duration: 0.6, ease: 'power2.inOut' });
  await type($('[data-loader-ok]'), 0.02);
  await type($('[data-loader-ready]'), 0.02);
  await gsap.to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut', delay: 0.25 });
  loader.hidden = true;
  try { sessionStorage.setItem('c2m-boot', '1'); } catch {}
  lenis?.start();
}

/* ---------- Hero ---------- */
function heroIntro() {
  if (reduced) return;
  const name = $('.hero__name');
  if (name) revealSplit(name, 0.05);
  gsap.fromTo('[data-hero-in]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, delay: 0.25 });
  const svg = $('.voxel--avatar') as unknown as SVGElement | null;
  if (svg) {
    svg.classList.add('is-building');
    gsap.from(svg.querySelectorAll('.vx'), {
      y: -160, opacity: 0, duration: 0.9, ease: 'back.out(1.6)', stagger: 0.03, delay: 0.35,
      onComplete: () => {
        gsap.set(svg.querySelectorAll('.vx'), { clearProps: 'transform,opacity' });
        svg.classList.remove('is-building');
      },
    });
  }
  // Tap the avatar on touch devices to burst it.
  const av = $('[data-avatar]');
  av?.addEventListener('click', () => av.classList.toggle('is-burst'));
  // Parallax on scroll
  gsap.to('.hero__art', { yPercent: 25, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__text', { yPercent: 12, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
}

function greetings() {
  const el = $('[data-greeting]');
  if (!el || reduced) return;
  const words: string[] = JSON.parse(el.dataset.words ?? '[]');
  let i = 0;
  setInterval(() => {
    i = (i + 1) % words.length;
    gsap.timeline()
      .to(el, { yPercent: -110, opacity: 0, duration: 0.45, ease: 'power3.in' })
      .add(() => { el.textContent = words[i]; })
      .fromTo(el, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'expo.out' });
  }, 2400);
}

/* ---------- Packet grid canvas ---------- */
function packets() {
  const canvas = $<HTMLCanvasElement>('[data-packets]');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;
  const GAP = 46;
  let w = 0, h = 0, dpr = 1, cols = 0, rows = 0;
  const mouse = { x: -999, y: -999 };
  type P = { x: number; y: number; dx: number; dy: number; life: number; hue: number };
  let ps: P[] = [];
  const accent = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#7cf5c8';
  const accent2 = getComputedStyle(document.body).getPropertyValue('--accent-2').trim() || '#a78bfa';

  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(w / GAP) + 1; rows = Math.ceil(h / GAP) + 1;
  };
  const spawn = (): P => {
    const horiz = Math.random() < 0.5;
    const dir = Math.random() < 0.5 ? -1 : 1;
    return {
      x: horiz ? (dir > 0 ? 0 : w) : Math.floor(Math.random() * cols) * GAP,
      y: horiz ? Math.floor(Math.random() * rows) * GAP : dir > 0 ? 0 : h,
      dx: horiz ? dir : 0, dy: horiz ? 0 : dir,
      life: 1, hue: Math.random() < 0.8 ? 0 : 1,
    };
  };
  const draw = (moving: boolean) => {
    ctx.clearRect(0, 0, w, h);
    for (let c = 0; c < cols; c++)
      for (let r = 0; r < rows; r++) {
        const x = c * GAP, y = r * GAP;
        const dist = Math.hypot(x - mouse.x, y - mouse.y);
        const near = Math.max(0, 1 - dist / 220);
        ctx.fillStyle = near > 0 ? accent : 'rgba(255,255,255,0.12)';
        ctx.globalAlpha = near > 0 ? 0.25 + near * 0.75 : 1;
        const s = 1.2 + near * 1.6;
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      }
    ctx.globalAlpha = 1;
    if (!moving) return;
    for (const p of ps) {
      const speed = 2.2;
      p.x += p.dx * speed; p.y += p.dy * speed;
      // occasionally turn at an intersection, like a routed request
      if (p.x % GAP < speed && p.y % GAP < speed && Math.random() < 0.08) {
        [p.dx, p.dy] = Math.random() < 0.5 ? [p.dy, p.dx] : [-p.dy, -p.dx];
      }
      const grad = ctx.createLinearGradient(p.x, p.y, p.x - p.dx * 60, p.y - p.dy * 60);
      const col = p.hue ? accent2 : accent;
      grad.addColorStop(0, col); grad.addColorStop(1, 'transparent');
      ctx.strokeStyle = grad; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.dx * 60, p.y - p.dy * 60); ctx.stroke();
      ctx.fillStyle = col; ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    }
    ps = ps.filter((p) => p.x > -80 && p.x < w + 80 && p.y > -80 && p.y < h + 80);
    while (ps.length < Math.min(18, Math.round(w / 80))) ps.push(spawn());
  };

  resize();
  new ResizeObserver(resize).observe(canvas);
  if (reduced) { draw(false); return; }
  canvas.parentElement?.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  canvas.parentElement?.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);
  const loop = () => { if (visible && !document.hidden) draw(true); requestAnimationFrame(loop); };
  loop();
}

/* ---------- Story ---------- */
function story() {
  const pin = $('[data-story-pin]');
  const track = $('[data-story-track]');
  if (!pin || !track) return;
  const route = document.querySelector<SVGPathElement>('[data-route]');
  const plane = document.querySelector<SVGTextElement>('[data-plane]');
  const len = route?.getTotalLength() ?? 0;
  const setFlight = (p: number) => {
    if (!route || !plane) return;
    route.style.strokeDasharray = `${len}`;
    route.style.strokeDashoffset = `${len * (1 - p)}`;
    const pt = route.getPointAtLength(len * p);
    const ahead = route.getPointAtLength(Math.min(len, len * p + 1));
    const ang = (Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180) / Math.PI;
    plane.setAttribute('transform', `translate(${pt.x - 10} ${pt.y + 8}) rotate(${ang} 10 -8)`);
  };
  setFlight(0);
  if (reduced) { setFlight(1); return; }

  const mm = gsap.matchMedia();
  mm.add('(min-width: 861px)', () => {
    const dist = () => Math.max(0, track.scrollWidth - document.documentElement.clientWidth);
    gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: pin, start: 'top 12%', end: () => `+=${dist()}`, scrub: 1, pin: true, invalidateOnRefresh: true,
        onUpdate: (st) => setFlight(st.progress),
      },
    });
    gsap.from('[data-chapter]', { opacity: 0, y: 40, stagger: 0.1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: pin, start: 'top 75%' } });
  });
  mm.add('(max-width: 860px)', () => {
    $$('[data-chapter]').forEach((c) =>
      gsap.from(c, { opacity: 0, y: 40, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: c, start: 'top 88%' } }),
    );
  });
}

/* ---------- Stack graph ---------- */
function stackGraph() {
  const graph = $('[data-graph]');
  const svg = document.querySelector<SVGSVGElement>('[data-edges-svg]');
  if (!graph || !svg) return;
  const edges: [string, string][] = JSON.parse(graph.dataset.edges ?? '[]');
  const nodes = new Map($$('[data-node]', graph).map((n) => [n.dataset.node!, n]));
  const name = $('[data-insp-name]'), detail = $('[data-insp-detail]'), used = $('[data-insp-used]');
  const NS = 'http://www.w3.org/2000/svg';

  const draw = () => {
    svg.innerHTML = '';
    const g = graph.getBoundingClientRect();
    edges.forEach(([a, b], i) => {
      const A = nodes.get(a)?.getBoundingClientRect(), B = nodes.get(b)?.getBoundingClientRect();
      if (!A || !B) return;
      let d: string;
      if (Math.abs(A.left - B.left) < 10) {
        const x = A.right - g.left - 8, y1 = A.bottom - g.top, y2 = B.top - g.top;
        d = `M${x} ${y1} C ${x + 30} ${y1 + 10}, ${x + 30} ${y2 - 10}, ${x} ${y2}`;
      } else {
        const x1 = A.right - g.left, y1 = A.top + A.height / 2 - g.top;
        const x2 = B.left - g.left, y2 = B.top + B.height / 2 - g.top;
        const mx = (x1 + x2) / 2;
        d = `M${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
      }
      for (const cls of ['base', 'flow']) {
        const p = document.createElementNS(NS, 'path');
        p.setAttribute('d', d);
        p.dataset.a = a; p.dataset.b = b;
        if (cls === 'flow') { p.classList.add('flow'); p.style.animationDelay = `${-(i * 0.37) % 3.2}s`; }
        svg.append(p);
      }
    });
  };
  draw();
  new ResizeObserver(draw).observe(graph);

  const select = (id: string) => {
    const n = nodes.get(id);
    if (!n) return;
    const linked = new Set([id]);
    edges.forEach(([a, b]) => { if (a === id) linked.add(b); if (b === id) linked.add(a); });
    nodes.forEach((el, k) => {
      el.classList.toggle('is-active', k === id);
      el.classList.toggle('is-dim', !linked.has(k));
      el.setAttribute('aria-pressed', String(k === id));
    });
    svg.querySelectorAll<SVGPathElement>('path').forEach((p) => {
      const hot = p.dataset.a === id || p.dataset.b === id;
      p.classList.toggle('is-hot', hot);
      p.classList.toggle('is-dim', !hot);
    });
    if (name) name.textContent = n.dataset.name ?? '';
    if (detail) detail.textContent = n.dataset.detail ?? '';
    if (used) used.innerHTML = (JSON.parse(n.dataset.used ?? '[]') as string[]).map((u) => `<span class="chip">${u}</span>`).join('');
    if (!reduced) gsap.fromTo([name, detail, ...(used ? Array.from(used.children) : [])], { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.04, ease: 'expo.out' });
  };
  const clear = () => {
    nodes.forEach((el) => { el.classList.remove('is-dim'); });
    svg.querySelectorAll('path').forEach((p) => p.classList.remove('is-dim'));
  };
  nodes.forEach((el, id) => {
    el.addEventListener('pointerenter', () => finePointer && select(id));
    el.addEventListener('focus', () => select(id));
    el.addEventListener('click', () => select(id));
  });
  graph.addEventListener('pointerleave', () => finePointer && clear());
  if (!reduced) {
    gsap.from($$('.node', graph), {
      opacity: 0, scale: 0.85, duration: 0.7, ease: 'back.out(2)', stagger: 0.04, clearProps: 'opacity,transform',
      scrollTrigger: { trigger: graph, start: 'top 80%' },
    });
  }
}

/* ---------- Projects ---------- */
function projects() {
  $$('[data-tilt]').forEach((el) => tilt(el, 6));
  $$('[data-run]').forEach((btn) => {
    const card = btn.closest('.project')!;
    const con = $('[data-console]', card)!;
    const lines: { t: string; s: string }[] = JSON.parse(con.dataset.console ?? '[]');
    let running = false;
    btn.addEventListener('click', async () => {
      if (running) return;
      running = true;
      con.innerHTML = '';
      for (const line of lines) {
        const div = document.createElement('div');
        div.className = `console__line ${line.t}`;
        con.append(div);
        if (reduced) { div.textContent = line.s; continue; }
        const speed = line.t === 'cmd' ? 22 : 6;
        for (let i = 1; i <= line.s.length; i++) {
          div.textContent = line.s.slice(0, i);
          await new Promise((r) => setTimeout(r, speed));
        }
        await new Promise((r) => setTimeout(r, line.t === 'cmd' ? 380 : 120));
      }
      btn.textContent = `↻ ${btn.dataset.rerunLabel}`;
      running = false;
    });
  });
}

/* ---------- Experience ---------- */
function experience() {
  $$('[data-log]').forEach((item) => {
    const head = $('.log__head', item)!;
    head.addEventListener('click', () => {
      const open = item.classList.toggle('is-open');
      head.setAttribute('aria-expanded', String(open));
      setTimeout(() => ScrollTrigger.refresh(), 520);
    });
  });
  if (reduced) return;
  const frames = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏';
  $$('[data-log]').forEach((item, idx) => {
    const st = $('[data-status]', item)!;
    st.classList.remove('pass');
    st.textContent = '[ .. ]';
    gsap.from(item, { opacity: 0, x: -30, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: item, start: 'top 90%' } });
    ScrollTrigger.create({
      trigger: item, start: 'top 85%', once: true,
      onEnter: () => {
        let f = 0;
        const spin = setInterval(() => (st.textContent = `[ ${frames[f++ % frames.length]}  ]`), 70);
        setTimeout(() => {
          clearInterval(spin);
          st.textContent = '[PASS]';
          st.classList.add('pass');
          gsap.fromTo(st, { scale: 1.4 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
        }, 650 + idx * 120);
      },
    });
  });
}

/* ---------- Rates ---------- */
function rates() {
  const est = $('[data-estimator]');
  if (est) {
    const min = Number(est.dataset.min), max = Number(est.dataset.max);
    const input = $<HTMLInputElement>('input', est)!;
    const out = $('[data-est-out]', est)!, hrs = $('[data-est-hours]', est)!;
    const fmt = (n: number) => '$' + Math.round(n).toLocaleString('en-US');
    const state = { lo: 0, hi: 0 };
    const update = (animate: boolean) => {
      const h = Number(input.value);
      hrs.textContent = `${h} h`;
      input.style.setProperty('--p', `${((h - Number(input.min)) / (Number(input.max) - Number(input.min))) * 100}%`);
      const to = { lo: h * min, hi: h * max };
      if (!animate || reduced) { Object.assign(state, to); out.textContent = `${fmt(state.lo)} – ${fmt(state.hi)}`; return; }
      gsap.to(state, { ...to, duration: 0.5, ease: 'power3.out', overwrite: true, onUpdate: () => (out.textContent = `${fmt(state.lo)} – ${fmt(state.hi)}`) });
    };
    input.addEventListener('input', () => update(true));
    update(false);
  }
  if (reduced) return;
  $$('[data-count]').forEach((el) => {
    const to = Number(el.dataset.count);
    const o = { v: 0 };
    el.textContent = '0';
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => gsap.to(o, { v: to, duration: 1.6, ease: 'expo.out', onUpdate: () => (el.textContent = String(Math.round(o.v))) }),
    });
  });
}

/* ---------- Hire form ---------- */
function hireForm() {
  const form = $<HTMLFormElement>('[data-hire-form]');
  if (!form) return;
  const res = $('[data-res]', form)!;
  const fields = ['name', 'email', 'message'] as const;
  const err = (k: string) => $(`[data-err="${k}"]`, form)!;
  fields.forEach((k) => form.elements.namedItem(k)?.addEventListener('input', () => (err(k).textContent = '')));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const get = (k: string) => ((form.elements.namedItem(k) as HTMLInputElement).value || '').trim();
    const v = { name: get('name'), email: get('email'), message: get('message') };
    const bad: Record<string, boolean> = { name: !v.name, email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email), message: v.message.length < 5 };
    let first: string | null = null;
    fields.forEach((k) => {
      err(k).textContent = bad[k] ? err(k).dataset.msg ?? '' : '';
      if (bad[k] && !first) first = k;
    });
    if (first) {
      (form.elements.namedItem(first) as HTMLElement).focus();
      if (!reduced) gsap.fromTo(form, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
      return;
    }
    const subject = `${form.dataset.subject} ${v.name}`;
    const body = `${v.message}\n\n— ${v.name} (${v.email})`;
    window.location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    res.textContent = res.dataset.msg ?? '';
    if (!reduced) gsap.fromTo(res, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.6, ease: 'expo.out' });
  });
}
