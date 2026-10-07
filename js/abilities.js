// Stored pickups: directional dash and timed fragmentation grenades.
export function createAbilities({ THREE, state, api }) {
  function resetAbilities() {
    for (const grenade of state.grenades ?? []) api.disposeObject(grenade.mesh);
    state.grenades = []; state.dashCharges = state.grenadeCharges = 0;
    state.dashTimer = 0; state.dashDirection = new THREE.Vector3();
  }
  function useDash() {
    if (state.status !== 'playing' || state.heliPiloting || state.dashTimer > 0 || !state.dashCharges) return;
    const x = Number(!!state.keys.KeyD) - Number(!!state.keys.KeyA) + state.touchMove.x;
    const z = Number(!!state.keys.KeyS) - Number(!!state.keys.KeyW) + state.touchMove.y;
    state.dashDirection.set(x, 0, z || (x ? 0 : -1)).applyAxisAngle(new THREE.Vector3(0, 1, 0), state.yaw).normalize();
    state.dashCharges--; state.dashTimer = .18;
    api.sfx('jump'); api.updateUI();
  }
  function throwGrenade() {
    if (state.status !== 'playing' || state.heliPiloting || !state.grenadeCharges) return;
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(.13, 16, 12), api.mat(0x657e55, .6, .35));
    mesh.position.copy(state.camera.position);
    const direction = state.camera.getWorldDirection(new THREE.Vector3());
    const velocity = direction.multiplyScalar(19); velocity.y += 4;
    state.scene.add(mesh);
    state.grenades.push({ mesh, velocity, fuse: 1.5 });
    state.grenadeCharges--; api.sfx('loaded'); api.updateUI();
  }
  function updateAbilities(dt) {
    state.dashTimer = Math.max(0, state.dashTimer - dt);
    for (let i = state.grenades.length - 1; i >= 0; i--) {
      const grenade = state.grenades[i], from = grenade.mesh.position.clone();
      grenade.velocity.y -= 18 * dt;
      const to = from.clone().addScaledVector(grenade.velocity, dt);
      const hit = api.worldHit(from, to, .13);
      grenade.fuse -= dt;
      if (hit !== null) grenade.fuse = 0;
      else if (to.y < .14) {
        to.y = .14; grenade.velocity.y = Math.abs(grenade.velocity.y) * .4;
        grenade.velocity.x *= .7; grenade.velocity.z *= .7;
      }
      grenade.mesh.position.copy(hit === null ? to : from);
      grenade.mesh.rotation.x += dt * 6;
      if (grenade.fuse <= 0) {
        api.explode(grenade.mesh.position.clone(), 230);
        api.disposeObject(grenade.mesh); state.grenades.splice(i, 1);
      }
    }
  }
  resetAbilities();
  return { resetAbilities, useDash, throwGrenade, updateAbilities };
}
