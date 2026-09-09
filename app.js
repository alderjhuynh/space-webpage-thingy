const LORE = {
  star: {
    key: 'star', name: 'Star Name', type: 'dying ahh mf', colorHex: '#f2b25c', color: 0xf2b25c,
    description: [
      "this is an example description"
    ],
    stats: [ ['stat1', 'stat1 desc'], ['stat2', 'stat2 desc'], ['stat3', 'stat3 desc'] ]
  },
  planet1: {
    key: 'planet1', name: 'planet 1', type: 'boring planet', colorHex: '#5d7ce0', color: 0x5d7ce0,
    orbitRadius: 16, orbitSpeed: 0.34, spinSpeed: 0.6, tilt: 0.12, size: 1.35,
    description: [
      "this is an example descirptino"
    ],
    stats: [ ['stat1', 'stat1 desc'] ]
  },
  planet2: {
    key: 'planet2', name: 'planet 2', type: 'planet with moon', colorHex: '#d1453a', color: 0xd1453a,
    orbitRadius: 27, orbitSpeed: 0.19, spinSpeed: 0.9, tilt: -0.09, size: 1.9,
    moon: { colorHex:'#9b968f', color: 0x9b968f, size: 0.4, dist: 3.4, speed: 1.4 },
    description: [
      "this is an example description"
    ],
    stats: [ ['stat1', 'look at him he has a little moon'] ]
  },
  planet3: {
    key: 'planet3', name: 'planet 3', type: 'planet with ring', colorHex: '#45b8a4', color: 0x45b8a4,
    orbitRadius: 40, orbitSpeed: 0.1, spinSpeed: 0.4, tilt: 0.2, size: 3.0, ring: true,
    description: [
      "this is an example description"
    ],
    stats: [ ['stat1', 'pretty ring :3'] ]
  }
};
const ORDER = ['star','planet1','planet2','planet3'];

// this is a divider

const canvas = document.getElementById('scene');
const stageEl = document.getElementById('stage');
const infoPanel = document.getElementById('infoPanel');
const menuBtn = document.getElementById('menuBtn');
const hintEl = document.getElementById('hint');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

function resize(){
  const w = stageEl.clientWidth, h = stageEl.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

scene.add(new THREE.AmbientLight(0x2a2c44, 1.1));
const sunLight = new THREE.PointLight(0xfff1d6, 2.4, 0, 0.15);
scene.add(sunLight);

(function starfield(){
  const count = 1800;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++){
    const r = 260 + Math.random() * 500;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    positions[i*3+1] = r * Math.cos(phi);
    positions[i*3+2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color:0xffffff, size:1.1, sizeAttenuation:true, transparent:true, opacity:0.8 });
  scene.add(new THREE.Points(geo, mat));
})();

function makeGlowTexture(){
  const size = 256;
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,230,180,0.5)');
  g.addColorStop(1, 'rgba(255,230,180,0)');
  ctx.fillStyle = g; ctx.fillRect(0,0,size,size);
  return new THREE.CanvasTexture(c);
}
const glowTex = makeGlowTexture();

const bodies = {};

(function(){
  const d = LORE.star;
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(4.2, 48, 48),
    new THREE.MeshBasicMaterial({ color: d.color })
  );
  scene.add(mesh);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex, color: d.color, transparent:true, blending: THREE.AdditiveBlending, depthWrite:false
  }));
  glow.scale.set(26, 26, 1);
  scene.add(glow);
  bodies.star = { key:'star', isStar:true, mesh, glow, orbitLine:null, group:null, angle:0, spin: 0.05 };
})();

ORDER.filter(k => k !== 'star').forEach(key => {
  const d = LORE[key];
  const group = new THREE.Group();
  group.rotation.x = d.tilt || 0;
  scene.add(group);

  const segs = 128;
  const pts = [];
  for (let i = 0; i <= segs; i++){
    const a = (i / segs) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * d.orbitRadius, 0, Math.sin(a) * d.orbitRadius));
  }
  const orbitGeo = new THREE.BufferGeometry().setFromPoints(pts);
  const orbitLine = new THREE.Line(orbitGeo, new THREE.LineBasicMaterial({ color: 0x8a89a3, transparent:true, opacity:0.35 }));
  group.add(orbitLine);

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(d.size, 40, 40),
    new THREE.MeshStandardMaterial({ color: d.color, roughness:0.65, metalness:0.08 })
  );
  group.add(mesh);

  let ring = null;
  if (d.ring){
    ring = new THREE.Mesh(
      new THREE.RingGeometry(d.size * 1.5, d.size * 2.3, 64),
      new THREE.MeshBasicMaterial({ color: d.color, transparent:true, opacity:0.35, side: THREE.DoubleSide })
    );
    ring.rotation.x = Math.PI / 2.3;
    mesh.add(ring);
  }

  let moon = null;
  if (d.moon){
    const m = d.moon;
    const moonMesh = new THREE.Mesh(
      new THREE.SphereGeometry(m.size, 20, 20),
      new THREE.MeshStandardMaterial({ color: m.color, roughness:0.8 })
    );
    group.add(moonMesh);
    moon = { mesh: moonMesh, angle: Math.random() * Math.PI * 2, speed: m.speed, dist: m.dist };
  }

  bodies[key] = {
    key, isStar:false, mesh, group, orbitLine,
    angle: Math.random() * Math.PI * 2,
    orbitRadius: d.orbitRadius, orbitSpeed: d.orbitSpeed, spin: d.spinSpeed,
    moon
  };
});

let camTheta = 0.9, camPhi = 1.15;
let camRadius = 95, camRadiusGoal = 95;
const camTarget = new THREE.Vector3(0,0,0);
const camTargetGoal = new THREE.Vector3(0,0,0);

