/** 遗物 — 45+ 件 */
export const RELICS = {
  // 起始
  burning_blood: { id: 'burning_blood', name: '燃烧之血', icon: '🩸', rarity: 'starter', class: 'iron_warrior', desc: '战斗结束后恢复 6 点生命。', onCombatEnd: { heal: 6 } },
  ring_of_snake: { id: 'ring_of_snake', name: '蛇之戒指', icon: '💍', rarity: 'starter', class: 'shadow_rogue', desc: '每场战斗开始时额外抽 2 张牌。', onCombatStart: { draw: 2 } },
  cracked_core: { id: 'cracked_core', name: '裂隙核心', icon: '🔮', rarity: 'starter', class: 'arcane_mage', desc: '每场战斗开始时获得 1 层专注。', onCombatStart: { buff: { focus: 1 } } },
  blood_vial_starter: { id: 'blood_vial_starter', name: '嗜血护符', icon: '🩹', rarity: 'starter', class: 'blood_hunter', desc: '攻击时回复 1 点生命（每回合最多 5 次）。', onAttack: { heal: 1, cap: 5 } },

  // 普通
  anchor: { id: 'anchor', name: '锚', icon: '⚓', rarity: 'common', desc: '每场战斗第一回合获得 10 点格挡。' },
  vajra: { id: 'vajra', name: '金刚杵', icon: '🔱', rarity: 'common', desc: '战斗开始时获得 1 点力量。', onCombatStart: { buff: { strength: 1 } } },
  bag_of_marbles: { id: 'bag_of_marbles', name: '弹珠袋', icon: '🎱', rarity: 'common', desc: '战斗开始时对所有敌人施加 1 层易伤。', onCombatStart: { debuffAll: { vulnerable: 1 } } },
  blood_vial: { id: 'blood_vial', name: '血瓶', icon: '🧪', rarity: 'common', desc: '获得时 +2 最大生命并恢复 2 点生命。', onObtain: { maxHp: 2, heal: 2 } },
  bronze_scales: { id: 'bronze_scales', name: '青铜鳞片', icon: '🐉', rarity: 'common', desc: '受到攻击时反弹 3 点伤害。' },
  meal_ticket: { id: 'meal_ticket', name: '餐券', icon: '🎫', rarity: 'common', desc: '进入商店时恢复 15 点生命。' },
  golden_idol: { id: 'golden_idol', name: '黄金神像', icon: '🏆', rarity: 'common', desc: '获得的金币 +25%。', goldBonus: 0.25 },
  maw_bank: { id: 'maw_bank', name: '巨口存钱罐', icon: '🏦', rarity: 'common', desc: '每经过一层 +5 金币（最多 150）。' },
  happy_flower: { id: 'happy_flower', name: '快乐花', icon: '🌸', rarity: 'common', desc: '每 3 回合获得 1 点能量。', energyEvery: 3 },
  lantern: { id: 'lantern', name: '灯笼', icon: '🏮', rarity: 'common', desc: '战斗第一回合 +1 能量。', firstTurnEnergy: 1 },
  war_paint: { id: 'war_paint', name: '战纹', icon: '🎨', rarity: 'common', desc: '战斗开始时获得 2 点力量（一次性）。', onCombatStart: { buff: { strength: 2 } } },
  strawberry: { id: 'strawberry', name: '草莓', icon: '🍓', rarity: 'common', desc: '获得时 +7 最大生命。', onObtain: { maxHp: 7 } },
  tiny_chest: { id: 'tiny_chest', name: '小宝箱', icon: '📦', rarity: 'common', desc: '每 4 层获得 25 金币。', floorGoldEvery: 4, floorGoldAmount: 25 },
  boot: { id: 'boot', name: '重靴', icon: '🥾', rarity: 'common', desc: '攻击未格挡伤害低于 5 时提升至 5。', minDamage: 5 },
  smooth_stone: { id: 'smooth_stone', name: '光滑石', icon: '🪨', rarity: 'common', desc: '战斗开始时获得 1 点敏捷。', onCombatStart: { buff: { dexterity: 1 } } },

  // 罕见
  odd_mushroom: { id: 'odd_mushroom', name: '奇异蘑菇', icon: '🍄', rarity: 'uncommon', desc: '最大生命 +10，战斗开始时失去 2 点生命。', onObtain: { maxHp: 10 }, onCombatStart: { hpLoss: 2 } },
  pantograph: { id: 'pantograph', name: '测绘仪', icon: '📐', rarity: 'uncommon', desc: 'Boss 战前恢复 25 点生命。', onBossStart: { heal: 25 } },
  pen_nib: { id: 'pen_nib', name: '笔尖', icon: '✒️', rarity: 'uncommon', desc: '每打出 10 张攻击牌，下一张攻击双倍伤害。' },
  sundial: { id: 'sundial', name: '日晷', icon: '☀️', rarity: 'uncommon', desc: '洗牌时 25% 概率获得 2 能量。', onShuffle: { energy: 2, chance: 0.25 } },
  question_card: { id: 'question_card', name: '问号牌', icon: '❔', rarity: 'uncommon', desc: '战斗奖励多 1 张卡牌选项。', extraCardReward: 1 },
  horn_fragment: { id: 'horn_fragment', name: '号角碎片', icon: '📯', rarity: 'uncommon', desc: '战斗开始时获得 1 点能量。', onCombatStart: { energy: 1 } },
  self_forming_clay: { id: 'self_forming_clay', name: '自塑黏土', icon: '🏺', rarity: 'uncommon', desc: '受到攻击后获得 3 点格挡。', onDamaged: { block: 3 } },
  mercury_hourglass: { id: 'mercury_hourglass', name: '水银沙漏', icon: '⏳', rarity: 'uncommon', desc: '回合开始时对所有敌人造成 3 点伤害。', onTurnStart: { aoeDamage: 3 } },
  charons_ashes: { id: 'charons_ashes', name: '卡戎之灰', icon: '⚱️', rarity: 'uncommon', desc: '消耗牌时对随机敌人造成 3 点伤害。', onExhaust: { damage: 3 } },
  ice_cream: { id: 'ice_cream', name: '冰淇淋', icon: '🍦', rarity: 'rare', desc: '回合结束时保留未用能量（最多 3）。', retainEnergy: 3 },
  gambling_chip: { id: 'gambling_chip', name: '赌筹', icon: '🎰', rarity: 'uncommon', desc: '进入商店时移除 1 张牌。', onShop: { removeCard: 1 } },

  // 稀有
  dead_branch: { id: 'dead_branch', name: '枯枝', icon: '🌿', rarity: 'rare', desc: '消耗牌时随机获得一张牌。' },
  torii: { id: 'torii', name: '鸟居', icon: '⛩️', rarity: 'rare', desc: '受到 ≤5 点的未格挡伤害减为 1。' },
  calipers: { id: 'calipers', name: '卡尺', icon: '📏', rarity: 'rare', desc: '回合结束时只失去 15 点格挡。', blockRetain: 15 },
  fossilized_fist: { id: 'fossilized_fist', name: '化石拳', icon: '👊', rarity: 'rare', desc: '每回合第一张攻击牌伤害 +8。', firstAttackBonus: 8 },
  unceasing_top: { id: 'unceasing_top', name: '不休陀螺', icon: '🌀', rarity: 'rare', desc: '手牌为空时抽 1 张牌。' },
  tungsten_rod: { id: 'tungsten_rod', name: '钨合金棒', icon: '🔩', rarity: 'rare', desc: '失去生命时减少 1 点（最少 1）。', hpLossReduce: 1 },
  bird_faced_urn: { id: 'bird_faced_urn', name: '鸟面瓮', icon: '🏺', rarity: 'rare', desc: '每消耗一张牌恢复 2 点生命。', onExhaust: { heal: 2 } },
  pocketwatch: { id: 'pocketwatch', name: '怀表', icon: '⌚', rarity: 'rare', desc: '每 3 回合抽 3 张额外牌。', drawEvery: 3, drawAmount: 3 },

  // Boss 遗物
  coffee_dripper: { id: 'coffee_dripper', name: '滴滤壶', icon: '☕', rarity: 'boss', desc: '每回合 +1 能量，无法在休息处回血。', energyBonus: 1, noRestHeal: true },
  cursed_key: { id: 'cursed_key', name: '诅咒之钥', icon: '🗝️', rarity: 'boss', desc: '打开宝箱获得 1 张诅咒。' },
  fusion_hammer: { id: 'fusion_hammer', name: '融合之锤', icon: '🔨', rarity: 'boss', desc: '无法在休息处升级，但战斗后随机升级 1 张牌。', noRestUpgrade: true, postCombatUpgrade: 1 },
  empty_cage: { id: 'empty_cage', name: '空鸟笼', icon: '🪶', rarity: 'boss', desc: '获得时移除 2 张基础牌。', onObtain: { removeBasic: 2 } },
  philo_stone: { id: 'philo_stone', name: '贤者之石', icon: '💎', rarity: 'boss', desc: '战斗开始时获得 1 点能量，但最大生命 -5。', onObtain: { maxHp: -5 }, onCombatStart: { energy: 1 } },
  velvet_choker: { id: 'velvet_choker', name: '丝绒颈环', icon: '📿', rarity: 'boss', desc: '每回合最多打出 6 张牌。', maxCardsPerTurn: 6 },
  sozu: { id: 'sozu', name: '御守', icon: '🎐', rarity: 'boss', desc: '不再获得药水，每回合 +1 能量。', energyBonus: 1, noPotions: true },
};

export const BOSS_RELIC_POOL = [
  'coffee_dripper', 'cursed_key', 'fusion_hammer', 'empty_cage',
  'philo_stone', 'velvet_choker', 'sozu',
];

export const RELIC_RARITY_WEIGHTS = { common: 50, uncommon: 35, rare: 15 };
