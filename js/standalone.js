// Automatisch erzeugt mit npm run build:local. Nicht direkt bearbeiten.

(async () => {

const config = (() => {
const WEAPONS = {
  sniper: {
    name: "SNIPER RIFLE",
    key: 5,
    damage: 115,
    size: 5,
    delay: 1.05,
    reload: 2.3,
    spread: .002,
    color: 0xfff1bd
  },
  rifle: {
    name: "ASSAULT RIFLE",
    key: 1,
    damage: 26,
    size: 32,
    delay: .095,
    reload: 1.3,
    spread: .008,
    color: 0xffe1a1
  },
  shotgun: {
    name: "SHOTGUN",
    key: 2,
    damage: 17,
    pellets: 8,
    size: 8,
    delay: .64,
    reload: 1.8,
    spread: .075,
    color: 0xffb45b
  },
  plasma: {
    name: "PLASMA RIFLE",
    key: 3,
    damage: 20,
    size: 50,
    delay: .065,
    reload: 1.65,
    spread: .012,
    color: 0x55f7ff
  },
  rocket: {
    name: "ROCKET LAUNCHER",
    key: 4,
    damage: 155,
    size: 4,
    delay: .72,
    reload: 2.1,
    spread: 0,
    color: 0xff733d
  }
};

const weaponOrder = ["rifle", "shotgun", "plasma", "rocket", "sniper"];

const ENEMY_TYPES = {
  runner: {
    name: "BLADE RUNNER",
    hp: 85,
    speed: 7.2,
    color: 0x983e38,
    range: 1.6,
    interval: .9,
    points: 110
  },
  soldier: {
    name: "ASH GUNNER",
    hp: 105,
    speed: 2.3,
    color: 0x637b43,
    range: 10,
    interval: 1.65,
    points: 140
  },
  heavy: {
    name: "IRON MAW",
    hp: 310,
    speed: 1.25,
    color: 0x67617d,
    range: 13,
    interval: 2.5,
    points: 280
  },
  orbiter: {
    name: "VOID WEAVER",
    hp: 130,
    speed: 2.8,
    color: 0x377e87,
    range: 12,
    interval: 1.9,
    points: 180
  }
};

const MAPS = {
  depot: {
    name: "Highrise Depot",
    sky: 0xc4c5bb,
    boss: "SCRAP KING",
    spawnZ: 20
  },
  canyon: {
    name: "Red Canyon",
    sky: 0xdcb698,
    boss: "DUNE REAPER",
    spawnZ: 36
  },
  foundry: {
    name: "Neon Foundry",
    sky: 0x101625,
    boss: "FURNACE LORD",
    spawnZ: 36
  }
};

const GRAVITY = 22;

const JUMP_SPEED = 8.5;

const ARENA = 48;

const PLAYER_RADIUS = .45;

const MOVE_SPEED = 10.2;

// Overhealth grants a steady boost; losing it returns to the normal pace.
const OVERHEALTH_SPEED_MULTIPLIER = 1.15;

const ACCEL = 20;

const FRICTION = 15;

// Enemy loot: normal kills roll once; bosses always award a helicopter.
const LOOT = {
  chance: .30,
  types: ['health', 'health', 'ammo', 'ammo', 'shield', 'rapid', 'rocket', 'dash', 'dash', 'grenade', 'grenade'],
};

return { WEAPONS, weaponOrder, ENEMY_TYPES, MAPS, GRAVITY, JUMP_SPEED, ARENA, PLAYER_RADIUS, MOVE_SPEED, OVERHEALTH_SPEED_MULTIPLIER, ACCEL, FRICTION, LOOT };
})();

// Sound profiles and music settings, independent of weapon balance.
const AUDIO = {
  maxVoices: 48,
  reservedPlayerVoices: 16,
  weapons: {
    rifle: { crack: .055, body: .12, tail: .19, level: .27, low: 145, high: 5400, bolt: .045 },
    shotgun: { crack: .08, body: .24, tail: .38, level: .39, low: 92, high: 3800, bolt: .32 },
    sniper: { crack: .045, body: .27, tail: .52, level: .36, low: 110, high: 6800, bolt: .42 },
    rocket: { crack: .10, body: .34, tail: .46, level: .28, low: 65, high: 1600, bolt: .12 },
  },
};

const MUSIC = {
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


// Quelle: js/state.js
// Gemeinsamer Laufzeitzustand; pro Spielinstanz neu angelegt.
function createState(THREE, config) {
  const state = {};
  state.scene = undefined;
  state.camera = undefined;
  state.renderer = undefined;
  state.weaponGroup = undefined;
  state.rifle = undefined;
  state.rocketLauncher = undefined;
  state.playerBody = undefined;
  state.enemies = [];
  state.projectiles = [];
  state.powerups = [];
  state.keys = {};
  state.yaw = 0;
  state.pitch = 0;
  state.hp = 100;
  state.maxHp = 200;
  state.score = 0;
  state.wave = 1;
  state.scoped = false;
  state.hitMarkerTimer = 0;
  state.glowTexture = null;
  state.magazines = Object.fromEntries(Object.entries(config.WEAPONS).map(([k, w]) => [k, w.size]));
  state.weaponModels = {};
  state.reloadWeapon = null;
  state.feetY = 0;
  state.jumpVelocity = 0;
  state.grounded = true;
  state.jumpsUsed = 0;
  state.damageFlash = 0;
  state.nextWaveTimer = 0;
  state.cooldown = 0;
  state.reloadTimer = 0;
  state.shieldTimer = 0;
  state.rocketTimer = 0;
  state.rapidTimer = 0;
  state.currentWeapon = "rifle";
  state.gameOver = false;
  state.status = "ready";
  state.firing = false;
  state.effects = [];
  state.simTime = 0;
  state.navTarget = "";
  state.navRefresh = 0;
  state.navDistances = new Map();
  state.touchMode = matchMedia("(pointer: coarse)").matches;
  state.touchMove = {
    x: 0,
    y: 0
  };
  state.uiCache = new Map();
  state.last = performance.now();
  state.velocity = new THREE.Vector3();
  state.obstacles = [];
  state.heliPiloting = false;
  state.pilotReturn = null;
  state.heliManualCooldown = 0;
  state.activeMap = "depot";
  state.builtMap = null;
  state.environmentObjects = [];
  state.helicopter = null;
  state.heliTimer = 0;
  state.heliShot = 0;
  state.heliAudio = 0;
  state.reloadDuration = 1.3;
  state.sound = {
    ctx: null,
    master: null,
    output: null,
    noise: null,
    enabled: true,
    volume: .35,
    voices: 0,
    last: new Map()
  };
  return state;
}


// Quelle: js/dom.js
// Referenzen auf die Oberfläche der index.html.
function createDOM() {
  return {
    game: document.getElementById("game"),
    hpEl: document.getElementById("hp"),
    healthBar: document.getElementById("healthBar"),
    scoreEl: document.getElementById("score"),
    waveEl: document.getElementById("wave"),
    reloadHint: document.getElementById("reloadHint"),
    reloadWrap: document.getElementById("reloadWrap"),
    reloadFill: document.getElementById("reloadFill"),
    start: document.getElementById("start"),
    startBtn: document.getElementById("startBtn"),
    chipShield: document.getElementById("chipShield"),
    chipRocket: document.getElementById("chipRocket"),
    chipRapid: document.getElementById("chipRapid"),
  };
}


// Quelle: js/audio.js

// Schussgeräusche aus Knall, Druck, kurzem Raumklang und Verschlussmechanik.
function createAudio({ THREE, state, config, dom, api }) {
  let voiceLimit = AUDIO.maxVoices;
  function refreshSoundUI() {
    const button = document.getElementById("muteBtn");
    button.textContent = state.sound.enabled ? "Sound: on" : "Sound: off";
    button.setAttribute("aria-pressed", String(!state.sound.enabled));
    document.getElementById("soundVolume").value = Math.round(state.sound.volume * 100);
    document.getElementById("soundValue").textContent = Math.round(state.sound.volume * 100) + "%";
    if (state.sound.master) state.sound.master.gain.setTargetAtTime(state.sound.enabled ? state.sound.volume : 0, state.sound.ctx.currentTime, .025);
    api.updateMusic();
  }

  function initSound() {
    try {
      if (!state.sound.ctx) {
        const Audio = globalThis.AudioContext || globalThis.webkitAudioContext;
        if (!Audio) return;
        const ctx = new Audio();
        state.sound.ctx = ctx;
        state.sound.master = ctx.createGain();
        state.sound.master.gain.value = state.sound.enabled ? state.sound.volume : 0;
        const limiter = ctx.createDynamicsCompressor();
        limiter.threshold.value = -15;
        limiter.knee.value = 12;
        limiter.ratio.value = 8;
        limiter.attack.value = .003;
        limiter.release.value = .15;
        state.sound.master.connect(limiter);
        limiter.connect(ctx.destination);
        // Music gets its own compressor so enemy fire cannot suppress it.
        state.sound.output = ctx.destination;
        state.sound.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const samples = state.sound.noise.getChannelData(0);
        for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
        api.initMusic();
      }
      if (state.sound.ctx.state === "suspended") state.sound.ctx.resume().catch(() => {});
    } catch (error) {/* Audio is optional; gameplay remains available. */}
  }

  function tone(freq, end, duration, level = .12, type = "sine", delay = 0) {
    if (!state.sound.ctx || state.sound.ctx.state !== "running" || !state.sound.enabled || state.sound.volume === 0 || state.sound.voices >= voiceLimit) return;
    const ctx = state.sound.ctx,
      t = ctx.currentTime + delay,
      osc = ctx.createOscillator(),
      gain = ctx.createGain();
    state.sound.voices++;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, end), t + duration);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(level * (state.sound.effectGain ?? 1), t + .004);
    gain.gain.exponentialRampToValueAtTime(.0001, t + duration);
    osc.connect(gain);
    gain.connect(state.sound.master);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
      state.sound.voices--;
    };
    osc.start(t);
    osc.stop(t + duration + .015);
  }

  function noiseBurst(duration, level = .15, frequency = 1200) {
    if (!state.sound.ctx || state.sound.ctx.state !== "running" || !state.sound.noise || !state.sound.enabled || state.sound.volume === 0 || state.sound.voices >= voiceLimit) return;
    const ctx = state.sound.ctx,
      t = ctx.currentTime,
      src = ctx.createBufferSource(),
      filter = ctx.createBiquadFilter(),
      gain = ctx.createGain();
    state.sound.voices++;
    src.buffer = state.sound.noise;
    filter.type = "lowpass";
    filter.frequency.value = frequency;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(level * (state.sound.effectGain ?? 1), t + .003);
    gain.gain.exponentialRampToValueAtTime(.0001, t + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(state.sound.master);
    src.onended = () => {
      src.disconnect();
      filter.disconnect();
      gain.disconnect();
      state.sound.voices--;
    };
    src.start(t);
    src.stop(t + duration + .015);
  }

  function shotNoise(duration, level, frequency, delay = 0, type = 'lowpass') {
    const sound = state.sound;
    if (!sound.ctx || sound.ctx.state !== 'running' || !sound.enabled || sound.volume === 0 || sound.voices >= voiceLimit) return;
    const ctx = sound.ctx;
    const time = ctx.currentTime + delay;
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    source.buffer = sound.noise;
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = type === 'bandpass' ? .8 : .5;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(level * (sound.effectGain ?? 1), time + .001);
    gain.gain.exponentialRampToValueAtTime(.0001, time + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(sound.master);
    sound.voices++;
    source.onended = () => {
      source.disconnect(); filter.disconnect(); gain.disconnect(); sound.voices--;
    };
    // Slightly different slice of the noise buffer on each shot.
    source.start(time, Math.random() * .35);
    source.stop(time + duration + .015);
  }

  function weaponSound(name) {
    const profile = AUDIO.weapons[name];
    const variation = .94 + Math.random() * .12;
    shotNoise(profile.crack, profile.level, profile.high * variation, 0, 'highpass');
    shotNoise(profile.body, profile.level * .8, profile.high * .38 * variation);
    tone(profile.low * variation, 30, profile.body, profile.level * .65, 'triangle');
    shotNoise(profile.tail, profile.level * .18, 1100, .045);
    shotNoise(.035, .055, 2800, profile.bolt, 'bandpass');
    if (name === 'shotgun' || name === 'sniper') shotNoise(.045, .045, 1900, profile.bolt + .09, 'bandpass');
  }

  function sfx(name) {
    if (!state.sound.ctx || state.sound.ctx.state !== "running" || !state.sound.enabled) return;
    const now = state.sound.ctx.currentTime,
      minGap = name === "headshot" ? .09 : name === "hit" ? .055 : name === "hurt" ? .16 : name === "explosion" ? .08 : name.startsWith("enemy") ? .13 : 0;
    if (now - (state.sound.last.get(name) ?? -10) < minGap) return;
    state.sound.last.set(name, now);
    if (AUDIO.weapons[name]) {
      weaponSound(name);
      return;
    }
    switch (name) {
      case "helicopter":
        tone(48, 45, .35, .06, "triangle");
        noiseBurst(.16, .025, 250);
        break;
      case "enemyShot":
        noiseBurst(.12, .19, 1700);
        tone(155, 60, .12, .11, "triangle");
        break;
      case "enemyPain":
        tone(135, 75, .16, .10, "sawtooth");
        break;
      case "enemyDeath":
        tone(110, 38, .3, .1, "sawtooth");
        break;
      case "enemySlash":
        noiseBurst(.17, .18, 2500);
        break;
      case "enemyGrowl":
        tone(80, 55, .25, .08, "sawtooth");
        break;
      case "headshot":
        shotNoise(.085, .30, 950, 0, 'bandpass');
        tone(155, 42, .12, .23, 'triangle');
        shotNoise(.028, .18, 2800, .008, 'bandpass');
        break;
      case "plasma":
        shotNoise(.025, .07, 3800, 0, 'bandpass');
        tone(760, 165, .13, .085, 'triangle');
        tone(85, 42, .10, .06, 'sine');
        break;
      case "explosion":
        noiseBurst(.48, .4, 700);
        tone(95, 24, .43, .28);
        break;
      case "hit":
        shotNoise(.045, .13, 1100, 0, 'bandpass');
        tone(105, 50, .065, .09, 'triangle');
        break;
      case "hurt":
        noiseBurst(.12, .14, 650);
        tone(125, 65, .16, .16, "triangle");
        break;
      case "reload":
        noiseBurst(.07, .12, 3300);
        tone(320, 150, .055, .07, "square");
        break;
      case "loaded":
        tone(420, 650, .05, .07, "triangle");
        tone(800, 1000, .055, .065, "triangle", .065);
        break;
      case "pickup":
        tone(520, 660, .1, .1);
        tone(780, 990, .13, .1, "sine", .09);
        tone(1040, 1300, .18, .08, "sine", .17);
        break;
      case "jump":
        tone(140, 320, .13, .075, "triangle");
        break;
      case "wave":
        tone(220, 220, .18, .1, "triangle");
        tone(330, 330, .18, .1, "triangle", .16);
        tone(440, 440, .3, .1, "triangle", .32);
        break;
      case "over":
        tone(330, 165, .3, .13, "triangle");
        tone(165, 55, .5, .13, "triangle", .25);
        break;
    }
  }

  function enemySound(e, name) {
    const distance = e.position.distanceTo(state.camera.position);
    if (distance > 32) return;
    state.sound.effectGain = Math.max(0, 1 - distance / 32) * .7;
    voiceLimit = AUDIO.maxVoices - AUDIO.reservedPlayerVoices;
    try {
      sfx(name);
    } finally {
      state.sound.effectGain = 1;
      voiceLimit = AUDIO.maxVoices;
    }
  }

  function setupSound() {
    document.getElementById("muteBtn").addEventListener("click", () => {
      state.sound.enabled = !state.sound.enabled;
      initSound();
      refreshSoundUI();
    });
    document.getElementById("soundVolume").addEventListener("input", e => {
      state.sound.volume = Number(e.target.value) / 100;
      initSound();
      refreshSoundUI();
    });
    refreshSoundUI();
  }

  return { refreshSoundUI, initSound, tone, noiseBurst, sfx, enemySound, setupSound };
}


// Quelle: js/music.js

// Industrial-/Metal-Synth-Track: kurze Riffs, druckvolle Drums, Boss-Akzente.
function createMusic({ state }) {
  let bus = null, riffBus = null, drumNoise = null, cabinet = null;
  let lastMap = null;
  let nextNote = 0, tick = 0, lastGain = null, lastSimTime = 0;
  let playing = false, enabled = true, volume = MUSIC.volume;
  const voices = new Set();
  const frequency = note => 440 * 2 ** ((note - 69) / 12);

  function initMusic() {
    if (bus || !state.sound.ctx) return;
    const ctx = state.sound.ctx;
    bus = ctx.createGain(); bus.gain.value = 0;
    // Separate compression keeps enemy fire from ducking the soundtrack.
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18; compressor.knee.value = 12;
    compressor.ratio.value = 3; compressor.attack.value = .01; compressor.release.value = .12;
    bus.connect(compressor); compressor.connect(state.sound.output);
    riffBus = ctx.createGain();
    const distortion = ctx.createWaveShaper();
    const curve = new Float32Array(2048);
    for (let i = 0; i < curve.length; i++) curve[i] = Math.tanh((i * 2 / (curve.length - 1) - 1) * 4);
    distortion.curve = curve; distortion.oversample = '2x';
    cabinet = ctx.createBiquadFilter();
    cabinet.type = 'lowpass'; cabinet.frequency.value = 2600;
    riffBus.connect(distortion); distortion.connect(cabinet); cabinet.connect(bus);
    drumNoise = state.sound.noise ?? ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    if (!state.sound.noise) {
      const samples = drumNoise.getChannelData(0);
      for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
    }
  }

  function release(source, nodes) {
    voices.add(source);
    source.onended = () => {
      source.disconnect(); nodes.forEach(node => node.disconnect()); voices.delete(source);
    };
  }

  function note(midi, time, duration, level, type = 'triangle', cutoff = 900, slide = null, target = bus) {
    if (voices.size >= MUSIC.maxVoices) return;
    const ctx = state.sound.ctx;
    const osc = ctx.createOscillator(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(frequency(midi), time);
    if (slide !== null) osc.frequency.exponentialRampToValueAtTime(frequency(slide), time + duration);
    filter.type = 'lowpass'; filter.frequency.value = cutoff;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(level, time + .002);
    gain.gain.exponentialRampToValueAtTime(.0001, time + duration);
    osc.connect(filter); filter.connect(gain); gain.connect(target);
    release(osc, [filter, gain]);
    osc.start(time); osc.stop(time + duration + .02);
  }

  function percussion(time, duration, level, cutoff, type = 'highpass') {
    if (voices.size >= MUSIC.maxVoices) return;
    const ctx = state.sound.ctx;
    const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
    source.buffer = drumNoise; filter.type = type; filter.frequency.value = cutoff;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(level, time + .001);
    gain.gain.exponentialRampToValueAtTime(.0001, time + duration);
    source.connect(filter); filter.connect(gain); gain.connect(bus);
    release(source, [filter, gain]);
    source.start(time, .13); source.stop(time + duration + .01);
  }

  function beat(time, theme) {
    const bar = Math.floor(tick / 16), step = tick % 16;
    const phase = Math.floor(((state.wave ?? 1) - 1) / 3);
    const progression = theme.progressions[(Math.floor(bar / 8) + phase) % theme.progressions.length];
    const root = progression[bar % progression.length];
    const boss = state.enemies?.some(enemy => enemy.userData.alive && enemy.userData.isBoss);
    const interval = 60 / theme.bpm / 4;
    const riff = theme.riffs[(Math.floor(bar / 4) + phase) % theme.riffs.length][step];
    if (riff !== null) {
      const duration = interval * (step === 7 || step === 11 ? 1.35 : .78);
      note(root + riff, time, duration, .20, theme.tone, theme.cutoff, null, riffBus);
      note(root + riff + 7, time, duration, .10, theme.tone, theme.cutoff + 500, null, riffBus);
      note(root - 12, time, duration, .16, 'triangle', 300);
    }
    if (theme.kick.includes(step) || (boss && (step === 2 || step === 14))) {
      note(47, time, .16, .75, 'sine', 550, 23);
      percussion(time, .018, .12, 1800);
    }
    if (theme.snare.includes(step)) {
      percussion(time, .15, .36, 1700);
      note(55, time, .085, .15, 'triangle', 850, 42);
    }
    if (step % 2 === 0 || boss) percussion(time, step === 14 ? .13 : .035, step % 4 === 0 ? .075 : .045, 6500);
    if (step === 0 && bar % 4 === 0) percussion(time, .65, .10, 4300);
    if (bar % 4 === 3 && step >= 13) {
      note(49 - (step - 13) * 2, time, .095, .16, 'triangle', 700, 36);
      percussion(time, .055, .12, 2200, 'bandpass');
    }
    // Alternating lead phrases and map-specific percussion add movement over time.
    if ((phase > 0 || bar % 8 >= 4) && step % 4 === (bar % 2 ? 2 : 0)) {
      const melody = [12, 19, 15, 22, 17, 15, 19, 10];
      note(root + melody[(Math.floor(step / 4) + bar + phase) % melody.length], time,
        interval * 2.4, .075, theme.lead, theme.cutoff + 1000);
    }
    if (state.activeMap === 'canyon' && [3, 10, 15].includes(step)) {
      note(48 + (bar % 3) * 3, time, .13, .20, 'sine', 650, 34);
    }
    if (state.activeMap === 'foundry' && step % 2 === 1 && bar % 4 >= 2) {
      note(root + 24 + [0, 7, 3, 10][Math.floor(step / 2) % 4], time, interval * .45, .045, 'square', 3200);
    }
    tick++;
  }

  function updateMusic() {
    if (!bus || state.sound.ctx.state !== 'running') return;
    const ctx = state.sound.ctx;
    const map = state.activeMap ?? 'depot';
    const theme = MUSIC.themes[map] ?? MUSIC.themes.depot;
    if (map !== lastMap || (state.simTime ?? 0) < lastSimTime) {
      for (const source of voices) source.stop(ctx.currentTime + .02);
      tick = 0; playing = false; lastMap = map;
      cabinet.frequency.setTargetAtTime(theme.cutoff + 800, ctx.currentTime, .08);
    }
    const active = enabled && state.sound.enabled && state.status === 'playing' && !state.gameOver;
    const target = active ? volume : 0;
    // Keine neue Gain-Automation pro Renderframe anhängen.
    if (target !== lastGain) { bus.gain.setTargetAtTime(target, ctx.currentTime, .08); lastGain = target; }
    lastSimTime = state.simTime ?? 0;
    if (!active) { playing = false; return; }
    if (!playing || nextNote < ctx.currentTime - .2) { nextNote = ctx.currentTime + .03; playing = true; }
    const interval = 60 / theme.bpm / 4;
    while (nextNote < ctx.currentTime + .12) { beat(nextNote, theme); nextNote += interval; }
  }

  function refreshMusicUI() {
    const button = document.getElementById('musicBtn');
    button.textContent = enabled ? 'Music: on' : 'Music: off';
    button.setAttribute('aria-pressed', String(!enabled));
    document.getElementById('musicVolume').value = Math.round(volume * 100);
    document.getElementById('musicValue').textContent = Math.round(volume * 100) + '%';
    updateMusic();
  }

  function setupMusic() {
    document.getElementById('musicBtn').addEventListener('click', () => { enabled = !enabled; refreshMusicUI(); });
    document.getElementById('musicVolume').addEventListener('input', event => {
      volume = Number(event.target.value) / 100;
      refreshMusicUI();
    });
    refreshMusicUI();
  }

  return { initMusic, updateMusic, refreshMusicUI, setupMusic };
}


// Quelle: js/graphics.js
// Geometriehelfer, visuelle Effects und Ressourcenfreigabe.
function createGraphics({ THREE, state, config, dom, api }) {
  function glow(pos, color, size = .7, life = .07) {
    if (!state.glowTexture) {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 64;
      const c = canvas.getContext("2d"),
        gradient = c.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(.18, "rgba(255,255,255,.95)");
      gradient.addColorStop(.45, "rgba(255,255,255,.35)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = gradient;
      c.fillRect(0, 0, 64, 64);
      state.glowTexture = new THREE.CanvasTexture(canvas);
      state.glowTexture.userData = {
        shared: true
      };
    }
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: state.glowTexture,
      color,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    sprite.position.copy(pos);
    sprite.scale.set(size, size, 1);
    state.scene.add(sprite);
    state.effects.push({
      mesh: sprite,
      life,
      duration: life,
      blast: false
    });
    return sprite;
  }

  function bulletTracer(from, to, color) {
    const delta = to.clone().sub(from),
      length = Math.sqrt(delta.lengthSq());
    if (length < .02) return;
    const tracer = new THREE.Mesh(new THREE.CylinderGeometry(.014, .014, length, 8), new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: .8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    tracer.position.copy(from).lerp(to, .5);
    tracer.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
    state.scene.add(tracer);
    state.effects.push({
      mesh: tracer,
      life: .045,
      duration: .045,
      blast: false
    });
  }

  function mat(c, rough = .72, metal = .08, em = 0x000000) {
    return new THREE.MeshStandardMaterial({
      color: c,
      roughness: rough,
      metalness: metal,
      emissive: em
    });
  }

  function cube(w, h, d, c) {
    return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c));
  }

  function sphere(r, c, em = 0x000000) {
    return new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), mat(c, .6, .05, em));
  }

  function disposeObject(object) {
    if (object.parent) object.parent.remove(object);else state.scene.remove(object);
    const geometries = new Set(),
      materials = new Set();
    object.traverse(o => {
      if (o.geometry) geometries.add(o.geometry);
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => materials.add(m));
    });
    geometries.forEach(g => g.dispose());
    materials.forEach(m => {
      if (m.map && !m.map.userData?.shared) m.map.dispose();
      m.dispose();
    });
  }

  return { glow, bulletTracer, mat, cube, sphere, disposeObject };
}


