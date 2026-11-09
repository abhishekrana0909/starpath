// Rashifal engine — based on real planetary transits (gochar) from the natal Moon sign (Chandra rashi).
// The numbers (stars, houses, Sade Sati) are computed. The wording is picked from phrase banks.
import { siderealLon, rahuLon, rashiOf, norm, toUTC } from './astro.js';
import { PLANETS, WEEKDAY_LORD } from './data.js';

// Houses (counted from natal Moon) in which each transiting planet is traditionally favourable.
const GOOD = {
  Sun: [3, 6, 10, 11], Moon: [1, 3, 6, 7, 10, 11], Mars: [3, 6, 11], Mercury: [2, 4, 6, 8, 10, 11],
  Jupiter: [2, 5, 7, 9, 11], Venus: [1, 2, 3, 4, 5, 8, 9, 11, 12], Saturn: [3, 6, 11], Rahu: [3, 6, 10, 11], Ketu: [3, 6, 11],
};
const W_ALL = { Moon: 3, Sun: 1.5, Mars: 1, Mercury: 1, Jupiter: 1.5, Venus: 1, Saturn: 1.5, Rahu: 0.5 };
const W_CAT = {
  love:   { Venus: 2, Moon: 2, Jupiter: 1, Mars: 0.5 },
  career: { Sun: 2, Saturn: 1.5, Mercury: 1.5, Jupiter: 1, Mars: 0.5 },
  money:  { Jupiter: 2, Venus: 1.5, Mercury: 1.5, Moon: 1 },
  health: { Sun: 1.5, Mars: 1.5, Moon: 2, Saturn: 1 },
};
const SLOW = ['Jupiter', 'Saturn', 'Rahu', 'Mars', 'Sun', 'Venus', 'Mercury'];

export const houseFrom = (moonRashi, planetRashi) => ((planetRashi - moonRashi + 12) % 12) + 1;

