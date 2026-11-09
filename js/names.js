// Name -> naming syllable -> nakshatra pada -> rashi (traditional Hindu naming).
import { NAK_SYLLABLES } from './data.js';

const ALL = [];
NAK_SYLLABLES.forEach((arr, nak) => arr.forEach((syl, p) => ALL.push({ syl, nak, pada: p + 1 })));
const SYLS = [...new Set(ALL.map((x) => x.syl))].sort((a, b) => b.length - a.length);
export const rashiOfPada = (nak, pada) => Math.floor((nak * 4 + (pada - 1)) / 9);

const CONS = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n', 'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm', 'य': 'y', 'र': 'r', 'ल': 'l',
  'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
};
const MATRA = { 'ा': 'a', 'ि': 'i', 'ी': 'i', 'ु': 'u', 'ू': 'u', 'े': 'e', 'ै': 'e', 'ो': 'o', 'ौ': 'o' };
const VOW = { 'अ': 'a', 'आ': 'a', 'इ': 'i', 'ई': 'i', 'उ': 'u', 'ऊ': 'u', 'ए': 'e', 'ऐ': 'e', 'ओ': 'o', 'औ': 'o' };

function devToRoman(s) {
  const ch = [...s.trim()];
  const c0 = ch[0];
  if (!c0) return '';
  if (VOW[c0]) return VOW[c0];
  if (c0 === 'ङ') return 'ng';
  if (c0 === 'ञ') return 'yna';
  if (CONS[c0]) {
    let rest = '';
    let nxt = ch[1];
    if (nxt === '़' || nxt === 'ं' || nxt === 'ँ') nxt = ch[2];
    if (nxt && MATRA[nxt]) rest = MATRA[nxt];
    else if (nxt === '्') return CONS[c0]; // half letter: take the consonant only
    else rest = 'a';
    if (c0 === 'थ' && rest === 'a' && !(nxt && MATRA[nxt])) return 'th'; // bare थ
    return CONS[c0] + rest;
  }
  return '';
}

function normRoman(s) {
  return s.toLowerCase().replace(/[^a-z]/g, '').replace(/aa/g, 'a').replace(/ee/g, 'i').replace(/oo/g, 'u').replace(/^w/, 'v').replace(/^c(?=[aou])/, 'k').replace(/^q/, 'k');
}

/** Returns { syl, entries:[{nak,pada,rashi}] } or null. */
export function matchName(raw) {
  const name = (raw || '').trim();
  if (!name) return null;
  const isDev = /[ऀ-ॿ]/.test(name);
  const roman = isDev ? devToRoman(name) : normRoman(name);
  if (!roman) return null;
  let found = SYLS.find((s) => roman.startsWith(s));
  if (!found) { // fallback: leading consonant cluster + 'a' (Shyam -> sha)
    const m = roman.match(/^[^aeiou]+/);
    if (m) {
      for (let n = Math.min(3, m[0].length); n >= 1; n--) {
        const t = m[0].slice(0, n) + 'a';
        if (SYLS.includes(t)) { found = t; break; }
      }
    }
  }
  if (!found) return null;
  const entries = ALL.filter((x) => x.syl === found).map((x) => ({ nak: x.nak, pada: x.pada, rashi: rashiOfPada(x.nak, x.pada) }));
  return { syl: found, entries };
}