// Quelle: js/hud.js
// HUD-Anzeigen, Menütexte und gecachte DOM-Aktualisierungen.
function createHud({ THREE, state, config, dom, api }) {
  function ui(key, value, apply) {
    if (state.uiCache.get(key) !== value) {
      state.uiCache.set(key, value);
      apply(value);
    }
  }

  function updateUI() {
    updateJumpUI();
    ui('abilities', state.dashCharges + ':' + state.grenadeCharges, () => {
      document.getElementById('dashCount').textContent = state.dashCharges;
      document.getElementById('grenadeCount').textContent = state.grenadeCharges;
      document.getElementById('touchDash').textContent = 'Dash ' + state.dashCharges;
      document.getElementById('touchGrenade').textContent = 'Frag ' + state.grenadeCharges;
    });
    const boss = state.enemies.find(e => e.userData.alive && e.userData.isBoss);
    ui("boss", boss ? Math.ceil(boss.userData.hp) + ":" + boss.userData.maxHp : "none", () => {
      document.getElementById("bossHUD").style.display = boss ? "block" : "none";
      if (boss) {
        document.getElementById("bossName").textContent = config.MAPS[state.activeMap].boss + (boss.userData.hp < boss.userData.maxHp * .5 ? " · ENRAGED" : "");
        document.getElementById("bossFill").style.width = Math.max(0, boss.userData.hp / boss.userData.maxHp * 100) + "%";
      }
    });
    ui("heli", Math.ceil(state.heliTimer) + ":" + state.heliPiloting, () => {
      document.getElementById("heliStatus").style.display = state.heliTimer > 0 ? "block" : "none";
      document.getElementById("heliStatus").textContent = "✦ HELICOPTER · " + Math.ceil(state.heliTimer) + "s · " + (state.heliPiloting ? "H: AUTOPILOT" : "H: PILOT");
      document.getElementById("touchHeli").style.display = state.heliTimer > 0 ? "block" : "none";
      document.getElementById("touchHeli").textContent = state.heliPiloting ? "Exit heli" : "Pilot heli";
      document.getElementById("touchDown").style.display = state.heliPiloting ? "block" : "none";
      document.getElementById("touchJump").textContent = state.heliPiloting ? "Ascend" : "Jump " + (2 - state.jumpsUsed) + "/2";
    });
    const w = config.WEAPONS[state.currentWeapon],
      health = Math.max(0, Math.round(state.hp));
    ui('hp', health + ':' + (state.hp > 100), () => {
      const v = health;
      dom.hpEl.textContent = v;
      dom.healthBar.style.width = Math.min(100, v / state.maxHp * 100) + "%";
      document.getElementById('healthState').textContent = state.hp > 100 ? 'SPEED +' + Math.round((config.OVERHEALTH_SPEED_MULTIPLIER - 1) * 100) + '%' : v <= 25 ? 'CRITICAL' : '';
      document.getElementById('healthCard').classList.toggle('critical', v <= 25);
      document.getElementById("healthWrap").setAttribute("aria-valuenow", v);
      dom.healthBar.style.background = v > 100 ? "linear-gradient(90deg,#53e8af,#5bdcff)" : v > 55 ? "var(--good)" : v > 25 ? "var(--warn)" : "var(--bad)";
    });
    ui("score", state.score, v => dom.scoreEl.textContent = v);
    const alive = state.enemies.filter(e => e.userData.alive).length;
    ui('wave', state.wave + ':' + alive + ':' + Math.ceil(state.nextWaveTimer), () => {
      dom.waveEl.textContent = String(state.wave).padStart(2, '0');
      document.getElementById('waveHUD').classList.toggle('bossWave', state.wave % 5 === 0);
      document.getElementById('waveStatus').textContent = alive ? alive + ' HOSTILES LEFT' : 'CLEARED · NEXT IN ' + Math.max(1, Math.ceil(state.nextWaveTimer)) + 's';
      document.getElementById('waveFill').style.width = (1 - alive / (state.waveEnemyCount || alive || 1)) * 100 + '%';
      document.getElementById('bossCountdown').textContent = state.wave % 5 === 0 ? 'BOSS WAVE' : 'BOSS IN ' + (5 - state.wave % 5);
      document.querySelectorAll('#waveMilestones i').forEach((el, i) => el.classList.toggle('lit', i < ((state.wave - 1) % 5) + 1));
    });
    ui('ammo', state.currentWeapon + ':' + state.magazines[state.currentWeapon] + ':' + (state.reloadTimer > 0), () => {
      const ammo = state.magazines[state.currentWeapon];
      document.getElementById('ammoNear').classList.toggle('lowAmmo', ammo <= Math.ceil(w.size * .2));
      document.getElementById('ammoNear').setAttribute('aria-label', w.name + ': ' + ammo + ' of ' + w.size + ' rounds');
      document.getElementById('ammoState').textContent = state.reloadTimer > 0 ? 'RELOADING' : ammo === 0 ? 'R TO RELOAD' : ammo <= Math.ceil(w.size * .2) ? 'LOW AMMO' : '';
      const count = w.size;
      document.getElementById('ammoRounds').replaceChildren(...Array.from({ length: count }, (_, i) => {
        const el = document.createElement('i');
        el.className = i < ammo ? 'loaded' : '';
        return el;
      }));
    });
    ui("hint", state.reloadTimer > 0, v => {
      dom.reloadHint.style.display = v ? "inline" : "none";
      dom.reloadHint.textContent = "↻";
    });
    ui("weapon", state.currentWeapon + ":" + (state.rocketTimer > 0), () => {
      for (const key of config.weaponOrder) document.getElementById("slot" + key).className = "weaponSlot" + (key === state.currentWeapon ? " active" : "");
    });
    for (const [name, el, timer, label] of [["shield", dom.chipShield, state.shieldTimer, "◈ Shield"], ["rocket", dom.chipRocket, state.rocketTimer, "✦ Damage +50%"], ["rapid", dom.chipRapid, state.rapidTimer, "ϟ Rapid fire"]]) ui(name, Math.ceil(timer), v => {
      el.style.display = v > 0 ? "flex" : "none";
      el.textContent = label + " · " + v + "s";
    });
  }

  function say() {}

  function showOverlay(title, text, button) {
    document.getElementById("startTitle").textContent = title;
    dom.start.querySelector("p").textContent = text;
    dom.startBtn.textContent = button;
    dom.start.style.display = "flex";
    document.body.classList.remove("playing");
    dom.startBtn.focus();
  }

  function updateJumpUI() {
    const remaining = 2 - state.jumpsUsed;
    ui("jumps", remaining + ":" + state.heliPiloting, () => {
      document.getElementById("jumpStatus").textContent = "JUMPS " + (remaining === 2 ? "● ●" : remaining === 1 ? "● ○" : "○ ○");
      document.getElementById("touchJump").textContent = state.heliPiloting ? "Ascend" : "Jump " + remaining + "/2";
    });
  }

  return { ui, updateUI, say, showOverlay, updateJumpUI };
}


