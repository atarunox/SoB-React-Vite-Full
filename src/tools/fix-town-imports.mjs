// tools/fix-town-imports.mjs
// Adds explicit `.js` extension to any relative imports into src/data/townLocations/...
// Usage: node tools/fix-town-imports.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

const fileList = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) fileList.push(p);
  }
}
walk(SRC);

const NEED_JS = /from\s+['"](?<spec>\.\/|\.\.\/).*townLocations\/[^'"]+['"]/g;

let changed = 0;
for (const file of fileList) {
  let text = fs.readFileSync(file, 'utf8');
  let out = text.replace(NEED_JS, (m) => {
    const quote = m.includes('"') ? '"' : "'";
    const start = m.indexOf(quote);
    const end = m.lastIndexOf(quote);
    const spec = m.slice(start + 1, end);

    if (/\.(js|jsx)$/.test(spec)) return m; // already explicit
    const fixed = spec + '.js';
    return m.replace(spec, fixed);
  });

  if (out !== text) {
    fs.writeFileSync(file, out);
    changed++;
    console.log('fixed:', path.relative(ROOT, file));
  }
}

console.log(`Done. Updated ${changed} files.`);
