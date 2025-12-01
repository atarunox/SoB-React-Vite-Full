// src/utils/lootParser.js
// Extracts resource payouts like "250 Gold", "Gain 2 Dark Stone", "3 Tech", "1 Scrap", "$250", "1 DS"
const RESOURCE_MAP = [
  { field: 'gold',       patterns: [/gold/i, /\$/] },
  { field: 'darkStone',  patterns: [/dark\s*stone/i, /\bDS\b/i, /\bdarkstone\b/i] },
  { field: 'tech',       patterns: [/tech(?!nique)/i] },
  { field: 'scrap',      patterns: [/scrap/i] },
];

// Matches numbers like 250, 1, 2, 1,000
const NUM = String.raw`(\d{1,3}(?:,\d{3})*|\d+)`;

// e.g. "Gain 2 Dark Stone", "2 Dark Stone", "250 Gold", "$250", "Add 3 Tech", "Scrap +1"
const BASE_PATTERNS = [
  new RegExp(`${NUM}\\s*(gold|dark\\s*stone|darkstone|ds|tech|scrap|\\$)`, 'ig'),
  new RegExp(`(gold|dark\\s*stone|darkstone|ds|tech|scrap|\\$)\\s*${NUM}`, 'ig'),
  new RegExp(`(?:gain|add|receive|award|loot|+|\\+)\\s*${NUM}\\s*(gold|dark\\s*stone|darkstone|ds|tech|scrap|\\$)`, 'ig'),
];

function parseAmount(raw) {
  if (!raw) return 0;
  return Number(String(raw).replace(/,/g, '')) || 0;
}

function normalizeField(token) {
  if (!token) return null;
  const t = token.toLowerCase();
  for (const { field, patterns } of RESOURCE_MAP) {
    if (patterns.some(re => re.test(token))) return field;
    if (field === 'gold' && t === '$') return 'gold';
  }
  return null;
}

/**
 * Returns [{ field: 'gold'|'darkStone'|'tech'|'scrap', amount: number }, ...]
 */
export function extractResourcesFromText(text = '') {
  if (!text) return [];
  const found = [];

  for (const re of BASE_PATTERNS) {
    re.lastIndex = 0; // reset
    let m;
    while ((m = re.exec(text)) !== null) {
      // The order depends on which pattern matched; detect which capture is the number and which is the token
      const parts = m.slice(1).map(s => (s ?? '').trim());
      const n1 = parseAmount(parts[0]);
      const n2 = parseAmount(parts[1]);
      const t1 = parts[0];
      const t2 = parts[1];

      let amount = 0;
      let field = null;

      if (Number.isFinite(n1) && n1 > 0 && normalizeField(t2)) {
        amount = n1;
        field = normalizeField(t2);
      } else if (Number.isFinite(n2) && n2 > 0 && normalizeField(t1)) {
        amount = n2;
        field = normalizeField(t1);
      }

      if (field && amount > 0) {
        found.push({ field, amount });
      }
    }
  }

  // Merge duplicates (e.g., "Gain 100 Gold and 50 Gold")
  const merged = found.reduce((acc, { field, amount }) => {
    acc[field] = (acc[field] ?? 0) + amount;
    return acc;
  }, {});
  return Object.entries(merged).map(([field, amount]) => ({ field, amount }));
}

/**
 * Given a hero and parsed resources, returns a patch object to apply with updateHero
 */
export function buildResourcePatch(hero = {}, resources = []) {
  const patch = {};
  for (const { field, amount } of resources) {
    const cur = Number(hero[field] ?? 0);
    patch[field] = cur + Number(amount || 0);
  }
  return patch;
}
