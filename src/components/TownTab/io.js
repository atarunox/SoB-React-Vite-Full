// src/components/TownTab/io.js
export const promptNumber = async (label, { min = 0, max = 9999, step = 1, initial = 0 } = {}) => {
  const raw = window.prompt(label, String(initial));
  if (raw == null) return 0;
  const v = Number(raw);
  if (Number.isNaN(v)) return 0;
  return Math.max(min, Math.min(max, Math.round(v / step) * step));
};

// Roll mode helper: reads from localStorage
function getRollMode() {
  try { return localStorage.getItem('sob_rollMode') || null; } catch { return null; }
}

export const promptRoll = async (n, sides, label) => {
  const auto = () => Array.from({ length: n }, () => Math.floor(Math.random() * sides) + 1);
  const mode = getRollMode();
  if (mode === 'auto') return auto();

  // Manual or unset: prompt for input
  const choice = window.prompt(
    `${label || 'Roll'}:\n\nRoll ${n}d${sides} with your dice.\nEnter ${n} value${n > 1 ? 's' : ''} (1–${sides}, comma-separated):`,
    ''
  );
  if (!choice) return auto();
  const parts = choice
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((x) => Number.isFinite(x) && x >= 1 && x <= sides);
  if (parts.length === n) return parts;
  return auto();
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
