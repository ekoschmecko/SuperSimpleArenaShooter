// Sound profiles and music settings, independent of weapon balance.
export const AUDIO = {
  maxVoices: 48,
  reservedPlayerVoices: 16,
  weapons: {
    rifle: { crack: .055, body: .12, tail: .19, level: .27, low: 145, high: 5400, bolt: .045 },
    shotgun: { crack: .08, body: .24, tail: .38, level: .39, low: 92, high: 3800, bolt: .32 },
    sniper: { crack: .045, body: .27, tail: .52, level: .36, low: 110, high: 6800, bolt: .42 },
    rocket: { crack: .10, body: .34, tail: .46, level: .28, low: 65, high: 1600, bolt: .12 },
  },
};

export const MUSIC = {
  volume: .18,
  maxVoices: 64,
  themes: {
    depot: {
      bpm: 144, tone: 'sawtooth', cutoff: 1800, lead: 'triangle',
      progressions: [[38, 38, 41, 36], [38, 43, 41, 36], [38, 36, 34, 41]],
      riffs: [[0, null, 0, 0, 12, null, 0, 3, 0, null, 0, 7, 5, 3, 0, null], [0, 0, null, 7, 0, null, 3, 0, 12, null, 0, 5, 3, 0, 7, null]],
      kick: [0, 3, 6, 8, 10], snare: [4, 12],
    },
    canyon: {
      bpm: 132, tone: 'triangle', cutoff: 1100, lead: 'sawtooth',
      progressions: [[40, 43, 45, 38], [40, 38, 43, 47], [40, 45, 43, 38]],
      riffs: [[0, null, 7, null, 0, 3, null, 5, 0, null, 10, 7, null, 5, 3, null], [0, null, 3, 5, null, 7, 0, null, 10, 7, null, 5, 3, null, 0, 7]],
      kick: [0, 5, 8, 11, 14], snare: [4, 12],
    },
    foundry: {
      bpm: 156, tone: 'square', cutoff: 2500, lead: 'square',
      progressions: [[36, 39, 34, 41], [36, 34, 39, 43], [36, 41, 39, 34]],
      riffs: [[0, 12, null, 0, 7, 12, 0, null, 3, 12, 0, 7, null, 12, 0, 3], [0, 7, 12, null, 0, 3, 12, 7, 0, null, 12, 3, 7, 0, 12, null]],
      kick: [0, 4, 8, 12], snare: [4, 12],
    },
  },
};
