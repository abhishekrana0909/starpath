// SVG kundli charts: North Indian (diamond) and South Indian (grid). Return HTML strings.
import { PLANETS, RASHI } from './data.js';
import { L, isHi } from './i18n.js';

const ABBR = {
  Sun: ['Su', 'सू'], Moon: ['Mo', 'चं'], Mars: ['Ma', 'मं'], Mercury: ['Me', 'बु'], Jupiter: ['Ju', 'गु'],
  Venus: ['Ve', 'शु'], Saturn: ['Sa', 'श'], Rahu: ['Ra', 'रा'], Ketu: ['Ke', 'के'],
};
const abbr = (id) => L(ABBR[id]);

// North Indian: polygon + label anchor points for houses 1..12 in a 400x400 box
const NORTH = [
  { p: '200,0 300,100 200,200 100,100', num: [200, 165], pl: [200, 88] },
  { p: '0,0 200,0 100,100', num: [100, 70], pl: [100, 30] },
  { p: '0,0 100,100 0,200', num: [70, 100], pl: [28, 100] },
  { p: '0,200 100,100 200,200 100,300', num: [165, 200], pl: [92, 200] },
  { p: '0,200 100,300 0,400', num: [70, 300], pl: [28, 300] },
  { p: '0,400 100,300 200,400', num: [100, 330], pl: [100, 372] },
  { p: '200,400 100,300 200,200 300,300', num: [200, 238], pl: [200, 318] },
  { p: '200,400 300,300 400,400', num: [300, 330], pl: [300, 372] },
  { p: '400,400 300,300 400,200', num: [330, 300], pl: [372, 300] },
  { p: '400,200 300,300 200,200 300,100', num: [238, 200], pl: [310, 200] },
  { p: '400,200 300,100 400,0', num: [330, 100], pl: [372, 100] },
  { p: '400,0 300,100 200,0', num: [300, 70], pl: [300, 30] },
];

function planetTexts(list, x, y, delay0 = 0) {
  if (!list.length) return '';
  const lh = list.length > 3 ? 15 : 18;
  const startY = y - ((list.length - 1) * lh) / 2;
  return list.map((g, i) => {
    const mark = g.retro && g.id !== 'Rahu' && g.id !== 'Ketu' ? '℞' : '';
    return `<text class="pl" data-id="${g.id}" x="${x}" y="${startY + i * lh}" fill="${PLANETS[g.id].color}" style="animation-delay:${(delay0 + i * 0.09).toFixed(2)}s">${abbr(g.id)}${mark ? `<tspan class="rx" dx="1">${mark}</tspan>` : ''}</text>`;
  }).join('');
}

/**
 * @param {number} lagnaRashi 0..11
 * @param {Array<{id,rashi,retro}>} grahas
 */
export function northChart(lagnaRashi, grahas, withAsc = true) {
  let out = '<svg class="chart north" viewBox="-6 -6 412 412" role="img" aria-label="North Indian kundli chart">';
  out += '<defs><linearGradient id="gHouse" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd27a" stop-opacity=".30"/><stop offset="1" stop-color="#8b6bff" stop-opacity=".20"/></linearGradient></defs>';
  out += '<rect x="0" y="0" width="400" height="400" rx="6" class="frame"/>';
  for (let h = 1; h <= 12; h++) {
    const rashi = (lagnaRashi + h - 1) % 12;
    const here = grahas.filter((g) => g.rashi === rashi);
    const d = NORTH[h - 1];
    out += `<g class="house" data-h="${h}" data-rashi="${rashi}"><polygon points="${d.p}"/>`;
    out += `<text class="rn" x="${d.num[0]}" y="${d.num[1]}">${rashi + 1}</text>`;
    if (h === 1 && withAsc) out += `<text class="asc" x="${d.pl[0]}" y="${d.pl[1] - 26}">${isHi() ? 'लग्न' : 'Asc'}</text>`;
    out += planetTexts(here, d.pl[0], d.pl[1] + (h === 1 && withAsc ? 6 : 0), h * 0.05);
    out += '</g>';
  }
  out += '</svg>';
  return out;
}

// South Indian: sign positions are fixed. cell index = row*4+col
const SOUTH_CELLS = { 11: [0, 0], 0: [0, 1], 1: [0, 2], 2: [0, 3], 3: [1, 3], 4: [2, 3], 5: [3, 3], 6: [3, 2], 7: [3, 1], 8: [3, 0], 9: [2, 0], 10: [1, 0] };

