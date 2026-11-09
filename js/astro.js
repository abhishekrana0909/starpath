// StarPath astro engine — sidereal (Lahiri) positions from astronomy-engine (JPL-based).
import * as Astronomy from '../vendor/astronomy.js';
import {
  RASHI_LORD, EXALT, DEBIL, OWN, DASHA_ORDER, DASHA_YEARS,
  KARANA_FIXED, KARANA_REPEAT,
} from './data.js';

export { Astronomy };

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
export const norm = (x) => ((x % 360) + 360) % 360;

// Lahiri (Chitrapaksha) ayanamsa at J2000.0 relative to mean ecliptic = 23.857092° (Swiss Ephemeris SE_SIDM_LAHIRI)
export const AYANAMSA_J2000 = 23.857092;
const EPS_J2000 = 23.4392911;
const SIDEREAL_YEAR_DAYS = 365.25;

export const jdOf = (date) => date.getTime() / 86400000 + 2440587.5;
const T_OF = (date) => (jdOf(date) - 2451545.0) / 36525;

/** Lahiri ayanamsa for a date (degrees): J2000 value + accumulated general precession in longitude. */
export function ayanamsa(date) {
  const T = T_OF(date);
  return AYANAMSA_J2000 + (5028.796195 * T + 1.1054348 * T * T) / 3600;
}

/** Geocentric ecliptic longitude (degrees, J2000 mean ecliptic) of a body. */
function eclLonJ2000(vec) {
  const ce = Math.cos(EPS_J2000 * D2R), se = Math.sin(EPS_J2000 * D2R);
  const y = vec.y * ce + vec.z * se;
  return norm(Math.atan2(y, vec.x) * R2D);
}

/** Sidereal (Lahiri) geocentric longitude of Sun/Moon/planets. */
export function siderealLon(body, date) {
  const v = Astronomy.GeoVector(body, date, true);
  return norm(eclLonJ2000(v) - AYANAMSA_J2000);
}

/** Mean lunar node (Rahu), sidereal. Ketu is +180. */
export function rahuLon(date) {
  const T = T_OF(date);
  const om = 125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + (T * T * T) / 467441 - (T * T * T * T) / 60616000;
  return norm(om - ayanamsa(date));
}

/** Sidereal ascendant (lagna) for a UTC date, geographic lat / east-positive lon (degrees). */
export function ascendant(date, lat, lon) {
  const T = T_OF(date);
  const gast = Astronomy.SiderealTime(date) * 15;
  const theta = norm(gast + lon) * D2R;
  const eps = (23.439291111 - 0.013004167 * T) * D2R;
  const phi = lat * D2R;
  const asc = Math.atan2(Math.cos(theta), -(Math.sin(theta) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps))) * R2D;
  return norm(norm(asc) - ayanamsa(date));
}

export const rashiOf = (lon) => Math.floor(norm(lon) / 30);
export const degInRashi = (lon) => norm(lon) % 30;
export const NAK_LEN = 360 / 27;
export const nakshatraOf = (lon) => Math.floor(norm(lon) / NAK_LEN);
export const padaOf = (lon) => Math.floor((norm(lon) % NAK_LEN) / (NAK_LEN / 4)) + 1;
export const navamsaRashi = (lon) => Math.floor(norm(lon) / (30 / 9)) % 12;

export function dignityOf(id, rashi) {
  if (EXALT[id] === rashi) return 'exalted';
  if (DEBIL[id] === rashi) return 'debilitated';
  if (OWN[id] && OWN[id].includes(rashi)) return 'own';
  return '';
}

const MAIN = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

function isRetro(body, date) {
  if (body === 'Sun' || body === 'Moon') return false;
  const a = siderealLon(body, new Date(date.getTime() - 43200000));
  const b = siderealLon(body, new Date(date.getTime() + 43200000));
  let d = b - a;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d < 0;
}

/** All 9 grahas at an instant. */
export function grahas(date) {
  const out = {};
  for (const id of MAIN) {
    const lon = siderealLon(id, date);
    out[id] = { id, lon, retro: isRetro(id, date) };
  }
  const r = rahuLon(date);
  out.Rahu = { id: 'Rahu', lon: r, retro: true };
  out.Ketu = { id: 'Ketu', lon: norm(r + 180), retro: true };
  for (const id of Object.keys(out)) {
    const g = out[id];
    g.rashi = rashiOf(g.lon);
    g.deg = degInRashi(g.lon);
    g.nak = nakshatraOf(g.lon);
    g.pada = padaOf(g.lon);
    g.dignity = dignityOf(id, g.rashi);
  }
  return out;
}

/** Full kundli: lagna, 9 grahas, whole-sign houses, navamsa, dasha, panchang. */
export function kundli(date, lat, lon) {
  const g = grahas(date);
  const asc = ascendant(date, lat, lon);
  const lagna = { lon: asc, rashi: rashiOf(asc), deg: degInRashi(asc), nak: nakshatraOf(asc), pada: padaOf(asc) };
  for (const id of Object.keys(g)) g[id].house = ((g[id].rashi - lagna.rashi + 12) % 12) + 1;
  const navLagna = navamsaRashi(asc);
  const nav = {};
  for (const id of Object.keys(g)) nav[id] = navamsaRashi(g[id].lon);
  return {
    date, lat, lon, ayanamsa: ayanamsa(date),
    lagna, grahas: g,
    navamsa: { lagna: navLagna, grahas: nav },
    moon: g.Moon,
    dasha: vimshottari(g.Moon.lon, date),
    panchang: panchang(date),
  };
}

