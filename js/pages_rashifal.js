import { T, L, fmtDate, locale } from './i18n.js';
import { RASHI, PLANETS, NAKSHATRA, WEEKDAY, RASHI_FRIENDS, RASHI_LORD } from './data.js';
import { daily, weekly, monthly } from './rashifal.js';
import { starsHtml, bar, rashiName, rashiKeyIdx, elementName, qualityName, nakList, store, $ } from './ui.js';
import { orbitRings } from './charts.js';

const CAT = {
  love: { ico: '♡', n: ['Love', 'प्रेम'], c: '#ff7ab8' },
  career: { ico: '⚑', n: ['Career', 'करियर'], c: '#ffd27a' },
  money: { ico: '₹', n: ['Money', 'धन'], c: '#5be3a0' },
  health: { ico: '✚', n: ['Health', 'स्वास्थ्य'], c: '#6fc0ff' },
};

function chips(sel) {
  return `<div class="chips" role="tablist">${RASHI.map((r, i) => `<a class="chip rchip ${i === sel ? 'on' : ''}" href="#/rashifal/${r.key}" data-hover><b>${r.sym}</b>${L(r.n)}</a>`).join('')}</div>`;
}

function sadeBox(s) {
  if (!s) return '';
  const phase = [T('rising', 'आरंभिक'), T('peak', 'मध्य'), T('setting', 'अंतिम')][s.phase - 1] || '';
  if (s.kind === 'sade') {
    return `<div class="note warn reveal"><b>${T('Sade Sati is running', 'साढ़ेसाती चल रही है')}</b> (${phase} ${T('phase', 'चरण')}). ${T('Saturn is transiting near your Moon sign. Go steady, avoid shortcuts, and work with discipline.', 'शनि आपकी चंद्र राशि के पास गोचर कर रहे हैं। संयम रखें, शॉर्टकट से बचें और अनुशासन से काम करें।')}</div>`;
  }
  return `<div class="note warn reveal"><b>${T('Shani Dhaiya', 'शनि ढैया')}</b> ${T('is active (Saturn in the 4th/8th from your Moon). Be patient with home matters and sudden changes.', 'सक्रिय है (शनि आपकी चंद्र राशि से चौथे/आठवें भाव में)। घर के मामलों और अचानक बदलावों में धैर्य रखें।')}</div>`;
}

function catRows(cats) {
  return Object.entries(CAT).map(([k, v]) => `
    <div class="cat glass reveal" style="--c:${v.c}">
      <div class="cat-h"><b class="cat-i">${v.ico}</b><span>${L(v.n)}</span>${starsHtml(cats[k].stars)}</div>
      ${bar(cats[k].stars * 20, 'cb')}
      <p>${L(cats[k].text)}</p>
    </div>`).join('');
}

function dailyHtml(i, day) {
  const d = daily(i, day);
  const isToday = new Date().toDateString() === day.toDateString();
  return `
    <div class="daynav reveal">
      <button class="btn mini" data-day="-1" aria-label="previous day">‹</button>
      <span class="dn-date">${fmtDate(day, { weekday: 'long', day: 'numeric', month: 'long' })}${isToday ? ` <em>${T('Today', 'आज')}</em>` : ''}</span>
      <button class="btn mini" data-day="1" aria-label="next day">›</button>
      ${isToday ? '' : `<button class="btn mini" data-day="0">${T('Today', 'आज')}</button>`}
    </div>
    <div class="hero-card glass reveal">
      <div class="score"><div class="score-wrap"><div class="score-ring" style="--p:${d.stars * 20}"></div><span class="score-n">${d.stars}<small>/5</small></span></div>${starsHtml(d.stars)}</div>
      <div class="hc-body"><h2>${rashiName(i)} · ${T('Daily rashifal', 'दैनिक राशिफल')}</h2><p class="big">${L(d.text)}</p>
        <p class="why">${T('Why:', 'आधार:')} ${T(`Moon is in ${RASHI[d.moonRashi].n[0]}, your ${d.moonHouse}th house from your Moon sign.`, `चंद्रमा ${RASHI[d.moonRashi].n[1]} में है, जो आपकी चंद्र राशि से ${d.moonHouse}वाँ भाव है।`)}</p></div>
    </div>
    ${sadeBox(d.sade)}
    <div class="cats">${catRows(d.cats)}</div>
    <div class="lucky glass reveal">
      <div><small>${T('Lucky number', 'शुभ अंक')}</small><b class="lk-num">${d.lucky.num}</b></div>
      <div><small>${T('Lucky colour', 'शुभ रंग')}</small><b><i class="dotc" style="background:${d.lucky.colorHex}"></i>${L(d.lucky.color)}</b></div>
      <div class="lk-upay"><small>${T("Today's remedy", 'आज का उपाय')}</small><b>${L(d.upay)}</b></div>
    </div>`;
}