// Quelle: js/minimap.js
// Heading-up arena overview: cached terrain rotates with the camera each frame.
function createMinimap({ THREE, state, config }) {
  const canvas = document.getElementById('minimapCanvas');
  const ctx = canvas.getContext('2d');
  const terrain = document.createElement('canvas');
  const size = 160, margin = 7;
  canvas.width = canvas.height = terrain.width = terrain.height = size * 2;
  const ground = terrain.getContext('2d');
  const pixelsPerUnit = (size - margin * 2) / (config.ARENA * 2);
  const point = value => size / 2 + value * pixelsPerUnit;
  let cachedMap = null;
  const direction = new THREE.Vector3();
  let heading = 0;

  function drawTerrain() {
    ground.setTransform(2, 0, 0, 2, 0, 0);
    ground.clearRect(0, 0, size, size);
    ground.fillStyle = '#17211fe6';
    ground.fillRect(0, 0, size, size);
    ground.strokeStyle = '#ffffff08';
    ground.lineWidth = 1;
    for (let coordinate = -32; coordinate <= 32; coordinate += 16) {
      ground.beginPath();
      ground.moveTo(point(coordinate), margin); ground.lineTo(point(coordinate), size - margin);
      ground.moveTo(margin, point(coordinate)); ground.lineTo(size - margin, point(coordinate));
      ground.stroke();
    }
    ground.save();
    ground.beginPath(); ground.rect(margin, margin, size - margin * 2, size - margin * 2); ground.clip();
    for (const obstacle of state.obstacles) {
      ground.fillStyle = obstacle.ramp ? '#8e977a' : obstacle.roof ? '#68766d' : '#46534b';
      ground.fillRect(point(obstacle.minX), point(obstacle.minZ), (obstacle.maxX - obstacle.minX) * pixelsPerUnit, (obstacle.maxZ - obstacle.minZ) * pixelsPerUnit);
    }
    ground.restore();
    ground.strokeStyle = '#d2caac55';
    ground.strokeRect(margin, margin, size - margin * 2, size - margin * 2);
    cachedMap = state.builtMap;
  }

  function updateMinimap() {
    if (!state.camera || state.status !== 'playing') return;
    state.camera.getWorldDirection(direction);
    if (direction.x * direction.x + direction.z * direction.z > .0001) {
      heading = Math.atan2(-direction.x, -direction.z);
    }
    if (cachedMap !== state.builtMap) drawTerrain();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.fillStyle = '#17211f'; ctx.fillRect(0, 0, size, size);
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate(heading);
    // Fixed range and a centred player: no pulsing zoom or drifting player arrow.
    ctx.translate(-point(state.camera.position.x), -point(state.camera.position.z));
    ctx.drawImage(terrain, 0, 0, size, size);
    ctx.restore();
    ctx.strokeStyle = '#c2e2e61c'; ctx.lineWidth = .6;
    for (const radius of [36, 70]) { ctx.beginPath(); ctx.arc(80, 80, radius, 0, Math.PI * 2); ctx.stroke(); }
    for (const enemy of state.enemies) {
      if (!enemy.userData.alive) continue;
      const dx = (enemy.position.x - state.camera.position.x) * pixelsPerUnit;
      const dz = (enemy.position.z - state.camera.position.z) * pixelsPerUnit;
      let rx = dx * Math.cos(heading) - dz * Math.sin(heading);
      let ry = dx * Math.sin(heading) + dz * Math.cos(heading);
      const edge = Math.max(1, Math.abs(rx) / 72, Math.abs(ry) / 72);
      rx /= edge; ry /= edge;
      const x = size / 2 + rx, y = size / 2 + ry;
      ctx.beginPath();
      ctx.fillStyle = enemy.userData.isBoss ? '#ffc44d' : '#f17e74';
      if (enemy.userData.isBoss) {
        ctx.moveTo(x, y - 4); ctx.lineTo(x + 4, y); ctx.lineTo(x, y + 4); ctx.lineTo(x - 4, y); ctx.closePath();
      } else ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.fillStyle = '#f9edb51c';
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.arc(0, 0, 20, -Math.PI / 2 - .5, -Math.PI / 2 + .5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = state.heliPiloting ? '#87ffce' : '#fff3cd';
    ctx.strokeStyle = '#17211f'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(3.5, 4); ctx.lineTo(0, 2); ctx.lineTo(-3.5, 4); ctx.closePath();
    ctx.fill(); ctx.stroke(); ctx.restore();
    ctx.fillStyle = '#b6c6bd'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
    ctx.fillText('N', size / 2 + Math.sin(heading) * 65, size / 2 - Math.cos(heading) * 65);
  }

  return { updateMinimap };
}


// Quelle: js/lifecycle.js
// Pause, Spielende, Neustart und Zurücksetzen der Eingaben.
function createLifecycle({ THREE, state, config, dom, api }) {
  function resetInput() {
    api.resetTouchInput?.();
    api.setScope(false);
    state.keys = {};
    state.firing = false;
    state.touchMove.x = state.touchMove.y = 0;
    state.velocity.set(0, 0, 0);
  }

  function pause() {
    if (state.status !== "playing") return;
    state.status = "paused";
    resetInput();
    if (document.pointerLockElement) document.exitPointerLock();
    api.showOverlay("PAUSED.", "The monsters can wait. Resume when you are ready.", "RESUME →");
  }

  function endGame() {
    if (state.gameOver) return;
    api.stopPiloting();
    api.sfx("over");
    state.gameOver = true;
    state.status = "over";
    resetInput();
    if (document.pointerLockElement) document.exitPointerLock();
    api.showOverlay("Game Over", `Score: ${state.score} · Wave reached: ${state.wave}`, "PLAY AGAIN →");
    api.say("Game Over");
  }

  function resetGame() {
    api.resetAbilities();
    api.stopPiloting();
    if (state.helicopter) {
      api.disposeObject(state.helicopter);
      state.helicopter = null;
    }
    state.heliTimer = state.heliShot = state.heliAudio = 0;
    if (state.builtMap !== state.activeMap) api.loadMap();
    [...state.enemies, ...state.powerups, ...state.projectiles.map(p => p.mesh), ...state.effects.map(e => e.mesh)].forEach(api.disposeObject);
    state.enemies = [];
    state.powerups = [];
    state.projectiles = [];
    state.effects = [];
    resetInput();
    state.hp = 100;
    state.score = 0;
    state.wave = 1;
    state.cooldown = state.reloadTimer = state.shieldTimer = state.rocketTimer = state.rapidTimer = 0;
    for (const [key, w] of Object.entries(config.WEAPONS)) state.magazines[key] = w.size;
    state.reloadWeapon = null;
    state.feetY = state.jumpVelocity = state.damageFlash = state.nextWaveTimer = 0;
    state.grounded = true;
    state.jumpsUsed = 0;
    api.restoreWeaponPose();
    state.gameOver = false;
    state.yaw = state.pitch = state.simTime = 0;
    state.navTarget = "";
    state.navRefresh = 0;
    state.navDistances.clear();
    state.camera.position.set(0, 1.7, config.MAPS[state.activeMap].spawnZ);
    state.camera.rotation.set(0, 0, 0);
    state.camera.updateMatrixWorld(true);
    state.weaponGroup.rotation.set(0, 0, 0);
    state.weaponGroup.position.set(0, 0, 0);
    state.currentWeapon = "rifle";
    for (const [key, m] of Object.entries(state.weaponModels)) m.visible = key === state.currentWeapon;
    dom.reloadWrap.style.display = "none";
    api.updatePlayerBody(0);
    api.spawnWave();
    api.updateUI();
  }

  return { resetInput, pause, endGame, resetGame };
}


// Quelle: js/world.js
// Kartenaufbau, Deckung, Rampen und Plattformen.
function createWorld({ THREE, state, config, dom, api }) {
  // Geometrie und begehbare Kollisionsfläche verwenden dieselben Dachmaße.
  function addRoof(x, z, width, depth, base, rise = 2.6) {
    const halfX = width / 2, halfZ = depth / 2;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([
      -halfX, 0, -halfZ, halfX, 0, -halfZ,
      halfX, 0, halfZ, -halfX, 0, halfZ, 0, rise, 0,
    ], 3));
    geometry.setIndex([0, 4, 1, 1, 4, 2, 2, 4, 3, 3, 4, 0, 0, 1, 2, 0, 2, 3]);
    geometry.computeVertexNormals();
    const roof = new THREE.Mesh(geometry.toNonIndexed(), api.mat(0x445054));
    geometry.dispose();
    roof.geometry.computeVertexNormals();
    roof.position.set(x, base, z);
    roof.userData.roof = { x, z, halfX, halfZ, base, rise };
    state.scene.add(roof);
    state.obstacles.push({
      minX: x - halfX, maxX: x + halfX,
      minZ: z - halfZ, maxZ: z + halfZ,
      minY: base, height: base + rise, roof: roof.userData.roof,
    });
    return roof;
  }
  function addObstacle(x, z, w, d, h = 4, minY = 0) {
    state.obstacles.push({
      minX: x - w / 2,
      maxX: x + w / 2,
      minZ: z - d / 2,
      maxZ: z + d / 2,
      height: h,
      minY
    });
  }

  function addCover(x, z, w, h, d, c) {
    const m = api.cube(w, h, d, c);
    m.position.set(x, h / 2, z);
    state.scene.add(m);
    addObstacle(x, z, w, d, h);
    return m;
  }

  function loadMap() {
    for (const object of state.environmentObjects) api.disposeObject(object);
    state.environmentObjects = [];
    state.obstacles.length = 0;
    state.scene.background = new THREE.Color(config.MAPS[state.activeMap].sky);
    state.scene.fog = new THREE.Fog(config.MAPS[state.activeMap].sky, 65, 180);
    const night = state.activeMap === 'foundry';
    state.worldAmbient.intensity = night ? 1.9 : 1.65;
    state.worldAmbient.color.setHex(night ? 0xbfcfeb : 0xd4e9ff);
    state.worldAmbient.groundColor.setHex(night ? 0x344860 : 0x66573f);
    state.worldSun.intensity = night ? 1.5 : 2.4;
    state.worldSun.color.setHex(night ? 0x91b6f4 : 0xffd4a1);
    const before = new Set(state.scene.children);
    if (state.activeMap === "depot") {
      buildEnvironment();
      addPlatform(0, -24, 12, 8, 4, 0x626f68);
      addRamp(0, -12, 5, 16, 4, "z", -1);
      addPlatform(0, 32, 12, 8, 6, 0x626f68);
      addRamp(-13, 32, 5, 14, 6, "x", 1);
    } else buildAlternateMap();
    api.decorateMap();
    state.environmentObjects = state.scene.children.filter(o => !before.has(o));
    state.builtMap = state.activeMap;
    state.navTarget = "";
    state.navRefresh = 0;
    state.navDistances.clear();
  }

  function addPlatform(x, z, w, d, height, color) {
    const deck = api.cube(w, .45, d, color);
    deck.position.set(x, height - .225, z);
    state.scene.add(deck);
    addObstacle(x, z, w, d, height, height - .45);
    for (const dx of [-w / 2 + .5, w / 2 - .5]) for (const dz of [-d / 2 + .5, d / 2 - .5]) {
      const pillar = api.cube(.65, height - .45, .65, state.activeMap === 'canyon' ? 0x79563d : 0x52636a);
      pillar.position.set(x + dx, (height - .45) / 2, z + dz);
      state.scene.add(pillar);
      addObstacle(x + dx, z + dz, .65, .65, height - .45);
    }
    // Edge lights mark the elevated floor without blocking jump routes.
    for (const side of [-1, 1]) {
      const strip = api.cube(w, .045, .07, state.activeMap === "foundry" ? 0x6ff4d1 : 0xe5c181);
      strip.position.set(x, height + .025, z + side * (d / 2 - .12));
      state.scene.add(strip);
    }
  }

  function addRamp(x, z, width, length, height, axis = "z", direction = 1) {
    const w = axis === "x" ? length : width,
      d = axis === "z" ? length : width;
    const o = {
      minX: x - w / 2,
      maxX: x + w / 2,
      minZ: z - d / 2,
      maxZ: z + d / 2,
      height,
      minY: 0,
      ramp: {
        axis,
        direction,
        x,
        z,
        length
      }
    };
    state.obstacles.push(o);
    // A filled wedge with a smooth walkable incline.
    const corners = [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]],
      vertices = [];
    for (const [xx, zz] of corners) vertices.push(xx, 0, zz);
    for (const [xx, zz] of corners) vertices.push(xx, height * (.5 + direction * (axis === "x" ? xx : zz) / length), zz);
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geom.setIndex([4, 6, 5, 4, 7, 6, 0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7, 0, 2, 1, 0, 3, 2]);
    geom.computeVertexNormals();
    const ramp = new THREE.Mesh(geom, new THREE.MeshStandardMaterial({
      color: state.activeMap === "canyon" ? 0xb49773 : 0x7c8986,
      roughness: .9,
      side: THREE.DoubleSide
    }));
    ramp.position.set(x, 0, z);
    state.scene.add(ramp);
  }

  function buildAlternateMap() {
    const canyon = state.activeMap === "canyon",
      ground = api.cube(104, 1, 104, canyon ? 0xaa8765 : 0x303f49);
    ground.position.y = -.5;
    state.scene.add(ground);
    for (const sign of [-1, 1]) {
      addCover(0, sign * 49, 100, 5, 1, canyon ? 0x9b7357 : 0x475967);
      addCover(sign * 49, 0, 1, 5, 98, canyon ? 0x9b7357 : 0x475967);
    }
    if (canyon) {
      for (const x of [-18, 18]) {
        addPlatform(x, 0, 12, 18, 5, 0xb99570);
        addRamp(x, 19, 5, 20, 5, "z", -1);
      }
      addPlatform(0, 0, 24, 4, 5, 0x8c7054);
      for (const [x, z, r, h] of [[-36, -28, 8, 14], [32, -30, 9, 18], [-34, 25, 6, 10], [35, 24, 7, 12], [-8, -34, 6, 11], [12, -32, 7, 13]]) {
        const rock = new THREE.Mesh(new THREE.CylinderGeometry(r * .65, r, h, 32, 8), api.mat(0xad7047));
        const positions = rock.geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const y = positions.getY(i), angle = Math.atan2(positions.getZ(i), positions.getX(i));
          const erosion = 1 + .045 * Math.sin(y * 2.1) + .025 * Math.cos(angle * 5 + y);
          positions.setX(i, positions.getX(i) * erosion); positions.setZ(i, positions.getZ(i) * erosion);
        }
        rock.geometry.computeVertexNormals();
        rock.position.set(x, h / 2, z);
        state.scene.add(rock);
        addObstacle(x, z, r * 1.6, r * 1.6, h);
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(r * .63, r * .66, .3, 32), api.mat(0xd3a16c));
        cap.position.set(x, h, z);
        state.scene.add(cap);
      }
      for (const [x, z] of [[-5, 15], [8, 20], [-10, -16], [10, -15]]) addCover(x, z, 4, 1.1, 1.3, 0x997f5f);
    } else {
      for (const x of [-18, 18]) {
        addPlatform(x, -18, 12, 12, 7, 0x4d6470);
        addRamp(x, -2, 5, 20, 7, "z", -1);
        addPlatform(x, 22, 12, 10, 4, 0x4d6470);
      }
      addPlatform(0, -18, 24, 4, 7, 0x516976);
      addRamp(4, 22, 5, 16, 4, "x", 1);
      addRamp(-4, 22, 5, 16, 4, "x", -1);
      for (const [x, z] of [[-36, -28], [36, -28], [-35, 20], [35, 20]]) {
        const tank = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 9, 24), api.mat(0x687c80, .45, .5));
        tank.position.set(x, 4.5, z);
        state.scene.add(tank);
        addObstacle(x, z, 6, 6, 9);
        for (const y of [1, 5, 8]) {
          const band = new THREE.Mesh(new THREE.TorusGeometry(3.04, .09, 8, 24), new THREE.MeshBasicMaterial({
            color: 0x8de6cd
          }));
          band.rotation.x = Math.PI / 2;
          band.position.set(x, y, z);
          state.scene.add(band);
        }
      }
      for (const x of [-7, 7]) {
        const stripe = api.cube(.1, .02, 90, 0x5dbea9);
        stripe.position.set(x, .025, 0);
        state.scene.add(stripe);
      }
    }
    for (const [x, z] of [[-8, -7], [9, 9], [-31, 1], [31, 4]]) addCover(x, z, 3, 1.1, 1.5, canyon ? 0x806c55 : 0x6c776c);
  }

  function buildEnvironment() {
    const batches = new Map();
    function shape(type, args, color, x, y, z, rx = 0, ry = 0, rz = 0) {
      const key = type + ":" + args.join(",") + ":" + color;
      if (!batches.has(key)) batches.set(key, {
        type,
        args,
        color,
        items: []
      });
      batches.get(key).items.push({
        x,
        y,
        z,
        rx,
        ry,
        rz
      });
    }
    const box = (w, h, d, c, x, y, z, ry = 0) => shape("box", [w, h, d], c, x, y, z, 0, ry);
    const cylinder = (r, h, c, x, y, z) => shape("cylinder", [r, r, h, 10], c, x, y, z);
    const cone = (r, h, c, x, y, z) => shape("cone", [r, h, 7], c, x, y, z);
    // Warm gravel with a subtle procedural grain, tiled over the entire arena.
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#8e8a72";
    ctx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 2000; i++) {
      ctx.fillStyle = i % 2 ? "#777961" : "#a09a81";
      ctx.fillRect(Math.random() * 128, Math.random() * 128, 1 + Math.random() * 2, 1);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(36, 36);
    texture.colorSpace = THREE.SRGBColorSpace;
    const ground = new THREE.Mesh(new THREE.BoxGeometry(110, 1, 110), new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 1
    }));
    ground.position.y = -.5;
    state.scene.add(ground);
    // Two broad roads and a paved central plaza create readable combat lanes.
    box(12, .025, 94, 0x454b4c, 0, .015, 0);
    box(94, .025, 10, 0x454b4c, 0, .018, -2);
    box(24, .04, 22, 0x6f7774, 0, .025, -2);
    for (let z = -43; z <= 43; z += 6) {
      if (Math.abs(z + 2) > 11) box(.16, .01, 2.5, 0xd5c99f, 0, .045, z);
    }
    for (let x = -43; x <= 43; x += 6) {
      if (Math.abs(x) > 13) box(2.5, .01, .16, 0xd5c99f, x, .045, -2);
    }
    for (const x of [-6.3, 6.3]) box(.25, .14, 94, 0xaca996, x, .07, 0);
    for (const z of [-7.3, 3.3]) box(94, .14, .25, 0xaca996, 0, .07, z);
    for (let x = -10; x <= 10; x += 2) box(1.1, .015, 3.5, 0xcac7b2, x, .06, -10);
    // Enclosing wall with pillars, inset panels and metal caps.
    for (const z of [-49, 49]) {
      addCover(0, z, 100, 3.3, 1, 0x79776a);
      box(100, .2, 1.25, 0xa39b83, 0, 3.4, z);
    }
    for (const x of [-49, 49]) {
      addCover(x, 0, 1, 3.3, 98, 0x79776a);
      box(1.25, .2, 98, 0xa39b83, x, 3.4, 0);
    }
    for (let n = -48; n <= 48; n += 8) for (const side of [-1, 1]) {
      box(1.25, 3.8, 1.25, 0x686c63, n, 1.9, side * 49);
      box(1.25, 3.8, 1.25, 0x686c63, side * 49, 1.9, n);
    }
    function sign(text, x, y, z) {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = 128;
      const t = c.getContext("2d");
      t.fillStyle = "#243b3d";
      t.fillRect(0, 0, 512, 128);
      t.strokeStyle = "#b4c4b0";
      t.lineWidth = 6;
      t.strokeRect(8, 8, 496, 112);
      t.fillStyle = "#e5e4c8";
      t.font = "bold 50px Arial";
      t.textAlign = "center";
      t.fillText(text, 256, 82);
      const map = new THREE.CanvasTexture(c);
      map.colorSpace = THREE.SRGBColorSpace;
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(4, .98), new THREE.MeshBasicMaterial({
        map
      }));
      panel.position.set(x, y, z);
      state.scene.add(panel);
    }
    function building(x, z, w, d, h, color, label) {
      addCover(x, z, w, h, d, color);
      box(w + .3, .45, d + .3, 0x62675f, x, .225, z);
      box(w + .7, .25, d + .7, 0x39474c, x, h + .125, z);
      box(w + .2, .24, .2, 0xb7aa8a, x, h - .45, z + d / 2 + .06);
      // Die Dachunterkante sitzt genau auf der Oberseite des Abschlusses.
      addRoof(x, z, w + .7, d + .7, h + .25);
      addObstacle(x, z, w + .7, d + .7, h + .25, h);
      addObstacle(x + w * .25, z, .65, .65, h + 2.5, h + .5);
      box(.65, 2, .65, 0x68645a, x + w * .25, h + 1.5, z);
      for (const face of [-1, 1]) {
        for (let xx = -w / 2 + 1.5; xx < w / 2 - 1; xx += 2.6) {
          box(1.45, 1.65, .14, 0xc3b79a, x + xx, 2.55, z + face * (d / 2 + .06));
          box(1.18, 1.35, .16, 0x29434b, x + xx, 2.55, z + face * (d / 2 + .08));
          box(.08, 1.35, .19, 0x95a5a1, x + xx, 2.55, z + face * (d / 2 + .1));
          box(1.18, .07, .19, 0x95a5a1, x + xx, 2.55, z + face * (d / 2 + .1));
        }
        for (let zz = -d / 2 + 1.6; zz < d / 2 - 1; zz += 2.8) {
          box(.14, 1.65, 1.45, 0xc3b79a, x + face * (w / 2 + .06), 2.55, z + zz);
          box(.16, 1.35, 1.18, 0x29434b, x + face * (w / 2 + .08), 2.55, z + zz);
        }
      }
      box(1.4, 2.5, .2, 0x37463f, x, 1.25, z + d / 2 + .1);
      box(.15, .15, .22, 0xd8b774, x + .4, 1.2, z + d / 2 + .15);
      sign(label, x, h - .95, z + d / 2 + .18);
    }
    building(-18, -19, 11, 12, 5, 0x9c8970, "DEPOT 07");
    building(19, -19, 12, 10, 6, 0x8c9a93, "CONTROL");
    building(-21, 19, 13, 10, 5, 0xbaa17c, "WORKSHOP");
    building(21, 21, 10, 13, 5.5, 0x91948b, "STATION");
    building(-35, -35, 8, 7, 4, 0x9c8d70, "POWER");
    building(35, 35, 8, 7, 4, 0x9f927b, "STORAGE");
    // Corrugated cargo containers and smaller cover islands.
    for (const [x, z, c] of [[-33, 1, 0x657f77], [33, -4, 0x9b644b], [-5, -36, 0x5e7883], [5, 36, 0x8a7751]]) {
      addCover(x, z, 7, 2.6, 3, c);
      box(7.2, .15, 3.2, 0x414c48, x, 2.68, z);
      for (let dx = -3; dx <= 3; dx += .5) for (const side of [-1, 1]) box(.09, 2.4, .1, 0x485b56, x + dx, 1.3, z + side * 1.54);
      box(.1, 2.3, 2.7, 0x394640, x + 3.56, 1.25, z);
    }
    for (const [x, z] of [[-8, 7], [9, -10], [-30, 28], [31, -27], [-9, -27], [9, 29]]) {
      addCover(x, z, 3.8, .85, 1, 0x938e75);
      box(4, .16, 1.12, 0xb6ad8e, x, .93, z);
      for (let n = -1; n <= 1; n++) box(.08, .75, 1.04, 0x625f52, x + n * 1.1, .43, z);
    }
    for (const [x, z] of [[-12, 4], [12, 9], [-28, -9], [29, 7], [-9, 32], [9, -32]]) {
      addCover(x, z, 1.6, 1.5, 1.6, 0x887355);
      for (const side of [-1, 1]) {
        box(1.7, .14, .1, 0x403f34, x, .2, z + side * .83);
        box(1.7, .14, .1, 0x403f34, x, 1.3, z + side * .83);
      }
      cylinder(.5, 1.3, 0x676d5e, x + 2, .65, z);
      addObstacle(x + 2, z, 1, 1, 1.3);
    }
    // Trees, planters and rocks occupy the outer paths, leaving lanes open.
    for (const [x, z] of [[-40, -17], [-39, 15], [-35, 38], [-15, 39], [16, 40], [39, 17], [40, -20], [24, -39], [-22, -39], [-39, -29], [40, -36]]) {
      cylinder(.28, 3.2, 0x6c5b44, x, 1.6, z);
      addObstacle(x, z, .65, .65, 3.2);
      cone(2.4, 4.2, 0x425e4d, x, 4.3, z);
      cone(1.85, 3.2, 0x59745b, x, 5.8, z);
      cone(1.15, 2.5, 0x6d8262, x, 7, z);
      for (let n = 0; n < 3; n++) {
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(.5 + n * .13, 0), api.mat(0x8e8d79));
        rock.scale.set(1.4, .65, 1);
        rock.position.set(x + 2 + n * .6, .23, z + 1);
        state.scene.add(rock);
      }
    }
    for (const [x, z] of [[-10, 14], [10, 15], [-10, -13], [10, -15]]) {
      box(3, .5, 1.6, 0xaaa18a, x, .25, z);
      box(2.7, .08, 1.3, 0x4b4c37, x, .54, z);
      addObstacle(x, z, 3, 1.6, .6);
      for (let i = -1; i <= 1; i++) cone(.65, 1, 0x68805a, x + i, .95, z);
    }
    // Street lamps and a central circular marker.
    for (const [x, z] of [[-7, 24], [7, -26], [-7, -5], [7, 7], [-30, 5], [30, -9]]) {
      cylinder(.11, 5, 0x414d4b, x, 2.5, z);
      addObstacle(x, z, .3, .3, 5);
      box(.9, .12, .4, 0x343f3d, x + .35, 5, z);
      box(.7, .06, .3, 0xffdfa0, x + .35, 4.9, z);
    }
    cylinder(2.8, .06, 0xb5a27c, 0, .07, -2);
    cylinder(2.4, .08, 0x676f65, 0, .08, -2);
    // Distant peaks and sun are scenery outside the collision perimeter.
    for (let i = 0; i < 18; i++) {
      const angle = i / 18 * Math.PI * 2,
        r = 100 + i % 3 * 12,
        h = 22 + i % 5 * 7;
      const peak = new THREE.Mesh(new THREE.ConeGeometry(22, h, 5), api.mat(i % 2 ? 0x87938b : 0x9ca497));
      peak.position.set(Math.sin(angle) * r, h / 2 - 4, Math.cos(angle) * r);
      peak.rotation.y = angle;
      state.scene.add(peak);
    }
    const sunDisk = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 12), new THREE.MeshBasicMaterial({
      color: 0xffe4b0,
      fog: false
    }));
    sunDisk.position.set(-75, 65, -110);
    state.scene.add(sunDisk);
    // Emit one draw call for each repeated geometry/material combination.
    const dummy = new THREE.Object3D();
    for (const batch of batches.values()) {
      const geometry = batch.type === "box" ? new THREE.BoxGeometry(...batch.args) : batch.type === "cone" ? new THREE.ConeGeometry(...batch.args) : new THREE.CylinderGeometry(...batch.args);
      const material = api.mat(batch.color);
      const mesh = new THREE.InstancedMesh(geometry, material, batch.items.length);
      batch.items.forEach((v, i) => {
        dummy.position.set(v.x, v.y, v.z);
        dummy.rotation.set(v.rx, v.ry, v.rz);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
      state.scene.add(mesh);
    }
  }

  return { addRoof, addObstacle, addCover, loadMap, addPlatform, addRamp, buildAlternateMap, buildEnvironment };
}


// Quelle: js/map-art.js
// Procedural surfaces and landmarks; generated once when changing arenas.
function createMapArt({ THREE, state, api }) {
  function surfaceTexture(canyon) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    let seed = 1753;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) | 0; return (seed >>> 0) / 4294967296; };
    ctx.fillStyle = canyon ? '#b7784b' : '#263343'; ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 4000; i++) {
      ctx.fillStyle = canyon ? (i % 2 ? '#c68e5e' : '#9c633e') : (i % 2 ? '#344558' : '#202c38');
      ctx.fillRect(random() * 256, random() * 256, 1 + random(), 1);
    }
    ctx.strokeStyle = canyon ? '#dda77725' : '#647c8e'; ctx.lineWidth = canyon ? 1 : 3;
    if (canyon) for (let y = 0; y < 256; y += 16) {
      ctx.beginPath();
      for (let x = 0; x <= 256; x += 4) ctx.lineTo(x, y + Math.sin(x / 256 * Math.PI * 2) * 4);
      ctx.stroke();
    } else {
      ctx.strokeRect(3, 3, 250, 250);
      ctx.fillStyle = '#71818a';
      for (const x of [12, 244]) for (const y of [12, 244]) { ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill(); }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(canyon ? 14 : 24, canyon ? 14 : 24);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }
  function decorateMap() {
    if (state.activeMap === 'depot') return;
    const canyon = state.activeMap === 'canyon';
    const floor = state.scene.children.find(object => object.isMesh && object.position.y === -.5);
    if (floor) { floor.material.map = surfaceTexture(canyon); floor.material.color.setHex(0xffffff); floor.material.needsUpdate = true; }
    const box = (w, h, d, color, x, y, z, glow = false) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), glow ? new THREE.MeshBasicMaterial({ color }) : api.mat(color));
      mesh.position.set(x, y, z); state.scene.add(mesh); return mesh;
    };
    if (canyon) {
      // Layered mesas and an eroded arch form a continuous desert horizon.
      for (let i = 0; i < 22; i++) {
        const angle = i / 22 * Math.PI * 2, height = 14 + (i % 5) * 4;
        const geometry = new THREE.CylinderGeometry(8, 12, height, 40, 18);
        const positions = geometry.attributes.position, colors = [];
        const bands = [0xa96943, 0xb9794c, 0xc58a57, 0xba794b];
        for (let v = 0; v < positions.count; v++) {
          const y = positions.getY(v), a = Math.atan2(positions.getZ(v), positions.getX(v));
          const erosion = 1 + .055 * Math.sin(y * .7 + i) + .065 * Math.sin(a * 5 + i) + .025 * Math.cos(y * 2);
          positions.setX(v, positions.getX(v) * erosion); positions.setZ(v, positions.getZ(v) * erosion);
          const color = new THREE.Color(bands[Math.floor((y + height / 2) * .8) % bands.length]);
          colors.push(color.r, color.g, color.b);
        }
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3)); geometry.computeVertexNormals();
        const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ vertexColors:true, roughness:1 }));
        mesh.position.set(Math.sin(angle) * 63, height / 2, Math.cos(angle) * 63);
        mesh.scale.z = .7; state.scene.add(mesh);
      }
      const arch = new THREE.Mesh(new THREE.TorusGeometry(13, 3, 12, 36, Math.PI), api.mat(0xbb794c));
      arch.position.set(0, 7, -58); state.scene.add(arch);
      for (let i = 0; i < 32; i++) {
        const rock = new THREE.Mesh(new THREE.SphereGeometry(.35 + i % 3 * .15, 12, 8), api.mat(0xbd875b));
        rock.position.set(Math.sin(i * 2.4) * 43, .12, Math.cos(i * 2.4) * 43);
        rock.scale.set(1.6, .5, .8); state.scene.add(rock);
      }
    } else {
      // Cyan processing lines, magenta reactor rings and a tall factory skyline.
      for (const side of [-1, 1]) for (let i = 0; i < 7; i++) {
        const z = -44 + i * 14, height = 15 + i % 3 * 7;
        box(8, height, 10, 0x182435, side * 57, height / 2, z);
        for (let level = 4; level < height; level += 4) box(.08, .5, 7, i % 2 ? 0x51ddec : 0xe76bb8, side * 52.95, level, z, true);
      }
      for (const z of [-34, 8]) {
        box(88, .45, .45, 0x526379, 0, 12, z);
        box(88, .06, .08, 0x5effe2, 0, 11.74, z, true);
        api.addObstacle(0, z, 88, .45, 12.225, 11.775);
        for (const side of [-1, 1]) { box(.6, 12, .6, 0x344b61, side * 44, 6, z); api.addObstacle(side * 44, z, .6, .6, 12); }
      }
      for (const x of [-36, 36]) for (const z of [-28, 20]) {
        const light = new THREE.PointLight(z < 0 ? 0x45eada : 0xf56fc6, 20, 18, 2);
        light.position.set(x, 5, z); state.scene.add(light);
      }
      for (const z of [-42, 42]) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(6, .13, 12, 64), new THREE.MeshBasicMaterial({ color: 0xef69bb }));
        ring.position.set(0, 8, z); state.scene.add(ring);
      }
      for (let z = -42; z < 44; z += 4) for (const x of [-7, 7]) box(.18, .025, 1.8, 0x49eaca, x, .035, z, true);
    }
    // Surface detailing follows the exact collision slope, without extra obstacles.
    const lines = [];
    for (const obstacle of state.obstacles) {
      if (!obstacle.ramp) continue;
      const r = obstacle.ramp;
      for (let offset = -r.length / 2 + .5; offset < r.length / 2; offset += canyon ? 1 : 2) {
        const x = r.axis === 'x' ? r.x + offset : r.x;
        const z = r.axis === 'z' ? r.z + offset : r.z;
        const y = api.surfaceHeight(obstacle, x, z) + .025;
        if (r.axis === 'x') lines.push(x, y, obstacle.minZ + .12, x, y, obstacle.maxZ - .12);
        else lines.push(obstacle.minX + .12, y, z, obstacle.maxX - .12, y, z);
      }
    }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(lines, 3));
    state.scene.add(new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color:canyon ? 0x695039 : 0x729798 })));
  }
  return { decorateMap };
}


