import { MUSIC } from './audio-config.js';

// Industrial-/Metal-Synth-Track: kurze Riffs, druckvolle Drums, Boss-Akzente.
export function createMusic({ state }) {
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
