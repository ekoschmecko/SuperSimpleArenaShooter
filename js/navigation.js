// Gemeinsames Navigationsraster für Wege um Deckung.
export function createNavigation({ THREE, state, config, dom, api }) {
  function updateNavigation() {
    const tx = Math.round(state.camera.position.x),
      tz = Math.round(state.camera.position.z),
      key = tx + "," + tz;
    if (key === state.navTarget || state.simTime < state.navRefresh) return;
    state.navRefresh = state.simTime + .35;
    state.navTarget = key;
    state.navDistances.clear();
    const queue = [[tx, tz]];
    state.navDistances.set(key, 0);
    for (let i = 0; i < queue.length; i++) {
      const [x, z] = queue[i],
        distance = state.navDistances.get(x + "," + z);
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx,
          nz = z + dz,
          k = nx + "," + nz;
        if (state.navDistances.has(k) || api.blocked(nx, nz, .55)) continue;
        state.navDistances.set(k, distance + 1);
        queue.push([nx, nz]);
      }
    }
  }

  function movementClear(from, to) {
    for (const o of state.obstacles) if ((o.minY ?? 0) < 2.5 && api.segmentBox(from, to, {
      x: o.minX - .46,
      y: -1,
      z: o.minZ - .46
    }, {
      x: o.maxX + .46,
      y: 5,
      z: o.maxZ + .46
    }) !== null) return false;
    return true;
  }

  function enemyDestination(e) {
    if (movementClear(e.position, state.camera.position)) return state.camera.position;
    const x = Math.round(e.position.x),
      z = Math.round(e.position.z);
    let best = null,
      cost = Infinity;
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      const nx = x + dx,
        nz = z + dz,
        d = state.navDistances.get(nx + "," + nz);
      if (d === undefined) continue;
      const target = new THREE.Vector3(nx, 0, nz);
      const value = d + e.position.distanceTo(target);
      if (value < cost && movementClear(e.position, target)) {
        cost = value;
        best = target;
      }
    }
    return best ?? e.position;
  }

  return { updateNavigation, movementClear, enemyDestination };
}
