// 3D solar system: real planet positions from astronomy-engine. Geocentric (Jyotish) <-> Heliocentric morph.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Astronomy, siderealLon, rahuLon, AYANAMSA_J2000, norm, rashiOf, degInRashi, nakshatraOf } from './astro.js';
import { RASHI, PLANETS, NAKSHATRA } from './data.js';
import { L } from './i18n.js';

const D2R = Math.PI / 180;
const EPS = 23.4392911 * D2R;
const ELEM_COL = [0xff6a3d, 0x62d26f, 0xf2d15a, 0x4aa8ff]; // fire, earth, air, water

// geocentric display radii (Chaldean order from Earth)
const R_GEO = { Moon: 7, Mercury: 11, Venus: 15, Sun: 19, Mars: 24, Jupiter: 29, Saturn: 34, Rahu: 38.5, Ketu: 38.5 };
const AU_R = (a) => 12 * Math.sqrt(a);           // heliocentric display radius from AU
const SIZE = { Sun: 2.6, Moon: 0.45, Mercury: 0.55, Venus: 0.95, Earth: 1.05, Mars: 0.75, Jupiter: 2.2, Saturn: 1.8, Rahu: 0.7, Ketu: 0.7 };
const ZOD_IN = 42.5, ZOD_OUT = 47.5;

const posFromLon = (lonDeg, r) => new THREE.Vector3(Math.cos(lonDeg * D2R) * r, 0, -Math.sin(lonDeg * D2R) * r);

function helioLon(body, date) {
  const v = Astronomy.HelioVector(body, date);
  const y = v.y * Math.cos(EPS) + v.z * Math.sin(EPS);
  return { lon: norm(Math.atan2(y, v.x) / D2R - AYANAMSA_J2000), au: Math.hypot(v.x, v.y, v.z) };
}

