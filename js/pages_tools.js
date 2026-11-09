import { T, L, fmtDate, fmtDateTime } from './i18n.js';
import { RASHI, PLANETS, GRAHA_ORDER, NAKSHATRA, TITHI, AMAVASYA, YOGA, WEEKDAY, RASHI_LORD, DASHA_YEARS } from './data.js';
import { CITIES, cityByName, searchPlace } from './cities.js';
import { kundli, moonDetails, sunDetails, toUTC, fmtDeg, tropicalSunSign, ayanamsa } from './astro.js';
import { ashtakoota, VARNA_NAMES } from './guna.js';
import { matchName } from './names.js';
import { northChart, southChart, orbitRings } from './charts.js';
import { esc, $, $$, rashiName, elementName, store, todayISO, runCounters, bar } from './ui.js';
import { observeReveals } from './fx.js';

// ---------------- shared: place inputs ----------------
function placeHtml(p, def = 'Delhi') {
  const c = cityByName(def) || CITIES[0];
  return `<div class="place" data-p="${p}">
    <label class="fld"><span>${T('Birth place', 'जन्म स्थान')}</span>
      <input class="pc" list="cities" autocomplete="off" value="${esc(c[0])}" placeholder="${T('City', 'शहर')}"></label>
    <div class="row3">
      <label class="fld sm"><span>${T('Latitude', 'अक्षांश')}</span><input class="plat" type="number" step="0.0001" value="${c[1]}"></label>
      <label class="fld sm"><span>${T('Longitude', 'देशांतर')}</span><input class="plon" type="number" step="0.0001" value="${c[2]}"></label>
      <label class="fld sm"><span>${T('Time zone (UTC+)', 'समय क्षेत्र (UTC+)')}</span><input class="ptz" type="number" step="0.25" value="${c[3]}"></label>
    </div>
    <div class="place-act"><button type="button" class="btn mini psearch">${T('Search any place online', 'कोई भी जगह ऑनलाइन खोजें')}</button><span class="pmsg mute"></span></div>
    <div class="presults"></div>
  </div>`;
}
const datalist = () => `<datalist id="cities">${CITIES.map((c) => `<option value="${esc(c[0])}">`).join('')}</datalist>`;

function mountPlace(root) {
  $$('.place', root).forEach((el) => {
    const pc = $('.pc', el), lat = $('.plat', el), lon = $('.plon', el), tz = $('.ptz', el), msg = $('.pmsg', el), res = $('.presults', el);
    pc.addEventListener('input', () => {
      const c = cityByName(pc.value);
      if (c) { lat.value = c[1]; lon.value = c[2]; tz.value = c[3]; msg.textContent = ''; }
    });
    $('.psearch', el).addEventListener('click', async () => {
      const q = pc.value.trim(); if (!q) return;
      msg.textContent = T('Searching…', 'खोज रहे हैं…'); res.innerHTML = '';
      try {
        const list = await searchPlace(q);
        msg.textContent = list.length ? T('Pick one:', 'चुनिए:') : T('Nothing found', 'कुछ नहीं मिला');
        res.innerHTML = list.map((x, i) => `<button type="button" class="chip" data-i="${i}">${esc(x.name.slice(0, 70))}</button>`).join('');
        $$('button', res).forEach((b) => b.addEventListener('click', () => {
          const x = list[+b.dataset.i];
          lat.value = x.lat.toFixed(4); lon.value = x.lon.toFixed(4);
          if (x.lon > 68 && x.lon < 97.5 && x.lat > 6 && x.lat < 37) tz.value = 5.5;
          msg.textContent = T('Set. Please check the time zone.', 'सेट हो गया। समय क्षेत्र जाँच लें।'); res.innerHTML = '';
        }));
      } catch (e) { msg.textContent = T('Online search not available. Enter latitude/longitude manually.', 'ऑनलाइन खोज उपलब्ध नहीं। अक्षांश/देशांतर ख़ुद भरें।'); }
    });
  });
}
function readPlace(el) {
  const lat = parseFloat($('.plat', el).value), lon = parseFloat($('.plon', el).value), tz = parseFloat($('.ptz', el).value);
  if ([lat, lon, tz].some((v) => Number.isNaN(v))) return null;
  return { lat, lon, tz, name: $('.pc', el).value };
}
function parseDT(dateStr, timeStr, tz, unknownTime) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = (unknownTime || !timeStr ? '12:00' : timeStr).split(':').map(Number);
  return toUTC(y, m, d, hh, mm, tz);
}

