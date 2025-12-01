// src/utils/conditionEffects.js
// Map condition names to concrete stat modifiers.
// Add more entries over time.
export const CONDITION_EFFECTS = {
  // --- Injury examples (fill out as you like) ---
  "Broken Leg":            { Move: -1 },
  "Abdominal Trauma":      { Defense: -1 },
  "Concussion":            { Initiative: -1 },
  "Crushed Foot":          { Escape: -1 },          // only if you display Escape
  "Sprained Wrist":        { "Ranged To-Hit": -1 },
  "Dislocated Shoulder":   { "Melee To-Hit": -1 },
  "Puncture Wound":        { Combat: -1 },
  "Scarring":              { Grit: +1 },
  // Add Madness / Mutation names here too…
};

// Very light fallback to infer simple modifiers from the text
export function inferEffectsFromText(name = "", effectText = "") {
  const eff = {};
  const t = String(effectText).toLowerCase();

  if (/move\b/.test(t) && /-1/.test(t)) eff.Move = (eff.Move ?? 0) - 1;
  if (/defense\b/.test(t) && /-1/.test(t)) eff.Defense = (eff.Defense ?? 0) - 1;
  if (/initiative\b/.test(t) && /-1/.test(t)) eff.Initiative = (eff.Initiative ?? 0) - 1;
  if (/melee/.test(t) && /to[-\s]?hit/.test(t) && /-1/.test(t))
    eff["Melee To-Hit"] = (eff["Melee To-Hit"] ?? 0) - 1;
  if (/ranged/.test(t) && /to[-\s]?hit/.test(t) && /-1/.test(t))
    eff["Ranged To-Hit"] = (eff["Ranged To-Hit"] ?? 0) - 1;
  if (/combat\b/.test(t) && /-1/.test(t)) eff.Combat = (eff.Combat ?? 0) - 1;
  if (/grit\b/.test(t) && /\+1/.test(t)) eff.Grit = (eff.Grit ?? 0) + 1;

  return Object.keys(eff).length ? eff : null;
}
