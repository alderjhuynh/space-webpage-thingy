const canvas = document.getElementById('scene');
const stageEl = document.getElementById('stage');
const panelContent = document.getElementById('panelContent');
const breadcrumbsEl = document.getElementById('breadcrumbs');
const searchInput = document.getElementById('searchInput');
const factionToggle = document.getElementById('factionToggle');
const infoPanel = document.getElementById('infoPanel');
const menuBtn = document.getElementById('menuBtn');
const galaxyBtn = document.getElementById('galaxyBtn');
const hintEl = document.getElementById('hint');
const galaxyHintEl = document.getElementById('galaxyHint');
const labelOverlay = document.getElementById('labelOverlay');
const loader = document.getElementById('loader');
const timelineWrap = document.getElementById('timelineWrap');
const timelineYearEl = document.getElementById('timelineYear');
const timeScrub = document.getElementById('timeScrub');
const timelineEventsEl = document.getElementById('timelineEvents');
let viewMode = 'system';
let currentSystemId = SYSTEMS[0].id;
let currentBlackHoleId = BLACK_HOLES[0].id;
let focusedKey = null;
let showFactions = true;
let searchQuery = '';
let timelineFilterYear = Infinity;
let paused = false;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
function resize() {
  const w = stageEl.clientWidth, h = stageEl.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
scene.add(new THREE.AmbientLight(0x2a2c44, 0.55));
const sunLight = new THREE.PointLight(0xfff1d6, 2.6, 0, 1.2);
scene.add(sunLight);
const fillLight = new THREE.DirectionalLight(0x8a8dc4, 0.35);
fillLight.position.set(-40, 30, -20);
scene.add(fillLight);
const blackHoleLight = new THREE.PointLight(0x9b81e8, 0.9, 120, 1.4);
blackHoleLight.position.set(0, 0, 0);
scene.add(blackHoleLight);
(function starfield() {
  const count = 2400;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 280 + Math.random() * 620;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi);
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.05, sizeAttenuation: true, transparent: true, opacity: 0.78 });
  scene.add(new THREE.Points(geo, mat));
})();
function makeGlowTexture() {
  const size = 256;
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,230,180,0.5)');
  g.addColorStop(1, 'rgba(255,230,180,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}
const glowTex = makeGlowTexture();
function makeBlackHoleHaloTexture() {
  const size = 256;
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(0.22, 'rgba(0,0,0,0)');
  g.addColorStop(0.32, 'rgba(120,90,255,0.22)');
  g.addColorStop(0.42, 'rgba(255,120,80,0.28)');
  g.addColorStop(0.62, 'rgba(90,40,160,0.12)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}
const blackHoleHaloTex = makeBlackHoleHaloTexture();
function makeAccretionDiskTexture(innerColor, outerColor) {
  const size = 512;
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  const cx = size / 2, cy = size / 2;
  const grad = ctx.createRadialGradient(cx, cy, size * 0.18, cx, cy, size * 0.5);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.32, innerColor);
  grad.addColorStop(0.48, outerColor);
  grad.addColorStop(0.72, 'rgba(30,10,60,0.95)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.arc(cx, cy, size * 0.5, 0, Math.PI * 2); ctx.fill();
  const rnd = mulberry32(hashSeed(innerColor + outerColor));
  for (let i = 0; i < 180; i++) {
    const ang = rnd() * Math.PI * 2;
    const rad = size * 0.28 + rnd() * size * 0.18;
    const x = cx + Math.cos(ang) * rad;
    const y = cy + Math.sin(ang) * rad;
    const r = 0.8 + rnd() * 2.2;
    ctx.fillStyle = `rgba(255,${180 + rnd() * 70},${90 + rnd() * 60},${0.10 + rnd() * 0.22})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}
function makePhotonRingTexture() {
  const size = 256;
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.38, size / 2, size / 2, size * 0.5);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(0.40, 'rgba(255,200,140,0.0)');
  g.addColorStop(0.52, 'rgba(255,200,140,0.95)');
  g.addColorStop(0.60, 'rgba(180,120,255,0.55)');
  g.addColorStop(0.70, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}
const photonRingTex = makePhotonRingTexture();
function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(a) {
  return function () {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function makePlanetTexture(hex, key) {
  const size = 512;
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d');
  const rnd = mulberry32(hashSeed(key));
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 220; i++) {
    const x = rnd() * size, y = rnd() * size;
    const rx = 12 + rnd() * 72, ry = 8 + rnd() * 34;
    const rot = rnd() * Math.PI;
    const alpha = 0.06 + rnd() * 0.14;
    const shade = rnd() > 0.5 ? 0 : 255;
    const v = shade === 0 ? 0 : 255;
    ctx.fillStyle = `rgba(${v},${v},${v},${alpha})`;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
    ctx.fill();
  }
  const isGiant = hex === '#45b8a4' || hex === '#4d8ceb' || hex === '#c2826a';
  if (isGiant) {
    for (let i = 0; i < 14; i++) {
      const y = (i / 14) * size + (rnd() - 0.5) * 18;
      const h = 9 + rnd() * 22;
      ctx.fillStyle = `rgba(${rnd() > 0.5 ? 255 : 0},${rnd() > 0.5 ? 255 : 0},${255},${0.07})`;
      ctx.fillRect(0, y, size, h);
    }
  }
  if (!isGiant) {
    for (let i = 0; i < 26; i++) {
      const x = rnd() * size, y = rnd() * size;
      const r = 6 + rnd() * 18;
      const grd = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
      grd.addColorStop(0, 'rgba(0,0,0,0.22)');
      grd.addColorStop(0.5, 'rgba(0,0,0,0.10)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x - r * 0.18, y - r * 0.18, r, 0, Math.PI * 2); ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}
function makeAtmosphereMaterial(colorHex) {
  const col = new THREE.Color(colorHex);
  return new THREE.ShaderMaterial({
    uniforms: { glowColor: { value: col }, viewVector: { value: new THREE.Vector3() }, c: { value: 0.55 }, p: { value: 3.2 } },
    vertexShader: `
      varying vec3 vNormal;
      void main(){
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      uniform float c;
      uniform float p;
      varying vec3 vNormal;
      void main(){
        float intensity = pow(c - dot(vNormal, vec3(0.0,0.0,1.0)), p);
        gl_FragColor = vec4(glowColor, intensity * 0.85);
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false
  });
}
