// src/data/townLocations/churchBlessedAuras.js
// Blessed Auras purchased at the Church (each requires a Spirit 4+ test)

const churchBlessedAuras = [
  {
    id: 'church_aura_endurance',
    name: 'Aura of Endurance (Spirit 4+ Test to Obtain)',
    category: 'Service',
    tags: ['Blessed Aura', 'Shield'],
    cost: 200,
    effect: 'Armor 5+ (next Adventure).',
    test: 'Spirit 4+',
    rules: {
      test: { stat: 'Spirit', target: 4, die: 'D6' },
      duration: 'Next Adventure',
      armorSave: '5+',
      isShieldType: true,
      purchaseLimitPerVisit: 1,
    },
  },
  {
    id: 'church_aura_wrath',
    name: 'Aura of Wrath (Spirit 4+ Test to Obtain)',
    category: 'Service',
    tags: ['Blessed Aura'],
    cost: 100,
    effect: '+D6 Damage to one Hit (next Adventure).',
    test: 'Spirit 4+',
    rules: {
      test: { stat: 'Spirit', target: 4, die: 'D6' },
      duration: 'Next Adventure',
      bonusDamageOnce: { die: 'D6', to: 'one Hit' },
      purchaseLimitPerVisit: 1,
    },
  },
  {
    id: 'church_aura_fortitude',
    name: 'Aura of Fortitude (Spirit 4+ Test to Obtain)',
    category: 'Service',
    tags: ['Blessed Aura', 'Shield'],
    cost: 150,
    effect: 'Spirit Armor 5+ (next Adventure).',
    test: 'Spirit 4+',
    rules: {
      test: { stat: 'Spirit', target: 4, die: 'D6' },
      duration: 'Next Adventure',
      spiritArmorSave: '5+',
      isShieldType: true,
      purchaseLimitPerVisit: 1,
    },
  },
  {
    id: 'church_aura_protection',
    name: 'Aura of Protection (Spirit 4+ Test to Obtain)',
    category: 'Service',
    tags: ['Blessed Aura', 'Shield'],
    cost: 250,
    effect: 'Armor 6+ / Spirit Armor 6+ (next Adventure).',
    test: 'Spirit 4+',
    rules: {
      test: { stat: 'Spirit', target: 4, die: 'D6' },
      duration: 'Next Adventure',
      armorSave: '6+',
      spiritArmorSave: '6+',
      isShieldType: true,
      purchaseLimitPerVisit: 1,
    },
  },
];

export default churchBlessedAuras;

/**
 * Redeem the Church "Gift of Blessing" voucher from the hero's inventory.
 * Requirements:
 * - Voucher item must have tags: ['Blessed Aura','Voucher']
 * - ctx should provide: updateHero(id, patchOrFn), promptChoice, doSkillCheck, toast
 *
 * @param {object} ctx
 * @param {string|number} heroId
 * @param {object} opts  { requireTest?: boolean } (default true)
 */
export async function redeemGiftOfBlessing(ctx = {}, heroId, opts = {}) {
  const requireTest = opts.requireTest !== false;
  const toast = (m) => ctx.toast?.(m);
  const promptChoice = ctx.promptChoice || ctx.uiApi?.promptChoice;

  if (!heroId) return;

  // Snapshot hero (works with either getHero or a no-op updateHero read)
  let hero = null;
  if (typeof ctx.getHero === 'function') {
    try { hero = ctx.getHero(heroId); } catch {}
  }
  if (!hero && typeof ctx.updateHero === 'function') {
    ctx.updateHero(heroId, (h) => { hero = h || null; return h; });
  }
  if (!hero) {
    toast?.('Could not read hero to redeem the voucher.');
    return;
  }

  const inv = Array.isArray(hero.inventory) ? hero.inventory : [];
  const voucher = inv.find(
    (it) => Array.isArray(it?.tags) && it.tags.includes('Blessed Aura') && it.tags.includes('Voucher')
  );
  if (!voucher) {
    toast?.('No Gift of Blessing voucher found.');
    return;
  }

  // Choose an aura
  const options = churchBlessedAuras.map((a) => a.name);
  const pick = typeof promptChoice === 'function'
    ? await Promise.resolve(promptChoice('Redeem Gift of Blessing — choose an Aura', options))
    : 0;
  const sel = churchBlessedAuras[Math.max(0, Math.min(churchBlessedAuras.length - 1, (pick | 0)))];
  if (!sel) return;

  // Optional Spirit 4+ test
  if (requireTest && typeof ctx.doSkillCheck === 'function') {
    const spec = sel.rules?.test || { stat: 'Spirit', target: 4 };
    const ok = await ctx.doSkillCheck(heroId, spec);
    if (!ok) {
      toast?.('The blessing fails (Spirit test). The voucher remains.');
      return;
    }
  }

  // Consume voucher and grant the aura as a one-use item for next Adventure
  ctx.updateHero?.(heroId, (h) => {
    const curInv = Array.isArray(h.inventory) ? [...h.inventory] : [];
    const idx = curInv.findIndex((x) => x && x.id === voucher.id);
    if (idx >= 0) curInv.splice(idx, 1);
    curInv.push({
      id: sel.id,
      name: sel.name.replace(/\s*\(.*\)$/,''),
      type: 'Aura',
      tags: Array.isArray(sel.tags) ? sel.tags : ['Blessed Aura'],
      description: sel.effect,
      rules: sel.rules,
      oneUse: true,
      scope: 'nextAdventure',
    });
    return { ...h, inventory: curInv };
  });

  toast?.(`Gift of Blessing redeemed: ${sel.name}`);
  try {
    window.dispatchEvent(new CustomEvent('aura:redeemed', { detail: { heroId, aura: sel } }));
    window.dispatchEvent(new CustomEvent('inventory:received', { detail: { heroId, item: sel } }));
  } catch {}
}
