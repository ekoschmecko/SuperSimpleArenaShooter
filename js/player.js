// Spielermodell, Bewegung, Schwerkraft und Doppelsprung.
export function createPlayer({ THREE, state, config, dom, api }) {
  function makePlayerArm(parent, x, y, z, side) {
    const hand = new THREE.Group();
    hand.position.set(x, y, z);
    parent.add(hand);
    const leather = api.mat(0x26343c, .82, .02);
    const fabric = api.mat(0x425760, .95, 0);
    const seamMaterial = api.mat(0x748b90, .8, 0);
    // A flattened palm and four curled fingers replace the stacked glove spheres.
    const palmShape = new THREE.Shape();
    palmShape.moveTo(-.041, -.052); palmShape.lineTo(.041, -.052);
    palmShape.lineTo(.048, .038); palmShape.quadraticCurveTo(0, .065, -.048, .038); palmShape.closePath();
    const palm = new THREE.Mesh(new THREE.ExtrudeGeometry(palmShape, {
      depth:.065, bevelEnabled:true, bevelSize:.009, bevelThickness:.009, bevelSegments:3, steps:1,
    }), leather);
    palm.position.z = -.032; hand.add(palm);
    const tube = (points, radius, material) => {
      const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
      const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, radius, 8, false), material);
      hand.add(mesh); return mesh;
    };
    for (let i = 0; i < 4; i++) {
      const y = .038 - i * .026;
      tube([[0,y,-.032],[-side*.035,y,-.059],[-side*.074,y,-.035],[-side*.082,y,.005]], .012, leather);
      tube([[side*.019,y,-.035],[side*.023,y+.004,-.022]], .005, seamMaterial);
    }
    tube([[side*.036,.04,.014],[side*.048,.063,-.016],[side*.018,.067,-.044]], .017, leather);
    // Wrist-to-elbow cross sections: the arm exits below the view, away from the lens.
    const centers = [[0,-.065,.025],[side*.025,-.14,.08],[side*.07,-.25,.14],[side*.13,-.42,.20]];
    const radii = [.048,.058,.073,.089], vertices = [], indices = [], rings = 16;
    for (let j = 0; j < centers.length; j++) for (let i = 0; i <= rings; i++) {
      const angle = i / rings * Math.PI * 2;
      vertices.push(centers[j][0] + Math.cos(angle)*radii[j], centers[j][1], centers[j][2]+Math.sin(angle)*radii[j]*.78);
      if (j && i < rings) { const n=j*(rings+1)+i; indices.push(n,n-rings-1,n+1,n+1,n-rings-1,n-rings); }
    }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
    geometry.setIndex(indices); geometry.computeVertexNormals();
    hand.add(new THREE.Mesh(geometry,fabric));
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(.054,.058,.045,20),leather);
    cuff.position.set(0,-.083,.035); hand.add(cuff);
    tube([[side*.052,-.15,.08],[side*.080,-.26,.14],[side*.123,-.38,.19]], .004, seamMaterial);
    return hand;
  }

  function buildPlayerBody() {
    state.playerBody = new THREE.Group();
    state.scene.add(state.playerBody);
    state.playerBody.userData.legs = [];
    const ellipsoid = (parent, rx, ry, rz, color, x, y, z) => {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), api.mat(color));
      mesh.scale.set(rx, ry, rz);
      mesh.position.set(x, y, z);
      parent.add(mesh);
      return mesh;
    };
    ellipsoid(state.playerBody, .26, .20, .17, 0x344552, 0, .91, .12);
    ellipsoid(state.playerBody, .27, .075, .19, 0x1b2a34, 0, 1.05, .12);
    const buckle = api.cube(.11, .085, .035, 0x9cac94);
    buckle.position.set(0, 1.05, -.105);
    state.playerBody.add(buckle);
    for (const side of [-1, 1]) {
      const leg = new THREE.Group();
      leg.position.set(side * .17, .84, .07);
      state.playerBody.add(leg);
      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(.128, .19, 6, 18), api.mat(0x425760));
      thigh.position.y = -.18;
      leg.add(thigh);
      ellipsoid(leg, .115, .13, .05, 0x263746, 0, -.15, -.1);
      const pocket = api.cube(.085, .18, .16, 0x314853);
      pocket.position.set(side * .12, -.15, .015);
      leg.add(pocket);
      const knee = new THREE.Group();
      knee.position.y = -.36;
      leg.add(knee);
      ellipsoid(knee, .125, .12, .105, 0x253c42, 0, 0, -.07);
      const shin = new THREE.Mesh(new THREE.CapsuleGeometry(.093, .13, 6, 18), api.mat(0x425760));
      shin.position.y = -.14;
      knee.add(shin);
      ellipsoid(knee, .08, .11, .025, 0x243441, 0, -.15, -.09);
      const foot = new THREE.Group();
      foot.position.set(0, -.31, 0);
      knee.add(foot);
      ellipsoid(foot, .113, .09, .20, 0x1d3036, 0, -.052, -.08);
      const sole = api.cube(.23, .04, .36, 0x101e24);
      sole.position.set(0, -.123, -.06);
      foot.add(sole);
      ellipsoid(foot, .10, .035, .095, 0x455a67, 0, -.035, -.20);
      for (const side of [-1, 1]) ellipsoid(foot, .012, .025, .12, 0x60747e, side * .105, -.077, -.075);
      for (let i = 0; i < 3; i++) {
        const lace = api.cube(.12, .012, .015, 0x92a59a);
        lace.position.set(0, .02, -.045 - i * .035);
        foot.add(lace);
      }
      state.playerBody.userData.legs.push({
        leg,
        knee,
        foot
      });
    }
    updatePlayerBody(0);
  }

  function updatePlayerBody(dt) {
    if (!state.playerBody) return;
    state.playerBody.position.set(state.camera.position.x, state.feetY, state.camera.position.z);
    state.playerBody.rotation.y = state.yaw;
    state.playerBody.visible = !state.scoped;
    const speed = Math.hypot(state.velocity.x, state.velocity.z),
      stride = Math.min(1, speed / config.MOVE_SPEED),
      phase = state.simTime * 12;
    const movementYaw = speed > .1 ? Math.atan2(-state.velocity.x, -state.velocity.z) - state.yaw : 0;
    for (let i = 0; i < 2; i++) {
      const {
          leg,
          knee,
          foot
        } = state.playerBody.userData.legs[i],
        swing = Math.sin(phase + i * Math.PI) * stride;
      leg.rotation.y = 0;
      leg.rotation.z = state.grounded ? swing * .20 * Math.sin(movementYaw) : 0;
      leg.rotation.x = state.grounded ? swing * .38 * Math.cos(movementYaw) : -.22;
      knee.rotation.x = state.grounded ? Math.max(0, -swing) * .55 : .52;
      foot.rotation.x = -(leg.rotation.x + knee.rotation.x) * .7;
      foot.rotation.z = -leg.rotation.z;
    }
  }

  function jump() {
    if (state.status !== "playing") return;
    if (state.heliPiloting) {
      if (state.touchMode && state.helicopter) {
        const next = state.helicopter.position.clone().add(new THREE.Vector3(0, 1.5, 0));
        if (next.y <= 35 && api.worldHit(state.helicopter.position, next, 1) === null) state.helicopter.position.copy(next);
      }
      return;
    }
    if (!state.grounded && state.jumpsUsed === 0) state.jumpsUsed = 1;
    if (state.jumpsUsed >= 2) return;
    state.jumpsUsed++;
    api.sfx("jump");
    state.jumpVelocity = config.JUMP_SPEED * (state.jumpsUsed === 2 ? .95 : 1);
    state.grounded = false;
    if (state.jumpsUsed === 2) {
      api.glow(state.camera.position.clone().add(new THREE.Vector3(0, -1.2, 0)), 0x7cf1df, 1.2, .2);
    }
    api.updateJumpUI();
  }

  function updatePlayerMovement(dt) {
    if (!state.heliPiloting) {
      const forward = new THREE.Vector3(-Math.sin(state.yaw), 0, -Math.cos(state.yaw)),
        right = new THREE.Vector3(Math.cos(state.yaw), 0, -Math.sin(state.yaw)),
        wish = new THREE.Vector3();
      if (state.keys.KeyW) wish.add(forward);
      if (state.keys.KeyS) wish.sub(forward);
      if (state.keys.KeyD) wish.add(right);
      if (state.keys.KeyA) wish.sub(right);
      wish.addScaledVector(right, state.touchMove.x).addScaledVector(forward, -state.touchMove.y);
      if (wish.lengthSq() > 0) {
        const speed = config.MOVE_SPEED * (state.hp > 100 ? config.OVERHEALTH_SPEED_MULTIPLIER : 1);
        wish.normalize().multiplyScalar(speed);
        state.velocity.x += (wish.x - state.velocity.x) * Math.min(1, config.ACCEL * dt);
        state.velocity.z += (wish.z - state.velocity.z) * Math.min(1, config.ACCEL * dt);
      } else {
        state.velocity.x *= Math.max(0, 1 - config.FRICTION * dt);
        state.velocity.z *= Math.max(0, 1 - config.FRICTION * dt);
      }
      const oldFeet = state.feetY,
        wasGrounded = state.grounded;
      if (state.dashTimer > 0) state.velocity.copy(state.dashDirection).multiplyScalar(32);
      const stepHeight = .3;
      state.jumpVelocity -= config.GRAVITY * dt;
      state.feetY = Math.max(0, state.feetY + state.jumpVelocity * dt);
      const playerBlocked = (x, z) => Math.abs(x) > config.ARENA - .5 || Math.abs(z) > config.ARENA - .5 || state.obstacles.some(o => {
        if (!api.overlaps(o, x, z)) return false;
        const top = api.surfaceHeight(o, x, z),
          bottom = o.minY ?? 0;
        if (top <= oldFeet + (wasGrounded ? stepHeight : .015)) return false;
        return state.feetY < top - .015 && state.feetY + 1.8 > bottom + .015;
      });
      const nx = state.camera.position.x + state.velocity.x * dt,
        nz = state.camera.position.z + state.velocity.z * dt;
      if (state.dashTimer > 0 && api.worldHit(new THREE.Vector3(state.camera.position.x, state.feetY + .9, state.camera.position.z), new THREE.Vector3(nx, state.feetY + .9, nz), config.PLAYER_RADIUS) !== null) {
        state.dashTimer = 0; state.velocity.set(0, 0, 0);
        return;
      }
      if (!playerBlocked(nx, state.camera.position.z)) state.camera.position.x = nx;else state.velocity.x = 0;
      if (!playerBlocked(state.camera.position.x, nz)) state.camera.position.z = nz;else state.velocity.z = 0;
      let floor = 0,
        support = 0;
      for (const o of state.obstacles) {
        if (!api.overlaps(o, state.camera.position.x, state.camera.position.z)) continue;
        const top = api.surfaceHeight(o, state.camera.position.x, state.camera.position.z);
        if (top <= oldFeet + (wasGrounded ? stepHeight : .02)) {
          support = Math.max(support, top);
          if (state.feetY <= top) floor = Math.max(floor, top);
        }
        if (!o.ramp && (o.minY ?? 0) > 0 && oldFeet + 1.8 <= o.minY + .02 && state.feetY + 1.8 > o.minY) {
          state.feetY = o.minY - 1.8;
          state.jumpVelocity = Math.min(0, state.jumpVelocity);
        }
      }
      if (wasGrounded && state.jumpVelocity <= 0 && Math.abs(oldFeet - support) <= stepHeight) {
        state.feetY = support;
        floor = support;
      }
      state.grounded = state.feetY <= floor && state.jumpVelocity <= 0;
      if (state.grounded) {
        state.feetY = floor;
        state.jumpVelocity = 0;
        state.jumpsUsed = 0;
      }
      state.camera.position.y = state.feetY + 1.7;
      state.camera.rotation.y = state.yaw;
      state.camera.rotation.x = state.pitch;
      updatePlayerBody(dt);
      const moving = Math.hypot(state.velocity.x, state.velocity.z) > .2;
      state.weaponGroup.position.x = moving ? Math.sin(state.simTime * 11) * .022 : 0;
      state.weaponGroup.position.y = moving && state.grounded ? Math.abs(Math.cos(state.simTime * 11)) * .024 : 0;
    }
  }

  return { makePlayerArm, buildPlayerBody, updatePlayerBody, jump, updatePlayerMovement };
}
