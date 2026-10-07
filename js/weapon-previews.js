// Generate thumbnails from the actual gun geometry once, using the game renderer.
export function createWeaponPreviews({ THREE, state, config }) {
  function buildWeaponPreviews() {
    const renderer = state.renderer;
    const width = 256, height = 112;
    const target = new THREE.WebGLRenderTarget(width, height);
    target.texture.colorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xe8f2ff, 0x8e846d, 3));
    const light = new THREE.DirectionalLight(0xffffff, 4);
    light.position.set(3, 5, 2); scene.add(light);
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .01, 20);
    const oldTarget = renderer.getRenderTarget();
    const oldClear = renderer.getClearColor(new THREE.Color());
    const oldAlpha = renderer.getClearAlpha();
    const pixels = new Uint8Array(width * height * 4);
    try {
      renderer.setClearColor(0x000000, 0);
      for (const key of config.weaponOrder) {
        // Copy meshes without cloning userData, which contains live part references.
        const model = new THREE.Group();
        state.weaponModels[key].traverse(part => {
          if (!part.isMesh || part.userData.previewExcluded) return;
          let parent = part;
          while (parent !== state.weaponModels[key]) {
            if (!parent.visible || parent.userData.previewExcluded) return;
            parent = parent.parent;
          }
          const mesh = new THREE.Mesh(part.geometry, part.material);
          part.updateWorldMatrix(true, false);
          mesh.matrix.copy(state.weaponModels[key].matrixWorld.clone().invert().multiply(part.matrixWorld));
          mesh.matrixAutoUpdate = false;
          model.add(mesh);
        });
        model.rotation.y = -Math.PI / 2;
        scene.add(model); model.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(model);
        const center = bounds.getCenter(new THREE.Vector3());
        const size = bounds.getSize(new THREE.Vector3());
        const halfHeight = Math.max(size.y, size.x * height / width) * .60;
        camera.left = -halfHeight * width / height; camera.right = -camera.left;
        camera.top = halfHeight; camera.bottom = -halfHeight;
        camera.position.copy(center).add(new THREE.Vector3(.12, .14, 5));
        camera.lookAt(center); camera.updateProjectionMatrix();
        renderer.setRenderTarget(target); renderer.render(scene, camera);
        renderer.readRenderTargetPixels(target, 0, 0, width, height, pixels);
        const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        const image = ctx.createImageData(width, height);
        for (let y = 0; y < height; y++) image.data.set(pixels.subarray((height - y - 1) * width * 4, (height - y) * width * 4), y * width * 4);
        ctx.putImageData(image, 0, 0);
        const icon = document.querySelector('#slot' + key + ' .weaponIcon');
        const img = document.createElement('img');
        img.className = 'weaponIcon'; img.alt = config.WEAPONS[key].name;
        img.width = width; img.height = height; img.src = canvas.toDataURL('image/png');
        icon.replaceWith(img);
        scene.remove(model);
      }
    } finally {
      renderer.setRenderTarget(oldTarget); renderer.setClearColor(oldClear, oldAlpha);
      target.dispose();
    }
  }
  return { buildWeaponPreviews };
}
