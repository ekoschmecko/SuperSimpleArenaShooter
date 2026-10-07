export const WEAPONS = {
  sniper: {
    name: "SNIPER RIFLE",
    key: 5,
    damage: 115,
    size: 5,
    delay: 1.05,
    reload: 2.3,
    spread: .002,
    color: 0xfff1bd
  },
  rifle: {
    name: "ASSAULT RIFLE",
    key: 1,
    damage: 26,
    size: 32,
    delay: .095,
    reload: 1.3,
    spread: .008,
    color: 0xffe1a1
  },
  shotgun: {
    name: "SHOTGUN",
    key: 2,
    damage: 17,
    pellets: 8,
    size: 8,
    delay: .64,
    reload: 1.8,
    spread: .075,
    color: 0xffb45b
  },
  plasma: {
    name: "PLASMA RIFLE",
    key: 3,
    damage: 20,
    size: 50,
    delay: .065,
    reload: 1.65,
    spread: .012,
    color: 0x55f7ff
  },
  rocket: {
    name: "ROCKET LAUNCHER",
    key: 4,
    damage: 155,
    size: 4,
    delay: .72,
    reload: 2.1,
    spread: 0,
    color: 0xff733d
  }
};

export const weaponOrder = ["rifle", "shotgun", "plasma", "rocket", "sniper"];
