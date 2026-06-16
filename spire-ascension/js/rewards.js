/** 战斗战利品 — 卡牌必掉、药水/遗物按敌人类型 */
import {
  CARD_POOL, RELICS, POTIONS, REWARD_CARD_POOL,
  POTION_DROP_WEIGHTS, RARITY_WEIGHTS,
} from './data.js';
import { makeCard } from './combat.js';
import { getCharacterLevel, filterCardPoolByLevel } from './meta.js';

/** 卡牌稀有度权重：随战斗难度提升 */
export const COMBAT_CARD_TIER_WEIGHTS = {
  normal: { common: 62, uncommon: 30, rare: 8, legendary: 0 },
  elite: { common: 38, uncommon: 42, rare: 18, legendary: 2 },
  boss: { common: 22, uncommon: 38, rare: 32, legendary: 8 },
};

const NORMAL_POTION_CHANCE = 0.4;
const NORMAL_POTION_CHANCE_ASC2 = 0.25;

export function getCombatRewardTier(game) {
  if (game.pendingBoss) return 'boss';
  if (game.pendingElite) return 'elite';
  return 'normal';
}

export function buildWeightedCardPoolForTier(game, tier = 'normal') {
  const tierWeights = COMBAT_CARD_TIER_WEIGHTS[tier] || COMBAT_CARD_TIER_WEIGHTS.normal;
  const level = game.characterLevel ?? 0;
  let ids = filterCardPoolByLevel(game.classId, level);
  if (!ids.length) ids = [...(REWARD_CARD_POOL[game.classId] || []), ...(REWARD_CARD_POOL.neutral || [])];
  const pool = [];
  const mult = game.custom?.cardDropMult || 1;
  for (const id of ids.filter(cid => CARD_POOL[cid])) {
    const r = CARD_POOL[id].rarity || 'common';
    let w = tierWeights[r] ?? RARITY_WEIGHTS[r] ?? 0;
    if (w <= 0) continue;
    if (mult > 1 && (r === 'rare' || r === 'uncommon' || r === 'legendary')) {
      w = Math.floor(w * mult);
    }
    for (let i = 0; i < Math.max(1, w); i++) pool.push(id);
  }
  return pool.length ? pool : ['strike'];
}

export function rollCardRewardsForTier(game, count, tier = 'normal') {
  let n = count;
  if (game.ascension >= 8) n = Math.max(2, n);
  const pool = buildWeightedCardPoolForTier(game, tier);
  const picks = [];
  for (let i = 0; i < n; i++) {
    picks.push(makeCard(pool[Math.floor(Math.random() * pool.length)]));
  }
  return picks;
}

export function rollEliteRelicChoices(game, choiceCount = 3) {
  const n = Math.max(1, choiceCount || 3);
  const pool = Object.values(RELICS).filter(r =>
    !r.class && r.rarity !== 'starter' && r.rarity !== 'boss' && !game.relics.includes(r.id)
  );
  const picks = [];
  const copy = [...pool];
  while (picks.length < n && copy.length) {
    const i = Math.floor(Math.random() * copy.length);
    picks.push(copy.splice(i, 1)[0].id);
  }
  return picks;
}

export function randomPotionDrop() {
  const pool = [];
  for (const [id, p] of Object.entries(POTIONS)) {
    const w = POTION_DROP_WEIGHTS[p.rarity] || 10;
    for (let i = 0; i < w; i++) pool.push(id);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * @param {object} game
 * @param {'normal'|'elite'|'boss'} tier
 * @param {object} [envCtx] applyEnvTarotModifiers onRewardRoll
 */
export function buildCombatRewards(game, tier, envCtx = {}) {
  const cardCount = 3 + (game.relics.includes('question_card') ? 1 : 0)
    + (envCtx.cardChoices ? Math.max(0, envCtx.cardChoices - 3) : 0);

  const cards = rollCardRewardsForTier(game, Math.max(3, cardCount), tier);

  let potion = null;
  if (tier === 'elite') {
    potion = randomPotionDrop();
  } else if (tier === 'normal') {
    const chance = game.ascension >= 2 ? NORMAL_POTION_CHANCE_ASC2 : NORMAL_POTION_CHANCE;
    if (Math.random() < chance) potion = randomPotionDrop();
  }

  let relicChoices = null;
  if (tier === 'elite') {
    relicChoices = rollEliteRelicChoices(game, envCtx.relicChoices || 3);
  }

  return {
    tier,
    gold: 0,
    cards,
    potion,
    relicChoices,
    relic: null,
    cardPicked: false,
    forge: envCtx.forgeOptionChance > 0 && Math.random() < envCtx.forgeOptionChance,
    /** Boss 遗物在 boss_relic 界面单独发放 */
    deferBossRelic: tier === 'boss',
  };
}

export const TIER_LABELS = {
  normal: '普通敌人',
  elite: '精英敌人',
  boss: 'Boss',
};
