import { RASHI, PLANETS, ELEMENTS, QUALITIES, NAKSHATRA } from './data.js';
import { L } from './i18n.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** 'Krittika (2-4)' -> localized nakshatra name plus the pada range. */
export function nakLabel(s) {
  const m = String(s).match(/^(.*?)\s*(\(.*\))?$/);
  const hit = NAKSHATRA.find((n) => n[0] === m[1].trim());
  return hit ? L(hit) + (m[2] ? ' ' + m[2] : '') : s;
}
export const nakList = (arr) => arr.map(nakLabel).join(', ');

export const rashiKeyIdx =(key) => RASHI.findIndex((r) => r.key === key);
export const rashiName = (i) => L(RASHI[i].n);
export const planetName = (id) => L(PLANETS[id].n);
export const elementName = (i) => L(ELEMENTS[RASHI[i].el]);
export const qualityName = (i) => L(QUALITIES[RASHI[i].q]);

export function starsHtml(n, max = 5) {
  let s = '<span class="stars" aria-label="' + n + ' / ' + max + '">';
  for (let i = 1; i <= max; i++) s += `<i class="${i <= n ? 'on' : ''}" style="--i:${i}">★</i>`;
  return s + '</span>';
}

export function bar(pct, cls = '') {
  return `<span class="bar ${cls}"><b style="--w:${Math.max(0, Math.min(100, pct))}%"></b></span>`;
}

export function chip(label, extra = '') {
  return `<span class="chip ${extra}">${label}</span>`;
}

/** count-up animation for elements with data-count */
export function runCounters(root = document) {
  root.querySelectorAll('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const dec = el.dataset.dec ? parseInt(el.dataset.dec, 10) : 0;
    const dur = 1400, t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = (end * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

export const pad2 = (n) => String(n).padStart(2, '0');
export const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; };

export function store(key, val) {
  try {
    if (val === undefined) return JSON.parse(localStorage.getItem('sp_' + key));
    localStorage.setItem('sp_' + key, JSON.stringify(val));
  } catch (e) { return null; }
  return null;
}
