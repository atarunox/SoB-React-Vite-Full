// Utility to build a full stat breakdown for EnemyGroupCard breakdown modal

export function getStatBreakdown(group, globalModifiers = [], statName = "", manualOverrides = {}) {
  if (manualOverrides && manualOverrides.hasOwnProperty(statName)) {
    return {
      value: manualOverrides[statName],
      breakdown: {
        base: group.baseStats?.[statName],
        steps: [
          {
            type: "override",
            name: "Manual Override",
            value: manualOverrides[statName],
            source: "DM",
            effect: "This value overrides all calculations."
          }
        ],
        final: manualOverrides[statName]
      }
    };
  }

  let base = group.baseStats?.[statName];
  let curValue = base;
  let steps = [];

  for (const mod of globalModifiers) {
    if (mod.effect && Object.prototype.hasOwnProperty.call(mod.effect, statName)) {
      let modVal = mod.effect[statName];
      if (typeof curValue === "number" && typeof modVal === "number") {
        curValue += modVal;
      } else if (typeof curValue === "string" && typeof modVal === "string") {
        curValue = modVal;
      } else if (modVal !== undefined) {
        curValue = modVal;
      }
      steps.push({
        type: "global",
        name: mod.name || "",
        value: curValue,
        source: mod.description || "",
        effect: `+${modVal} (${mod.type})`
      });
    }
  }

  for (const mod of group.modifiers || []) {
    if (mod.effect && Object.prototype.hasOwnProperty.call(mod.effect, statName)) {
      let modVal = mod.effect[statName];
      if (typeof curValue === "number" && typeof modVal === "number") {
        curValue += modVal;
      } else if (typeof curValue === "string" && typeof modVal === "string") {
        curValue = modVal;
      } else if (modVal !== undefined) {
        curValue = modVal;
      }
      steps.push({
        type: "local",
        name: mod.name || "",
        value: curValue,
        source: mod.description || "",
        effect: `+${modVal} (${mod.type})`
      });
    }
  }

  return {
    value: curValue,
    breakdown: {
      base,
      steps,
      final: curValue
    }
  };
}

export function getAllStatsWithBreakdown(group, globalModifiers = [], manualOverrides = {}) {
  const allStats = Object.keys(group.baseStats || {});
  const result = {};
  for (let stat of allStats) {
    result[stat] = getStatBreakdown(group, globalModifiers, stat, manualOverrides);
  }
  let addedKeywords = new Set(group.baseStats?.keywords || []);
  for (const mod of globalModifiers) {
    if (mod.addKeywords) mod.addKeywords.forEach(k => addedKeywords.add(k));
  }
  for (const mod of group.modifiers || []) {
    if (mod.addKeywords) mod.addKeywords.forEach(k => addedKeywords.add(k));
  }
  result.keywords = Array.from(addedKeywords);
  return result;
}
