/** 药水 */
export const POTIONS = {
  fire_potion: { id: 'fire_potion', name: '火焰药水', icon: '🔥', rarity: 'common', desc: '对所有敌人造成 20 点伤害。', effect: { aoeDamage: 20 } },
  block_potion: { id: 'block_potion', name: '格挡药水', icon: '🧊', rarity: 'common', desc: '获得 12 点格挡。', effect: { block: 12 } },
  energy_potion: { id: 'energy_potion', name: '能量药水', icon: '⚡', rarity: 'common', desc: '获得 2 点能量。', effect: { energy: 2 } },
  weak_potion: { id: 'weak_potion', name: '虚弱药水', icon: '💀', rarity: 'common', desc: '对所有敌人施加 3 层虚弱。', effect: { debuffAll: { weak: 3 } } },
  strength_potion: { id: 'strength_potion', name: '力量药水', icon: '💪', rarity: 'common', desc: '获得 2 点力量。', effect: { buff: { strength: 2 } } },
  dexterity_potion: { id: 'dexterity_potion', name: '敏捷药水', icon: '🌀', rarity: 'common', desc: '获得 2 点敏捷。', effect: { buff: { dexterity: 2 } } },
  explosive_potion: { id: 'explosive_potion', name: '爆炸药水', icon: '💣', rarity: 'uncommon', desc: '对所有敌人造成 10 点伤害，施加 2 层易伤。', effect: { aoeDamage: 10, debuffAll: { vulnerable: 2 } } },
  fear_potion: { id: 'fear_potion', name: '恐惧药水', icon: '😱', rarity: 'uncommon', desc: '对所有敌人施加 3 层易伤。', effect: { debuffAll: { vulnerable: 3 } } },
  skill_potion: { id: 'skill_potion', name: '技巧药水', icon: '🎯', rarity: 'uncommon', desc: '抽 2 张牌，获得 1 点能量。', effect: { draw: 2, energy: 1 } },
  ancient_potion: { id: 'ancient_potion', name: '远古药水', icon: '🏛️', rarity: 'rare', desc: '获得 1 层无形，12 点格挡。', effect: { buff: { intangible: 1 }, block: 12 } },
  fairy_potion: { id: 'fairy_potion', name: '精灵药', icon: '🧚', rarity: 'rare', desc: '恢复 30% 最大生命。', effect: { healPercent: 0.3 } },
  smoke_bomb: { id: 'smoke_bomb', name: '烟雾弹', icon: '💨', rarity: 'uncommon', desc: '施加 3 层虚弱，获得 10 点格挡。', effect: { debuffAll: { weak: 3 }, block: 10 } },
  regen_potion: { id: 'regen_potion', name: '再生药水', icon: '💚', rarity: 'uncommon', desc: '恢复 10 点生命，移除所有负面状态。', effect: { heal: 10, clearDebuffs: true } },
};

export const POTION_DROP_WEIGHTS = { common: 55, uncommon: 35, rare: 10 };
