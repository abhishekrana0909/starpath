import { T, L, fmtDate } from './i18n.js';
import { RASHI, PLANETS, GRAHA_ORDER, NAKSHATRA, TITHI, AMAVASYA, YOGA, WEEKDAY, WEEKDAY_LORD } from './data.js';
import { grahas, panchang, fmtDeg } from './astro.js';
import { daily } from './rashifal.js';
import { createSolar } from './solar.js';
import { moonPhaseSvg, nakshatraWheel, orbitRings } from './charts.js';
import { starsHtml, rashiName, nakList, $ } from './ui.js';

let solar = null;
export function disposeHome() { if (solar) { solar.dispose(); solar = null; } }

const SUN_DATES = [['14 Apr', '14 May'], ['15 May', '14 Jun'], ['15 Jun', '15 Jul'], ['16 Jul', '16 Aug'], ['17 Aug', '16 Sep'], ['17 Sep', '16 Oct'],
  ['17 Oct', '15 Nov'], ['16 Nov', '15 Dec'], ['16 Dec', '13 Jan'], ['14 Jan', '12 Feb'], ['13 Feb', '13 Mar'], ['14 Mar', '13 Apr']];

export function homeHtml() {
  const now = new Date();
  const pc = panchang(now);
  const gr = grahas(now);
  const tithiName = pc.isAmavasya ? AMAVASYA : TITHI[pc.tithiInPaksha - 1];
  const paksha = pc.paksha === 'shukla' ? T('Shukla Paksha', 'शुक्ल पक्ष') : T('Krishna Paksha', 'कृष्ण पक्ष');
  const wd = WEEKDAY[pc.weekday];

  const cards = RASHI.map((r, i) => {
    const d = daily(i, now);
    return `<a class="rashi-card glass tilt reveal" href="#/rashifal/${r.key}" style="--d:${i * 0.05}s;--el:${['#ff6a3d', '#62d26f', '#f2d15a', '#4aa8ff'][r.el]}">
      <div class="rc-sym"><span class="rc-orbit"></span><span class="rc-orbit o2"></span><b>${r.sym}</b></div>
      <h3>${L(r.n)}</h3>
      <p class="rc-sub">${r.n[2]} · ${L(PLANETS[['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'][i]].n)}</p>
      ${starsHtml(d.stars)}
      <p class="rc-line">${L(d.text)}</p>
      <span class="rc-go">${T('Read today →', 'आज का राशिफल →')}</span>
    </a>`;
  }).join('');

  const grahaRows = GRAHA_ORDER.map((id) => {
    const g = gr[id];
    return `<tr class="grow" data-id="${id}"><td><span class="gdot" style="--c:${PLANETS[id].color}">${PLANETS[id].sym}</span> ${L(PLANETS[id].n)}${g.retro && id !== 'Rahu' && id !== 'Ketu' ? ' <em class="retro">℞</em>' : ''}</td>
      <td>${RASHI[g.rashi].sym} ${rashiName(g.rashi)}</td><td class="num">${fmtDeg(g.deg)}</td><td>${L(NAKSHATRA[g.nak])}</td></tr>`;
  }).join('');

  return `
  <section class="hero" data-theme="hero" id="top">
    <div id="solar" class="solar" aria-label="3D solar system"></div>
    <div class="hero-text">
      <p class="eyebrow reveal"><i></i>${T('Vedic astrology · live sky', 'वैदिक ज्योतिष · जीवंत आकाश')}</p>
      <h1 class="reveal" style="--d:.08s">${T('Know your <em>rashi</em>.<br>Know your <em>day</em>.', 'अपनी <em>राशि</em> जानिए।<br>अपना <em>दिन</em> जानिए।')}</h1>
      <p class="lead reveal" style="--d:.16s">${T('Real planetary positions from NASA-grade data. Daily rashifal, kundli, rashi finder and Guna Milan, free, in Hindi and English.', 'असली ग्रह-स्थिति पर आधारित। रोज़ का राशिफल, कुंडली, राशि खोज और गुण मिलान, मुफ़्त, हिंदी और अंग्रेज़ी में।')}</p>
      <div class="btns reveal" style="--d:.24s">
        <a class="btn primary magnetic" href="#/rashifal">${T("Today's rashifal", 'आज का राशिफल')}</a>
        <a class="btn ghost magnetic" href="#/finder">${T('Which is my rashi?', 'मेरी राशि कौन सी है?')}</a>
      </div>
      <div class="live-pill reveal" style="--d:.32s"><span class="pulse"></span>${T('Sky right now', 'अभी का आसमान')}: ${T('Moon in', 'चंद्र')} <b>${rashiName(pc.moonRashi)}</b> · ${L(NAKSHATRA[pc.nakshatra])}</div>
    </div>
    <div class="solar-ui">
      <div class="seg" id="sol-mode"><button class="on" data-m="0">${T('Earth-centred (Jyotish)', 'पृथ्वी केंद्र (ज्योतिष)')}</button><button data-m="1">${T('Sun-centred', 'सूर्य केंद्र')}</button></div>
      <div class="timebar">
        <button id="sol-play" class="ico" title="Play/Pause" aria-label="Play or pause">❚❚</button>
        <input id="sol-speed" type="range" min="-30" max="30" step="1" value="3" aria-label="Speed (days per second)">
        <span id="sol-spd">+3 ${T('d/s', 'दिन/से')}</span>
        <span id="sol-date" class="sdate"></span>
        <button id="sol-live" class="btn mini">${T('Live', 'अभी')}</button>
      </div>
    </div>
    <div id="solar-tip" class="solar-tip glass"></div>
    <div class="scroll-hint"><span></span>${T('Drag to rotate · hover a planet or rashi', 'घुमाइए · ग्रह या राशि पर कर्सर ले जाइए')}</div>
  </section>

  <section class="sec sec-gold" data-theme="gold" id="rashis">
    <svg class="mandala" viewBox="0 0 400 400" aria-hidden="true">${Array.from({ length: 12 }, (_, i) => `<g transform="rotate(${i * 30} 200 200)"><ellipse cx="200" cy="70" rx="22" ry="62" fill="none" stroke="rgba(255,210,122,.25)"/><circle cx="200" cy="30" r="3" fill="rgba(255,210,122,.6)"/></g>`).join('')}<circle cx="200" cy="200" r="120" fill="none" stroke="rgba(255,210,122,.2)" stroke-dasharray="3 9"/></svg>
    <div class="wrap">
      <header class="sec-head reveal"><p class="eyebrow gold"><i></i>${T('The 12 rashis', '१२ राशियाँ')}</p>
        <h2>${T('Choose your <em>rashi chakra</em>', 'अपना <em>राशि चक्र</em> चुनिए')}</h2>
        <p>${T("Each card shows today's mood for that rashi, computed from the Moon's and planets' real transit.", 'हर कार्ड आज के चंद्र और ग्रहों के असली गोचर से निकला उस राशि का हाल दिखाता है।')}</p></header>
      <div class="rashi-grid">${cards}</div>
      <p class="fine reveal">${T('Rashi here means the Moon sign (Chandra rashi), the one Vedic astrology uses. Not sure of yours?', 'यहाँ राशि का मतलब चंद्र राशि है, जो वैदिक ज्योतिष में चलती है। अपनी राशि नहीं पता?')} <a href="#/finder">${T('Find it here', 'यहाँ पता करें')}</a></p>
    </div>
  </section>

  <section class="sec sec-teal" data-theme="teal" id="panchang">
    <div class="wrap">
      <header class="sec-head reveal"><p class="eyebrow teal"><i></i>${T("Today's panchang", 'आज का पंचांग')}</p>
        <h2>${T('The sky <em>right now</em>', 'आसमान <em>अभी</em> कैसा है')}</h2>
        <p>${fmtDate(now, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p></header>
      <div class="pan-grid">
        <div class="glass pan-moon reveal">
          <div class="moon-wrap">${moonPhaseSvg(pc.elong)}<span class="halo"></span><span class="halo h2"></span></div>
          <h3>${L(tithiName)}</h3><p class="mute">${paksha} · ${Math.round(pc.illumination * 100)}% ${T('lit', 'प्रकाशित')}</p>
          <dl class="kv">
            <div><dt>${T('Vara', 'वार')}</dt><dd>${L(wd)}</dd></div>
            <div><dt>${T('Nakshatra', 'नक्षत्र')}</dt><dd>${L(NAKSHATRA[pc.nakshatra])} · ${T('pada', 'चरण')} ${pc.pada}</dd></div>
            <div><dt>${T('Yoga', 'योग')}</dt><dd>${L(YOGA[pc.yoga])}</dd></div>
            <div><dt>${T('Karana', 'करण')}</dt><dd>${L(pc.karana)}</dd></div>
            <div><dt>${T('Moon rashi', 'चंद्र राशि')}</dt><dd>${RASHI[pc.moonRashi].sym} ${rashiName(pc.moonRashi)}</dd></div>
            <div><dt>${T('Sun rashi', 'सूर्य राशि')}</dt><dd>${RASHI[pc.sunRashi].sym} ${rashiName(pc.sunRashi)}</dd></div>
          </dl>
        </div>
        <div class="glass pan-wheel reveal" style="--d:.1s">${nakshatraWheel(pc.nakshatra, NAKSHATRA)}</div>
        <div class="glass pan-table reveal" style="--d:.2s">
          <h3>${T('Where are the grahas?', 'ग्रह कहाँ हैं?')}<span class="live-dot"></span></h3>
          <table class="tbl"><thead><tr><th>${T('Graha', 'ग्रह')}</th><th>${T('Rashi', 'राशि')}</th><th>${T('Degree', 'अंश')}</th><th>${T('Nakshatra', 'नक्षत्र')}</th></tr></thead><tbody>${grahaRows}</tbody></table>
          <p class="fine">${T('Sidereal (Lahiri) positions, geocentric. ℞ = retrograde.', 'निरयन (लाहिरी) स्थिति, भू-केंद्रित। ℞ = वक्री।')}</p>
        </div>
      </div>
    </div>
  </section>

  <section class="sec sec-rose" data-theme="rose" id="tools">
    <div class="wrap">
      <header class="sec-head reveal"><p class="eyebrow rose"><i></i>${T('Tools', 'उपकरण')}</p>
        <h2>${T('Everything for your <em>kundli</em>', 'आपकी <em>कुंडली</em> का सब कुछ')}</h2></header>
      <div class="tool-grid">
        <a class="tool glass tilt reveal" href="#/kundli" style="--d:0s"><div class="t-ico"><i class="o1"></i><i class="o2"></i><b>☉</b></div><h3>${T('Kundli', 'कुंडली')}</h3><p>${T('Birth chart with lagna, nine grahas, navamsa, Vimshottari dasha and panchang.', 'लग्न, नौ ग्रह, नवांश, विंशोत्तरी दशा और पंचांग के साथ जन्म कुंडली।')}</p><span class="rc-go">${T('Make kundli →', 'कुंडली बनाएँ →')}</span></a>
        <a class="tool glass tilt reveal" href="#/milan" style="--d:.08s"><div class="t-ico"><i class="o1"></i><i class="o2"></i><b>♡</b></div><h3>${T('Guna Milan', 'गुण मिलान')}</h3><p>${T('36-guna Ashtakoota matching for two kundlis, with every koota explained.', 'दो कुंडलियों का ३६ गुण अष्टकूट मिलान, हर कूट की व्याख्या के साथ।')}</p><span class="rc-go">${T('Match now →', 'मिलान करें →')}</span></a>
        <a class="tool glass tilt reveal" href="#/finder" style="--d:.16s"><div class="t-ico"><i class="o1"></i><i class="o2"></i><b>☽</b></div><h3>${T('Rashi Finder', 'राशि खोजें')}</h3><p>${T("Don't know your rashi? Find it from birth details, your name, or just the date.", 'राशि नहीं पता? जन्म विवरण, नाम या सिर्फ़ तारीख़ से पता करें।')}</p><span class="rc-go">${T('Find mine →', 'मेरी राशि →')}</span></a>
        <a class="tool glass tilt reveal" href="#/rashifal" style="--d:.24s"><div class="t-ico"><i class="o1"></i><i class="o2"></i><b>✦</b></div><h3>${T('Rashifal', 'राशिफल')}</h3><p>${T('Daily, weekly and monthly outlook with love, career, money and health stars.', 'दैनिक, साप्ताहिक और मासिक राशिफल, प्रेम, करियर, धन और स्वास्थ्य के सितारों के साथ।')}</p><span class="rc-go">${T('Read →', 'पढ़ें →')}</span></a>
      </div>
    </div>
  </section>

  <section class="sec sec-blue" data-theme="blue" id="how">
    <div class="wrap">
      <header class="sec-head reveal"><p class="eyebrow blue"><i></i>${T('Why trust it', 'भरोसा क्यों')}</p>
        <h2>${T('Real <em>astronomy</em>, classical <em>jyotish</em>', 'असली <em>खगोल विज्ञान</em>, शास्त्रीय <em>ज्योतिष</em>')}</h2></header>
      <div class="how-grid">
        <div class="glass how reveal"><b>01</b><h3>${T('Real sky data', 'असली आकाश डेटा')}</h3><p>${T('Planet positions come from the astronomy-engine library (JPL-based), accurate to arc-minutes.', 'ग्रहों की स्थिति astronomy-engine (JPL आधारित) से आती है, जो कला-मिनट तक सही है।')}</p></div>
        <div class="glass how reveal" style="--d:.08s"><b>02</b><h3>${T('Lahiri ayanamsa', 'लाहिरी अयनांश')}</h3><p>${T('Sidereal zodiac with the Indian government standard (Chitrapaksha) ayanamsa, as used by most panchangs.', 'भारत सरकार के मानक (चित्रपक्ष) अयनांश के साथ निरयन राशि चक्र, जो अधिकांश पंचांग में उपयोग होता है।')}</p></div>
        <div class="glass how reveal" style="--d:.16s"><b>03</b><h3>${T('Gochar-based rashifal', 'गोचर आधारित राशिफल')}</h3><p>${T("Stars are computed from where the planets are today relative to your Moon sign. Words are picked to match.", 'सितारे आपकी चंद्र राशि से आज ग्रह कहाँ हैं, इससे निकलते हैं। शब्द उसी के अनुसार चुने जाते हैं।')}</p></div>
      </div>
      <p class="disclaimer reveal">${T('Astrology is guidance, not a guarantee. Predictions cannot be measured or proven. Please use them for reflection and entertainment, and take medical, legal and financial decisions with qualified professionals.', 'ज्योतिष मार्गदर्शन है, गारंटी नहीं। भविष्यवाणियों को मापा या सिद्ध नहीं किया जा सकता। इन्हें चिंतन और मनोरंजन के लिए लें, और चिकित्सा, क़ानून व वित्त के फ़ैसले योग्य विशेषज्ञों से लें।')}</p>
    </div>
  </section>`;
}