// ---------------- RASHI FINDER ----------------
export function finderHtml(tab = 'birth') {
  const tabs = [['birth', T('Birth details', 'जन्म विवरण'), T('Most accurate', 'सबसे सटीक')], ['name', T('By name', 'नाम से'), T('Traditional', 'पारंपरिक')], ['date', T('By date only', 'सिर्फ़ तारीख़'), T('Sun sign', 'सूर्य राशि')]];
  const f = store('finder') || {};
  let form = '';
  if (tab === 'birth') {
    form = `<form id="f-birth" class="glass form reveal">
      <div class="row2"><label class="fld"><span>${T('Date of birth', 'जन्म तिथि')}</span><input type="date" name="d" required max="${todayISO()}" value="${f.d || ''}"></label>
      <label class="fld"><span>${T('Time of birth', 'जन्म समय')}</span><input type="time" name="t" value="${f.t || '12:00'}"></label></div>
      <label class="check"><input type="checkbox" name="unk"> ${T("I don't know the exact time", 'मुझे सही समय नहीं पता')}</label>
      ${placeHtml('b', f.city || 'Delhi')}
      <button class="btn primary magnetic" type="submit">${T('Find my rashi', 'मेरी राशि बताइए')}</button></form>`;
  } else if (tab === 'name') {
    form = `<form id="f-name" class="glass form reveal">
      <label class="fld"><span>${T('Name (English or Hindi)', 'नाम (अंग्रेज़ी या हिंदी)')}</span><input name="n" required placeholder="${T('e.g. Abhishek / अभिषेक', 'जैसे Abhishek / अभिषेक')}" value="${esc(f.n || '')}" autocomplete="off"></label>
      <p class="mute">${T('In Hindu tradition a name starts with the syllable of the birth nakshatra pada. This works only if the name was kept that way.', 'हिंदू परंपरा में नाम जन्म-नक्षत्र के चरण के अक्षर से रखा जाता है। यह तभी सही होगा जब नाम उसी तरह रखा गया हो।')}</p>
      <button class="btn primary magnetic" type="submit">${T('Find rashi', 'राशि खोजें')}</button></form>`;
  } else {
    form = `<form id="f-date" class="glass form reveal">
      <label class="fld"><span>${T('Date of birth', 'जन्म तिथि')}</span><input type="date" name="d" required max="${todayISO()}" value="${f.d || ''}"></label>
      <p class="mute">${T('This gives only the Sun sign. Your Moon sign (the real Vedic rashi) needs the time and place of birth.', 'इससे सिर्फ़ सूर्य राशि पता चलती है। असली वैदिक राशि (चंद्र राशि) के लिए जन्म का समय और स्थान चाहिए।')}</p>
      <button class="btn primary magnetic" type="submit">${T('Show sun signs', 'सूर्य राशि दिखाएँ')}</button></form>`;
  }
  return `
  <section class="page-sec" data-theme="rose"><div class="wrap narrow">
    <header class="page-head reveal"><p class="eyebrow rose"><i></i>${T('Rashi finder', 'राशि खोज')}</p>
      <h1>${T("Which is <em>my rashi</em>?", 'मेरी <em>राशि</em> कौन सी है?')}</h1>
      <p class="mute">${T('Three ways to find it. The birth-details method is exact.', 'तीन तरीके। जन्म विवरण वाला तरीका बिल्कुल सटीक है।')}</p></header>
    <div class="tabs reveal">${tabs.map(([k, n, s]) => `<a class="tab ${k === tab ? 'on' : ''}" href="#/finder/${k}">${n}<small>${s}</small></a>`).join('')}</div>
    ${form}${datalist()}
    <div id="f-out"></div>
  </div></section>`;
}

function rashiResultCard(i, extra = '') {
  const r = RASHI[i];
  return `<div class="result glass reveal">
    <div class="res-orb"><b>${r.sym}</b><span class="rc-orbit"></span><span class="rc-orbit o2"></span></div>
    <div class="res-body"><p class="eyebrow rose"><i></i>${T('Your rashi', 'आपकी राशि')}</p>
      <h2>${L(r.n)} <small>${r.n[2]}</small></h2>${extra}
      <p>${L(r.about)}</p>
      <div class="btns"><a class="btn primary" href="#/rashifal/${r.key}">${T("Today's rashifal", 'आज का राशिफल')}</a><a class="btn ghost" href="#/rashi/${r.key}">${T('Know more', 'और जानें')}</a></div></div></div>`;
}

