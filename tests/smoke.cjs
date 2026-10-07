// Integrationstest im echten Browser: node tests/smoke.cjs (benötigt Playwright).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');

async function run() {
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relative = pathname.replace(/^\/arena\//, '') || 'index.html';
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404).end(); return;
    }
    let content = fs.readFileSync(file, 'utf8');
    // Expose the context only in the test response, never in the shipped game.
    if (relative === 'js/main.js') content += '\nglobalThis.__arenaTest = { state, api };\nexport { state, api, config };\n';
    response.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : 'text/html');
    response.end(content);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: process.env.ARENA_BROWSER || [
        chromium.executablePath(),
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      ].find(file => fs.existsSync(file)),
      headless: true,
      args: ['--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'],
    });
    const page = await browser.newPage({ hasTouch: true, viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const address = `http://127.0.0.1:${server.address().port}/arena/index.html`;
    await page.goto(address);
    await page.waitForFunction(() => !document.getElementById('startBtn').disabled, { timeout: 30000 });
    const ready = await page.evaluate(async () => {
      const { state } = await import('./js/main.js');
      return { status: state.status, enemies: state.enemies.length, weapons: Object.keys(state.weaponModels).length };
    });
    assert.deepEqual(ready, { status: 'ready', enemies: 8, weapons: 5 });
    await page.waitForFunction(() => [...document.querySelectorAll('#weaponRack img')].length === 5 && [...document.querySelectorAll('#weaponRack img')].every(img => img.complete && img.naturalWidth === 256));
    const thumbnails = await page.locator('#weaponRack img').evaluateAll(images => images.map(img => {
      const canvas = document.createElement('canvas'); canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let visible = 0, clear = 0;
      for (let i = 3; i < data.length; i += 4) { if (data[i] > 0) visible++; else clear++; }
      return { source: img.src, visible, clear };
    }));
    assert.equal(new Set(thumbnails.map(item => item.source)).size, 5, 'Five distinct model thumbnails');
    assert.ok(thumbnails.every(item => item.visible > 100 && item.clear > 100), 'Weapon renders are visible on transparent backgrounds');
    const guideFits = await page.locator('.mouseKey').evaluate(el => {
      const box = el.getBoundingClientRect();
      return box.width < 50 && box.height < 60 && getComputedStyle(el).fill === 'none';
    });
    assert.ok(guideFits, 'Start menu mouse illustration stays small and styled');
    if (process.env.ARENA_CAPTURE_MENU) {
      await page.screenshot({ path: process.env.ARENA_CAPTURE_MENU });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.screenshot({ path: process.env.ARENA_CAPTURE_MENU.replace('.png', '-mobile.png') });
      await page.setViewportSize({ width: 1280, height: 900 });
    }
    const roofsFit = await page.evaluate(async () => {
      const { state: s, api } = await import('./js/main.js');
      const roofs = s.scene.children.filter(mesh => mesh.userData.roof);
      return roofs.length === 6 && roofs.every(mesh => {
        const roof = mesh.userData.roof;
        mesh.geometry.computeBoundingBox();
        const bounds = mesh.geometry.boundingBox;
        const cap = s.obstacles.find(o => !o.roof && Math.abs(o.height - roof.base) < 1e-6 && Math.abs(o.minY - (roof.base - .25)) < 1e-6 && Math.abs(o.minX - (roof.x - roof.halfX)) < 1e-6 && Math.abs(o.maxZ - (roof.z + roof.halfZ)) < 1e-6);
        const from = s.camera.position.clone().set(roof.x + roof.halfX * .5, roof.base + roof.rise + 1, roof.z);
        const to = from.clone(); to.y = roof.base - 1;
        const collider = s.obstacles.find(o => o.roof === roof);
        const hit = api.roofHit(from, to, collider);
        const hitHeight = from.clone().lerp(to, hit).y;
        return !!cap && Math.abs(mesh.position.y + bounds.min.y - cap.height) < 1e-6 && Math.abs(bounds.min.x + roof.halfX) < 1e-5 && Math.abs(bounds.max.z - roof.halfZ) < 1e-5 && Math.abs(hitHeight - api.surfaceHeight(collider, from.x, from.z)) < 1e-6;
      });
    });
    assert.ok(roofsFit, 'Six depot roofs contact their building caps and match the collision slopes');
    if (process.env.ARENA_CAPTURE_ROOFS) {
      await page.evaluate(async () => {
        const { state: s } = await import('./js/main.js');
        s.weaponGroup.visible = false; s.playerBody.visible = false;
        s.camera.position.set(-5, 10, -3); s.camera.lookAt(-18, 5, -19);
        s.renderer.render(s.scene, s.camera);
      });
      await page.addStyleTag({ content: '#start, #hud, #weaponRack, #ammoNear, #crosshair, #jumpStatus { display:none!important; }' });
      await page.screenshot({ path: process.env.ARENA_CAPTURE_ROOFS });
    }
    if (process.env.ARENA_CAPTURE_NAMEPLATE) {
      await page.evaluate(async () => {
        const { state: s } = await import('./js/main.js');
        const target = s.enemies.find(enemy => enemy.userData.type === 'soldier');
        target.position.set(0, 0, 0); target.rotation.y = 0;
        s.enemies.forEach(enemy => { enemy.visible = enemy === target; });
        s.weaponGroup.visible = false; s.playerBody.visible = false;
        s.camera.position.set(0, 1.9, 4.8); s.camera.lookAt(0, 1.7, 0);
        s.renderer.render(s.scene, s.camera);
      });
      await page.addStyleTag({ content: '#start, #hud, #waveHUD, #weaponRack, #ammoNear, #crosshair, #jumpStatus { display:none!important; }' });
      await page.screenshot({ path: process.env.ARENA_CAPTURE_NAMEPLATE });
    }
    if (process.env.ARENA_PROFILE_LOAD) {
      console.log(await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource');
        const modules = resources.filter(entry => entry.name.includes('/arena/js/'));
        const three = resources.find(entry => entry.name.includes('three@'));
        return {
          readyMs: Math.round(performance.now()),
          moduleRequests: modules.length,
          localModulesFinishedMs: Math.round(Math.max(...modules.map(entry => entry.responseEnd))),
          threeStartedMs: Math.round(three?.startTime ?? 0),
          threeFinishedMs: Math.round(three?.responseEnd ?? 0),
        };
      }));
    }
    if (process.env.ARENA_TEST_LOAD_ONLY) {
      const local = await browser.newPage({ hasTouch: true });
      await local.goto(pathToFileURL(path.join(root, 'index.html')).href);
      await local.waitForFunction(() => !document.getElementById('startBtn').disabled);
      assert.equal(await local.locator('#startBtn').textContent(), 'LET’S GO →');
      assert.equal(await local.locator('#game canvas').count(), 1);
      assert.ok(await local.locator('.mouseKey').evaluate(el => el.getBoundingClientRect().width < 50), 'Local menu mouse size');
      await local.locator('#startBtn').click();
      await local.waitForFunction(() => document.body.classList.contains('playing'));
      assert.equal(await local.locator('#minimapCanvas').count(), 1);
      assert.ok(await local.locator('#minimap').isVisible());
      await local.locator('#touchPause').click();
      await local.locator('#mapSelect').selectOption('canyon');
      assert.equal(await local.locator('#startTitle').textContent(), 'Red Canyon');
      const missing = await browser.newPage();
      await missing.route('**/js/music.js', route => route.fulfill({ status: 404, body: 'Not found' }));
      await missing.goto(address);
      await missing.waitForFunction(() => !document.getElementById('startBtn').disabled);
      assert.equal(await missing.locator('#startBtn').textContent(), 'Reload');
      assert.match(await missing.locator('#startTitle').textContent(), /Game files are missing/);
      assert.deepEqual(errors, []);
      console.log('PASS: HTTP startup, direct file:// startup, local play and map switch, and visible error when a deployed JS module is missing.');
      return;
    }
    await page.locator('#startBtn').click();
    await page.waitForFunction(() => document.body.classList.contains('playing'));
    const radarWorks = await page.evaluate(async () => {
      const { createMinimap } = await import('./js/minimap.js');
      const { state: s, config, api } = await import('./js/main.js');
      const normal = { position: { x: 10, z: -10 }, userData: { alive: true, isBoss: false } };
      const boss = { position: { x: -10, z: -10 }, userData: { alive: true, isBoss: true } };
      const fake = { camera: { position: { x: 0, z: 0 } }, status: 'playing', builtMap: 'test', obstacles: [], enemies: [normal, boss], yaw: 0 };
      let viewYaw = 0;
      fake.camera.getWorldDirection = target => target.set(-Math.sin(viewYaw), 0, -Math.cos(viewYaw));
      const radar = createMinimap({ THREE: { Vector3: s.camera.position.constructor }, state: fake, config });
      radar.updateMinimap(100);
      const ctx = document.getElementById('minimapCanvas').getContext('2d');
      const pixel = (x, z) => [...ctx.getImageData(Math.round((80 + x * 146 / 96) * 2), Math.round((80 + z * 146 / 96) * 2), 1, 1).data];
      const red = pixel(10, -10), gold = pixel(-10, -10);
      viewYaw = Math.PI / 2; radar.updateMinimap();
      const turned = pixel(10, 10);
      // Movement yaw and position must not rotate the map without a camera turn.
      fake.yaw = -Math.PI / 2; fake.camera.position.x = 2;
      radar.updateMinimap();
      const moved = pixel(10, 8);
      viewYaw = 0; fake.camera.position.x = 0;
      normal.userData.alive = false; radar.updateMinimap(101);
      const removed = pixel(10, -10);
      api.updateMinimap(performance.now() + 101);
      return red[0] > 200 && red[1] < 160 && gold[0] > 230 && gold[1] > 160 && turned[0] > 200 && turned[1] < 160 && moved[0] > 200 && moved[1] < 160 && removed[0] < 200 && getComputedStyle(document.getElementById('minimap')).display !== 'none' && getComputedStyle(document.getElementById('waveHUD')).zoom === (s.touchMode ? '1' : '1.38');
    });
    assert.ok(radarWorks, 'Radar follows camera view, ignores movement, removes dead markers, and wave HUD has 20 percent extra scale');
    if (process.env.ARENA_CAPTURE_HUD) {
      await page.evaluate(async () => {
        const { state: s, api } = await import('./js/main.js');
        api.shoot(); api.updateMinimap(performance.now() + 250); s.status = 'paused';
        s.renderer.render(s.scene, s.camera);
      });
      await page.screenshot({ path: process.env.ARENA_CAPTURE_HUD });
      await page.evaluate(() => document.body.classList.remove('touch'));
      await page.screenshot({ path: process.env.ARENA_CAPTURE_HUD.replace('.png', '-desktop.png') });
      await page.evaluate(() => document.body.classList.add('touch'));
      await page.evaluate(() => { globalThis.__arenaTest.state.status = 'playing'; });
    }
    const mechanics = await page.evaluate(async () => {
      const { state: s, api, config } = await import('./js/main.js');
      const check = (condition, label) => { if (!condition) throw new Error(label); };
      check(s.status === 'playing', 'start');
      check(document.getElementById('healthState').textContent === '', 'No READY health label');
      check(!document.getElementById('ammoText') && !document.getElementById('ammoCapacity'), 'No duplicate numeric ammunition display');
      const panelColor = getComputedStyle(document.getElementById('waveHUD')).backgroundColor;
      for (const id of ['healthCard', 'loadoutHUD', 'abilityHUD', 'minimap']) check(getComputedStyle(document.getElementById(id)).backgroundColor === panelColor, 'Consistent HUD surface: ' + id);
      const obstacles = s.obstacles, position = s.camera.position.clone(), keys = s.keys;
      const velocity = s.velocity.clone();
      s.obstacles = []; s.keys = { KeyW: true };
      const speedAt = hp => {
        s.hp = hp; s.velocity.set(0, 0, 0); s.camera.position.set(-40, 1.7, 40);
        s.feetY = s.jumpVelocity = 0; s.grounded = true;
        for (let frame = 0; frame < 60; frame++) api.updatePlayerMovement(1 / 60);
        api.updateUI();
        return s.velocity.length();
      };
      try {
        const normal = speedAt(100), boosted = speedAt(100.1), maxHealth = speedAt(200), restored = speedAt(100);
        check(Math.abs(boosted / normal - 1.15) < .0001 && Math.abs(maxHealth - boosted) < .0001, 'Overhealth grants consistent 15 percent speed boost');
        check(Math.abs(restored - normal) < .0001, 'Speed returns to normal at 100 HP');
        speedAt(100.1); check(document.getElementById('healthState').textContent === 'SPEED +15%', 'Bonus shown immediately above 100 HP');
      } finally {
        s.obstacles = obstacles; s.camera.position.copy(position); s.keys = keys; s.velocity.copy(velocity);
        s.hp = 100; s.feetY = s.jumpVelocity = 0; s.grounded = true; api.updateUI();
      }
      api.jump(); api.jump(); api.jump();
      check(s.jumpsUsed === 2, 'double jump limit');
      s.shieldTimer = 1000;
      for (const weapon of config.weaponOrder) {
        api.selectWeapon(weapon); s.cooldown = 0;
        s.camera.updateMatrixWorld(true);
        const muzzle = s.weaponModels[weapon].userData.muzzles[0].getWorldPosition(s.camera.position.clone());
        const tracer = api.bulletTracer;
        let tracerOrigin = null;
        api.bulletTracer = (from, to, color) => { if (!tracerOrigin) tracerOrigin = from.clone(); tracer(from, to, color); };
        const ammo = s.magazines[weapon];
        api.shoot();
        api.bulletTracer = tracer;
        if (weapon === 'plasma' || weapon === 'rocket') {
          check(s.projectiles[s.projectiles.length - 1].mesh.position.distanceTo(muzzle) < .001, 'projectile originates at muzzle: ' + weapon);
        } else check(tracerOrigin.distanceTo(muzzle) < .001, 'tracer originates at muzzle: ' + weapon);
        check(s.magazines[weapon] === ammo - 1, 'shot: ' + weapon);
        api.reload(); check(s.reloadTimer > 0, 'reload: ' + weapon);
        api.finishReload(); check(s.magazines[weapon] === config.WEAPONS[weapon].size, 'full magazine: ' + weapon);
      }
      for (let i = 0; i < 120; i++) api.step(1 / 60);
      const target = s.enemies[0], points = s.score;
      check(s.powerups.length === 0, 'No supplies spawned at wave start');
      const random = Math.random;
      try { Math.random = () => 0; api.damageEnemy(target, 100000, true); }
      finally { Math.random = random; }
      check(!target.userData.alive && s.score > points, 'enemy kill and points');
      check(s.powerups.length === 1 && s.powerups[0].userData.type === 'health', 'Killed enemy drops weighted loot');
      check(s.powerups[0].position.x === target.position.x && s.powerups[0].position.z === target.position.z, 'Loot at enemy position');
      api.damageEnemy(target, 100000);
      check(s.powerups.length === 1, 'Dead enemy cannot drop twice');
      const marker = document.getElementById('hitMarker');
      check(marker.classList.contains('headshot') && marker.classList.contains('kill'), 'headshot kill marker');
      check(marker.children.length === 4 && s.hitMarkerTimer === .22, 'four strokes and headshot duration');
      s.magazines.rifle = 0; api.selectWeapon('rifle'); api.updateUI();
      check(document.getElementById('ammoNear').classList.contains('lowAmmo'), 'Empty magazine warning');
      check(document.querySelectorAll('#ammoRounds .loaded').length === 0, 'Empty magazine segments');
      s.hp = 20; api.updateUI();
      check(document.getElementById('healthCard').classList.contains('critical'), 'Critical vitals warning');
      check(document.getElementById('waveStatus').textContent === '7 HOSTILES LEFT', 'Live wave count');
      api.spawnPowerup('health'); s.hp = 50;
      api.pickup(s.powerups[s.powerups.length - 1]);
      check(s.hp === 85, 'health pickup');
      const roof = s.obstacles.find(o => o.roof).roof;
      const oldPosition = s.camera.position.clone(), oldFeet = s.feetY;
      const top = roof.base + roof.rise;
      api.spawnPowerup('ammo', oldPosition.clone().set(roof.x, top, roof.z));
      const elevated = s.powerups[s.powerups.length - 1];
      check(Math.abs(elevated.userData.baseY - top) < .001, 'Roof loot rests on roof');
      s.camera.position.set(roof.x, top + 1.7, roof.z); s.feetY = top;
      api.updatePowerups(0);
      check(!s.powerups.includes(elevated), 'Roof loot can be collected at roof height');
      s.camera.position.copy(oldPosition); s.feetY = oldFeet;
      api.spawnPowerup('dash'); api.pickup(s.powerups[s.powerups.length - 1]);
      check(s.dashCharges === 1, 'Dash is stored after pickup');
      api.useDash(); check(s.dashCharges === 0 && s.dashTimer > 0, 'Dash consumes one stored charge');
      api.useDash(); check(s.dashCharges === 0, 'No dash without a charge');
      const wallHit = api.worldHit;
      try {
        const beforeDash = s.camera.position.clone(); api.worldHit = () => .2;
        api.updatePlayerMovement(.016);
        check(s.camera.position.distanceTo(beforeDash) < .001 && s.dashTimer === 0, 'Dash cannot cross a thin wall');
      } finally { api.worldHit = wallHit; }
      api.spawnPowerup('grenade'); api.pickup(s.powerups[s.powerups.length - 1]);
      api.throwGrenade(); check(s.grenadeCharges === 0 && s.grenades.length === 1, 'Grenade consumes one stored charge');
      const grenadeTarget = s.enemies.find(enemy => enemy.userData.alive);
      const grenadeHp = grenadeTarget.userData.hp;
      s.grenades[0].mesh.position.copy(grenadeTarget.position).y += 1;
      s.grenades[0].velocity.set(0, 0, 0); s.grenades[0].fuse = 0;
      api.updateAbilities(.001);
      check(grenadeTarget.userData.hp < grenadeHp, 'Grenade explosion damages nearby enemies');
      for (let i = 0; i < 100; i++) api.updateAbilities(.02);
      check(s.grenades.length === 0, 'Grenade detonates and releases its mesh');
      check(s.enemies.every(e => e.userData.legs.every(leg => Math.abs(leg.rotation.y) < .001)), 'Enemy legs never twist backwards');
      api.activateHelicopter(); api.toggleHelicopter();
      check(s.heliPiloting, 'helicopter entry');
      s.jumpsUsed = 0; api.updateUI();
      check(document.getElementById('touchJump').textContent === 'Ascend', 'helicopter touch label');
      s.keys.KeyW = true; api.step(.02); api.shoot();
      api.toggleHelicopter(); check(!s.heliPiloting, 'helicopter exit');
      api.pause(); check(s.status === 'paused', 'pause');
      api.updateMusic();
      return { audio: s.sound.ctx.state, voices: s.sound.voices };
    });
    assert.equal(mechanics.audio, 'running');
    for (const map of ['canyon', 'foundry', 'depot']) {
      await page.locator('#mapSelect').selectOption(map);
      const result = await page.evaluate(async () => {
        const { state: s, api } = await import('./js/main.js');
        s.status = 'playing'; s.shieldTimer = 1000;
        s.wave = 5;
        s.enemies.forEach(api.disposeObject); s.enemies = [];
        api.spawnWave();
        const boss = s.enemies.find(e => e.userData.isBoss);
        boss.userData.hp = boss.userData.maxHp * .4;
        api.enemyFire(boss);
        for (let i = 0; i < 60; i++) api.step(1 / 60);
        api.damageEnemy(boss, 100000);
        const heliDrop = s.powerups.some(p => p.userData.type === 'heli');
        api.hurtPlayer(100000); // Shield intentionally blocks damage.
        let gameOverSounds = 0;
        const originalSound = api.sfx;
        api.sfx = name => { if (name === 'over') gameOverSounds++; };
        s.shieldTimer = 0; api.hurtPlayer(100000); api.endGame();
        api.sfx = originalSound;
        if (gameOverSounds !== 1) throw new Error('Game Over runs more than once');
        const over = s.status;
        api.resetGame(); s.status = 'ready';
        return { map: s.builtMap, enemies: s.enemies.length, hp: s.hp, over, heliDrop };
      });
      assert.deepEqual(result, { map, enemies: 8, hp: 100, over: 'over', heliDrop: true });
      if (process.env.ARENA_CAPTURE_MAPS) {
        await page.evaluate(async () => {
          const { state: s, api } = await import('./js/main.js');
          document.getElementById('start').style.display = 'none'; document.body.classList.add('playing'); document.body.classList.remove('touch');
          s.status = 'playing'; api.updateMinimap(); s.status = 'ready'; s.renderer.render(s.scene, s.camera);
        });
        await page.screenshot({ path: path.join(process.env.ARENA_CAPTURE_MAPS, 'arena-' + map + '.png') });
        await page.evaluate(() => { document.getElementById('start').style.display = 'flex'; document.body.classList.remove('playing'); document.body.classList.add('touch'); });
      }
    }
    await page.locator('#musicBtn').click();
    assert.equal(await page.locator('#musicBtn').getAttribute('aria-pressed'), 'true');
    await page.locator('#musicVolume').fill('27');
    assert.equal(await page.locator('#musicValue').textContent(), '27%');
    await page.locator('#muteBtn').click();
    const muted = await page.evaluate(async () => !(await import('./js/main.js')).state.sound.enabled);
    assert.equal(muted, true);
    const audioCleanup = await page.evaluate(async () => {
      const { createAudio } = await import('./js/audio.js');
      const ctx = new OfflineAudioContext(1, 44100, 44100);
      const transport = new Proxy(ctx, { get(target, key) {
        if (key === 'state') return 'running';
        const value = Reflect.get(target, key, target);
        return typeof value === 'function' ? value.bind(target) : value;
      } });
      const master = ctx.createGain(); master.connect(ctx.destination);
      const noise = ctx.createBuffer(1, 44100, 44100);
      for (let i = 0; i < 44100; i++) noise.getChannelData(0)[i] = Math.random() * 2 - 1;
      const state = { sound: { ctx: transport, master, noise, enabled: true, volume: .35, voices: 0, last: new Map() } };
      const audio = createAudio({ state });
      for (const weapon of ['rifle', 'shotgun', 'sniper', 'rocket', 'plasma']) audio.sfx(weapon);
      const started = state.sound.voices;
      const rendered = await ctx.startRendering();
      await new Promise(resolve => setTimeout(resolve, 0));
      return { started, remaining: state.sound.voices, finite: rendered.getChannelData(0).every(Number.isFinite) };
    });
    assert.ok(audioCleanup.started > 0);
    assert.equal(audioCleanup.remaining, 0, 'Sound nodes released after offline playback');
    assert.ok(audioCleanup.finite);
    const reservedAudio = await page.evaluate(async () => {
      const { createAudio } = await import('./js/audio.js');
      const ctx = new OfflineAudioContext(1, 44100, 44100);
      const transport = new Proxy(ctx, { get(target, key) {
        if (key === 'state') return 'running';
        const value = Reflect.get(target, key, target);
        return typeof value === 'function' ? value.bind(target) : value;
      } });
      const master = ctx.createGain(); master.connect(ctx.destination);
      const noise = ctx.createBuffer(1, 44100, 44100);
      const state = { camera: { position: {} }, sound: { ctx: transport, master, noise,
        enabled: true, volume: .35, voices: 32, last: new Map() } };
      const audio = createAudio({ state });
      audio.enemySound({ position: { distanceTo: () => 0 } }, 'enemyShot');
      const enemyCount = state.sound.voices;
      audio.sfx('headshot');
      const hitCount = state.sound.voices;
      await ctx.startRendering();
      await new Promise(resolve => setTimeout(resolve, 0));
      return { enemyCount, hitCount, remaining: state.sound.voices };
    });
    assert.deepEqual(reservedAudio, { enemyCount: 32, hitCount: 35, remaining: 32 }, 'Headshots retain voices under enemy audio load');
    const musicResults = await page.evaluate(async () => {
      const { createMusic } = await import('./js/music.js');
      async function render(activeMap, wave) {
      const ctx = new OfflineAudioContext(1, 88200, 44100);
      const output = ctx.createGain(); output.connect(ctx.destination);
      let clock = 0;
      const events = [];
      // Offline rendering starts suspended. Present a running transport while
      // scheduling the first notes before rendering, using the real audio nodes.
      const transport = new Proxy(ctx, {
        get(target, key) {
          if (key === 'state') return 'running';
          if (key === 'currentTime') return clock;
          if (key === 'createOscillator') return () => {
            const osc = target.createOscillator();
            const setFrequency = osc.frequency.setValueAtTime.bind(osc.frequency);
            osc.frequency.setValueAtTime = (value, time) => {
              events.push([osc.type, Math.round(value), Math.round(time * 1000)]);
              return setFrequency(value, time);
            };
            return osc;
          };
          const value = Reflect.get(target, key, target);
          return typeof value === 'function' ? value.bind(target) : value;
        },
      });
      const state = { activeMap, wave, status: 'playing', gameOver: false, sound: { ctx: transport, output, enabled: true } };
      const music = createMusic({ state }); music.initMusic();
      for (clock = 0; clock < 1.8; clock += .05) music.updateMusic();
      const buffer = await ctx.startRendering();
      let energy = 0;
      const samples = buffer.getChannelData(0);
      for (const value of samples) energy += value * value;
      return { energy, finite: samples.every(Number.isFinite), signature: JSON.stringify(events) };
      }
      const results = [];
      for (const map of ['depot', 'canyon', 'foundry']) results.push(await render(map, 1), await render(map, 10));
      return results;
    });
    for (const result of musicResults) assert.ok(result.finite && result.energy > .01, 'Music remains audible on all maps at wave 1 and 10');
    assert.equal(new Set(musicResults.map(result => result.signature)).size, 6, 'Every map and wave arrangement differs');
    await page.setViewportSize({ width: 320, height: 700 });
    const radarLayout = await page.evaluate(() => {
      document.body.classList.add('playing');
      document.getElementById('bossHUD').style.display = 'block';
      document.getElementById('heliStatus').style.display = 'block';
      const radar = document.getElementById('minimap').getBoundingClientRect();
      const boss = document.getElementById('bossHUD').getBoundingClientRect();
      const helicopter = document.getElementById('heliStatus').getBoundingClientRect();
      const separate = (a, b) => a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom;
      return { fits: radar.right <= innerWidth && radar.left >= 0 && separate(boss, radar) && separate(helicopter, radar) && separate(boss, helicopter), radar: radar.toJSON(), boss: boss.toJSON(), helicopter: helicopter.toJSON() };
    });
    assert.ok(radarLayout.fits, 'Mobile radar stays clear of boss and helicopter HUD: ' + JSON.stringify(radarLayout));
    const audioFits = await page.locator('.audioRow').evaluateAll(rows => rows.every(row => row.scrollWidth <= row.clientWidth));
    assert.ok(audioFits, 'Audio controls fit on a small mobile screen');
    assert.deepEqual(errors, []);
    console.log('PASS: project subpath, initialization, five weapons, reload, double jump, damage, powerups, helicopter, three maps, bosses, game over, audio controls, cleanup, music waveform and mobile layout.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
