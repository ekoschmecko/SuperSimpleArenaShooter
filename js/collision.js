// Kollisionen mit Welt, Rampen, Dächern sowie Körper- und Kopftreffern.
export function createCollision({ THREE, state, config, dom, api }) {
  function surfaceHeight(o, x, z) {
    if (o.roof) {
      const roof = o.roof;
      return roof.base + roof.rise * Math.max(0, 1 - Math.max(Math.abs(x - roof.x) / roof.halfX, Math.abs(z - roof.z) / roof.halfZ));
    }
    return o.ramp ? o.height * Math.max(0, Math.min(1, .5 + o.ramp.direction * ((o.ramp.axis === "x" ? x : z) - (o.ramp.axis === "x" ? o.ramp.x : o.ramp.z)) / o.ramp.length)) : o.height;
  }

  function overlaps(o, x, z, r = config.PLAYER_RADIUS) {
    return x + r > o.minX && x - r < o.maxX && z + r > o.minZ && z - r < o.maxZ;
  }

  function blocked(x, z, r = config.PLAYER_RADIUS) {
    if (x < -config.ARENA || x > config.ARENA || z < -config.ARENA || z > config.ARENA) return true;
    for (const o of state.obstacles) {
      if ((o.minY ?? 0) > 2.5) continue;
      if (x + r > o.minX && x - r < o.maxX && z + r > o.minZ && z - r < o.maxZ) return true;
    }
    return false;
  }

  function segmentBox(from, to, min, max) {
    let near = 0,
      far = 1;
    for (const axis of ["x", "y", "z"]) {
      const delta = to[axis] - from[axis];
      if (Math.abs(delta) < 1e-9) {
        if (from[axis] < min[axis] || from[axis] > max[axis]) return null;
        continue;
      }
      let a = (min[axis] - from[axis]) / delta,
        b = (max[axis] - from[axis]) / delta;
      if (a > b) [a, b] = [b, a];
      near = Math.max(near, a);
      far = Math.min(far, b);
      if (near > far) return null;
    }
    return near;
  }

  function rampHit(from, to, o, r = 0) {
    let near = 0,
      far = 1;
    const axis = o.ramp.axis,
      slope = o.height * o.ramp.direction / o.ramp.length,
      center = axis === "x" ? o.ramp.x : o.ramp.z;
    const planes = [[1, 0, 0, o.maxX + r], [-1, 0, 0, -o.minX + r], [0, 0, 1, o.maxZ + r], [0, 0, -1, -o.minZ + r], [0, -1, 0, r], [axis === "x" ? -slope : 0, 1, axis === "z" ? -slope : 0, o.height * .5 - slope * center + r]];
    for (const [a, b, c, d] of planes) {
      const value = a * from.x + b * from.y + c * from.z - d,
        delta = a * (to.x - from.x) + b * (to.y - from.y) + c * (to.z - from.z);
      if (Math.abs(delta) < 1e-9) {
        if (value > 0) return null;
        continue;
      }
      const t = -value / delta;
      if (delta < 0) near = Math.max(near, t);else far = Math.min(far, t);
      if (near > far) return null;
    }
    return near;
  }

  function roofHit(from, to, o, r = 0) {
    const f = o.roof,
      sx = f.rise / f.halfX,
      sz = f.rise / f.halfZ,
      peak = f.base + f.rise;
    // Clip against the four visible roof faces and the underside, not a tall box.
    const planes = [[sx, 1, 0, peak + sx * f.x + r * Math.hypot(sx, 1)], [-sx, 1, 0, peak - sx * f.x + r * Math.hypot(sx, 1)], [0, 1, sz, peak + sz * f.z + r * Math.hypot(sz, 1)], [0, 1, -sz, peak - sz * f.z + r * Math.hypot(sz, 1)], [0, -1, 0, -f.base + r]];
    let near = 0,
      far = 1;
    for (const [a, b, c, d] of planes) {
      const value = a * from.x + b * from.y + c * from.z - d,
        delta = a * (to.x - from.x) + b * (to.y - from.y) + c * (to.z - from.z);
      if (Math.abs(delta) < 1e-9) {
        if (value > 0) return null;
        continue;
      }
      const t = -value / delta;
      if (delta < 0) near = Math.max(near, t);else far = Math.min(far, t);
      if (near > far) return null;
    }
    return near;
  }

  function worldHit(from, to, r = 0) {
    let best = null;
    for (const o of state.obstacles) {
      const t = o.roof ? roofHit(from, to, o, r) : o.ramp ? rampHit(from, to, o, r) : segmentBox(from, to, {
        x: o.minX - r,
        y: (o.minY ?? 0) - r,
        z: o.minZ - r
      }, {
        x: o.maxX + r,
        y: o.height + r,
        z: o.maxZ + r
      });
      if (t !== null && (best === null || t < best)) best = t;
    }
    if (to.y <= r) {
      const t = from.y <= r ? 0 : (from.y - r) / (from.y - to.y);
      if (best === null || t < best) best = t;
    }
    return best;
  }

  function enemyIntersection(from, to, e, r = 0) {
    const scale = e.userData.scale ?? 1,
      bob = e.userData.rig?.position.y ?? 0,
      base = e.position.y + bob * scale;
    const body = segmentBox(from, to, {
      x: e.position.x - .4 * scale - r,
      y: e.position.y - r,
      z: e.position.z - .35 * scale - r
    }, {
      x: e.position.x + .4 * scale + r,
      y: base + 1.64 * scale + r,
      z: e.position.z + .35 * scale + r
    });
    const center = new THREE.Vector3(e.position.x, base + 1.91 * scale, e.position.z),
      radius = .29 * scale + r;
    const dx = to.x - from.x,
      dy = to.y - from.y,
      dz = to.z - from.z,
      ox = from.x - center.x,
      oy = from.y - center.y,
      oz = from.z - center.z;
    const aa = dx * dx + dy * dy + dz * dz,
      bb = 2 * (ox * dx + oy * dy + oz * dz),
      cc = ox * ox + oy * oy + oz * oz - radius * radius,
      disc = bb * bb - 4 * aa * cc;
    let head = null;
    if (cc <= 0) head = 0;else if (aa > 0 && disc >= 0) {
      const t = (-bb - Math.sqrt(disc)) / (2 * aa);
      if (t >= 0 && t <= 1) head = t;
    }
    if (head !== null && (body === null || head < body)) return {
      t: head,
      head: true
    };
    return body === null ? null : {
      t: body,
      head: false
    };
  }

  function enemyHit(from, to, e, r = 0) {
    return enemyIntersection(from, to, e, r)?.t ?? null;
  }

  return { surfaceHeight, overlaps, blocked, segmentBox, rampHit, roofHit, worldHit, enemyIntersection, enemyHit };
}