/** Rashi of each transiting graha at an instant. */
export function transit(date) {
  const r = {};
  for (const id of ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']) r[id] = rashiOf(siderealLon(id, date));
  r.Rahu = rashiOf(rahuLon(date));
  r.Ketu = (r.Rahu + 6) % 12;
  return r;
}

function scoreWith(tr, moonRashi, weights) {
  let got = 0, tot = 0;
  for (const [id, w] of Object.entries(weights)) {
    tot += w;
    if (GOOD[id].includes(houseFrom(moonRashi, tr[id]))) got += w;
  }
  return got / tot; // 0..1
}
const toStars = (s) => Math.max(1, Math.min(5, 1 + Math.round(s * 4)));

// ---------------- phrase banks [en, hi] ----------------
const BANK = {
  overall: {
    high: [
      ['A bright, supportive day. Take that step you were postponing.', 'आज का दिन उज्ज्वल और सहयोगी है। जो काम टाल रहे थे, आज शुरू करें।'],
      ['Planets are on your side today. Confidence and good timing walk together.', 'आज ग्रह आपके पक्ष में हैं। आत्मविश्वास और सही समय दोनों साथ चल रहे हैं।'],
      ['A fruitful day. Good news or progress is likely in what you have been working on.', 'फलदायी दिन। जिस काम में लगे हैं उसमें अच्छी खबर या प्रगति मिल सकती है।'],
    ],
    mid: [
      ['A balanced day with mixed results. Steady effort will pay off.', 'मिला-जुला पर संतुलित दिन। लगातार प्रयास का फल मिलेगा।'],
      ['Neither fast nor slow. Do the important things first and avoid extra promises.', 'न तेज़ न धीमा दिन। ज़रूरी काम पहले करें और अनावश्यक वादे न करें।'],
      ['An average day that rewards patience. Small wins add up.', 'सामान्य दिन जो धैर्य का फल देता है। छोटी जीतें जुड़कर बड़ी बनती हैं।'],
    ],
    low: [
      ['A slow, testing day. Go gently, avoid arguments and big decisions.', 'थोड़ा धीमा और परीक्षा वाला दिन। संयम रखें, बहस और बड़े फ़ैसलों से बचें।'],
      ['Energy may feel low. Keep the day simple and protect your peace of mind.', 'ऊर्जा कम लग सकती है। दिन सरल रखें और मन की शांति बनाए रखें।'],
      ['Planets ask for caution today. Think twice before you speak or sign.', 'आज ग्रह सावधानी माँगते हैं। बोलने या हस्ताक्षर करने से पहले दो बार सोचें।'],
    ],
  },
  love: {
    high: [['Warmth and understanding with your partner. Single natives may meet someone special.', 'साथी के साथ गर्मजोशी और समझ बनी रहेगी। अविवाहितों को कोई खास मिल सकता है।'], ['Romance is in the air. Express what you feel.', 'रिश्तों में रोमांस का माहौल है। मन की बात कह दें।'], ['Family and friends bring joy. A sweet surprise is possible.', 'परिवार और मित्रों से खुशी मिलेगी। कोई सुखद आश्चर्य संभव है।']],
    mid: [['Relationships are steady. Small gestures matter more than big words.', 'रिश्ते स्थिर रहेंगे। बड़े शब्दों से ज़्यादा छोटे इशारे असर करेंगे।'], ['Talk openly, but pick the right time.', 'खुलकर बात करें पर सही समय चुनें।'], ['Neutral day for love. Give space and receive space.', 'प्रेम के लिए सामान्य दिन। जगह दें और जगह पाएँ।']],
    low: [['Misunderstandings can rise. Listen more, react less.', 'ग़लतफ़हमियाँ बढ़ सकती हैं। ज़्यादा सुनें, कम प्रतिक्रिया दें।'], ['Emotions run high. Do not decide anything about a relationship today.', 'भावनाएँ तेज़ हैं। आज रिश्ते को लेकर कोई फ़ैसला न लें।'], ['A little distance with loved ones. Patience will heal it.', 'अपनों से थोड़ी दूरी महसूस हो सकती है। धैर्य से सब ठीक होगा।']],
  },
  career: {
    high: [['Recognition and progress at work. Present your ideas with confidence.', 'काम में पहचान और प्रगति मिलेगी। अपने विचार आत्मविश्वास से रखें।'], ['Good day for meetings, interviews and new proposals.', 'मीटिंग, इंटरव्यू और नए प्रस्तावों के लिए अच्छा दिन।'], ['Seniors support you. Pending work can move forward.', 'वरिष्ठों का सहयोग मिलेगा। रुके हुए काम आगे बढ़ेंगे।']],
    mid: [['Routine work goes fine. Stay focused on one task at a time.', 'नियमित काम ठीक चलेगा। एक समय पर एक ही काम पर ध्यान दें।'], ['Results come slowly but surely. Do not rush.', 'नतीजे धीरे पर पक्के आएँगे। जल्दबाज़ी न करें।'], ['Good for planning and learning rather than big moves.', 'बड़े कदमों की बजाय योजना और सीखने के लिए अच्छा दिन।']],
    low: [['Delays or extra pressure at work. Double-check your details.', 'काम में देरी या दबाव रह सकता है। विवरण दोबारा जाँच लें।'], ['Avoid conflicts with colleagues. Silence is your strength today.', 'सहकर्मियों से टकराव से बचें। आज चुप रहना आपकी ताक़त है।'], ['Not the day for risky changes. Wait for a better moment.', 'जोखिम भरे बदलाव का दिन नहीं। बेहतर समय का इंतज़ार करें।']],
  },
  money: {
    high: [['Gains look likely. A good day to collect dues or close a deal.', 'लाभ के योग हैं। बकाया वसूलने या सौदा पक्का करने के लिए अच्छा दिन।'], ['Income steady, and a useful money idea may come to mind.', 'आय स्थिर रहेगी और धन से जुड़ा कोई काम का विचार मिल सकता है।'], ['Savings can grow. Smart choices pay off now.', 'बचत बढ़ सकती है। समझदारी भरे फ़ैसले अभी फल देंगे।']],
    mid: [['Money flow is normal. Track your spending.', 'धन का प्रवाह सामान्य रहेगा। खर्च का हिसाब रखें।'], ['Neither big gain nor loss. Stick to the budget.', 'न बड़ा लाभ न हानि। बजट पर टिके रहें।'], ['A fair day for routine payments, not for big investments.', 'नियमित भुगतान के लिए ठीक, बड़े निवेश के लिए नहीं।']],
    low: [['Unplanned expenses are possible. Avoid lending money today.', 'अचानक खर्च संभव हैं। आज किसी को उधार न दें।'], ['Hold back on investments and big purchases.', 'निवेश और बड़ी खरीद रोक कर रखें।'], ['Be careful with paperwork and online payments.', 'काग़ज़ी काम और ऑनलाइन भुगतान में सावधानी रखें।']],
  },
  health: {
    high: [['Energy and mood are good. A fine day to start a healthy habit.', 'ऊर्जा और मन अच्छे हैं। स्वस्थ आदत शुरू करने के लिए बढ़िया दिन।'], ['You feel light and active. Make time for a walk or yoga.', 'हल्कापन और सक्रियता रहेगी। टहलने या योग के लिए समय निकालें।'], ['Recovery is quick. Good for check-ups and fitness goals.', 'सुधार जल्दी होगा। जाँच और फ़िटनेस लक्ष्यों के लिए अच्छा समय।']],
    mid: [['Health is steady. Drink enough water and sleep on time.', 'स्वास्थ्य सामान्य रहेगा। पर्याप्त पानी पिएँ और समय पर सोएँ।'], ['Minor tiredness possible. Take short breaks.', 'हल्की थकान हो सकती है। बीच-बीच में विराम लें।'], ['Balanced day. Keep meals light.', 'संतुलित दिन। भोजन हल्का रखें।']],
    low: [['Stress and fatigue may show up. Rest and avoid heavy food.', 'तनाव और थकान दिख सकती है। आराम करें और भारी भोजन से बचें।'], ['Be careful while driving and with minor injuries.', 'वाहन चलाते समय और छोटी चोटों से सावधान रहें।'], ['Calm the mind: breathing, prayer or a quiet walk helps.', 'मन शांत रखें: प्राणायाम, प्रार्थना या शांत सैर लाभ देगी।']],
  },
};

const UPAY = [
  ['Offer water to the rising Sun and chant "Om Suryaya Namah".', 'उगते सूर्य को जल चढ़ाएँ और "ॐ सूर्याय नमः" का जाप करें।'],
  ['Pour milk on a Shivling or chant "Om Namah Shivaya" 11 times.', 'शिवलिंग पर दूध चढ़ाएँ या "ॐ नमः शिवाय" 11 बार जपें।'],
  ['Visit a Hanuman temple or read Hanuman Chalisa.', 'हनुमान मंदिर जाएँ या हनुमान चालीसा पढ़ें।'],
  ['Feed green fodder to a cow and bow to Lord Ganesha.', 'गाय को हरा चारा खिलाएँ और श्री गणेश को प्रणाम करें।'],
  ['Offer yellow flowers or sweets and chant "Om Gurave Namah".', 'पीले फूल या मिठाई अर्पित करें और "ॐ गुरवे नमः" जपें।'],
  ['Light a ghee lamp for Goddess Lakshmi and help someone in need.', 'देवी लक्ष्मी के आगे घी का दीपक जलाएँ और किसी ज़रूरतमंद की मदद करें।'],
  ['Light a mustard-oil lamp under a Peepal tree or help a worker.', 'पीपल के नीचे सरसों के तेल का दीपक जलाएँ या किसी श्रमिक की मदद करें।'],
];

const SLOWLINE = {
  good: [
    ['{p} is in your {h} house from the Moon: favourable. {t}', '{p} आपकी चंद्र राशि से {h}वें भाव में है: शुभ। {t}'],
  ],
  bad: [
    ['{p} is in your {h} house from the Moon: needs care. {t}', '{p} आपकी चंद्र राशि से {h}वें भाव में है: सावधानी ज़रूरी। {t}'],
  ],
  themes: {
    Jupiter: [['Growth, wisdom and blessings.', 'वृद्धि, ज्ञान और आशीर्वाद।'], ['Be careful of over-confidence and extra spending.', 'अति-आत्मविश्वास और फ़िज़ूलखर्ची से बचें।']],
    Saturn: [['Hard work gives steady results.', 'मेहनत से स्थिर परिणाम मिलेंगे।'], ['Delays and responsibilities; patience is key.', 'देरी और ज़िम्मेदारियाँ; धैर्य ज़रूरी है।']],
    Rahu: [['Sudden opportunities and bold moves.', 'अचानक अवसर और साहसिक कदम।'], ['Confusion or restlessness; avoid shortcuts.', 'उलझन या बेचैनी; शॉर्टकट से बचें।']],
    Mars: [['Courage and drive to finish tasks.', 'साहस और काम पूरा करने की ताक़त।'], ['Anger and haste; keep calm.', 'गुस्सा और जल्दबाज़ी; शांत रहें।']],
    Sun: [['Respect, authority and vitality.', 'सम्मान, अधिकार और जीवन-शक्ति।'], ['Ego clashes and tiredness; rest well.', 'अहंकार का टकराव और थकान; आराम करें।']],
    Venus: [['Comfort, love and creativity.', 'सुख, प्रेम और रचनात्मकता।'], ['Overindulgence; keep a budget for pleasures.', 'अति भोग-विलास; सुख-सुविधा का बजट रखें।']],
    Mercury: [['Good for talks, trade and studies.', 'बातचीत, व्यापार और पढ़ाई के लिए अच्छा।'], ['Check messages and contracts twice.', 'संदेश और अनुबंध दो बार जाँचें।']],
  },
};

const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const level = (stars) => (stars >= 4 ? 'high' : stars === 3 ? 'mid' : 'low');
const pick = (arr, seed) => arr[hash(seed) % arr.length];
const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/** Noon (local time) of a calendar date; used so a "day" has one stable reading. */
export const noonOf = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);