export function mountFinder(root, tab) {
  mountPlace(root);
  const out = $('#f-out', root);
  const show = (html) => { out.innerHTML = html; observeReveals(out); out.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  if (tab === 'birth') {
    $('#f-birth', root).addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target), pl = readPlace($('.place', root));
      if (!pl) return;
      const unk = !!fd.get('unk');
      const dt = parseDT(fd.get('d'), fd.get('t'), pl.tz, unk);
      store('finder', { d: fd.get('d'), t: fd.get('t'), city: pl.name });
      const m = moonDetails(dt);
      const s = sunDetails(dt);
      // Does the Moon change sign during that local day?
      const [y, mo, d] = fd.get('d').split('-').map(Number);
      const a = moonDetails(toUTC(y, mo, d, 0, 0, pl.tz)).rashi, b = moonDetails(toUTC(y, mo, d, 23, 59, pl.tz)).rashi;
      const warn = a !== b && (unk || !fd.get('t'))
        ? `<div class="note warn">${T(`On this date the Moon moved from ${RASHI[a].n[0]} to ${RASHI[b].n[0]}, so the exact birth time is needed. Showing noon.`, `उस दिन चंद्रमा ${RASHI[a].n[1]} से ${RASHI[b].n[1]} में गया, इसलिए सही जन्म समय चाहिए। दोपहर 12 बजे के हिसाब से दिखा रहे हैं।`)}</div>`
        : (a !== b ? `<div class="note">${T('The Moon changes sign on this date, so double-check your birth time.', 'इस तारीख़ को चंद्रमा राशि बदलता है, इसलिए जन्म समय दोबारा जाँच लें।')}</div>` : '');
      const extra = `<dl class="kv inline"><div><dt>${T('Nakshatra', 'नक्षत्र')}</dt><dd>${L(NAKSHATRA[m.nak])} · ${T('pada', 'चरण')} ${m.pada}</dd></div>
        <div><dt>${T('Moon at', 'चंद्र अंश')}</dt><dd>${fmtDeg(m.deg)}</dd></div>
        <div><dt>${T('Sun rashi (Vedic)', 'सूर्य राशि (वैदिक)')}</dt><dd>${RASHI[s.rashi].sym} ${rashiName(s.rashi)}</dd></div></dl>${warn}`;
      show(rashiResultCard(m.rashi, extra));
    });
  } else if (tab === 'name') {
    $('#f-name', root).addEventListener('submit', (e) => {
      e.preventDefault();
      const n = new FormData(e.target).get('n');
      store('finder', { ...(store('finder') || {}), n });
      const m = matchName(n);
      if (!m) { show(`<div class="note warn reveal">${T('Could not read a naming syllable from this name. Try the birth-details method.', 'इस नाम से कोई नामाक्षर नहीं मिला। जन्म विवरण वाला तरीका आज़माएँ।')}</div>`); return; }
      const uniq = [...new Set(m.entries.map((x) => x.rashi))];
      let html = `<div class="note reveal">${T('Naming syllable:', 'नामाक्षर:')} <b>${m.syl.toUpperCase()}</b> ${uniq.length > 1 ? T('· this syllable belongs to more than one rashi, so please check against your birth details.', '· यह अक्षर एक से अधिक राशियों में आता है, इसलिए जन्म विवरण से मिला लें।') : ''}</div>`;
      html += m.entries.map((x) => `<div class="mini-res glass reveal"><b class="msym">${RASHI[x.rashi].sym}</b><div><h3>${rashiName(x.rashi)}</h3><p class="mute">${L(NAKSHATRA[x.nak])} · ${T('pada', 'चरण')} ${x.pada}</p></div><a class="btn mini" href="#/rashifal/${RASHI[x.rashi].key}">${T('Rashifal', 'राशिफल')}</a></div>`).join('');
      show(html);
    });
  } else {
    $('#f-date', root).addEventListener('submit', (e) => {
      e.preventDefault();
      const ds = new FormData(e.target).get('d'); store('finder', { ...(store('finder') || {}), d: ds });
      const [y, mo, d] = ds.split('-').map(Number);
      const vedic = sunDetails(toUTC(y, mo, d, 12, 0, 5.5)).rashi;
      const trop = tropicalSunSign(mo, d);
      show(`<div class="two">
        <div class="glass sun-card reveal"><h3>${T('Vedic Sun rashi', 'वैदिक सूर्य राशि')}</h3><b class="msym">${RASHI[vedic].sym}</b><h2>${rashiName(vedic)}</h2><p class="mute">${T('Sidereal (Lahiri)', 'निरयन (लाहिरी)')}</p><a class="btn mini" href="#/rashi/${RASHI[vedic].key}">${T('Details', 'विवरण')}</a></div>
        <div class="glass sun-card reveal" style="--d:.1s"><h3>${T('Western sun sign', 'पश्चिमी सूर्य राशि')}</h3><b class="msym">${RASHI[trop].sym}</b><h2>${rashiName(trop)}</h2><p class="mute">${T('Tropical', 'सायन')}</p><a class="btn mini" href="#/rashi/${RASHI[trop].key}">${T('Details', 'विवरण')}</a></div></div>
        <div class="note reveal">${T('These two often differ because of the ayanamsa (about 24°). Your Vedic rashi is your Moon sign. For that, use the birth-details tab.', 'अयनांश (लगभग 24°) के कारण ये दोनों अक्सर अलग होती हैं। आपकी वैदिक राशि चंद्र राशि है। उसके लिए जन्म विवरण वाला टैब इस्तेमाल करें।')}
        <a class="btn mini" href="#/finder/birth">${T('Use birth details', 'जन्म विवरण से')}</a></div>`);
    });
  }
}

