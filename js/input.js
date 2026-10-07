// Tastatur, Maus, Pointer Lock, Touch und Spielstart.
export function createInput({ THREE, state, config, dom, api }) {
  async function begin() {
    if (!state.renderer || state.status === "error") return;
    api.initSound();
    if (state.gameOver) api.resetGame();
    if (state.touchMode) {
      state.status = "playing";
      dom.start.style.display = "none";
      document.body.classList.add("playing");
      state.last = performance.now();
      return;
    }
    try {
      if (!state.renderer.domElement.requestPointerLock) throw new Error("Pointer Lock unavailable");
      await state.renderer.domElement.requestPointerLock();
    } catch (error) {
      api.showOverlay("Mouse control unavailable", "Open the HTML file in its own browser tab and allow mouse control.", "Try again");
    }
  }

  function setupInput() {
    dom.startBtn.addEventListener("click", begin);
    document.getElementById("mapSelect").addEventListener("change", e => {
      if (!config.MAPS[e.target.value] || !state.renderer) return;
      api.pause();
      state.activeMap = e.target.value;
      api.resetGame();
      state.status = "ready";
      api.showOverlay(config.MAPS[state.activeMap].name, "Explore ramps and elevated platforms. A boss arrives every fifth wave.", "LET’S GO →");
    });
    document.addEventListener("pointerlockchange", () => {
      if (document.pointerLockElement === state.renderer?.domElement) {
        if (state.gameOver || state.status === "error") {
          document.exitPointerLock();
          return;
        }
        state.status = "playing";
        api.resetInput();
        dom.start.style.display = "none";
        document.body.classList.add("playing");
        state.last = performance.now();
      } else api.pause();
    });
    document.addEventListener("pointerlockerror", () => {
      if (state.status !== "error") api.showOverlay("Mouse control blocked", "Open the game directly in a browser tab and try again.", "Try again");
    });
    document.addEventListener("mousemove", e => {
      if (state.status !== "playing" || document.pointerLockElement !== state.renderer?.domElement) return;
      state.yaw -= e.movementX * .0022 * (state.scoped ? .26 : 1);
      state.pitch = Math.max(-1.3, Math.min(1.3, state.pitch - e.movementY * .0020 * (state.scoped ? .26 : 1)));
    });
    document.addEventListener("contextmenu", e => {
      if (state.status === "playing") e.preventDefault();
    });
    document.addEventListener("mousedown", e => {
      if (state.status === "playing" && e.button === 2) api.setScope(!state.scoped);
      if (!state.touchMode && state.status === "playing" && e.button === 0) {
        state.firing = true;
        api.shoot();
      }
    });
    document.addEventListener("mouseup", e => {
      if (!state.touchMode && e.button === 0) state.firing = false;
    });
    document.addEventListener("keydown", e => {
      if (e.code === "KeyM" && !e.repeat && !["INPUT", "BUTTON"].includes(document.activeElement?.tagName)) {
        state.sound.enabled = !state.sound.enabled;
        api.initSound();
        api.refreshSoundUI();
        return;
      }
      if (e.code === "KeyP" || e.code === "Escape") {
        api.pause();
        return;
      }
      if (state.status !== "playing") return;
      if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && !e.repeat) { e.preventDefault(); api.useDash(); }
      if (e.code === 'KeyG' && !e.repeat) { e.preventDefault(); api.throwGrenade(); }
      if (e.code === "KeyH" && !e.repeat) api.toggleHelicopter();
      if (e.code === "KeyQ" && !e.repeat && !state.heliPiloting) api.setScope(!state.scoped);
      if (["KeyW", "KeyA", "KeyS", "KeyD", "KeyR", "Space", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "KeyQ", "KeyH", "KeyC"].includes(e.code)) e.preventDefault();
      state.keys[e.code] = true;
      if (e.code === "Space" && !e.repeat) api.jump();
      if (e.code === "KeyR") api.reload();
      for (const [key, w] of Object.entries(config.WEAPONS)) if (e.code === "Digit" + w.key) api.selectWeapon(key);
    });
    document.addEventListener("wheel", e => {
      if (state.status !== "playing") return;
      e.preventDefault();
      const list = config.weaponOrder;
      api.selectWeapon(list[(list.indexOf(state.currentWeapon) + (e.deltaY > 0 ? 1 : list.length - 1)) % list.length]);
    }, {
      passive: false
    });
    document.addEventListener("keyup", e => state.keys[e.code] = false);
    addEventListener("blur", () => {
      api.pause();
      api.resetInput();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        api.pause();
        api.resetInput();
      }
    });
    addEventListener("resize", () => {
      if (!state.camera || !state.renderer) return;
      state.camera.aspect = innerWidth / innerHeight;
      state.camera.updateProjectionMatrix();
      state.renderer.setSize(innerWidth, innerHeight);
    });
  }

  return { begin, setupInput };
}
