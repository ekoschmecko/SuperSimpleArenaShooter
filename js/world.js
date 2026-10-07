// Kartenaufbau, Deckung, Rampen und Plattformen.
export function createWorld({ THREE, state, config, dom, api }) {
  // Geometrie und begehbare Kollisionsfläche verwenden dieselben Dachmaße.
  function addRoof(x, z, width, depth, base, rise = 2.6) {
    const halfX = width / 2, halfZ = depth / 2;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([
      -halfX, 0, -halfZ, halfX, 0, -halfZ,
      halfX, 0, halfZ, -halfX, 0, halfZ, 0, rise, 0,
    ], 3));
    geometry.setIndex([0, 4, 1, 1, 4, 2, 2, 4, 3, 3, 4, 0, 0, 1, 2, 0, 2, 3]);
    geometry.computeVertexNormals();
    const roof = new THREE.Mesh(geometry.toNonIndexed(), api.mat(0x445054));
    geometry.dispose();
    roof.geometry.computeVertexNormals();
    roof.position.set(x, base, z);
    roof.userData.roof = { x, z, halfX, halfZ, base, rise };
    state.scene.add(roof);
    state.obstacles.push({
      minX: x - halfX, maxX: x + halfX,
      minZ: z - halfZ, maxZ: z + halfZ,
      minY: base, height: base + rise, roof: roof.userData.roof,
    });
    return roof;
  }
  function addObstacle(x, z, w, d, h = 4, minY = 0) {
    state.obstacles.push({
      minX: x - w / 2,
      maxX: x + w / 2,
      minZ: z - d / 2,
      maxZ: z + d / 2,
      height: h,
      minY
    });
  }

  function addCover(x, z, w, h, d, c) {
    const m = api.cube(w, h, d, c);
    m.position.set(x, h / 2, z);
    state.scene.add(m);
    addObstacle(x, z, w, d, h);
    return m;
  }

  function loadMap() {
    for (const object of state.environmentObjects) api.disposeObject(object);
    state.environmentObjects = [];
    state.obstacles.length = 0;
    state.scene.background = new THREE.Color(config.MAPS[state.activeMap].sky);
    state.scene.fog = new THREE.Fog(config.MAPS[state.activeMap].sky, 65, 180);
    const night = state.activeMap === 'foundry';
    state.worldAmbient.intensity = night ? 1.9 : 1.65;
    state.worldAmbient.color.setHex(night ? 0xbfcfeb : 0xd4e9ff);
    state.worldAmbient.groundColor.setHex(night ? 0x344860 : 0x66573f);
    state.worldSun.intensity = night ? 1.5 : 2.4;
    state.worldSun.color.setHex(night ? 0x91b6f4 : 0xffd4a1);
    const before = new Set(state.scene.children);
    if (state.activeMap === "depot") {
      buildEnvironment();
      addPlatform(0, -24, 12, 8, 4, 0x626f68);
      addRamp(0, -12, 5, 16, 4, "z", -1);
      addPlatform(0, 32, 12, 8, 6, 0x626f68);
      addRamp(-13, 32, 5, 14, 6, "x", 1);
    } else buildAlternateMap();
    api.decorateMap();
    state.environmentObjects = state.scene.children.filter(o => !before.has(o));
    state.builtMap = state.activeMap;
    state.navTarget = "";
    state.navRefresh = 0;
    state.navDistances.clear();
  }

  function addPlatform(x, z, w, d, height, color) {
    const deck = api.cube(w, .45, d, color);
    deck.position.set(x, height - .225, z);
    state.scene.add(deck);
    addObstacle(x, z, w, d, height, height - .45);
    for (const dx of [-w / 2 + .5, w / 2 - .5]) for (const dz of [-d / 2 + .5, d / 2 - .5]) {
      const pillar = api.cube(.65, height - .45, .65, state.activeMap === 'canyon' ? 0x79563d : 0x52636a);
      pillar.position.set(x + dx, (height - .45) / 2, z + dz);
      state.scene.add(pillar);
      addObstacle(x + dx, z + dz, .65, .65, height - .45);
    }
    // Edge lights mark the elevated floor without blocking jump routes.
    for (const side of [-1, 1]) {
      const strip = api.cube(w, .045, .07, state.activeMap === "foundry" ? 0x6ff4d1 : 0xe5c181);
      strip.position.set(x, height + .025, z + side * (d / 2 - .12));
      state.scene.add(strip);
    }
  }

  function addRamp(x, z, width, length, height, axis = "z", direction = 1) {
    const w = axis === "x" ? length : width,
      d = axis === "z" ? length : width;
    const o = {
      minX: x - w / 2,
      maxX: x + w / 2,
      minZ: z - d / 2,
      maxZ: z + d / 2,
      height,
      minY: 0,
      ramp: {
        axis,
        direction,
        x,
        z,
        length
      }
    };
    state.obstacles.push(o);
    // A filled wedge with a smooth walkable incline.
    const corners = [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]],
      vertices = [];
    for (const [xx, zz] of corners) vertices.push(xx, 0, zz);
    for (const [xx, zz] of corners) vertices.push(xx, height * (.5 + direction * (axis === "x" ? xx : zz) / length), zz);
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geom.setIndex([4, 6, 5, 4, 7, 6, 0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7, 0, 2, 1, 0, 3, 2]);
    geom.computeVertexNormals();
    const ramp = new THREE.Mesh(geom, new THREE.MeshStandardMaterial({
      color: state.activeMap === "canyon" ? 0xb49773 : 0x7c8986,
      roughness: .9,
      side: THREE.DoubleSide
    }));
    ramp.position.set(x, 0, z);
    state.scene.add(ramp);
  }

  function buildAlternateMap() {
    const canyon = state.activeMap === "canyon",
      ground = api.cube(104, 1, 104, canyon ? 0xaa8765 : 0x303f49);
    ground.position.y = -.5;
    state.scene.add(ground);
    for (const sign of [-1, 1]) {
      addCover(0, sign * 49, 100, 5, 1, canyon ? 0x9b7357 : 0x475967);
      addCover(sign * 49, 0, 1, 5, 98, canyon ? 0x9b7357 : 0x475967);
    }
    if (canyon) {
      for (const x of [-18, 18]) {
        addPlatform(x, 0, 12, 18, 5, 0xb99570);
        addRamp(x, 19, 5, 20, 5, "z", -1);
      }
      addPlatform(0, 0, 24, 4, 5, 0x8c7054);
      for (const [x, z, r, h] of [[-36, -28, 8, 14], [32, -30, 9, 18], [-34, 25, 6, 10], [35, 24, 7, 12], [-8, -34, 6, 11], [12, -32, 7, 13]]) {
        const rock = new THREE.Mesh(new THREE.CylinderGeometry(r * .65, r, h, 32, 8), api.mat(0xad7047));
        const positions = rock.geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const y = positions.getY(i), angle = Math.atan2(positions.getZ(i), positions.getX(i));
          const erosion = 1 + .045 * Math.sin(y * 2.1) + .025 * Math.cos(angle * 5 + y);
          positions.setX(i, positions.getX(i) * erosion); positions.setZ(i, positions.getZ(i) * erosion);
        }
        rock.geometry.computeVertexNormals();
        rock.position.set(x, h / 2, z);
        state.scene.add(rock);
        addObstacle(x, z, r * 1.6, r * 1.6, h);
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(r * .63, r * .66, .3, 32), api.mat(0xd3a16c));
        cap.position.set(x, h, z);
        state.scene.add(cap);
      }
      for (const [x, z] of [[-5, 15], [8, 20], [-10, -16], [10, -15]]) addCover(x, z, 4, 1.1, 1.3, 0x997f5f);
    } else {
      for (const x of [-18, 18]) {
        addPlatform(x, -18, 12, 12, 7, 0x4d6470);
        addRamp(x, -2, 5, 20, 7, "z", -1);
        addPlatform(x, 22, 12, 10, 4, 0x4d6470);
      }
      addPlatform(0, -18, 24, 4, 7, 0x516976);
      addRamp(4, 22, 5, 16, 4, "x", 1);
      addRamp(-4, 22, 5, 16, 4, "x", -1);
      for (const [x, z] of [[-36, -28], [36, -28], [-35, 20], [35, 20]]) {
        const tank = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 9, 24), api.mat(0x687c80, .45, .5));
        tank.position.set(x, 4.5, z);
        state.scene.add(tank);
        addObstacle(x, z, 6, 6, 9);
        for (const y of [1, 5, 8]) {
          const band = new THREE.Mesh(new THREE.TorusGeometry(3.04, .09, 8, 24), new THREE.MeshBasicMaterial({
            color: 0x8de6cd
          }));
          band.rotation.x = Math.PI / 2;
          band.position.set(x, y, z);
          state.scene.add(band);
        }
      }
      for (const x of [-7, 7]) {
        const stripe = api.cube(.1, .02, 90, 0x5dbea9);
        stripe.position.set(x, .025, 0);
        state.scene.add(stripe);
      }
    }
    for (const [x, z] of [[-8, -7], [9, 9], [-31, 1], [31, 4]]) addCover(x, z, 3, 1.1, 1.5, canyon ? 0x806c55 : 0x6c776c);
  }

  function buildEnvironment() {
    const batches = new Map();
    function shape(type, args, color, x, y, z, rx = 0, ry = 0, rz = 0) {
      const key = type + ":" + args.join(",") + ":" + color;
      if (!batches.has(key)) batches.set(key, {
        type,
        args,
        color,
        items: []
      });
      batches.get(key).items.push({
        x,
        y,
        z,
        rx,
        ry,
        rz
      });
    }
    const box = (w, h, d, c, x, y, z, ry = 0) => shape("box", [w, h, d], c, x, y, z, 0, ry);
    const cylinder = (r, h, c, x, y, z) => shape("cylinder", [r, r, h, 10], c, x, y, z);
    const cone = (r, h, c, x, y, z) => shape("cone", [r, h, 7], c, x, y, z);
    // Warm gravel with a subtle procedural grain, tiled over the entire arena.
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#8e8a72";
    ctx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 2000; i++) {
      ctx.fillStyle = i % 2 ? "#777961" : "#a09a81";
      ctx.fillRect(Math.random() * 128, Math.random() * 128, 1 + Math.random() * 2, 1);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(36, 36);
    texture.colorSpace = THREE.SRGBColorSpace;
    const ground = new THREE.Mesh(new THREE.BoxGeometry(110, 1, 110), new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 1
    }));
    ground.position.y = -.5;
    state.scene.add(ground);
    // Two broad roads and a paved central plaza create readable combat lanes.
    box(12, .025, 94, 0x454b4c, 0, .015, 0);
    box(94, .025, 10, 0x454b4c, 0, .018, -2);
    box(24, .04, 22, 0x6f7774, 0, .025, -2);
    for (let z = -43; z <= 43; z += 6) {
      if (Math.abs(z + 2) > 11) box(.16, .01, 2.5, 0xd5c99f, 0, .045, z);
    }
    for (let x = -43; x <= 43; x += 6) {
      if (Math.abs(x) > 13) box(2.5, .01, .16, 0xd5c99f, x, .045, -2);
    }
    for (const x of [-6.3, 6.3]) box(.25, .14, 94, 0xaca996, x, .07, 0);
    for (const z of [-7.3, 3.3]) box(94, .14, .25, 0xaca996, 0, .07, z);
    for (let x = -10; x <= 10; x += 2) box(1.1, .015, 3.5, 0xcac7b2, x, .06, -10);
    // Enclosing wall with pillars, inset panels and metal caps.
    for (const z of [-49, 49]) {
      addCover(0, z, 100, 3.3, 1, 0x79776a);
      box(100, .2, 1.25, 0xa39b83, 0, 3.4, z);
    }
    for (const x of [-49, 49]) {
      addCover(x, 0, 1, 3.3, 98, 0x79776a);
      box(1.25, .2, 98, 0xa39b83, x, 3.4, 0);
    }
    for (let n = -48; n <= 48; n += 8) for (const side of [-1, 1]) {
      box(1.25, 3.8, 1.25, 0x686c63, n, 1.9, side * 49);
      box(1.25, 3.8, 1.25, 0x686c63, side * 49, 1.9, n);
    }
    function sign(text, x, y, z) {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = 128;
      const t = c.getContext("2d");
      t.fillStyle = "#243b3d";
      t.fillRect(0, 0, 512, 128);
      t.strokeStyle = "#b4c4b0";
      t.lineWidth = 6;
      t.strokeRect(8, 8, 496, 112);
      t.fillStyle = "#e5e4c8";
      t.font = "bold 50px Arial";
      t.textAlign = "center";
      t.fillText(text, 256, 82);
      const map = new THREE.CanvasTexture(c);
      map.colorSpace = THREE.SRGBColorSpace;
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(4, .98), new THREE.MeshBasicMaterial({
        map
      }));
      panel.position.set(x, y, z);
      state.scene.add(panel);
    }
    function building(x, z, w, d, h, color, label) {
      addCover(x, z, w, h, d, color);
      box(w + .3, .45, d + .3, 0x62675f, x, .225, z);
      box(w + .7, .25, d + .7, 0x39474c, x, h + .125, z);
      box(w + .2, .24, .2, 0xb7aa8a, x, h - .45, z + d / 2 + .06);
      // Die Dachunterkante sitzt genau auf der Oberseite des Abschlusses.
      addRoof(x, z, w + .7, d + .7, h + .25);
      addObstacle(x, z, w + .7, d + .7, h + .25, h);
      addObstacle(x + w * .25, z, .65, .65, h + 2.5, h + .5);
      box(.65, 2, .65, 0x68645a, x + w * .25, h + 1.5, z);
      for (const face of [-1, 1]) {
        for (let xx = -w / 2 + 1.5; xx < w / 2 - 1; xx += 2.6) {
          box(1.45, 1.65, .14, 0xc3b79a, x + xx, 2.55, z + face * (d / 2 + .06));
          box(1.18, 1.35, .16, 0x29434b, x + xx, 2.55, z + face * (d / 2 + .08));
          box(.08, 1.35, .19, 0x95a5a1, x + xx, 2.55, z + face * (d / 2 + .1));
          box(1.18, .07, .19, 0x95a5a1, x + xx, 2.55, z + face * (d / 2 + .1));
        }
        for (let zz = -d / 2 + 1.6; zz < d / 2 - 1; zz += 2.8) {
          box(.14, 1.65, 1.45, 0xc3b79a, x + face * (w / 2 + .06), 2.55, z + zz);
          box(.16, 1.35, 1.18, 0x29434b, x + face * (w / 2 + .08), 2.55, z + zz);
        }
      }
      box(1.4, 2.5, .2, 0x37463f, x, 1.25, z + d / 2 + .1);
      box(.15, .15, .22, 0xd8b774, x + .4, 1.2, z + d / 2 + .15);
      sign(label, x, h - .95, z + d / 2 + .18);
    }
    building(-18, -19, 11, 12, 5, 0x9c8970, "DEPOT 07");
    building(19, -19, 12, 10, 6, 0x8c9a93, "CONTROL");
    building(-21, 19, 13, 10, 5, 0xbaa17c, "WORKSHOP");
    building(21, 21, 10, 13, 5.5, 0x91948b, "STATION");
    building(-35, -35, 8, 7, 4, 0x9c8d70, "POWER");
    building(35, 35, 8, 7, 4, 0x9f927b, "STORAGE");
    // Corrugated cargo containers and smaller cover islands.
    for (const [x, z, c] of [[-33, 1, 0x657f77], [33, -4, 0x9b644b], [-5, -36, 0x5e7883], [5, 36, 0x8a7751]]) {
      addCover(x, z, 7, 2.6, 3, c);
      box(7.2, .15, 3.2, 0x414c48, x, 2.68, z);
      for (let dx = -3; dx <= 3; dx += .5) for (const side of [-1, 1]) box(.09, 2.4, .1, 0x485b56, x + dx, 1.3, z + side * 1.54);
      box(.1, 2.3, 2.7, 0x394640, x + 3.56, 1.25, z);
    }
    for (const [x, z] of [[-8, 7], [9, -10], [-30, 28], [31, -27], [-9, -27], [9, 29]]) {
      addCover(x, z, 3.8, .85, 1, 0x938e75);
      box(4, .16, 1.12, 0xb6ad8e, x, .93, z);
      for (let n = -1; n <= 1; n++) box(.08, .75, 1.04, 0x625f52, x + n * 1.1, .43, z);
    }
    for (const [x, z] of [[-12, 4], [12, 9], [-28, -9], [29, 7], [-9, 32], [9, -32]]) {
      addCover(x, z, 1.6, 1.5, 1.6, 0x887355);
      for (const side of [-1, 1]) {
        box(1.7, .14, .1, 0x403f34, x, .2, z + side * .83);
        box(1.7, .14, .1, 0x403f34, x, 1.3, z + side * .83);
      }
      cylinder(.5, 1.3, 0x676d5e, x + 2, .65, z);
      addObstacle(x + 2, z, 1, 1, 1.3);
    }
    // Trees, planters and rocks occupy the outer paths, leaving lanes open.
    for (const [x, z] of [[-40, -17], [-39, 15], [-35, 38], [-15, 39], [16, 40], [39, 17], [40, -20], [24, -39], [-22, -39], [-39, -29], [40, -36]]) {
      cylinder(.28, 3.2, 0x6c5b44, x, 1.6, z);
      addObstacle(x, z, .65, .65, 3.2);
      cone(2.4, 4.2, 0x425e4d, x, 4.3, z);
      cone(1.85, 3.2, 0x59745b, x, 5.8, z);
      cone(1.15, 2.5, 0x6d8262, x, 7, z);
      for (let n = 0; n < 3; n++) {
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(.5 + n * .13, 0), api.mat(0x8e8d79));
        rock.scale.set(1.4, .65, 1);
        rock.position.set(x + 2 + n * .6, .23, z + 1);
        state.scene.add(rock);
      }
    }
    for (const [x, z] of [[-10, 14], [10, 15], [-10, -13], [10, -15]]) {
      box(3, .5, 1.6, 0xaaa18a, x, .25, z);
      box(2.7, .08, 1.3, 0x4b4c37, x, .54, z);
      addObstacle(x, z, 3, 1.6, .6);
      for (let i = -1; i <= 1; i++) cone(.65, 1, 0x68805a, x + i, .95, z);
    }
    // Street lamps and a central circular marker.
    for (const [x, z] of [[-7, 24], [7, -26], [-7, -5], [7, 7], [-30, 5], [30, -9]]) {
      cylinder(.11, 5, 0x414d4b, x, 2.5, z);
      addObstacle(x, z, .3, .3, 5);
      box(.9, .12, .4, 0x343f3d, x + .35, 5, z);
      box(.7, .06, .3, 0xffdfa0, x + .35, 4.9, z);
    }
    cylinder(2.8, .06, 0xb5a27c, 0, .07, -2);
    cylinder(2.4, .08, 0x676f65, 0, .08, -2);
    // Distant peaks and sun are scenery outside the collision perimeter.
    for (let i = 0; i < 18; i++) {
      const angle = i / 18 * Math.PI * 2,
        r = 100 + i % 3 * 12,
        h = 22 + i % 5 * 7;
      const peak = new THREE.Mesh(new THREE.ConeGeometry(22, h, 5), api.mat(i % 2 ? 0x87938b : 0x9ca497));
      peak.position.set(Math.sin(angle) * r, h / 2 - 4, Math.cos(angle) * r);
      peak.rotation.y = angle;
      state.scene.add(peak);
    }
    const sunDisk = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 12), new THREE.MeshBasicMaterial({
      color: 0xffe4b0,
      fog: false
    }));
    sunDisk.position.set(-75, 65, -110);
    state.scene.add(sunDisk);
    // Emit one draw call for each repeated geometry/material combination.
    const dummy = new THREE.Object3D();
    for (const batch of batches.values()) {
      const geometry = batch.type === "box" ? new THREE.BoxGeometry(...batch.args) : batch.type === "cone" ? new THREE.ConeGeometry(...batch.args) : new THREE.CylinderGeometry(...batch.args);
      const material = api.mat(batch.color);
      const mesh = new THREE.InstancedMesh(geometry, material, batch.items.length);
      batch.items.forEach((v, i) => {
        dummy.position.set(v.x, v.y, v.z);
        dummy.rotation.set(v.rx, v.ry, v.rz);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
      state.scene.add(mesh);
    }
  }

  return { addRoof, addObstacle, addCover, loadMap, addPlatform, addRamp, buildAlternateMap, buildEnvironment };
}