// Quelle: js/player.js
// Spielermodell, Bewegung, Schwerkraft und Doppelsprung.
function createPlayer({ THREE, state, config, dom, api }) {
  function makePlayerArm(parent, x, y, z, side) {
    const hand = new THREE.Group();
    hand.position.set(x, y, z);
    parent.add(hand);
    const leather = api.mat(0x26343c, .82, .02);
    const fabric = api.mat(0x425760, .95, 0);
    const seamMaterial = api.mat(0x748b90, .8, 0);
    // A flattened palm and four curled fingers replace the stacked glove spheres.
    const palmShape = new THREE.Shape();
    palmShape.moveTo(-.041, -.052); palmShape.lineTo(.041, -.052);
    palmShape.lineTo(.048, .038); palmShape.quadraticCurveTo(0, .065, -.048, .038); palmShape.closePath();
    const palm = new THREE.Mesh(new THREE.ExtrudeGeometry(palmShape, {
      depth:.065, bevelEnabled:true, bevelSize:.009, bevelThickness:.009, bevelSegments:3, steps:1,
    }), leather);
    palm.position.z = -.032; hand.add(palm);
    const tube = (points, radius, material) => {
      const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
      const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, radius, 8, false), material);
      hand.add(mesh); return mesh;
    };
    for (let i = 0; i < 4; i++) {
      const y = .038 - i * .026;
      tube([[0,y,-.032],[-side*.035,y,-.059],[-side*.074,y,-.035],[-side*.082,y,.005]], .012, leather);
      tube([[side*.019,y,-.035],[side*.023,y+.004,-.022]], .005, seamMaterial);
    }
    tube([[side*.036,.04,.014],[side*.048,.063,-.016],[side*.018,.067,-.044]], .017, leather);
    // Wrist-to-elbow cross sections: the arm exits below the view, away from the lens.
    const centers = [[0,-.065,.025],[side*.025,-.14,.08],[side*.07,-.25,.14],[side*.13,-.42,.20]];
    const radii = [.048,.058,.073,.089], vertices = [], indices = [], rings = 16;
    for (let j = 0; j < centers.length; j++) for (let i = 0; i <= rings; i++) {
      const angle = i / rings * Math.PI * 2;
      vertices.push(centers[j][0] + Math.cos(angle)*radii[j], centers[j][1], centers[j][2]+Math.sin(angle)*radii[j]*.78);
      if (j && i < rings) { const n=j*(rings+1)+i; indices.push(n,n-rings-1,n+1,n+1,n-rings-1,n-rings); }
    }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
    geometry.setIndex(indices); geometry.computeVertexNormals();
    hand.add(new THREE.Mesh(geometry,fabric));
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(.054,.058,.045,20),leather);
    cuff.position.set(0,-.083,.035); hand.add(cuff);
    tube([[side*.052,-.15,.08],[side*.080,-.26,.14],[side*.123,-.38,.19]], .004, seamMaterial);
    return hand;
  }

  function buildPlayerBody() {
    state.playerBody = new THREE.Group();
    state.scene.add(state.playerBody);
    state.playerBody.userData.legs = [];
    const ellipsoid = (parent, rx, ry, rz, color, x, y, z) => {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), api.mat(color));
      mesh.scale.set(rx, ry, rz);
      mesh.position.set(x, y, z);
      parent.add(mesh);
      return mesh;
    };
    ellipsoid(state.playerBody, .26, .20, .17, 0x344552, 0, .91, .12);
    ellipsoid(state.playerBody, .27, .075, .19, 0x1b2a34, 0, 1.05, .12);
    const buckle = api.cube(.11, .085, .035, 0x9cac94);
    buckle.position.set(0, 1.05, -.105);
    state.playerBody.add(buckle);
    for (const side of [-1, 1]) {
      const leg = new THREE.Group();
      leg.position.set(side * .17, .84, .07);
      state.playerBody.add(leg);
      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(.128, .19, 6, 18), api.mat(0x425760));
      thigh.position.y = -.18;
      leg.add(thigh);
      ellipsoid(leg, .115, .13, .05, 0x263746, 0, -.15, -.1);
      const pocket = api.cube(.085, .18, .16, 0x314853);
      pocket.position.set(side * .12, -.15, .015);
      leg.add(pocket);
      const knee = new THREE.Group();
      knee.position.y = -.36;
      leg.add(knee);
      ellipsoid(knee, .125, .12, .105, 0x253c42, 0, 0, -.07);
      const shin = new THREE.Mesh(new THREE.CapsuleGeometry(.093, .13, 6, 18), api.mat(0x425760));
      shin.position.y = -.14;
      knee.add(shin);
      ellipsoid(knee, .08, .11, .025, 0x243441, 0, -.15, -.09);
      const foot = new THREE.Group();
      foot.position.set(0, -.31, 0);
      knee.add(foot);
      ellipsoid(foot, .113, .09, .20, 0x1d3036, 0, -.052, -.08);
      const sole = api.cube(.23, .04, .36, 0x101e24);
      sole.position.set(0, -.123, -.06);
      foot.add(sole);
      ellipsoid(foot, .10, .035, .095, 0x455a67, 0, -.035, -.20);
      for (const side of [-1, 1]) ellipsoid(foot, .012, .025, .12, 0x60747e, side * .105, -.077, -.075);
      for (let i = 0; i < 3; i++) {
        const lace = api.cube(.12, .012, .015, 0x92a59a);
        lace.position.set(0, .02, -.045 - i * .035);
        foot.add(lace);
      }
      state.playerBody.userData.legs.push({
        leg,
        knee,
        foot
      });
    }
    updatePlayerBody(0);
  }

  function updatePlayerBody(dt) {
    if (!state.playerBody) return;
    state.playerBody.position.set(state.camera.position.x, state.feetY, state.camera.position.z);
    state.playerBody.rotation.y = state.yaw;
    state.playerBody.visible = !state.scoped;
    const speed = Math.hypot(state.velocity.x, state.velocity.z),
      stride = Math.min(1, speed / config.MOVE_SPEED),
      phase = state.simTime * 12;
    const movementYaw = speed > .1 ? Math.atan2(-state.velocity.x, -state.velocity.z) - state.yaw : 0;
    for (let i = 0; i < 2; i++) {
      const {
          leg,
          knee,
          foot
        } = state.playerBody.userData.legs[i],
        swing = Math.sin(phase + i * Math.PI) * stride;
      leg.rotation.y = 0;
      leg.rotation.z = state.grounded ? swing * .20 * Math.sin(movementYaw) : 0;
      leg.rotation.x = state.grounded ? swing * .38 * Math.cos(movementYaw) : -.22;
      knee.rotation.x = state.grounded ? Math.max(0, -swing) * .55 : .52;
      foot.rotation.x = -(leg.rotation.x + knee.rotation.x) * .7;
      foot.rotation.z = -leg.rotation.z;
    }
  }

  function jump() {
    if (state.status !== "playing") return;
    if (state.heliPiloting) {
      if (state.touchMode && state.helicopter) {
        const next = state.helicopter.position.clone().add(new THREE.Vector3(0, 1.5, 0));
        if (next.y <= 35 && api.worldHit(state.helicopter.position, next, 1) === null) state.helicopter.position.copy(next);
      }
      return;
    }
    if (!state.grounded && state.jumpsUsed === 0) state.jumpsUsed = 1;
    if (state.jumpsUsed >= 2) return;
    state.jumpsUsed++;
    api.sfx("jump");
    state.jumpVelocity = config.JUMP_SPEED * (state.jumpsUsed === 2 ? .95 : 1);
    state.grounded = false;
    if (state.jumpsUsed === 2) {
      api.glow(state.camera.position.clone().add(new THREE.Vector3(0, -1.2, 0)), 0x7cf1df, 1.2, .2);
    }
    api.updateJumpUI();
  }

  function updatePlayerMovement(dt) {
    if (!state.heliPiloting) {
      const forward = new THREE.Vector3(-Math.sin(state.yaw), 0, -Math.cos(state.yaw)),
        right = new THREE.Vector3(Math.cos(state.yaw), 0, -Math.sin(state.yaw)),
        wish = new THREE.Vector3();
      if (state.keys.KeyW) wish.add(forward);
      if (state.keys.KeyS) wish.sub(forward);
      if (state.keys.KeyD) wish.add(right);
      if (state.keys.KeyA) wish.sub(right);
      wish.addScaledVector(right, state.touchMove.x).addScaledVector(forward, -state.touchMove.y);
      if (wish.lengthSq() > 0) {
        const speed = config.MOVE_SPEED * (state.hp > 100 ? config.OVERHEALTH_SPEED_MULTIPLIER : 1);
        wish.normalize().multiplyScalar(speed);
        state.velocity.x += (wish.x - state.velocity.x) * Math.min(1, config.ACCEL * dt);
        state.velocity.z += (wish.z - state.velocity.z) * Math.min(1, config.ACCEL * dt);
      } else {
        state.velocity.x *= Math.max(0, 1 - config.FRICTION * dt);
        state.velocity.z *= Math.max(0, 1 - config.FRICTION * dt);
      }
      const oldFeet = state.feetY,
        wasGrounded = state.grounded;
      if (state.dashTimer > 0) state.velocity.copy(state.dashDirection).multiplyScalar(32);
      const stepHeight = .3;
      state.jumpVelocity -= config.GRAVITY * dt;
      state.feetY = Math.max(0, state.feetY + state.jumpVelocity * dt);
      const playerBlocked = (x, z) => Math.abs(x) > config.ARENA - .5 || Math.abs(z) > config.ARENA - .5 || state.obstacles.some(o => {
        if (!api.overlaps(o, x, z)) return false;
        const top = api.surfaceHeight(o, x, z),
          bottom = o.minY ?? 0;
        if (top <= oldFeet + (wasGrounded ? stepHeight : .015)) return false;
        return state.feetY < top - .015 && state.feetY + 1.8 > bottom + .015;
      });
      const nx = state.camera.position.x + state.velocity.x * dt,
        nz = state.camera.position.z + state.velocity.z * dt;
      if (state.dashTimer > 0 && api.worldHit(new THREE.Vector3(state.camera.position.x, state.feetY + .9, state.camera.position.z), new THREE.Vector3(nx, state.feetY + .9, nz), config.PLAYER_RADIUS) !== null) {
        state.dashTimer = 0; state.velocity.set(0, 0, 0);
        return;
      }
      if (!playerBlocked(nx, state.camera.position.z)) state.camera.position.x = nx;else state.velocity.x = 0;
      if (!playerBlocked(state.camera.position.x, nz)) state.camera.position.z = nz;else state.velocity.z = 0;
      let floor = 0,
        support = 0;
      for (const o of state.obstacles) {
        if (!api.overlaps(o, state.camera.position.x, state.camera.position.z)) continue;
        const top = api.surfaceHeight(o, state.camera.position.x, state.camera.position.z);
        if (top <= oldFeet + (wasGrounded ? stepHeight : .02)) {
          support = Math.max(support, top);
          if (state.feetY <= top) floor = Math.max(floor, top);
        }
        if (!o.ramp && (o.minY ?? 0) > 0 && oldFeet + 1.8 <= o.minY + .02 && state.feetY + 1.8 > o.minY) {
          state.feetY = o.minY - 1.8;
          state.jumpVelocity = Math.min(0, state.jumpVelocity);
        }
      }
      if (wasGrounded && state.jumpVelocity <= 0 && Math.abs(oldFeet - support) <= stepHeight) {
        state.feetY = support;
        floor = support;
      }
      state.grounded = state.feetY <= floor && state.jumpVelocity <= 0;
      if (state.grounded) {
        state.feetY = floor;
        state.jumpVelocity = 0;
        state.jumpsUsed = 0;
      }
      state.camera.position.y = state.feetY + 1.7;
      state.camera.rotation.y = state.yaw;
      state.camera.rotation.x = state.pitch;
      updatePlayerBody(dt);
      const moving = Math.hypot(state.velocity.x, state.velocity.z) > .2;
      state.weaponGroup.position.x = moving ? Math.sin(state.simTime * 11) * .022 : 0;
      state.weaponGroup.position.y = moving && state.grounded ? Math.abs(Math.cos(state.simTime * 11)) * .024 : 0;
    }
  }

  return { makePlayerArm, buildPlayerBody, updatePlayerBody, jump, updatePlayerMovement };
}


