// src/utils/promptApi.js
//
// Centralized prompt + dice logic for *ALL* Town services, handlers,
// Gambling Hall games, Rituals, Outlaw actions, injections, etc.
//
// Pure | No React | No UI Components
// UI layers (TownTab, DMTab, HeroScreen) plug into this.

import { rollD6, rollND } from './diceHelpers';
import { safeNumber } from './statReaders';

////////////////////////////////////////////////////////////////////////////////
// Yes/No Prompt
////////////////////////////////////////////////////////////////////////////////

export async function promptYesNo(message = "Continue?", defaultValue = false, ui = {}) {
  if (ui?.preferAutoRoll) {
    return defaultValue; // auto mode uses defaults
  }

  if (ui?.confirm) {
    try {
      return await ui.confirm(message, defaultValue);
    } catch {}
  }

  const raw = window.prompt(`${message}\n(yes/no)`, defaultValue ? 'yes' : 'no');
  if (raw == null) return defaultValue;

  return /^y(es)?$/i.test(raw.trim());
}

////////////////////////////////////////////////////////////////////////////////
// Number Prompt
////////////////////////////////////////////////////////////////////////////////

export async function promptNumber(message = "Enter number:", def = "", ui = {}) {
  if (ui?.preferAutoRoll) {
    return safeNumber(def, 0);
  }

  if (ui?.inputNumber) {
    try {
      return await ui.inputNumber(message, def);
    } catch {}
  }

  const raw = window.prompt(message, def);
  return safeNumber(raw, 0);
}

////////////////////////////////////////////////////////////////////////////////
// Dice Prompt (manual or auto)
////////////////////////////////////////////////////////////////////////////////

export async function promptDice(count = 1, sides = 6, ui = {}) {
  if (ui?.preferAutoRoll) {
    return rollND(count, sides);
  }

  if (ui?.inputDice) {
    try {
      const r = await ui.inputDice(count, sides);
      if (Array.isArray(r) && r.length === count) return r;
    } catch {}
  }

  // fallback manual entry
  const raw = window.prompt(
    `Enter ${count} dice results (comma-separated, ${sides}-sided).`,
    ""
  );

  if (!raw) return rollND(count, sides);

  const parts = raw.split(",").map((s) => safeNumber(s.trim(), null));
  if (parts.some((n) => n == null || n < 1 || n > sides)) {
    return rollND(count, sides);
  }

  return parts;
}

////////////////////////////////////////////////////////////////////////////////
// Skill Test
////////////////////////////////////////////////////////////////////////////////

export async function doSkillCheck(
  heroId,
  { stat, target = 5, prompt = true },
  ctx = {},
  ui = {}
) {
  // Try PosseContext API first
  if (ctx?.doSkillCheck) {
    try {
      const r = await ctx.doSkillCheck(heroId, { stat, target, prompt });
      if (typeof r === "boolean") return r;
    } catch {}
  }

  // Get stat directly if available
  const value =
    ctx?.getEffectiveStat?.(heroId, stat) ??
    ctx?.getStat?.(heroId, stat) ??
    ctx?.posseApi?.getStat?.(heroId, stat) ??
    null;

  const dice = value != null ? Math.max(1, value) : 1;

  if (ui?.preferAutoRoll || !prompt) {
    const rolls = rollND(dice, 6);
    return rolls.some((r) => r >= target);
  }

  // Prompt-based manual entry
  const rolls = await promptDice(dice, 6, ui);
  return rolls.some((r) => r >= target);
}

////////////////////////////////////////////////////////////////////////////////
// Damage Application Helper
////////////////////////////////////////////////////////////////////////////////

export async function applyHits(heroId, dmg, ctx = {}, ui = {}) {
  if (ctx?.applyHits) {
    return await ctx.applyHits(heroId, dmg);
  }

  if (ctx?.posseApi?.applyDamage) {
    return ctx.posseApi.applyDamage(heroId, { amount: dmg });
  }

  // Last resort direct update
  ctx.updateHero?.(heroId, (h) => ({
    ...h,
    wounds: (h.wounds || 0) + dmg,
  }));

  ui.toast?.(`Took ${dmg} Hits.`);
}

////////////////////////////////////////////////////////////////////////////////
// API Builder
////////////////////////////////////////////////////////////////////////////////

export function makePromptApi(ui = {}, ctx = {}) {
  return {
    promptYesNo: (msg, d) => promptYesNo(msg, d, ui),
    promptNumber: (msg, d) => promptNumber(msg, d, ui),
    promptDice: (n, s) => promptDice(n, s, ui),
    doSkillCheck: (heroId, args) => doSkillCheck(heroId, args, ctx, ui),
    applyHits: (heroId, dmg) => applyHits(heroId, dmg, ctx, ui),

    // convenience
    rollD6: () => rollD6(),
    rollND: (n, s) => rollND(n, s),

    // ui passthrough
    toast: ui.toast,
    preferAutoRoll: ui.preferAutoRoll === true,
  };
}

export default {
  promptYesNo,
  promptNumber,
  promptDice,
  doSkillCheck,
  applyHits,
  makePromptApi,
};
