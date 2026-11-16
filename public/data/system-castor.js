const SYSTEM_CASTOR = {
  id: 'system-castor',
  name: 'Castor',
  description: 'Example description for Castor, a binary star system: two stars locked in a mutual orbit around a shared center of mass, with planets circling the pair as a whole.',
  position: { x: -10, y: -22, z: 30 },
  galaxyColorHex: '#bfe3ff',
  // multistar systems use a stars array
  stars: [
    {
      key: 'castor-a',
      name: 'Castor A',
      type: 'Example star type: blue-white primary',
      colorHex: '#bfe3ff',
      color: 0xbfe3ff,
      size: 3.6,
      orbitRadius: 4.5,
      orbitSpeed: 0.22,
      orbitPhase: 0,
      lightIntensity: 2.6,
      description: [
        'Example description for Castor A. The more massive of the pair, it orbits closer to the shared center of mass and outshines its companion.',
        'Additional example description for Castor A. Its stronger gravity keeps it on the tighter of the two orbits around the barycenter.'
      ],
      stats: [
        ['Example stat: Mass', 'Example value 2.1 solar masses'],
        ['Example stat: Orbital separation', 'Example value 4.5 AU from barycenter'],
        ['Example stat: Orbital period', 'Example value 38 years']
      ],
      population: null,
      timeline: [
        { year: -400000000, title: 'Example event 1', desc: 'Example description for formation of the Castor pair from a shared protostellar cloud.' },
        { year: 0, title: 'Example event 2', desc: 'Example description for present-day observation of the binary.' }
      ],
      faction: null
    },
    {
      key: 'castor-b',
      name: 'Castor B',
      type: 'Example star type: orange companion',
      colorHex: '#ffb37a',
      color: 0xffb37a,
      size: 2.5,
      orbitRadius: 7.5,
      orbitSpeed: 0.22,
      orbitPhase: 3.14159,
      lightIntensity: 1.5,
      description: [
        'Example description for Castor B. The smaller, cooler companion star, it swings wider around the barycenter opposite Castor A.',
        'Additional example description for Castor B. Its dimmer, warmer light casts long double shadows across any orbiting worlds.'
      ],
      stats: [
        ['Example stat: Mass', 'Example value 1.3 solar masses'],
        ['Example stat: Orbital separation', 'Example value 7.5 AU from barycenter'],
        ['Example stat: Orbital period', 'Example value 38 years']
      ],
      population: null,
      timeline: [
        { year: -400000000, title: 'Example event 1', desc: 'Example description for formation alongside Castor A.' }
      ],
      faction: null
    }
  ],
  bodies: [
    {
      key: 'castor-b1',
      name: 'Castor b1',
      type: 'Example planet type: circumbinary rocky world',
      colorHex: '#c99a6a',
      color: 0xc99a6a,
      orbitRadius: 20,
      orbitSpeed: 0.16,
      spinSpeed: 0.3,
      tilt: 0.08,
      size: 1.4,
      ring: false,
      hasAtmosphere: true,
      atmosphereColor: '#e8c8a0',
      description: [
        'Example description for Castor b1. It circles both stars as a single pair, far enough out that their combined gravity acts like one point mass.',
        'Additional example description for Castor b1. Its sky shows two suns whose relative positions and combined brightness shift as they orbit each other.'
      ],
      stats: [
        ['Example stat 1', 'Example value 1'],
        ['Example stat 2', 'Example value 2']
      ],
      population: { count: 'Example count', species: 'Example species', governance: 'Example governance', notes: 'Example notes about adapting to a two-shadow day-night cycle.' },
      timeline: [
        { year: 10, title: 'Example event 1', desc: 'Example description.' },
        { year: 30, title: 'Example event 2', desc: 'Example description.' }
      ],
      faction: 'faction-1'
    },
    {
      key: 'castor-b2',
      name: 'Castor b2',
      type: 'Example planet type: gas giant',
      colorHex: '#7a9fd1',
      color: 0x7a9fd1,
      orbitRadius: 34,
      orbitSpeed: 0.09,
      spinSpeed: 0.7,
      tilt: 0.22,
      size: 2.8,
      ring: true,
      hasAtmosphere: true,
      atmosphereColor: '#a8c8ff',
      moon: { key: 'castor-b2-i', name: 'Castor b2 I', colorHex: '#9b968f', color: 0x9b968f, size: 0.4, dist: 4.2, speed: 1.1 },
      description: [
        'Example description for Castor b2. A gas giant orbiting well beyond the binary pair, largely unaffected by their mutual dance.',
        'Additional example description for Castor b2. Its ring system is tilted relative to the binary orbital plane.'
      ],
      stats: [
        ['Example stat 1', 'Example value 1'],
        ['Example stat 2', 'Example value 2']
      ],
      population: null,
      timeline: [
        { year: 10, title: 'Example event 1', desc: 'Example description.' }
      ],
      faction: 'faction-2'
    }
  ],
  asteroidBelts: [
    { inner: 26, outer: 29, count: 260, color: 0x8a7a65, tiltJitter: 0.16 }
  ],
  factions: [
    { id: 'faction-1', name: 'Faction 1', colorHex: '#bfe3ff', description: 'Example description for Faction 1.' },
    { id: 'faction-2', name: 'Faction 2', colorHex: '#ffb37a', description: 'Example description for Faction 2.' }
  ],
  tradeRoutes: [
    { from: 'castor-a', to: 'castor-b1', faction: 'faction-1', label: 'Example route 1' },
    { from: 'castor-b1', to: 'castor-b2', faction: 'faction-2', label: 'Example route 2' }
  ]
};
