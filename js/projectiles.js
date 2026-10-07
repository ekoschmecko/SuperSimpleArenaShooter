// Fliegende Geschosse, Explosionen und Spielerschaden.
export function createProjectiles({ THREE, state, config, dom, api }) {
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