function weeklyHtml(i) {
  const w = weekly(i);
  const max = 5;
  const barsH = w.days.map((d) => `<div class="wk ${d === w.best ? 'best' : d === w.worst ? 'worst' : ''}" data-hover>
      <div class="wk-bar"><b style="--h:${(d.stars / max) * 100}%"></b></div><span class="wk-s">${d.stars}★</span>
      <span class="wk-d">${d.date.toLocaleDateString(locale(), { weekday: 'short' })}</span><span class="wk-n">${d.date.getDate()}</span></div>`).join('');
  return `
    <div class="hero-card glass reveal">
      <div class="score"><div class="score-wrap"><div class="score-ring" style="--p:${w.stars * 20}"></div><span class="score-n">${w.stars}<small>/5</small></span></div>${starsHtml(w.stars)}</div>
      <div class="hc-body"><h2>${rashiName(i)} · ${T('This week', 'यह सप्ताह')}</h2><p class="big">${L(w.text)}</p>
        <p class="why">${T('Best day:', 'सबसे अच्छा दिन:')} <b>${fmtDate(w.best.date, { weekday: 'long', day: 'numeric', month: 'short' })}</b> · ${T('Take care on:', 'सावधानी:')} <b>${fmtDate(w.worst.date, { weekday: 'long', day: 'numeric', month: 'short' })}</b></p></div>
    </div>
    ${sadeBox(w.sade)}
    <div class="glass week-chart reveal"><h3>${T('Day by day', 'दिन-प्रतिदिन')}</h3><div class="wk-row">${barsH}</div></div>
    <div class="cats">${catRows(w.cats)}</div>`;
}

function monthlyHtml(i) {
  const m = monthly(i);
  const spark = m.days.map((d) => `<i class="${d.stars >= 4 ? 'hi' : d.stars <= 2 ? 'lo' : ''}" style="--h:${(d.stars / 5) * 100}%" title="${d.date.getDate()}/${d.date.getMonth() + 1}: ${d.stars}★"></i>`).join('');
  const slow = m.slow.map((s) => `<div class="slow ${s.good ? 'good' : 'care'} reveal"><span class="gdot" style="--c:${PLANETS[s.id].color}">${PLANETS[s.id].sym}</span>
      <div><b>${L(PLANETS[s.id].n)}</b> · ${RASHI[s.rashi].sym} ${rashiName(s.rashi)} · ${T(`${s.house}th house`, `${s.house}वाँ भाव`)} <em>${s.good ? T('favourable', 'शुभ') : T('needs care', 'सावधानी')}</em>
      <p>${L(s.theme)}</p></div></div>`).join('');
  return `
    <div class="hero-card glass reveal">
      <div class="score"><div class="score-wrap"><div class="score-ring" style="--p:${m.stars * 20}"></div><span class="score-n">${m.stars}<small>/5</small></span></div>${starsHtml(m.stars)}</div>
      <div class="hc-body"><h2>${rashiName(i)} · ${T('Next 30 days', 'अगले ३० दिन')}</h2><p class="big">${L(m.text)}</p></div>
    </div>
    ${sadeBox(m.sade)}
    <div class="glass spark-card reveal"><h3>${T('30-day rhythm', '३० दिन की लय')}</h3><div class="spark">${spark}</div>
      <div class="spark-ax"><span>${fmtDate(m.days[0].date, { day: 'numeric', month: 'short' })}</span><span>${fmtDate(m.days[29].date, { day: 'numeric', month: 'short' })}</span></div></div>
    <div class="cats">${catRows(m.cats)}</div>
    <h3 class="sub reveal">${T('Slow planets this month', 'इस महीने के धीमे ग्रह')}</h3>
    <div class="slows">${slow}</div>`;
}

