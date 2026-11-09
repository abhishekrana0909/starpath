import { initBackground } from './bg.js';
import { initFX, observeReveals } from './fx.js';
import { T, getLang, setLang } from './i18n.js';
import { homeHtml, mountHome, disposeHome } from './pages_home.js';
import { rashifalHtml, mountRashifal, rashiPageHtml } from './pages_rashifal.js';
import { finderHtml, mountFinder, kundliHtml, mountKundli, milanHtml, mountMilan, aboutHtml } from './pages_tools.js';
import { runCounters } from './ui.js';

const app = document.getElementById('app');
const bg = initBackground(document.getElementById('bg'));
initFX();

const NAV = [
  ['home', '#/', 'Home', 'होम'], ['rashifal', '#/rashifal', 'Rashifal', 'राशिफल'], ['finder', '#/finder', 'Find Rashi', 'राशि खोज'],
  ['kundli', '#/kundli', 'Kundli', 'कुंडली'], ['milan', '#/milan', 'Guna Milan', 'गुण मिलान'], ['about', '#/about', 'About', 'परिचय'],
];

function buildChrome(active) {
  const hi = getLang() === 'hi';
  document.getElementById('nav-links').innerHTML = NAV.map(([k, h, en, hin]) => `<a href="${h}" class="${k === active ? 'on' : ''}">${hi ? hin : en}</a>`).join('');
  document.getElementById('lang-btn').innerHTML = `<b class="${hi ? 'on' : ''}">हिं</b><b class="${hi ? '' : 'on'}">EN</b>`;
  document.getElementById('foot-text').textContent = T('StarPath is guidance, not a guarantee. Planet positions: astronomy-engine · Lahiri ayanamsa.', 'स्टारपाथ मार्गदर्शन है, गारंटी नहीं। ग्रह स्थिति: astronomy-engine · लाहिरी अयनांश।');
  document.getElementById('foot-links').innerHTML = NAV.slice(1).map(([k, h, en, hin]) => `<a href="${h}">${hi ? hin : en}</a>`).join('');
}

function parse() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  return { name: parts[0] || 'home', args: parts.slice(1) };
}

let lastKey = '';
function render() {
  disposeHome();
  const { name, args } = parse();
  const key = location.hash;
  const sameRoute = key === lastKey;
  lastKey = key;
  document.body.dataset.route = name;
  let title = 'StarPath';
  switch (name) {
    case 'rashifal': {
      const tab = ['daily', 'weekly', 'monthly'].includes(args[1]) ? args[1] : 'daily';
      const draw = (off = 0) => {
        app.innerHTML = rashifalHtml(args[0], tab, off);
        mountRashifal(app, args[0], tab, draw); observeReveals(app);
      };
      draw(0); title = T('Rashifal', 'राशिफल'); break;
    }
    case 'rashi': app.innerHTML = rashiPageHtml(args[0]); title = T('Rashi', 'राशि'); break;
    case 'finder': { const tab = ['birth', 'name', 'date'].includes(args[0]) ? args[0] : 'birth'; app.innerHTML = finderHtml(tab); mountFinder(app, tab); title = T('Find my rashi', 'मेरी राशि'); break; }
    case 'kundli': app.innerHTML = kundliHtml(); mountKundli(app); title = T('Kundli', 'कुंडली'); break;
    case 'milan': app.innerHTML = milanHtml(); mountMilan(app); title = T('Guna Milan', 'गुण मिलान'); break;
    case 'about': app.innerHTML = aboutHtml(); title = T('About', 'परिचय'); break;
    default: app.innerHTML = homeHtml(); mountHome(app); break;
  }
  document.title = (title === 'StarPath' ? 'StarPath · ' + T('Rashifal, Kundli, Guna Milan', 'राशिफल, कुंडली, गुण मिलान') : title + ' · StarPath');
  buildChrome(NAV.some((n) => n[0] === name) ? name : name === 'rashi' ? 'rashifal' : 'home');
  document.getElementById('nav').classList.remove('open');
  if (!sameRoute) window.scrollTo(0, 0);
  observeReveals(app);
  runCounters(app);
  watchThemes();
}

// colour the smoke by the section in view
let themeRaf = 0;
function watchThemes() {
  const apply = () => {
    themeRaf = 0;
    const secs = [...app.querySelectorAll('[data-theme]')];
    if (!secs.length) { bg.setTheme('hero'); return; }
    const mid = innerHeight * 0.45;
    let pick = secs[0];
    for (const s of secs) { const r = s.getBoundingClientRect(); if (r.top <= mid) pick = s; }
    bg.setTheme(pick.dataset.theme);
    document.getElementById('nav').classList.toggle('solid', scrollY > 30);
  };
  if (!watchThemes.bound) {
    addEventListener('scroll', () => { if (!themeRaf) themeRaf = requestAnimationFrame(apply); }, { passive: true });
    watchThemes.bound = true;
  }
  apply();
}

addEventListener('hashchange', render);
addEventListener('langchange', () => { lastKey = location.hash; render(); });
document.getElementById('lang-btn').addEventListener('click', () => setLang(getLang() === 'hi' ? 'en' : 'hi'));
document.getElementById('burger').addEventListener('click', () => document.getElementById('nav').classList.toggle('open'));
render();
