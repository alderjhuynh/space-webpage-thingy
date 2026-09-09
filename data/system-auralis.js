const SYSTEM_AURALIS = {
  id: 'system-2',
  name: 'System 2',
  description: 'Example description for System 2.',
  position: { x: 44, y: -8, z: 18 },
  galaxyColorHex: '#7af0c8',
  star: {
    key: 'star-2',
    name: 'Star 2',
    type: 'Example star type',
    colorHex: '#7af0c8',
    color: 0x7af0c8,
    description: [
      'Example description for Star 2.',
      'Additional example description for Star 2.'
    ],
    stats: [
      ['Example stat 1', 'Example value 1'],
      ['Example stat 2', 'Example value 2'],
      ['Example stat 3', 'Example value 3']
    ],
    population: null,
    timeline: [
      { year: 10, title: 'Example event 1', desc: 'Example description for event 1.' },
      { year: 20, title: 'Example event 2', desc: 'Example description for event 2.' }
    ],
    faction: null
  },
  bodies: [
    {
      key: 'planet-4',
      name: 'Planet 4',
      type: 'Example planet type 4',
      colorHex: '#e8a94f',
      color: 0xe8a94f,
      orbitRadius: 18,
      orbitSpeed: 0.30,
      spinSpeed: 0.75,
      tilt: 0.28,
      size: 1.6,
      hasAtmosphere: false,
      description: [
        'Example description for Planet 4.',
        'Additional example description for Planet 4.'
      ],
      stats: [['Example stat 1', 'Example value 1'], ['Example stat 2', 'Example value 2']],
      population: { count: 'Example count', species: 'Example species', governance: 'Example governance', notes: 'Example notes.' },
      timeline: [
        { year: 10, title: 'Example event 1', desc: 'Example description.' },
        { year: 20, title: 'Example event 2', desc: 'Example description.' }
      ],
      faction: 'faction-5'
    },
    {
      key: 'planet-5',
      name: 'Planet 5',
      type: 'Example planet type 5',
      colorHex: '#4d8ceb',
      color: 0x4d8ceb,
      orbitRadius: 29,
      orbitSpeed: 0.18,
      spinSpeed: 0.5,
      tilt: 0.06,
      size: 2.2,
      hasAtmosphere: true,
      atmosphereColor: '#5fb8ff',
      moons: [
        { key: 'moon-2', name: 'Moon 2', colorHex: '#b8c7ff', color: 0xb8c7ff, size: 0.38, dist: 3.1, speed: 1.6 },
        { key: 'moon-3', name: 'Moon 3', colorHex: '#8f9bb5', color: 0x8f9bb5, size: 0.32, dist: 4.2, speed: 1.1 }
      ],
      description: [
        'Example description for Planet 5.',
        'Additional example description for Planet 5.'
      ],
      stats: [['Example stat 1', 'Example value 1'], ['Example stat 2', 'Example value 2']],
      population: { count: 'Example count', species: 'Example species', governance: 'Example governance', notes: 'Example notes.' },
      timeline: [
        { year: 10, title: 'Example event 1', desc: 'Example description.' },
        { year: 20, title: 'Example event 2', desc: 'Example description.' }
      ],
      faction: 'faction-6'
    },
    {
      key: 'planet-6',
      name: 'Planet 6',
      type: 'Example planet type 6',
      colorHex: '#c2826a',
      color: 0xc2826a,
      orbitRadius: 42,
      orbitSpeed: 0.09,
      spinSpeed: 0.35,
      tilt: 0.18,
      size: 2.7,
      ring: true,
      hasAtmosphere: true,
      atmosphereColor: '#ff9d6e',
      description: [
        'Example description for Planet 6.',
        'Additional example description for Planet 6.'
      ],
      stats: [['Example stat 1', 'Example value 1'], ['Example stat 2', 'Example value 2']],
      population: { count: 'Example count', species: 'Example species', governance: 'Example governance', notes: 'Example notes.' },
      timeline: [
        { year: 10, title: 'Example event 1', desc: 'Example description.' },
        { year: 20, title: 'Example event 2', desc: 'Example description.' }
      ],
      faction: 'faction-7'
    }
  ],
  asteroidBelts: [
    { inner: 34, outer: 38, count: 320, color: 0x7a7a8a, tiltJitter: 0.22 }
  ],
  comet: {
    key: 'comet-2',
    name: 'Comet 2',
    colorHex: '#d8f0ff',
    size: 0.30,
    orbitRadius: 56,
    eccentricity: 0.58,
    tilt: -0.32,
    periodSpeed: 0.038,
    tailColor: '#b8e0ff'
  },
  factions: [
    { id: 'faction-5', name: 'Faction 5', colorHex: '#e8a94f', description: 'Example description for Faction 5.' },
    { id: 'faction-6', name: 'Faction 6', colorHex: '#4d8ceb', description: 'Example description for Faction 6.' },
    { id: 'faction-7', name: 'Faction 7', colorHex: '#c2826a', description: 'Example description for Faction 7.' }
  ],
  tradeRoutes: [
    { from: 'star-2', to: 'planet-5', faction: 'faction-6', label: 'Example route 4' },
    { from: 'planet-5', to: 'planet-6', faction: 'faction-7', label: 'Example route 5' }
  ]
};