function updateCamera(alpha){
  camRadius += (camRadiusGoal - camRadius) * alpha;
  camTarget.lerp(camTargetGoal, alpha);
  const x = camRadius * Math.sin(camPhi) * Math.cos(camTheta);
  const y = camRadius * Math.cos(camPhi);
  const z = camRadius * Math.sin(camPhi) * Math.sin(camTheta);
  camera.position.set(camTarget.x + x, camTarget.y + y, camTarget.z + z);
  camera.lookAt(camTarget);
}

let dragging = false, moved = false, lastX = 0, lastY = 0;

canvas.addEventListener('pointerdown', e => {
  dragging = true; moved = false; lastX = e.clientX; lastY = e.clientY;
  canvas.classList.add('dragging');
});
window.addEventListener('pointermove', e => {
  if (!dragging) return;
  const dx = e.clientX - lastX, dy = e.clientY - lastY;
  if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
  camTheta -= dx * 0.006;
  camPhi = Math.min(Math.PI - 0.2, Math.max(0.2, camPhi - dy * 0.006));
  lastX = e.clientX; lastY = e.clientY;
});
window.addEventListener('pointerup', e => {
  if (dragging && !moved) handleClick(e);
  dragging = false;
  canvas.classList.remove('dragging');
});
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  camRadiusGoal = Math.min(240, Math.max(6, camRadiusGoal + e.deltaY * 0.05));
  camRadius = camRadiusGoal;
}, { passive:false });

const raycaster = new THREE.Raycaster();
const mouseNDC = new THREE.Vector2();

function handleClick(e){
  const rect = canvas.getBoundingClientRect();
  mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouseNDC, camera);

  const targets = [];
  ORDER.forEach(key => { if (bodies[key].mesh.visible) targets.push(bodies[key].mesh); });
  const hits = raycaster.intersectObjects(targets, false);
  if (hits.length) {
    const hit = hits[0].object;
    const key = ORDER.find(k => bodies[k].mesh === hit);
    if (key) selectBody(key);
  }
}
let focusedKey = null;
let paused = false;

function selectBody(key){
  focusedKey = key;
  paused = true;
  ORDER.forEach(k => {
    const b = bodies[k];
    b.mesh.visible = (k === key);
    if (b.glow) b.glow.visible = (k === key);
    if (b.orbitLine) b.orbitLine.visible = false;
    if (b.moon) b.moon.mesh.visible = (k === key);
  });
  const b = bodies[key];
  const worldPos = new THREE.Vector3();
  b.mesh.getWorldPosition(worldPos);
  camTargetGoal.copy(worldPos);
  const size = b.isStar ? 4.2 : (LORE[key].size || 1.5);
  camRadiusGoal = size * 7 + 5;
  renderPanel();
  hintEl.style.opacity = '0';
}

function clearFocus(){
  focusedKey = null;
  paused = false;
  ORDER.forEach(k => {
    const b = bodies[k];
    b.mesh.visible = true;
    if (b.glow) b.glow.visible = true;
    if (b.orbitLine) b.orbitLine.visible = true;
    if (b.moon) b.moon.mesh.visible = true;
  });
  camTargetGoal.set(0,0,0);
  camRadiusGoal = 95;
  renderPanel();
  hintEl.style.opacity = '0.8';
}

function renderPanel(){
  if (!focusedKey){
    let listItems = ORDER.map(key => {
      const d = LORE[key];
      return `<li><button data-key="${key}">
        <span class="eyebrow-swatch" style="background:${d.colorHex}"></span>
        <span>
          <span class="b-name serif">${d.name}</span>
          <span class="b-type">${d.type}</span>
        </span>
      </button></li>`;
    }).join('');

    infoPanel.innerHTML = `
      <h1 class="title serif">Some Star System</h1>
      <p class="lede">bottom text (dunno what to put here)</p>
      <ul class="body-list">${listItems}</ul>
    `;
    infoPanel.querySelectorAll('button[data-key]').forEach(btn => {
      btn.addEventListener('click', () => selectBody(btn.getAttribute('data-key')));
    });
  } else {
    const d = LORE[focusedKey];
    const paragraphs = d.description.map(p => `<p>${p}</p>`).join('');
    const stats = (d.stats || []).map(([k,v]) => `<div class="stat-row"><span class="k">${k}</span><span class="v">${v}</span></div>`).join('');
    infoPanel.innerHTML = `
      <button class="back-link" id="backBtn">< All bodies</button>
      <h1 class="title serif">${d.name}</h1>
      <span class="tag">${d.type}</span>
      <div class="lore">${paragraphs}</div>
      <div class="stats">${stats}</div>
    `;
    document.getElementById('backBtn').addEventListener('click', clearFocus);
  }
}
renderPanel();

menuBtn.addEventListener('click', () => infoPanel.classList.toggle('open'));

const clock = new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  bodies.star.mesh.rotation.y += bodies.star.spin * dt;

  ORDER.filter(k => k !== 'star').forEach(key => {
    const b = bodies[key];
    if (!paused){
      b.angle += b.orbitSpeed * dt;
    }
    b.mesh.position.set(Math.cos(b.angle) * b.orbitRadius, 0, Math.sin(b.angle) * b.orbitRadius);
    b.mesh.rotation.y += b.spin * dt;
    if (b.moon){
      if (!paused) b.moon.angle += b.moon.speed * dt;
      b.moon.mesh.position.set(
        b.mesh.position.x + Math.cos(b.moon.angle) * b.moon.dist,
        0,
        b.mesh.position.z + Math.sin(b.moon.angle) * b.moon.dist
      );
    }
  });

  updateCamera(Math.min(1, dt * 4));
  renderer.render(scene, camera);
}

resize();
animate();
