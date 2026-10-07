// Referenzen auf die Oberfläche der index.html.
export function createDOM() {
  return {
    game: document.getElementById("game"),
    hpEl: document.getElementById("hp"),
    healthBar: document.getElementById("healthBar"),
    scoreEl: document.getElementById("score"),
    waveEl: document.getElementById("wave"),
    reloadHint: document.getElementById("reloadHint"),
    reloadWrap: document.getElementById("reloadWrap"),
    reloadFill: document.getElementById("reloadFill"),
    start: document.getElementById("start"),
    startBtn: document.getElementById("startBtn"),
    chipShield: document.getElementById("chipShield"),
    chipRocket: document.getElementById("chipRocket"),
    chipRapid: document.getElementById("chipRapid"),
  };
}
