const BLACK_HOLES = [BLACKHOLE_EREBOS];

const SYSTEMS = [SYSTEM_HELION, SYSTEM_AURALIS, SYSTEM_SOL, SYSTEM_CASTOR];

const SYSTEM_BY_ID = Object.fromEntries(SYSTEMS.map(s => [s.id, s]));
const BLACKHOLE_BY_ID = Object.fromEntries(BLACK_HOLES.map(b => [b.id, b]));
const BODY_LOOKUP = (() => {
  const m = {};
  SYSTEMS.forEach(sys => {
    const stars = sys.stars || (sys.star ? [sys.star] : []);
    stars.forEach(st => { m[st.key] = { system: sys, data: st, isStar: true }; });
    sys.bodies.forEach(b => {
      m[b.key] = { system: sys, data: b, isStar: false };
      if (b.moon) m[b.moon.key] = { system: sys, data: b.moon, parentKey: b.key, isMoon: true };
      if (b.moons) b.moons.forEach(mo => { m[mo.key] = { system: sys, data: mo, parentKey: b.key, isMoon: true }; });
    });
    if (sys.comet) m[sys.comet.key] = { system: sys, data: sys.comet, isComet: true };
  });
  BLACK_HOLES.forEach(bh => {
    m[bh.blackHole.key] = { system: bh, data: bh.blackHole, isBlackHole: true, blackHoleEntry: bh };
    m[bh.id] = { system: bh, data: bh.blackHole, isBlackHole: true, blackHoleEntry: bh, isBlackHoleSystem: true };
    if (bh.lensingStars) bh.lensingStars.forEach(ls => { m[ls.key] = { system: bh, data: ls, isLensingStar: true, parentKey: bh.blackHole.key }; });
  });
  return m;
})();
