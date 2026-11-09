// Tiny i18n: every visible text is passed as T('English', 'हिन्दी').
let lang = 'hi';
try { lang = localStorage.getItem('sp_lang') || 'hi'; } catch (e) { /* ignore */ }

export const getLang = () => lang;
export const isHi = () => lang === 'hi';
export const T = (en, hi) => (lang === 'hi' ? hi : en);
/** Pick from a [en, hi] pair. */
export const L = (pair) => (pair ? (lang === 'hi' ? pair[1] : pair[0]) : '');

export function setLang(l) {
  lang = l;
  try { localStorage.setItem('sp_lang', l); } catch (e) { /* ignore */ }
  document.documentElement.lang = l;
  window.dispatchEvent(new CustomEvent('langchange', { detail: l }));
}
document.documentElement.lang = lang;

export const locale = () => (lang === 'hi' ? 'hi-IN' : 'en-IN');
export const fmtDate = (d, opts = { day: 'numeric', month: 'short', year: 'numeric' }) => d.toLocaleDateString(locale(), opts);
export const fmtDateTime = (d) => d.toLocaleString(locale(), { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
