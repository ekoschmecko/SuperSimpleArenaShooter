// Gemeinsamer Laufzeitzustand; pro Spielinstanz neu angelegt.
export function createState(THREE, config) {
  const state = {};
  state.scene = undefined;
  state.camera = undefined;
  state.renderer = undefined;
  state.weaponGroup = undefined;
  state.rifle = undefined;
  state.rocketLauncher = undefined;
  state.playerBody = undefined;
  state.enemies = [];
  state.projectiles = [];
  state.powerups = [];
  state.keys = {};
  state.yaw = 0;
  state.pitch = 0;
  state.hp = 100;
  state.maxHp = 200;
  state.score = 0;
  state.wave = 1;
  state.scoped = false;
  state.hitMarkerTimer = 0;
  state.glowTexture = null;
  state.magazines = Object.fromEntries(Object.entries(config.WEAPONS).map(([k, w]) => [k, w.size]));
  state.weaponModels = {};
  state.reloadWeapon = null;
  state.feetY = 0;
  state.jumpVelocity = 0;
  state.grounded = true;
  state.jumpsUsed = 0;
  state.damageFlash = 0;
  state.nextWaveTimer = 0;
  state.cooldown = 0;
  state.reloadTimer = 0;
  state.shieldTimer = 0;
  state.rocketTimer = 0;
  state.rapidTimer = 0;
  state.currentWeapon = "rifle";
  state.gameOver = false;
  state.status = "ready";
  state.firing = false;
  state.effects = [];
  state.simTime = 0;
  state.navTarget = "";
  state.navRefresh = 0;
  state.navDistances = new Map();
  state.touchMode = matchMedia("(pointer: coarse)").matches;
  state.touchMove = {
    x: 0,
    y: 0
  };
  state.uiCache = new Map();
  state.last = performance.now();
  state.velocity = new THREE.Vector3();
  state.obstacles = [];
  state.heliPiloting = false;
  state.pilotReturn = null;
  state.heliManualCooldown = 0;
  state.activeMap = "depot";
  state.builtMap = null;
  state.environmentObjects = [];
  state.helicopter = null;
  state.heliTimer = 0;
  state.heliShot = 0;
  state.heliAudio = 0;
  state.reloadDuration = 1.3;
  state.sound = {
    ctx: null,
    master: null,
    output: null,
    noise: null,
    enabled: true,
    volume: .35,
    voices: 0,
    last: new Map()
  };
  return state;
}
