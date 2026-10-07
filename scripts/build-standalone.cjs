// Erzeugt ohne Zusatzpakete die klassische JS-Startvariante für file://.
// Die ES-Module bleiben die bearbeitbaren Quellen und die HTTP-Version.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, 'js', name), 'utf8').replace(/\r\n/g, '\n');
const stripExports = source => source.replace(/^export (?=(?:const|function)\b)/gm, '');
const stripImports = source => source.replace(/^import [^\n]+;\n/gm, '');
const main = read('main.js');
const configurations = [...read('config.js').matchAll(/^export \* from '([^']+)';/gm)].map(match => match[1]);
const configSource = configurations.map(file => read(file)).join('\n');
const configNames = [...configSource.matchAll(/^export const (\w+)/gm)].map(match => match[1]);
const modules = [...main.matchAll(/^import \{[^\n]+\} from '\.\/([^']+)';/gm)].map(match => match[1]);
const content = [
  '// Automatisch erzeugt mit npm run build:local. Nicht direkt bearbeiten.\n',
  '(async () => {\n',
  `const config = (() => {\n${stripExports(configSource)}\nreturn { ${configNames.join(', ')} };\n})();\n`,
  stripExports(read('audio-config.js')),
  ...modules.map(file => `\n// Quelle: js/${file}\n${stripExports(stripImports(read(file)))}`),
  '\n// Quelle: js/main.js\n',
  stripImports(main),
  '\n})().catch(error => window.dispatchEvent(new CustomEvent("arena-load-error", { detail: error })));\n',
].join('\n');
const target = path.join(root, 'js', 'standalone.js');
if (process.argv.includes('--check')) {
  if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== content) {
    console.error('Die lokale Startvariante ist veraltet. Bitte npm run build:local ausführen.');
    process.exitCode = 1;
  } else console.log('Lokale Startvariante stimmt mit den Modulen überein.');
} else {
  fs.writeFileSync(target, content);
  console.log('js/standalone.js erzeugt; index.html lässt sich direkt öffnen.');
}
