// Ashtakoota (36 guna) matching. Based on Moon rashi + nakshatra of bride and groom.
// Tables follow the commonly published set; a few cells (Vashya, Gana) differ slightly between traditions.
import { RASHI_LORD } from './data.js';

// ---- 1. VARNA (1) ----
// Brahmin > Kshatriya > Vaishya > Shudra (by rashi)
// Mesh K, Vrishabh V, Mithun S, Kark B, Simha K, Kanya V, Tula S, Vrishchik B, Dhanu K, Makar V, Kumbh S, Meen B
const VARNA_RANK = { B: 3, K: 2, V: 1, S: 0 };
const VARNA_OF = ['K', 'V', 'S', 'B', 'K', 'V', 'S', 'B', 'K', 'V', 'S', 'B'];
export const VARNA_NAMES = { B: ['Brahmin', 'ब्राह्मण'], K: ['Kshatriya', 'क्षत्रिय'], V: ['Vaishya', 'वैश्य'], S: ['Shudra', 'शूद्र'] };

// ---- 2. VASHYA (2) ----
// 0 Chatushpada, 1 Manava, 2 Jalachara, 3 Vanachara, 4 Keeta
export const VASHYA_NAMES = [['Chatushpada', 'चतुष्पद'], ['Manava', 'मानव'], ['Jalachara', 'जलचर'], ['Vanachara', 'वनचर'], ['Keeta', 'कीट']];
function vashyaOf(rashi, degInRashi) {
  if (rashi === 8) return degInRashi < 15 ? 1 : 0;   // Dhanu: 1st half human, 2nd half quadruped
  if (rashi === 9) return degInRashi < 15 ? 0 : 2;   // Makar: 1st half quadruped, 2nd half water
  return [0, 0, 1, 2, 3, 1, 1, 4, 1, 0, 1, 2][rashi];
}
// rows: groom, columns: bride
const VASHYA_TBL = [
  [2, 1, 1, 1.5, 1],
  [1, 2, 1.5, 0, 1],
  [1, 1.5, 2, 1, 1],
  [0, 0, 0, 2, 0],
  [1, 1, 1, 0, 2],
];

// ---- 3. TARA (3) ----
const TARA_NAMES = [['Janma', 'जन्म'], ['Sampat', 'संपत'], ['Vipat', 'विपत'], ['Kshema', 'क्षेम'], ['Pratyari', 'प्रत्यरि'], ['Sadhaka', 'साधक'], ['Vadha', 'वध'], ['Mitra', 'मित्र'], ['Parama Mitra', 'परम मित्र']];
const BAD_TARA = new Set([2, 4, 6]); // Vipat, Pratyari, Vadha (0-based index)

// ---- 4. YONI (4) ----
export const YONI_NAMES = [['Horse', 'अश्व'], ['Elephant', 'गज'], ['Sheep', 'मेष'], ['Serpent', 'सर्प'], ['Dog', 'श्वान'], ['Cat', 'मार्जार'], ['Rat', 'मूषक'],
  ['Cow', 'गौ'], ['Buffalo', 'महिष'], ['Tiger', 'व्याघ्र'], ['Deer', 'मृग'], ['Monkey', 'वानर'], ['Mongoose', 'नकुल'], ['Lion', 'सिंह']];
const NAK_YONI = [0, 1, 2, 3, 3, 4, 5, 2, 5, 6, 6, 7, 8, 9, 8, 9, 10, 10, 4, 11, 12, 11, 13, 0, 13, 7, 1];
const YONI_TBL = [
  [4, 2, 2, 3, 2, 2, 2, 1, 0, 1, 3, 3, 2, 1],
  [2, 4, 3, 3, 2, 2, 2, 2, 3, 1, 2, 3, 2, 0],
  [2, 3, 4, 2, 1, 2, 1, 3, 3, 1, 2, 0, 3, 1],
  [3, 3, 2, 4, 2, 1, 1, 1, 1, 2, 2, 2, 0, 2],
  [2, 2, 1, 2, 4, 2, 1, 2, 2, 1, 0, 2, 1, 1],
  [2, 2, 2, 1, 2, 4, 0, 2, 2, 1, 3, 3, 2, 1],
  [2, 2, 1, 1, 1, 0, 4, 2, 2, 2, 2, 2, 1, 2],
  [1, 2, 3, 1, 2, 2, 2, 4, 3, 0, 3, 2, 2, 1],
  [0, 3, 3, 1, 2, 2, 2, 3, 4, 1, 2, 2, 2, 1],
  [1, 1, 1, 2, 1, 1, 2, 0, 1, 4, 1, 1, 2, 1],
  [3, 2, 2, 2, 0, 3, 2, 3, 2, 1, 4, 2, 2, 1],
  [3, 3, 0, 2, 2, 3, 2, 2, 2, 1, 2, 4, 3, 2],
  [2, 2, 3, 0, 1, 2, 1, 2, 2, 2, 2, 3, 4, 2],
  [1, 0, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 2, 4],
];