// Quelle: js/weapons.js
// Weapon models, firing, scope, switching and reloading.
function createWeapons({ THREE, state, config, dom, api }) {
  function setScope(active) {
    state.scoped = Boolean(active && !state.heliPiloting && state.currentWeapon === "sniper" && state.status === "playing");
    document.getElementById("scope").style.display = state.scoped ? "flex" : "none";
    document.getElementById("crosshair").style.display = state.scoped ? "none" : "block";
    if (state.camera) {
      state.camera.fov = state.scoped ? 20 : 82;
      state.camera.updateProjectionMatrix();
    }
    if (state.weaponGroup) state.weaponGroup.visible = !state.scoped && !state.heliPiloting;
  }

  function selectWeapon(type) {
    if (state.heliPiloting) return;
    if (!config.WEAPONS[type] || type === state.currentWeapon) return;
    setScope(false);
    state.reloadTimer = 0;
    state.reloadWeapon = null;
    dom.reloadWrap.style.display = "none";
    state.weaponGroup.rotation.z = 0;
    restoreWeaponPose();
    state.currentWeapon = type;
    for (const [key, m] of Object.entries(state.weaponModels)) m.visible = key === type;
    state.cooldown = Math.max(state.cooldown, .15);
    api.updateUI();
    if (state.magazines[type] === 0) reload();
  }

  function buildWeapon() {
    state.weaponGroup = new THREE.Group();
    state.camera.add(state.weaponGroup);
    state.scene.add(state.camera);
    const box = (g, w, h, d, c, x, y, z) => {
      const m = api.cube(w, h, d, c);
      m.position.set(x, y, z);
      g.add(m);
      return m;
    };
    const tube = (g, r, len, c, x, y, z) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 24), api.mat(c, .48, .55));
      m.rotation.x = Math.PI / 2;
      m.position.set(x, y, z);
      g.add(m);
      return m;
    };
    for (const key of Object.keys(config.WEAPONS)) {
      const g = new THREE.Group();
      g.position.set(.4, -.36, -.48);
      state.weaponGroup.add(g);
      state.weaponModels[key] = g;
      g.visible = key === "rifle";
      g.userData.parts = {};
      if (key === "sniper") {
        box(g, .2, .2, .8, 0x373f3d, 0, 0, -.65);
        box(g, .2, .24, .42, 0x5c6551, 0, -.03, -.06);
        tube(g, .044, 1.1, 0x1c2429, 0, .03, -1.56);
        tube(g, .068, .18, 0x20282b, 0, .03, -2.18);
        box(g, .12, .3, .19, 0x292e29, 0, -.23, -.32);
        g.userData.parts.mag = box(g, .13, .2, .24, 0x252c29, 0, -.17, -.64);
        box(g, .055, .13, .1, 0x202829, 0, .19, -.5);
        box(g, .055, .13, .1, 0x202829, 0, .19, -.85);
        tube(g, .085, .55, 0x20292d, 0, .27, -.68);
        tube(g, .12, .13, 0x333e3d, 0, .27, -.99);
        tube(g, .098, .01, 0x5c9db0, 0, .27, -1.06);
        box(g, .05, .045, .22, 0x8a9490, .15, .04, -.43);
        const bolt = api.sphere(.045, 0x262e2b);
        bolt.position.set(.22, .04, -.4);
        g.add(bolt);
        g.userData.parts.bolt = bolt;
      } else if (key === "rifle") {
        box(g, .22, .23, .65, 0x30363d, 0, 0, -.55);
        box(g, .18, .2, .52, 0x645847, 0, -.015, -1.09);
        tube(g, .045, .54, 0x1c232b, 0, .045, -1.59);
        tube(g, .066, .13, 0x181e24, 0, .045, -1.89);
        box(g, .19, .24, .38, 0x434b43, 0, -.02, -.04);
        box(g, .07, .1, .18, 0x161b20, 0, -.02, .19);
        g.userData.parts.mag = box(g, .12, .32, .2, 0x20262b, 0, -.25, -.52);
        g.userData.parts.mag.rotation.x = -.18;
        box(g, .11, .3, .14, 0x272b2e, 0, -.23, -.23).rotation.x = -.28;
        for (let i = 0; i < 8; i++) box(g, .2, .035, .025, 0x151b20, 0, .145, -.35 - i * .085);
        box(g, .035, .13, .03, 0x222831, 0, .17, -1.32);
        box(g, .11, .095, .07, 0x252c30, 0, .19, -.38);
        for (let i = 0; i < 4; i++) box(g, .185, .035, .028, 0x252a2d, 0, .025, -.93 - i * .085);
      } else if (key === "rocket") {
        tube(g, .19, 1.35, 0x566148, 0, .02, -.72);
        tube(g, .235, .18, 0x343d31, 0, .02, -1.45);
        tube(g, .164, .025, 0x0b0d0c, 0, .02, -1.548);
        tube(g, .25, .18, 0x333e35, 0, .02, .04);
        tube(g, .204, .08, 0x9b8857, 0, .02, -.44);
        tube(g, .204, .08, 0x9b8857, 0, .02, -1.04);
        box(g, .14, .36, .16, 0x292e28, 0, -.29, -.49);
        box(g, .1, .28, .13, 0x292e28, 0, -.26, -1.02);
        box(g, .065, .2, .13, 0x1e2721, -.23, .16, -.7);
        tube(g, .06, .27, 0x232c27, -.23, .28, -.7);
        box(g, .16, .04, .24, 0xd8ad55, 0, .22, -.82);
      } else if (key === "shotgun") {
        box(g, .27, .23, .58, 0x34383c, 0, 0, -.45);
        box(g, .22, .22, .35, 0x705037, 0, -.02, -.03);
        tube(g, .065, .95, 0x252c33, -.065, .035, -1.17);
        tube(g, .065, .95, 0x252c33, .065, .035, -1.17);
        g.userData.parts.pump = box(g, .25, .16, .32, 0x806044, 0, -.12, -1.02);
        box(g, .13, .28, .17, 0x5b402c, 0, -.22, -.25);
        box(g, .035, .05, .06, 0xe89d54, 0, .12, -1.55);
      } else {
        box(g, .3, .25, .83, 0x333f51, 0, 0, -.65);
        tube(g, .14, .34, 0x192936, 0, .015, -1.21);
        tube(g, .092, .04, 0x527f88, 0, .015, -1.405);
        box(g, .12, .29, .18, 0x23313b, 0, -.22, -.33);
        for (let i = 0; i < 5; i++) box(g, .33, .04, .05, 0x486f78, 0, .05, -.44 - i * .13);
        g.userData.parts.mag = box(g, .18, .08, .3, 0x71989b, 0, .18, -.53);
      }
      // Mechanical details, darker bore openings and fixed muzzle anchors.
      const muzzlePositions = {
        rifle: [[0, .045, -1.96]],
        sniper: [[0, .03, -2.275]],
        shotgun: [[-.065, .035, -1.65], [.065, .035, -1.65]],
        rocket: [[0, .02, -1.57]],
        plasma: [[0, .015, -1.435]]
      };
      g.userData.muzzles = [];
      for (const [x, y, z] of muzzlePositions[key]) {
        const radius = key === "rocket" ? .155 : key === "plasma" ? .075 : key === "shotgun" ? .047 : .032;
        tube(g, radius, .012, 0x090f13, x, y, z);
        const rim = new THREE.Mesh(new THREE.TorusGeometry(radius + .008, .007, 8, 24), api.mat(0x727c7b, .42, .65));
        rim.position.set(x, y, z - .008);
        g.add(rim);
        const anchor = new THREE.Group();
        anchor.position.set(x, y, z - .025);
        g.add(anchor);
        g.userData.muzzles.push(anchor);
      }
      if (key === "rifle" || key === "sniper") {
        box(g, .015, .078, .23, 0x131d22, .116, .005, -.57);
        box(g, .02, .025, .16, 0x88928c, .13, .044, -.57);
        box(g, .1, .022, .28, 0x172327, 0, -.38, -.26);
        box(g, .025, .16, .025, 0x172327, .043, -.30, -.12);
        for (let j = 0; j < 3; j++) {
          const screw = tube(g, .018, .014, 0x86908a, .123, -.032, -.39 - j * .17);
          screw.rotation.y = Math.PI / 2;
        }
        if (key === "rifle") {
          for (let j = 0; j < 4; j++) box(g.userData.parts.mag, .126, .012, .15, 0x45504d, 0, -.1 + j * .06, 0);
          box(g, .2, .2, .045, 0x151f23, 0, -.02, .166);
        } else {
          const dial = tube(g, .055, .07, 0x56635e, .105, .27, -.68);
          dial.rotation.y = Math.PI / 2;
          for (const side of [-1, 1]) {
            const bipod = box(g, .028, .3, .033, 0x34423e, side * .08, -.15, -1.1);
            bipod.rotation.z = side * .18;
          }
        }
      } else if (key === "shotgun") {
        for (let j = 0; j < 5; j++) box(g.userData.parts.pump, .258, .012, .015, 0x3e332b, 0, .03, -.12 + j * .06);
        box(g, .025, .08, .19, 0x777b72, .145, .035, -.44);
        box(g, .22, .23, .035, 0x192125, 0, -.02, .157);
      } else if (key === "rocket") {
        for (const z of [-.44, -1.04]) {
          const band = new THREE.Mesh(new THREE.TorusGeometry(.205, .012, 8, 24), api.mat(0x333f34));
          band.position.set(0, .02, z);
          g.add(band);
        }
        box(g, .014, .10, .32, 0x9ca27f, .192, .01, -.75);
        box(g, .02, .022, .2, 0x3c4737, .202, .01, -.75);
      } else {
        for (const side of [-1, 1]) {
          box(g, .035, .2, .48, 0x63777b, side * .17, -.015, -.65);
          for (let j = 0; j < 4; j++) box(g, .012, .095, .035, 0x1e3037, side * .19, .015, -.48 - j * .1);
        }
      }
      api.makePlayerArm(g, .075, -.19, -.25, 1).userData.previewExcluded = true;
      g.userData.parts.hand = api.makePlayerArm(g, -.095, key === 'rocket' ? -.25 : -.14, key === 'shotgun' ? -1.02 : -.96, -1);
      g.userData.parts.hand.userData.previewExcluded = true;
      if (key === "rocket" || key === "shotgun") {
        const prop = new THREE.Group();
        g.add(prop);
        g.userData.parts.round = prop;
        tube(prop, key === "rocket" ? .115 : .04, key === "rocket" ? .72 : .16, key === "rocket" ? 0x8b9863 : 0xb45c39, 0, 0, 0);
        tube(prop, key === "rocket" ? .12 : .045, .055, 0xd2ad64, 0, 0, key === "rocket" ? .37 : .085);
        prop.visible = false;
      }
      g.userData.rest = g.children.map(o => ({
        o,
        position: o.position.clone(),
        rotation: {
          x: o.rotation.x,
          y: o.rotation.y,
          z: o.rotation.z
        },
        visible: o.visible
      }));
    }
    state.rifle = state.weaponModels.rifle;
    state.rocketLauncher = state.weaponModels.rocket;
  }

  function restoreWeaponPose() {
    for (const g of Object.values(state.weaponModels)) {
      g.position.set(.4, -.36, -.48);
      g.rotation.set(0, 0, 0);
      for (const rest of g.userData.rest ?? []) {
        rest.o.position.copy(rest.position);
        rest.o.rotation.set(rest.rotation.x, rest.rotation.y, rest.rotation.z);
        rest.o.visible = rest.visible;
      }
    }
  }

  function animateReload() {
    const g = state.weaponModels[state.currentWeapon];
    if (!g) return;
    for (const rest of g.userData.rest) {
      rest.o.position.copy(rest.position);
      rest.o.rotation.set(rest.rotation.x, rest.rotation.y, rest.rotation.z);
      rest.o.visible = rest.visible;
    }
    g.position.set(.4, -.36, -.48);
    g.rotation.set(0, 0, 0);
    if (state.reloadTimer <= 0) return;
    const t = Math.max(0, Math.min(1, 1 - state.reloadTimer / state.reloadDuration)),
      smooth = x => {
        x = Math.max(0, Math.min(1, x));
        return x * x * (3 - 2 * x);
      },
      window = (a, b, c, d) => smooth((t - a) / (b - a)) * (1 - smooth((t - c) / (d - c)));
    const pose = window(0, .18, .82, 1),
      remove = window(.15, .36, .53, .73),
      action = window(.76, .83, .88, .96),
      parts = g.userData.parts;
    g.position.y -= pose * .10;
    g.position.z += pose * .12;
    if (state.currentWeapon === "rifle" || state.currentWeapon === "sniper") {
      g.rotation.z = pose * .4;
      g.rotation.x = -pose * .18;
      parts.mag.position.y -= remove * .42;
      parts.mag.position.x -= remove * .12;
      parts.hand.position.set(-.12 - remove * .12, -.29 - remove * .42, -.52);
      parts.hand.rotation.z = pose * .18;
      if (parts.bolt && t > .74) {
        parts.bolt.position.z += action * .18;
        parts.bolt.rotation.z = -action * .7;
        parts.hand.position.set(.2, -.02, -.4 + action * .18);
      } else if (t > .74) parts.hand.position.set(-.10, .08, -.35 + action * .15);
    } else if (state.currentWeapon === "shotgun") {
      g.rotation.z = -pose * .58;
      g.rotation.x = -pose * .24;
      const phase = Math.max(0, Math.min(.999, (t - .15) / .6)),
        cycle = phase * (g.userData.reloadCount || 1) % 1,
        insert = smooth(cycle);
      parts.round.visible = t > .15 && t < .75;
      parts.round.position.set(-.23 * (1 - insert), -.5 + .3 * insert, -.44);
      parts.round.rotation.x = Math.PI / 2;
      parts.hand.position.set(-.17 * (1 - insert), -.55 + .3 * insert, -.43);
      parts.pump.position.z += action * .23;
      if (t > .76) parts.hand.position.set(-.12, -.2, -.92 + action * .23);
    } else if (state.currentWeapon === "plasma") {
      g.rotation.z = -pose * .35;
      g.rotation.x = -pose * .13;
      parts.mag.position.y += remove * .32;
      parts.mag.position.x -= remove * .25;
      parts.hand.position.set(-.13 - remove * .25, .14 + remove * .32, -.53);
    } else if (state.currentWeapon === "rocket") {
      g.rotation.z = pose * .23;
      g.rotation.x = -pose * .38;
      const insert = smooth((t - .27) / .43);
      parts.round.visible = t > .18 && t < .76;
      parts.round.position.set(0, .02, 1.05 - insert * .92);
      parts.hand.position.set(-.08, -.1, 1.13 - insert * .92);
    }
    // Blend the support hand from/to its actual grip, avoiding end-of-reload snapping.
    const handRest = g.userData.rest.find(r => r.o === parts.hand);
    parts.hand.position.copy(handRest.position.clone().lerp(parts.hand.position, pose));
  }

  function reload() {
    if (state.heliPiloting) return;
    const w = config.WEAPONS[state.currentWeapon];
    if (state.status !== "playing" || state.gameOver || state.reloadTimer > 0 || state.magazines[state.currentWeapon] === w.size) return;
    api.sfx("reload");
    state.reloadWeapon = state.currentWeapon;
    state.reloadDuration = state.currentWeapon === "shotgun" ? .6 + (w.size - state.magazines[state.currentWeapon]) * .28 : w.reload;
    state.weaponModels[state.currentWeapon].userData.reloadCount = w.size - state.magazines[state.currentWeapon];
    setScope(false);
    state.reloadTimer = state.reloadDuration;
    dom.reloadWrap.style.display = "block";
    dom.reloadFill.style.width = "0%";
    document.getElementById("reloadLabel").textContent = "RELOADING · " + w.name;
  }

  function finishReload() {
    api.sfx("loaded");
    if (state.reloadWeapon) state.magazines[state.reloadWeapon] = config.WEAPONS[state.reloadWeapon].size;
    state.reloadWeapon = null;
    state.reloadTimer = 0;
    dom.reloadWrap.style.display = "none";
    dom.reloadFill.style.width = "0%";
    state.weaponGroup.rotation.z = 0;
    restoreWeaponPose();
    api.updateUI();
  }

  function playerMuzzleFlash() {
    // Plasma deliberately has no repeated muzzle flash or additive light pulse.
    if (state.currentWeapon === "plasma" || state.scoped) return;
    const model = state.weaponModels[state.currentWeapon];
    for (const anchor of model.userData.muzzles) {
      const flash = api.glow(new THREE.Vector3(), 0xe9ad68, state.currentWeapon === "rocket" ? .24 : .16, .055);
      state.scene.remove(flash);
      anchor.add(flash);
      flash.position.set(0, 0, 0);
      flash.material.blending = THREE.NormalBlending;
      flash.material.opacity = .36;
      const effect = state.effects.find(f => f.mesh === flash);
      if (effect) effect.maxOpacity = .36;
    }
  }

  function shoot() {
    if (state.heliPiloting) {
      if (state.status !== "playing" || state.gameOver || !state.helicopter || state.heliManualCooldown > 0) return;
      state.camera.rotation.set(state.pitch, state.yaw, 0);
      state.camera.updateMatrixWorld(true);
      const dir = new THREE.Vector3();
      state.camera.getWorldDirection(dir);
      api.projectile(state.camera.position.clone(), dir, 0x80ffd3, 45, false, 90, .16, "heli");
      api.sfx("plasma");
      state.heliManualCooldown = .23;
      return;
    }
    if (state.status !== "playing" || state.gameOver || state.cooldown > 0 || state.reloadTimer > 0) return;
    const w = config.WEAPONS[state.currentWeapon];
    if (state.magazines[state.currentWeapon] <= 0) {
      reload();
      return;
    }
    api.sfx(state.currentWeapon);
    state.magazines[state.currentWeapon]--;
    state.cooldown = w.delay * (state.rapidTimer > 0 ? .6 : 1);
    state.camera.rotation.set(state.pitch, state.yaw, 0);
    state.camera.updateMatrixWorld(true);
    const dir = new THREE.Vector3();
    state.camera.getWorldDirection(dir);
    const damage = w.damage * (state.rocketTimer > 0 ? 1.5 : 1);
    const muzzles = state.weaponModels[state.currentWeapon].userData.muzzles;
    for (let i = 0; i < (w.pellets ?? 1); i++) {
      const aim = dir.clone().add(new THREE.Vector3((Math.random() - .5) * (state.scoped ? 0 : w.spread) * 2, (Math.random() - .5) * (state.scoped ? 0 : w.spread) * 2, (Math.random() - .5) * (state.scoped ? 0 : w.spread) * 2)).normalize();
      const muzzle = muzzles[i % muzzles.length].getWorldPosition(new THREE.Vector3());
      const obstruction = api.worldHit(state.camera.position, muzzle);
      if (obstruction !== null) muzzle.copy(state.camera.position).lerp(muzzles[i % muzzles.length].getWorldPosition(new THREE.Vector3()), Math.max(0, obstruction - .005));
      if (state.currentWeapon === "rocket" || state.currentWeapon === "plasma") {
        const endpoint = state.camera.position.clone().addScaledVector(aim, 180);
        let closest = api.worldHit(state.camera.position, endpoint) ?? 1;
        for (const enemy of state.enemies) {
          if (!enemy.userData.alive) continue;
          const hit = api.enemyHit(state.camera.position, endpoint, enemy);
          if (hit !== null && hit < closest) closest = hit;
        }
        const direction = state.camera.position.clone().lerp(endpoint, closest).sub(muzzle).normalize();
        api.projectile(muzzle, direction, w.color, state.currentWeapon === "rocket" ? 24 : 43, false, damage, state.currentWeapon === "rocket" ? .16 : .095, state.currentWeapon);
      } else {
        const origin = state.camera.position.clone(),
          end = origin.clone().addScaledVector(aim, state.currentWeapon === "sniper" ? 180 : 75);
        let closest = api.worldHit(origin, end) ?? 1,
          target = null,
          headshot = false;
        for (const e of state.enemies) {
          if (!e.userData.alive) continue;
          const hit = api.enemyIntersection(origin, end, e);
          if (hit && hit.t < closest) {
            closest = hit.t;
            target = e;
            headshot = hit.head;
          }
        }
        if (target) api.damageEnemy(target, damage * (state.currentWeapon === "shotgun" ? Math.max(.25, 1 - closest * 75 / 32) : 1), headshot);
        // Visuals start at the barrel; hit testing still follows the crosshair.
        api.bulletTracer(muzzle, origin.clone().lerp(end, closest), w.color);
      }
    }
    playerMuzzleFlash();
    state.weaponGroup.rotation.x = state.currentWeapon === "shotgun" ? .12 : state.currentWeapon === "rocket" ? .15 : .035;
    api.updateUI();
    if (state.magazines[state.currentWeapon] === 0) reload();
  }

  return { setScope, selectWeapon, buildWeapon, restoreWeaponPose, animateReload, reload, finishReload, playerMuzzleFlash, shoot };
}


// Quelle: js/weapon-previews.js
// Generate thumbnails from the actual gun geometry once, using the game renderer.
function createWeaponPreviews({ THREE, state, config }) {
  function buildWeaponPreviews() {
    const renderer = state.renderer;
    const width = 256, height = 112;
    const target = new THREE.WebGLRenderTarget(width, height);
    target.texture.colorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xe8f2ff, 0x8e846d, 3));
    const light = new THREE.DirectionalLight(0xffffff, 4);
    light.position.set(3, 5, 2); scene.add(light);
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .01, 20);
    const oldTarget = renderer.getRenderTarget();
    const oldClear = renderer.getClearColor(new THREE.Color());
    const oldAlpha = renderer.getClearAlpha();
    const pixels = new Uint8Array(width * height * 4);
    try {
      renderer.setClearColor(0x000000, 0);
      for (const key of config.weaponOrder) {
        // Copy meshes without cloning userData, which contains live part references.
        const model = new THREE.Group();
        state.weaponModels[key].traverse(part => {
          if (!part.isMesh || part.userData.previewExcluded) return;
          let parent = part;
          while (parent !== state.weaponModels[key]) {
            if (!parent.visible || parent.userData.previewExcluded) return;
            parent = parent.parent;
          }
          const mesh = new THREE.Mesh(part.geometry, part.material);
          part.updateWorldMatrix(true, false);
          mesh.matrix.copy(state.weaponModels[key].matrixWorld.clone().invert().multiply(part.matrixWorld));
          mesh.matrixAutoUpdate = false;
          model.add(mesh);
        });
        model.rotation.y = -Math.PI / 2;
        scene.add(model); model.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(model);
        const center = bounds.getCenter(new THREE.Vector3());
        const size = bounds.getSize(new THREE.Vector3());
        const halfHeight = Math.max(size.y, size.x * height / width) * .60;
        camera.left = -halfHeight * width / height; camera.right = -camera.left;
        camera.top = halfHeight; camera.bottom = -halfHeight;
        camera.position.copy(center).add(new THREE.Vector3(.12, .14, 5));
        camera.lookAt(center); camera.updateProjectionMatrix();
        renderer.setRenderTarget(target); renderer.render(scene, camera);
        renderer.readRenderTargetPixels(target, 0, 0, width, height, pixels);
        const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        const image = ctx.createImageData(width, height);
        for (let y = 0; y < height; y++) image.data.set(pixels.subarray((height - y - 1) * width * 4, (height - y) * width * 4), y * width * 4);
        ctx.putImageData(image, 0, 0);
        const icon = document.querySelector('#slot' + key + ' .weaponIcon');
        const img = document.createElement('img');
        img.className = 'weaponIcon'; img.alt = config.WEAPONS[key].name;
        img.width = width; img.height = height; img.src = canvas.toDataURL('image/png');
        icon.replaceWith(img);
        scene.remove(model);
      }
    } finally {
      renderer.setRenderTarget(oldTarget); renderer.setClearColor(oldClear, oldAlpha);
      target.dispose();
    }
  }
  return { buildWeaponPreviews };
}


