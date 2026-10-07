// Pause, Spielende, Neustart und Zurücksetzen der Eingaben.
export function createLifecycle({ THREE, state, config, dom, api }) {
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
