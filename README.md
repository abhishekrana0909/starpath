# StarPath

Free Vedic astrology site (Hindi + English, dark theme): live 3D solar system, daily/weekly/monthly rashifal, rashi finder (birth details, name, date), kundli (North/South chart, navamsa, Vimshottari dasha, panchang) and 36-guna Ashtakoota matching.

## Run locally
Needs any static server (ES modules do not work from `file://`):

```bash
python -m http.server 8765
```
Then open http://127.0.0.1:8765

No build step. Everything (Three.js, astronomy-engine) is vendored in `vendor/`, so it can be hosted on any static host (GitHub Pages, Netlify, Cloudflare Pages).

## Structure
- `js/astro.js` planet positions (astronomy-engine), Lahiri ayanamsa, lagna, nakshatra, dasha, panchang
- `js/rashifal.js` gochar based daily/weekly/monthly scores, Sade Sati / Dhaiya
- `js/guna.js` Ashtakoota tables
- `js/solar.js` 3D solar system (Earth-centred and Sun-centred)
- `js/bg.js` smoke background shader, `js/fx.js` cursor/tilt/reveal effects
- `js/pages_*.js`, `js/main.js` pages and router
- `tests/` run with `node tests/accuracy.mjs` and `node tests/logic.mjs`

## Accuracy notes
- Sun sankranti times match published panchangs to ~10 minutes (about 0.004 deg).
- Rahu/Ketu use the mean node. Houses are whole-sign.
- A few Ashtakoota cells (Vashya, Gana) differ between traditions; the commonly published set is used.
- Rashifal stars are computed from real transits; wording comes from phrase banks. Not a guarantee.