// ---------------- DAILY ----------------
export function daily(rashi, day = new Date()) {
  const when = isSameDay(day, new Date()) ? new Date() : noonOf(day);
  const tr = transit(when);
  const overall = toStars(scoreWith(tr, rashi, W_ALL));
  const cats = {};
  for (const c of Object.keys(W_CAT)) {
    const st = toStars(scoreWith(tr, rashi, W_CAT[c]));
    cats[c] = { stars: st, text: pick(BANK[c][level(st)], `${dayKey(day)}|${rashi}|${c}`) };
  }
  const wd = day.getDay();
  const lord = PLANETS[WEEKDAY_LORD[wd]];
  const luckyNum = ((hash(`${dayKey(day)}|${rashi}`) % 9) + 1);
  return {
    date: day, stars: overall, level: level(overall),
    text: pick(BANK.overall[level(overall)], `${dayKey(day)}|${rashi}|o`),
    cats,
    moonHouse: houseFrom(rashi, tr.Moon), moonRashi: tr.Moon,
    lucky: { num: luckyNum, color: lord.col, colorHex: lord.color },
    upay: UPAY[wd],
    sade: sadeSati(rashi, tr),
    tr,
  };
}
const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Sade Sati / Dhaiya from Saturn's transit relative to the natal Moon. */
export function sadeSati(moonRashi, tr) {
  const h = houseFrom(moonRashi, tr.Saturn);
  if (h === 12) return { kind: 'sade', phase: 1, h };
  if (h === 1) return { kind: 'sade', phase: 2, h };
  if (h === 2) return { kind: 'sade', phase: 3, h };
  if (h === 4) return { kind: 'dhaiya', phase: 1, h };
  if (h === 8) return { kind: 'dhaiya', phase: 2, h };
  return null;
}

