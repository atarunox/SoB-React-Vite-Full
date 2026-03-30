// src/utils/locationHandlers/worldCardDraw.js
// Shared utility for drawing a World Card and an Artifact from that World,
// then optionally offering it for sale to the hero.

import { WORLD_CARDS } from '../../data/worldCards';
import { mineArtifacts } from '../../data/items/mineArtifacts';
import { otherWorldArtifacts } from '../../data/items/otherWorldArtifacts.js';

// Build a map of world name -> artifact pool
function buildWorldArtifactMap() {
  const map = {};
  if (Array.isArray(mineArtifacts) && mineArtifacts.length > 0) {
    map['Mines'] = mineArtifacts;
  }
  if (Array.isArray(otherWorldArtifacts)) {
    for (const art of otherWorldArtifacts) {
      const w = art?.world || 'Unknown';
      if (!map[w]) map[w] = [];
      map[w].push(art);
    }
  }
  return map;
}

// Draw a random world card and a random artifact from that world.
// Returns { worldCard, worldName, artifact } or { worldCard, worldName, artifact: null } if no artifacts in pool.
export function drawWorldCardAndArtifact() {
  const worldArtifactMap = buildWorldArtifactMap();

  const availableWorlds = Array.isArray(WORLD_CARDS) && WORLD_CARDS.length > 0
    ? WORLD_CARDS
    : Object.keys(worldArtifactMap).map(w => ({ name: w }));

  if (!availableWorlds.length) {
    return { worldCard: null, worldName: null, artifact: null };
  }

  const worldCard = availableWorlds[Math.floor(Math.random() * availableWorlds.length)];
  const worldName = worldCard.name || 'Unknown World';

  let pool = worldArtifactMap[worldName] || [];
  if (!pool.length) {
    const looseKey = Object.keys(worldArtifactMap).find(
      k => k.toLowerCase().includes(worldName.toLowerCase()) ||
           worldName.toLowerCase().includes(k.toLowerCase())
    );
    if (looseKey) pool = worldArtifactMap[looseKey];
  }

  const artifact = pool.length
    ? pool[Math.floor(Math.random() * pool.length)]
    : null;

  return { worldCard, worldName, artifact };
}

// Draw a random artifact from a specific world tag (e.g. 'Derelict Ship', 'Blasted Wastes').
export function drawArtifactFromWorld(worldTag) {
  const worldArtifactMap = buildWorldArtifactMap();
  let pool = worldArtifactMap[worldTag] || [];
  if (!pool.length) {
    const looseKey = Object.keys(worldArtifactMap).find(
      k => k.toLowerCase().includes(worldTag.toLowerCase()) ||
           worldTag.toLowerCase().includes(k.toLowerCase())
    );
    if (looseKey) pool = worldArtifactMap[looseKey];
  }
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Format artifact details into readable lines for display.
function formatArtifactDetails(artifact) {
  const lines = [];
  lines.push(`Artifact: ${artifact.name}`);
  if (artifact.type) lines.push(`Type: ${artifact.type}`);
  if (artifact.slot) lines.push(`Slot: ${artifact.slot}`);

  const effects = artifact.effects
    ? (Array.isArray(artifact.effects) ? artifact.effects.join('; ') : JSON.stringify(artifact.effects))
    : '';
  if (effects) lines.push(`Effects: ${effects}`);

  const rules = Array.isArray(artifact.rules) ? artifact.rules.join(' ') : '';
  if (rules) lines.push(`Rules: ${rules}`);

  if (artifact.range) lines.push(`Range: ${artifact.range}`);
  if (artifact.shots) lines.push(`Shots: ${artifact.shots}`);

  return lines;
}

// Offer a drawn artifact for sale to the hero.
// price: the gold cost. acquiredFrom: string describing where it came from.
// Returns { purchased: boolean, log: string[] }
export async function offerArtifactForSale(ctx, artifact, { price, acquiredFrom, title, worldName, patchShopMods, shopModKey }) {
  const log = [];
  const id = ctx.getActiveHeroId?.();
  if (!id || !artifact) return { purchased: false, log };

  const hero = (ctx.getHeroById ?? ctx.getHero)?.(id) ?? null;
  const heroName = hero?.name || 'Hero';

  const detailLines = formatArtifactDetails(artifact);
  const priceLabel = `$${price}`;

  const buyChoice = await ctx.promptChoice?.(
    `${title}\n\nWorld Card: ${worldName}\n${detailLines.join('\n')}\nPrice: ${priceLabel}\n\nPurchase ${artifact.name}?`,
    [
      { label: `Buy ${artifact.name} for ${priceLabel}` },
      { label: 'Pass' },
    ]
  );

  if (buyChoice === 0) {
    const heroGold = Number(((ctx.getHeroById ?? ctx.getHero)?.(id))?.gold ?? 0);
    if (heroGold < price) {
      const noGold = `${heroName} doesn't have enough gold! Need $${price}, have $${heroGold}.`;
      log.push(noGold);
      await showResult(ctx, `${title} — Result`, [noGold]);
    } else {
      ctx.updateHero?.(id, h => {
        const items = Array.isArray(h.items) ? [...h.items] : [];
        items.push({
          ...artifact,
          id: artifact.id || `artifact_${Date.now()}`,
          type: artifact.type || 'Artifact',
          acquiredFrom: acquiredFrom || 'World Card Draw',
          pricePaid: price,
        });
        return { ...h, gold: Math.max(0, (h.gold || 0) - price), items };
      });
      const bought = `${heroName} purchases ${artifact.name} for $${price}!`;
      log.push(bought);
      await showResult(ctx, `${title} — Result`, [bought]);
      ctx.toast?.(`Bought ${artifact.name} for $${price}!`);
      return { purchased: true, log };
    }
  } else {
    log.push(`Passed on ${artifact.name}.`);
    // Store in shopMods so it can still be purchased later if applicable
    if (typeof patchShopMods === 'function') {
      const modKey = shopModKey || 'artifactForSale';
      patchShopMods({
        [modKey]: true,
        [`${modKey}Price`]: price,
        [`${modKey}Card`]: {
          ...artifact,
          id: artifact.id || `artifact_${Date.now()}`,
          type: artifact.type || 'Artifact',
          world: worldName,
        },
      });
    }
    await showResult(ctx, `${title} — Result`, [`${artifact.name} is available in the shop for $${price}.`]);
    ctx.toast?.(`${artifact.name} available for $${price}.`);
  }

  return { purchased: false, log };
}

async function showResult(ctx, title, lines) {
  const body = Array.isArray(lines) ? lines.join('\n') : lines;
  await ctx.promptChoice?.(`${title}\n\n${body}`, [{ label: 'Continue' }]);
}
