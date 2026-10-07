import * as config from './config.js';
import { createState } from './state.js';
import { createDOM } from './dom.js';
import { createAudio } from './audio.js';
import { createMusic } from './music.js';
import { createGraphics } from './graphics.js';
import { createHud } from './hud.js';
import { createMinimap } from './minimap.js';
import { createLifecycle } from './lifecycle.js';
import { createWorld } from './world.js';
import { createMapArt } from './map-art.js';
import { createPlayer } from './player.js';
import { createWeapons } from './weapons.js';
import { createWeaponPreviews } from './weapon-previews.js';
import { createEnemies } from './enemies.js';
import { createPowerups } from './powerups.js';
import { createCollision } from './collision.js';
import { createNavigation } from './navigation.js';
import { createHelicopter } from './helicopter.js';
import { createProjectiles } from './projectiles.js';
import { createSimulation } from './simulation.js';
import { createInput } from './input.js';
import { createTouchControls } from './touch-controls.js';
import { createAbilities } from './abilities.js';

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