export function mountHome(root) {
  const el = $('#solar', root);
  const tip = $('#solar-tip', root);
  const dateEl = $('#sol-date', root);
  const fmt = (d) => d.toLocaleDateString(L(['en-IN', 'hi-IN']), { day: 'numeric', month: 'short', year: 'numeric' });
  solar = createSolar(el, {
    onTime: (d) => { dateEl.textContent = fmt(d); },
    onHover: (info, x, y) => {
      if (!info) { tip.classList.remove('show'); return; }
      const rect = el.getBoundingClientRect();
      tip.style.left = Math.min(rect.right - 250, Math.max(rect.left + 10, x + 18)) - rect.left + 'px';
      tip.style.top = Math.max(10, y - rect.top - 20) + 'px';
      if (info.kind === 'graha') {
        tip.innerHTML = `<div class="tip-h" style="--c:${info.color}"><b>${info.sym}</b> ${L(info.name)}</div>
          <div>${info.rashi.sym} ${L(info.rashi.n)} · ${fmtDeg(info.deg)}</div><div class="mute">${L(info.nak)}</div>`;
      } else {
        const names = info.planets.map((p) => `<span style="color:${PLANETS[p].color}">${PLANETS[p].sym} ${L(PLANETS[p].n)}</span>`).join(' · ');
        tip.innerHTML = `<div class="tip-h"><b>${info.rashi.sym}</b> ${L(info.rashi.n)}</div>
          <div class="mute">${nakList(info.rashi.nak)}</div>
          <div>${names || T('No graha here now', 'अभी कोई ग्रह नहीं')}</div>`;
      }
      tip.classList.add('show');
    },
  });
  const speed = $('#sol-speed', root), spd = $('#sol-spd', root), play = $('#sol-play', root);
  speed.addEventListener('input', () => { const v = +speed.value; solar.setSpeed(v); spd.textContent = (v > 0 ? '+' : '') + v + ' ' + T('d/s', 'दिन/से'); });
  play.addEventListener('click', () => { solar.setPaused(!solar.isPaused()); play.textContent = solar.isPaused() ? '▶' : '❚❚'; });
  $('#sol-live', root).addEventListener('click', () => { solar.live(); speed.value = 0; spd.textContent = T('Live', 'लाइव'); play.textContent = '❚❚'; });
  root.querySelectorAll('#sol-mode button').forEach((b) => b.addEventListener('click', () => {
    root.querySelectorAll('#sol-mode button').forEach((x) => x.classList.toggle('on', x === b));
    solar.setMode(b.dataset.m === '1');
  }));
  // graha table <-> hover feedback
  root.querySelectorAll('.grow').forEach((r) => {
    r.addEventListener('pointerenter', () => r.classList.add('hl'));
    r.addEventListener('pointerleave', () => r.classList.remove('hl'));
  });
}