// ---------------- KUNDLI ----------------
export function kundliHtml() {
  const f = store('kundli') || {};
  return `
  <section class="page-sec" data-theme="rose"><div class="wrap">
    <header class="page-head reveal"><p class="eyebrow rose"><i></i>${T('Kundli', 'कुंडली')}</p>
      <h1>${T('Your <em>birth chart</em>', 'आपकी <em>जन्म कुंडली</em>')}</h1>
      <p class="mute">${T('Lagna, nine grahas, navamsa, Vimshottari dasha and panchang, computed from real planetary positions.', 'लग्न, नौ ग्रह, नवांश, विंशोत्तरी दशा और पंचांग, असली ग्रह-स्थिति से निकले।')}</p></header>
    <form id="k-form" class="glass form narrow-form reveal">
      <label class="fld"><span>${T('Name (optional)', 'नाम (वैकल्पिक)')}</span><input name="n" value="${esc(f.n || '')}" autocomplete="off"></label>
      <div class="row2"><label class="fld"><span>${T('Date of birth', 'जन्म तिथि')}</span><input type="date" name="d" required max="${todayISO()}" value="${f.d || ''}"></label>
      <label class="fld"><span>${T('Time of birth', 'जन्म समय')}</span><input type="time" name="t" value="${f.t || '12:00'}"></label></div>
      <label class="check"><input type="checkbox" name="unk"> ${T("I don't know the exact time (lagna will be unreliable)", 'सही समय नहीं पता (लग्न भरोसेमंद नहीं होगा)')}</label>
      ${placeHtml('k', f.city || 'Delhi')}
      <button class="btn primary magnetic" type="submit">${T('Create kundli', 'कुंडली बनाएँ')}</button>
    </form>${datalist()}
    <div id="k-out"></div>
  </div></section>`;
}

const STATUS = { exalted: ['Exalted', 'उच्च'], debilitated: ['Debilitated', 'नीच'], own: ['Own sign', 'स्वराशि'] };

function chartGrahas(k, nav) {
  return GRAHA_ORDER.map((id) => ({ id, rashi: nav ? k.navamsa.grahas[id] : k.grahas[id].rashi, retro: k.grahas[id].retro }));
}

