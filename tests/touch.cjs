// Real multi-contact input through Chrome's touch protocol, not synthetic clicks.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
(async () => {
  const server = http.createServer((req, res) => {
    const relative = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return res.writeHead(404).end();
    let content = fs.readFileSync(file, 'utf8');
    if (relative === 'js/main.js') content += '\nglobalThis.__touchTest = { state, api };';
    res.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : 'text/html'); res.end(content);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.ARENA_BROWSER || ['C:/Program Files/Google/Chrome/Application/chrome.exe', chromium.executablePath()].find(fs.existsSync), headless:true, args:['--enable-unsafe-swiftshader'] });
    const page = await browser.newPage({ viewport:{ width:390, height:844 }, hasTouch:true, isMobile:true });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.locator('#startBtn').click();
    await page.waitForFunction(() => globalThis.__touchTest?.state.status === 'playing');
    await page.evaluate(() => { __touchTest.state.shieldTimer = 999; });
    const cdp = await page.context().newCDPSession(page);
    const held = new Map();
    const center = async id => page.locator('#' + id).evaluate(el => { const r=el.getBoundingClientRect(); return { x:r.x+r.width/2, y:r.y+r.height/2 }; });
    const send = type => cdp.send('Input.dispatchTouchEvent', { type, touchPoints:[...held].map(([id,p]) => ({ id, ...p, radiusX:3, radiusY:3, force:1 })) });
    const down = async (id, point) => { held.set(id, point); await send('touchStart'); };
    const up = async id => { const point=held.get(id); held.delete(id); await cdp.send('Input.dispatchTouchEvent', { type:'touchEnd', touchPoints:[{ id, ...point }] }); };
    const read = () => page.evaluate(() => ({ move:__touchTest.state.touchMove.y, firing:__touchTest.state.firing, yaw:__touchTest.state.yaw, jumps:__touchTest.state.jumpsUsed, reload:__touchTest.state.reloadTimer }));
    const pad = await center('movePad'), fire = await center('touchFire');
    await down(1, { x:pad.x, y:pad.y-30 });
    await down(2, fire);
    let value = await read(); assert.ok(value.move < -.5 && value.firing, 'Move and fire simultaneously');
    const yaw = value.yaw;
    held.set(2, { x:fire.x-20, y:fire.y-5 }); await send('touchMove');
    value = await read(); assert.ok(value.firing && value.move < -.5 && value.yaw > yaw, 'Fire finger aims while moving');
    await down(3, await center('touchJump'));
    value = await read(); assert.ok(value.jumps > 0 && value.firing && value.move < -.5, 'Jump activates on contact while other fingers remain held');
    await up(3); value = await read(); assert.ok(value.firing && value.move < -.5, 'Releasing jump does not release movement or fire');
    await page.evaluate(() => document.dispatchEvent(new MouseEvent('mouseup', { button:0, bubbles:true })));
    assert.equal((await read()).firing, true, 'Compatibility mouseup cannot cancel touch fire');
    await down(4, await center('touchReload'));
    assert.ok((await read()).reload > 0, 'Reload works during held move/fire');
    await up(4); await up(1);
    value = await read(); assert.ok(value.move === 0 && value.firing, 'Releasing movement keeps fire held');
    await up(2); assert.equal((await read()).firing, false);
    await down(5, pad); await down(6, fire);
    held.clear(); await send('touchCancel'); value = await read();
    assert.ok(value.move === 0 && !value.firing, 'Cancelled contacts reset their state');
    await down(7, { x:pad.x, y:pad.y-30 }); await down(8, fire);
    await page.evaluate(() => __touchTest.api.pause());
    value = await read(); assert.ok(value.move === 0 && !value.firing, 'Pause clears captures and held input');
    held.clear(); await send('touchCancel');
    await page.locator('#startBtn').click();
    await down(9, { x:pad.x, y:pad.y-30 }); assert.ok((await read()).move < -.5, 'New gestures work after resume'); await up(9);
    for (const viewport of [{ width:320,height:700 }, { width:390,height:844 }, { width:844,height:390 }, { width:568,height:320 }]) {
      await page.setViewportSize(viewport);
      const fits = await page.evaluate(() => {
        const rect = id => document.getElementById(id).getBoundingClientRect();
        const clear = (a,b) => a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top;
        const ids = ['movePad','touchActions','loadoutHUD','abilityHUD','healthCard','minimap','waveHUD'];
        const boxes = ids.map(rect);
        return { boxes: boxes.map((r,i) => ({ id:ids[i], x:r.x,y:r.y,width:r.width,height:r.height })), inside:boxes.every(r => r.left >= 0 && r.top >= 0 && r.right <= innerWidth+1 && r.bottom <= innerHeight+1), overlaps:boxes.flatMap((r,i) => boxes.slice(i+1).map((other,j) => clear(r,other) ? null : [ids[i],ids[i+j+1]]).filter(Boolean)) };
      });
      assert.ok(fits.inside && fits.overlaps.length === 0, 'Mobile controls and HUD do not overlap: ' + JSON.stringify({ viewport, ...fits }));
      if (process.env.ARENA_CAPTURE_TOUCH) await page.screenshot({ path:path.join(process.env.ARENA_CAPTURE_TOUCH, `arena-touch-${viewport.width}.png`) });
    }
    assert.deepEqual(errors, []);
    console.log('PASS: real multi-touch move/aim/fire/jump/reload, independent releases, cancellation, pause/resume, portrait and landscape layouts.');
  } finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
