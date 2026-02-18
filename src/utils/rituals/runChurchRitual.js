// src/utils/rituals/runChurchRitual.js
import { listActiveMadnesses } from '../isActiveMadness';

/**
 * uiApi contract (optional, with fallbacks):
 * - uiApi.openModal(ReactNode) -> Promise<result>
 * - uiApi.closeModal()
 * - uiApi.alert(msg)
 * - uiApi.confirm(msg) -> Promise<boolean>
 *
 * posseApi:
 * - posseApi.updateHero(heroId, updater)
 */
export async function runChurchRitual({ hero, ritual, uiApi = {}, posseApi }) {
  if (!hero || !ritual) return;

  const name = String(ritual?.name || ritual?.label || '').toLowerCase();

  if (name.includes('exorcism')) {
    return runExorcismOfMadness({ hero, ritual, uiApi, posseApi });
  }

  // Other rituals can be added here…
  return;
}

async function runExorcismOfMadness({ hero, ritual, uiApi, posseApi }) {
  const active = listActiveMadnesses(hero);
  const heroId = hero?.id || hero?.localId;

  if (active.length === 0) {
    uiApi?.alert?.('No exorcisable Madnesses found (they may be blocked or already removed).') ??
      alert('No exorcisable Madnesses found (they may be blocked or already removed).');
    return;
  }

  // 1) Get Madness + Roll via modal (preferred), otherwise prompt fallback
  let selection = null;
  if (uiApi?.openModal) {
    selection = await new Promise((resolve) => {
      const onConfirm = (payload) => {
        uiApi?.closeModal?.();
        resolve(payload);
      };
      const onCancel = () => {
        uiApi?.closeModal?.();
        resolve(null);
      };
      // Lazy import to avoid circular deps if any:
      import('../../components/modals/ExorcismModal.jsx').then(({ default: ExorcismModal }) => {
        uiApi.openModal(
          <ExorcismModal hero={hero} onConfirm={onConfirm} onCancel={onCancel} />
        );
      });
    });
  } else {
    // Simple prompt fallback
    const idx = Number(
      prompt(
        `Choose a Madness by index:\n${active.map((m, i) => `${i + 1}. ${m.name || m.id || `Madness ${i + 1}`}`).join('\n')}`
      )
    ) - 1;
    if (!(idx >= 0 && idx < active.length)) return;
    const roll = Number(prompt('Enter D6 roll (1–6). Cost = roll × $50'));
    if (!(roll >= 1 && Number.isFinite(roll))) return;
    selection = { madness: active[idx], roll };
  }

  if (!selection) return;

  const { madness, roll } = selection;
  const cost = Math.max(0, Math.floor(roll) * 50);

  // 2) Deduct cost up front
  let goldOk = true;
  if (typeof hero.gold === 'number') {
    goldOk = hero.gold >= cost;
    if (!goldOk) {
      const proceed = await (uiApi?.confirm?.(`Not enough gold. Proceed and allow negative gold?`) ??
        Promise.resolve(confirm(`Not enough gold. Proceed and allow negative gold?`)));
      if (!proceed) return;
    }
  }

  // 3) Compute outcome & gold delta
  let msg = '';
  let goldDelta = -cost; // pay first
  const idOrName = madness?.id || madness?.name;

  if (roll === 1) {
    // Dead! → In our app rules: mark this Madness "permanentBlocked" so future Exorcisms can't target it.
    msg = `Exorcism failed catastrophically (roll 1). '${idOrName}' is now permanently blocked from Exorcism.`;
  } else if (roll === 2 || roll === 3) {
    // Too Far Gone / Failed → refund half the gold
    const refund = Math.floor(cost / 2);
    goldDelta += refund;
    msg = `Exorcism failed (roll ${roll}). Refunded $${refund}.`;
  } else if (roll === 4 || roll === 5) {
    // Success! → remove Madness
    msg = `Exorcism succeeded! '${idOrName}' has been removed.`;
  } else {
    // 6+ Mental Resolve → remove + Max Sanity +2
    msg = `Exorcism succeeded with resolve! '${idOrName}' removed and Max Sanity +2.`;
  }

  // 4) Apply updates
  posseApi?.updateHero?.(heroId, (prev) => {
    const h = { ...(prev || hero) };

    // gold
    if (typeof h.gold === 'number') {
      h.gold = (h.gold ?? 0) + goldDelta;
    } else {
      h.gold = (hero.gold ?? 0) + goldDelta;
    }

    // conditions
    const list = Array.isArray(h?.conditions?.madness) ? [...h.conditions.madness] : [];
    const idx = list.findIndex(m => (m.id || m.name) === (madness.id || madness.name));
    if (idx >= 0) {
      const cur = { ...list[idx] };
      if (roll === 1) {
        cur.permanentBlocked = true;
        cur.active = false;
      } else if (roll === 2 || roll === 3) {
        // no change to the condition itself
      } else if (roll === 4 || roll === 5) {
        cur.removed = true;
        cur.active = false;
      } else {
        cur.removed = true;
        cur.active = false;
      }
      list[idx] = cur;
    }
    h.conditions = { ...(h.conditions || {}) , madness: list };

    // Max Sanity +2 for 6+
    if (roll >= 6) {
      // support both 'Sanity' and 'maxSanity' shapes
      if (typeof h.maxSanity === 'number') {
        h.maxSanity += 2;
      } else if (typeof h.Sanity === 'number') {
        h.Sanity += 2;
      } else {
        h.maxSanity = (hero.maxSanity ?? 0) + 2;
      }
    }

    return h;
  });

  // 5) Notify
  uiApi?.alert?.(msg) ?? alert(msg);
}