// ---- 5. GRAHA MAITRI (5) ----
// 2 friend, 1 neutral, 0 enemy (row planet's view of column planet)
const F = { Sun: ['Moon', 'Mars', 'Jupiter'], Moon: ['Sun', 'Mercury'], Mars: ['Sun', 'Moon', 'Jupiter'], Mercury: ['Sun', 'Venus'], Jupiter: ['Sun', 'Moon', 'Mars'], Venus: ['Mercury', 'Saturn'], Saturn: ['Mercury', 'Venus'] };
const E = { Sun: ['Venus', 'Saturn'], Moon: [], Mars: ['Mercury'], Mercury: ['Moon'], Jupiter: ['Mercury', 'Venus'], Venus: ['Sun', 'Moon'], Saturn: ['Sun', 'Moon', 'Mars'] };
const rel = (a, b) => (a === b ? 2 : F[a].includes(b) ? 2 : E[a].includes(b) ? 0 : 1);
function maitriScore(lordA, lordB) {
  if (lordA === lordB) return 5;
  const a = rel(lordA, lordB), b = rel(lordB, lordA);
  const s = a + b;            // 4 both friends, 3 friend+neutral, 2 neutral+neutral or friend+enemy
  if (s === 4) return 5;
  if (s === 3) return 4;
  if (a === 1 && b === 1) return 3;
  if ((a === 2 && b === 0) || (a === 0 && b === 2)) return 1;
  if (s === 1) return 0.5;
  return 0;
}

// ---- 6. GANA (6) ----
// 0 Deva, 1 Manushya, 2 Rakshasa
export const GANA_NAMES = [['Deva', 'देव'], ['Manushya', 'मनुष्य'], ['Rakshasa', 'राक्षस']];
const NAK_GANA = [0, 1, 2, 1, 0, 1, 0, 0, 2, 2, 1, 1, 0, 2, 0, 2, 0, 2, 2, 1, 1, 0, 2, 2, 1, 1, 0];
// rows: bride, columns: groom
const GANA_TBL = [
  [6, 5, 0],
  [5, 6, 0],
  [1, 0, 6],
];

// ---- 7. BHAKOOT (7) ----
// distance from bride rashi to groom rashi (1..12); 2/12, 5/9, 6/8 are doshas
function bhakootScore(rB, rG) {
  const d = ((rG - rB + 12) % 12) + 1;
  return [2, 12, 5, 9, 6, 8].includes(d) ? 0 : 7;
}

// ---- 8. NADI (8) ----
// 0 Adi, 1 Madhya, 2 Antya
export const NADI_NAMES = [['Adi', 'आदि'], ['Madhya', 'मध्य'], ['Antya', 'अन्त्य']];
const NAK_NADI = [0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2];

/**
 * @param {{rashi:number, deg:number, nak:number}} bride
 * @param {{rashi:number, deg:number, nak:number}} groom
 */
export function ashtakoota(bride, groom) {
  const kootas = [];

  const vB = VARNA_OF[bride.rashi], vG = VARNA_OF[groom.rashi];
  kootas.push({ key: 'varna', max: 1, score: VARNA_RANK[vG] >= VARNA_RANK[vB] ? 1 : 0, bride: VARNA_NAMES[vB], groom: VARNA_NAMES[vG] });

  const wB = vashyaOf(bride.rashi, bride.deg), wG = vashyaOf(groom.rashi, groom.deg);
  kootas.push({ key: 'vashya', max: 2, score: VASHYA_TBL[wG][wB], bride: VASHYA_NAMES[wB], groom: VASHYA_NAMES[wG] });

  const t1 = ((groom.nak - bride.nak + 27) % 27) % 9; // bride -> groom
  const t2 = ((bride.nak - groom.nak + 27) % 27) % 9; // groom -> bride
  const bad = (BAD_TARA.has(t1) ? 1 : 0) + (BAD_TARA.has(t2) ? 1 : 0);
  kootas.push({ key: 'tara', max: 3, score: bad === 0 ? 3 : bad === 1 ? 1.5 : 0, bride: TARA_NAMES[t1], groom: TARA_NAMES[t2] });

  const yB = NAK_YONI[bride.nak], yG = NAK_YONI[groom.nak];
  kootas.push({ key: 'yoni', max: 4, score: YONI_TBL[yB][yG], bride: YONI_NAMES[yB], groom: YONI_NAMES[yG] });

  const lB = RASHI_LORD[bride.rashi], lG = RASHI_LORD[groom.rashi];
  kootas.push({ key: 'maitri', max: 5, score: maitriScore(lB, lG), bride: lB, groom: lG, planets: true });

  const gB = NAK_GANA[bride.nak], gG = NAK_GANA[groom.nak];
  kootas.push({ key: 'gana', max: 6, score: GANA_TBL[gB][gG], bride: GANA_NAMES[gB], groom: GANA_NAMES[gG] });

  kootas.push({ key: 'bhakoot', max: 7, score: bhakootScore(bride.rashi, groom.rashi), bride: bride.rashi, groom: groom.rashi, rashis: true });

  const nB = NAK_NADI[bride.nak], nG = NAK_NADI[groom.nak];
  kootas.push({ key: 'nadi', max: 8, score: nB === nG ? 0 : 8, bride: NADI_NAMES[nB], groom: NADI_NAMES[nG] });

  const total = kootas.reduce((s, k) => s + k.score, 0);
  const doshas = [];
  if (kootas[7].score === 0) doshas.push('nadi');
  if (kootas[6].score === 0) doshas.push('bhakoot');
  if (kootas[5].score === 0) doshas.push('gana');
  return { kootas, total, doshas };
}
