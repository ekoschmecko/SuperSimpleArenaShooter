// Helikopter-Unterstützung und manuelles Fliegen.
export function createHelicopter({ THREE, state, config, dom, api }) {
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
