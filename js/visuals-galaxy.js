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
    ctx.fillStyle='#8a89a3'; ctx.font='11px Inter'; ctx.fillText('',128,48);
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