// Quelle: js/enemies.js
// Wellen, Gegner und Bosse: Modelle, Navigation, Angriffe und Damage.
function createEnemies({ THREE, state, config, dom, api }) {
  function spawnWave() {
    state.nextWaveTimer = 0;
    api.sfx("wave");
    const count = Math.min(6 + state.wave * 2, 28),
      types = state.wave === 1 ? ["runner", "soldier", "orbiter"] : Object.keys(config.ENEMY_TYPES);
    for (let i = 0; i < count; i++) {
      const isBoss = state.wave % 5 === 0 && i === 0,
        type = isBoss ? "heavy" : types[i % types.length],
        cfg = config.ENEMY_TYPES[type],
        e = new THREE.Group(),
        rig = new THREE.Group();
      e.add(rig);
      const part = (w, h, d, c, x, y, z, parent = rig) => {
        const m = api.cube(w, h, d, c);
        m.position.set(x, y, z);
        parent.add(m);
        return m;
      };
      // Smooth stylised creatures: connected silhouettes, restrained detail, shared local materials.
      const palettes = {
          runner: {
            skin: 0xb76555,
            shade: 0x754b4c,
            light: 0xd69478,
            armor: 0x343d48,
            trim: 0xc59c63,
            eye: 0xffc46d
          },
          soldier: {
            skin: 0x7d9976,
            shade: 0x506d61,
            light: 0xb2c8a0,
            armor: 0x384d50,
            trim: 0xc5ad76,
            eye: 0xf4d99b
          },
          heavy: {
            skin: 0x888b9e,
            shade: 0x5b6078,
            light: 0xb7b6c3,
            armor: 0x44495b,
            trim: 0xb5a7a0,
            eye: 0xa8dafa
          },
          orbiter: {
            skin: 0x69a8ad,
            shade: 0x466b81,
            light: 0xa5d6cd,
            armor: 0x354655,
            trim: 0xa1c4c1,
            eye: 0x93f2e0
          }
        },
        palette = palettes[type],
        localMaterials = new Map(),
        smoothSphere = new THREE.SphereGeometry(1, 24, 16);
      const surface = color => {
        if (!localMaterials.has(color)) localMaterials.set(color, api.mat(color, .65, .03));
        return localMaterials.get(color);
      };
      const flesh = (rx, ry, rz, color, x, y, z, parent = rig) => {
        const m = new THREE.Mesh(smoothSphere, surface(color));
        m.scale.set(rx, ry, rz);
        m.position.set(x, y, z);
        parent.add(m);
        return m;
      };
      const capsule = (radius, length, color, x, y, z, parent = rig) => {
        const m = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 6, 16), surface(color));
        m.position.set(x, y, z);
        parent.add(m);
        return m;
      };
      const horn = (side, large = false) => {
        const path = new THREE.CatmullRomCurve3([new THREE.Vector3(side * .21, 2.08, -.025), new THREE.Vector3(side * (large ? .37 : .30), 2.22, -.065), new THREE.Vector3(side * (large ? .42 : .31), large ? 2.40 : 2.32, -.16), new THREE.Vector3(side * (large ? .34 : .23), large ? 2.49 : 2.37, -.24)]);
        // Tapered cross-sections along the curve avoid straight cone spikes.
        const rings = 14,
          sides = 10,
          vertices = [],
          indices = [],
          frames = path.computeFrenetFrames(rings, false);
        for (let j = 0; j <= rings; j++) {
          const center = path.getPointAt(j / rings),
            radius = (large ? .10 : .075) * Math.pow(1 - j / rings, .8) + .003;
          for (let k = 0; k <= sides; k++) {
            const angle = k / sides * Math.PI * 2,
              v = center.clone().addScaledVector(frames.normals[j], Math.cos(angle) * radius).addScaledVector(frames.binormals[j], Math.sin(angle) * radius);
            vertices.push(v.x, v.y, v.z);
            if (j < rings && k < sides) {
              const n = j * (sides + 1) + k;
              indices.push(n, n + sides + 1, n + 1, n + 1, n + sides + 1, n + sides + 2);
            }
          }
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        rig.add(new THREE.Mesh(geometry, surface(palette.trim)));
      };
      // A single shaped torso connects hips, waist, chest and neck.
      const profile = [[0, .76], [.22, .79], [.27, .94], [.25, 1.06], [.32, 1.22], [type === "heavy" ? .43 : .36, 1.42], [.30, 1.56], [.15, 1.66], [.13, 1.74], [0, 1.75]].map(([r, y]) => new THREE.Vector2(r, y));
      const torso = new THREE.Mesh(new THREE.LatheGeometry(profile, 28), surface(palette.skin));
      torso.scale.z = .76;
      rig.add(torso);
      flesh(.28, .26, .265, palette.skin, 0, 1.92, 0);
      flesh(.22, .125, .19, palette.light, 0, 1.79, .07);
      // Expressive eyes, cheek planes and a small muzzle rather than exposed teeth.
      flesh(.16, .075, .075, palette.shade, 0, 1.795, .218);
      flesh(.165, .042, .062, palette.skin, 0, 1.817, .24);
      flesh(.067, .06, .07, palette.light, 0, 1.91, .235);
      for (const side of [-1, 1]) {
        flesh(.09, .066, .032, palette.shade, side * .112, 1.971, .237);
        const iris = new THREE.Mesh(smoothSphere, api.mat(palette.eye, .36, .03, palette.eye));
        iris.material.emissiveIntensity = .35;
        iris.scale.set(.054, .043, .026);
        iris.position.set(side * .112, 1.972, .267);
        rig.add(iris);
        flesh(.014, .03, .01, 0x19272e, side * .112, 1.972, .292);
        flesh(.012, .012, .007, 0xeaf9f6, side * .099, 1.988, .294);
        const brow = flesh(.109, .034, .058, palette.skin, side * .12, 2.024, .22);
        brow.rotation.z = side * -.17;
        flesh(.08, .07, .07, palette.light, side * .176, 1.862, .177);
        if (type === "runner" || type === "heavy") horn(side, type === "heavy");
        if (type === "soldier") {
          const ear = flesh(.085, .20, .075, palette.skin, side * .30, 1.99, -.015);
          ear.rotation.z = side * -.85;
          const inner = flesh(.044, .125, .026, palette.light, side * .322, 1.997, .043);
          inner.rotation.z = side * -.85;
        }
        if (type === "orbiter") {
          const fin = flesh(.055, .26, .14, palette.shade, side * .265, 2.035, -.075);
          fin.rotation.z = side * -.38;
          flesh(.029, .18, .07, palette.light, side * .28, 2.06, -.02);
        }
      }
      // Soft armour panels and leather cuffs keep the armed silhouettes coherent.
      flesh(.28, .27, .075, palette.armor, 0, 1.35, .24);
      for (const side of [-1, 1]) {
        flesh(.11, .19, .045, palette.trim, side * .19, 1.37, .26);
        flesh(.035, .032, .014, palette.eye, side * .19, 1.46, .303);
      }
      if (type !== 'runner') {
        flesh(.285, .13, .24, palette.armor, 0, 2.08, -.035);
        flesh(.21, .032, .032, palette.trim, 0, 2.065, .205);
      }
      flesh(.17, .20, .026, palette.shade, 0, 1.36, .312);
      flesh(.045, .065, .023, palette.trim, 0, 1.44, .34);
      flesh(.265, .075, .215, palette.armor, 0, .91, 0);
      const legs = [],
        arms = [];
      for (const side of [-1, 1]) {
        const leg = new THREE.Group();
        leg.position.set(side * .18, .85, 0);
        rig.add(leg);
        capsule(.13, .21, palette.skin, 0, -.16, -.015, leg);
        flesh(.12, .13, .13, palette.shade, 0, -.36, .04, leg);
        flesh(.11, .105, .045, palette.armor, 0, -.34, .15, leg);
        capsule(.095, .19, palette.skin, 0, -.53, .025, leg);
        flesh(.115, .10, .12, palette.armor, 0, -.64, .035, leg);
        flesh(.14, .105, .23, palette.shade, 0, -.735, .11, leg);
        for (const toe of [-1, 1]) flesh(.053, .04, .09, palette.trim, toe * .061, -.759, .275, leg);
        const knee = new THREE.Group(),
          ankle = new THREE.Group();
        knee.position.y = -.36;
        ankle.position.y = -.31;
        for (const child of [...leg.children]) if (child.position.y < -.4) {
          leg.remove(child);
          child.position.y += .36;
          knee.add(child);
        }
        for (const child of [...knee.children]) if (child.position.y < -.30) {
          knee.remove(child);
          child.position.y += .31;
          ankle.add(child);
        }
        knee.add(ankle);
        leg.add(knee);
        leg.userData = {
          knee,
          ankle
        };
        legs.push(leg);
        const arm = new THREE.Group();
        arm.position.set(side * .43, 1.56, 0);
        rig.add(arm);
        flesh(type === "heavy" ? .22 : .16, .17, .18, palette.skin, 0, -.06, 0, arm);
        capsule(.115, .16, palette.skin, 0, -.22, 0, arm);
        capsule(.09, .12, palette.skin, 0, -.43, .008, arm);
        flesh(.11, .09, .12, palette.armor, 0, -.47, .01, arm);
        flesh(.113, .105, .108, palette.skin, 0, -.575, .038, arm);
        flesh(.036, .06, .056, palette.light, -side * .087, -.575, .095, arm);
        const shoulder = flesh(type === "heavy" ? .24 : .175, .125, .21, palette.armor, side * .018, .035, 0, arm);
        flesh(.12, .025, .14, palette.trim, side * .018, .14, .01, arm);
        arms.push(arm);
      }
      const held = new THREE.Group();
      held.position.set(0, -.57, 0);
      arms[1].add(held);
      if (type === "runner") {
        part(.1, .26, .1, 0x382e25, 0, -.08, 0, held);
        part(.28, .055, .16, 0x737d7d, 0, .065, 0, held);
        const blade = part(.16, .78, .035, 0xc5cfce, 0, .46, 0, held);
        blade.rotation.z = -.12;
        part(.045, .69, .04, 0xe8eeed, -.055, .46, .006, held);
      } else {
        part(.19, .17, .55, 0x29312e, 0, 0, .23, held);
        part(.14, .15, .27, 0x685c46, 0, 0, -.13, held);
        part(.1, .25, .15, 0x1d2325, 0, -.17, .2, held);
        part(.15, .12, .33, 0x5a6256, 0, .01, .56, held);
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(type === "heavy" ? .065 : .035, type === "heavy" ? .065 : .035, .48, 16), api.mat(0x1b2328, .35, .65));
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, .02, .9);
        held.add(barrel);
        part(.04, .09, .08, 0x1f292b, 0, .14, .42, held);
      }
      if (type === "heavy") {
        flesh(.24, .24, .22, palette.shade, 0, 1.49, -.19);
        flesh(.18, .14, .08, palette.armor, 0, 1.63, -.35);
      }
      if (type === "orbiter") {
        const crest = flesh(.10, .17, .22, palette.shade, 0, 2.1, -.07);
        crest.rotation.x = -.3;
      }
      const scale = isBoss ? 2.1 : type === "heavy" ? 1.2 : type === "runner" ? .9 : 1;
      e.scale.setScalar(scale);
      const max = isBoss ? 1600 + state.wave * 110 : cfg.hp * (1 + (state.wave - 1) * .095);
      e.userData = {
        isBoss,
        type,
        hp: max,
        maxHp: max,
        speed: isBoss ? 2.4 : cfg.speed,
        shot: 1 + Math.random() * 1.8,
        alive: true,
        legs,
        arms,
        rig,
        phase: Math.random() * 6.28,
        vx: 0,
        vz: 0,
        turn: 0,
        gait: 0,
        lastX: 0,
        lastZ: 0,
        recoil: 0,
        strafe: Math.random() < .5 ? -1 : 1,
        scale,
        flash: 0,
        held,
        swing: 0,
        meleePending: false,
        voice: 2 + Math.random() * 4
      };
      let x = 0,
        z = 0;
      for (let tries = 0; tries < 500; tries++) {
        x = (Math.random() * 2 - 1) * (config.ARENA - 6);
        z = (Math.random() * 2 - 1) * (config.ARENA - 6);
        if (Math.hypot(x - state.camera.position.x, z - state.camera.position.z) > 15 && !api.blocked(x, z, .8)) break;
      }
      e.position.set(x, 0, z);
      createEnemyBar(e);
      state.scene.add(e);
      state.enemies.push(e);
    }
    state.waveEnemyCount = count;
    api.say("Wave " + state.wave + " · " + count + " enemies");
  }

  function createEnemyBar(e) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false
    }));
    sprite.position.y = 2.65;
    // Keep the nameplate understated even on enlarged heavy enemies and bosses.
    const scale = e.userData.scale ?? 1;
    sprite.scale.set(1.75 / scale, .4375 / scale, 1);
    e.add(sprite);
    e.userData.bar = {
      canvas,
      texture,
      sprite
    };
    drawEnemyBar(e);
  }

  function drawEnemyBar(e) {
    const {
        canvas,
        texture
      } = e.userData.bar,
      c = canvas.getContext("2d"),
      ratio = Math.max(0, Math.min(1, e.userData.hp / e.userData.maxHp));
    c.clearRect(0, 0, 256, 64);
    c.fillStyle = "#111820b8";
    c.fillRect(22, 36, 212, 8);
    c.fillStyle = ratio > .5 ? "#92bf88" : ratio > .25 ? "#d5b574" : "#d68078";
    c.fillRect(23, 37, 210 * ratio, 6);
    c.strokeStyle = "#ffffff25";
    c.lineWidth = 1;
    c.strokeRect(22.5, 36.5, 211, 7);
    c.fillStyle = "#d9dfe8dd";
    c.font = '17px "Segoe UI", Arial, sans-serif';
    c.textAlign = "center";
    c.textBaseline = "alphabetic";
    c.shadowColor = "#000b";
    c.shadowBlur = 2;
    c.shadowOffsetY = 1;
    const name = e.userData.isBoss ? config.MAPS[state.activeMap].boss : config.ENEMY_TYPES[e.userData.type].name;
    c.fillText(name.toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase()), 128, 27, 228);
    c.shadowBlur = 0;
    c.shadowOffsetY = 0;
    texture.needsUpdate = true;
  }

  function damageEnemy(e, damage, headshot = false) {
    if (!e.userData.alive) return;
    if (headshot) {
      damage *= 2;
      api.sfx("headshot");
      api.say("Headshot · Double damage");
    } else api.sfx("hit");
    const marker = document.getElementById("hitMarker");
    const killed = e.userData.hp <= damage;
    marker.className = (headshot ? 'headshot' : '') + (killed ? ' kill' : '');
    marker.setAttribute('aria-label', headshot ? 'Headshot' : killed ? 'Enemy eliminated' : 'Hit');
    state.hitMarkerTimer = headshot ? .22 : .14;
    api.enemySound(e, e.userData.hp <= damage ? "enemyDeath" : "enemyPain");
    e.userData.hp -= damage;
    drawEnemyBar(e);
    if (e.userData.hp <= 0) {
      e.userData.alive = false;
      state.score += e.userData.isBoss ? 2500 : config.ENEMY_TYPES[e.userData.type].points;
      api.dropEnemyPowerup(e);
      api.disposeObject(e);
    }
  }

  function enemyFire(e) {
    const type = e.userData.type,
      origin = e.position.clone().add(new THREE.Vector3(0, 1.25 * e.userData.scale, 0));
    if (api.worldHit(origin, state.camera.position) !== null) return;
    const aim = state.camera.position.clone().sub(origin).normalize(),
      up = new THREE.Vector3(0, 1, 0),
      damage = Math.min(18, 7 + state.wave * .45);
    if (type === "runner") {
      if (origin.distanceTo(state.camera.position) < 2.2) {
        e.userData.swing = .45;
        e.userData.meleePending = true;
        api.enemySound(e, "enemySlash");
      }
      return;
    }
    e.userData.recoil = 1;
    api.enemySound(e, "enemyShot");
    api.glow(origin.clone().addScaledVector(aim, .7), 0xffbd64, .8, .08);
    e.userData.volley = (e.userData.volley ?? 0) + 1;
    const volley = e.userData.volley;
    if (e.userData.isBoss && e.userData.hp < e.userData.maxHp * .5) {
      for (let i = -2; i <= 2; i++) api.projectile(origin, aim.clone().applyAxisAngle(up, i * .13), 0xff647f, 10, true, damage, .15, "boss");
    }
    // Ring barrages alternate with aimed fans. Gaps stay wide enough to dodge.
    if (type === "heavy" && volley % 2 === 0) {
      for (let i = 0; i < 18; i++) {
        const angle = i / 18 * Math.PI * 2 + volley * .17,
          direction = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
        api.projectile(origin, direction, 0xffb45c, 6, true, damage, .17, "ring");
      }
    } else {
      const count = type === "heavy" ? 13 : type === "orbiter" ? 9 : 5,
        spread = type === "heavy" ? .14 : type === "orbiter" ? .17 : .13;
      const offset = type === "orbiter" ? Math.sin(volley * 1.7) * .2 : 0;
      for (let i = 0; i < count; i++) {
        const direction = aim.clone().applyAxisAngle(up, (i - (count - 1) / 2) * spread + offset);
        api.projectile(origin, direction, type === "heavy" ? 0xffb45c : type === "orbiter" ? 0xd484ff : 0xff637f, type === "heavy" ? 6 : type === "orbiter" ? 7 : 8, true, damage, type === "heavy" ? .17 : .13, "fan");
      }
    }
  }

  function updateEnemies(dt) {
    for (const e of state.enemies) {
      const d = e.userData;
      if (!d.alive) continue;
      const cfg = config.ENEMY_TYPES[d.type];
      const dx = state.camera.position.x - e.position.x,
        dz = state.camera.position.z - e.position.z,
        dist = Math.hypot(dx, dz),
        clear = api.movementClear(e.position, state.camera.position);
      let mx = 0,
        mz = 0;
      if (!clear || dist > cfg.range + (d.type === "runner" ? 0 : 1)) {
        const target = api.enemyDestination(e);
        mx = target.x - e.position.x;
        mz = target.z - e.position.z;
      } else if (d.type !== "runner") {
        const radial = dist < cfg.range - 2 ? -1 : 0;
        mx = dx / (dist || 1) * radial + dz / (dist || 1) * d.strafe * .75;
        mz = dz / (dist || 1) * radial - dx / (dist || 1) * d.strafe * .75;
      }
      const moveSpeed = d.speed + (d.isBoss ? 1.4 * Math.max(0, Math.min(1, (dist - 18) / 22)) : 0);
      const length = Math.hypot(mx, mz);
      if (length > 0) {
        mx = mx / length * moveSpeed;
        mz = mz / length * moveSpeed;
      }
      for (const other of state.enemies) {
        if (other === e || !other.userData.alive) continue;
        const sx = e.position.x - other.position.x,
          sz = e.position.z - other.position.z,
          dd = Math.hypot(sx, sz);
        if (dd > 0 && dd < 1.15) {
          mx += sx / dd * (1.15 - dd) * 3;
          mz += sz / dd * (1.15 - dd) * 3;
        }
      }
      d.vx += (mx - d.vx) * Math.min(1, 7 * dt);
      d.vz += (mz - d.vz) * Math.min(1, 7 * dt);
      const oldX = e.position.x,
        oldZ = e.position.z;
      const ex = e.position.x + d.vx * dt,
        ez = e.position.z + d.vz * dt;
      if (!api.blocked(ex, e.position.z, .5)) e.position.x = ex;else {
        d.vx = 0;
        d.strafe *= -1;
      }
      if (!api.blocked(e.position.x, ez, .5)) e.position.z = ez;else d.vz = 0;
      const angle = Math.atan2(dx, dz),
        delta = Math.atan2(Math.sin(angle - e.rotation.y), Math.cos(angle - e.rotation.y));
      e.rotation.y += delta * Math.min(1, 8 * dt);
      const actualSpeed = Math.hypot(e.position.x - oldX, e.position.z - oldZ) / Math.max(dt, .001);
      d.gait += (Math.min(1, actualSpeed / 1.5) - d.gait) * (1 - Math.exp(-10 * dt));
      const cadence = d.type === "heavy" ? 1.15 : d.type === "runner" ? 2.55 : 1.7;
      d.phase += dt * Math.PI * 2 * cadence * Math.min(1.4, actualSpeed / Math.max(1, d.speed));
      const stride = d.gait,
        moveAngle = Math.atan2(d.vx, d.vz) - e.rotation.y;
      for (let i = 0; i < 2; i++) {
        const leg = d.legs[i],
          phase = d.phase + i * Math.PI,
          lift = Math.max(0, Math.sin(phase)) * .12 * stride;
        const z = Math.cos(phase) * .18 * stride * Math.cos(moveAngle),
          y = -.65 + lift,
          L1 = .36,
          L2 = .31,
          distance = Math.max(.08, Math.min(L1 + L2 - .002, Math.hypot(y, z)));
        const kneeAngle = Math.PI - Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + L2 * L2 - distance * distance) / (2 * L1 * L2))));
        const hipAngle = Math.atan2(-z, -y) - Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + distance * distance - L2 * L2) / (2 * L1 * distance))));
        const blend = 1 - Math.exp(-16 * dt);
        leg.rotation.x += (hipAngle - leg.rotation.x) * blend;
        // Keep toes aligned with the torso; backpedal and strafe with signed strides.
        leg.rotation.y = 0;
        leg.rotation.z = Math.cos(phase) * .20 * stride * Math.sin(moveAngle);
        leg.userData.knee.rotation.x += (kneeAngle - leg.userData.knee.rotation.x) * blend;
        leg.userData.ankle.rotation.x = -(leg.rotation.x + leg.userData.knee.rotation.x);
        leg.userData.ankle.rotation.z = -leg.rotation.z;
      }
      d.recoil *= Math.exp(-13 * dt);
      d.rig.rotation.z = Math.sin(d.phase) * .025 * stride;
      d.rig.rotation.x = (d.type === "runner" ? .10 : .025) * stride;
      d.arms[0].rotation.x = -Math.sin(d.phase) * .24 * stride;
      if (d.type === "runner") {
        d.swing = Math.max(0, d.swing - dt);
        d.arms[1].rotation.x = d.swing > 0 ? -1.8 + Math.sin((1 - d.swing / .45) * Math.PI) * 2.5 : Math.sin(d.phase) * .35 * stride;
        if (d.meleePending && d.swing < .2) {
          d.meleePending = false;
          if (dist < 2.1 && Math.abs(state.camera.position.y - 1.4) < 1.3 && api.worldHit(e.position.clone().add(new THREE.Vector3(0, 1.3, 0)), state.camera.position) === null) api.hurtPlayer(14);
        }
        d.voice -= dt;
        if (d.voice <= 0) {
          api.enemySound(e, "enemyGrowl");
          d.voice = 4 + Math.random() * 4;
        }
      } else {
        const aimPitch = -Math.atan2(state.camera.position.y - (e.position.y + 1.2 * d.scale), Math.max(1, dist));
        d.arms[1].rotation.x += (aimPitch - d.recoil * .13 - d.arms[1].rotation.x) * (1 - Math.exp(-9 * dt));
        d.arms[0].rotation.x = -.35 + Math.sin(d.phase) * .045 * stride;
        d.held.position.z = -d.recoil * .035;
      }
      d.rig.position.y = (1 - Math.cos(d.phase * 2)) * .012 * stride + Math.sin(state.simTime * 2 + d.phase * .05) * .006 * (1 - stride);
      if (d.type !== "runner" && d.shot > .28 && d.shot - dt <= .28 && dist < 25) api.glow(e.position.clone().add(new THREE.Vector3(0, 1.4 * d.scale, 0)), d.type === "heavy" ? 0xffb45c : d.type === "orbiter" ? 0xd484ff : 0xff637f, .7, .22);
      d.shot -= dt;
      if (d.shot <= 0 && dist < 25) {
        enemyFire(e);
        d.shot = cfg.interval * (d.isBoss ? .7 : 1) * Math.max(.55, 1 - state.wave * .025) + Math.random() * .3;
      }
      if (state.gameOver) return;
    }
  }

  return { spawnWave, createEnemyBar, drawEnemyBar, damageEnemy, enemyFire, updateEnemies };
}


