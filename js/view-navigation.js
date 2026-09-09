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
