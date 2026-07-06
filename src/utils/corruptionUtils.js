// Shared Corruption Hit resolution for location handlers (ctx-based flows).
//
// Official rule: every Corruption Hit allows a Willpower save (1 die per hit,
// success blocks that hit) unless the card text says "ignoring Willpower".
// Failed saves become Corruption Points on the canonical `currentCorruption`
// field — never write to `corruption`/`corruptionHits` (sanitizer drops them).
//
// This replaces the hand-copied 10-line save block that used to live in each
// handler (see CLAUDE.md "Willpower Save Pattern for Corruption Hits").

/** Extract the numeric target from a threshold stat like "5+" (or 5). */
export function parseThreshold(value, fallback = 5) {
  const n = Number(String(value ?? '').match(/\d+/)?.[0]);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Read a hero's Willpower target, checking both flat and stats locations. */
export function getWillpowerTarget(hero) {
  return parseThreshold(hero?.willpower ?? hero?.stats?.Willpower, 5);
}

/**
 * Resolve `hits` Corruption Hits against a hero: roll Willpower saves via
 * ctx.roll, apply unblocked hits to currentCorruption via ctx.updateHero.
 *
 * @param {object} ctx     - handler context ({ roll, updateHero, getHeroById?/getHero? })
 * @param {string} heroId  - id passed to ctx.updateHero
 * @param {number} hits    - number of incoming Corruption Hits
 * @param {object} [opts]
 * @param {object} [opts.hero]            - hero object (else looked up via ctx)
 * @param {string} [opts.heroName]        - prefix for the log line
 * @param {boolean} [opts.ignoreWillpower] - card says "ignoring Willpower": no save
 * @returns {Promise<{unblocked:number, blocked:number, rolls:number[], wpTarget:number, logLine:string}>}
 */
export async function applyCorruptionHits(ctx, heroId, hits, opts = {}) {
  const count = Math.max(0, Number(hits) || 0);
  const hero = opts.hero ?? (ctx.getHeroById ?? ctx.getHero)?.(heroId) ?? null;
  const wpTarget = getWillpowerTarget(hero);
  const prefix = opts.heroName ? `${opts.heroName}: ` : '';

  if (count === 0) {
    return { unblocked: 0, blocked: 0, rolls: [], wpTarget, logLine: `${prefix}No Corruption Hits.` };
  }

  let rolls = [];
  let blocked = 0;
  let unblocked = count;
  let logLine;

  if (opts.ignoreWillpower) {
    logLine = `${prefix}${count} Corruption Point${count !== 1 ? 's' : ''} taken, ignoring Willpower.`;
  } else {
    const raw = await ctx.roll?.(count, 6, `${prefix}Willpower ${wpTarget}+ save${count !== 1 ? 's' : ''} vs ${count} Corruption Hit${count !== 1 ? 's' : ''}`) || [];
    rolls = Array.isArray(raw) ? raw : [raw];
    blocked = rolls.filter(n => n >= wpTarget).length;
    unblocked = Math.max(0, count - blocked);
    logLine = `${prefix}Willpower [${rolls.join(', ')}] vs ${wpTarget}+ — ${blocked} blocked, ${unblocked} corruption taken.`;
  }

  if (unblocked > 0) {
    ctx.updateHero?.(heroId, (h) => ({
      ...h,
      currentCorruption: (h.currentCorruption ?? 0) + unblocked,
    }));
  }

  return { unblocked, blocked, rolls, wpTarget, logLine };
}

export default applyCorruptionHits;