function kundliResult(k, name, hasTime) {
  const lg = k.lagna, mo = k.grahas.Moon, su = k.grahas.Sun;
  const pc = k.panchang;
  const tithiName = pc.isAmavasya ? AMAVASYA : TITHI[pc.tithiInPaksha - 1];
  const rows = GRAHA_ORDER.map((id) => {
    const g = k.grahas[id];
    const st = g.dignity ? `<span class="tag ${g.dignity}">${L(STATUS[g.dignity])}</span>` : '';
    return `<tr class="grow" data-id="${id}"><td><span class="gdot" style="--c:${PLANETS[id].color}">${PLANETS[id].sym}</span> ${L(PLANETS[id].n)}${g.retro && id !== 'Rahu' && id !== 'Ketu' ? ' <em class="retro">℞</em>' : ''}</td>
      <td>${RASHI[g.rashi].sym} ${rashiName(g.rashi)}</td><td class="num">${fmtDeg(g.deg)}</td><td>${L(NAKSHATRA[g.nak])} <small>${g.pada}</small></td><td class="num">${g.house}</td><td>${st}</td></tr>`;
  }).join('');
  const now = Date.now();
  const dashaRows = k.dasha.slice(0, 9).map((d) => {
    const cur = now >= d.start.getTime() && now < d.end.getTime();
    const antar = cur ? `<div class="antars">${d.antar.map((a) => `<span class="${a.current ? 'cur' : ''}" style="--c:${PLANETS[a.lord].color}">${PLANETS[a.lord].sym} ${L(PLANETS[a.lord].n)} <em>${fmtDate(a.end, { month: 'short', year: '2-digit' })}</em></span>`).join('')}</div>` : '';
    return `<div class="dasha ${cur ? 'cur' : ''}"><span class="gdot" style="--c:${PLANETS[d.lord].color}">${PLANETS[d.lord].sym}</span>
      <div><b>${L(PLANETS[d.lord].n)}</b> ${T('Mahadasha', 'महादशा')} <small>${d.years.toFixed(1)} ${T('yrs', 'वर्ष')}${d.partial ? ' (' + T('balance', 'शेष') + ')' : ''}</small>
      <p>${fmtDate(d.start, { month: 'short', year: 'numeric' })} → ${fmtDate(d.end, { month: 'short', year: 'numeric' })}</p>${antar}</div></div>`;
  }).join('');
  return `
  <div class="k-result">
    <div class="glass k-sum reveal">
      <div><small>${T('Lagna (Ascendant)', 'लग्न')}</small><h3>${RASHI[lg.rashi].sym} ${rashiName(lg.rashi)}</h3><p class="mute">${fmtDeg(lg.deg)} · ${L(NAKSHATRA[lg.nak])}</p></div>
      <div><small>${T('Moon rashi', 'चंद्र राशि')}</small><h3>${RASHI[mo.rashi].sym} ${rashiName(mo.rashi)}</h3><p class="mute">${L(NAKSHATRA[mo.nak])} · ${T('pada', 'चरण')} ${mo.pada}</p></div>
      <div><small>${T('Sun rashi', 'सूर्य राशि')}</small><h3>${RASHI[su.rashi].sym} ${rashiName(su.rashi)}</h3><p class="mute">${fmtDeg(su.deg)}</p></div>
      <div><small>${T('Current dasha', 'वर्तमान दशा')}</small><h3>${(() => { const c = k.dasha.find((d) => now >= d.start.getTime() && now < d.end.getTime()); return c ? `${PLANETS[c.lord].sym} ${L(PLANETS[c.lord].n)}` : '—'; })()}</h3><p class="mute">${T('Vimshottari', 'विंशोत्तरी')}</p></div>
    </div>
    ${hasTime ? '' : `<div class="note warn reveal">${T('Birth time was not given, so the lagna and houses are only indicative.', 'जन्म समय नहीं दिया गया, इसलिए लग्न और भाव सिर्फ़ संकेत हैं।')}</div>`}
    <div class="k-main">
      <div class="glass chart-card reveal">
        <div class="chart-tools">
          <div class="seg" id="c-style"><button class="on" data-v="north">${T('North Indian', 'उत्तर भारतीय')}</button><button data-v="south">${T('South Indian', 'दक्षिण भारतीय')}</button></div>
          <div class="seg" id="c-type"><button class="on" data-v="lagna">${T('Lagna (D1)', 'लग्न (D1)')}</button><button data-v="nav">${T('Navamsa (D9)', 'नवांश (D9)')}</button></div>
        </div>
        <div class="chart-stage">${orbitRings(520)}<div id="chart-svg"></div></div>
        <p class="fine">${T('Hover a house or a graha. Rows in the table light up too.', 'किसी भाव या ग्रह पर कर्सर ले जाइए। तालिका की पंक्ति भी चमकेगी।')}</p>
        <div id="house-tip" class="house-tip mute"></div>
      </div>
      <div class="glass reveal k-tbl"><h3>${T('Graha positions', 'ग्रह स्थिति')}</h3>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>${T('Graha', 'ग्रह')}</th><th>${T('Rashi', 'राशि')}</th><th>${T('Degree', 'अंश')}</th><th>${T('Nakshatra', 'नक्षत्र')}</th><th>${T('House', 'भाव')}</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
        <p class="fine">${T('Sidereal, Lahiri ayanamsa', 'निरयन, लाहिरी अयनांश')} ${fmtDeg(k.ayanamsa)} · ${T('Rahu = mean node', 'राहु = मध्यम नोड')} · ${T('Whole-sign houses', 'राशि-भाव पद्धति')}</p></div>
    </div>
    <div class="two">
      <div class="glass reveal"><h3>${T('Vimshottari Dasha', 'विंशोत्तरी दशा')}</h3><div class="dashas">${dashaRows}</div></div>
      <div class="glass reveal" style="--d:.1s"><h3>${T('Panchang at birth', 'जन्म के समय पंचांग')}</h3>
        <dl class="kv"><div><dt>${T('Vara', 'वार')}</dt><dd>${L(WEEKDAY[pc.weekday])}</dd></div>
        <div><dt>${T('Tithi', 'तिथि')}</dt><dd>${L(tithiName)} (${pc.paksha === 'shukla' ? T('Shukla', 'शुक्ल') : T('Krishna', 'कृष्ण')})</dd></div>
        <div><dt>${T('Nakshatra', 'नक्षत्र')}</dt><dd>${L(NAKSHATRA[pc.nakshatra])} · ${pc.pada}</dd></div>
        <div><dt>${T('Yoga', 'योग')}</dt><dd>${L(YOGA[pc.yoga])}</dd></div>
        <div><dt>${T('Karana', 'करण')}</dt><dd>${L(pc.karana)}</dd></div>
        <div><dt>${T('Local birth time', 'स्थानीय समय')}</dt><dd>${fmtDateTime(k.date)}</dd></div></dl>
        <div class="btns"><a class="btn primary" href="#/rashifal/${RASHI[mo.rashi].key}">${T('My rashifal', 'मेरा राशिफल')}</a><a class="btn ghost" href="#/milan">${T('Guna Milan', 'गुण मिलान')}</a></div></div>
    </div>
  </div>`;
}

