// HUD-Anzeigen, Menütexte und gecachte DOM-Aktualisierungen.
export function createHud({ THREE, state, config, dom, api }) {
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
