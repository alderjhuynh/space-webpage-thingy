const BLACKHOLE_EREBOS = {
  id: 'blackhole-erebos',
  name: 'Erebos',
  description: 'Example description for the Erebos region. This isolated supermassive black hole shapes nearby stellar orbits and lenses light from stars behind it.',
  position: { x: -18, y: 28, z: 22 },
  colorHex: '#06070d',
  glowColorHex: '#9b81e8',
  diskColorHex: '#ff6a3d',
  outerDiskColorHex: '#6a3fb8',
  blackHole: {
    key: 'erebos',
    name: 'Erebos',
    type: 'Supermassive black hole',
    colorHex: '#06070d',
    color: 0x06070d,
    diskColorHex: '#ff6a3d',
    description: [
      'Example description for Erebos. Erebos is a supermassive black hole containing the mass of several million suns within an event horizon where gravity prevents light from escaping.',
      'Additional example description for Erebos. A hot accretion disk orbits the horizon and emits intense radiation. Background starlight bends around the hole and forms a bright photon ring. Any matter that crosses the horizon cannot return.'
    ],
    stats: [
      ['Mass', 'Example value of 3.8 million solar masses'],
      ['Event horizon', 'Example value of 22 million km diameter'],
      ['Spin parameter', 'Example value 0.82'],
      ['Accretion luminosity', 'Example value 140 percent Eddington'],
      ['Distance from Sol', 'Example value 8.2 kiloparsecs'],
      ['Photon ring radius', 'Example value 1.5 times horizon']
    ],
    population: null,
    timeline: [
      { year: -5000000000, title: 'Example event 1', desc: 'Example description for early formation from direct collapse of a massive gas cloud.' },
      { year: -200000000, title: 'Example event 2', desc: 'Example description for merger with a smaller black hole that set the present spin.' },
      { year: 2026, title: 'Example event 3', desc: 'Example description for remote observation that mapped the photon ring with interferometry.' }
    ],
    faction: null
  },
  disk: { inner: 4.8, outer: 9.2, tilt: 0.55, rotationSpeed: 0.52 },
  lensingStars: [
    { key: 'erebos-lens-1', offset: { x: 14, y: 2, z: -6 }, colorHex: '#d8c7ff', size: 0.18 },
    { key: 'erebos-lens-2', offset: { x: -11, y: -3, z: 9 }, colorHex: '#ffddaa', size: 0.14 }
  ]
};
