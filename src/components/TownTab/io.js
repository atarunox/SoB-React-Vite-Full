// src/components/TownTab/io.js
export const promptNumber = async (label, { min = 0, max = 9999, step = 1, initial = 0 } = {}) => {
  const raw = window.prompt(label, String(initial));
  if (raw == null) return 0;
  const v = Number(raw);
  if (Number.isNaN(v)) return 0;
  return Math.max(min, Math.min(max, Math.round(v / step) * step));
};

export const promptRoll = async (n, sides, label) => {
  const choice = window.prompt(`${label || 'Roll'}: Enter ${n}d${sides} (comma-separated) or leave blank for auto-roll`);
  if (!choice) return Array.from({ length: n }, () => Math.floor(Math.random() * sides) + 1);
  const parts = choice
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((x) => Number.isFinite(x) && x >= 1 && x <= sides);
  if (parts.length === n) return parts;
  return Array.from({ length: n }, () => Math.floor(Math.random() * sides) + 1);
};

export const promptPay = async (_hero, amount, label = 'Pay') => {
  const ok = window.confirm(`${label}\nHero pays $${amount}. Continue?`);
  return !!ok;
};

// factory for Doc's Office calls
export const makeDocIO = (hero) => ({
  roll: promptRoll,
  pay: (amount, label) => promptPay(hero, amount, label),
  promptNumber: (label, opts) => promptNumber(label, opts),
  notify: (msg) => console.log('[Doc]', msg),
});