export function rashifalHtml(key, tab = 'daily', dayOffset = 0) {
  let i = rashiKeyIdx(key);
  if (i < 0) i = store('rashi') ?? 0;
  store('rashi', i);
  const day = new Date(); day.setDate(day.getDate() + dayOffset);
  const r = RASHI[i];
  const body = tab === 'weekly' ? weeklyHtml(i) : tab === 'monthly' ? monthlyHtml(i) : dailyHtml(i, day);
  return `
  <section class="page-sec" data-theme="gold">
    <div class="wrap">
      <header class="page-head reveal">
        <p class="eyebrow gold"><i></i>${T('Rashifal', 'राशिफल')}</p>
        <h1><span class="big-sym">${r.sym}</span> ${L(r.n)} <small>${r.n[2]}</small></h1>
        <p class="mute">${T('Ruler', 'स्वामी')}: ${L(PLANETS[RASHI_LORD[i]].n)} · ${elementName(i)} · ${r.traits.map((t) => L(t)).join(', ')}</p>
      </header>
      ${chips(i)}
      <div class="tabs reveal" data-key="${r.key}">
        ${['daily', 'weekly', 'monthly'].map((t) => `<a class="tab ${t === tab ? 'on' : ''}" href="#/rashifal/${r.key}/${t}">${{ daily: T('Daily', 'दैनिक'), weekly: T('Weekly', 'साप्ताहिक'), monthly: T('Monthly', 'मासिक') }[t]}</a>`).join('')}
        <a class="tab alt" href="#/rashi/${r.key}">${T('About this rashi', 'इस राशि के बारे में')}</a>
      </div>
      <div class="rf-body" data-tab="${tab}">${body}</div>
      <p class="fine">${T('Stars are computed from the real transit of grahas from your Moon sign (gochar). Treat as guidance, not guarantee.', 'सितारे आपकी चंद्र राशि से ग्रहों के असली गोचर से निकले हैं। इन्हें मार्गदर्शन समझें, गारंटी नहीं।')}</p>
    </div>
  </section>`;
}

export function mountRashifal(root, key, tab, rerender) {
  let off = 0;
  root.querySelectorAll('[data-day]').forEach((b) => b.addEventListener('click', () => {
    const v = +b.dataset.day; off = v === 0 ? 0 : off + v;
    rerender(off);
  }));
}

// -------- rashi detail page --------
export function rashiPageHtml(key) {
  let i = rashiKeyIdx(key); if (i < 0) i = 0;
  const r = RASHI[i];
  const lord = PLANETS[RASHI_LORD[i]];
  const friends = RASHI_FRIENDS[i].map((j) => `<a class="chip rchip" href="#/rashi/${RASHI[j].key}"><b>${RASHI[j].sym}</b>${L(RASHI[j].n)}</a>`).join('');
  const prev = RASHI[(i + 11) % 12], next = RASHI[(i + 1) % 12];
  const facts = [
    [T('Ruling planet', 'स्वामी ग्रह'), `<span class="gdot" style="--c:${lord.color}">${lord.sym}</span> ${L(lord.n)}`],
    [T('Element', 'तत्व'), elementName(i)], [T('Quality', 'स्वभाव'), qualityName(i)],
    [T('Lucky number', 'शुभ अंक'), lord.num], [T('Lucky colour', 'शुभ रंग'), L(lord.col)], [T('Gemstone', 'रत्न'), L(lord.gem)],
    [T('Lucky day', 'शुभ दिन'), L(lord.day)], [T('Nakshatras', 'नक्षत्र'), nakList(r.nak)],
    [T('Name letters', 'नाम के अक्षर'), L([r.letters[1], r.letters[0]])],
  ].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  return `
  <section class="page-sec" data-theme="gold">
    <div class="wrap narrow">
      <header class="rashi-hero reveal">
        <div class="rh-orb">${orbitRings(300)}<b>${r.sym}</b></div>
        <p class="eyebrow gold"><i></i>${T('Rashi', 'राशि')} ${i + 1} / 12</p>
        <h1>${L(r.n)} <small>${r.n[2]}</small></h1>
        <p class="big">${L(r.about)}</p>
        <div class="btns"><a class="btn primary magnetic" href="#/rashifal/${r.key}">${T("Today's rashifal", 'आज का राशिफल')}</a><a class="btn ghost magnetic" href="#/milan">${T('Guna Milan', 'गुण मिलान')}</a></div>
      </header>
      <div class="trait-row reveal">${r.traits.map((t) => `<span class="chip good">${L(t)}</span>`).join('')}${r.flaws.map((t) => `<span class="chip care">${L(t)}</span>`).join('')}</div>
      <dl class="facts glass reveal">${facts}</dl>
      <div class="three">
        <div class="glass reveal"><h3>${T('Career', 'करियर')}</h3><p>${L(r.career)}</p></div>
        <div class="glass reveal" style="--d:.08s"><h3>${T('Love', 'प्रेम')}</h3><p>${L(r.love)}</p></div>
        <div class="glass reveal" style="--d:.16s"><h3>${T('Health', 'स्वास्थ्य')}</h3><p>${L(r.health)}</p></div>
      </div>
      <h3 class="sub reveal">${T('Harmonious with', 'इनके साथ तालमेल')}</h3>
      <div class="chips reveal">${friends}</div>
      <div class="pager reveal"><a class="btn ghost" href="#/rashi/${prev.key}">‹ ${L(prev.n)}</a><a class="btn ghost" href="#/rashi/${next.key}">${L(next.n)} ›</a></div>
    </div>
  </section>`;
}