// Quelle: js/powerups.js
// Power-ups erzeugen, animieren, einsammeln und auslaufen lassen.
function createPowerups({ THREE, state, config, dom, api }) {
  function dropEnemyPowerup(enemy) {
    if (enemy.userData.isBoss) return spawnPowerup('heli', enemy.position);
    if (Math.random() >= config.LOOT.chance) return;
    const types = config.LOOT.types;
    spawnPowerup(types[Math.floor(Math.random() * types.length)], enemy.position);
  }

  function spawnPowerup(forced = null, position = null) {
    if (state.powerups.length >= 10) api.disposeObject(state.powerups.shift());
    const types = ["shield", "rocket", "rapid", "health", "ammo"],
      type = forced ?? (Math.random() < .035 ? "heli" : types[Math.floor(Math.random() * types.length)]);
    const labels = {
      dash: 'DASH CHARGE', grenade: 'FRAG GRENADE',
      heli: "HELICOPTER",
      shield: "SHIELD",
      rocket: "DAMAGE +50%",
      rapid: "RAPID FIRE",
      health: "HEAL +35",
      ammo: "AMMO"
    };
    const colors = {
      dash: '#76f5ee', grenade: '#ffd077',
      heli: "#87ffce",
      shield: "#68b5ff",
      rocket: "#ff9755",
      rapid: "#ffe06b",
      health: "#7df09b",
      ammo: "#d4b1ff"
    };
    let x = position?.x ?? 0,
      z = position?.z ?? 0;
    if (!position) for (let tries = 0; tries < 500; tries++) {
      x = (Math.random() * 2 - 1) * (config.ARENA - 8);
      z = (Math.random() * 2 - 1) * (config.ARENA - 8);
      if (!api.blocked(x, z, .7)) break;
    }
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const c = canvas.getContext("2d");
    c.fillStyle = "#101724ee";
    c.beginPath();
    c.roundRect(8, 8, 240, 240, 28);
    c.fill();
    c.strokeStyle = colors[type];
    c.lineWidth = 8;
    c.stroke();
    c.fillStyle = colors[type];
    c.strokeStyle = colors[type];
    c.lineWidth = 10;
    if (type === "heli") {
      c.fillRect(76, 83, 98, 42);
      c.fillRect(173, 93, 38, 12);
      c.fillRect(119, 61, 9, 22);
      c.fillRect(62, 54, 139, 8);
      c.fillRect(80, 143, 92, 7);
      c.fillRect(92, 122, 8, 23);
      c.fillRect(155, 122, 8, 23);
    }
    if (type === "health") {
      c.fillRect(110, 47, 36, 116);
      c.fillRect(70, 87, 116, 36);
    }
    if (type === "shield") {
      c.beginPath();
      c.moveTo(128, 40);
      c.lineTo(185, 62);
      c.lineTo(178, 121);
      c.quadraticCurveTo(168, 154, 128, 175);
      c.quadraticCurveTo(88, 154, 78, 121);
      c.lineTo(71, 62);
      c.closePath();
      c.stroke();
    }
    if (type === "rapid") {
      c.beginPath();
      c.moveTo(142, 35);
      c.lineTo(78, 111);
      c.lineTo(120, 111);
      c.lineTo(107, 178);
      c.lineTo(183, 92);
      c.lineTo(140, 92);
      c.closePath();
      c.fill();
    }
    if (type === "rocket") {
      c.beginPath();
      c.moveTo(128, 35);
      c.lineTo(149, 70);
      c.lineTo(149, 139);
      c.lineTo(107, 139);
      c.lineTo(107, 70);
      c.closePath();
      c.fill();
      c.fillRect(119, 148, 18, 30);
      c.beginPath();
      c.moveTo(104, 113);
      c.lineTo(83, 152);
      c.lineTo(104, 140);
      c.moveTo(152, 113);
      c.lineTo(173, 152);
      c.lineTo(152, 140);
      c.fill();
    }
    if (type === "ammo") for (let i = 0; i < 3; i++) {
      const xx = 78 + i * 38;
      c.fillRect(xx, 79, 25, 85);
      c.beginPath();
      c.moveTo(xx, 79);
      c.lineTo(xx + 12, 48);
      c.lineTo(xx + 25, 79);
      c.fill();
    }
    if (type === 'dash') for (const x of [70, 120]) {
      c.beginPath(); c.moveTo(x, 55); c.lineTo(x + 48, 108); c.lineTo(x, 165); c.stroke();
    }
    if (type === 'grenade') {
      c.beginPath(); c.ellipse(128, 119, 40, 49, -.25, 0, Math.PI * 2); c.fill();
      c.strokeRect(111, 50, 35, 22); c.beginPath(); c.arc(152, 53, 16, 0, Math.PI * 2); c.stroke();
    }
    c.font = "bold 24px Arial";
    c.textAlign = "center";
    c.fillText(labels[type], 128, 216);
    const texture = new THREE.CanvasTexture(canvas),
      sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false
      }));
    sprite.scale.set(1.5, 1.5, 1);
    const g = new THREE.Group();
    g.add(sprite);
    let baseY = 0;
    if (position) for (const obstacle of state.obstacles) {
      if (x < obstacle.minX || x > obstacle.maxX || z < obstacle.minZ || z > obstacle.maxZ) continue;
      const top = api.surfaceHeight(obstacle, x, z);
      if (top <= position.y + .5) baseY = Math.max(baseY, top);
    }
    g.position.set(x, baseY + 1.05, z);
    g.userData = {
      type,
      baseY,
      bob: Math.random() * 6.28,
      life: 40
    };
    state.scene.add(g);
    state.powerups.push(g);
  }

  function pickup(p) {
    if (p.userData.type === 'dash' && state.dashCharges >= 3) return;
    if (p.userData.type === 'grenade' && state.grenadeCharges >= 3) return;
    if (p.userData.type === "health" && state.hp >= state.maxHp) return;
    api.sfx("pickup");
    const type = p.userData.type;
    if (type === 'dash') state.dashCharges = Math.min(3, state.dashCharges + 1);
    if (type === 'grenade') state.grenadeCharges = Math.min(3, state.grenadeCharges + 1);
    if (type === "heli") api.activateHelicopter();
    if (type === "shield") {
      state.shieldTimer = 10;
      api.say("Shield · 10 seconds");
    }
    if (type === "rocket") {
      state.rocketTimer = 12;
      api.say("All weapons: +50% damage · 12 seconds");
    }
    if (type === "rapid") {
      state.rapidTimer = 12;
      api.say("Rapid fire · 12 seconds");
    }
    if (type === "health") {
      const gained = Math.min(35, state.maxHp - state.hp);
      state.hp += gained;
      api.say("+" + Math.round(gained) + " health · " + Math.round(state.hp) + " / 200 HP");
    }
    if (type === "ammo") {
      for (const [key, w] of Object.entries(config.WEAPONS)) state.magazines[key] = w.size;
      state.reloadTimer = 0;
      state.reloadWeapon = null;
      dom.reloadWrap.style.display = "none";
      api.restoreWeaponPose();
      api.say("All magazines refilled");
    }
    api.disposeObject(p);
    state.powerups = state.powerups.filter(x => x !== p);
    api.updateUI();
  }

  function updatePowerups(dt) {
    for (const p of [...state.powerups]) {
      p.userData.life -= dt;
      if (p.userData.life <= 0) {
        api.disposeObject(p);
        state.powerups = state.powerups.filter(x => x !== p);
        continue;
      }
      p.userData.bob += dt * 2.4;
      p.position.y = p.userData.baseY + 1.05 + Math.sin(p.userData.bob) * .17;
      if (Math.abs(state.feetY - p.userData.baseY) < 1.4 && Math.hypot(p.position.x - state.camera.position.x, p.position.z - state.camera.position.z) < 1.2) pickup(p);
    }
  }

  return { spawnPowerup, dropEnemyPowerup, pickup, updatePowerups };
}


// Quelle: js/collision.js
// Kollisionen mit Welt, Rampen, Dächern sowie Körper- und Kopftreffern.
function createCollision({ THREE, state, config, dom, api }) {
  function surfaceHeight(o, x, z) {
    if (o.roof) {
      const roof = o.roof;
      return roof.base + roof.rise * Math.max(0, 1 - Math.max(Math.abs(x - roof.x) / roof.halfX, Math.abs(z - roof.z) / roof.halfZ));
    }
    return o.ramp ? o.height * Math.max(0, Math.min(1, .5 + o.ramp.direction * ((o.ramp.axis === "x" ? x : z) - (o.ramp.axis === "x" ? o.ramp.x : o.ramp.z)) / o.ramp.length)) : o.height;
  }

  function overlaps(o, x, z, r = config.PLAYER_RADIUS) {
    return x + r > o.minX && x - r < o.maxX && z + r > o.minZ && z - r < o.maxZ;
  }

  function blocked(x, z, r = config.PLAYER_RADIUS) {
    if (x < -config.ARENA || x > config.ARENA || z < -config.ARENA || z > config.ARENA) return true;
    for (const o of state.obstacles) {
      if ((o.minY ?? 0) > 2.5) continue;
      if (x + r > o.minX && x - r < o.maxX && z + r > o.minZ && z - r < o.maxZ) return true;
    }
    return false;
  }

  function segmentBox(from, to, min, max) {
    let near = 0,
      far = 1;
    for (const axis of ["x", "y", "z"]) {
      const delta = to[axis] - from[axis];
      if (Math.abs(delta) < 1e-9) {
        if (from[axis] < min[axis] || from[axis] > max[axis]) return null;
        continue;
      }
      let a = (min[axis] - from[axis]) / delta,
        b = (max[axis] - from[axis]) / delta;
      if (a > b) [a, b] = [b, a];
      near = Math.max(near, a);
      far = Math.min(far, b);
      if (near > far) return null;
    }
    return near;
  }

  function rampHit(from, to, o, r = 0) {
    let near = 0,
      far = 1;
    const axis = o.ramp.axis,
      slope = o.height * o.ramp.direction / o.ramp.length,
      center = axis === "x" ? o.ramp.x : o.ramp.z;
    const planes = [[1, 0, 0, o.maxX + r], [-1, 0, 0, -o.minX + r], [0, 0, 1, o.maxZ + r], [0, 0, -1, -o.minZ + r], [0, -1, 0, r], [axis === "x" ? -slope : 0, 1, axis === "z" ? -slope : 0, o.height * .5 - slope * center + r]];
    for (const [a, b, c, d] of planes) {
      const value = a * from.x + b * from.y + c * from.z - d,
        delta = a * (to.x - from.x) + b * (to.y - from.y) + c * (to.z - from.z);
      if (Math.abs(delta) < 1e-9) {
        if (value > 0) return null;
        continue;
      }
      const t = -value / delta;
      if (delta < 0) near = Math.max(near, t);else far = Math.min(far, t);
      if (near > far) return null;
    }
    return near;
  }

  function roofHit(from, to, o, r = 0) {
    const f = o.roof,
      sx = f.rise / f.halfX,
      sz = f.rise / f.halfZ,
      peak = f.base + f.rise;
    // Clip against the four visible roof faces and the underside, not a tall box.
    const planes = [[sx, 1, 0, peak + sx * f.x + r * Math.hypot(sx, 1)], [-sx, 1, 0, peak - sx * f.x + r * Math.hypot(sx, 1)], [0, 1, sz, peak + sz * f.z + r * Math.hypot(sz, 1)], [0, 1, -sz, peak - sz * f.z + r * Math.hypot(sz, 1)], [0, -1, 0, -f.base + r]];
    let near = 0,
      far = 1;
    for (const [a, b, c, d] of planes) {
      const value = a * from.x + b * from.y + c * from.z - d,
        delta = a * (to.x - from.x) + b * (to.y - from.y) + c * (to.z - from.z);
      if (Math.abs(delta) < 1e-9) {
        if (value > 0) return null;
        continue;
      }
      const t = -value / delta;
      if (delta < 0) near = Math.max(near, t);else far = Math.min(far, t);
      if (near > far) return null;
    }
    return near;
  }

  function worldHit(from, to, r = 0) {
    let best = null;
    for (const o of state.obstacles) {
      const t = o.roof ? roofHit(from, to, o, r) : o.ramp ? rampHit(from, to, o, r) : segmentBox(from, to, {
        x: o.minX - r,
        y: (o.minY ?? 0) - r,
        z: o.minZ - r
      }, {
        x: o.maxX + r,
        y: o.height + r,
        z: o.maxZ + r
      });
      if (t !== null && (best === null || t < best)) best = t;
    }
    if (to.y <= r) {
      const t = from.y <= r ? 0 : (from.y - r) / (from.y - to.y);
      if (best === null || t < best) best = t;
    }
    return best;
  }

  function enemyIntersection(from, to, e, r = 0) {
    const scale = e.userData.scale ?? 1,
      bob = e.userData.rig?.position.y ?? 0,
      base = e.position.y + bob * scale;
    const body = segmentBox(from, to, {
      x: e.position.x - .4 * scale - r,
      y: e.position.y - r,
      z: e.position.z - .35 * scale - r
    }, {
      x: e.position.x + .4 * scale + r,
      y: base + 1.64 * scale + r,
      z: e.position.z + .35 * scale + r
    });
    const center = new THREE.Vector3(e.position.x, base + 1.91 * scale, e.position.z),
      radius = .29 * scale + r;
    const dx = to.x - from.x,
      dy = to.y - from.y,
      dz = to.z - from.z,
      ox = from.x - center.x,
      oy = from.y - center.y,
      oz = from.z - center.z;
    const aa = dx * dx + dy * dy + dz * dz,
      bb = 2 * (ox * dx + oy * dy + oz * dz),
      cc = ox * ox + oy * oy + oz * oz - radius * radius,
      disc = bb * bb - 4 * aa * cc;
    let head = null;
    if (cc <= 0) head = 0;else if (aa > 0 && disc >= 0) {
      const t = (-bb - Math.sqrt(disc)) / (2 * aa);
      if (t >= 0 && t <= 1) head = t;
    }
    if (head !== null && (body === null || head < body)) return {
      t: head,
      head: true
    };
    return body === null ? null : {
      t: body,
      head: false
    };
  }

  function enemyHit(from, to, e, r = 0) {
    return enemyIntersection(from, to, e, r)?.t ?? null;
  }

  return { surfaceHeight, overlaps, blocked, segmentBox, rampHit, roofHit, worldHit, enemyIntersection, enemyHit };
}


// Quelle: js/navigation.js
// Gemeinsames Navigationsraster für Wege um Deckung.
function createNavigation({ THREE, state, config, dom, api }) {
  function updateNavigation() {
    const tx = Math.round(state.camera.position.x),
      tz = Math.round(state.camera.position.z),
      key = tx + "," + tz;
    if (key === state.navTarget || state.simTime < state.navRefresh) return;
    state.navRefresh = state.simTime + .35;
    state.navTarget = key;
    state.navDistances.clear();
    const queue = [[tx, tz]];
    state.navDistances.set(key, 0);
    for (let i = 0; i < queue.length; i++) {
      const [x, z] = queue[i],
        distance = state.navDistances.get(x + "," + z);
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx,
          nz = z + dz,
          k = nx + "," + nz;
        if (state.navDistances.has(k) || api.blocked(nx, nz, .55)) continue;
        state.navDistances.set(k, distance + 1);
        queue.push([nx, nz]);
      }
    }
  }

  function movementClear(from, to) {
    for (const o of state.obstacles) if ((o.minY ?? 0) < 2.5 && api.segmentBox(from, to, {
      x: o.minX - .46,
      y: -1,
      z: o.minZ - .46
    }, {
      x: o.maxX + .46,
      y: 5,
      z: o.maxZ + .46
    }) !== null) return false;
    return true;
  }

  function enemyDestination(e) {
    if (movementClear(e.position, state.camera.position)) return state.camera.position;
    const x = Math.round(e.position.x),
      z = Math.round(e.position.z);
    let best = null,
      cost = Infinity;
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      const nx = x + dx,
        nz = z + dz,
        d = state.navDistances.get(nx + "," + nz);
      if (d === undefined) continue;
      const target = new THREE.Vector3(nx, 0, nz);
      const value = d + e.position.distanceTo(target);
      if (value < cost && movementClear(e.position, target)) {
        cost = value;
        best = target;
      }
    }
    return best ?? e.position;
  }

  return { updateNavigation, movementClear, enemyDestination };
}


// Quelle: js/helicopter.js
// Helikopter-Unterstützung und manuelles Fliegen.
function createHelicopter({ THREE, state, config, dom, api }) {
  function activateHelicopter() {
    state.heliTimer = 45;
    state.heliShot = 1;
    state.heliAudio = 0;
    if (!state.helicopter) {
      state.helicopter = new THREE.Group();
      const body = api.sphere(1, 0x394d50);
      body.scale.set(1.1, .85, 2);
      state.helicopter.add(body);
      const cockpit = api.sphere(.8, 0x81b8c2);
      cockpit.scale.set(1, .7, 1.05);
      cockpit.position.set(0, .1, -1.1);
      state.helicopter.add(cockpit);
      const tail = api.cube(.25, .28, 3.3, 0x445f5d);
      tail.position.set(0, .2, 2.65);
      state.helicopter.add(tail);
      const fin = api.cube(.12, 1, .75, 0x74ab99);
      fin.position.set(0, .65, 4);
      state.helicopter.add(fin);
      const rotor = new THREE.Group();
      rotor.position.y = 1.1;
      state.helicopter.add(rotor);
      state.helicopter.userData.rotor = rotor;
      for (const angle of [0, Math.PI / 2]) {
        const blade = api.cube(6.5, .055, .16, 0x23363b);
        blade.rotation.y = angle;
        rotor.add(blade);
      }
      for (const side of [-1, 1]) {
        const skid = api.cube(.09, .12, 2.7, 0x8ea69d);
        skid.position.set(side * .85, -1, 0);
        state.helicopter.add(skid);
      }
      state.helicopter.position.set(state.camera.position.x, 16, state.camera.position.z);
      state.scene.add(state.helicopter);
    }
    api.say("SUPER BONUS · Helicopter support for 45 seconds · H: take control");
  }

  function toggleHelicopter() {
    if (state.status !== "playing" || !state.helicopter || state.heliTimer <= 0) return;
    if (state.heliPiloting) {
      stopPiloting();
      api.say("Helicopter: autopilot");
      return;
    }
    state.pilotReturn = {
      position: state.camera.position.clone(),
      feetY: state.feetY,
      jumpVelocity: state.jumpVelocity,
      grounded: state.grounded,
      jumpsUsed: state.jumpsUsed,
      yaw: state.yaw,
      pitch: state.pitch
    };
    api.setScope(false);
    api.resetInput();
    state.heliPiloting = true;
    document.body.classList.add("piloting");
    state.heliManualCooldown = 0;
    state.helicopter.visible = false;
    state.weaponGroup.visible = false;
    if (state.playerBody) state.playerBody.visible = false;
    state.camera.position.copy(state.helicopter.position);
    state.feetY = state.camera.position.y - 1.7;
    state.pitch = 0;
    api.say("HELICOPTER · WASD to fly · Space to ascend · C to descend · H to exit");
    api.updateUI();
  }

  function stopPiloting() {
    if (!state.heliPiloting) return;
    state.heliPiloting = false;
    document.body.classList.remove("piloting");
    if (state.pilotReturn) {
      state.camera.position.copy(state.pilotReturn.position);
      state.feetY = state.pilotReturn.feetY;
      state.jumpVelocity = state.pilotReturn.jumpVelocity;
      state.grounded = state.pilotReturn.grounded;
      state.jumpsUsed = state.pilotReturn.jumpsUsed;
      state.yaw = state.pilotReturn.yaw;
      state.pitch = state.pilotReturn.pitch;
      state.camera.rotation.set(state.pitch, state.yaw, 0);
    }
    state.pilotReturn = null;
    api.resetInput();
    if (state.helicopter) state.helicopter.visible = true;
    if (state.playerBody) {
      state.playerBody.visible = true;
      api.updatePlayerBody(0);
    }
    if (state.weaponGroup) state.weaponGroup.visible = true;
    api.updateUI();
  }

  function updateHelicopter(dt) {
    if (!state.helicopter) return;
    state.heliTimer = Math.max(0, state.heliTimer - dt);
    if (state.heliTimer === 0) {
      stopPiloting();
      api.disposeObject(state.helicopter);
      state.helicopter = null;
      return;
    }
    const targetPos = new THREE.Vector3(Math.max(-42, Math.min(42, state.camera.position.x + Math.sin(state.simTime * .5) * 10)), Math.max(15, state.camera.position.y + 8), Math.max(-42, Math.min(42, state.camera.position.z + Math.cos(state.simTime * .5) * 10)));
    if (state.heliPiloting) {
      const forward = new THREE.Vector3(-Math.sin(state.yaw), 0, -Math.cos(state.yaw)),
        right = new THREE.Vector3(Math.cos(state.yaw), 0, -Math.sin(state.yaw)),
        wish = new THREE.Vector3();
      if (state.keys.KeyW) wish.add(forward);
      if (state.keys.KeyS) wish.sub(forward);
      if (state.keys.KeyA) wish.sub(right);
      if (state.keys.KeyD) wish.add(right);
      wish.addScaledVector(right, state.touchMove.x).addScaledVector(forward, -state.touchMove.y);
      if (wish.lengthSq() > 1) wish.normalize();
      wish.y = (state.keys.Space ? 1 : 0) - (state.keys.KeyC ? 1 : 0);
      const next = state.helicopter.position.clone().addScaledVector(wish, 12 * dt);
      next.x = Math.max(-43, Math.min(43, next.x));
      next.z = Math.max(-43, Math.min(43, next.z));
      next.y = Math.max(6, Math.min(35, next.y));
      if (api.worldHit(state.helicopter.position, next, 1) === null) state.helicopter.position.copy(next);
      state.camera.position.copy(state.helicopter.position);
      state.camera.rotation.set(state.pitch, state.yaw, 0);
      state.feetY = state.camera.position.y - 1.7;
      state.helicopter.rotation.y = state.yaw;
      state.heliManualCooldown = Math.max(0, state.heliManualCooldown - dt);
    } else {
      state.helicopter.position.lerp(targetPos, 1 - Math.exp(-dt * 1.4));
      state.helicopter.rotation.y = -state.simTime * .5;
    }
    state.helicopter.userData.rotor.rotation.y += dt * 38;
    state.heliShot -= dt;
    state.heliAudio -= dt;
    if (state.heliAudio <= 0) {
      api.sfx("helicopter");
      state.heliAudio = .45;
    }
    if (state.heliShot <= 0 && !state.heliPiloting) {
      let target = null,
        distance = Infinity;
      const origin = state.helicopter.position.clone().add(new THREE.Vector3(0, -1.2, 0));
      for (const e of state.enemies) {
        if (!e.userData.alive) continue;
        const center = e.position.clone().add(new THREE.Vector3(0, 1.2 * e.userData.scale, 0)),
          d = center.distanceTo(origin);
        if (d < 40 && d < distance && api.worldHit(origin, center) === null) {
          target = center;
          distance = d;
        }
      }
      if (target) {
        api.projectile(origin, target.sub(origin).normalize(), 0x80ffd3, 30, false, 110, .16, "heli");
        state.heliShot = .7;
      } else state.heliShot = .2;
    }
  }

  return { activateHelicopter, toggleHelicopter, stopPiloting, updateHelicopter };
}