export function mountKundli(root) {
  mountPlace(root);
  const out = $('#k-out', root);
  $('#k-form', root).addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target), pl = readPlace($('.place', root));
    if (!pl) return;
    const unk = !!fd.get('unk');
    const dt = parseDT(fd.get('d'), fd.get('t'), pl.tz, unk);
    store('kundli', { n: fd.get('n'), d: fd.get('d'), t: fd.get('t'), city: pl.name });
    const k = kundli(dt, pl.lat, pl.lon);
    out.innerHTML = (fd.get('n') ? `<h2 class="k-name reveal">${esc(fd.get('n'))}</h2>` : '') + kundliResult(k, fd.get('n'), !unk);
    observeReveals(out);
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
    let style = 'north', type = 'lagna';
    const draw = () => {
      const nav = type === 'nav';
      const lagna = nav ? k.navamsa.lagna : k.lagna.rashi;
      const gl = chartGrahas(k, nav);
      const center = [fd.get('n') ? esc(fd.get('n')) : '', nav ? T('Navamsa', 'नवांश') : T('Lagna chart', 'लग्न कुंडली')].filter(Boolean);
      $('#chart-svg', out).innerHTML = style === 'north' ? northChart(lagna, gl) : southChart(lagna, gl, center);
      wireChart();
    };
    const wireChart = () => {
      const tip = $('#house-tip', out);
      $$('.house', out).forEach((h) => {
        h.addEventListener('pointerenter', () => {
          const rs = +h.dataset.rashi, hs = +h.dataset.h;
          const pls = GRAHA_ORDER.filter((id) => (type === 'nav' ? k.navamsa.grahas[id] : k.grahas[id].rashi) === rs).map((id) => `${PLANETS[id].sym} ${L(PLANETS[id].n)}`);
          tip.innerHTML = `<b>${T('House', 'भाव')} ${hs}</b> · ${RASHI[rs].sym} ${rashiName(rs)} · ${pls.join(', ') || T('empty', 'खाली')}`;
        });
      });
      $$('.pl', out).forEach((p) => {
        p.addEventListener('pointerenter', () => { $$(`.grow[data-id="${p.dataset.id}"]`, out).forEach((r) => r.classList.add('hl')); });
        p.addEventListener('pointerleave', () => { $$('.grow.hl', out).forEach((r) => r.classList.remove('hl')); });
      });
    };
    draw();
    $$('#c-style button', out).forEach((b) => b.addEventListener('click', () => { style = b.dataset.v; $$('#c-style button', out).forEach((x) => x.classList.toggle('on', x === b)); draw(); }));
    $$('#c-type button', out).forEach((b) => b.addEventListener('click', () => { type = b.dataset.v; $$('#c-type button', out).forEach((x) => x.classList.toggle('on', x === b)); draw(); }));
    $$('.grow', out).forEach((r) => {
      r.addEventListener('pointerenter', () => { $$(`.pl[data-id="${r.dataset.id}"]`, out).forEach((p) => p.classList.add('hl')); r.classList.add('hl'); });
      r.addEventListener('pointerleave', () => { $$('.pl.hl', out).forEach((p) => p.classList.remove('hl')); r.classList.remove('hl'); });
    });
  });
}

// ---------------- GUNA MILAN ----------------
const KOOTA_INFO = {
  varna: [['Varna', 'वर्ण'], ['Work & ego compatibility', 'कार्य और अहं का तालमेल']],
  vashya: [['Vashya', 'वश्य'], ['Mutual attraction & influence', 'आपसी आकर्षण और प्रभाव']],
  tara: [['Tara', 'तारा'], ['Health & well-being together', 'साथ में स्वास्थ्य और कल्याण']],
  yoni: [['Yoni', 'योनि'], ['Natural & physical compatibility', 'स्वाभाविक व शारीरिक तालमेल']],
  maitri: [['Graha Maitri', 'ग्रह मैत्री'], ['Mental affinity & friendship', 'मानसिक मेल और मित्रता']],
  gana: [['Gana', 'गण'], ['Temperament', 'स्वभाव']],
  bhakoot: [['Bhakoot', 'भकूट'], ['Love, family welfare & prosperity', 'प्रेम, पारिवारिक कल्याण और समृद्धि']],
  nadi: [['Nadi', 'नाड़ी'], ['Health & progeny', 'स्वास्थ्य और संतान']],
};
const DOSHA_NOTE = {
  nadi: ['Nadi dosha: same nadi. Often reduced when the rashis or nakshatras differ in specific ways. Please consult a learned astrologer.', 'नाड़ी दोष: दोनों की नाड़ी समान है। कुछ विशेष स्थितियों में इसका परिहार होता है। किसी योग्य ज्योतिषी से परामर्श लें।'],
  bhakoot: ['Bhakoot dosha: the rashis are in a 2-12, 5-9 or 6-8 relation. It is reduced if both rashi lords are friends or the same.', 'भकूट दोष: राशियाँ 2-12, 5-9 या 6-8 के संबंध में हैं। दोनों राशि-स्वामी मित्र या एक हों तो इसका परिहार होता है।'],
  gana: ['Gana dosha: temperaments differ strongly (Deva/Rakshasa). Needs patience and understanding.', 'गण दोष: स्वभाव में अधिक अंतर (देव/राक्षस)। धैर्य और समझदारी की ज़रूरत है।'],
};

