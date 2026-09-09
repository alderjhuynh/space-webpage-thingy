const SYSTEM_SOL = {
  id: 'system-sol',
  name: 'Sol',
  description: 'The Solar System: the Sun and eight planets, dwarf planets, asteroid belt, Kuiper belt, and comets that comprise our home system. Distances and sizes are scaled for visibility; relative order, composition, and orbital periods reflect the real system.',
  position: { x: 2, y: 34, z: -6 },
  galaxyColorHex: '#ffdd55',
  star: {
    key: 'sol',
    name: 'Sun',
    type: 'G2V yellow dwarf',
    colorHex: '#ffdd55',
    color: 0xffdd55,
    description: [
      'The Sun is a G-type main-sequence star containing 99.86% of all mass in the Solar System. Its diameter is 1.39 million km and its core fuses about 600 million tonnes of hydrogen per second.',
      'Light from the Sun takes 8 minutes 19 seconds to reach Earth. The Sun is 4.6 billion years old and will remain on the main sequence for roughly another 5 billion years before becoming a red giant.'
    ],
    stats: [
      ['Diameter', '1,392,700 km'],
      ['Mass', '1.989 × 10³⁰ kg (333,000 M⊕)'],
      ['Surface temperature', '5,778 K'],
      ['Spectral class', 'G2V'],
      ['Age', '4.6 Gyr'],
      ['Rotation period', '~25 days at equator']
    ],
    population: null,
    timeline: [
      { year: -4600000000, title: 'Formation', desc: 'Sun forms from collapse of a molecular cloud.' },
      { year: -4500000000, title: 'Planets form', desc: 'Protoplanetary disk coalesces into planets and moons.' },
      { year: -3500000000, title: 'Earliest life on Earth', desc: 'First microbial life appears.' },
      { year: 1957, title: 'Space Age begins', desc: 'Sputnik 1 becomes the first artificial satellite.' },
      { year: 1969, title: 'Moon landing', desc: 'Apollo 11 lands the first humans on the Moon.' }
    ],
    faction: null
  },
  bodies: [
    {
      key: 'mercury',
      name: 'Mercury',
      type: 'rocky planet',
      colorHex: '#a9a9a9',
      color: 0xa9a9a9,
      orbitRadius: 11,
      orbitSpeed: 0.48,
      spinSpeed: 0.18,
      tilt: 0.03,
      size: 0.62,
      ring: false,
      hasAtmosphere: false,
      description: [
        'Mercury is the smallest planet and closest to the Sun, with an orbital period of 88 days. It is heavily cratered and has no substantial atmosphere; surface temperatures swing from 430 °C by day to −180 °C at night.',
        'Mercury has a large metallic core making up about 75% of its radius and a weak global magnetic field. It has no natural satellites. Two spacecraft have visited: Mariner 10 and MESSENGER.'
      ],
      stats: [
        ['Diameter', '4,879 km'],
        ['Mass', '3.30 × 10²³ kg (0.055 M⊕)'],
        ['Orbital period', '88 days'],
        ['Day length', '1,407.6 hours (59 Earth days)'],
        ['Distance from Sun', '0.39 AU'],
        ['Moons', '0']
      ],
      population: null,
      timeline: [
        { year: -4500000000, title: 'Formation', desc: 'Forms from the inner solar nebula with a large iron core.' },
        { year: 1974, title: 'Mariner 10 flybys', desc: 'First close observations reveal a cratered, Moon-like surface.' },
        { year: 2011, title: 'MESSENGER orbit', desc: 'Enters orbit and maps composition, confirming water ice in polar craters.' }
      ],
      faction: null
    },
    {
      key: 'venus',
      name: 'Venus',
      type: 'rocky planet',
      colorHex: '#e6c9a3',
      color: 0xe6c9a3,
      orbitRadius: 14.6,
      orbitSpeed: 0.35,
      spinSpeed: -0.12,
      tilt: 3.09,
      size: 1.02,
      ring: false,
      hasAtmosphere: true,
      atmosphereColor: '#f0d8a8',
      description: [
        'Venus is the second planet from the Sun, similar in size and structure to Earth but with a dense carbon-dioxide atmosphere producing a runaway greenhouse effect and surface pressure 92 times that of Earth.',
        'Surface temperature averages 467 °C, hot enough to melt lead. Venus rotates retrograde and very slowly; a day lasts 243 Earth days, longer than its 225-day year. It has no moons and is veiled by sulfuric acid clouds.'
      ],
      stats: [
        ['Diameter', '12,104 km'],
        ['Mass', '4.867 × 10²⁴ kg (0.815 M⊕)'],
        ['Orbital period', '225 days'],
        ['Day length', '5,832 hours (243 days, retrograde)'],
        ['Distance from Sun', '0.72 AU'],
        ['Surface pressure', '92 bar']
      ],
      population: null,
      timeline: [
        { year: -4500000000, title: 'Formation', desc: 'Forms as an Earth-sized rocky planet in the inner system.' },
        { year: 1962, title: 'Mariner 2', desc: 'First successful flyby confirms extreme surface temperatures.' },
        { year: 1990, title: 'Magellan mapping', desc: 'Radar mapping reveals volcanoes, lava plains, and 900 impact craters.' }
      ],
      faction: null
    },
    {
      key: 'earth',
      name: 'Earth',
      type: 'rocky planet · habitable',
      colorHex: '#4a8fe3',
      color: 0x4a8fe3,
      orbitRadius: 18.5,
      orbitSpeed: 0.30,
      spinSpeed: 1.0,
      tilt: 0.41,
      size: 1.05,
      ring: false,
      hasAtmosphere: true,
      atmosphereColor: '#6ea8ff',
      description: [
        'Earth is the third planet from the Sun and the only known world to harbor life. About 71% of its surface is covered by water, and its nitrogen-oxygen atmosphere protects life and regulates climate.',
        'Earth has one natural satellite, the Moon, which stabilizes its axial tilt and drives tides. Its magnetic field shields the surface from solar wind. Mean surface temperature is 15 °C.'
      ],
      stats: [
        ['Diameter', '12,742 km'],
        ['Mass', '5.97 × 10²⁴ kg'],
        ['Orbital period', '365.25 days'],
        ['Day length', '24 hours'],
        ['Distance from Sun', '1 AU (149.6 million km)'],
        ['Moons', '1 · Moon']
      ],
      population: { count: '8.0 billion', species: 'Human', governance: '195 sovereign states', notes: 'Only planet known to support life. Spacefaring since 1957.' },
      timeline: [
        { year: -4540000000, title: 'Formation', desc: 'Earth forms; Moon-forming impact shortly after.' },
        { year: -3500000000, title: 'First life', desc: 'Earliest evidence of microbial life.' },
        { year: 1957, title: 'First satellite', desc: 'Sputnik 1 launched.' },
        { year: 1969, title: 'Apollo 11', desc: 'First humans walk on another world.' },
        { year: 1998, title: 'ISS', desc: 'International Space Station assembly begins.' }
      ],
      faction: null,
      moon: { key: 'luna', name: 'Moon', colorHex: '#c2c2c2', color: 0xc2c2c2, size: 0.28, dist: 2.4, speed: 1.7 }
    },
    {
      key: 'mars',
      name: 'Mars',
      type: 'rocky planet',
      colorHex: '#c75a3a',
      color: 0xc75a3a,
      orbitRadius: 23.2,
      orbitSpeed: 0.24,
      spinSpeed: 0.98,
      tilt: 0.44,
      size: 0.72,
      ring: false,
      hasAtmosphere: true,
      atmosphereColor: '#ff9d6e',
      description: [
        'Mars is the fourth planet from the Sun, a cold desert world with a thin carbon-dioxide atmosphere. Its surface features the largest volcano in the Solar System, Olympus Mons, and the deepest canyon, Valles Marineris.',
        'Mars appears reddish due to iron oxide dust. It has two small captured-asteroid moons, Phobos and Deimos, and a 687-day year. Mean temperature is −63 °C. Liquid water cannot persist on the surface today, but evidence of ancient rivers and lakes is abundant.'
      ],
      stats: [
        ['Diameter', '6,779 km'],
        ['Mass', '6.39 × 10²³ kg (0.107 M⊕)'],
        ['Orbital period', '687 days (1.88 years)'],
        ['Day length', '24h 37m'],
        ['Distance from Sun', '1.52 AU'],
        ['Moons', '2 · Phobos, Deimos']
      ],
      population: null,
      timeline: [
        { year: -4500000000, title: 'Formation', desc: 'Forms in the inner system; early warm, wet period follows.' },
        { year: 1965, title: 'Mariner 4', desc: 'First close flyby reveals a cratered, arid surface.' },
        { year: 2012, title: 'Curiosity landing', desc: 'Rover confirms ancient habitable environments in Gale Crater.' },
        { year: 2021, title: 'Perseverance', desc: 'Lands in Jezero crater to cache samples for return.' }
      ],
      faction: null,
      moons: [
        { key: 'phobos', name: 'Phobos', colorHex: '#9b8f83', color: 0x9b8f83, size: 0.10, dist: 1.6, speed: 2.8 },
        { key: 'deimos', name: 'Deimos', colorHex: '#b5a89a', color: 0xb5a89a, size: 0.07, dist: 2.2, speed: 1.9 }
      ]
    },
    {
      key: 'jupiter',
      name: 'Jupiter',
      type: 'gas giant',
      colorHex: '#d8b88a',
      color: 0xd8b88a,
      orbitRadius: 31,
      orbitSpeed: 0.13,
      spinSpeed: 1.8,
      tilt: 0.05,
      size: 2.9,
      ring: false,
      hasAtmosphere: true,
      atmosphereColor: '#e8d0a0',
      description: [
        'Jupiter is the fifth planet and the largest in the Solar System, more than twice as massive as all other planets combined. It is a hydrogen-helium gas giant with a prominent banded atmosphere and the long-lived Great Red Spot storm larger than Earth.',
        'Jupiter has a faint ring system and 95 known moons, including the four large Galileans: Io, Europa, Ganymede, and Callisto. Its strong magnetic field drives intense radiation belts.'
      ],
      stats: [
        ['Diameter', '139,820 km'],
        ['Mass', '1.898 × 10²⁷ kg (317.8 M⊕)'],
        ['Orbital period', '11.86 years'],
        ['Day length', '9.93 hours'],
        ['Distance from Sun', '5.20 AU'],
        ['Moons', '95 known']
      ],
      population: null,
      timeline: [
        { year: -4500000000, title: 'Formation', desc: 'Forms beyond the ice line, accreting gas from the nebula.' },
        { year: 1610, title: 'Galilean moons discovered', desc: 'Galileo Galilei observes the four largest moons.' },
        { year: 1979, title: 'Voyager flybys', desc: 'Voyagers reveal ring system, storms, and volcanic Io.' },
        { year: 2016, title: 'Juno orbit', desc: 'Polar orbiter studies interior, magnetic field, and aurorae.' }
      ],
      faction: null,
      moons: [
        { key: 'io', name: 'Io', colorHex: '#f0e0a0', color: 0xf0e0a0, size: 0.22, dist: 3.9, speed: 1.6 },
        { key: 'europa', name: 'Europa', colorHex: '#d8e8f0', color: 0xd8e8f0, size: 0.20, dist: 4.7, speed: 1.15 },
        { key: 'ganymede', name: 'Ganymede', colorHex: '#a8a0a0', color: 0xa8a0a0, size: 0.32, dist: 5.6, speed: 0.85 },
        { key: 'callisto', name: 'Callisto', colorHex: '#8a8a8a', color: 0x8a8a8a, size: 0.29, dist: 6.5, speed: 0.62 }
      ]
    },
    {
      key: 'saturn',
      name: 'Saturn',
      type: 'gas giant · ringed',
      colorHex: '#e6d5a0',
      color: 0xe6d5a0,
      orbitRadius: 39.5,
      orbitSpeed: 0.097,
      spinSpeed: 1.7,
      tilt: 0.47,
      size: 2.5,
      ring: true,
      hasAtmosphere: true,
      atmosphereColor: '#f0e0b0',
      description: [
        'Saturn is the sixth planet from the Sun, renowned for its extensive ring system composed of ice and rock particles ranging from microns to meters. It is a hydrogen-helium gas giant less dense than water.',
        'Saturn has 146 confirmed moons; Titan is larger than Mercury and has a thick atmosphere and liquid methane lakes, while Enceladus ejects water plumes from a subsurface ocean.'
      ],
      stats: [
        ['Diameter', '116,460 km'],
        ['Mass', '5.683 × 10²⁶ kg (95.2 M⊕)'],
        ['Orbital period', '29.46 years'],
        ['Day length', '10.7 hours'],
        ['Distance from Sun', '9.58 AU'],
        ['Moons', '146 known']
      ],
      population: null,
      timeline: [
        { year: -4500000000, title: 'Formation', desc: 'Forms as a gas giant; rings may be primordial or from a disrupted moon.' },
        { year: 1655, title: 'Titan discovered', desc: 'Christiaan Huygens discovers Saturn’s largest moon.' },
        { year: 1980, title: 'Voyager encounters', desc: 'Detailed imaging of rings and moons.' },
        { year: 2004, title: 'Cassini-Huygens', desc: '13-year orbital mission; Huygens lands on Titan.' }
      ],
      faction: null,
      moons: [
        { key: 'titan', name: 'Titan', colorHex: '#d8b48a', color: 0xd8b48a, size: 0.31, dist: 5.2, speed: 0.9 },
        { key: 'enceladus', name: 'Enceladus', colorHex: '#e8f4ff', color: 0xe8f4ff, size: 0.12, dist: 4.0, speed: 1.3 },
        { key: 'mimas', name: 'Mimas', colorHex: '#c8c8c8', color: 0xc8c8c8, size: 0.08, dist: 3.4, speed: 1.55 }
      ]
    },
    {
      key: 'uranus',
      name: 'Uranus',
      type: 'ice giant',
      colorHex: '#7ec8e3',
      color: 0x7ec8e3,
      orbitRadius: 49,
      orbitSpeed: 0.068,
      spinSpeed: -1.2,
      tilt: 1.71,
      size: 1.95,
      ring: true,
      hasAtmosphere: true,
      atmosphereColor: '#8ad4f0',
      description: [
        'Uranus is the seventh planet, an ice giant composed of water, ammonia, and methane ices surrounding a rocky core. Its blue-green color comes from atmospheric methane absorbing red light.',
        'Uranus is tilted 98 degrees, likely from a giant impact, causing extreme seasons. It has a faint ring system and 28 known moons, with five major ones: Miranda, Ariel, Umbriel, Titania, and Oberon. Only Voyager 2 has visited.'
      ],
      stats: [
        ['Diameter', '50,724 km'],
        ['Mass', '8.681 × 10²⁵ kg (14.5 M⊕)'],
        ['Orbital period', '84 years'],
        ['Day length', '17.2 hours (retrograde)'],
        ['Distance from Sun', '19.2 AU'],
        ['Moons', '28 known']
      ],
      population: null,
      timeline: [
        { year: -4500000000, title: 'Formation', desc: 'Forms as an ice giant beyond Saturn.' },
        { year: 1781, title: 'Discovery', desc: 'William Herschel discovers Uranus, first planet found with a telescope.' },
        { year: 1986, title: 'Voyager 2 flyby', desc: 'Only close encounter reveals rings, magnetic field, and moons.' }
      ],
      faction: null,
      moons: [
        { key: 'titania', name: 'Titania', colorHex: '#b8c0c8', color: 0xb8c0c8, size: 0.14, dist: 3.6, speed: 1.0 },
        { key: 'oberon', name: 'Oberon', colorHex: '#a8b0b8', color: 0xa8b0b8, size: 0.13, dist: 4.3, speed: 0.82 }
      ]
    },
    {
      key: 'neptune',
      name: 'Neptune',
      type: 'ice giant',
      colorHex: '#3a5fcd',
      color: 0x3a5fcd,
      orbitRadius: 58,
      orbitSpeed: 0.054,
      spinSpeed: 1.1,
      tilt: 0.49,
      size: 1.90,
      ring: true,
      hasAtmosphere: true,
      atmosphereColor: '#5f8eff',
      description: [
        'Neptune is the eighth and outermost planet, a deep-blue ice giant with the strongest winds in the Solar System reaching 2,000 km/h. Its color is due to methane and an unknown chromophore.',
        'Neptune has a faint ring system and 16 known moons, the largest being Triton, a captured Kuiper belt object that orbits retrograde and has nitrogen geysers. Only Voyager 2 has flown past Neptune.'
      ],
      stats: [
        ['Diameter', '49,244 km'],
        ['Mass', '1.024 × 10²⁶ kg (17.1 M⊕)'],
        ['Orbital period', '164.8 years'],
        ['Day length', '16.1 hours'],
        ['Distance from Sun', '30.07 AU'],
        ['Moons', '16 known']
      ],
      population: null,
      timeline: [
        { year: -4500000000, title: 'Formation', desc: 'Forms as the outermost ice giant.' },
        { year: 1846, title: 'Discovery', desc: 'Predicted mathematically and observed by Johann Galle.' },
        { year: 1989, title: 'Voyager 2 flyby', desc: 'Discovers Great Dark Spot and completes grand tour of outer planets.' },
        { year: 2011, title: 'First orbit completed', desc: 'Neptune completes one orbit since discovery.' }
      ],
      faction: null,
      moons: [
        { key: 'triton', name: 'Triton', colorHex: '#d8a0a0', color: 0xd8a0a0, size: 0.22, dist: 3.8, speed: 1.25 }
      ]
    }
  ],
  asteroidBelts: [
    { inner: 25.5, outer: 28.5, count: 520, color: 0x8a7a65, tiltJitter: 0.16 },
    { inner: 62, outer: 70, count: 380, color: 0x6a7a8a, tiltJitter: 0.22 }
  ],
  comet: {
    key: 'halley',
    name: "Halley's Comet",
    colorHex: '#c8d7ff',
    size: 0.18,
    orbitRadius: 42,
    eccentricity: 0.71,
    tilt: 0.52,
    periodSpeed: 0.032,
    tailColor: '#a8c8ff'
  },
  factions: [],
  tradeRoutes: []
};
