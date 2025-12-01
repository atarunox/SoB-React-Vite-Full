// Frontier Outpost: Training & Bounty service executors
const D6 = () => Math.floor(Math.random() * 6) + 1;

function addTownFlag(townStateApi, flag, value = true) {
  const state = townStateApi?.get?.() || {};
  const flags = { ...(state.flags || {}) };
  flags[flag] = value;
  townStateApi?.set?.({ ...state, flags });
}
function getTownFlag(townStateApi, flag) {
  const state = townStateApi?.get?.() || {};
  return !!(state.flags && state.flags[flag]);
}

const isFOClosed = (townStateApi) => !!(townStateApi?.get?.()?.flags?.fo_closed);
const isTrainingDisabled = (townStateApi) => !!(townStateApi?.get?.()?.flags?.fo_training_disabled);
const isHeroEjected = (townStateApi, heroId) => !!(townStateApi?.get?.()?.ejectedHeroes?.[heroId]);

export async function performTrainWithSoldiers({ hero, posseApi, townStateApi, io, forcedRolls = {} }) {
  const log = [];
  const actions = [];

  const heroId = hero?.id || hero?.localId;
  if (!heroId) {
    log.push(`[FO Training] No hero id.`);
    return { log, actions };
  }
  if (isFOClosed(townStateApi)) { io?.toast?.(`Frontier Outpost is closed this stay.`); return { log, actions }; }
  if (isTrainingDisabled(townStateApi)) { io?.toast?.(`Training with Soldiers is disabled this stay.`); return { log, actions }; }
  if (isHeroEjected(townStateApi, heroId)) { io?.toast?.(`You already left town for this stay.`); return { log, actions }; }

  const onceFlag = `fo_train_soldiers_${heroId}`;
  if (getTownFlag(townStateApi, onceFlag)) { io?.toast?.(`You already trained this stay.`); return { log, actions }; }

  const gold = Number(hero?.gold ?? hero?.Gold ?? 0);
  if (gold < 500) { io?.toast?.(`Need $500 to train.`); return { log, actions }; }

  const die = Number.isFinite(forcedRolls.train) ? forcedRolls.train : D6();
  const xpGain = die * 25;

  addTownFlag(townStateApi, onceFlag, true);
  log.push(`[FO Training] Paid $500. Rolled ${die} → +${xpGain} XP.`);

  if (posseApi?.updateHero) {
    actions.push(posseApi.updateHero(heroId, (h) => {
      const newGold = Math.max(0, Number(h.gold ?? 0) - 500);
      const newXP = Number(h.xp ?? h.XP ?? 0) + xpGain;
      return { ...h, gold: newGold, xp: newXP };
    }));
  } else {
    actions.push({ type: 'HERO_UPDATE', heroId, patch: { $inc: { xp: xpGain, gold: -500 } } });
  }

  io?.toast?.(`Training complete: +${xpGain} XP.`);
  return { log, actions };
}

export async function performBountyBoard({ townStateApi, io, forcedRolls = {} }) {
  const log = [];
  const actions = [];

  if (isFOClosed(townStateApi)) { io?.toast?.(`Frontier Outpost is closed this stay.`); return { log, actions }; }

  const globalFlag = `fo_bounty_board_selected`;
  if (getTownFlag(townStateApi, globalFlag)) { io?.toast?.(`Bounty already posted this stay.`); return { log, actions }; }

  const die = Number.isFinite(forcedRolls.bounty) ? forcedRolls.bounty : D6();

  const table = {
    1: { target: 'No Bounty', perKill: 0, toEveryHero: false, text: 'No Bounty — no current Bounty available.' },
    2: { target: 'Tentacles', perKill: 10, toEveryHero: false, text: 'Tentacles — $10 for each killed.' },
    3: { target: 'HellBats', perKill: 25, toEveryHero: false, text: 'HellBats — $25 for each killed.' },
    4: { target: 'Stranglers', perKill: 50, toEveryHero: false, text: 'Stranglers — $50 for each killed.' },
    5: { target: 'Night Terrors', perKill: 150, toEveryHero: true, text: 'Night Terrors — $150 to every Hero for each killed.' },
    6: { target: 'Slashers', perKill: 200, toEveryHero: true, text: 'Slashers — $200 to every Hero for each killed.' },
  };

  const res = table[die] || table[1];

  const state = townStateApi?.get?.() || {};
  addTownFlag(townStateApi, globalFlag, true);
  townStateApi?.set?.({
    ...state,
    outpostBounty: {
      roll: die,
      target: res.target,
      perKill: res.perKill,
      toEveryHero: res.toEveryHero,
      text: res.text,
    },
  });

  log.push(`[FO Bounty] Rolled ${die}: ${res.text}`);
  io?.toast?.(
    res.target === 'No Bounty'
      ? `No bounty this stay.`
      : `Bounty set: ${res.target} (${res.toEveryHero ? '$' + res.perKill + ' each hero per kill' : '$' + res.perKill + ' per kill'})`
  );
  return { log, actions };
}

export async function redeemOutpostBounty({ posseApi, townStateApi, io, kills = 0, killsByHero = null }) {
  const log = [];
  const actions = [];

  const state = townStateApi?.get?.() || {};
  const b = state.outpostBounty;
  if (!b || !b.perKill || b.target === 'No Bounty') {
    log.push(`[FO Bounty] No active bounty to redeem.`);
    return { log, actions };
  }

  const posse = posseApi?.getPosse?.() || [];
  const heroIds = Array.isArray(posse) ? posse.map(h => h?.id || h?.localId).filter(Boolean) : [];

  if (b.toEveryHero) {
    const payEach = (Math.max(0, Number(kills || 0)) * b.perKill) | 0;
    for (const h of posse) {
      const heroId = h?.id || h?.localId;
      if (!heroId) continue;
      actions.push(posseApi.updateHero(heroId, (hh) => ({ ...hh, gold: Number(hh.gold ?? 0) + payEach })));
    }
    io?.toast?.(`Bounty paid: $${payEach} to each hero.`);
  } else {
    if (killsByHero && typeof killsByHero === 'object') {
      for (const [hid, k] of Object.entries(killsByHero)) {
        const amt = (Math.max(0, Number(k)) * b.perKill) | 0;
        if (!hid || !heroIds.includes(hid)) continue;
        actions.push(posseApi.updateHero(hid, (hh) => ({ ...hh, gold: Number(hh.gold ?? 0) + amt })));
      }
      io?.toast?.(`Bounty distributed to heroes.`);
    } else {
      const total = (Math.max(0, Number(kills || 0)) * b.perKill) | 0;
      const firstId = heroIds[0];
      if (firstId) {
        actions.push(posseApi.updateHero(firstId, (hh) => ({ ...hh, gold: Number(hh.gold ?? 0) + total })));
      }
      io?.toast?.(`Bounty paid: $${total} to party.`);
    }
  }

  townStateApi?.set?.({ ...state, outpostBounty: null });
  return { log, actions };
}

export async function performOutpostTrainingService({ serviceId, ...ctx }) {
  if (serviceId === 'fo_train_with_soldiers') return performTrainWithSoldiers(ctx);
  if (serviceId === 'fo_bounty_board') return performBountyBoard(ctx);
  return { log: [`[FO Training] Unknown service: ${serviceId}`], actions: [] };
}
