const SYSTEM_HELION = {
  id: 'system-1',
  name: 'System 1',
  description: 'Example description for System 1.',
  position: { x: -34, y: 6, z: -12 },
  galaxyColorHex: '#f2b25c',
  star: {
    key: 'star-1',
    name: 'Star 1',
    type: 'Example star type',
    colorHex: '#f2b25c',
    color: 0xf2b25c,
    description: [
      'Example description for Star 1.',
      'Additional example description for Star 1.'
    ],
    stats: [
      ['Example stat 1', 'Example value 1'],
      ['Example stat 2', 'Example value 2'],
      ['Example stat 3', 'Example value 3']
    ],
    population: null,
    timeline: [
      { year: -1000, title: 'Example event 1', desc: 'Example description for event 1.' },
      { year: 0, title: 'Example event 2', desc: 'Example description for event 2.' },
      { year: 100, title: 'Example event 3', desc: 'Example description for event 3.' }
    ],
    faction: null
  },
  bodies: [
    {
      key: 'planet-1',
      name: 'Planet 1',
      type: 'Example planet type 1',
      colorHex: '#5d7ce0',
      color: 0x5d7ce0,
      orbitRadius: 16,
      orbitSpeed: 0.34,
      spinSpeed: 0.6,
      tilt: 0.12,
      size: 1.35,
      ring: false,
      hasAtmosphere: true,
      atmosphereColor: '#6ea8ff',
      description: [
        'Example description for Planet 1.',
        'Additional example description for Planet 1.'
      ],
      stats: [['Example stat 1', 'Example value 1'], ['Example stat 2', 'Example value 2']],
      population: { count: 'Example count', species: 'Example species', governance: 'Example governance', notes: 'Example notes.' },
      timeline: [
        { year: 10, title: 'Example event 1', desc: 'Example description.' },
        { year: 20, title: 'Example event 2', desc: 'Example description.' },
        { year: 30, title: 'Example event 3', desc: 'Example description.' }
      ],
      faction: 'faction-1',
      ring: false
    },
    {
      key: 'planet-2',
      name: 'Planet 2',
      type: 'Example planet type 2',
      colorHex: '#d1453a',
      color: 0xd1453a,
      orbitRadius: 27,
      orbitSpeed: 0.19,
      spinSpeed: 0.9,
      tilt: -0.09,
      size: 1.9,
      hasAtmosphere: true,
      atmosphereColor: '#ff7a5c',
      moon: { key: 'moon-1', name: 'Moon 1', colorHex: '#9b968f', color: 0x9b968f, size: 0.42, dist: 3.4, speed: 1.4 },
      description: [
        'Example description for Planet 2.',
        'Additional example description for Planet 2.'
      ],
      stats: [['Example stat 1', 'Example value 1'], ['Example stat 2', 'Example value 2']],
      population: { count: 'Example count', species: 'Example species', governance: 'Example governance', notes: 'Example notes.' },
      timeline: [
        { year: 10, title: 'Example event 1', desc: 'Example description.' },
        { year: 20, title: 'Example event 2', desc: 'Example description.' },
        { year: 30, title: 'Example event 3', desc: 'Example description.' }
      ],
      faction: 'faction-2'
    },
    {
      key: 'planet-3',
      name: 'Planet 3',
      type: 'Example planet type 3',
      colorHex: '#45b8a4',
      color: 0x45b8a4,
      orbitRadius: 40,
      orbitSpeed: 0.10,
      spinSpeed: 0.4,
      tilt: 0.32,
      size: 3.0,
      ring: true,
      hasAtmosphere: true,
      atmosphereColor: '#45e8c8',
      description: [
        'Example description for Planet 3.',
        'Additional example description for Planet 3.'
      ],
      stats: [['Example stat 1', 'Example value 1'], ['Example stat 2', 'Example value 2']],
      population: { count: 'Example count', species: 'Example species', governance: 'Example governance', notes: 'Example notes.' },
      timeline: [
        { year: 10, title: 'Example event 1', desc: 'Example description.' },
        { year: 20, title: 'Example event 2', desc: 'Example description.' },
        { year: 30, title: 'Example event 3', desc: 'Example description.' }
      ],
      faction: 'faction-3'
    }
  ],
  asteroidBelts: [
    { inner: 32, outer: 36, count: 420, color: 0x8a7a65, tiltJitter: 0.18 }
  ],
  comet: {
    key: 'comet-1',
    name: 'Comet 1',
    colorHex: '#c8d7ff',
    size: 0.28,
    orbitRadius: 52,
    eccentricity: 0.62,
    tilt: 0.45,
    periodSpeed: 0.045,
    tailColor: '#a8c8ff'
  },
  factions: [
    { id: 'faction-1', name: 'Faction 1', colorHex: '#9b81e8', description: 'Example description for Faction 1.' },
    { id: 'faction-2', name: 'Faction 2', colorHex: '#d1453a', description: 'Example description for Faction 2.' },
    { id: 'faction-3', name: 'Faction 3', colorHex: '#45b8a4', description: 'Example description for Faction 3.' },
    { id: 'faction-4', name: 'Faction 4', colorHex: '#e8c85c', description: 'Example description for Faction 4.' }
  ],
  tradeRoutes: [
    { from: 'star-1', to: 'planet-1', faction: 'faction-1', label: 'Example route 1' },
    { from: 'planet-2', to: 'planet-3', faction: 'faction-2', label: 'Example route 2' },
    { from: 'planet-1', to: 'planet-2', faction: 'faction-4', label: 'Example route 3' }
  ]
};
