// Procedural surfaces and landmarks; generated once when changing arenas.
export function createMapArt({ THREE, state, api }) {
  function surfaceTexture(canyon) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    let seed = 1753;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) | 0; return (seed >>> 0) / 4294967296; };
    ctx.fillStyle = canyon ? '#b7784b' : '#263343'; ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 4000; i++) {
      ctx.fillStyle = canyon ? (i % 2 ? '#c68e5e' : '#9c633e') : (i % 2 ? '#344558' : '#202c38');
      ctx.fillRect(random() * 256, random() * 256, 1 + random(), 1);
    }
    ctx.strokeStyle = canyon ? '#dda77725' : '#647c8e'; ctx.lineWidth = canyon ? 1 : 3;
    if (canyon) for (let y = 0; y < 256; y += 16) {
      ctx.beginPath();
      for (let x = 0; x <= 256; x += 4) ctx.lineTo(x, y + Math.sin(x / 256 * Math.PI * 2) * 4);
      ctx.stroke();
    } else {
      ctx.strokeRect(3, 3, 250, 250);
      ctx.fillStyle = '#71818a';
      for (const x of [12, 244]) for (const y of [12, 244]) { ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill(); }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(canyon ? 14 : 24, canyon ? 14 : 24);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }
  function decorateMap() {
    if (state.activeMap === 'depot') return;
    const canyon = state.activeMap === 'canyon';
    const floor = state.scene.children.find(object => object.isMesh && object.position.y === -.5);
    if (floor) { floor.material.map = surfaceTexture(canyon); floor.material.color.setHex(0xffffff); floor.material.needsUpdate = true; }
    const box = (w, h, d, color, x, y, z, glow = false) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), glow ? new THREE.MeshBasicMaterial({ color }) : api.mat(color));
      mesh.position.set(x, y, z); state.scene.add(mesh); return mesh;
    };
    if (canyon) {
      // Layered mesas and an eroded arch form a continuous desert horizon.
      for (let i = 0; i < 22; i++) {
        const angle = i / 22 * Math.PI * 2, height = 14 + (i % 5) * 4;
        const geometry = new THREE.CylinderGeometry(8, 12, height, 40, 18);
        const positions = geometry.attributes.position, colors = [];
        const bands = [0xa96943, 0xb9794c, 0xc58a57, 0xba794b];
        for (let v = 0; v < positions.count; v++) {
          const y = positions.getY(v), a = Math.atan2(positions.getZ(v), positions.getX(v));
          const erosion = 1 + .055 * Math.sin(y * .7 + i) + .065 * Math.sin(a * 5 + i) + .025 * Math.cos(y * 2);
          positions.setX(v, positions.getX(v) * erosion); positions.setZ(v, positions.getZ(v) * erosion);
          const color = new THREE.Color(bands[Math.floor((y + height / 2) * .8) % bands.length]);
          colors.push(color.r, color.g, color.b);
        }
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3)); geometry.computeVertexNormals();
        const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ vertexColors:true, roughness:1 }));
        mesh.position.set(Math.sin(angle) * 63, height / 2, Math.cos(angle) * 63);
        mesh.scale.z = .7; state.scene.add(mesh);
      }
      const arch = new THREE.Mesh(new THREE.TorusGeometry(13, 3, 12, 36, Math.PI), api.mat(0xbb794c));
      arch.position.set(0, 7, -58); state.scene.add(arch);
      for (let i = 0; i < 32; i++) {
        const rock = new THREE.Mesh(new THREE.SphereGeometry(.35 + i % 3 * .15, 12, 8), api.mat(0xbd875b));
        rock.position.set(Math.sin(i * 2.4) * 43, .12, Math.cos(i * 2.4) * 43);
        rock.scale.set(1.6, .5, .8); state.scene.add(rock);
      }
    } else {
      // Cyan processing lines, magenta reactor rings and a tall factory skyline.
      for (const side of [-1, 1]) for (let i = 0; i < 7; i++) {
        const z = -44 + i * 14, height = 15 + i % 3 * 7;
        box(8, height, 10, 0x182435, side * 57, height / 2, z);
        for (let level = 4; level < height; level += 4) box(.08, .5, 7, i % 2 ? 0x51ddec : 0xe76bb8, side * 52.95, level, z, true);
      }
      for (const z of [-34, 8]) {
        box(88, .45, .45, 0x526379, 0, 12, z);
        box(88, .06, .08, 0x5effe2, 0, 11.74, z, true);
        api.addObstacle(0, z, 88, .45, 12.225, 11.775);
        for (const side of [-1, 1]) { box(.6, 12, .6, 0x344b61, side * 44, 6, z); api.addObstacle(side * 44, z, .6, .6, 12); }
      }
      for (const x of [-36, 36]) for (const z of [-28, 20]) {
        const light = new THREE.PointLight(z < 0 ? 0x45eada : 0xf56fc6, 20, 18, 2);
        light.position.set(x, 5, z); state.scene.add(light);
      }
      for (const z of [-42, 42]) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(6, .13, 12, 64), new THREE.MeshBasicMaterial({ color: 0xef69bb }));
        ring.position.set(0, 8, z); state.scene.add(ring);
      }
      for (let z = -42; z < 44; z += 4) for (const x of [-7, 7]) box(.18, .025, 1.8, 0x49eaca, x, .035, z, true);
    }
    // Surface detailing follows the exact collision slope, without extra obstacles.
    const lines = [];
    for (const obstacle of state.obstacles) {
      if (!obstacle.ramp) continue;
      const r = obstacle.ramp;
      for (let offset = -r.length / 2 + .5; offset < r.length / 2; offset += canyon ? 1 : 2) {
        const x = r.axis === 'x' ? r.x + offset : r.x;
        const z = r.axis === 'z' ? r.z + offset : r.z;
        const y = api.surfaceHeight(obstacle, x, z) + .025;
        if (r.axis === 'x') lines.push(x, y, obstacle.minZ + .12, x, y, obstacle.maxZ - .12);
        else lines.push(obstacle.minX + .12, y, z, obstacle.maxX - .12, y, z);
      }
    }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(lines, 3));
    state.scene.add(new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color:canyon ? 0x695039 : 0x729798 })));
  }
  return { decorateMap };
}
