// src/utils/conditionRules.js
//
// Aggregates extra, non-numeric rules from Conditions (Injury / Madness / Mutation)
// so GearTab/other UI can enforce slot forbids, hands lost, crit bans, etc.
//
// Conventions used by condition entries (see Injury/Mutation chart files):
//   - entry.effects : numeric deltas (handled elsewhere by calculateStats)
//   - entry.rules   : {
//        forbidSlots?: string[]                  // e.g., ['Hat','Coat','Boots','Gloves']
//        handsAvailableDelta?: number            // +/- hands available (base 2)
//        shotsDeltaRanged?: number               // +/- shots for Ranged (Severed Finger)
//        noCrit?: { melee?: boolean, ranged?: boolean, all?: boolean }
//        carryCapacityDelta?: number             // +/- capacity directly (used by GearTab)
//        maxWeightDelta?: number                 // alias for carryCapacityDelta
//        corruptionCapacityDelta?: number        // fewer CP before mutation, etc.
//        critDamageDelta?: number                // +1/-1 damage on Critical Hits
//        gainArmor4Plus?: boolean                // you have Armor 4+ baseline
//        noGuns?: boolean                        // cannot use Gun items (period)
//        noGunsUnlessArtifact?: boolean          // cannot use Gun unless item.isArtifact === true
//        dsAllergy?: boolean                     // Dark Stone allergy (take hits per DS carried)
//        extraHandPerTurn?: boolean              // narrative helper; we treat as +1 hand
//     }
//
// We also aggregate a simple `gritCap` rule sourced directly on the condition:
//    { gritCap: 1, duration: 'nextAdventure', active: true }
//
// NOTE: Numeric effects are applied in calculateStats; this file is for rules/flags.

const LOWER = (s = '') => String(s).toLowerCase().trim();

// Helper: add unique strings to a Set
function addAll(set, arr = []) {
  if (!Array.isArray(arr)) return;
  for (const v of arr) if (v) set.add(String(v));
}

