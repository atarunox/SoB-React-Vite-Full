// src/utils/promptHelpers.js
export const joinLines = (...parts) => parts.filter(Boolean).join('\n');

export function buildNumberedPrompt(title, options) {
  const lines = Array.isArray(options)
    ? options.map((o, i) => `${i + 1}. ${o?.label ?? o}`)
    : [];
  return `${title}\n\n${lines.join('\n')}\n\nEnter a number:`;
}

export const ui = {
  promptSelect: ({ title = 'Choose one', options = [], defaultIndex = 0 }) => {
    if (!Array.isArray(options) || options.length === 0) return null;
    if (options.length === 1) {
      try { window.alert(`${title}\n\n${options[0]?.label ?? options[0]}`); } catch {}
      return options[0];
    }
    const raw = window.prompt(
      buildNumberedPrompt(title, options),
      String((defaultIndex ?? 0) + 1)
    );
    const idx = Number.parseInt(raw, 10) - 1;
    if (!Number.isFinite(idx) || idx < 0 || idx >= options.length) return null;
    return options[idx];
  },
  promptNumber: ({
    title = 'Enter a number',
    message = '',
    min = 0,
    max = 999,
    defaultValue = 0,
  }) => {
    const raw = window.prompt(
      joinLines(title, message),
      String(defaultValue)
    );
    const v = Math.floor(Number(raw));
    return Number.isFinite(v) ? Math.max(min, Math.min(max, v)) : defaultValue;
  },
};
