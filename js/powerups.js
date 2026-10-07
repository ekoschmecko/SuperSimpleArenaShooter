// Power-ups erzeugen, animieren, einsammeln und auslaufen lassen.
export function createPowerups({ THREE, state, config, dom, api }) {
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
