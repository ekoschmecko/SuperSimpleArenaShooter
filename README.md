# Super Simpel Arena Shooter

Ein statischer 3D-Arena-Shooter mit Three.js. `index.html` bleibt der Einstiegspunkt für GitHub Pages. Die Seite lädt `js/main.js` und dessen Module über relative Pfade; es ist kein Build nötig. Für die Three.js-Bibliothek wird eine Internetverbindung benötigt.

Beim Veröffentlichen müssen **`index.html` und der vollständige Ordner `js/`** im gleichen Commit hochgeladen werden. Nur die HTML-Datei zu ersetzen reicht nicht mehr aus. Eine fehlende Moduldatei zeigt eine Fehlermeldung mit „Erneut laden“.

## Lokal starten

`index.html` lässt sich direkt per Doppelklick im Browser öffnen. Der Ordner `js/` muss daneben liegen. Für `file://` wird automatisch die mitgelieferte `js/standalone.js` geladen; auf GitHub Pages und über HTTP werden weiterhin die einzelnen ES-Module verwendet. Three.js benötigt auch beim lokalen Start eine Internetverbindung.

Nach Änderungen an den Modulen die lokale Startvariante neu erzeugen:

```sh
npm run build:local
```

Dafür wird nur Node.js benötigt, keine installierten Zusatzpakete. `standalone.js` nicht von Hand bearbeiten und beim Veröffentlichen mit hochladen.

Alternativ das Projekt über einen lokalen HTTP-Server öffnen, zum Beispiel:

```sh
python -m http.server 8000
```

Anschließend `http://localhost:8000` öffnen. Hier sind Moduländerungen ohne erneutes Erzeugen der lokalen Startvariante sichtbar.

## Komponenten anpassen

| Datei | Zuständigkeit |
| --- | --- |
| `js/config/` | Waffenwerte, Gegnertypen, Kartenmetadaten, Bewegungswerte und Loot-Verteilung |
| `js/weapons.js` | Waffenwechsel, Modelle, Visier, Schüsse, Nachladen und Animationen |
| `js/weapon-previews.js` | Einmalig gerenderte, transparente HUD-Bilder aus den echten Waffenmodellen |
| `js/player.js` | Bewegung, Schwerkraft, Doppelsprung und Spielermodell |
| `js/enemies.js` | Wellen, Gegnermodelle, KI, Angriffe, Schaden und Bosse |
| `js/navigation.js` | Gemeinsames Navigationsraster und Umgehen von Hindernissen |
| `js/world.js` | Kartenaufbau, Gebäude, Deckung, Plattformen und Rampen |
| `js/map-art.js` | Prozedurale Oberflächen, Sandsteinkulisse und Neon-Fabrikhorizont |
| `js/abilities.js` | Gespeicherte Dash-Ladungen, Granatenflug und Explosionen |
| `js/collision.js` | Kollisionsprüfung, Sichtlinien und Körper-/Kopftreffer |
| `js/projectiles.js` | Fliegende Projektile, Explosionen und Spielerschaden |
| `js/powerups.js` | Erzeugung, Lebensdauer und Wirkung der Power-ups |
| `js/helicopter.js` | Automatische Unterstützung und manuelles Fliegen |
| `js/audio.js` | Synthetische Soundeffekte und geschichtete Waffensounds |
| `js/music.js` | Hintergrundtrack und zeitliche Planung der Musiknoten |
| `js/audio-config.js` | Klangprofile, Musiktempo, Akkorde und Standardlautstärke |
| `js/input.js` | Maus, Tastatur und Starten einer Runde |
| `js/touch-controls.js` | Unabhängige Finger-Gesten, gleichzeitiges Laufen/Zielen/Feuern und Touch-Tasten |
| `js/hud.js` | Anzeigen, Menüs und Aktualisierung der Oberfläche |
| `js/minimap.js` | Minimap mit Hindernissen, Gegnern, Bossen und Blickrichtung; Terrain wird gecacht |
| `js/lifecycle.js` | Pause, Spielende, Neustart und Zurücksetzen der Eingaben |
| `js/graphics.js` | Geometriehelfer, Effekte und Freigabe von Grafikressourcen |
| `js/simulation.js` | Reihenfolge der Updates, Timer und Wellenwechsel |
| `js/state.js`, `js/dom.js` | Laufzeitzustand und Referenzen auf HTML-Elemente |
| `js/main.js` | Komponenten verbinden, Three.js laden und Render-Schleife starten |

Die Komponenten sind Factory-Funktionen (`createWeapons`, `createPlayer` usw.). Sie bekommen einen expliziten Kontext: `THREE`, `state`, `config`, `dom` und `api`. Veränderliche Werte liegen in `state`; andere Komponenten werden über `api` aufgerufen. `main.js` registriert alle Komponenten, bevor Initialisierung und Eingaben beginnen. Es werden keine Spielfunktionen auf `window` abgelegt.

Die Depot-Dächer werden mit `addRoof` aus expliziten Eckpunkten erzeugt. Unterkante und Grundfläche entsprechen dem Gebäudeabschluss; Grafik und Dachkollision verwenden dieselben Maße. Jede Karte hat ein eigenes synthetisiertes Musikthema: Depot mit verzerrten Riffs (144 BPM), Canyon mit tieferen Klangfarben und Tom-Rhythmen (132 BPM), Foundry mit schnellen elektronischen Sequenzen (156 BPM). Riffs, Akkordfolgen und Melodien wechseln über die Takte und Wellen; Bosse ergänzen Drum-Akzente. Musik und Effekte werden getrennt komprimiert. Gegnergeräusche lassen 16 Soundquellen für Spieleraktionen und Treffer frei.

