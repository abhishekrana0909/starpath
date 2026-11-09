// Cursor glow, sparkle trail, twinkling stars, card spotlight, 3D tilt, magnetic buttons, scroll reveal.
const fine = matchMedia('(pointer: fine)').matches;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initFX() {
  const canvas = document.getElementById('fx');
  const ctx = canvas.getContext('2d');
  const dot = document.getElementById('cur-dot');
  const ring = document.getElementById('cur-ring');
  let W = 0, H = 0, dpr = 1;
  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize(); addEventListener('resize', resize);

  // stars
  const stars = Array.from({ length: innerWidth < 700 ? 70 : 150 }, () => ({
    x: Math.random(), y: Math.random(), z: Math.random() * 0.9 + 0.1, ph: Math.random() * 6.28, sp: 0.5 + Math.random() * 1.5,
  }));
  const sparks = [];
  const m = { x: W / 2, y: H / 2, rx: W / 2, ry: H / 2, px: W / 2, py: H / 2 };
  addEventListener('pointermove', (e) => {
    m.x = e.clientX; m.y = e.clientY;
    if (fine && !reduce) {
      const dx = m.x - m.px, dy = m.y - m.py;
      const dist = Math.hypot(dx, dy);
      const n = Math.min(3, Math.floor(dist / 14));
      for (let i = 0; i < n; i++) {
        sparks.push({
          x: m.x + (Math.random() - 0.5) * 6, y: m.y + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 0.6, vy: -0.3 - Math.random() * 0.7,
          life: 1, r: 1 + Math.random() * 2, hue: 35 + Math.random() * 230,
        });
      }
      m.px = m.x; m.py = m.y;
    }
    // spotlight on glass cards
    const card = e.target.closest && e.target.closest('.glass');
    if (card) {
      const b = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - b.left) + 'px');
      card.style.setProperty('--my', (e.clientY - b.top) + 'px');
    }
    // tilt
    const tilt = e.target.closest && e.target.closest('.tilt');
    if (tilt && !reduce) {
      const b = tilt.getBoundingClientRect();
      const px = (e.clientX - b.left) / b.width - 0.5, py = (e.clientY - b.top) / b.height - 0.5;
      tilt.style.transform = `perspective(700px) rotateX(${(-py * 12).toFixed(2)}deg) rotateY(${(px * 14).toFixed(2)}deg) translateZ(8px)`;
    }
    // magnetic
    const mag = e.target.closest && e.target.closest('.magnetic');
    if (mag && !reduce) {
      const b = mag.getBoundingClientRect();
      mag.style.transform = `translate(${((e.clientX - (b.left + b.width / 2)) * 0.22).toFixed(1)}px, ${((e.clientY - (b.top + b.height / 2)) * 0.3).toFixed(1)}px)`;
    }
  }, { passive: true });
  addEventListener('pointerout', (e) => {
    const t = e.target.closest && e.target.closest('.tilt, .magnetic');
    if (t && !t.contains(e.relatedTarget)) t.style.transform = '';
  });

  if (fine) {
    document.body.classList.add('has-cursor');
    const hoverSel = 'a, button, .glass, .chip, input, select, textarea, canvas, [data-hover], .house, .pl';
    document.addEventListener('pointerover', (e) => {
      if (e.target.closest && e.target.closest(hoverSel)) document.body.classList.add('cur-hover');
    });
    document.addEventListener('pointerout', (e) => {
      if (!e.relatedTarget || !(e.relatedTarget.closest && e.relatedTarget.closest(hoverSel))) document.body.classList.remove('cur-hover');
    });
    addEventListener('mousedown', () => document.body.classList.add('cur-down'));
    addEventListener('mouseup', () => document.body.classList.remove('cur-down'));
  }

  let t0 = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.05, (now - t0) / 1000); t0 = now;
    ctx.clearRect(0, 0, W, H);
    // stars with slight mouse + scroll parallax
    const ox = (m.x / W - 0.5), oy = (m.y / H - 0.5);
    for (const s of stars) {
      const x = ((s.x * W - ox * 30 * s.z) % W + W) % W;
      const y = ((s.y * H - oy * 30 * s.z - scrollY * 0.06 * s.z) % H + H) % H;
      s.ph += dt * s.sp;
      const a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(s.ph));
      ctx.globalAlpha = a * s.z;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x, y, 0.4 + s.z * 1.1, 0, 6.283); ctx.fill();
    }
    // sparks
    ctx.globalCompositeOperation = 'lighter';
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.x += p.vx; p.y += p.vy; p.life -= dt * 1.1; p.vy += 0.004;
      if (p.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.globalAlpha = p.life * 0.8;
      ctx.fillStyle = `hsl(${p.hue},95%,70%)`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * p.life, 0, 6.283); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    if (fine) {
      m.rx += (m.x - m.rx) * 0.18; m.ry += (m.y - m.ry) * 0.18;
      dot.style.transform = `translate(${m.x}px, ${m.y}px)`;
      ring.style.transform = `translate(${m.rx}px, ${m.ry}px)`;
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

let io;
/** Fade/slide elements in as they enter the viewport. */
export function observeReveals(root = document) {
  if (!io) {
    io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  }
  root.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el));
}
