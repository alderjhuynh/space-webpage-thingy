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
