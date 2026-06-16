/** GDD 星辰药水（15 种） */
export const POTIONS = {
  resonance_potion: {
    id: 'resonance_potion', name: '共鸣药水', icon: '✦', rarity: 'uncommon',
    desc: '选择并获得 4 层任一星辰共鸣。',
    effect: { chooseResonance: 4 },
  },
  overload_potion: {
    id: 'overload_potion', name: '过载药水', icon: '⚡', rarity: 'common',
    desc: '本回合获得 2 能量，回合结束受到 5 伤害。',
    effect: { energy: 2, endTurnDamage: 5 },
  },
  revive_potion: {
    id: 'revive_potion', name: '星辰复活药水', icon: '💫', rarity: 'rare',
    desc: '本场战斗死亡时复活并回复 30% 生命（每瓶限一次）。',
    effect: { onDeathRevive: 0.3 },
  },
  tarot_potion: {
    id: 'tarot_potion', name: '塔罗药水', icon: '🃏', rarity: 'rare',
    desc: '触发一次当前未选的随机战斗塔罗效果（持续本场战斗）。',
    effect: { randomBattleTarot: true },
  },
  charge_potion: {
    id: 'charge_potion', name: '充能药水', icon: '🔋', rarity: 'uncommon',
    desc: '获得 8 层充能。',
    effect: { addCharge: 8 },
  },
  purge_potion: {
    id: 'purge_potion', name: '净化药水', icon: '🧹', rarity: 'uncommon',
    desc: '移除手中所有减益和状态牌。',
    effect: { clearHandStatus: true, clearDebuffs: true },
  },
  block_potion: {
    id: 'block_potion', name: '护盾药水', icon: '🛡', rarity: 'common',
    desc: '获得 20 点护盾。',
    effect: { block: 20 },
  },
  strength_potion: {
    id: 'strength_potion', name: '力量药水', icon: '💪', rarity: 'common',
    desc: '获得 5 点力量（本场战斗）。',
    effect: { buff: { strength: 5 } },
  },
  dex_potion: {
    id: 'dex_potion', name: '敏捷药水', icon: '🌀', rarity: 'common',
    desc: '获得 5 点敏捷（本场战斗）。',
    effect: { buff: { dexterity: 5 } },
  },
  energy_potion: {
    id: 'energy_potion', name: '能量药水', icon: '⚡', rarity: 'common',
    desc: '获得 2 点能量。',
    effect: { energy: 2 },
  },
  draw_potion: {
    id: 'draw_potion', name: '抽牌药水', icon: '🃁', rarity: 'common',
    desc: '抽 5 张牌。',
    effect: { draw: 5 },
  },
  corruption_suppress: {
    id: 'corruption_suppress', name: '腐化压制药水', icon: '🩹', rarity: 'uncommon',
    desc: '消耗手牌中所有腐化印记，每张回复 3 生命。',
    effect: { exhaustCorruptionHeal: 3 },
  },
  weakness_potion: {
    id: 'weakness_potion', name: '弱点药水', icon: '💀', rarity: 'uncommon',
    desc: '给所有敌人施加 3 层易伤和虚弱。',
    effect: { debuffAll: { vulnerable: 3, weak: 3 } },
  },
  invis_potion: {
    id: 'invis_potion', name: '隐形药水', icon: '👻', rarity: 'rare',
    desc: '本回合闪避下一次攻击。',
    effect: { dodgeNext: 1 },
  },
  miracle_potion: {
    id: 'miracle_potion', name: '奇迹药水', icon: '🌟', rarity: 'rare',
    desc: '随机产生两种上述药水效果。',
    effect: { miracle: true },
  },
};

export const POTION_DROP_WEIGHTS = { common: 50, uncommon: 35, rare: 15 };
