const SYSTEMS = [SYSTEM_HELION, SYSTEM_AURALIS, SYSTEM_SOL];

const SYSTEM_BY_ID = Object.fromEntries(SYSTEMS.map(s => [s.id, s]));
const BODY_LOOKUP = (() => {
  const m = {};
  SYSTEMS.forEach(sys => {
    m[sys.star.key] = { system: sys, data: sys.star, isStar: true };
    sys.bodies.forEach(b => {
      m[b.key] = { system: sys, data: b, isStar: false };
      if (b.moon) m[b.moon.key] = { system: sys, data: b.moon, parentKey: b.key, isMoon: true };
      if (b.moons) b.moons.forEach(mo => { m[mo.key] = { system: sys, data: mo, parentKey: b.key, isMoon: true }; });
    });
    if (sys.comet) m[sys.comet.key] = { system: sys, data: sys.comet, isComet: true };
  });
  return m;
})();