// Quelle: js/projectiles.js
// Fliegende Geschosse, Explosionen und Spielerschaden.
function createProjectiles({ THREE, state, config, dom, api }) {
  function projectile(origin, dir, color, speed, enemy = false, damage = 10, radius = .07, kind = "bullet") {
    if (state.projectiles.length >= 600) return;
    const direction = dir.clone().normalize();
    const m = new THREE.Mesh(new THREE.SphereGeometry(radius * .82, 16, 12), new THREE.MeshBasicMaterial({
      color: kind === "plasma" ? 0x8edcff : enemy ? 0xfff5df : 0xecffff
    }));
    m.position.copy(origin);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
    const attachGlow = (size, z, opacity) => {
      const aura = api.glow(origin, color, size, 5);
      state.scene.remove(aura);
      state.effects = state.effects.filter(f => f.mesh !== aura);
      aura.position.set(0, 0, z);
      aura.material.opacity = opacity;
      m.add(aura);
    };
    if (kind !== "plasma") {
      attachGlow(radius * 5.5, 0, .85);
      attachGlow(radius * 3.4, -radius * 2.7, .48);
      attachGlow(radius * 2, -radius * 5, .18);
    }
    if (enemy) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius * 1.25, radius * .13, 6, 20), new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: .85,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }));
      m.add(ring);
    }
    state.scene.add(m);
    state.projectiles.push({
      mesh: m,
      dir: dir.clone().normalize(),
      speed,
      life: 5,
      enemy,
      damage,
      radius,
      kind
    });
  }

  function hurtPlayer(damage) {
    if (state.shieldTimer > 0 || state.gameOver) return;
    api.sfx("hurt");
    state.hp = Math.max(0, state.hp - damage);
    state.damageFlash = .65;
    api.updateUI();
    if (state.hp <= 0) api.endGame();
  }

  function explode(pos, damage = 155) {
    api.sfx("explosion");
    const blast = api.sphere(.4, 0xff8a40, 0xff8a40);
    blast.position.copy(pos);
    blast.material.transparent = true;
    state.scene.add(blast);
    state.effects.push({
      mesh: blast,
      life: .25,
      duration: .25,
      blast: true
    });
    for (const e of state.enemies) {
      if (!e.userData.alive) continue;
      const center = e.position.clone().add(new THREE.Vector3(0, 1.15 * e.userData.scale, 0)),
        distance = center.distanceTo(pos);
      if (distance < 4.5 && api.worldHit(pos, center) === null) api.damageEnemy(e, damage * Math.max(.3, 1 - distance / 6));
    }
    api.updateUI();
  }

  function updateProjectiles(dt) {
    for (let i = state.projectiles.length - 1; i >= 0; i--) {
      const p = state.projectiles[i],
        from = p.mesh.position.clone(),
        to = from.clone().addScaledVector(p.dir, p.speed * dt);
      let impact = api.worldHit(from, to, p.radius),
        target = null,
        headshot = false;
      if (p.enemy) {
        const c = state.camera.position,
          r = config.PLAYER_RADIUS + p.radius;
        const t = api.segmentBox(from, to, {
          x: c.x - r,
          y: state.feetY,
          z: c.z - r
        }, {
          x: c.x + r,
          y: state.feetY + 1.95,
          z: c.z + r
        });
        if (t !== null && (impact === null || t < impact)) {
          impact = t;
          target = "player";
        }
      } else {
        for (const e of state.enemies) {
          if (!e.userData.alive) continue;
          const hit = api.enemyIntersection(from, to, e, p.radius);
          if (hit && (impact === null || hit.t < impact)) {
            impact = hit.t;
            target = e;
            headshot = hit.head;
          }
        }
      }
      p.life -= dt;
      if (impact !== null) {
        p.mesh.position.copy(from).lerp(to, impact);
        if (p.enemy && target === "player") hurtPlayer(p.damage);
        if (!p.enemy && (p.kind === "rocket" || p.kind === "heli")) explode(p.mesh.position.clone(), p.damage);else if (!p.enemy && target) api.damageEnemy(target, p.damage, headshot);
      } else p.mesh.position.copy(to);
      if (impact !== null || p.life <= 0) {
        api.disposeObject(p.mesh);
        state.projectiles.splice(i, 1);
      }
      if (state.hp <= 0) {
        api.endGame();
        return;
      }
    }
  }

  return { projectile, hurtPlayer, explode, updateProjectiles };
}


// Quelle: js/simulation.js
// Timer, Reihenfolge der Komponentenupdates und Wellenwechsel.
function createSimulation({ THREE, state, config, dom, api }) {
  function step(dt) {
    if (state.status !== "playing" || state.gameOver) return;
    state.simTime += dt;
    state.hitMarkerTimer = Math.max(0, state.hitMarkerTimer - dt);
    document.getElementById("hitMarker").style.opacity = Math.min(1, state.hitMarkerTimer / .075);
    state.cooldown = Math.max(0, state.cooldown - dt);
    state.shieldTimer = Math.max(0, state.shieldTimer - dt);
    state.rapidTimer = Math.max(0, state.rapidTimer - dt);
    state.rocketTimer = Math.max(0, state.rocketTimer - dt);
    state.damageFlash = Math.max(0, state.damageFlash - dt * 2);
    document.getElementById("damageFlash").style.opacity = state.damageFlash;
    if (state.reloadTimer > 0) {
      state.reloadTimer -= dt;
      dom.reloadFill.style.width = (1 - Math.max(0, state.reloadTimer) / state.reloadDuration) * 100 + "%";
      if (state.reloadTimer <= 0) api.finishReload();
    }
    api.animateReload();
    api.updateAbilities(dt);
    state.weaponGroup.rotation.x *= Math.exp(-14 * dt);
    api.updatePlayerMovement(dt);
    api.updatePowerups(dt);
    api.updateHelicopter(dt);
    if (state.firing) api.shoot();
    api.updateNavigation();
    api.updateEnemies(dt);
    if (state.gameOver) return;
    api.updateProjectiles(dt);
    if (state.gameOver) return;
    for (let i = state.effects.length - 1; i >= 0; i--) {
      const fx = state.effects[i];
      fx.life -= dt;
      if (fx.life <= 0) {
        api.disposeObject(fx.mesh);
        state.effects.splice(i, 1);
      } else {
        fx.mesh.material.opacity = (fx.maxOpacity ?? 1) * fx.life / fx.duration;
        if (fx.blast) fx.mesh.scale.setScalar(1 + (1 - fx.life / fx.duration) * 10);
      }
    }
    state.enemies = state.enemies.filter(e => e.userData.alive);
    api.updateUI();
    if (state.enemies.length === 0) {
      if (state.nextWaveTimer === 0) {
        state.nextWaveTimer = 3;
        api.say("Wave cleared · Next wave in 3 seconds");
      }
      state.nextWaveTimer -= dt;
      if (state.nextWaveTimer <= 0) {
        state.wave++;
        api.spawnWave();
      }
    }
  }

  return { step };
}


// Quelle: js/input.js
// Tastatur, Maus, Pointer Lock, Touch und Spielstart.
function createInput({ THREE, state, config, dom, api }) {
  async function begin() {
    if (!state.renderer || state.status === "error") return;
    api.initSound();
    if (state.gameOver) api.resetGame();
    if (state.touchMode) {
      state.status = "playing";
      dom.start.style.display = "none";
      document.body.classList.add("playing");
      state.last = performance.now();
      return;
    }
    try {
      if (!state.renderer.domElement.requestPointerLock) throw new Error("Pointer Lock unavailable");
      await state.renderer.domElement.requestPointerLock();
    } catch (error) {
      api.showOverlay("Mouse control unavailable", "Open the HTML file in its own browser tab and allow mouse control.", "Try again");
    }
  }

  function setupInput() {
    dom.startBtn.addEventListener("click", begin);
    document.getElementById("mapSelect").addEventListener("change", e => {
      if (!config.MAPS[e.target.value] || !state.renderer) return;
      api.pause();
      state.activeMap = e.target.value;
      api.resetGame();
      state.status = "ready";
      api.showOverlay(config.MAPS[state.activeMap].name, "Explore ramps and elevated platforms. A boss arrives every fifth wave.", "LET’S GO →");
    });
    document.addEventListener("pointerlockchange", () => {
      if (document.pointerLockElement === state.renderer?.domElement) {
        if (state.gameOver || state.status === "error") {
          document.exitPointerLock();
          return;
        }
        state.status = "playing";
        api.resetInput();
        dom.start.style.display = "none";
        document.body.classList.add("playing");
        state.last = performance.now();
      } else api.pause();
    });
    document.addEventListener("pointerlockerror", () => {
      if (state.status !== "error") api.showOverlay("Mouse control blocked", "Open the game directly in a browser tab and try again.", "Try again");
    });
    document.addEventListener("mousemove", e => {
      if (state.status !== "playing" || document.pointerLockElement !== state.renderer?.domElement) return;
      state.yaw -= e.movementX * .0022 * (state.scoped ? .26 : 1);
      state.pitch = Math.max(-1.3, Math.min(1.3, state.pitch - e.movementY * .0020 * (state.scoped ? .26 : 1)));
    });
    document.addEventListener("contextmenu", e => {
      if (state.status === "playing") e.preventDefault();
    });
    document.addEventListener("mousedown", e => {
      if (state.status === "playing" && e.button === 2) api.setScope(!state.scoped);
      if (!state.touchMode && state.status === "playing" && e.button === 0) {
        state.firing = true;
        api.shoot();
      }
    });
    document.addEventListener("mouseup", e => {
      if (!state.touchMode && e.button === 0) state.firing = false;
    });
    document.addEventListener("keydown", e => {
      if (e.code === "KeyM" && !e.repeat && !["INPUT", "BUTTON"].includes(document.activeElement?.tagName)) {
        state.sound.enabled = !state.sound.enabled;
        api.initSound();
        api.refreshSoundUI();
        return;
      }
      if (e.code === "KeyP" || e.code === "Escape") {
        api.pause();
        return;
      }
      if (state.status !== "playing") return;
      if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && !e.repeat) { e.preventDefault(); api.useDash(); }
      if (e.code === 'KeyG' && !e.repeat) { e.preventDefault(); api.throwGrenade(); }
      if (e.code === "KeyH" && !e.repeat) api.toggleHelicopter();
      if (e.code === "KeyQ" && !e.repeat && !state.heliPiloting) api.setScope(!state.scoped);
      if (["KeyW", "KeyA", "KeyS", "KeyD", "KeyR", "Space", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "KeyQ", "KeyH", "KeyC"].includes(e.code)) e.preventDefault();
      state.keys[e.code] = true;
      if (e.code === "Space" && !e.repeat) api.jump();
      if (e.code === "KeyR") api.reload();
      for (const [key, w] of Object.entries(config.WEAPONS)) if (e.code === "Digit" + w.key) api.selectWeapon(key);
    });
    document.addEventListener("wheel", e => {
      if (state.status !== "playing") return;
      e.preventDefault();
      const list = config.weaponOrder;
      api.selectWeapon(list[(list.indexOf(state.currentWeapon) + (e.deltaY > 0 ? 1 : list.length - 1)) % list.length]);
    }, {
      passive: false
    });
    document.addEventListener("keyup", e => state.keys[e.code] = false);
    addEventListener("blur", () => {
      api.pause();
      api.resetInput();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        api.pause();
        api.resetInput();
      }
    });
    addEventListener("resize", () => {
      if (!state.camera || !state.renderer) return;
      state.camera.aspect = innerWidth / innerHeight;
      state.camera.updateProjectionMatrix();
      state.renderer.setSize(innerWidth, innerHeight);
    });
  }

  return { begin, setupInput };
}


// Quelle: js/touch-controls.js
// Each finger owns its gesture; releasing one finger never cancels another.
function createTouchControls({ THREE, state, config, api }) {
  const pointers = new Map();
  const isFiring = () => [...pointers.values()].some(pointer => pointer.role === 'fire');
  function resetTouchInput() {
    const captured = [...pointers.entries()]; pointers.clear();
    state.touchMove.x = state.touchMove.y = 0; state.firing = false;
    for (const [id, pointer] of captured) if (pointer.element.hasPointerCapture(id)) pointer.element.releasePointerCapture(id);
    document.getElementById('movePad')?.style.removeProperty('--stick-x');
    document.getElementById('movePad')?.style.removeProperty('--stick-y');
    document.querySelectorAll('#touchActions .pressed').forEach(button => button.classList.remove('pressed'));
  }
  function setupTouch() {
    const pad = document.getElementById('movePad'), canvas = state.renderer.domElement;
    function updateMove(event) {
      const bounds = pad.getBoundingClientRect(), range = bounds.width * .34;
      let x = (event.clientX - bounds.left - bounds.width / 2) / range;
      let y = (event.clientY - bounds.top - bounds.height / 2) / range;
      const length = Math.max(1, Math.hypot(x, y)); x /= length; y /= length;
      state.touchMove.x = x; state.touchMove.y = y;
      pad.style.setProperty('--stick-x', x * 30 + 'px'); pad.style.setProperty('--stick-y', y * 30 + 'px');
    }
    function bind(element, role, action) {
      element.addEventListener('pointerdown', event => {
        if (!state.touchMode || state.status !== 'playing' || (event.pointerType === 'mouse' && event.button !== 0)) return;
        event.preventDefault();
        if ((role === 'move' || role === 'look') && [...pointers.values()].some(pointer => pointer.role === role)) return;
        pointers.set(event.pointerId, { role, element, x:event.clientX, y:event.clientY });
        element.setPointerCapture(event.pointerId); element.classList.add('pressed');
        if (role === 'move') updateMove(event);
        if (role === 'fire') { state.firing = true; api.shoot(); }
        if (action) action();
      }, { passive:false });
      // Keyboard activation remains available; touch actions already ran on down.
      if (action) element.addEventListener('click', event => {
        event.preventDefault();
        if (event.detail === 0 && state.status === 'playing') action();
      });
    }
    bind(pad, 'move'); bind(canvas, 'look'); bind(document.getElementById('touchFire'), 'fire');
    const actions = {
      touchReload:api.reload, touchJump:api.jump, touchDash:api.useDash, touchGrenade:api.throwGrenade,
      touchPause:api.pause, touchHeli:api.toggleHelicopter,
      touchScope:() => api.setScope(!state.scoped),
      touchWeapon:() => api.selectWeapon(config.weaponOrder[(config.weaponOrder.indexOf(state.currentWeapon) + 1) % config.weaponOrder.length]),
      touchDown:() => {
        if (!state.heliPiloting || !state.helicopter) return;
        const next = state.helicopter.position.clone().add(new THREE.Vector3(0, -1.5, 0));
        if (next.y >= 6 && api.worldHit(state.helicopter.position, next, 1) === null) state.helicopter.position.copy(next);
      },
    };
    for (const [id, action] of Object.entries(actions)) bind(document.getElementById(id), 'action', action);
    window.addEventListener('pointermove', event => {
      const pointer = pointers.get(event.pointerId);
      if (!pointer || state.status !== 'playing') return;
      event.preventDefault();
      if (pointer.role === 'move') updateMove(event);
      // The fire finger also aims, allowing move + aim + fire with two thumbs.
      if (pointer.role === 'look' || pointer.role === 'fire') {
        const sensitivity = .004 * (state.scoped ? .26 : 1);
        state.yaw -= (event.clientX - pointer.x) * sensitivity;
        state.pitch = Math.max(-1.3, Math.min(1.3, state.pitch - (event.clientY - pointer.y) * sensitivity));
      }
      pointer.x = event.clientX; pointer.y = event.clientY;
    }, { passive:false });
    function release(event) {
      const pointer = pointers.get(event.pointerId); if (!pointer) return;
      pointers.delete(event.pointerId);
      if (pointer.role === 'move') {
        state.touchMove.x = state.touchMove.y = 0;
        pad.style.removeProperty('--stick-x'); pad.style.removeProperty('--stick-y');
      }
      if (![...pointers.values()].some(other => other.element === pointer.element)) pointer.element.classList.remove('pressed');
      state.firing = isFiring();
    }
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) window.addEventListener(type, release);
  }
  return { setupTouch, resetTouchInput };
}


// Quelle: js/abilities.js
// Stored pickups: directional dash and timed fragmentation grenades.
function createAbilities({ THREE, state, api }) {
  function resetAbilities() {
    for (const grenade of state.grenades ?? []) api.disposeObject(grenade.mesh);
    state.grenades = []; state.dashCharges = state.grenadeCharges = 0;
    state.dashTimer = 0; state.dashDirection = new THREE.Vector3();
  }
  function useDash() {
    if (state.status !== 'playing' || state.heliPiloting || state.dashTimer > 0 || !state.dashCharges) return;
    const x = Number(!!state.keys.KeyD) - Number(!!state.keys.KeyA) + state.touchMove.x;
    const z = Number(!!state.keys.KeyS) - Number(!!state.keys.KeyW) + state.touchMove.y;
    state.dashDirection.set(x, 0, z || (x ? 0 : -1)).applyAxisAngle(new THREE.Vector3(0, 1, 0), state.yaw).normalize();
    state.dashCharges--; state.dashTimer = .18;
    api.sfx('jump'); api.updateUI();
  }
  function throwGrenade() {
    if (state.status !== 'playing' || state.heliPiloting || !state.grenadeCharges) return;
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(.13, 16, 12), api.mat(0x657e55, .6, .35));
    mesh.position.copy(state.camera.position);
    const direction = state.camera.getWorldDirection(new THREE.Vector3());
    const velocity = direction.multiplyScalar(19); velocity.y += 4;
    state.scene.add(mesh);
    state.grenades.push({ mesh, velocity, fuse: 1.5 });
    state.grenadeCharges--; api.sfx('loaded'); api.updateUI();
  }
  function updateAbilities(dt) {
    state.dashTimer = Math.max(0, state.dashTimer - dt);
    for (let i = state.grenades.length - 1; i >= 0; i--) {
      const grenade = state.grenades[i], from = grenade.mesh.position.clone();
      grenade.velocity.y -= 18 * dt;
      const to = from.clone().addScaledVector(grenade.velocity, dt);
      const hit = api.worldHit(from, to, .13);
      grenade.fuse -= dt;
      if (hit !== null) grenade.fuse = 0;
      else if (to.y < .14) {
        to.y = .14; grenade.velocity.y = Math.abs(grenade.velocity.y) * .4;
        grenade.velocity.x *= .7; grenade.velocity.z *= .7;
      }
      grenade.mesh.position.copy(hit === null ? to : from);
      grenade.mesh.rotation.x += dt * 6;
      if (grenade.fuse <= 0) {
        api.explode(grenade.mesh.position.clone(), 230);
        api.disposeObject(grenade.mesh); state.grenades.splice(i, 1);
      }
    }
  }
  resetAbilities();
  return { resetAbilities, useDash, throwGrenade, updateAbilities };
}


// Quelle: js/main.js


let THREE;
try {
  THREE = await import("https://cdn.jsdelivr.net/npm/three@0.180.0/+esm");
} catch (error) {
  document.querySelector("#start p").textContent = "Could not load the 3D library. Check your internet connection and try again.";
  const retry = document.getElementById("startBtn");
  retry.disabled = false;
  retry.textContent = "Reload";
  retry.onclick = () => location.reload();
  throw error;
}

const dom = createDOM();
const state = createState(THREE, config);
// Systeme rufen einander über diesen Kontext auf; keine globalen Browser-Variablen.
const api = {};
const context = { THREE, state, config, dom, api };
Object.assign(api, createAudio(context));
Object.assign(api, createMusic(context));
Object.assign(api, createGraphics(context));
Object.assign(api, createHud(context));
Object.assign(api, createMinimap(context));
Object.assign(api, createLifecycle(context));
Object.assign(api, createWorld(context));
Object.assign(api, createMapArt(context));
Object.assign(api, createPlayer(context));
Object.assign(api, createWeapons(context));
Object.assign(api, createWeaponPreviews(context));
Object.assign(api, createEnemies(context));
Object.assign(api, createPowerups(context));
Object.assign(api, createCollision(context));
Object.assign(api, createNavigation(context));
Object.assign(api, createHelicopter(context));
Object.assign(api, createProjectiles(context));
Object.assign(api, createSimulation(context));
Object.assign(api, createInput(context));
Object.assign(api, createTouchControls(context));
Object.assign(api, createAbilities(context));
Object.assign(api, { init, loop });
api.setupSound();
api.setupMusic();
api.setupInput();
if (state.touchMode) document.body.classList.add("touch");

function init() {
  state.scene = new THREE.Scene();
  state.scene.background = new THREE.Color(0xc4c5bb);
  state.scene.fog = new THREE.Fog(0xc4c5bb, 65, 180);
  state.camera = new THREE.PerspectiveCamera(82, innerWidth / innerHeight, .1, 230);
  state.camera.position.set(0, 1.7, config.MAPS[state.activeMap].spawnZ);
  state.camera.rotation.order = "YXZ";
  state.renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "low-power"
  });
  state.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.35));
  state.renderer.setSize(innerWidth, innerHeight);
  state.renderer.outputColorSpace = THREE.SRGBColorSpace;
  dom.game.appendChild(state.renderer.domElement);
  state.worldAmbient = new THREE.HemisphereLight(0xd4e9ff, 0x66573f, 1.65);
  state.scene.add(state.worldAmbient);
  const sun = new THREE.DirectionalLight(0xffd4a1, 2.4);
  state.worldSun = sun;
  sun.position.set(-35, 45, -25);
  state.scene.add(sun);
  api.loadMap();
  api.buildWeapon();
  api.buildWeaponPreviews();
  api.buildPlayerBody();
  api.spawnWave();
  api.updateUI();
}

function loop(now) {
  const dt = Math.min(.033, (now - state.last) / 1000);
  state.last = now;
  api.step(dt);
  api.updateMusic();
  api.updateMinimap();
  state.renderer.render(state.scene, state.camera);
  requestAnimationFrame(loop);
}

try {
  api.init();
  api.setupTouch();
  dom.startBtn.disabled = false;
  dom.startBtn.textContent = "LET’S GO →";
  if (state.touchMode) dom.start.querySelector('p').textContent = 'Left thumb: move. Right thumb: hold Fire and drag to aim. Use another finger to jump or reload while moving and shooting. Landscape gives you more room.';
  state.renderer.domElement.addEventListener("webglcontextlost", e => {
    e.preventDefault();
    api.pause();
    state.status = "error";
    api.showOverlay("Graphics connection lost", "Reload the page to restart the game.", "Reload");
    dom.startBtn.onclick = () => location.reload();
  });
  requestAnimationFrame(t => {
    state.last = t;
    requestAnimationFrame(api.loop);
  });
} catch (error) {
  state.status = "error";
  dom.startBtn.disabled = false;
  api.showOverlay("Could not start the game", "WebGL is unavailable. Check hardware acceleration or try another browser.", "Reload");
  dom.startBtn.onclick = () => location.reload();
  console.error(error);
}


})().catch(error => window.dispatchEvent(new CustomEvent("arena-load-error", { detail: error })));
