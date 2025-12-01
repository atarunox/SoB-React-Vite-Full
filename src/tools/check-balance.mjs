// tools/check-balance.mjs
// Lists files with mismatched (), [], {} counts (quick heuristic).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

const files = [];
function walk(dir) {
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) walk(p);
    else if (/\.(js|jsx|ts|tsx)$/.test(d.name)) files.push(p);
  }
}
walk(SRC);

const bad = [];
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8');
  const brace = (t.match(/\{/g) || []).length - (t.match(/\}/g) || []).length;
  const bracket = (t.match(/\[/g) || []).length - (t.match(/\]/g) || []).length;
  const paren = (t.match(/\(/g) || []).length - (t.match(/\)/g) || []).length;
  if (brace || bracket || paren) bad.push({ file: path.relative(ROOT, f), brace, bracket, paren });
}

if (!bad.length) {
  console.log('All good ✅');
} else {
  console.log(JSON.stringify(bad, null, 2));
  process.exitCode = 1;
}
