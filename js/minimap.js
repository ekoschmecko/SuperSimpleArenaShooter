// Heading-up arena overview: cached terrain rotates with the camera each frame.
export function createMinimap({ THREE, state, config }) {
  const canvas = document.getElementById('minimapCanvas');
  const ctx = canvas.getContext('2d');
  const terrain = document.createElement('canvas');
  const size = 160, margin = 7;
  canvas.width = canvas.height = terrain.width = terrain.height = size * 2;
  const ground = terrain.getContext('2d');
  const pixelsPerUnit = (size - margin * 2) / (config.ARENA * 2);
  const point = value => size / 2 + value * pixelsPerUnit;
  let cachedMap = null;
  const direction = new THREE.Vector3();
  let heading = 0;

  function drawTerrain() {
    ground.setTransform(2, 0, 0, 2, 0, 0);
    ground.clearRect(0, 0, size, size);
    ground.fillStyle = '#17211fe6';
    ground.fillRect(0, 0, size, size);
    ground.strokeStyle = '#ffffff08';
    ground.lineWidth = 1;
    for (let coordinate = -32; coordinate <= 32; coordinate += 16) {
      ground.beginPath();
      ground.moveTo(point(coordinate), margin); ground.lineTo(point(coordinate), size - margin);
      ground.moveTo(margin, point(coordinate)); ground.lineTo(size - margin, point(coordinate));
      ground.stroke();
    }
    ground.save();
    ground.beginPath(); ground.rect(margin, margin, size - margin * 2, size - margin * 2); ground.clip();
    for (const obstacle of state.obstacles) {
      ground.fillStyle = obstacle.ramp ? '#8e977a' : obstacle.roof ? '#68766d' : '#46534b';
      ground.fillRect(point(obstacle.minX), point(obstacle.minZ), (obstacle.maxX - obstacle.minX) * pixelsPerUnit, (obstacle.maxZ - obstacle.minZ) * pixelsPerUnit);
    }
    ground.restore();
    ground.strokeStyle = '#d2caac55';
    ground.strokeRect(margin, margin, size - margin * 2, size - margin * 2);
    cachedMap = state.builtMap;
  }

  function updateMinimap() {
    if (!state.camera || state.status !== 'playing') return;
    state.camera.getWorldDirection(direction);
    if (direction.x * direction.x + direction.z * direction.z > .0001) {
      heading = Math.atan2(-direction.x, -direction.z);
    }
    if (cachedMap !== state.builtMap) drawTerrain();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.fillStyle = '#17211f'; ctx.fillRect(0, 0, size, size);
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate(heading);
    // Fixed range and a centred player: no pulsing zoom or drifting player arrow.
    ctx.translate(-point(state.camera.position.x), -point(state.camera.position.z));
    ctx.drawImage(terrain, 0, 0, size, size);
    ctx.restore();
    ctx.strokeStyle = '#c2e2e61c'; ctx.lineWidth = .6;
    for (const radius of [36, 70]) { ctx.beginPath(); ctx.arc(80, 80, radius, 0, Math.PI * 2); ctx.stroke(); }
    for (const enemy of state.enemies) {
      if (!enemy.userData.alive) continue;
      const dx = (enemy.position.x - state.camera.position.x) * pixelsPerUnit;
      const dz = (enemy.position.z - state.camera.position.z) * pixelsPerUnit;
      let rx = dx * Math.cos(heading) - dz * Math.sin(heading);
      let ry = dx * Math.sin(heading) + dz * Math.cos(heading);
      const edge = Math.max(1, Math.abs(rx) / 72, Math.abs(ry) / 72);
      rx /= edge; ry /= edge;
      const x = size / 2 + rx, y = size / 2 + ry;
      ctx.beginPath();
      ctx.fillStyle = enemy.userData.isBoss ? '#ffc44d' : '#f17e74';
      if (enemy.userData.isBoss) {
        ctx.moveTo(x, y - 4); ctx.lineTo(x + 4, y); ctx.lineTo(x, y + 4); ctx.lineTo(x - 4, y); ctx.closePath();
      } else ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.fillStyle = '#f9edb51c';
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.arc(0, 0, 20, -Math.PI / 2 - .5, -Math.PI / 2 + .5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = state.heliPiloting ? '#87ffce' : '#fff3cd';
    ctx.strokeStyle = '#17211f'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(3.5, 4); ctx.lineTo(0, 2); ctx.lineTo(-3.5, 4); ctx.closePath();
    ctx.fill(); ctx.stroke(); ctx.restore();
    ctx.fillStyle = '#b6c6bd'; ctx.font = '8px monospace'; ctx.textAlign = 'center';
    ctx.fillText('N', size / 2 + Math.sin(heading) * 65, size / 2 - Math.cos(heading) * 65);
  }

  return { updateMinimap };
}