// ---------- procedural textures ----------
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
let seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
function bandTex(colors, noiseAmt = 0.15, spots = 0) {
  return canvasTex(256, 128, (g, w, h) => {
    for (let y = 0; y < h; y++) {
      const t = (y / h) * colors.length * 1.7 + Math.sin(y * 0.3) * 0.4;
      const c = colors[Math.floor(Math.abs(t)) % colors.length];
      g.fillStyle = c; g.fillRect(0, y, w, 1);
    }
    for (let i = 0; i < 900; i++) {
      g.fillStyle = `rgba(255,255,255,${rnd() * noiseAmt})`; g.fillRect(rnd() * w, rnd() * h, rnd() * 22 + 4, 1.4);
      g.fillStyle = `rgba(0,0,0,${rnd() * noiseAmt})`; g.fillRect(rnd() * w, rnd() * h, rnd() * 26 + 4, 1.2);
    }
    for (let i = 0; i < spots; i++) { g.fillStyle = 'rgba(170,70,40,.6)'; g.beginPath(); g.ellipse(rnd() * w, h * 0.62, 10, 5, 0, 0, 6.3); g.fill(); }
  });
}
function mottled(base, dark, light, n = 700) {
  return canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < n; i++) {
      g.fillStyle = rnd() > 0.5 ? dark : light; g.globalAlpha = rnd() * 0.35;
      g.beginPath(); g.arc(rnd() * w, rnd() * h, rnd() * 9 + 1, 0, 6.3); g.fill();
    }
    g.globalAlpha = 1;
  });
}
function earthTex() {
  return canvasTex(512, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#1a4f9c'); gr.addColorStop(0.5, '#1b6fd0'); gr.addColorStop(1, '#1a4f9c');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) {
      const cx = rnd() * w, cy = h * (0.15 + rnd() * 0.7);
      g.fillStyle = rnd() > 0.3 ? '#3f9a4b' : '#b7a56a';
      g.beginPath();
      for (let k = 0; k < 9; k++) { const a = k / 9 * 6.28, r = 10 + rnd() * 26; g.lineTo(cx + Math.cos(a) * r * 1.4, cy + Math.sin(a) * r * 0.8); }
      g.closePath(); g.fill();
    }
    g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(0, 0, w, 10); g.fillRect(0, h - 10, w, 10);
    for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(255,255,255,${rnd() * 0.45})`; g.fillRect(rnd() * w, rnd() * h, rnd() * 60 + 10, rnd() * 4 + 1); }
  });
}
function glowTex(inner = 'rgba(255,255,255,1)', mid = 'rgba(255,255,255,.25)') {
  return canvasTex(128, 128, (g) => {
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, inner); gr.addColorStop(0.25, mid); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  });
}
function ringTex() {
  return canvasTex(256, 8, (g, w, h) => {
    for (let x = 0; x < w; x++) {
      const a = 0.15 + 0.7 * Math.abs(Math.sin(x * 0.19) * Math.cos(x * 0.07));
      g.fillStyle = `rgba(222,200,160,${a})`; g.fillRect(x, 0, 1, h);
    }
  });
}
function labelSprite(lines, opts = {}) {
  const { size = 256, color = '#fff', glyph = null, glyphColor = '#ffd27a' } = opts;
  const c = document.createElement('canvas'); c.width = size * 2; c.height = size;
  const g = c.getContext('2d');
  g.textAlign = 'center'; g.shadowColor = 'rgba(0,0,0,.9)'; g.shadowBlur = 10;
  let y = size * 0.5;
  if (glyph) { g.fillStyle = glyphColor; g.font = `${size * 0.36}px "Noto Sans Symbols", "Segoe UI Symbol", sans-serif`; g.fillText(glyph, size, y - size * 0.02); y += size * 0.26; }
  g.fillStyle = color; g.font = `600 ${size * 0.16}px "Poppins","Noto Sans Devanagari",sans-serif`;
  lines.forEach((ln, i) => g.fillText(ln, size, y + i * size * 0.19));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, depthTest: false }));
  s.scale.set(11, 5.5, 1); s.renderOrder = 10;
  return s;
}
function tinyLabel(glyph, color) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 128;
  const g = c.getContext('2d');
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = color; g.shadowBlur = 14;
  g.fillStyle = color; g.font = '84px "Noto Sans Symbols","Segoe UI Symbol",sans-serif'; g.fillText(glyph, 64, 70);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, depthTest: false, opacity: 0.95 }));
  s.scale.set(3.2, 3.2, 1); s.renderOrder = 11;
  return s;
}

export function createSolar(container, cb = {}) {
  const small = Math.min(innerWidth, innerHeight) < 700;
  const renderer = new THREE.WebGLRenderer({ antialias: !small, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);
  renderer.domElement.style.touchAction = 'pan-y';

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 2000);
  camera.position.set(0, 52, 92);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.06;
  controls.enableZoom = false; controls.enablePan = false;
  controls.autoRotate = true; controls.autoRotateSpeed = 0.55;
  controls.minPolarAngle = 0.25; controls.maxPolarAngle = 1.45;
  controls.target.set(0, 0, 0);

  scene.add(new THREE.AmbientLight(0x8890c8, 0.55));
  const sunLight = new THREE.PointLight(0xfff0d0, 3.2, 0, 0.6);
  scene.add(sunLight);

  const glowT = glowTex();
  const segs = small ? 20 : 36;
  const bodies = {};
  const mk = (id, mat, extra = {}) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, segs, segs / 2 + 2), mat);
    mesh.userData.id = id;
    const grp = new THREE.Group();
    grp.add(mesh);
    const base = SIZE[id];
    bodies[id] = { id, grp, mesh, base, size: base, lon: 0, hover: 0, ...extra };
    mesh.scale.setScalar(base);
    scene.add(grp);
    return bodies[id];
  };

  // Sun
  const sun = mk('Sun', new THREE.MeshBasicMaterial({ color: 0xffb347 }));
  for (const [sc, op, col] of [[14, 0.9, 0xffa640], [32, 0.45, 0xff7a2a], [58, 0.22, 0xff5a1a]]) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false }));
    sp.scale.setScalar(sc); sp.userData.base = sc; sp.userData.op = op; sun.grp.add(sp); (sun.glows ||= []).push(sp);
  }
  // Planets
  mk('Mercury', new THREE.MeshStandardMaterial({ map: mottled('#8f8a86', '#55504c', '#bdb8b2'), roughness: 0.95 }));
  mk('Venus', new THREE.MeshStandardMaterial({ map: bandTex(['#e6c88a', '#d8b373', '#efd9a3', '#cfa862'], 0.1), roughness: 0.8 }));
  const earth = mk('Earth', new THREE.MeshStandardMaterial({ map: earthTex(), roughness: 0.7 }));
  const atmo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: 0x5ab0ff, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
  atmo.scale.setScalar(4.4); earth.grp.add(atmo);
  mk('Moon', new THREE.MeshStandardMaterial({ map: mottled('#a9a9ad', '#6c6c72', '#d8d8dc', 500), roughness: 1 }));
  mk('Mars', new THREE.MeshStandardMaterial({ map: mottled('#b4502f', '#7a2f1a', '#d98a5a'), roughness: 0.95 }));
  mk('Jupiter', new THREE.MeshStandardMaterial({ map: bandTex(['#d9b68a', '#b98558', '#ead3ad', '#a8734a', '#e2c397'], 0.2, 1), roughness: 0.85 }));
  const sat = mk('Saturn', new THREE.MeshStandardMaterial({ map: bandTex(['#e6d2a1', '#d2b985', '#f0e0b8'], 0.1), roughness: 0.85 }));
  const ringGeo = new THREE.RingGeometry(1.45, 2.5, 80);
  { // radial UVs so the ring texture runs across the width
    const p = ringGeo.attributes.position, uv = ringGeo.attributes.uv, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); uv.setXY(i, v.length() < 2 ? 0 : 1, 1); }
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); uv.setXY(i, (v.length() - 1.45) / 1.05, 0.5); }
  }
  const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ map: ringTex(), transparent: true, side: THREE.DoubleSide, depthWrite: false }));
  ring.rotation.x = Math.PI / 2 - 0.45; ring.scale.setScalar(SIZE.Saturn);
  sat.grp.add(ring);
  // nodes
  for (const id of ['Rahu', 'Ketu']) {
    const b = mk(id, new THREE.MeshBasicMaterial({ color: id === 'Rahu' ? 0x7a4cff : 0xc89a5a, transparent: true, opacity: 0.85 }));
    const g = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: PLANETS[id].color, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
    g.scale.setScalar(4.2); b.grp.add(g);
  }
  // symbol tags + hover rings
  for (const id of Object.keys(bodies)) {
    const b = bodies[id];
    const pl = PLANETS[id];
    if (pl) { b.tag = tinyLabel(pl.sym, pl.color); b.tag.position.set(0, b.size + 2.2, 0); b.grp.add(b.tag); }
    // generous invisible hit-sphere
    const hit = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshBasicMaterial({ visible: false }));
    hit.scale.setScalar(Math.max(2.4, b.base * 1.7)); hit.userData.id = id; b.grp.add(hit); b.hit = hit;
    const hr = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: pl ? pl.color : 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    hr.scale.setScalar(b.base * 5); b.halo = hr; b.grp.add(hr);
  }
  bodies.Earth.tag = tinyLabel('⊕', '#6fc0ff'); bodies.Earth.tag.position.set(0, SIZE.Earth + 2.2, 0); bodies.Earth.grp.add(bodies.Earth.tag);

  // ---------- orbits (thin rings) ----------
  const orbitMat = (c, o) => new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: o });
  const circle = (r, n = 160) => {
    const pts = []; for (let i = 0; i <= n; i++) { const a = i / n * 6.2832; pts.push(new THREE.Vector3(Math.cos(a), 0, Math.sin(a))); }
    return new THREE.BufferGeometry().setFromPoints(pts);
  };
  const orbits = {};
  for (const id of ['Moon', 'Mercury', 'Venus', 'Sun', 'Mars', 'Jupiter', 'Saturn', 'Earth']) {
    const line = new THREE.LineLoop(circle(1), orbitMat(id === 'Sun' ? 0xffb347 : 0x9aa6ff, 0.28));
    scene.add(line); orbits[id] = line;
  }
  // ---------- zodiac ring ----------
  const zodiac = new THREE.Group(); scene.add(zodiac);
  const sectors = [];
  for (let i = 0; i < 12; i++) {
    const geo = new THREE.RingGeometry(ZOD_IN, ZOD_OUT, 24, 1, i * 30 * D2R + 0.012, 30 * D2R - 0.024);
    const mat = new THREE.MeshBasicMaterial({ color: ELEM_COL[RASHI[i].el], transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false });
    const m = new THREE.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; m.userData.rashi = i; zodiac.add(m); sectors.push(m);
    // spoke line
    const a = i * 30 * D2R;
    const pts = [new THREE.Vector3(Math.cos(a) * ZOD_IN, 0, -Math.sin(a) * ZOD_IN), new THREE.Vector3(Math.cos(a) * (ZOD_OUT + 1.4), 0, -Math.sin(a) * (ZOD_OUT + 1.4))];
    zodiac.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), orbitMat(0xffd27a, 0.35)));
  }
  for (const r of [ZOD_IN, ZOD_OUT]) { const l = new THREE.LineLoop(circle(1), orbitMat(0xffd27a, 0.5)); l.scale.setScalar(r); zodiac.add(l); }
  let rashiLabels = [];
  function buildLabels() {
    rashiLabels.forEach((s) => { zodiac.remove(s); s.material.map.dispose(); s.material.dispose(); });
    rashiLabels = RASHI.map((r, i) => {
      const s = labelSprite([L([r.n[0], r.n[1]])], { glyph: r.sym, glyphColor: '#' + ELEM_COL[r.el].toString(16).padStart(6, '0') });
      s.position.copy(posFromLon(i * 30 + 15, ZOD_OUT + 6.5)); zodiac.add(s); return s;
    });
  }
  buildLabels();

  // stars
  {
    const n = small ? 700 : 1600, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = Math.random() * 2 - 1, th = Math.random() * 6.283, r = 260 + Math.random() * 120, s = Math.sqrt(1 - u * u);
      pos.set([r * s * Math.cos(th), r * u, r * s * Math.sin(th)], i * 3);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const stars = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xcfd8ff, size: 1.4, sizeAttenuation: false, transparent: true, opacity: 0.8 }));
    scene.add(stars); bodies._stars = stars;
  }

  // ---------- state ----------
  const state = { mode: 0, modeTarget: 0, speed: 3, paused: false, simMs: Date.now(), hoverId: null, hoverRashi: null, lastInfoMs: 0 };

  function update(dt) {
    if (!state.paused) state.simMs += dt * state.speed * 86400000;
    const date = new Date(state.simMs);
    state.mode += (state.modeTarget - state.mode) * Math.min(1, dt * 2.2);
    const m = state.mode, e = m * m * (3 - 2 * m);

    // longitudes
    const geo = {};
    for (const id of ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn']) geo[id] = siderealLon(id, date);
    geo.Rahu = rahuLon(date); geo.Ketu = norm(geo.Rahu + 180);
    const hel = {};
    for (const id of ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn']) hel[id] = helioLon(id, date);

    const P = {}; // positions
    const lerpV = (a, b) => a.clone().lerp(b, e);
    const zero = new THREE.Vector3();
    P.Earth = lerpV(zero, posFromLon(hel.Earth.lon, AU_R(hel.Earth.au)));
    P.Sun = lerpV(posFromLon(geo.Sun, R_GEO.Sun), zero);
    for (const id of ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']) P[id] = lerpV(posFromLon(geo[id], R_GEO[id]), posFromLon(hel[id].lon, AU_R(hel[id].au)));
    const moonR = 7 + (2.6 - 7) * e;
    P.Moon = P.Earth.clone().add(posFromLon(geo.Moon, moonR));
    P.Rahu = posFromLon(geo.Rahu, R_GEO.Rahu); P.Ketu = posFromLon(geo.Ketu, R_GEO.Ketu);

    for (const id of Object.keys(P)) {
      const b = bodies[id]; b.grp.position.copy(P[id]); b.lon = geo[id] ?? norm(hel[id].lon + 180 - 0);
    }
    bodies.Earth.lon = norm(geo.Sun + 180);
    sunLight.position.copy(P.Sun);

    // orbit lines
    const setOrbit = (id, r, cx) => { const o = orbits[id]; o.scale.setScalar(Math.max(0.001, r)); o.position.copy(cx || zero); o.visible = r > 0.05; };
    for (const id of ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']) setOrbit(id, R_GEO[id] + (AU_R(hel[id].au) - R_GEO[id]) * e);
    setOrbit('Sun', R_GEO.Sun * (1 - e));
    setOrbit('Earth', AU_R(hel.Earth.au) * e);
    setOrbit('Moon', moonR, P.Earth);
    orbits.Sun.material.opacity = 0.28 * (1 - e);
    orbits.Earth.material.opacity = 0.34 * e;

    // zodiac + nodes fade in helio view
    zodiac.visible = e < 0.98;
    zodiac.scale.setScalar(1 + e * 0.5);
    for (const s of sectors) s.material.opacity = (state.hoverRashi === s.userData.rashi ? 0.42 : 0.13) * (1 - e);
    zodiac.children.forEach((c) => { if (c.isLine) c.material.opacity = (c.isLineLoop ? 0.5 : 0.35) * (1 - e); });
    rashiLabels.forEach((s) => { s.material.opacity = 1 - e; });
    for (const id of ['Rahu', 'Ketu']) bodies[id].grp.visible = e < 0.6;

    // spin + hover scale
    for (const id of Object.keys(bodies)) {
      const b = bodies[id]; if (!b.mesh) continue;
      b.mesh.rotation.y += dt * (id === 'Sun' ? 0.12 : id === 'Jupiter' ? 0.9 : id === 'Earth' ? 1.4 : 0.5);
      const target = state.hoverId === id ? 1.7 : 1;
      b.hover += (target - b.hover) * Math.min(1, dt * 9);
      const sunBoost = id === 'Sun' ? 1 + (e * 0.55) : 1;
      b.mesh.scale.setScalar(b.base * b.hover * sunBoost);
      if (b.halo) b.halo.material.opacity = (b.hover - 1) * 1.1;
      if (b.tag) b.tag.position.y = b.base * b.hover * sunBoost + 2.0;
      if (id === 'Saturn') ring.scale.setScalar(SIZE.Saturn);
    }
    const pulse = 1 + Math.sin(performance.now() * 0.0016) * 0.04;
    sun.glows.forEach((g) => { g.scale.setScalar(g.userData.base * pulse * (1 + e * 0.35)); });
    bodies._stars.rotation.y += dt * 0.004;

    if (performance.now() - state.lastInfoMs > 120) {
      state.lastInfoMs = performance.now();
      cb.onTime && cb.onTime(date);
      if (state.hoverId) cb.onHover && cb.onHover(infoOf(state.hoverId), state.px, state.py);
      else if (state.hoverRashi != null) cb.onHover && cb.onHover(rashiInfo(state.hoverRashi), state.px, state.py);
    }
  }

  function infoOf(id) {
    const b = bodies[id]; const lon = b.lon;
    const pl = PLANETS[id];
    const r = rashiOf(lon);
    return {
      kind: 'graha', id,
      name: pl ? pl.n : ['Earth', 'पृथ्वी'], sym: pl ? pl.sym : '⊕', color: pl ? pl.color : '#6fc0ff',
      rashi: RASHI[r], deg: degInRashi(lon), nak: NAKSHATRA[nakshatraOf(lon)],
      helio: state.modeTarget === 1,
    };
  }
  function rashiInfo(i) {
    const inside = Object.values(bodies).filter((b) => b.id && PLANETS[b.id] && b.id !== 'Earth' && rashiOf(b.lon) === i).map((b) => b.id);
    return { kind: 'rashi', rashi: RASHI[i], index: i, planets: inside };
  }

  // ---------- interaction ----------
  const ray = new THREE.Raycaster(); const mouse = new THREE.Vector2();
  const pickables = () => Object.values(bodies).filter((b) => b.hit && b.grp.visible).map((b) => b.hit);
  function pick(ev) {
    const rc = renderer.domElement.getBoundingClientRect();
    mouse.set(((ev.clientX - rc.left) / rc.width) * 2 - 1, -((ev.clientY - rc.top) / rc.height) * 2 + 1);
    ray.setFromCamera(mouse, camera);
    state.px = ev.clientX; state.py = ev.clientY;
    const hits = ray.intersectObjects(pickables(), false);
    let id = null, rashi = null;
    if (hits.length) id = hits[0].object.userData.id;
    else if (state.mode < 0.4) {
      const h2 = ray.intersectObjects(sectors, false);
      if (h2.length) rashi = h2[0].object.userData.rashi;
    }
    if (id !== state.hoverId || rashi !== state.hoverRashi) {
      state.hoverId = id; state.hoverRashi = rashi;
      renderer.domElement.style.cursor = id || rashi != null ? 'pointer' : 'grab';
      controls.autoRotate = !(id || rashi != null);
      if (!id && rashi == null) cb.onHover && cb.onHover(null);
    }
  }
  renderer.domElement.addEventListener('pointermove', pick);
  renderer.domElement.addEventListener('pointerleave', () => { state.hoverId = null; state.hoverRashi = null; controls.autoRotate = true; cb.onHover && cb.onHover(null); });
  renderer.domElement.addEventListener('pointerdown', () => { renderer.domElement.style.cursor = 'grabbing'; });
  renderer.domElement.addEventListener('pointerup', () => { renderer.domElement.style.cursor = 'grab'; });

  // ---------- sizing & loop ----------
  const resize = () => {
    const w = container.clientWidth || 600, h = container.clientHeight || 500;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%';
    camera.aspect = w / h;
    const narrow = w < 640;
    camera.fov = narrow ? 58 : 42;
    const k = w / h < 1.4 ? 1.22 : 1.1;               // pull back a little on squarer screens
    camera.position.setLength(Math.hypot(52, 92) * k);
    if (w > 900) camera.setViewOffset(w, h, -w * 0.17, 0, w, h); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize); ro.observe(container); resize();

  let visible = true, raf = 0, last = performance.now();
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { threshold: 0 });
  io.observe(container);
  const loop = (now) => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!visible || document.hidden) return;
    update(dt);
    controls.update();
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(loop);

  return {
    setMode(helio) { state.modeTarget = helio ? 1 : 0; },
    setSpeed(d) { state.speed = d; },
    setPaused(p) { state.paused = p; },
    isPaused: () => state.paused,
    live() { state.simMs = Date.now(); state.speed = 1 / 86400; state.paused = false; },
    setDate(d) { state.simMs = d.getTime(); },
    getDate: () => new Date(state.simMs),
    refreshLabels() { buildLabels(); },
    dispose() {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); controls.dispose();
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { (o.material.map) && o.material.map.dispose(); o.material.dispose(); } });
      renderer.dispose(); renderer.domElement.remove();
    },
  };
}
