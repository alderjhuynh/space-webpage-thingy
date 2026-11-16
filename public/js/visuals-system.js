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
