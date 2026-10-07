// Geometriehelfer, visuelle Effects und Ressourcenfreigabe.
export function createGraphics({ THREE, state, config, dom, api }) {
  function glow(pos, color, size = .7, life = .07) {
    if (!state.glowTexture) {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 64;
      const c = canvas.getContext("2d"),
        gradient = c.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(.18, "rgba(255,255,255,.95)");
      gradient.addColorStop(.45, "rgba(255,255,255,.35)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = gradient;
      c.fillRect(0, 0, 64, 64);
      state.glowTexture = new THREE.CanvasTexture(canvas);
      state.glowTexture.userData = {
        shared: true
      };
    }
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: state.glowTexture,
      color,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    sprite.position.copy(pos);
    sprite.scale.set(size, size, 1);
    state.scene.add(sprite);
    state.effects.push({
      mesh: sprite,
      life,
      duration: life,
      blast: false
    });
    return sprite;
  }

  function bulletTracer(from, to, color) {
    const delta = to.clone().sub(from),
      length = Math.sqrt(delta.lengthSq());
    if (length < .02) return;
    const tracer = new THREE.Mesh(new THREE.CylinderGeometry(.014, .014, length, 8), new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: .8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    tracer.position.copy(from).lerp(to, .5);
    tracer.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
    state.scene.add(tracer);
    state.effects.push({
      mesh: tracer,
      life: .045,
      duration: .045,
      blast: false
    });
  }

  function mat(c, rough = .72, metal = .08, em = 0x000000) {
    return new THREE.MeshStandardMaterial({
      color: c,
      roughness: rough,
      metalness: metal,
      emissive: em
    });
  }

  function cube(w, h, d, c) {
    return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c));
  }

  function sphere(r, c, em = 0x000000) {
    return new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), mat(c, .6, .05, em));
  }

  function disposeObject(object) {
    if (object.parent) object.parent.remove(object);else state.scene.remove(object);
    const geometries = new Set(),
      materials = new Set();
    object.traverse(o => {
      if (o.geometry) geometries.add(o.geometry);
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => materials.add(m));
    });
    geometries.forEach(g => g.dispose());
    materials.forEach(m => {
      if (m.map && !m.map.userData?.shared) m.map.dispose();
      m.dispose();
    });
  }

  return { glow, bulletTracer, mat, cube, sphere, disposeObject };
}
