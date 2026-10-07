// Wellen, Gegner und Bosse: Modelle, Navigation, Angriffe und Damage.
export function createEnemies({ THREE, state, config, dom, api }) {
  function spawnWave() {
    state.nextWaveTimer = 0;
    api.sfx("wave");
    const count = Math.min(6 + state.wave * 2, 28),
      types = state.wave === 1 ? ["runner", "soldier", "orbiter"] : Object.keys(config.ENEMY_TYPES);
    for (let i = 0; i < count; i++) {
      const isBoss = state.wave % 5 === 0 && i === 0,
        type = isBoss ? "heavy" : types[i % types.length],
        cfg = config.ENEMY_TYPES[type],
        e = new THREE.Group(),
        rig = new THREE.Group();
      e.add(rig);
      const part = (w, h, d, c, x, y, z, parent = rig) => {
        const m = api.cube(w, h, d, c);
        m.position.set(x, y, z);
        parent.add(m);
        return m;
      };
      // Smooth stylised creatures: connected silhouettes, restrained detail, shared local materials.
      const palettes = {
          runner: {
            skin: 0xb76555,
            shade: 0x754b4c,
            light: 0xd69478,
            armor: 0x343d48,
            trim: 0xc59c63,
            eye: 0xffc46d
          },
          soldier: {
            skin: 0x7d9976,
            shade: 0x506d61,
            light: 0xb2c8a0,
            armor: 0x384d50,
            trim: 0xc5ad76,
            eye: 0xf4d99b
          },
          heavy: {
            skin: 0x888b9e,
            shade: 0x5b6078,
            light: 0xb7b6c3,
            armor: 0x44495b,
            trim: 0xb5a7a0,
            eye: 0xa8dafa
          },
          orbiter: {
            skin: 0x69a8ad,
            shade: 0x466b81,
            light: 0xa5d6cd,
            armor: 0x354655,
            trim: 0xa1c4c1,
            eye: 0x93f2e0
          }
        },
        palette = palettes[type],
        localMaterials = new Map(),
        smoothSphere = new THREE.SphereGeometry(1, 24, 16);
      const surface = color => {
        if (!localMaterials.has(color)) localMaterials.set(color, api.mat(color, .65, .03));
        return localMaterials.get(color);
      };
      const flesh = (rx, ry, rz, color, x, y, z, parent = rig) => {
        const m = new THREE.Mesh(smoothSphere, surface(color));
        m.scale.set(rx, ry, rz);
        m.position.set(x, y, z);
        parent.add(m);
        return m;
      };
      const capsule = (radius, length, color, x, y, z, parent = rig) => {
        const m = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 6, 16), surface(color));
        m.position.set(x, y, z);
        parent.add(m);
        return m;
      };
      const horn = (side, large = false) => {
        const path = new THREE.CatmullRomCurve3([new THREE.Vector3(side * .21, 2.08, -.025), new THREE.Vector3(side * (large ? .37 : .30), 2.22, -.065), new THREE.Vector3(side * (large ? .42 : .31), large ? 2.40 : 2.32, -.16), new THREE.Vector3(side * (large ? .34 : .23), large ? 2.49 : 2.37, -.24)]);
        // Tapered cross-sections along the curve avoid straight cone spikes.
        const rings = 14,
          sides = 10,
          vertices = [],
          indices = [],
          frames = path.computeFrenetFrames(rings, false);
        for (let j = 0; j <= rings; j++) {
          const center = path.getPointAt(j / rings),
            radius = (large ? .10 : .075) * Math.pow(1 - j / rings, .8) + .003;
          for (let k = 0; k <= sides; k++) {
            const angle = k / sides * Math.PI * 2,
              v = center.clone().addScaledVector(frames.normals[j], Math.cos(angle) * radius).addScaledVector(frames.binormals[j], Math.sin(angle) * radius);
            vertices.push(v.x, v.y, v.z);
            if (j < rings && k < sides) {
              const n = j * (sides + 1) + k;
              indices.push(n, n + sides + 1, n + 1, n + 1, n + sides + 1, n + sides + 2);
            }
          }
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        rig.add(new THREE.Mesh(geometry, surface(palette.trim)));
      };
      // A single shaped torso connects hips, waist, chest and neck.
      const profile = [[0, .76], [.22, .79], [.27, .94], [.25, 1.06], [.32, 1.22], [type === "heavy" ? .43 : .36, 1.42], [.30, 1.56], [.15, 1.66], [.13, 1.74], [0, 1.75]].map(([r, y]) => new THREE.Vector2(r, y));
      const torso = new THREE.Mesh(new THREE.LatheGeometry(profile, 28), surface(palette.skin));
      torso.scale.z = .76;
      rig.add(torso);
      flesh(.28, .26, .265, palette.skin, 0, 1.92, 0);
      flesh(.22, .125, .19, palette.light, 0, 1.79, .07);
      // Expressive eyes, cheek planes and a small muzzle rather than exposed teeth.
      flesh(.16, .075, .075, palette.shade, 0, 1.795, .218);
      flesh(.165, .042, .062, palette.skin, 0, 1.817, .24);
      flesh(.067, .06, .07, palette.light, 0, 1.91, .235);
      for (const side of [-1, 1]) {
        flesh(.09, .066, .032, palette.shade, side * .112, 1.971, .237);
        const iris = new THREE.Mesh(smoothSphere, api.mat(palette.eye, .36, .03, palette.eye));
        iris.material.emissiveIntensity = .35;
        iris.scale.set(.054, .043, .026);
        iris.position.set(side * .112, 1.972, .267);
        rig.add(iris);
        flesh(.014, .03, .01, 0x19272e, side * .112, 1.972, .292);
        flesh(.012, .012, .007, 0xeaf9f6, side * .099, 1.988, .294);
        const brow = flesh(.109, .034, .058, palette.skin, side * .12, 2.024, .22);
        brow.rotation.z = side * -.17;
        flesh(.08, .07, .07, palette.light, side * .176, 1.862, .177);
        if (type === "runner" || type === "heavy") horn(side, type === "heavy");
        if (type === "soldier") {
          const ear = flesh(.085, .20, .075, palette.skin, side * .30, 1.99, -.015);
          ear.rotation.z = side * -.85;
          const inner = flesh(.044, .125, .026, palette.light, side * .322, 1.997, .043);
          inner.rotation.z = side * -.85;
        }
        if (type === "orbiter") {
          const fin = flesh(.055, .26, .14, palette.shade, side * .265, 2.035, -.075);
          fin.rotation.z = side * -.38;
          flesh(.029, .18, .07, palette.light, side * .28, 2.06, -.02);
        }
      }
      // Soft armour panels and leather cuffs keep the armed silhouettes coherent.
      flesh(.28, .27, .075, palette.armor, 0, 1.35, .24);
      for (const side of [-1, 1]) {
        flesh(.11, .19, .045, palette.trim, side * .19, 1.37, .26);
        flesh(.035, .032, .014, palette.eye, side * .19, 1.46, .303);
      }
      if (type !== 'runner') {
        flesh(.285, .13, .24, palette.armor, 0, 2.08, -.035);
        flesh(.21, .032, .032, palette.trim, 0, 2.065, .205);
      }
      flesh(.17, .20, .026, palette.shade, 0, 1.36, .312);
      flesh(.045, .065, .023, palette.trim, 0, 1.44, .34);
      flesh(.265, .075, .215, palette.armor, 0, .91, 0);
      const legs = [],
        arms = [];
      for (const side of [-1, 1]) {
        const leg = new THREE.Group();
        leg.position.set(side * .18, .85, 0);
        rig.add(leg);
        capsule(.13, .21, palette.skin, 0, -.16, -.015, leg);
        flesh(.12, .13, .13, palette.shade, 0, -.36, .04, leg);
        flesh(.11, .105, .045, palette.armor, 0, -.34, .15, leg);
        capsule(.095, .19, palette.skin, 0, -.53, .025, leg);
        flesh(.115, .10, .12, palette.armor, 0, -.64, .035, leg);
        flesh(.14, .105, .23, palette.shade, 0, -.735, .11, leg);
        for (const toe of [-1, 1]) flesh(.053, .04, .09, palette.trim, toe * .061, -.759, .275, leg);
        const knee = new THREE.Group(),
          ankle = new THREE.Group();
        knee.position.y = -.36;
        ankle.position.y = -.31;
        for (const child of [...leg.children]) if (child.position.y < -.4) {
          leg.remove(child);
          child.position.y += .36;
          knee.add(child);
        }
        for (const child of [...knee.children]) if (child.position.y < -.30) {
          knee.remove(child);
          child.position.y += .31;
          ankle.add(child);
        }
        knee.add(ankle);
        leg.add(knee);
        leg.userData = {
          knee,
          ankle
        };
        legs.push(leg);
        const arm = new THREE.Group();
        arm.position.set(side * .43, 1.56, 0);
        rig.add(arm);
        flesh(type === "heavy" ? .22 : .16, .17, .18, palette.skin, 0, -.06, 0, arm);
        capsule(.115, .16, palette.skin, 0, -.22, 0, arm);
        capsule(.09, .12, palette.skin, 0, -.43, .008, arm);
        flesh(.11, .09, .12, palette.armor, 0, -.47, .01, arm);
        flesh(.113, .105, .108, palette.skin, 0, -.575, .038, arm);
        flesh(.036, .06, .056, palette.light, -side * .087, -.575, .095, arm);
        const shoulder = flesh(type === "heavy" ? .24 : .175, .125, .21, palette.armor, side * .018, .035, 0, arm);
        flesh(.12, .025, .14, palette.trim, side * .018, .14, .01, arm);
        arms.push(arm);
      }
      const held = new THREE.Group();
      held.position.set(0, -.57, 0);
      arms[1].add(held);
      if (type === "runner") {
        part(.1, .26, .1, 0x382e25, 0, -.08, 0, held);
        part(.28, .055, .16, 0x737d7d, 0, .065, 0, held);
        const blade = part(.16, .78, .035, 0xc5cfce, 0, .46, 0, held);
        blade.rotation.z = -.12;
        part(.045, .69, .04, 0xe8eeed, -.055, .46, .006, held);
      } else {
        part(.19, .17, .55, 0x29312e, 0, 0, .23, held);
        part(.14, .15, .27, 0x685c46, 0, 0, -.13, held);
        part(.1, .25, .15, 0x1d2325, 0, -.17, .2, held);
        part(.15, .12, .33, 0x5a6256, 0, .01, .56, held);
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(type === "heavy" ? .065 : .035, type === "heavy" ? .065 : .035, .48, 16), api.mat(0x1b2328, .35, .65));
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, .02, .9);
        held.add(barrel);
        part(.04, .09, .08, 0x1f292b, 0, .14, .42, held);
      }
      if (type === "heavy") {
        flesh(.24, .24, .22, palette.shade, 0, 1.49, -.19);
        flesh(.18, .14, .08, palette.armor, 0, 1.63, -.35);
      }
      if (type === "orbiter") {
        const crest = flesh(.10, .17, .22, palette.shade, 0, 2.1, -.07);
        crest.rotation.x = -.3;
      }
      const scale = isBoss ? 2.1 : type === "heavy" ? 1.2 : type === "runner" ? .9 : 1;
      e.scale.setScalar(scale);
      const max = isBoss ? 1600 + state.wave * 110 : cfg.hp * (1 + (state.wave - 1) * .095);
      e.userData = {
        isBoss,
        type,
        hp: max,
        maxHp: max,
        speed: isBoss ? 2.4 : cfg.speed,
        shot: 1 + Math.random() * 1.8,
        alive: true,
        legs,
        arms,
        rig,
        phase: Math.random() * 6.28,
        vx: 0,
        vz: 0,
        turn: 0,
        gait: 0,
        lastX: 0,
        lastZ: 0,
        recoil: 0,
        strafe: Math.random() < .5 ? -1 : 1,
        scale,
        flash: 0,
        held,
        swing: 0,
        meleePending: false,
        voice: 2 + Math.random() * 4
      };
      let x = 0,
        z = 0;
      for (let tries = 0; tries < 500; tries++) {
        x = (Math.random() * 2 - 1) * (config.ARENA - 6);
        z = (Math.random() * 2 - 1) * (config.ARENA - 6);
        if (Math.hypot(x - state.camera.position.x, z - state.camera.position.z) > 15 && !api.blocked(x, z, .8)) break;
      }
      e.position.set(x, 0, z);
      createEnemyBar(e);
      state.scene.add(e);
      state.enemies.push(e);
    }
    state.waveEnemyCount = count;
    api.say("Wave " + state.wave + " · " + count + " enemies");
  }

  function createEnemyBar(e) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false
    }));
    sprite.position.y = 2.65;
    // Keep the nameplate understated even on enlarged heavy enemies and bosses.
    const scale = e.userData.scale ?? 1;
    sprite.scale.set(1.75 / scale, .4375 / scale, 1);
    e.add(sprite);
    e.userData.bar = {
      canvas,
      texture,
      sprite
    };
    drawEnemyBar(e);
  }

  function drawEnemyBar(e) {
    const {
        canvas,
        texture
      } = e.userData.bar,
      c = canvas.getContext("2d"),
      ratio = Math.max(0, Math.min(1, e.userData.hp / e.userData.maxHp));
    c.clearRect(0, 0, 256, 64);
    c.fillStyle = "#111820b8";
    c.fillRect(22, 36, 212, 8);
    c.fillStyle = ratio > .5 ? "#92bf88" : ratio > .25 ? "#d5b574" : "#d68078";
    c.fillRect(23, 37, 210 * ratio, 6);
    c.strokeStyle = "#ffffff25";
    c.lineWidth = 1;
    c.strokeRect(22.5, 36.5, 211, 7);
    c.fillStyle = "#d9dfe8dd";
    c.font = '17px "Segoe UI", Arial, sans-serif';
    c.textAlign = "center";
    c.textBaseline = "alphabetic";
    c.shadowColor = "#000b";
    c.shadowBlur = 2;
    c.shadowOffsetY = 1;
    const name = e.userData.isBoss ? config.MAPS[state.activeMap].boss : config.ENEMY_TYPES[e.userData.type].name;
    c.fillText(name.toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase()), 128, 27, 228);
    c.shadowBlur = 0;
    c.shadowOffsetY = 0;
    texture.needsUpdate = true;
  }

  function damageEnemy(e, damage, headshot = false) {
    if (!e.userData.alive) return;
    if (headshot) {
      damage *= 2;
      api.sfx("headshot");
      api.say("Headshot · Double damage");
    } else api.sfx("hit");
    const marker = document.getElementById("hitMarker");
    const killed = e.userData.hp <= damage;
    marker.className = (headshot ? 'headshot' : '') + (killed ? ' kill' : '');
    marker.setAttribute('aria-label', headshot ? 'Headshot' : killed ? 'Enemy eliminated' : 'Hit');
    state.hitMarkerTimer = headshot ? .22 : .14;
    api.enemySound(e, e.userData.hp <= damage ? "enemyDeath" : "enemyPain");
    e.userData.hp -= damage;
    drawEnemyBar(e);
    if (e.userData.hp <= 0) {
      e.userData.alive = false;
      state.score += e.userData.isBoss ? 2500 : config.ENEMY_TYPES[e.userData.type].points;
      api.dropEnemyPowerup(e);
      api.disposeObject(e);
    }
  }

  function enemyFire(e) {
    const type = e.userData.type,
      origin = e.position.clone().add(new THREE.Vector3(0, 1.25 * e.userData.scale, 0));
    if (api.worldHit(origin, state.camera.position) !== null) return;
    const aim = state.camera.position.clone().sub(origin).normalize(),
      up = new THREE.Vector3(0, 1, 0),
      damage = Math.min(18, 7 + state.wave * .45);
    if (type === "runner") {
      if (origin.distanceTo(state.camera.position) < 2.2) {
        e.userData.swing = .45;
        e.userData.meleePending = true;
        api.enemySound(e, "enemySlash");
      }
      return;
    }
    e.userData.recoil = 1;
    api.enemySound(e, "enemyShot");
    api.glow(origin.clone().addScaledVector(aim, .7), 0xffbd64, .8, .08);
    e.userData.volley = (e.userData.volley ?? 0) + 1;
    const volley = e.userData.volley;
    if (e.userData.isBoss && e.userData.hp < e.userData.maxHp * .5) {
      for (let i = -2; i <= 2; i++) api.projectile(origin, aim.clone().applyAxisAngle(up, i * .13), 0xff647f, 10, true, damage, .15, "boss");
    }
    // Ring barrages alternate with aimed fans. Gaps stay wide enough to dodge.
    if (type === "heavy" && volley % 2 === 0) {
      for (let i = 0; i < 18; i++) {
        const angle = i / 18 * Math.PI * 2 + volley * .17,
          direction = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
        api.projectile(origin, direction, 0xffb45c, 6, true, damage, .17, "ring");
      }
    } else {
      const count = type === "heavy" ? 13 : type === "orbiter" ? 9 : 5,
        spread = type === "heavy" ? .14 : type === "orbiter" ? .17 : .13;
      const offset = type === "orbiter" ? Math.sin(volley * 1.7) * .2 : 0;
      for (let i = 0; i < count; i++) {
        const direction = aim.clone().applyAxisAngle(up, (i - (count - 1) / 2) * spread + offset);
        api.projectile(origin, direction, type === "heavy" ? 0xffb45c : type === "orbiter" ? 0xd484ff : 0xff637f, type === "heavy" ? 6 : type === "orbiter" ? 7 : 8, true, damage, type === "heavy" ? .17 : .13, "fan");
      }
    }
  }

  function updateEnemies(dt) {
    for (const e of state.enemies) {
      const d = e.userData;
      if (!d.alive) continue;
      const cfg = config.ENEMY_TYPES[d.type];
      const dx = state.camera.position.x - e.position.x,
        dz = state.camera.position.z - e.position.z,
        dist = Math.hypot(dx, dz),
        clear = api.movementClear(e.position, state.camera.position);
      let mx = 0,
        mz = 0;
      if (!clear || dist > cfg.range + (d.type === "runner" ? 0 : 1)) {
        const target = api.enemyDestination(e);
        mx = target.x - e.position.x;
        mz = target.z - e.position.z;
      } else if (d.type !== "runner") {
        const radial = dist < cfg.range - 2 ? -1 : 0;
        mx = dx / (dist || 1) * radial + dz / (dist || 1) * d.strafe * .75;
        mz = dz / (dist || 1) * radial - dx / (dist || 1) * d.strafe * .75;
      }
      const moveSpeed = d.speed + (d.isBoss ? 1.4 * Math.max(0, Math.min(1, (dist - 18) / 22)) : 0);
      const length = Math.hypot(mx, mz);
      if (length > 0) {
        mx = mx / length * moveSpeed;
        mz = mz / length * moveSpeed;
      }
      for (const other of state.enemies) {
        if (other === e || !other.userData.alive) continue;
        const sx = e.position.x - other.position.x,
          sz = e.position.z - other.position.z,
          dd = Math.hypot(sx, sz);
        if (dd > 0 && dd < 1.15) {
          mx += sx / dd * (1.15 - dd) * 3;
          mz += sz / dd * (1.15 - dd) * 3;
        }
      }
      d.vx += (mx - d.vx) * Math.min(1, 7 * dt);
      d.vz += (mz - d.vz) * Math.min(1, 7 * dt);
      const oldX = e.position.x,
        oldZ = e.position.z;
      const ex = e.position.x + d.vx * dt,
        ez = e.position.z + d.vz * dt;
      if (!api.blocked(ex, e.position.z, .5)) e.position.x = ex;else {
        d.vx = 0;
        d.strafe *= -1;
      }
      if (!api.blocked(e.position.x, ez, .5)) e.position.z = ez;else d.vz = 0;
      const angle = Math.atan2(dx, dz),
        delta = Math.atan2(Math.sin(angle - e.rotation.y), Math.cos(angle - e.rotation.y));
      e.rotation.y += delta * Math.min(1, 8 * dt);
      const actualSpeed = Math.hypot(e.position.x - oldX, e.position.z - oldZ) / Math.max(dt, .001);
      d.gait += (Math.min(1, actualSpeed / 1.5) - d.gait) * (1 - Math.exp(-10 * dt));
      const cadence = d.type === "heavy" ? 1.15 : d.type === "runner" ? 2.55 : 1.7;
      d.phase += dt * Math.PI * 2 * cadence * Math.min(1.4, actualSpeed / Math.max(1, d.speed));
      const stride = d.gait,
        moveAngle = Math.atan2(d.vx, d.vz) - e.rotation.y;
      for (let i = 0; i < 2; i++) {
        const leg = d.legs[i],
          phase = d.phase + i * Math.PI,
          lift = Math.max(0, Math.sin(phase)) * .12 * stride;
        const z = Math.cos(phase) * .18 * stride * Math.cos(moveAngle),
          y = -.65 + lift,
          L1 = .36,
          L2 = .31,
          distance = Math.max(.08, Math.min(L1 + L2 - .002, Math.hypot(y, z)));
        const kneeAngle = Math.PI - Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + L2 * L2 - distance * distance) / (2 * L1 * L2))));
        const hipAngle = Math.atan2(-z, -y) - Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + distance * distance - L2 * L2) / (2 * L1 * distance))));
        const blend = 1 - Math.exp(-16 * dt);
        leg.rotation.x += (hipAngle - leg.rotation.x) * blend;
        // Keep toes aligned with the torso; backpedal and strafe with signed strides.
        leg.rotation.y = 0;
        leg.rotation.z = Math.cos(phase) * .20 * stride * Math.sin(moveAngle);
        leg.userData.knee.rotation.x += (kneeAngle - leg.userData.knee.rotation.x) * blend;
        leg.userData.ankle.rotation.x = -(leg.rotation.x + leg.userData.knee.rotation.x);
        leg.userData.ankle.rotation.z = -leg.rotation.z;
      }
      d.recoil *= Math.exp(-13 * dt);
      d.rig.rotation.z = Math.sin(d.phase) * .025 * stride;
      d.rig.rotation.x = (d.type === "runner" ? .10 : .025) * stride;
      d.arms[0].rotation.x = -Math.sin(d.phase) * .24 * stride;
      if (d.type === "runner") {
        d.swing = Math.max(0, d.swing - dt);
        d.arms[1].rotation.x = d.swing > 0 ? -1.8 + Math.sin((1 - d.swing / .45) * Math.PI) * 2.5 : Math.sin(d.phase) * .35 * stride;
        if (d.meleePending && d.swing < .2) {
          d.meleePending = false;
          if (dist < 2.1 && Math.abs(state.camera.position.y - 1.4) < 1.3 && api.worldHit(e.position.clone().add(new THREE.Vector3(0, 1.3, 0)), state.camera.position) === null) api.hurtPlayer(14);
        }
        d.voice -= dt;
        if (d.voice <= 0) {
          api.enemySound(e, "enemyGrowl");
          d.voice = 4 + Math.random() * 4;
        }
      } else {
        const aimPitch = -Math.atan2(state.camera.position.y - (e.position.y + 1.2 * d.scale), Math.max(1, dist));
        d.arms[1].rotation.x += (aimPitch - d.recoil * .13 - d.arms[1].rotation.x) * (1 - Math.exp(-9 * dt));
        d.arms[0].rotation.x = -.35 + Math.sin(d.phase) * .045 * stride;
        d.held.position.z = -d.recoil * .035;
      }
      d.rig.position.y = (1 - Math.cos(d.phase * 2)) * .012 * stride + Math.sin(state.simTime * 2 + d.phase * .05) * .006 * (1 - stride);
      if (d.type !== "runner" && d.shot > .28 && d.shot - dt <= .28 && dist < 25) api.glow(e.position.clone().add(new THREE.Vector3(0, 1.4 * d.scale, 0)), d.type === "heavy" ? 0xffb45c : d.type === "orbiter" ? 0xd484ff : 0xff637f, .7, .22);
      d.shot -= dt;
      if (d.shot <= 0 && dist < 25) {
        enemyFire(e);
        d.shot = cfg.interval * (d.isBoss ? .7 : 1) * Math.max(.55, 1 - state.wave * .025) + Math.random() * .3;
      }
      if (state.gameOver) return;
    }
  }

  return { spawnWave, createEnemyBar, drawEnemyBar, damageEnemy, enemyFire, updateEnemies };
}