function personForm(p, title, def) {
  const f = store('milan_' + p) || {};
  return `<div class="glass form person reveal"><h3>${title}</h3>
    <label class="fld"><span>${T('Name (optional)', 'नाम (वैकल्पिक)')}</span><input name="${p}n" value="${esc(f.n || '')}" autocomplete="off"></label>
    <div class="row2"><label class="fld"><span>${T('Date of birth', 'जन्म तिथि')}</span><input type="date" name="${p}d" required max="${todayISO()}" value="${f.d || ''}"></label>
    <label class="fld"><span>${T('Time of birth', 'जन्म समय')}</span><input type="time" name="${p}t" value="${f.t || '12:00'}"></label></div>
    ${placeHtml(p, f.city || def)}</div>`;
}

export function milanHtml() {
  return `
  <section class="page-sec" data-theme="rose"><div class="wrap">
    <header class="page-head reveal"><p class="eyebrow rose"><i></i>${T('Guna Milan', 'गुण मिलान')}</p>
      <h1>${T('36-guna <em>Ashtakoota</em> matching', '३६ गुण <em>अष्टकूट</em> मिलान')}</h1>
      <p class="mute">${T('Enter both birth details. Matching uses the Moon sign and nakshatra of each person.', 'दोनों के जन्म विवरण भरिए। मिलान दोनों की चंद्र राशि और नक्षत्र से होता है।')}</p></header>
    <form id="m-form"><div class="two">${personForm('a', T('Bride / Girl', 'वधू / कन्या'), 'Delhi')}${personForm('b', T('Groom / Boy', 'वर / लड़का'), 'Delhi')}</div>
      <div class="center"><button class="btn primary magnetic big" type="submit">${T('Match kundlis', 'कुंडली मिलाएँ')}</button></div></form>${datalist()}
    <div id="m-out"></div>
  </div></section>`;
}

function verdict(total) {
  if (total >= 33) return [T('Excellent match', 'उत्तम मिलान'), T('A rare, very harmonious score.', 'एक दुर्लभ और अत्यंत सामंजस्यपूर्ण अंक।'), '#5be3a0'];
  if (total >= 25) return [T('Good match', 'अच्छा मिलान'), T('Strongly recommended by tradition.', 'परंपरा में अनुशंसित।'), '#9be37a'];
  if (total >= 18) return [T('Average match', 'सामान्य मिलान'), T('Acceptable (18+). Understanding and effort will carry it.', 'स्वीकार्य (१८+)। समझदारी और प्रयास से निभेगा।'), '#ffd27a'];
  return [T('Below 18', '१८ से कम'), T('Tradition advises caution. Please consult an astrologer before deciding.', 'परंपरा सावधानी की सलाह देती है। निर्णय से पहले ज्योतिषी से मिलें।'), '#ff7a7a'];
}

function milanResult(a, b, res, names) {
  const [vt, vd, vc] = verdict(res.total);
  const C = 2 * Math.PI * 70;
  const rows = res.kootas.map((k, idx) => {
    const info = KOOTA_INFO[k.key];
    const show = (v) => (k.planets ? L(PLANETS[v].n) : k.rashis ? rashiName(v) : L(v));
    return `<div class="koota glass reveal" style="--d:${idx * 0.05}s">
      <div class="k-top"><div><h4>${L(info[0])}</h4><p class="mute">${L(info[1])}</p></div><b class="k-sc">${k.score}<small>/${k.max}</small></b></div>
      ${bar((k.score / k.max) * 100, k.score === 0 ? 'zero' : '')}
      <p class="k-d">${T('Bride', 'वधू')}: <b>${show(k.bride)}</b> · ${T('Groom', 'वर')}: <b>${show(k.groom)}</b></p></div>`;
  }).join('');
  const dos = res.doshas.map((d) => `<div class="note warn reveal">${L(DOSHA_NOTE[d])}</div>`).join('');
  const person = (p, nm, title) => `<div class="glass reveal mini-person"><small>${title}${nm ? ' · ' + esc(nm) : ''}</small><h3>${RASHI[p.rashi].sym} ${rashiName(p.rashi)}</h3><p class="mute">${L(NAKSHATRA[p.nak])} · ${T('pada', 'चरण')} ${p.pada}</p></div>`;
  return `
  <div class="m-result">
    <div class="m-top">
      ${person(a, names[0], T('Bride', 'वधू'))}
      <div class="gauge glass reveal"><svg viewBox="0 0 180 180"><circle cx="90" cy="90" r="70" class="g-bg"/><circle cx="90" cy="90" r="70" class="g-fg" style="--c:${vc};stroke-dasharray:${C};--off:${C * (1 - res.total / 36)}"/></svg>
        <div class="g-num"><b data-count="${res.total}" data-dec="${res.total % 1 ? 1 : 0}">0</b><small>/ 36</small></div>
        <h3 style="color:${vc}">${vt}</h3><p class="mute">${vd}</p></div>
      ${person(b, names[1], T('Groom', 'वर'))}
    </div>
    ${dos}
    <div class="koota-grid">${rows}</div>
    <p class="fine">${T('Traditions differ slightly in a few koota tables (e.g. Vashya, Gana). A match score is one input, not a verdict on a relationship.', 'कुछ कूट सारणियों (जैसे वश्य, गण) में परंपराओं के बीच थोड़ा अंतर है। यह अंक एक आधार है, रिश्ते का फ़ैसला नहीं।')}</p>
  </div>`;
}

