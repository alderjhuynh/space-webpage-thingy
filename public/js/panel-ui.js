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
        <span><span class="b-name serif">${sys.name}</span><span class="b-type">${typeLabel}</span></span>
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
        <p class="muted-sm">This is a system level map.</p>
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