export function southChart(lagnaRashi, grahas, centerLines = []) {
  const S = 100;
  let out = '<svg class="chart south" viewBox="-6 -6 412 412" role="img" aria-label="South Indian kundli chart">';
  out += '<rect x="0" y="0" width="400" height="400" rx="6" class="frame"/>';
  for (let r = 0; r < 12; r++) {
    const [row, col] = SOUTH_CELLS[r];
    const x = col * S, y = row * S;
    const here = grahas.filter((g) => g.rashi === r);
    const house = ((r - lagnaRashi + 12) % 12) + 1;
    out += `<g class="house" data-h="${house}" data-rashi="${r}"><rect x="${x}" y="${y}" width="${S}" height="${S}"/>`;
    out += `<text class="rn" x="${x + 9}" y="${y + 16}" text-anchor="start">${r + 1}</text>`;
    if (r === lagnaRashi) out += `<line class="asc-line" x1="${x}" y1="${y}" x2="${x + 20}" y2="${y + 20}"/><text class="asc" x="${x + S - 8}" y="${y + 16}" text-anchor="end">${isHi() ? 'लग्न' : 'Asc'}</text>`;
    out += planetTexts(here, x + S / 2, y + S / 2 + 4, r * 0.05);
    out += '</g>';
  }
  centerLines.forEach((ln, i) => { out += `<text class="ctr" x="200" y="${178 + i * 22}">${ln}</text>`; });
  out += '</svg>';
  return out;
}

/** Orbiting decorative rings behind a chart (pure CSS-animated SVG). */
export function orbitRings(size = 460) {
  const c = size / 2;
  return `<svg class="orbit-rings" viewBox="0 0 ${size} ${size}" aria-hidden="true">
    <g class="spin-a"><circle cx="${c}" cy="${c}" r="${c - 8}" fill="none" stroke="rgba(255,210,122,.35)" stroke-dasharray="2 10"/><circle cx="${c}" cy="${8}" r="5" fill="#ffd27a"/></g>
    <g class="spin-b"><circle cx="${c}" cy="${c}" r="${c - 34}" fill="none" stroke="rgba(139,107,255,.35)" stroke-dasharray="4 14"/><circle cx="${c}" cy="${34}" r="4" fill="#8b6bff"/></g>
    <g class="spin-c"><circle cx="${c}" cy="${c}" r="${c - 60}" fill="none" stroke="rgba(62,224,200,.30)" stroke-dasharray="1 8"/><circle cx="${c}" cy="${60}" r="3.5" fill="#3ee0c8"/></g>
  </svg>`;
}

/** Small moon-phase SVG. illumination 0..1, waxing true/false. */
export function moonPhaseSvg(elong) {
  // elong 0..360 (moon - sun). 0 = new, 180 = full. Lit side on the right when waxing.
  const waxing = elong < 180;
  const k = Math.cos((elong * Math.PI) / 180); // 1 new .. -1 full
  const rx = Math.abs(k) * 50;
  const lit = '#f4f0dc', dark = '#1c2140';
  // lit half circle path + terminator ellipse
  const rightHalf = 'M50 0 A50 50 0 0 1 50 100 Z';
  const leftHalf = 'M50 0 A50 50 0 0 0 50 100 Z';
  let body = `<circle cx="50" cy="50" r="50" fill="${dark}"/>`;
  const sideLit = waxing ? rightHalf : leftHalf;
  body += `<path d="${sideLit}" fill="${lit}"/>`;
  // terminator: if crescent (|k|>0 and k>0) cover part of lit half with dark ellipse; gibbous add lit ellipse on dark side
  if (k > 0) body += `<ellipse cx="50" cy="50" rx="${rx}" ry="50" fill="${dark}"/>`;
  else body += `<ellipse cx="50" cy="50" rx="${rx}" ry="50" fill="${lit}"/>`;
  return `<svg class="moon-svg" viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="mg" cx=".5" cy=".5" r=".5"><stop offset=".7" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#cfe0ff" stop-opacity=".5"/></radialGradient></defs>${body}<circle cx="50" cy="50" r="50" fill="url(#mg)"/></svg>`;
}

/** 27-nakshatra wheel; highlights `current`. */
export function nakshatraWheel(current, names) {
  const R = 150, r = 98, cx = 170, cy = 170;
  let out = `<svg class="nak-wheel" viewBox="0 0 340 340" aria-label="Nakshatra wheel"><g class="nak-spin">`;
  const seg = 360 / 27;
  for (let i = 0; i < 27; i++) {
    const a0 = (i * seg - 90) * Math.PI / 180, a1 = ((i + 1) * seg - 90) * Math.PI / 180;
    const p = (a, rad) => [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad];
    const [x0, y0] = p(a0, R), [x1, y1] = p(a1, R), [x2, y2] = p(a1, r), [x3, y3] = p(a0, r);
    const mid = (a0 + a1) / 2, [tx, ty] = p(mid, (R + r) / 2);
    const rot = (mid * 180) / Math.PI + 90;
    out += `<g class="nk ${i === current ? 'cur' : ''}" data-n="${i}"><path d="M${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1} L${x2} ${y2} A${r} ${r} 0 0 0 ${x3} ${y3} Z"/>`;
    out += `<text x="${tx}" y="${ty}" transform="rotate(${rot} ${tx} ${ty})">${i + 1}</text></g>`;
  }
  out += `</g><circle cx="${cx}" cy="${cy}" r="${r - 8}" class="nk-core"/>`;
  out += `<text x="${cx}" y="${cy - 8}" class="nk-sub">${isHi() ? 'आज का नक्षत्र' : "Today's nakshatra"}</text><text x="${cx}" y="${cy + 18}" class="nk-name">${L(names[current])}</text>`;
  out += '</svg>';
  return out;
}

export { RASHI };
