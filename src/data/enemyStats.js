import { mineEnemies } from './enemyCards/mineEnemies';

export const ENEMY_STATS = Object.fromEntries(
  mineEnemies.map((e) => [
    e.name,
    {
      keywords: e.keywords,
      Size: e.Size,
      eliteChart: e.eliteChart || [],
      stats: {
        normal: {
          initiative: e.initiative,
          move: e.move,
          escape: e.escape,
          toHit: {
            melee: e.melee?.toHit || '—',
            ranged: e.ranged?.toHit || '—',
          },
          combat: e.combat || (e.melee ? 1 : 0),
          damage: e.melee?.damage ?? e.ranged?.damage ?? 0,
          defense: e.defense,
          health: e.health,
          xp: e.xp,
          abilities: e.abilities || [],
        },
        brutal: {
          initiative: e.initiative + 1,
          move: e.move,
          escape: e.escape,
          toHit: {
            melee: e.melee?.toHit || '—',
            ranged: e.ranged?.toHit || '—',
          },
          combat: (e.combat || (e.melee ? 1 : 0)) + 1,
          damage:
            typeof (e.melee?.damage ?? e.ranged?.damage) === 'number'
              ? (e.melee?.damage ?? e.ranged?.damage) + 1
              : e.melee?.damage ?? e.ranged?.damage,
          defense: Math.max(e.defense - 1, 2),
          health: e.health + 2,
          xp: Math.round((e.xp || 5) * 1.5),
          abilities: e.abilities || [],
        },
      },
    },
  ])
);