// ---------------- WEEKLY (next 7 days) ----------------
export function weekly(rashi, start = new Date()) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const tr = transit(noonOf(d));
    days.push({ date: d, stars: toStars(scoreWith(tr, rashi, W_ALL)), raw: scoreWith(tr, rashi, W_ALL), tr });
  }
  const best = days.reduce((a, b) => (b.raw > a.raw ? b : a));
  const worst = days.reduce((a, b) => (b.raw < a.raw ? b : a));
  const avg = days.reduce((s, d) => s + d.raw, 0) / 7;
  const st = toStars(avg);
  const trMid = days[3].tr;
  const cats = {};
  for (const c of Object.keys(W_CAT)) {
    const s = toStars(scoreWith(trMid, rashi, W_CAT[c]) * 0.6 + avg * 0.4);
    cats[c] = { stars: s, text: pick(BANK[c][level(s)], `${dayKey(start)}|w|${rashi}|${c}`) };
  }
  return { days, best, worst, stars: st, level: level(st), text: pick(BANK.overall[level(st)], `${dayKey(start)}|w|${rashi}`), cats, sade: sadeSati(rashi, days[0].tr) };
}

// ---------------- MONTHLY (next 30 days) ----------------
export function monthly(rashi, start = new Date()) {
  const days = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const tr = transit(noonOf(d));
    days.push({ date: d, raw: scoreWith(tr, rashi, W_ALL), stars: toStars(scoreWith(tr, rashi, W_ALL)), tr });
  }
  const avg = days.reduce((s, d) => s + d.raw, 0) / days.length;
  const stars = toStars(avg);
  const mid = days[15].tr;
  const slow = SLOW.map((id) => {
    const h = houseFrom(rashi, mid[id]);
    const good = GOOD[id].includes(h);
    return { id, house: h, rashi: mid[id], good, theme: SLOWLINE.themes[id][good ? 0 : 1] };
  });
  const cats = {};
  for (const c of Object.keys(W_CAT)) {
    const s = toStars(scoreWith(mid, rashi, W_CAT[c]) * 0.7 + avg * 0.3);
    cats[c] = { stars: s, text: pick(BANK[c][level(s)], `${dayKey(start)}|m|${rashi}|${c}`) };
  }
  return { days, stars, level: level(stars), text: pick(BANK.overall[level(stars)], `${dayKey(start)}|m|${rashi}`), slow, cats, sade: sadeSati(rashi, days[0].tr) };
}

export { SLOWLINE };