/** Moon sign details only (used by rashi finder / milan). */
export function moonDetails(date) {
  const lon = siderealLon('Moon', date);
  return { lon, rashi: rashiOf(lon), deg: degInRashi(lon), nak: nakshatraOf(lon), pada: padaOf(lon) };
}

export function sunDetails(date) {
  const lon = siderealLon('Sun', date);
  return { lon, rashi: rashiOf(lon), deg: degInRashi(lon) };
}

// ---------------- Vimshottari dasha ----------------
export function vimshottari(moonLon, birth) {
  const nak = nakshatraOf(moonLon);
  const frac = (norm(moonLon) % NAK_LEN) / NAK_LEN; // part elapsed
  const startIdx = nak % 9;
  const lord0 = DASHA_ORDER[startIdx];
  const balanceYears = DASHA_YEARS[lord0] * (1 - frac);
  const dayMs = 86400000 * SIDEREAL_YEAR_DAYS;
  const list = [];
  let cursor = birth.getTime();
  for (let i = 0; i < 9 + 1; i++) {
    const lord = DASHA_ORDER[(startIdx + i) % 9];
    const years = i === 0 ? balanceYears : DASHA_YEARS[lord];
    const start = new Date(cursor);
    cursor += years * dayMs;
    list.push({ lord, start, end: new Date(cursor), years, partial: i === 0 });
  }
  const now = Date.now();
  for (const d of list) d.antar = antardashas(d, now);
  return list;
}
function antardashas(md, now) {
  // Full mahadasha length (even if the first is partial) = DASHA_YEARS[lord]
  const full = DASHA_YEARS[md.lord];
  const dayMs = 86400000 * SIDEREAL_YEAR_DAYS;
  const endMs = md.end.getTime();
  const startFullMs = md.partial ? endMs - full * dayMs : md.start.getTime();
  const startIdx = DASHA_ORDER.indexOf(md.lord);
  const out = [];
  let cursor = startFullMs;
  for (let i = 0; i < 9; i++) {
    const lord = DASHA_ORDER[(startIdx + i) % 9];
    const len = (full * DASHA_YEARS[lord] / 120) * dayMs;
    const s = cursor, e = cursor + len;
    cursor = e;
    if (e <= md.start.getTime()) continue;
    out.push({ lord, start: new Date(Math.max(s, md.start.getTime())), end: new Date(e), current: now >= s && now < e });
  }
  return out;
}

// ---------------- Panchang ----------------
export function panchang(date) {
  const sun = siderealLon('Sun', date);
  const moon = siderealLon('Moon', date);
  const elong = norm(moon - sun);
  const tithiNo = Math.floor(elong / 12) + 1; // 1..30
  const paksha = tithiNo <= 15 ? 'shukla' : 'krishna';
  const tithiInPaksha = ((tithiNo - 1) % 15) + 1; // 1..15
  const yogaNo = Math.floor(norm(sun + moon) / NAK_LEN); // 0..26
  const k = Math.floor(elong / 6); // 0..59
  let karana;
  if (KARANA_FIXED[k]) karana = KARANA_FIXED[k];
  else karana = KARANA_REPEAT[(k - 1) % 7];
  return {
    sun, moon, elong,
    tithiNo, tithiInPaksha, paksha,
    isAmavasya: tithiNo === 30,
    isPurnima: tithiNo === 15,
    nakshatra: nakshatraOf(moon), pada: padaOf(moon),
    yoga: yogaNo, karana,
    moonRashi: rashiOf(moon), sunRashi: rashiOf(sun),
    weekday: date.getDay(),
    illumination: (1 - Math.cos(elong * D2R)) / 2,
  };
}

// ---------------- Helpers ----------------
/** Build a UTC Date from local civil date/time and a timezone offset in hours (e.g. 5.5 for IST). */
export function toUTC(y, m, d, hh, mm, tzHours) {
  return new Date(Date.UTC(y, m - 1, d, hh, mm, 0) - tzHours * 3600000);
}

export const fmtDeg = (d) => {
  const deg = Math.floor(d);
  const min = Math.floor((d - deg) * 60);
  const sec = Math.floor(((d - deg) * 60 - min) * 60);
  return `${deg}°${String(min).padStart(2, '0')}′${String(sec).padStart(2, '0')}″`;
};

/** Tropical (Western) sun sign from civil date; 0 = Aries. */
export function tropicalSunSign(month, day) {
  const md = month * 100 + day;
  if (md >= 1222 || md < 120) return 9;
  if (md < 219) return 10;
  if (md < 321) return 11;
  const starts = [321, 420, 521, 621, 723, 823, 923, 1023, 1122, 1222];
  for (let i = 0; i < 9; i++) if (md >= starts[i] && md < starts[i + 1]) return i;
  return 0;
}

export { RASHI_LORD };