export function getConditionRules(hero = {}) {
  const out = {
    forbidSlots: new Set(),        // Set<string>
    handsAvailableDelta: 0,        // +/- hands
    shotsDeltaRanged: 0,           // +/- Shots with Ranged Weapons
    noCrit: { melee: false, ranged: false, all: false },
    carryCapacityDelta: 0,         // applied in GearTab.carryCapacity()
    corruptionCapacityDelta: 0,    // informational (surface in UI if desired)
    critDamageDelta: 0,            // modifies crit damage globally (UI hint)
    gainArmor4Plus: false,         // informational flag
    noGuns: false,                 // block all non-artifact Guns
    noGunsUnlessArtifact: false,   // block non-artifact Guns (artifact guns allowed)
    dsAllergy: false,              // take hits per DS carried at start of activation
    gritCap: undefined,            // optional cap on Max Grit (min across active conditions)
  };

  // Merge conditions from common locations
  const list = []
    .concat(Array.isArray(hero.conditions) ? hero.conditions : [])
    .concat(Array.isArray(hero?.status?.conditions) ? hero.status.conditions : []);

  for (const c of list) {
    if (!c || c.active === false) continue;

    // ---- Grit Cap aggregation (new) ---------------------------------------
    // If multiple conditions specify gritCap, take the *lowest* (most restrictive).
    if (c.gritCap != null) {
      const cap = Number(c.gritCap);
      if (Number.isFinite(cap)) {
        out.gritCap = Math.min(out.gritCap ?? Infinity, cap);
      }
    }

    // ----------------------------------------------------------------------
    // Structured rules
    const rules = c?.rules && typeof c.rules === 'object' ? c.rules : {};

    if (rules.forbidSlots) addAll(out.forbidSlots, rules.forbidSlots);
    if (Number.isFinite(rules.handsAvailableDelta)) out.handsAvailableDelta += rules.handsAvailableDelta;
    if (Number.isFinite(rules.shotsDeltaRanged)) out.shotsDeltaRanged += rules.shotsDeltaRanged;

    if (rules.noCrit && typeof rules.noCrit === 'object') {
      out.noCrit.melee  = out.noCrit.melee  || !!rules.noCrit.melee;
      out.noCrit.ranged = out.noCrit.ranged || !!rules.noCrit.ranged;
      out.noCrit.all    = out.noCrit.all    || !!rules.noCrit.all;
    }

    // Carry weight aliases
    if (Number.isFinite(rules.carryCapacityDelta)) out.carryCapacityDelta += rules.carryCapacityDelta;
    if (Number.isFinite(rules.maxWeightDelta))     out.carryCapacityDelta += rules.maxWeightDelta;

    if (Number.isFinite(rules.corruptionCapacityDelta)) out.corruptionCapacityDelta += rules.corruptionCapacityDelta;
    if (Number.isFinite(rules.critDamageDelta))        out.critDamageDelta += rules.critDamageDelta;

    out.gainArmor4Plus       = out.gainArmor4Plus       || !!rules.gainArmor4Plus;
    out.noGuns               = out.noGuns               || !!rules.noGuns;
    out.noGunsUnlessArtifact = out.noGunsUnlessArtifact || !!rules.noGunsUnlessArtifact;
    out.dsAllergy            = out.dsAllergy            || !!rules.dsAllergy;

    // If a condition says "extraHandPerTurn", treat it as +1 available hand
    if (rules.extraHandPerTurn === true && !Number.isFinite(rules.handsAvailableDelta)) {
      out.handsAvailableDelta += 1;
    }

    // ----------------------------------------------------------------------
    // Legacy name-based fallbacks (for older entries without .rules)
    const name = String(c?.name || '').trim();
    const n = LOWER(name);

    // --- Injuries (examples kept for backwards compat) ---
    if (n.includes('mangled hand'))       out.handsAvailableDelta -= 1;             // one less free hand
    if (n.includes('severed finger'))     out.shotsDeltaRanged    -= 1;             // -1 Shot with Ranged
    if (n.includes('broken arm'))         out.noCrit.melee         = true;          // no melee crits
    if (n.includes('gouged eye'))         out.noCrit.ranged        = true;          // no ranged crits
    if (n.includes('swollen eye'))        out.noCrit.ranged        = out.noCrit.ranged || false; // usually modeled elsewhere
    if (n.includes('scalped'))            addAll(out.forbidSlots, ['Head', 'Hat']); // cannot wear Head gear
    if (n.includes('twisted spine'))      out.carryCapacityDelta  += 2;             // +2 carrying capacity

    // --- Mutations (fallbacks matching the official chart) ---
    if (n === 'horns')                    addAll(out.forbidSlots, ['Hat']);
    if (n === 'arm growth')               addAll(out.forbidSlots, ['Coat']);
    if (n === 'leg growth')               addAll(out.forbidSlots, ['Boots', 'Feet']);
    if (n === 'hand growth')              addAll(out.forbidSlots, ['Gloves']);
    if (n === 'tentacle arm') { out.handsAvailableDelta -= 1; out.noCrit.ranged = true; }
    if (n === 'prehensile tail')          out.handsAvailableDelta += 1;
    if (n === 'barbed tail')              out.corruptionCapacityDelta -= 1;
    if (n === 'tentacle tail')            out.corruptionCapacityDelta -= 1;
    if (n === 'eye grown over')           out.critDamageDelta -= 1;
    if (n === 'eye stalks')              { out.critDamageDelta += 1; out.corruptionCapacityDelta -= 1; }
    if (n === 'fused fingers')            out.noGunsUnlessArtifact = true;
    if (n === 'fused with rock')          out.gainArmor4Plus = true;
    if (n === 'dark stone allergy')       out.dsAllergy = true;
  }

  return out;
}

/**
 * Helper: determine if a Gun item is usable under current rules.
 * Returns true if:
 *   - no blanket gun restriction applies, OR
 *   - restriction allows Artifact guns and the item is marked artifact.
 */
export function canUseGunItem(item = {}, rules = {}) {
  const isGun = String(item?.slot || '').toLowerCase() === 'gun';
  if (!isGun) return true;

  // Artifact flag: allow both `isArtifact` or `artifact === true`
  const isArtifact = !!(item.isArtifact || item.artifact);

  if (rules.noGuns) {
    // Full ban on all guns
    return false;
  }
  if (rules.noGunsUnlessArtifact) {
    // Allowed only if explicitly artifact
    return isArtifact === true;
  }
  return true;
}

export default getConditionRules;
