/** 进阶 0–20 完整规则（《星渊之塔》§9.2） */
import { BOSS_RELIC_POOL, NEGATIVE_BOSS_RELIC_POOL } from './data/gdd-relics.js';

export function applyAscensionToNewGame(game) {
  const a = game.ascension || 0;
  if (a >= 1) game.hp = Math.max(1, game.hp - 5);
  if (a >= 4) { game.hp = Math.max(1, game.hp - 5); game.gold = Math.floor(game.gold * 0.85); }
  if (a >= 5) game.gold = Math.min(game.gold, 80);
  if (a >= 14) { game.maxHp = Math.max(1, game.maxHp - 10); game.hp = Math.min(game.hp, game.maxHp); }
  if (game.custom?.maxHp) { game.maxHp += game.custom.maxHp; game.hp += game.custom.maxHp; }
  if (game.custom?.gold) game.gold += game.custom.gold;
  if (game.custom?.energy) game.customStartEnergy = game.custom.energy;
}

function makeCardRef(id) {
  return { id, name: '?', type: 'curse', cost: -1, upgraded: false };
}

export function getAscensionEnemyScaleMult(ascension, isBoss = false) {
  let m = 1 + (ascension || 0) * 0.04;
  if (ascension >= 1) m *= 1.1;
  if (isBoss && ascension >= 4) m *= 1.15;
  return m;
}

export function getAscensionRestHealPercent(ascension) {
  if (ascension >= 5) return 0.2;
  return 0.3;
}

export function getAscensionShopPriceMod(ascension) {
  let m = 1;
  if (ascension >= 4) m *= 1.15;
  if (ascension >= 7) m *= 1.2;
  return m;
}

export function getAscensionBurstRequired(ascension, relicPassives = {}) {
  if (relicPassives.burstChargeRequired) return relicPassives.burstChargeRequired;
  return ascension >= 16 ? 6 : 5;
}

export function shouldEliteAlwaysModifier(ascension) {
  return ascension >= 3;
}

export function getAscensionTarotChoiceCount(ascension, isBoss) {
  if (isBoss) return 3;
  if (ascension >= 18) return 2;
  return 3;
}

export function rollBossRelicChoices(game, n = 3) {
  if (game.ascension >= 19) {
    const pool = [...NEGATIVE_BOSS_RELIC_POOL].filter(id => !game.relics.includes(id));
    const picks = [];
    const copy = [...pool];
    while (picks.length < 2 && copy.length) {
      const i = Math.floor(Math.random() * copy.length);
      picks.push(copy.splice(i, 1)[0]);
    }
    return picks.length ? picks : rollBossRelicChoices({ ...game, ascension: 0 }, n);
  }
  const pool = [...BOSS_RELIC_POOL].filter(id => !game.relics.includes(id));
  const picks = [];
  const copy = [...pool];
  while (picks.length < n && copy.length) {
    const i = Math.floor(Math.random() * copy.length);
    picks.push(copy.splice(i, 1)[0]);
  }
  return picks;
}

export function shouldDualBossChain(game) {
  return (game.ascension || 0) >= 20 && game.lastBossId === 'eclipse_witch';
}

export function getAbyssPhaseCount(ascension) {
  return ascension >= 10 ? 4 : 3;
}

export function getEnemyAttackBonus(ascension, enemyDef) {
  if (ascension >= 2 && !enemyDef?.boss && !enemyDef?.elite) return 2;
  return 0;
}

export function applyPotionAscension(eff, ascension) {
  if (ascension < 15 || !eff) return eff;
  const out = { ...eff };
  for (const k of ['heal', 'block', 'energy', 'draw', 'aoeDamage', 'addCharge']) {
    if (out[k] != null) out[k] = Math.max(1, Math.floor(out[k] * 0.5));
  }
  if (out.healPercent) out.healPercent *= 0.5;
  return out;
}
