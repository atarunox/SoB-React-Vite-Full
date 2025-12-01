// src/utils/conditionMods.js
// Convert hero.conditions[] into additive/stat-threshold mods like gear/skills.
// Keep it tiny now; expand as you add more effects.

const T = (s) =>
  String(s || "")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, a => a.toUpperCase());

// "4+" => {type:'threshold', key:'Melee To-Hit', delta:+1} means worse to-hit by 1
const worsen = (key, amount = 1) => ({ kind: "threshold", key: T(key), delta: amount });
// numeric add: { kind:'add', key:'Move', delta:-1 }
const add = (key, delta) => ({ kind: "add", key: T(key), delta });

export function conditionMods(conditions = []) {
  const out = [];
  for (const c of conditions) {
    const type = String(c?.type || "").toLowerCase();
    const name = String(c?.name || c?.result || "").toLowerCase();

    if (type === "injury") {
      if (name.includes("broken leg")) out.push(add("Move", -1));
      else if (name.includes("abdominal trauma")) out.push(add("Defense", -1));
      else if (name.includes("chest wound")) out.push(add("Initiative", -1));
      else if (name.includes("puncture wound")) out.push(add("Combat", -1));
      else if (name.includes("dislocated shoulder")) out.push(worsen("Melee To-Hit", 1));
      else if (name.includes("sprained wrist")) out.push(worsen("Ranged To-Hit", 1));
      // everything else is mostly notes/situational — keep out of numeric pipeline
    }

    // if (type === "madness") { ... }
    // if (type === "mutation") { ... }
  }
  return out;
}
