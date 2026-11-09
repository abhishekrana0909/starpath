// Full-page drifting smoke / nebula (WebGL fragment shader). Colour theme changes per section.
const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;
const FRAG = `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform float uScroll;
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC;
float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i+vec2(1,0)), c = hash(i+vec2(0,1)), d = hash(i+vec2(1,1));
  vec2 u = f*f*(3.-2.*f);
  return mix(a,b,u.x) + (c-a)*u.y*(1.-u.x) + (d-b)*u.x*u.y;
}
float fbm(vec2 p){
  float v = 0., a = .5;
  mat2 m = mat2(1.6,1.2,-1.2,1.6);
  for(int i=0;i<5;i++){ v += a*noise(p); p = m*p; a *= .5; }
  return v;
}
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (uv - .5) * vec2(uRes.x/uRes.y, 1.) * 2.2;
  p.y += uScroll * .00035;
  float t = uTime * .045;
  vec2 md = (uMouse - uv) * vec2(uRes.x/uRes.y, 1.);
  float mdist = length(md);
  p += md * .12 * exp(-mdist*2.5);               // smoke leans toward the cursor
  vec2 q = vec2(fbm(p + vec2(0., t)), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p + 3.5*q + vec2(1.7, 9.2) + .5*t), fbm(p + 3.5*q + vec2(8.3, 2.8) + .4*t));
  float f = fbm(p + 3.2*r);
  vec3 col = vec3(.012, .016, .045);
  col = mix(col, uA, clamp(f*f*3.4, 0., 1.));
  col = mix(col, uB, clamp(length(q)*.85, 0., 1.) * .55);
  col = mix(col, uC, clamp(r.x*r.x*1.6, 0., 1.) * .30);
  col += uC * .16 * exp(-mdist*mdist*9.);        // soft glow around the cursor
  float vig = smoothstep(1.25, .25, length(uv-.5));
  col *= .38 + .62*vig;
  gl_FragColor = vec4(col, 1.);
}`;

export const THEMES = {
  hero:   { a: [0.17, 0.09, 0.46], b: [0.04, 0.17, 0.42], c: [0.50, 0.30, 0.95] },
  gold:   { a: [0.42, 0.22, 0.04], b: [0.34, 0.09, 0.16], c: [0.98, 0.66, 0.16] },
  teal:   { a: [0.02, 0.30, 0.31], b: [0.05, 0.14, 0.40], c: [0.10, 0.90, 0.76] },
  rose:   { a: [0.40, 0.05, 0.30], b: [0.20, 0.05, 0.42], c: [1.00, 0.30, 0.62] },
  blue:   { a: [0.05, 0.13, 0.42], b: [0.10, 0.05, 0.30], c: [0.30, 0.62, 1.00] },
  green:  { a: [0.04, 0.28, 0.16], b: [0.04, 0.12, 0.30], c: [0.35, 0.95, 0.55] },
};

export function initBackground(canvas) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = Math.min(innerWidth, innerHeight) < 700;
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) { canvas.style.background = 'radial-gradient(circle at 30% 20%, #1a1040, #05060f 70%)'; return { setTheme() {}, setMouse() {} }; }

  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {};
  for (const n of ['uRes', 'uTime', 'uMouse', 'uScroll', 'uA', 'uB', 'uC']) U[n] = gl.getUniformLocation(prog, n);

  const scale = small ? 0.28 : 0.42; // render low-res; smoke is soft so it upscales cleanly
  const resize = () => {
    canvas.width = Math.max(2, Math.floor(innerWidth * scale));
    canvas.height = Math.max(2, Math.floor(innerHeight * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();
  addEventListener('resize', resize);

  const cur = { a: [...THEMES.hero.a], b: [...THEMES.hero.b], c: [...THEMES.hero.c] };
  let target = THEMES.hero;
  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  addEventListener('pointermove', (e) => { mouse.tx = e.clientX / innerWidth; mouse.ty = 1 - e.clientY / innerHeight; }, { passive: true });

  let last = performance.now(), time = Math.random() * 100;
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    time += dt * (reduce ? 0.25 : 1);
    const k = 1 - Math.pow(0.12, dt); // ease toward target theme
    for (const key of ['a', 'b', 'c']) for (let i = 0; i < 3; i++) cur[key][i] += (target[key][i] - cur[key][i]) * k * 0.9;
    mouse.x += (mouse.tx - mouse.x) * 0.05; mouse.y += (mouse.ty - mouse.y) * 0.05;
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform1f(U.uTime, time);
    gl.uniform2f(U.uMouse, mouse.x, mouse.y);
    gl.uniform1f(U.uScroll, scrollY);
    gl.uniform3fv(U.uA, cur.a); gl.uniform3fv(U.uB, cur.b); gl.uniform3fv(U.uC, cur.c);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  return { setTheme(name) { target = THEMES[name] || THEMES.hero; } };
}
