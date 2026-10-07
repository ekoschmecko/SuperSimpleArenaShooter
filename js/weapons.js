// Weapon models, firing, scope, switching and reloading.
export function createWeapons({ THREE, state, config, dom, api }) {
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