export function mountMilan(root) {
  mountPlace(root);
  const out = $('#m-out', root);
  $('#m-form', root).addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const places = $$('.place', root);
    const pa = readPlace(places[0]), pb = readPlace(places[1]);
    if (!pa || !pb) return;
    const da = parseDT(fd.get('ad'), fd.get('at'), pa.tz), db = parseDT(fd.get('bd'), fd.get('bt'), pb.tz);
    store('milan_a', { n: fd.get('an'), d: fd.get('ad'), t: fd.get('at'), city: pa.name });
    store('milan_b', { n: fd.get('bn'), d: fd.get('bd'), t: fd.get('bt'), city: pb.name });
    const a = moonDetails(da), b = moonDetails(db);
    const res = ashtakoota(a, b); // a = bride, b = groom
    out.innerHTML = milanResult(a, b, res, [fd.get('an'), fd.get('bn')]);
    observeReveals(out); runCounters(out);
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// ---------------- ABOUT ----------------
export function aboutHtml() {
  return `
  <section class="page-sec" data-theme="blue"><div class="wrap narrow">
    <header class="page-head reveal"><p class="eyebrow blue"><i></i>${T('About StarPath', 'स्टारपाथ के बारे में')}</p>
      <h1>${T('How StarPath <em>works</em>', 'स्टारपाथ कैसे <em>काम करता है</em>')}</h1></header>
    <div class="glass prose reveal">
      <h3>${T('Planet positions', 'ग्रह स्थिति')}</h3>
      <p>${T('Positions of the Sun, Moon, Mercury, Venus, Mars, Jupiter and Saturn come from the open-source astronomy-engine library (based on JPL data). Rahu and Ketu use the mean lunar node.', 'सूर्य, चंद्र, बुध, शुक्र, मंगल, गुरु और शनि की स्थिति ओपन-सोर्स astronomy-engine (JPL आधारित) से आती है। राहु-केतु के लिए मध्यम चंद्र-पात लिया है।')}</p>
      <h3>${T('Zodiac & ayanamsa', 'राशि चक्र और अयनांश')}</h3>
      <p>${T('Sidereal zodiac with Lahiri (Chitrapaksha) ayanamsa. In our checks the Sun\'s sankranti times match published panchangs to within about 10 minutes.', 'लाहिरी (चित्रपक्ष) अयनांश के साथ निरयन राशि चक्र। हमारी जाँच में सूर्य की संक्रांति का समय प्रकाशित पंचांगों से लगभग १० मिनट के भीतर मिलता है।')}</p>
      <h3>${T('Lagna & houses', 'लग्न और भाव')}</h3>
      <p>${T('Lagna is computed from sidereal time, latitude and longitude. Houses are whole-sign. A wrong birth time shifts the lagna: 4 minutes is about 1 degree.', 'लग्न नक्षत्र-काल, अक्षांश और देशांतर से निकलता है। भाव राशि-भाव पद्धति में हैं। जन्म समय गलत हो तो लग्न खिसकता है: ४ मिनट लगभग १ अंश।')}</p>
      <h3>${T('Rashifal', 'राशिफल')}</h3>
      <p>${T("Stars come from gochar: where each planet is today counted from your Moon sign, using the classical favourable houses. Sade Sati and Dhaiya come from Saturn's real position. The wording is written by us to match those scores.", 'सितारे गोचर से निकलते हैं: आपकी चंद्र राशि से गिनकर आज हर ग्रह कहाँ है, शास्त्रीय शुभ भावों के आधार पर। साढ़ेसाती और ढैया शनि की असली स्थिति से आते हैं। शब्द इन अंकों के अनुरूप हमने लिखे हैं।')}</p>
      <h3>${T('Guna Milan', 'गुण मिलान')}</h3>
      <p>${T('Standard 36-point Ashtakoota from each person\'s Moon rashi and nakshatra. Some koota tables vary slightly between traditions.', 'हर व्यक्ति की चंद्र राशि और नक्षत्र से मानक ३६ अंक का अष्टकूट। कुछ कूट सारणियाँ परंपराओं में थोड़ी अलग हैं।')}</p>
      <h3>${T('Please note', 'कृपया ध्यान दें')}</h3>
      <p>${T('Astrology is guidance and belief, not science, and predictions cannot be proven. Use StarPath for reflection and entertainment, and decide health, legal and money matters with qualified professionals.', 'ज्योतिष मार्गदर्शन और आस्था है, विज्ञान नहीं, और भविष्यवाणियाँ सिद्ध नहीं की जा सकतीं। स्टारपाथ को चिंतन और मनोरंजन के लिए इस्तेमाल करें, और स्वास्थ्य, क़ानून व धन के फ़ैसले योग्य विशेषज्ञों से लें।')}</p>
    </div>
  </div></section>`;
}
