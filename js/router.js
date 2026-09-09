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
