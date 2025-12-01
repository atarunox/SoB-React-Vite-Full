const STORAGE_KEY = 'activeModifiers';
const initialModifiers = {
  keywords: [],
  enemyModifiers: {},
  partyModifiers: {}
};

let activeModifiers = loadModifiersFromStorage() || JSON.parse(JSON.stringify(initialModifiers));

// Apply a standard game effect card (e.g., Growing Dread with grit disable or keyword tagging)
export function applyCardModifiers(card) {
  const mods = card.modifiers;
  if (!mods) return;

  if (mods.addKeywordToNextEnemy) {
    activeModifiers.keywords.push(mods.addKeywordToNextEnemy);
  }

  if (mods.enemyModifiers) {
    const key = mods.enemyModifiers.keyword;
    activeModifiers.enemyModifiers[key] = {
      ...activeModifiers.enemyModifiers[key],
      ...mods.enemyModifiers
    };
    delete activeModifiers.enemyModifiers[key].keyword;
  }

  if (mods.conditionalEnemyModifiers) {
    activeModifiers.enemyModifiers["conditional"] = mods.conditionalEnemyModifiers;
  }

  if (mods.gritDisabledFirstTurn) {
    activeModifiers.partyModifiers.gritDisabled = true;
  }

  if (mods.extraEliteAbility) {
    activeModifiers.partyModifiers.extraEliteAbility = true;
  }

  if (mods.injuryRollOverride) {
    activeModifiers.partyModifiers.injuryRollOverride = mods.injuryRollOverride;
  }

  if (mods.sanityLossIsPermanent) {
    activeModifiers.partyModifiers.permaSanityLoss = true;
  }

  saveModifiersToStorage();
}

export function getActiveModifiers() {
  return activeModifiers;
}

export function clearModifiers() {
  activeModifiers = JSON.parse(JSON.stringify(initialModifiers));
  saveModifiersToStorage();
}

export function removeKeyword(keyword) {
  activeModifiers.keywords = activeModifiers.keywords.filter(k => k !== keyword);
  saveModifiersToStorage();
}

function saveModifiersToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activeModifiers));
}

function loadModifiersFromStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  try {
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.warn('Failed to parse saved modifiers:', e);
    return null;
  }
}

export default function Placeholder() {
  return null;
}
