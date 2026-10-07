// Each finger owns its gesture; releasing one finger never cancels another.
export function createTouchControls({ THREE, state, config, api }) {
  const pointers = new Map();
  const isFiring = () => [...pointers.values()].some(pointer => pointer.role === 'fire');
  function resetTouchInput() {
    const captured = [...pointers.entries()]; pointers.clear();
    state.touchMove.x = state.touchMove.y = 0; state.firing = false;
    for (const [id, pointer] of captured) if (pointer.element.hasPointerCapture(id)) pointer.element.releasePointerCapture(id);
    document.getElementById('movePad')?.style.removeProperty('--stick-x');
    document.getElementById('movePad')?.style.removeProperty('--stick-y');
    document.querySelectorAll('#touchActions .pressed').forEach(button => button.classList.remove('pressed'));
  }
  function setupTouch() {
    const pad = document.getElementById('movePad'), canvas = state.renderer.domElement;
    function updateMove(event) {
      const bounds = pad.getBoundingClientRect(), range = bounds.width * .34;
      let x = (event.clientX - bounds.left - bounds.width / 2) / range;
      let y = (event.clientY - bounds.top - bounds.height / 2) / range;
      const length = Math.max(1, Math.hypot(x, y)); x /= length; y /= length;
      state.touchMove.x = x; state.touchMove.y = y;
      pad.style.setProperty('--stick-x', x * 30 + 'px'); pad.style.setProperty('--stick-y', y * 30 + 'px');
    }
    function bind(element, role, action) {
      element.addEventListener('pointerdown', event => {
        if (!state.touchMode || state.status !== 'playing' || (event.pointerType === 'mouse' && event.button !== 0)) return;
        event.preventDefault();
        if ((role === 'move' || role === 'look') && [...pointers.values()].some(pointer => pointer.role === role)) return;
        pointers.set(event.pointerId, { role, element, x:event.clientX, y:event.clientY });
        element.setPointerCapture(event.pointerId); element.classList.add('pressed');
        if (role === 'move') updateMove(event);
        if (role === 'fire') { state.firing = true; api.shoot(); }
        if (action) action();
      }, { passive:false });
      // Keyboard activation remains available; touch actions already ran on down.
      if (action) element.addEventListener('click', event => {
        event.preventDefault();
        if (event.detail === 0 && state.status === 'playing') action();
      });
    }
    bind(pad, 'move'); bind(canvas, 'look'); bind(document.getElementById('touchFire'), 'fire');
    const actions = {
      touchReload:api.reload, touchJump:api.jump, touchDash:api.useDash, touchGrenade:api.throwGrenade,
      touchPause:api.pause, touchHeli:api.toggleHelicopter,
      touchScope:() => api.setScope(!state.scoped),
      touchWeapon:() => api.selectWeapon(config.weaponOrder[(config.weaponOrder.indexOf(state.currentWeapon) + 1) % config.weaponOrder.length]),
      touchDown:() => {
        if (!state.heliPiloting || !state.helicopter) return;
        const next = state.helicopter.position.clone().add(new THREE.Vector3(0, -1.5, 0));
        if (next.y >= 6 && api.worldHit(state.helicopter.position, next, 1) === null) state.helicopter.position.copy(next);
      },
    };
    for (const [id, action] of Object.entries(actions)) bind(document.getElementById(id), 'action', action);
    window.addEventListener('pointermove', event => {
      const pointer = pointers.get(event.pointerId);
      if (!pointer || state.status !== 'playing') return;
      event.preventDefault();
      if (pointer.role === 'move') updateMove(event);
      // The fire finger also aims, allowing move + aim + fire with two thumbs.
      if (pointer.role === 'look' || pointer.role === 'fire') {
        const sensitivity = .004 * (state.scoped ? .26 : 1);
        state.yaw -= (event.clientX - pointer.x) * sensitivity;
        state.pitch = Math.max(-1.3, Math.min(1.3, state.pitch - (event.clientY - pointer.y) * sensitivity));
      }
      pointer.x = event.clientX; pointer.y = event.clientY;
    }, { passive:false });
    function release(event) {
      const pointer = pointers.get(event.pointerId); if (!pointer) return;
      pointers.delete(event.pointerId);
      if (pointer.role === 'move') {
        state.touchMove.x = state.touchMove.y = 0;
        pad.style.removeProperty('--stick-x'); pad.style.removeProperty('--stick-y');
      }
      if (![...pointers.values()].some(other => other.element === pointer.element)) pointer.element.classList.remove('pressed');
      state.firing = isFiring();
    }
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) window.addEventListener(type, release);
  }
  return { setupTouch, resetTouchInput };
}