Die UI ist über `--ui-scale: 1.15` in `index.html` um 15 % vergrößert. Die Minimap oben rechts zeigt die Umgebung relativ zum zentrierten Spieler. Sie verwendet einen festen Maßstab, dreht sich mit der Kamerablickrichtung und markiert weiter entfernte Gegner am Rand. Der Spielerpfeil zeigt immer nach oben; der Nordmarker dreht sich mit der Karte. Die Markierungen werden in jedem Renderframe aktualisiert; die statische Karte wird nur beim Kartenwechsel neu gezeichnet. Die Punkte stehen unter der Minimap, die Sprunganzeige unter den Lebenspunkten. Magazinsegmente, kritische Lebenswerte, verbleibende Gegner und Fortschritt zur nächsten Boss-Welle ergänzen das HUD. Das Startmenü zeigt Tastenkappen und ein Maussymbol. Schussspuren und Projektile beginnen an den Laufenden; die Zielrichtung orientiert sich weiterhin am Fadenkreuz.

Power-ups entstehen ausschließlich durch Gegner-Kills. Normale Gegner haben eine Drop-Chance von 30 %; die Typenverteilung steht in `js/config/powerups.js`. Bosse geben garantiert einen Helikopter. Vorhandene Drops bleiben beim Wellenwechsel bis zum Ablauf ihrer Lebensdauer liegen. Drops auf Rampen, Plattformen und Dächern liegen auf der unterstützenden Oberfläche und können auf derselben Höhe eingesammelt werden.

Bei mehr als 100 HP läuft der Spieler 15 % schneller. Der Multiplikator `OVERHEALTH_SPEED_MULTIPLIER` steht in `js/config/movement.js`; bei 100 HP oder weniger gilt wieder das normale Tempo. HUD und Startmenü nutzen einheitliche dunkle Flächen, türkise Akzente und eine gemeinsame Schrift- und Abstandsskala. Munition und Waffenwahl liegen im gemeinsamen Loadout-Block; die Sprunganzeige gehört zur Lebensanzeige. Hände haben geformte Handflächen, gekrümmte Finger und nach unten verlaufende Unterarme statt kugelförmiger Handschuhpolster. Die Wellenanzeige ist zusätzlich um 20 % vergrößert. Munition erscheint als eine Patrone je Schuss, ohne doppelte Zahlenanzeige. Die Minimap nutzt direkt die horizontale Kamerablickrichtung; Laufen allein dreht die Karte nicht.

Beispiel: Gewehrschaden und Magazin in `js/config/weapons.js` ändern; das Schussverhalten in `js/weapons.js`. Gegnerwerte stehen in `js/config/enemies.js`, ihre Verhaltenslogik in `js/enemies.js`. `js/config.js` exportiert die Konfigurationen gesammelt.

Musik und Effekte haben separate Regler im Menü. „Ton: aus“ bzw. `M` schaltet beide stumm; „Musik: aus“ schaltet nur den Hintergrundtrack aus. Die Musik startet nach einer Benutzeraktion und blendet bei Pause, Tabwechsel und Spielende aus. Die Waffensounds werden aus Knall, tiefem Druck, kurzem Nachhall und mechanischen Geräuschen synthetisiert; es sind keine aufgenommenen Schuss-Samples. Audio benötigt keine zusätzlichen Mediendateien.

## Prüfen

```sh
npm install
npx playwright install chromium
npm test
```

Der Test startet einen temporären HTTP-Server und einen Browser im Hintergrund. Er prüft auch einen Projekt-Unterpfad wie bei GitHub Pages: Start, fünf Waffen, Nachladen, Doppelsprung, Schaden, Power-ups, Helikopter, alle Karten, Bosse, Spielende, Audioregler, Freigabe der Soundquellen und die erzeugte Musik-Wellenform. Ein installiertes Chrome/Edge wird unter Windows ebenfalls erkannt; alternativ kann `ARENA_BROWSER` auf eine Browserdatei zeigen.

Dash und Granaten werden als Gegner-Drops gesammelt und jeweils bis zu drei Ladungen gespeichert. Shift verbraucht eine Dash-Ladung für einen kurzen Schub in Bewegungsrichtung (ohne Bewegung nach vorne); Wände stoppen den Dash. G wirft eine Granate mit 1,5 Sekunden Zünder; Wandkontakt löst sie sofort aus, am Boden kann sie abprallen. Die Explosion verursacht Flächenschaden mit Sichtlinienprüfung. Beide Fähigkeiten haben Touch-Tasten und werden beim Neustart zurückgesetzt.

Canyon nutzt warmen Sandboden, geschichtete Sandsteinformationen und einen Felsbogen. Foundry nutzt Metallplatten, eine kühle Nachtbeleuchtung, Neonleitungen und Fabriktürme. Die Kulisse entsteht pro Kartenwechsel; sie benötigt keine externen Bilddateien. Gegner und Spieler nutzen gerichtete Rückwärts- und Seitwärtsschritte ohne umgedrehte Hüftgelenke.

Auf dem Handy wird jede Berührung separat verwaltet. Der linke Daumen steuert den Stick; der rechte kann Fire halten und gleichzeitig zum Zielen ziehen. Ein weiterer Finger kann sofort springen, nachladen oder Fähigkeiten einsetzen. Loslassen, Abbruch und Pause räumen nur die betroffenen Gesten beziehungsweise beim Pausieren alle Gesten auf. Das Hoch- und Querformat haben eigene Layouts und Touch-Zielgrößen. `tests/touch.cjs` prüft echte Mehrkontakt-Ereignisse über das Chrome-Protokoll sowie vier Bildschirmgrößen; es ist Teil von `npm test`.
