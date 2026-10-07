import { AUDIO } from './audio-config.js';

// Schussgeräusche aus Knall, Druck, kurzem Raumklang und Verschlussmechanik.
export function createAudio({ THREE, state, config, dom, api }) {
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
