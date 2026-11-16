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
const activePointers = new Map();
function pointersList(){ return Array.from(activePointers.values()); }
canvas.addEventListener('pointerdown', e=>{
  canvas.setPointerCapture(e.pointerId);
  activePointers.set(e.pointerId, {x:e.clientX, y:e.clientY});
  if (activePointers.size === 1){
    dragging=true; moved=false; lastX=e.clientX; lastY=e.clientY;
    canvas.classList.add('dragging');
  } else if (activePointers.size === 2){
    dragging=false;
    const [p1,p2] = pointersList();
    pinchStartDist = Math.hypot(p1.x-p2.x, p1.y-p2.y);
    pinchStartRadius = camRadiusGoal;
  }
});
canvas.addEventListener('pointermove', e=>{
  if (!activePointers.has(e.pointerId)) return;
  activePointers.set(e.pointerId, {x:e.clientX, y:e.clientY});
  if (activePointers.size === 1 && dragging){
    const dx=e.clientX-lastX, dy=e.clientY-lastY;
    if (Math.abs(dx)+Math.abs(dy)>6) moved=true;
    camTheta -= dx*0.006;
    camPhi = Math.min(Math.PI-0.2, Math.max(0.2, camPhi - dy*0.006));
    lastX=e.clientX; lastY=e.clientY;
  } else if (activePointers.size === 2){
    const [p1,p2] = pointersList();
    const dist = Math.hypot(p1.x-p2.x, p1.y-p2.y);
    const scale = pinchStartDist / Math.max(1,dist);
    camRadiusGoal = Math.min(250, Math.max(6, pinchStartRadius * scale));
  }
});
function endPointer(e){
  if (!activePointers.has(e.pointerId)) return;
  activePointers.delete(e.pointerId);
  if (activePointers.size === 0){
    if (e.type === 'pointerup' && dragging && !moved) handleClick(e);
    dragging=false;
    canvas.classList.remove('dragging');
  } else if (activePointers.size === 1){
    const remaining = pointersList()[0];
    dragging=true; moved=true;
    lastX=remaining.x; lastY=remaining.y;
  }
  pinchStartDist = 0;
}
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);
canvas.addEventListener('wheel', e=>{
  e.preventDefault();
  camRadiusGoal = Math.min(250, Math.max(6, camRadiusGoal + e.deltaY*0.05));
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
