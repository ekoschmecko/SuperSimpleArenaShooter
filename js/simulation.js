// Timer, Reihenfolge der Komponentenupdates und Wellenwechsel.
export function createSimulation({ THREE, state, config, dom, api }) {
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
