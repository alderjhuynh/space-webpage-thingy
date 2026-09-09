(() => {
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
  const galaxyGroup = new THREE.Group();
  const systemGroup = new THREE.Group();
  const tradeGroup = new THREE.Group();
  const blackHoleGroup = new THREE.Group();
  scene.add(galaxyGroup);
  scene.add(systemGroup);
  scene.add(tradeGroup);
  scene.add(blackHoleGroup);
  const activeBodies = {};
  let starObjs = [];
  let asteroidMeshes = [];
  let cometObj = null;
  let galaxyStars = [];
  let galaxyBlackHoles = [];
  let activeBlackHole = null;
  const labelEls = {};
  function clearSystemVisuals() {
    while (systemGroup.children.length) systemGroup.remove(systemGroup.children[0]);
    while (tradeGroup.children.length) tradeGroup.remove(tradeGroup.children[0]);
    asteroidMeshes = [];
    cometObj = null;
    starObjs = [];
    Object.keys(activeBodies).forEach(k => delete activeBodies[k]);
    labelOverlay.innerHTML = '';
    Object.keys(labelEls).forEach(k => delete labelEls[k]);
  }
  function clearBlackHoleVisuals() {
    while (blackHoleGroup.children.length) blackHoleGroup.remove(blackHoleGroup.children[0]);
    activeBlackHole = null;
    labelOverlay.innerHTML = '';
    Object.keys(labelEls).forEach(k => delete labelEls[k]);
  }
  function clearAllVisuals() {
    clearSystemVisuals();
    clearBlackHoleVisuals();
  }
  function createLabel(key, name, colorHex) {
    const div = document.createElement('div');
    div.className = 'label';
    div.innerHTML = `<span class="dot" style="background:${colorHex}"></span>${name}`;
    labelOverlay.appendChild(div);
    labelEls[key] = div;
    return div;
  }
  function getSystemStars(system) {
    return system.stars || (system.star ? [system.star] : []);
  }
  function getPrimaryStar(system) {
    return getSystemStars(system)[0];
  }
  function buildSystemVisuals(system) {
    clearAllVisuals();
    blackHoleGroup.visible = false;
    systemGroup.visible = true;
    tradeGroup.visible = showFactions;
    blackHoleLight.visible = false;
    paused = false;
    focusedKey = null;
    const starsArr = getSystemStars(system);
    const isBinary = starsArr.length > 1;
    sunLight.visible = !isBinary;
    starsArr.forEach((dStar, i) => {
      const size = dStar.size || (isBinary ? 3.1 : 4.3);
      const starMat = new THREE.MeshBasicMaterial({ color: dStar.color });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 48, 48), starMat);
      systemGroup.add(mesh);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTex, color: dStar.color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false
      }));
      const glowScale = size * 6;
      glow.scale.set(glowScale, glowScale, 1);
      systemGroup.add(glow);
      const orbitRadius = dStar.orbitRadius || 0;
      const angle = dStar.orbitPhase != null ? dStar.orbitPhase : i * Math.PI;
      let light;
      if (isBinary) {
        light = new THREE.PointLight(new THREE.Color(dStar.color), dStar.lightIntensity || 2.2, 0, 1.2);
        systemGroup.add(light);
      } else {
        light = sunLight;
        light.color = new THREE.Color(dStar.color);
      }
      const x = Math.cos(angle) * orbitRadius;
      const z = Math.sin(angle) * orbitRadius;
      mesh.position.set(x, 0, z);
      glow.position.set(x, 0, z);
      light.position.set(x, 0, z);
      if (orbitRadius > 0) {
        const segs = 96;
        const pts = [];
        for (let s = 0; s <= segs; s++) {
          const a = (s / segs) * Math.PI * 2;
          pts.push(new THREE.Vector3(Math.cos(a) * orbitRadius, 0, Math.sin(a) * orbitRadius));
        }
        const orbitGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const orbitMat = new THREE.LineBasicMaterial({ color: 0x8a89a3, transparent: true, opacity: 0.2 });
        systemGroup.add(new THREE.Line(orbitGeo, orbitMat));
      }
      activeBodies[dStar.key] = {
        key: dStar.key, isStar: true, mesh, glow, light, angle,
        orbitRadius, orbitSpeed: dStar.orbitSpeed || 0, spin: 0.05, data: dStar
      };
      createLabel(dStar.key, dStar.name, dStar.colorHex);
      starObjs.push(activeBodies[dStar.key]);
    });
    system.bodies.forEach(body => {
      const orbitGroup = new THREE.Group();
      systemGroup.add(orbitGroup);
      const segs = 128;
      const pts = [];
      for (let i = 0; i <= segs; i++) {
        const a = (i / segs) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * body.orbitRadius, 0, Math.sin(a) * body.orbitRadius));
      }
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const orbitMat = new THREE.LineBasicMaterial({ color: 0x8a89a3, transparent: true, opacity: showFactions && body.faction ? 0.35 : 0.28 });
      if (showFactions && body.faction) {
        const fac = system.factions.find(f => f.id === body.faction || f.id === (body.faction === 'contested' ? null : body.faction));
      }
      const orbitLine = new THREE.Line(orbitGeo, orbitMat);
      orbitGroup.add(orbitLine);
      const axialGroup = new THREE.Group();
      orbitGroup.add(axialGroup);
      const tex = makePlanetTexture(body.colorHex, body.key);
      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.72,
        metalness: 0.03,
        color: 0xffffff
      });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(body.size, 40, 40), mat);
      const tilt = body.tilt || 0;
      axialGroup.rotation.z = tilt;
      axialGroup.rotation.x = tilt * 0.35;
      axialGroup.add(mesh);
      let atmMesh = null;
      if (body.hasAtmosphere) {
        const atmMat = makeAtmosphereMaterial(body.atmosphereColor || body.colorHex);
        atmMesh = new THREE.Mesh(new THREE.SphereGeometry(body.size * 1.085, 32, 32), atmMat);
        mesh.add(atmMesh);
      }
      let ring = null;
      if (body.ring) {
        ring = new THREE.Mesh(
          new THREE.RingGeometry(body.size * 1.48, body.size * 2.28, 64),
          new THREE.MeshBasicMaterial({ color: body.color, transparent: true, opacity: 0.34, side: THREE.DoubleSide })
        );
        ring.rotation.x = Math.PI / 2.35;
        mesh.add(ring);
      }
      const moonDescs = [];
      if (body.moon) moonDescs.push(body.moon);
      if (body.moons) moonDescs.push(...body.moons);
      const moonObjs = moonDescs.map(m => {
        const moonTex = makePlanetTexture(m.colorHex, m.key);
        const moonMesh = new THREE.Mesh(
          new THREE.SphereGeometry(m.size, 20, 20),
          new THREE.MeshStandardMaterial({ map: moonTex, roughness: 0.85, color: 0xffffff })
        );
        orbitGroup.add(moonMesh);
        createLabel(m.key, m.name, m.colorHex);
        return { key: m.key, mesh: moonMesh, angle: Math.random() * Math.PI * 2, speed: m.speed, dist: m.dist };
      });
      activeBodies[body.key] = {
        key: body.key,
        isStar: false,
        mesh, atmMesh, axialGroup, orbitGroup, orbitLine,
        angle: Math.random() * Math.PI * 2,
        orbitRadius: body.orbitRadius, orbitSpeed: body.orbitSpeed, spin: body.spinSpeed,
        moons: moonObjs,
        ring,
        data: body
      };
      createLabel(body.key, body.name, body.colorHex);
    });
    (system.asteroidBelts || []).forEach(belt => {
      const count = belt.count || 280;
      const geo = new THREE.DodecahedronGeometry(0.22, 0);
      const mat = new THREE.MeshStandardMaterial({ color: belt.color || 0x8a7a65, roughness: 0.9 });
      const inst = new THREE.InstancedMesh(geo, mat, count);
      inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      const dummy = new THREE.Object3D();
      for (let i = 0; i < count; i++) {
        const r = belt.inner + Math.random() * (belt.outer - belt.inner);
        const a = Math.random() * Math.PI * 2;
        const y = (Math.random() - 0.5) * belt.tiltJitter * r;
        const s = 0.45 + Math.random() * 1.1;
        dummy.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
        dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        inst.setMatrixAt(i, dummy.matrix);
      }
      inst.instanceMatrix.needsUpdate = true;
      systemGroup.add(inst);
      asteroidMeshes.push({ mesh: inst, baseCount: count });
    });
    if (system.comet) {
      const c = system.comet;
      const cometMesh = new THREE.Mesh(
        new THREE.SphereGeometry(c.size, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: new THREE.Color(c.colorHex), emissiveIntensity: 0.55 })
      );
      const tailGeo = new THREE.ConeGeometry(c.size * 2.2, c.size * 9, 16, 1, true);
      const tailMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(c.tailColor), transparent: true, opacity: 0.28, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
      const tail = new THREE.Mesh(tailGeo, tailMat);
      tail.rotation.x = -Math.PI / 2;
      tail.position.z = c.size * 4.5;
      cometMesh.add(tail);
      const tailPointsCount = 42;
      const tailPos = new Float32Array(tailPointsCount * 3);
      for (let i = 0; i < tailPointsCount; i++) {
        tailPos[i * 3] = (Math.random() - 0.5) * c.size * 1.6;
        tailPos[i * 3 + 1] = (Math.random() - 0.5) * c.size * 1.6;
        tailPos[i * 3 + 2] = -i * 0.22 - Math.random() * 0.5;
      }
      const tpGeo = new THREE.BufferGeometry();
      tpGeo.setAttribute('position', new THREE.BufferAttribute(tailPos, 3));
      const tpMat = new THREE.PointsMaterial({ color: new THREE.Color(c.tailColor), size: 0.52, transparent: true, opacity: 0.55, sizeAttenuation: true });
      const tailPoints = new THREE.Points(tpGeo, tpMat);
      cometMesh.add(tailPoints);
      systemGroup.add(cometMesh);
      createLabel(c.key, c.name, c.colorHex);
      cometObj = {
        key: c.key,
        mesh: cometMesh, tail, tailPoints,
        angle: Math.random() * Math.PI * 2,
        speed: c.periodSpeed,
        a: c.orbitRadius, e: c.eccentricity, tilt: c.tilt
      };
    }
    buildTradeRoutes(system);
    camTargetGoal.set(0, 0, 0);
    camRadiusGoal = 92;
    camTarget.set(0, 0, 0);
    camRadius = 95;
    updateBreadcrumbs();
    renderPanel();
    updateLabelsVisibility();
  }
  function hexToRgba(hex, alpha) {
    const c = new THREE.Color(hex);
    return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${alpha})`;
  }
  function buildBlackHoleVisuals(entry) {
    clearAllVisuals();
    systemGroup.visible = false;
    tradeGroup.visible = false;
    blackHoleGroup.visible = true;
    blackHoleLight.visible = true;
    sunLight.visible = false;
    blackHoleLight.color = new THREE.Color(entry.glowColorHex || entry.blackHole.diskColorHex || '#9b81e8');
    paused = false;
    focusedKey = entry.blackHole.key;
    currentBlackHoleId = entry.id;
    const bh = entry.blackHole;
    const diskConf = entry.disk || { inner: 4.8, outer: 9.2, tilt: 0.55, rotationSpeed: 0.52 };
    const group = new THREE.Group();
    blackHoleGroup.add(group);
    const coreGeo = new THREE.SphereGeometry(2.9, 48, 48);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x020208 });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);
    const haloSpr = new THREE.Sprite(new THREE.SpriteMaterial({ map: blackHoleHaloTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.95 }));
    haloSpr.scale.set(28, 28, 1);
    group.add(haloSpr);
    const photonGeo = new THREE.RingGeometry(3.05, 3.65, 64);
    const photonMat = new THREE.MeshBasicMaterial({ map: photonRingTex, transparent: true, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.95 });
    const photonRing = new THREE.Mesh(photonGeo, photonMat);
    photonRing.rotation.x = Math.PI / 2;
    group.add(photonRing);
    const innerR = diskConf.inner;
    const outerR = diskConf.outer;
    const diskTex = makeAccretionDiskTexture(hexToRgba(entry.diskColorHex || '#ff6a3d', 1), hexToRgba(entry.outerDiskColorHex || '#6a3fb8', 1));
    const diskGeo = new THREE.RingGeometry(innerR, outerR, 96, 2);
    const diskMat = new THREE.MeshBasicMaterial({ map: diskTex, transparent: true, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.92 });
    const diskMesh = new THREE.Mesh(diskGeo, diskMat);
    diskMesh.rotation.x = Math.PI / 2 + diskConf.tilt;
    group.add(diskMesh);
    const backDisk = new THREE.Mesh(diskGeo.clone(), diskMat.clone());
    backDisk.rotation.x = Math.PI / 2 + diskConf.tilt;
    backDisk.rotation.y = Math.PI;
    backDisk.material.opacity = 0.32;
    group.add(backDisk);
    const jetGeo = new THREE.ConeGeometry(0.55, 8, 16, 1, true);
    const jetMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(entry.glowColorHex || '#9b81e8'), transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const jetUp = new THREE.Mesh(jetGeo, jetMat);
    jetUp.position.y = 5.2;
    group.add(jetUp);
    const jetDown = new THREE.Mesh(jetGeo, jetMat.clone());
    jetDown.position.y = -5.2;
    jetDown.rotation.x = Math.PI;
    jetDown.material.opacity = 0.12;
    group.add(jetDown);
    const lensedMeshes = [];
    (entry.lensingStars || []).forEach(ls => {
      const lm = new THREE.Mesh(new THREE.SphereGeometry(ls.size, 12, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(ls.colorHex) }));
      lm.position.set(ls.offset.x, ls.offset.y, ls.offset.z);
      const lsGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: new THREE.Color(ls.colorHex), transparent: true, blending: THREE.AdditiveBlending, opacity: 0.65, depthWrite: false }));
      lsGlow.scale.set(ls.size * 14, ls.size * 14, 1);
      lsGlow.position.copy(lm.position);
      group.add(lm);
      group.add(lsGlow);
      lensedMeshes.push({ mesh: lm, glow: lsGlow, basePos: new THREE.Vector3().copy(lm.position) });
      createLabel(ls.key, 'Lensed star', ls.colorHex);
    });
    activeBodies[bh.key] = { key: bh.key, isBlackHole: true, mesh: coreMesh, glow: haloSpr, angle: 0, spin: 0.02 };
    createLabel(bh.key, bh.name, entry.glowColorHex || '#9b81e8');
    activeBlackHole = { entry, group, coreMesh, haloSpr, photonRing, diskMesh, backDisk, jetUp, jetDown, lensedMeshes, tilt: diskConf.tilt, rotationSpeed: diskConf.rotationSpeed || 0.45 };
    camTargetGoal.set(0, 0, 0);
    camTarget.set(0, 0, 0);
    camRadiusGoal = 22;
    camRadius = 28;
    updateBreadcrumbs();
    renderPanel();
    updateLabelsVisibility();
  }
  function buildTradeRoutes(system) {
    while (tradeGroup.children.length) tradeGroup.remove(tradeGroup.children[0]);
    if (!showFactions || !system.tradeRoutes) return;
    system.tradeRoutes.forEach(route => {
      const fromEntry = BODY_LOOKUP[route.from];
      const toEntry = BODY_LOOKUP[route.to];
      if (!fromEntry || !toEntry) return;
      if (fromEntry.system.id !== system.id || toEntry.system.id !== system.id) return;
      function posForKey(key){
        const ab = activeBodies[key];
        if (ab) {
          const a = ab.angle || 0;
          const r = ab.orbitRadius || 0;
          return new THREE.Vector3(Math.cos(a)*r, 0, Math.sin(a)*r);
        }
        const d = BODY_LOOKUP[key].data;
        const r = d.orbitRadius || 0;
        return new THREE.Vector3(r, 0, 0);
      }
      const p1 = posForKey(route.from);
      const p2 = posForKey(route.to);
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const dist = p1.distanceTo(p2);
      mid.y += Math.min(9, dist * 0.28) + 3;
      const curve = new THREE.CatmullRomCurve3([p1.clone(), mid, p2.clone()]);
      const pts = curve.getPoints(48);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const fac = system.factions.find(f => f.id === route.faction);
      const col = fac ? fac.colorHex : '#8a89a3';
      const mat = new THREE.LineDashedMaterial({ color: new THREE.Color(col), transparent: true, opacity: 0.55, dashSize: 1.2, gapSize: 1.0, linewidth: 1 });
      const line = new THREE.Line(geo, mat);
      line.computeLineDistances();
      tradeGroup.add(line);
      const canvasLbl = document.createElement('canvas'); canvasLbl.width = 256; canvasLbl.height = 64;
      const ctx = canvasLbl.getContext('2d');
      ctx.fillStyle = 'rgba(12,13,24,0.0)'; ctx.fillRect(0,0,256,64);
      ctx.fillStyle = col; ctx.font = '12px Inter'; ctx.textAlign='center'; ctx.fillText(route.label,128,22);
      const tex = new THREE.CanvasTexture(canvasLbl);
      const sprMat = new THREE.SpriteMaterial({ map: tex, transparent:true, opacity:0.85 });
      const spr = new THREE.Sprite(sprMat);
      spr.position.copy(mid); spr.position.y += 1.2;
      spr.scale.set(14, 3.5, 1);
      tradeGroup.add(spr);
    });
  }
  function getBodyWorldPos(key) {
    const b = activeBodies[key];
    if (!b) return null;
    const v = new THREE.Vector3();
    if (b.isBlackHole) return v.set(0,0,0);
    b.mesh.getWorldPosition(v);
    return v;
  }
  function buildGalaxy() {
    while (galaxyGroup.children.length) galaxyGroup.remove(galaxyGroup.children[0]);
    galaxyStars = [];
    galaxyBlackHoles = [];
    SYSTEMS.forEach(sys => {
      const pos = new THREE.Vector3(sys.position.x, sys.position.y, sys.position.z);
      const stars = getSystemStars(sys);
      const isBinary = stars.length > 1;
      const geo = new THREE.SphereGeometry(isBinary ? 1.5 : 2.2, 24, 24);
      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: stars[0].color }));
      mesh.position.copy(pos);
      if (isBinary) mesh.position.x -= 1.1;
      mesh.userData = { systemId: sys.id, kind: 'system' };
      galaxyGroup.add(mesh);
      let mesh2 = null;
      if (isBinary) {
        mesh2 = new THREE.Mesh(geo.clone(), new THREE.MeshBasicMaterial({ color: stars[1].color }));
        mesh2.position.copy(pos);
        mesh2.position.x += 1.1;
        mesh2.userData = { systemId: sys.id, kind: 'system' };
        galaxyGroup.add(mesh2);
      }
      const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: stars[0].color, transparent:true, blending: THREE.AdditiveBlending, opacity:0.85, depthWrite:false }));
      spr.position.copy(pos);
      spr.scale.set(isBinary ? 20 : 16, isBinary ? 20 : 16, 1);
      galaxyGroup.add(spr);
      const canvas = document.createElement('canvas'); canvas.width=256; canvas.height=80;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle='rgba(0,0,0,0)'; ctx.fillRect(0,0,256,80);
      ctx.fillStyle='#eae8f5'; ctx.font='600 16px Spectral'; ctx.textAlign='center'; ctx.fillText(sys.name,128,30);
      ctx.fillStyle='#8a89a3'; ctx.font='11px Inter'; ctx.fillText(sys.bodies.length+' worlds',128,48);
      const tex = new THREE.CanvasTexture(canvas);
      const labelSpr = new THREE.Sprite(new THREE.SpriteMaterial({map:tex, transparent:true}));
      labelSpr.position.set(pos.x, pos.y+5.2, pos.z);
      labelSpr.scale.set(14,4.4,1);
      galaxyGroup.add(labelSpr);
      galaxyStars.push({ mesh, sprite: spr, label: labelSpr, systemId: sys.id, pos });
      if (isBinary) galaxyStars.push({ mesh: mesh2, sprite: spr, label: labelSpr, systemId: sys.id, pos });
    });
    BLACK_HOLES.forEach(bh => {
      const pos = new THREE.Vector3(bh.position.x, bh.position.y, bh.position.z);
      const coreGeo = new THREE.SphereGeometry(1.75, 20, 20);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0x050508 });
      const mesh = new THREE.Mesh(coreGeo, coreMat);
      mesh.position.copy(pos);
      mesh.userData = { blackHoleId: bh.id, kind: 'blackhole' };
      galaxyGroup.add(mesh);
      const ringGeo = new THREE.RingGeometry(2.15, 3.1, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(bh.diskColorHex || '#ff6a3d'), transparent: true, opacity: 0.62, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.rotation.x = Math.PI / 2.2;
      ring.rotation.y = 0.35;
      galaxyGroup.add(ring);
      const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: blackHoleHaloTex, transparent: true, blending: THREE.AdditiveBlending, opacity: 0.9, depthWrite: false }));
      spr.position.copy(pos);
      spr.scale.set(15, 15, 1);
      galaxyGroup.add(spr);
      const canvas = document.createElement('canvas'); canvas.width=300; canvas.height=80;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle='rgba(0,0,0,0)'; ctx.fillRect(0,0,300,80);
      ctx.fillStyle='#eae8f5'; ctx.font='600 15px Spectral'; ctx.textAlign='center'; ctx.fillText(bh.name,150,28);
      ctx.fillStyle='#8a89a3'; ctx.font='11px Inter'; ctx.fillText('Black hole',150,46);
      const tex = new THREE.CanvasTexture(canvas);
      const labelSpr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
      labelSpr.position.set(pos.x, pos.y + 5.6, pos.z);
      labelSpr.scale.set(15,4.2,1);
      galaxyGroup.add(labelSpr);
      galaxyBlackHoles.push({ mesh, ring, sprite: spr, label: labelSpr, blackHoleId: bh.id, pos });
    });
    if (SYSTEMS.length>1){
      const pts = SYSTEMS.map(s=> new THREE.Vector3(s.position.x, s.position.y, s.position.z));
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineDashedMaterial({ color:0x55567a, transparent:true, opacity:0.22, dashSize:2, gapSize:3 });
      const line = new THREE.Line(geo, mat); line.computeLineDistances();
      galaxyGroup.add(line);
    }
    if (BLACK_HOLES.length){
      BLACK_HOLES.forEach(bh => {
        const bhPos = new THREE.Vector3(bh.position.x, bh.position.y, bh.position.z);
        let nearest = null, nearestDist = Infinity;
        SYSTEMS.forEach(sys => {
          const sp = new THREE.Vector3(sys.position.x, sys.position.y, sys.position.z);
          const d = sp.distanceTo(bhPos);
          if (d < nearestDist) { nearestDist = d; nearest = sp; }
        });
        if (nearest) {
          const geo2 = new THREE.BufferGeometry().setFromPoints([bhPos, nearest]);
          const mat2 = new THREE.LineDashedMaterial({ color: 0x6a3fb8, transparent: true, opacity: 0.18, dashSize: 1.5, gapSize: 3.5 });
          const line2 = new THREE.Line(geo2, mat2); line2.computeLineDistances();
          galaxyGroup.add(line2);
        }
      });
    }
  }
  buildGalaxy();
  let camTheta = 0.9, camPhi = 1.15;
  let camRadius = 95, camRadiusGoal = 95;
  const camTarget = new THREE.Vector3(0,0,0);
  const camTargetGoal = new THREE.Vector3(0,0,0);
  function updateCamera(alpha){
    camRadius += (camRadiusGoal - camRadius) * Math.min(1, alpha*5);
    camTarget.lerp(camTargetGoal, Math.min(1, alpha*4));
    const x = camRadius * Math.sin(camPhi) * Math.cos(camTheta);
    const y = camRadius * Math.cos(camPhi);
    const z = camRadius * Math.sin(camPhi) * Math.sin(camTheta);
    camera.position.set(camTarget.x + x, camTarget.y + y, camTarget.z + z);
    camera.lookAt(camTarget);
    Object.values(activeBodies).forEach(b=>{
      if (b.atmMesh && b.atmMesh.material.uniforms) {
      }
    });
  }
  let dragging=false, moved=false, lastX=0, lastY=0;
  let pinchStartDist=0, pinchStartRadius=0;
  let activeTouchId=null;
  canvas.addEventListener('pointerdown', e=>{
    if (e.pointerType==='touch') return;
    dragging=true; moved=false; lastX=e.clientX; lastY=e.clientY;
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add('dragging');
  });
  window.addEventListener('pointermove', e=>{
    if (!dragging) return;
    if (e.pointerType==='touch') return;
    const dx=e.clientX-lastX, dy=e.clientY-lastY;
    if (Math.abs(dx)+Math.abs(dy)>3) moved=true;
    camTheta -= dx*0.006;
    camPhi = Math.min(Math.PI-0.2, Math.max(0.2, camPhi - dy*0.006));
    lastX=e.clientX; lastY=e.clientY;
  });
  window.addEventListener('pointerup', e=>{
    if (e.pointerType==='touch') return;
    if (dragging && !moved) handleClick(e);
    dragging=false;
    canvas.classList.remove('dragging');
  });
  canvas.addEventListener('wheel', e=>{
    e.preventDefault();
    camRadiusGoal = Math.min(250, Math.max(6, camRadiusGoal + e.deltaY*0.05));
  }, {passive:false});
  canvas.addEventListener('touchstart', e=>{
    if (e.touches.length===1){
      const t=e.touches[0]; dragging=true; moved=false; lastX=t.clientX; lastY=t.clientY;
    } else if (e.touches.length===2){
      dragging=false;
      const dx=e.touches[0].clientX - e.touches[1].clientX;
      const dy=e.touches[0].clientY - e.touches[1].clientY;
      pinchStartDist = Math.hypot(dx,dy);
      pinchStartRadius = camRadiusGoal;
    }
  }, {passive:false});
  canvas.addEventListener('touchmove', e=>{
    e.preventDefault();
    if (e.touches.length===1 && dragging){
      const t=e.touches[0]; const dx=t.clientX-lastX, dy=t.clientY-lastY;
      if (Math.abs(dx)+Math.abs(dy)>4) moved=true;
      camTheta -= dx*0.007;
      camPhi = Math.min(Math.PI-0.2, Math.max(0.2, camPhi - dy*0.007));
      lastX=t.clientX; lastY=t.clientY;
    } else if (e.touches.length===2){
      const dx=e.touches[0].clientX - e.touches[1].clientX;
      const dy=e.touches[0].clientY - e.touches[1].clientY;
      const dist=Math.hypot(dx,dy);
      const scale = pinchStartDist / Math.max(1,dist);
      camRadiusGoal = Math.min(250, Math.max(6, pinchStartRadius * scale));
    }
  }, {passive:false});
  canvas.addEventListener('touchend', e=>{
    if (e.touches.length===0 && dragging && !moved){
      const t=e.changedTouches[0];
      handleClick({clientX:t.clientX, clientY:t.clientY});
    }
    if (e.touches.length<2) pinchStartDist=0;
    if (e.touches.length===0) dragging=false;
  }, {passive:false});
  const raycaster = new THREE.Raycaster();
  const mouseNDC = new THREE.Vector2();
  function handleClick(e){
    const rect=canvas.getBoundingClientRect();
    mouseNDC.x = ((e.clientX-rect.left)/rect.width)*2-1;
    mouseNDC.y = -((e.clientY-rect.top)/rect.height)*2+1;
    raycaster.setFromCamera(mouseNDC,camera);
    if (viewMode==='galaxy'){
      const sysTargets = galaxyStars.map(g=>g.mesh);
      const bhTargets = galaxyBlackHoles.map(g=>g.mesh);
      const bhRingTargets = galaxyBlackHoles.map(g=>g.ring);
      const allTargets = sysTargets.concat(bhTargets).concat(bhRingTargets);
      const hits=raycaster.intersectObjects(allTargets,false);
      if (hits.length){
        const obj = hits[0].object;
        if (obj.userData.kind === 'blackhole' || obj.userData.blackHoleId) {
          const bhId = obj.userData.blackHoleId;
          warpToBlackHole(bhId);
          return;
        }
        const isBhRing = galaxyBlackHoles.some(g=> g.ring === obj);
        if (isBhRing) {
          const entry = galaxyBlackHoles.find(g=> g.ring === obj);
          warpToBlackHole(entry.blackHoleId);
          return;
        }
        const sysId = obj.userData.systemId;
        if (sysId) warpToSystem(sysId);
      }
      return;
    }
    if (viewMode==='blackhole'){
      if (activeBlackHole) {
        const targets = [activeBlackHole.coreMesh, activeBlackHole.diskMesh, activeBlackHole.photonRing].concat(activeBlackHole.lensedMeshes.map(l=>l.mesh));
        const hits=raycaster.intersectObjects(targets,false);
        if (hits.length) {
          const h = hits[0].object;
          const lensed = activeBlackHole.lensedMeshes.find(l=> l.mesh === h);
          if (lensed) return;
          selectBlackHole(activeBlackHole.entry.blackHole.key);
          return;
        }
      }
      return;
    }
    const system = SYSTEM_BY_ID[currentSystemId];
    if (!system) return;
    const targets=[];
    const keys=[];
    getSystemStars(system).forEach(st=>{
      if (activeBodies[st.key]) { targets.push(activeBodies[st.key].mesh); keys.push(st.key); }
    });
    system.bodies.forEach(b=>{
      const ab=activeBodies[b.key];
      if (ab && ab.mesh.visible) { targets.push(ab.mesh); keys.push(b.key); }
      if (ab) ab.moons.forEach(m=>{ if(m.mesh.visible){ targets.push(m.mesh); keys.push(m.key);} });
    });
    if (cometObj) { targets.push(cometObj.mesh); keys.push(cometObj.key); }
    const hits=raycaster.intersectObjects(targets,false);
    if (hits.length){
      const hit = hits[0].object;
      const idx = targets.indexOf(hit);
      if (idx!==-1){
        const key = keys[idx];
        const lookup = BODY_LOOKUP[key];
        if (lookup && lookup.isMoon) selectBody(lookup.parentKey);
        else if (lookup && lookup.isComet) selectBody(key);
        else selectBody(key);
      }
    }
  }
  function setView(mode){
    viewMode = mode;
    if (mode==='galaxy'){
      galaxyGroup.visible=true;
      systemGroup.visible=false;
      tradeGroup.visible=false;
      blackHoleGroup.visible=false;
      blackHoleLight.visible=false;
      sunLight.visible=true;
      galaxyBtn.classList.add('active');
      hintEl.classList.add('hidden');
      galaxyHintEl.classList.remove('hidden');
      camTargetGoal.set(0,0,0);
      camRadiusGoal=108;
      focusedKey=null;
      infoPanel.classList.remove('open');
    } else if (mode==='blackhole'){
      galaxyGroup.visible=false;
      systemGroup.visible=false;
      tradeGroup.visible=false;
      blackHoleGroup.visible=true;
      blackHoleLight.visible=true;
      sunLight.visible=false;
      galaxyBtn.classList.remove('active');
      hintEl.style.opacity='0.75';
      hintEl.classList.remove('hidden');
      hintEl.textContent = 'black hole view: drag to orbit, scroll or pinch to zoom';
      galaxyHintEl.classList.add('hidden');
      if (!activeBlackHole) buildBlackHoleVisuals(BLACKHOLE_BY_ID[currentBlackHoleId]);
    } else {
      galaxyGroup.visible=false;
      systemGroup.visible=true;
      tradeGroup.visible=showFactions;
      blackHoleGroup.visible=false;
      blackHoleLight.visible=false;
      galaxyBtn.classList.remove('active');
      hintEl.style.opacity='0.75';
      hintEl.textContent = 'click a body to focus, drag to orbit, scroll or pinch to zoom';
      hintEl.classList.remove('hidden');
      galaxyHintEl.classList.add('hidden');
      if (!activeBodies[getPrimaryStar(SYSTEM_BY_ID[currentSystemId]).key]) buildSystemVisuals(SYSTEM_BY_ID[currentSystemId]);
      sunLight.visible = getSystemStars(SYSTEM_BY_ID[currentSystemId]).length <= 1;
    }
    updateBreadcrumbs();
    renderPanel();
    updateLabelsVisibility();
    syncHash();
  }
  function warpToSystem(systemId){
    currentSystemId = systemId;
    buildSystemVisuals(SYSTEM_BY_ID[systemId]);
    camTheta = 0.9 + (Math.random()-0.5)*0.2;
    camPhi = 1.15;
    camRadius = camRadiusGoal + 30;
    setView('system');
    infoPanel.classList.add('open');
  }
  function warpToBlackHole(blackHoleId){
    currentBlackHoleId = blackHoleId;
    buildBlackHoleVisuals(BLACKHOLE_BY_ID[blackHoleId]);
    camTheta = 0.65 + (Math.random()-0.5)*0.2;
    camPhi = 1.0;
    camRadius = camRadiusGoal + 12;
    setView('blackhole');
    infoPanel.classList.add('open');
  }
  function selectBlackHole(key){
    const lookup = BODY_LOOKUP[key];
    if (!lookup || !lookup.isBlackHole) return;
    const entry = lookup.blackHoleEntry;
    if (entry.id !== currentBlackHoleId) {
      warpToBlackHole(entry.id);
      return;
    }
    focusedKey = key;
    paused = true;
    camTargetGoal.set(0,0,0);
    camRadiusGoal = 18;
    renderPanel();
    updateBreadcrumbs();
    updateLabelsVisibility();
    hintEl.style.opacity='0';
    syncHash();
    infoPanel.classList.add('open');
  }
  galaxyBtn.addEventListener('click', ()=>{
    if (viewMode==='galaxy') {
      if (activeBlackHole) setView('blackhole');
      else setView('system');
    } else setView('galaxy');
  });
  const _labelVec = new THREE.Vector3();
  function updateLabels(){
    if (viewMode === 'galaxy') return;
    const w = stageEl.clientWidth, h = stageEl.clientHeight;
    if (!w || !h) return;
    const isFocusedView = focusedKey !== null;
    const hideWhenFar = camRadius > 135;
    for (const key in labelEls) {
      const el = labelEls[key];
      let body = activeBodies[key];
      if (!body && activeBlackHole && activeBlackHole.entry && key === activeBlackHole.entry.blackHole.key) body = activeBodies[key];
      if (!body && cometObj && cometObj.key === key) body = cometObj;
      if (!body || !body.mesh) {
        const bhLensed = activeBlackHole && activeBlackHole.lensedMeshes ? activeBlackHole.lensedMeshes.find(l=> false) : null;
        el.classList.add('hidden'); continue;
      }
      if (!body.mesh.visible && !isFocusedView) { el.classList.add('hidden'); continue; }
      if (hideWhenFar && !body.isStar && !body.isBlackHole) { el.classList.add('hidden'); continue; }
      if (viewMode === 'blackhole' && activeBlackHole) {
        const targetMesh = body.mesh;
        targetMesh.getWorldPosition(_labelVec);
        _labelVec.project(camera);
        if (_labelVec.z > 1) { el.classList.add('hidden'); continue; }
        if (_labelVec.x < -1.15 || _labelVec.x > 1.15 || _labelVec.y < -1.15 || _labelVec.y > 1.15) { el.classList.add('hidden'); continue; }
        const x = (_labelVec.x * 0.5 + 0.5) * w;
        const y = (-_labelVec.y * 0.5 + 0.5) * h;
        el.classList.remove('hidden');
        el.style.transform = `translate3d(${x}px,${y - 14}px,0) translate(-50%,-100%)`;
        continue;
      }
      body.mesh.getWorldPosition(_labelVec);
      _labelVec.project(camera);
      if (_labelVec.z > 1) { el.classList.add('hidden'); continue; }
      if (_labelVec.x < -1.15 || _labelVec.x > 1.15 || _labelVec.y < -1.15 || _labelVec.y > 1.15) { el.classList.add('hidden'); continue; }
      const x = (_labelVec.x * 0.5 + 0.5) * w;
      const y = (-_labelVec.y * 0.5 + 0.5) * h;
      el.classList.remove('hidden');
      el.style.transform = `translate3d(${x}px,${y - 14}px,0) translate(-50%,-100%)`;
    }
    if (activeBlackHole && viewMode === 'blackhole') {
      activeBlackHole.lensedMeshes.forEach(l => {
        const key = l.mesh.userData ? l.mesh.userData.key : null;
      });
      for (const ls of (activeBlackHole.entry.lensingStars || [])) {
        const el = labelEls[ls.key];
        if (!el) continue;
        const lm = activeBlackHole.lensedMeshes.find(m=> m.basePos.x === ls.offset.x);
        if (!lm) continue;
        lm.mesh.getWorldPosition(_labelVec);
        _labelVec.project(camera);
        if (_labelVec.z > 1) { el.classList.add('hidden'); continue; }
        if (_labelVec.x < -1.15 || _labelVec.x > 1.15 || _labelVec.y < -1.15 || _labelVec.y > 1.15) { el.classList.add('hidden'); continue; }
        const x = (_labelVec.x * 0.5 + 0.5) * w;
        const y = (-_labelVec.y * 0.5 + 0.5) * h;
        el.classList.remove('hidden');
        el.style.transform = `translate3d(${x}px,${y - 10}px,0) translate(-50%,-100%)`;
      }
    }
  }
  function updateLabelsVisibility(){
    if (viewMode === 'galaxy') {
      for (const k in labelEls) labelEls[k].classList.add('hidden');
    } else {
    }
  }
  function updateBreadcrumbs(){
    let html='';
    if (viewMode==='galaxy'){
      html=`<span class="current">Galaxy</span>`;
    } else if (viewMode==='blackhole'){
      const bh = BLACKHOLE_BY_ID[currentBlackHoleId];
      html=`<button data-bc="galaxy">Galaxy</button><span class="sep">›</span><span class="current">${bh.name}</span>`;
      if (focusedKey && focusedKey !== bh.blackHole.key){
        const lookup = BODY_LOOKUP[focusedKey];
        const name = lookup ? (lookup.data.name || focusedKey) : focusedKey;
        html+=`<span class="sep">›</span><span class="current">${name}</span>`;
      } else if (focusedKey){
        html+=`<span class="sep">›</span><span class="current">${bh.blackHole.name}</span>`;
      }
    } else {
      const sys = SYSTEM_BY_ID[currentSystemId];
      html=`<button data-bc="galaxy">Galaxy</button><span class="sep">›</span><button data-bc="system">${sys.name}</button>`;
      if (focusedKey){
        const lookup = BODY_LOOKUP[focusedKey];
        const name = lookup ? lookup.data.name : focusedKey;
        html+=`<span class="sep">›</span><span class="current">${name}</span>`;
        if (lookup && lookup.isMoon){
        }
        if (lookup && !lookup.isStar && !lookup.isMoon && !lookup.isComet){
        }
      } else {
        html+=`<span class="sep">›</span><span class="current">Overview</span>`;
      }
    }
    breadcrumbsEl.innerHTML=html;
    breadcrumbsEl.querySelectorAll('[data-bc]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const v=btn.getAttribute('data-bc');
        if (v==='galaxy') setView('galaxy');
        if (v==='system') clearFocus();
      });
    });
  }
  searchInput.addEventListener('input', ()=>{
    searchQuery = searchInput.value.trim().toLowerCase();
    renderPanel();
  });
  factionToggle.addEventListener('click', ()=>{
    showFactions = !showFactions;
    factionToggle.classList.toggle('active', showFactions);
    tradeGroup.visible = showFactions && viewMode==='system';
    Object.values(activeBodies).forEach(b=>{
      if (b.orbitLine) b.orbitLine.material.opacity = showFactions ? 0.32 : 0.22;
    });
    if (viewMode==='system') buildTradeRoutes(SYSTEM_BY_ID[currentSystemId]);
  });
  function setupTimeline(bodyData){
    if (!bodyData.timeline || !bodyData.timeline.length){
      timelineWrap.classList.add('hidden');
      return;
    }
    const years = bodyData.timeline.map(t=>t.year).sort((a,b)=>a-b);
    const minY = years[0], maxY = years[years.length-1];
    timeScrub.min = minY;
    timeScrub.max = maxY;
    timeScrub.value = maxY;
    timelineFilterYear = maxY;
    timelineYearEl.textContent = formatYear(maxY);
    renderTimelineEvents(bodyData);
    timelineWrap.classList.remove('hidden');
  }
  function formatYear(y){
    if (y<0) return `${Math.abs(y/1e9).toFixed(1)} Gyr ago`;
    return `Year ${y}`;
  }
  function renderTimelineEvents(bodyData){
    const year = parseInt(timeScrub.value,10);
    timelineFilterYear = year;
    timelineYearEl.textContent = formatYear(year);
    const html = bodyData.timeline.map(ev=>{
      const active = ev.year <= year;
      return `<div class="t-ev ${active?'active':''}"><span class="t-year">${ev.year<0? (ev.year/1e9).toFixed(1)+' Gya':ev.year}</span><span class="t-body"><strong>${ev.title}</strong>${ev.desc}</span></div>`;
    }).join('');
    timelineEventsEl.innerHTML=html;
  }
  timeScrub.addEventListener('input', ()=>{
    if (!focusedKey) return;
    const lookup = BODY_LOOKUP[focusedKey];
    if (lookup) renderTimelineEvents(lookup.data);
  });
  function parseDescription(paragraphs){
    return paragraphs.map(p=>{
      return p.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (m, key, label)=>{
        const lookup = BODY_LOOKUP[key];
        let display = label || (lookup ? lookup.data.name : key);
        if (!lookup){
          let foundFaction=null;
          SYSTEMS.forEach(s=> s.factions.forEach(f=>{ if(f.id===key) foundFaction=f; }));
          BLACK_HOLES.forEach(bh=> { if (bh.blackHole.key===key) foundFaction=null; });
          if (foundFaction) return `<span class="tag" style="border-color:${foundFaction.colorHex}; color:${foundFaction.colorHex}">${foundFaction.name}</span>`;
          return display;
        }
        return `<a href="#" class="xref" data-xref="${key}">${display}</a>`;
      });
    }).join('</p><p>');
  }
  function renderPopulation(pop){
    if (!pop) return '';
    return `<div class="population">
      <h4 class="serif">Civilization</h4>
      <div class="stat-row"><span class="k">Population</span><span class="v">${pop.count}</span></div>
      <div class="stat-row"><span class="k">Species</span><span class="v">${pop.species||'-'}</span></div>
      <div class="stat-row"><span class="k">Governance</span><span class="v">${pop.governance||'-'}</span></div>
      ${pop.notes? `<p class="muted-sm" style="margin:8px 0 0; line-height:1.5;">${pop.notes}</p>` : ''}
    </div>`;
  }
  function renderLegends(system){
    if (!showFactions || !system.factions.length) return '';
    return `<div class="legend">${system.factions.map(f=> `<span class="leg-item"><span class="leg-swatch" style="background:${f.colorHex}"></span>${f.name}</span>`).join('')}</div>`;
  }
  function selectBody(key){
    const lookup = BODY_LOOKUP[key];
    if (!lookup) return;
    if (lookup.isBlackHole) { warpToBlackHole(lookup.blackHoleEntry.id); return; }
    if (lookup.isLensingStar) return;
    if (lookup.isMoon){
      key = lookup.parentKey;
    }
    if (lookup.system.id !== currentSystemId){
      if (SYSTEM_BY_ID[lookup.system.id]) {
        currentSystemId = lookup.system.id;
        buildSystemVisuals(lookup.system);
      } else if (BLACKHOLE_BY_ID[lookup.system.id]) {
        warpToBlackHole(lookup.system.id);
        return;
      }
    }
    focusedKey = key;
    paused = true;
    Object.entries(activeBodies).forEach(([k,b])=>{
      const isFocused = k===key;
      let visible = isFocused;
      if (b.isStar){ visible = (key===k); }
      if (SYSTEM_BY_ID[currentSystemId] && SYSTEM_BY_ID[currentSystemId].comet && k===SYSTEM_BY_ID[currentSystemId].comet.key) visible = (key===k);
      b.mesh.visible = visible;
      if (b.glow) b.glow.visible = visible;
      if (b.orbitLine) b.orbitLine.visible = false;
      if (b.moons) b.moons.forEach(m=> m.mesh.visible = isFocused);
      if (b.atmMesh) b.atmMesh.visible = isFocused;
    });
    const b=activeBodies[key];
    if (b){
      const wp = new THREE.Vector3(); b.mesh.getWorldPosition(wp);
      camTargetGoal.copy(wp);
      const size = lookup.isStar ? (lookup.data.size || 4.3) : (lookup.data.size||1.5);
      camRadiusGoal = size*7 + 6;
    }
    renderPanel();
    updateBreadcrumbs();
    updateLabelsVisibility();
    hintEl.style.opacity='0';
    syncHash();
    infoPanel.classList.add('open');
  }
  function clearFocus(){
    if (viewMode==='blackhole'){
      focusedKey = BLACKHOLE_BY_ID[currentBlackHoleId].blackHole.key;
      paused=false;
      camTargetGoal.set(0,0,0);
      camRadiusGoal=22;
      renderPanel();
      updateBreadcrumbs();
      updateLabelsVisibility();
      hintEl.style.opacity='0.75';
      syncHash();
      return;
    }
    focusedKey=null; paused=false;
    Object.values(activeBodies).forEach(b=>{
      b.mesh.visible=true;
      if (b.glow) b.glow.visible=true;
      if (b.orbitLine) b.orbitLine.visible=true;
      if (b.moons) b.moons.forEach(m=> m.mesh.visible=true);
      if (b.atmMesh) b.atmMesh.visible=true;
    });
    camTargetGoal.set(0,0,0);
    camRadiusGoal=92;
    renderPanel();
    updateBreadcrumbs();
    updateLabelsVisibility();
    hintEl.style.opacity='0.75';
    syncHash();
  }
  function renderPanel(){
    if (viewMode==='galaxy'){
      const sysList = SYSTEMS.map(sys=>{
        const stars = getSystemStars(sys);
        const typeLabel = stars.length > 1 ? `Binary: ${stars.map(s=>s.name).join(' + ')}` : stars[0].type;
        return `<li><button data-sys="${sys.id}">
          <span class="eyebrow-swatch" style="background:${stars[0].colorHex}"></span>
          <span><span class="b-name serif">${sys.name}</span><span class="b-type">${typeLabel} • ${sys.bodies.length} worlds</span></span>
        </button></li>`;
      }).join('');
      const bhList = BLACK_HOLES.map(bh=>{
        return `<li><button data-bh="${bh.id}">
          <span class="eyebrow-swatch" style="background:${bh.diskColorHex}; box-shadow:0 0 8px ${bh.diskColorHex}"></span>
          <span><span class="b-name serif">${bh.name}</span><span class="b-type">${bh.blackHole.type}</span></span>
        </button></li>`;
      }).join('');
      panelContent.innerHTML = `
        <h1 class="title serif">Galaxy</h1>
        <p class="lede">Example description for galaxy view. Select a system or a black hole below or click a marker in the view to warp in. Black holes appear with a dark core and a bright accretion ring.</p>
        <h4 style="font-size:0.78rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.08em;margin:16px 0 8px;">Star systems</h4>
        <ul class="body-list">${sysList}</ul>
        <h4 style="font-size:0.78rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.08em;margin:18px 0 8px;">Black holes</h4>
        <ul class="body-list">${bhList}</ul>
      `;
      panelContent.querySelectorAll('[data-sys]').forEach(btn=>{
        btn.addEventListener('click',()=> warpToSystem(btn.getAttribute('data-sys')));
      });
      panelContent.querySelectorAll('[data-bh]').forEach(btn=>{
        btn.addEventListener('click',()=> warpToBlackHole(btn.getAttribute('data-bh')));
      });
      timelineWrap.classList.add('hidden');
      return;
    }
    if (viewMode==='blackhole'){
      const entry = BLACKHOLE_BY_ID[currentBlackHoleId];
      const bh = entry.blackHole;
      const q = searchQuery;
      const matches = (data)=>{
        if(!q) return true;
        const hay = [data.name, data.type, (data.description||[]).join(' '), (data.stats||[]).flat().join(' ')].join(' ').toLowerCase();
        return hay.includes(q);
      };
      const isDetail = focusedKey && BODY_LOOKUP[focusedKey] && BODY_LOOKUP[focusedKey].isBlackHole;
      const isLensedDetail = focusedKey && BODY_LOOKUP[focusedKey] && BODY_LOOKUP[focusedKey].isLensingStar;
      if (focusedKey && !isDetail && !isLensedDetail) {
        focusedKey = bh.key;
      }
      if (isDetail || !focusedKey){
        const d = bh;
        const paragraphs = `<p>${parseDescription(d.description||[])}</p>`;
        const stats = (d.stats||[]).map(([k,v])=> `<div class="stat-row"><span class="k">${k}</span><span class="v">${v}</span></div>`).join('');
        const pop = renderPopulation(d.population);
        const extra = `
          <div class="stats">
            <h4>Accretion disk</h4>
            <div class="stat-row"><span class="k">Inner radius</span><span class="v">${entry.disk.inner} horizon radii</span></div>
            <div class="stat-row"><span class="k">Outer radius</span><span class="v">${entry.disk.outer} horizon radii</span></div>
            <div class="stat-row"><span class="k">Tilt</span><span class="v">${(entry.disk.tilt*57.3).toFixed(1)} degrees</span></div>
            <div class="stat-row"><span class="k">Disk color</span><span class="v"><span class="eyebrow-swatch" style="background:${entry.diskColorHex}"></span>${entry.diskColorHex}</span></div>
          </div>
          <div class="stats">
            <h4>Lensing</h4>
            <p class="muted-sm">Example placeholder text for gravitational lensing. Light from background stars bends around the hole and creates a photon ring.</p>
          </div>
        `;
        panelContent.innerHTML = `
          <button class="back-link" id="backBtn">← Galaxy</button>
          <h1 class="title serif">${d.name}</h1>
          <span class="tag">${d.type}</span> <span class="tag" style="border-color:${entry.glowColorHex};color:${entry.glowColorHex}">Black hole</span>
          <div class="lore">${paragraphs}</div>
          <div class="stats">${stats}</div>
          ${pop}
          ${extra}
        `;
        document.getElementById('backBtn').addEventListener('click', ()=> setView('galaxy'));
        panelContent.querySelectorAll('[data-xref]').forEach(a=>{
          a.addEventListener('click', (e)=>{
            e.preventDefault();
            const k = a.getAttribute('data-xref');
            const lk = BODY_LOOKUP[k];
            if (lk && lk.isBlackHole) selectBlackHole(k);
            else selectBody(k);
          });
        });
        setupTimeline(d);
        return;
      }
      if (isLensedDetail){
        const d = BODY_LOOKUP[focusedKey].data;
        panelContent.innerHTML = `
          <button class="back-link" id="backBtn">← ${entry.name}</button>
          <h1 class="title serif">Lensed Star</h1>
          <span class="tag">Background source</span>
          <div class="lore"><p>Example placeholder text for a lensed star near ${entry.name}. The star appears distorted and magnified by the black hole gravity.</p></div>
          <div class="stats"><div class="stat-row"><span class="k">Apparent position</span><span class="v">${d.offset.x.toFixed(1)}, ${d.offset.y.toFixed(1)}, ${d.offset.z.toFixed(1)}</span></div><div class="stat-row"><span class="k">Color</span><span class="v"><span class="eyebrow-swatch" style="background:${d.colorHex}"></span>${d.colorHex}</span></div></div>
        `;
        document.getElementById('backBtn').addEventListener('click', ()=> { focusedKey = bh.key; renderPanel(); updateBreadcrumbs(); setupTimeline(bh); });
        timelineWrap.classList.add('hidden');
        return;
      }
    }
    const sys = SYSTEM_BY_ID[currentSystemId];
    if (!focusedKey){
      let displayBodies = sys.bodies;
      let displayStars = getSystemStars(sys);
      const q=searchQuery;
      const matches = (data)=>{
        if(!q) return true;
        const hay = [data.name, data.type, (data.description||[]).join(' '), data.faction||'', (data.stats||[]).flat().join(' ')].join(' ').toLowerCase();
        return hay.includes(q);
      };
      const starsVisible = displayStars.filter(matches);
      const bodiesMatch = displayBodies.filter(b=> matches(b));
      let cometMatch = false;
      if (sys.comet) cometMatch = matches(sys.comet);
      let html='';
      const bodyListItems = [];
      starsVisible.forEach(displayStar=>{
        bodyListItems.push(`<li><button data-key="${displayStar.key}">
          <span class="eyebrow-swatch" style="background:${displayStar.colorHex}"></span>
          <span><span class="b-name serif">${displayStar.name}</span><span class="b-type">${displayStar.type}</span></span>
        </button></li>`);
      });
      bodiesMatch.forEach(d=>{
        const facDot = d.faction && sys.factions.find(f=>f.id===d.faction) ? `<span class="faction-dot" style="background:${sys.factions.find(f=>f.id===d.faction).colorHex}"></span>` : '';
        bodyListItems.push(`<li><button data-key="${d.key}">
          <span class="eyebrow-swatch" style="background:${d.colorHex}"></span>
          <span><span class="b-name serif">${d.name}${facDot}</span><span class="b-type">${d.type}</span></span>
        </button></li>`);
      });
      if (cometMatch && sys.comet){
        const c=sys.comet;
        bodyListItems.push(`<li><button data-key="${c.key}">
          <span class="eyebrow-swatch" style="background:${c.colorHex}"></span>
          <span><span class="b-name serif">${c.name}</span><span class="b-type">comet</span></span>
        </button></li>`);
      }
      let emptyNote='';
      if (bodyListItems.length===0){
        emptyNote=`<p class="muted-sm">No bodies match “${searchQuery}”.</p>`;
      }
      panelContent.innerHTML = `
        <h1 class="title serif">${sys.name}</h1>
        <p class="lede">${sys.description}</p>
        <ul class="body-list">${bodyListItems.join('')}</ul>
        ${emptyNote}
        ${renderLegends(sys)}
        <div class="stats" style="margin-top:16px">
          <h4>System map</h4>
          <p class="muted-sm">Click any world or its label to focus. Drag to orbit, scroll or pinch to zoom. Trade routes ${showFactions?'shown':'hidden'}.</p>
        </div>
      `;
      panelContent.querySelectorAll('[data-key]').forEach(btn=>{
        btn.addEventListener('click', ()=> selectBody(btn.getAttribute('data-key')));
      });
      timelineWrap.classList.add('hidden');
    } else {
      const lookup = BODY_LOOKUP[focusedKey];
      if (!lookup){ clearFocus(); return; }
      const d = lookup.data;
      const paragraphs = `<p>${parseDescription(d.description||[])}</p>`;
      const stats = (d.stats||[]).map(([k,v])=> `<div class="stat-row"><span class="k">${k}</span><span class="v">${v}</span></div>`).join('');
      const pop = renderPopulation(d.population);
      let extraMoons='';
      const parentBody = sys.bodies.find(b=> b.key===focusedKey);
      if (parentBody){
        const moons = [];
        if (parentBody.moon) moons.push(parentBody.moon);
        if (parentBody.moons) moons.push(...parentBody.moons);
        if (moons.length){
          extraMoons = `<div class="stats"><h4>Moons</h4>${moons.map(m=> `<div class="stat-row"><span class="k">${m.name}</span><span class="v">⌀ ${(m.size*2).toFixed(1)} • ${m.dist.toFixed(1)} R</span></div>`).join('')}</div>`;
        }
      }
      let factionBadge='';
      if (d.faction){
        const fac = sys.factions.find(f=> f.id===d.faction);
        if (fac) factionBadge = `<span class="tag" style="border-color:${fac.colorHex}; color:${fac.colorHex}">${fac.name}</span>`;
        else if (d.faction==='contested') factionBadge = `<span class="tag" style="border-color:#e8c85c; color:#e8c85c">Contested</span>`;
      }
      panelContent.innerHTML = `
        <button class="back-link" id="backBtn">← All bodies</button>
        <h1 class="title serif">${d.name}</h1>
        <span class="tag">${d.type}</span> ${factionBadge}
        <div class="lore">${paragraphs}</div>
        <div class="stats">${stats}</div>
        ${pop}
        ${extraMoons}
      `;
      document.getElementById('backBtn').addEventListener('click', clearFocus);
      panelContent.querySelectorAll('[data-xref]').forEach(a=>{
        a.addEventListener('click', (e)=>{
          e.preventDefault();
          selectBody(a.getAttribute('data-xref'));
        });
      });
      setupTimeline(d);
    }
  }
  function syncHash(){
    let hash='';
    if (viewMode==='galaxy') hash='#galaxy';
    else if (viewMode==='blackhole') {
      if (focusedKey && focusedKey !== BLACKHOLE_BY_ID[currentBlackHoleId].blackHole.key) hash=`#${currentBlackHoleId}/${focusedKey}`;
      else hash=`#${currentBlackHoleId}`;
    }
    else if (focusedKey) hash=`#${currentSystemId}/${focusedKey}`;
    else hash=`#${currentSystemId}`;
    if (location.hash !== hash) history.replaceState(null,'',hash);
  }
  function applyHash(){
    const raw = location.hash.replace(/^#/,'');
    if (!raw) return;
    if (raw==='galaxy'){ setView('galaxy'); return; }
    if (BLACKHOLE_BY_ID[raw]){
      currentBlackHoleId = raw;
      buildBlackHoleVisuals(BLACKHOLE_BY_ID[raw]);
      setView('blackhole');
      return;
    }
    if (raw.indexOf('blackhole-')===0) {
      const parts = raw.split('/');
      const bhId = parts[0];
      const key = parts[1];
      if (BLACKHOLE_BY_ID[bhId]){
        currentBlackHoleId = bhId;
        buildBlackHoleVisuals(BLACKHOLE_BY_ID[bhId]);
        setView('blackhole');
        if (key && BODY_LOOKUP[key]) { focusedKey = key; renderPanel(); updateBreadcrumbs(); }
        return;
      }
    }
    const parts = raw.split('/');
    const sysId = parts[0];
    const bodyKey = parts[1];
    if (SYSTEM_BY_ID[sysId]){
      if (sysId!==currentSystemId){
        currentSystemId = sysId;
        buildSystemVisuals(SYSTEM_BY_ID[sysId]);
      }
      setView('system');
      if (bodyKey && BODY_LOOKUP[bodyKey]){
        selectBody(bodyKey);
      } else {
        clearFocus();
      }
    } else if (BODY_LOOKUP[raw]){
      const lookup = BODY_LOOKUP[raw];
      if (lookup.isBlackHole) {
        warpToBlackHole(lookup.blackHoleEntry.id);
        return;
      }
      if (lookup.system && SYSTEM_BY_ID[lookup.system.id]){
        currentSystemId = lookup.system.id;
        buildSystemVisuals(lookup.system);
        setView('system');
        selectBody(raw);
      } else if (lookup.system && BLACKHOLE_BY_ID[lookup.system.id]) {
        warpToBlackHole(lookup.system.id);
      }
    }
  }
  menuBtn.addEventListener('click', ()=> infoPanel.classList.toggle('open'));
  const clock = new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (viewMode==='system'){
      starObjs.forEach(st=>{
        if (!paused && st.orbitRadius) {
          st.angle += st.orbitSpeed * dt * 0.35;
          const x = Math.cos(st.angle)*st.orbitRadius;
          const z = Math.sin(st.angle)*st.orbitRadius;
          st.mesh.position.set(x, 0, z);
          st.glow.position.set(x, 0, z);
          st.light.position.set(x, 0, z);
        }
        st.mesh.rotation.y += 0.05*dt;
        st.glow.material.opacity = 0.72 + Math.sin(Date.now()*0.0015 + st.angle)*0.08;
      });
      Object.values(activeBodies).forEach(b=>{
        if (b.isStar) return;
        if (!paused) b.angle += b.orbitSpeed * dt * 0.35;
        const x = Math.cos(b.angle)*b.orbitRadius;
        const z = Math.sin(b.angle)*b.orbitRadius;
        b.axialGroup.position.set(x, 0, z);
        b.mesh.rotation.y += b.spin * dt;
        if (b.moons) b.moons.forEach(m=>{
          if (!paused) m.angle += m.speed*dt;
          m.mesh.position.set(x + Math.cos(m.angle)*m.dist, 0, z + Math.sin(m.angle)*m.dist);
          m.mesh.rotation.y += 0.4*dt;
        });
      });
      if (cometObj){
        if (!paused) cometObj.angle += cometObj.speed*dt;
        const a = cometObj.a, e=cometObj.e;
        const nu = cometObj.angle;
        const r = a * (1 - e*e) / (1 + e*Math.cos(nu));
        const x = Math.cos(nu)*r;
        const z = Math.sin(nu)*r * Math.cos(cometObj.tilt);
        const y = Math.sin(nu)*r * Math.sin(cometObj.tilt);
        cometObj.mesh.position.set(x, y, z);
        const dir = new THREE.Vector3(x,y,z).normalize();
        const target = new THREE.Vector3().copy(cometObj.mesh.position).sub(dir.clone().multiplyScalar(10));
        cometObj.mesh.lookAt(target);
        const peri = a*(1-e), apo=a*(1+e);
        const t = (r - peri)/(apo-peri);
        cometObj.tail.material.opacity = 0.42 * (1 - t*0.6);
      }
    } else if (viewMode==='blackhole' && activeBlackHole){
      const t = Date.now() * 0.001;
      if (activeBlackHole.diskMesh) activeBlackHole.diskMesh.rotation.z += activeBlackHole.rotationSpeed * dt * 0.28;
      if (activeBlackHole.backDisk) activeBlackHole.backDisk.rotation.z -= activeBlackHole.rotationSpeed * dt * 0.12;
      if (activeBlackHole.photonRing) {
        activeBlackHole.photonRing.material.opacity = 0.78 + Math.sin(t*1.8)*0.14;
        activeBlackHole.photonRing.rotation.z += dt * 0.18;
      }
      if (activeBlackHole.haloSpr) activeBlackHole.haloSpr.material.opacity = 0.82 + Math.sin(t*1.2)*0.10;
      if (activeBlackHole.coreMesh) activeBlackHole.coreMesh.rotation.y += dt * 0.14;
      activeBlackHole.lensedMeshes.forEach((lm, idx) => {
        const sway = Math.sin(t*0.9 + idx)*0.12;
        lm.mesh.position.x = lm.basePos.x + sway;
        lm.glow.position.copy(lm.mesh.position);
        lm.glow.material.opacity = 0.55 + Math.sin(t*1.4 + idx)*0.18;
      });
      if (activeBlackHole.jetUp) {
        activeBlackHole.jetUp.material.opacity = 0.16 + Math.sin(t*1.6)*0.06;
        activeBlackHole.jetUp.scale.set(1, 1 + Math.sin(t*0.9)*0.08, 1);
      }
      if (activeBlackHole.jetDown) {
        activeBlackHole.jetDown.material.opacity = 0.10 + Math.sin(t*1.6 + 1.2)*0.05;
      }
    } else {
      galaxyGroup.rotation.y += 0.02*dt;
      galaxyBlackHoles.forEach((g, idx)=>{
        if (g.ring) g.ring.rotation.z += dt * 0.28;
        if (g.sprite) g.sprite.material.opacity = 0.88 + Math.sin(Date.now()*0.0012 + idx)*0.08;
      });
    }
    updateCamera(dt*4);
    updateLabels();
    renderer.render(scene, camera);
  }
  if (location.hash) {
    applyHash();
    const sys = SYSTEM_BY_ID[currentSystemId];
    const hasVisuals = !!(sys && activeBodies[getPrimaryStar(sys).key]);
    const bhHasVisuals = !!(activeBlackHole);
    if (!hasVisuals && !bhHasVisuals && viewMode !== 'galaxy' && viewMode !== 'blackhole') {
      buildSystemVisuals(SYSTEM_BY_ID[currentSystemId]);
      setView('system');
    }
    if (viewMode==='blackhole' && !bhHasVisuals) {
      buildBlackHoleVisuals(BLACKHOLE_BY_ID[currentBlackHoleId]);
      setView('blackhole');
    }
  } else {
    buildSystemVisuals(SYSTEM_BY_ID[currentSystemId]);
    setView('system');
  }
  window.addEventListener('hashchange', applyHash);
  resize();
  animate();
  setTimeout(()=>{
    loader.classList.add('dismissed');
    camRadiusGoal = 92;
    if (viewMode==='blackhole') camRadiusGoal = 22;
  }, 650);
})();
