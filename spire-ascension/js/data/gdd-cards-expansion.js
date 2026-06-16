/**
 * 扩展卡牌包 — 四职业各 12-13 张（共 50 张）
 * iron_warrior=日冕骑士  shadow_rogue=月影舞者
 * arcane_mage=星尘贤者  blood_hunter=虚空行者
 */

export const EXPANSION_IRON_WARRIOR = {
  scorched_iron: {
    id: 'scorched_iron', name: '灼铁', type: 'attack', cost: 1, rarity: 'common',
    attribute: 'sun', class: 'iron_warrior',
    desc: '造成 {dmg} 点伤害。若目标有易伤，获得 2 点力量（本回合）。',
    effects: [
      { type: 'damage', value: 8, upgrade: 10 },
      { type: 'on_vulnerable_strength', value: 2, upgrade: 3, temp: true },
    ],
  },
  sun_disc: {
    id: 'sun_disc', name: '日轮投掷', type: 'attack', cost: 2, rarity: 'uncommon',
    attribute: 'sun', class: 'iron_warrior',
    desc: '造成 6 点伤害两次。日耀共鸣≥4 时，回手（不进入弃牌堆）。',
    effects: [
      { type: 'multi_damage', value: 6, upgrade: 8, hits: 2 },
      { type: 'cond_res_return_hand', resonance: { attr: 'sun', min: 4 } },
    ],
  },
  molten_strike: {
    id: 'molten_strike', name: '熔火打击', type: 'attack', cost: 1, rarity: 'common',
    attribute: 'sun', class: 'iron_warrior',
    desc: '造成 {dmg} 点伤害。消耗手牌中一张状态牌，若如此做，伤害翻倍。',
    effects: [
      { type: 'exhaust_status_double_damage', value: 7, upgrade: 9 },
    ],
  },
  dawn_charge: {
    id: 'dawn_charge', name: '黎明冲锋', type: 'attack', cost: 2, rarity: 'rare',
    attribute: 'sun', class: 'iron_warrior', costReducePerAttr: 'sun',
    desc: '造成 {dmg} 点伤害。本回合每打出一张日系牌，此牌费用 -1（最低 0）。',
    effects: [{ type: 'damage', value: 12, upgrade: 15 }],
  },
  final_light: {
    id: 'final_light', name: '终末之光', type: 'attack', cost: 3, rarity: 'rare',
    attribute: 'sun', class: 'iron_warrior', exhaust: true,
    desc: '造成 {dmg} 点伤害。若敌人生命低于 30%，造成 35 点伤害。消耗。',
    effects: [{ type: 'execute_damage', value: 20, upgrade: 25, execute: 35, upgradeExecute: 40, threshold: 0.3 }],
  },
  eclipse_veil: {
    id: 'eclipse_veil', name: '日蚀帷幕', type: 'skill', cost: 2, rarity: 'common',
    attribute: 'sun', class: 'iron_warrior',
    desc: '获得 {blk} 点护盾，对所有敌人施加 1 层虚弱。',
    effects: [
      { type: 'block', value: 8, upgrade: 11 },
      { type: 'debuff_all', status: 'weak', value: 1, upgrade: 2 },
    ],
  },
  light_forged_blade: {
    id: 'light_forged_blade', name: '光铸兵刃', type: 'skill', cost: 1, rarity: 'uncommon',
    attribute: 'sun', class: 'iron_warrior',
    desc: '本回合所有攻击牌伤害 +3。日耀共鸣≥3，改为 +5。',
    effects: [{ type: 'power_attack_damage_bonus', base: 3, upgrade: 4, resAttr: 'sun', resMin: 3, resBonus: 5, upgradeResBonus: 6, duration: 'turn' }],
  },
  solar_domain: {
    id: 'solar_domain', name: '日冕领域', type: 'skill', cost: 2, rarity: 'rare',
    attribute: 'sun', class: 'iron_warrior',
    desc: '获得 {blk} 点护盾。本回合内所有敌人对你造成的伤害 -3。',
    effects: [
      { type: 'block', value: 12, upgrade: 16 },
      { type: 'power_incoming_reduce', value: 3, upgrade: 4, duration: 'turn' },
    ],
  },
  fervent_resolve: {
    id: 'fervent_resolve', name: '炽热决心', type: 'skill', cost: 0, rarity: 'common',
    attribute: 'sun', class: 'iron_warrior',
    desc: '失去 3 点生命，抽 3 张牌。',
    effects: [{ type: 'hp_loss', value: 3, upgrade: 2 }, { type: 'draw', value: 3 }],
  },
  eternal_flame: {
    id: 'eternal_flame', name: '永恒之火', type: 'skill', cost: 1, rarity: 'uncommon',
    attribute: 'sun', class: 'iron_warrior',
    desc: '选择弃牌堆中一张日系牌置于抽牌堆顶。日耀共鸣≥5，改为加入手牌。',
    effects: [{ type: 'retrieve_discard_by_attr', attr: 'sun', toDrawTop: true, resToHand: { attr: 'sun', min: 5 }, upgradeCost: 0 }],
  },
  solar_wrath: {
    id: 'solar_wrath', name: '日冕之怒', type: 'power', cost: 2, rarity: 'rare',
    attribute: 'sun', class: 'iron_warrior',
    desc: '每回合一次，当你获得力量时，额外 +1。',
    effects: [{ type: 'power_on_strength_gain', value: 1, oncePerTurn: true, upgradeCost: 1 }],
  },
  holy_judgment: {
    id: 'holy_judgment', name: '圣光审判', type: 'power', cost: 2, rarity: 'uncommon',
    attribute: 'sun', class: 'iron_warrior',
    desc: '每当你对敌人造成 15 点以上伤害时，对其施加 1 层易伤。',
    effects: [{ type: 'power_big_hit_vulnerable', threshold: 15, upgrade: 12, value: 1 }],
  },
  eternal_sun: {
    id: 'eternal_sun', name: '永恒烈日', type: 'power', cost: 3, rarity: 'legendary',
    attribute: 'sun', class: 'iron_warrior',
    desc: '你的日耀共鸣层数不会因打出手牌而减少（虚空牌除外）。战斗结束时，若你日耀共鸣≥8，回复 15 点生命。',
    effects: [{ type: 'power_eternal_resonance', attr: 'sun', combatEndHeal: 15, resMin: 8, upgradeCost: 2 }],
  },
};

export const EXPANSION_SHADOW_ROGUE = {
  sleeve_dagger: {
    id: 'sleeve_dagger', name: '袖里剑', type: 'attack', cost: 0, rarity: 'common',
    attribute: 'moon', class: 'shadow_rogue',
    desc: '造成 {dmg} 点伤害。若本回合已打出 3 张以上牌，抽 1 张牌。',
    effects: [
      { type: 'damage', value: 3, upgrade: 4 },
      { type: 'cond_cards_played_draw', min: 3, value: 1 },
    ],
  },
  eclipse_combo: {
    id: 'eclipse_combo', name: '月蚀连斩', type: 'attack', cost: 2, rarity: 'uncommon',
    attribute: 'moon', class: 'shadow_rogue',
    desc: '造成 5 点伤害三次。每触发一次跨系共鸣奖励，此牌本场战斗费用永久 -1（最低 0）。',
    effects: [
      { type: 'multi_damage', value: 5, upgrade: 6, hits: 3 },
      { type: 'power_eclipse_combo', cardId: 'eclipse_combo' },
    ],
  },
  shadow_lunge: {
    id: 'shadow_lunge', name: '影步突刺', type: 'attack', cost: 1, rarity: 'common',
    attribute: 'moon', class: 'shadow_rogue',
    desc: '造成 {dmg} 点伤害，获得 3 点护盾。',
    effects: [{ type: 'damage', value: 6, upgrade: 8 }, { type: 'block', value: 3, upgrade: 5 }],
  },
  full_moon_smash: {
    id: 'full_moon_smash', name: '满月碎击', type: 'attack', cost: 2, rarity: 'rare',
    attribute: 'moon', class: 'shadow_rogue', exhaust: true,
    desc: '造成 {dmg} 点伤害。月影共鸣层数转换为额外伤害（1 层 = 1 伤，上限 8）。消耗。',
    effects: [{ type: 'damage_res_layers', value: 10, upgrade: 12, attr: 'moon', cap: 8, upgradeCap: 12 }],
  },
  phantom_legion: {
    id: 'phantom_legion', name: '幻影军势', type: 'attack', cost: -1, rarity: 'rare',
    attribute: 'moon', class: 'shadow_rogue', xCost: true,
    desc: '造成 X*3 点伤害，对随机敌人重复 X 次。',
    effects: [{ type: 'x_cost_random_multi', mult: 3, upgradeMult: 4 }],
  },
  moon_dodge: {
    id: 'moon_dodge', name: '月影闪避', type: 'skill', cost: 1, rarity: 'common',
    attribute: 'moon', class: 'shadow_rogue',
    desc: '获得 {blk} 点护盾。若上回合没有受到伤害，额外获得 4 点护盾。',
    effects: [
      { type: 'block', value: 6, upgrade: 8 },
      { type: 'cond_no_hit_last_turn_block', value: 4, upgrade: 5 },
    ],
  },
  shadow_clone_skill: {
    id: 'shadow_clone_skill', name: '残影分身', type: 'skill', cost: 1, rarity: 'uncommon',
    attribute: 'moon', class: 'shadow_rogue',
    desc: '将一张「分身」加入手牌。分身：0费，造成 4 点伤害，虚无。',
    effects: [{ type: 'add_temp', card: 'shadow_clone', count: 1, upgrade: 2 }],
  },
  crescent_omen: {
    id: 'crescent_omen', name: '新月预兆', type: 'skill', cost: 2, rarity: 'rare',
    attribute: 'moon', class: 'shadow_rogue',
    desc: '抽 2 张牌，下回合获得 2 点能量。',
    effects: [{ type: 'draw', value: 2, upgrade: 3 }, { type: 'energy_next', value: 2 }],
  },
  moon_solo: {
    id: 'moon_solo', name: '月下独舞', type: 'skill', cost: 0, rarity: 'common',
    attribute: 'moon', class: 'shadow_rogue',
    desc: '弃一张牌，然后抽一张牌。月影共鸣≥2，改为弃一张抽两张。',
    effects: [{ type: 'moon_solo_discard_draw', draw: 1, resDraw: 2, resonance: { attr: 'moon', min: 2 }, upgradeBaseDraw: 2 }],
  },
  shadow_cloak: {
    id: 'shadow_cloak', name: '暗影斗篷', type: 'skill', cost: 2, rarity: 'uncommon',
    attribute: 'moon', class: 'shadow_rogue',
    desc: '获得 {blk} 点护盾。本场战斗每次使用后，永久 +2 护盾值。',
    effects: [{ type: 'power_scaling_block', base: 10, upgrade: 13, growth: 2, upgradeGrowth: 3, powerKey: 'shadow_cloak' }],
  },
  moon_seal: {
    id: 'moon_seal', name: '月轮之印', type: 'power', cost: 1, rarity: 'uncommon',
    attribute: 'moon', class: 'shadow_rogue',
    desc: '每当你打出 0 费牌，获得 1 点护盾。',
    effects: [{ type: 'power_zero_cost_block', value: 1, upgrade: 2 }],
  },
  eternal_moon: {
    id: 'eternal_moon', name: '永恒月影', type: 'power', cost: 3, rarity: 'legendary',
    attribute: 'moon', class: 'shadow_rogue',
    desc: '你的月影共鸣层数不会因打出手牌而减少（虚空牌除外）。战斗结束时，若你月影共鸣≥8，下回合开始获得 3 点能量。',
    effects: [{ type: 'power_eternal_resonance', attr: 'moon', combatEndEnergy: 3, resMin: 8, upgradeCost: 2 }],
  },
};

export const EXPANSION_ARCANE_MAGE = {
  star_arrow: {
    id: 'star_arrow', name: '星辰箭', type: 'attack', cost: 1, rarity: 'common',
    attribute: 'star', class: 'arcane_mage',
    desc: '造成 {dmg} 点伤害，充能 1。可消耗 3 充能，额外造成 4 点伤害。',
    effects: [{ type: 'star_arrow', damage: 6, upgrade: 8, chargeGain: 1, spendCharge: 3, bonusDamage: 4, upgradeBonus: 5 }],
  },
  gravity_collapse: {
    id: 'gravity_collapse', name: '重力崩塌', type: 'attack', cost: 2, rarity: 'uncommon',
    attribute: 'star', class: 'arcane_mage',
    desc: '造成 {dmg} 点伤害，将一名敌人的护盾值减半。',
    effects: [{ type: 'damage', value: 8, upgrade: 11 }, { type: 'halve_enemy_block' }],
  },
  supernova_burst: {
    id: 'supernova_burst', name: '超新星爆发', type: 'attack', cost: 3, rarity: 'rare',
    attribute: 'star', class: 'arcane_mage',
    desc: '造成 {dmg} 点伤害，对所有其他敌人造成 5 点伤害。充能 4。',
    effects: [
      { type: 'splash_damage', value: 15, upgrade: 20, splash: 5, upgradeSplash: 8 },
      { type: 'add_charge', value: 4 },
    ],
  },
  entropy_ray: {
    id: 'entropy_ray', name: '熵增射线', type: 'attack', cost: 1, rarity: 'rare',
    attribute: 'star', class: 'arcane_mage',
    desc: '造成 {dmg} 点伤害，敌人每有一种负面状态（虚弱、易伤等），伤害 +3。',
    effects: [{ type: 'damage_per_debuff', value: 7, upgrade: 9, perDebuff: 3, upgradePerDebuff: 4 }],
  },
  overcharge: {
    id: 'overcharge', name: '充能过载', type: 'skill', cost: 0, rarity: 'common',
    attribute: 'star', class: 'arcane_mage',
    desc: '充能 5。下回合开始时，失去 3 点护盾。',
    effects: [{ type: 'add_charge', value: 5, upgrade: 7 }, { type: 'charge_next_turn_block_loss', value: 3, upgrade: 2 }],
  },
  stardust_shield: {
    id: 'stardust_shield', name: '星尘护盾', type: 'skill', cost: 1, rarity: 'common',
    attribute: 'star', class: 'arcane_mage',
    desc: '获得 5 点护盾，充能 2。充能 ≥5 时，改为获得 9 点护盾。',
    effects: [{ type: 'cond_charge_block', lowBlock: 5, highBlock: 9, upgradeLow: 7, upgradeHigh: 12, chargeGain: 2, chargeMin: 5 }],
  },
  energy_convert: {
    id: 'energy_convert', name: '能量转化', type: 'skill', cost: 1, rarity: 'uncommon',
    attribute: 'star', class: 'arcane_mage',
    desc: '消耗所有充能，每 2 层充能抽 1 张牌。',
    effects: [{ type: 'charge_to_draw', perCharge: 2, upgradePerCharge: 1.5 }],
  },
  time_delay: {
    id: 'time_delay', name: '时序延缓', type: 'skill', cost: 2, rarity: 'uncommon',
    attribute: 'star', class: 'arcane_mage',
    desc: '获得 {blk} 点护盾。选择一名敌人，其下回合攻击延后（移到回合最后结算）。',
    effects: [{ type: 'block', value: 8, upgrade: 11 }, { type: 'delay_enemy_intent' }],
  },
  stardust_recycle: {
    id: 'stardust_recycle', name: '星尘回收', type: 'skill', cost: 0, rarity: 'rare',
    attribute: 'star', class: 'arcane_mage',
    desc: '本回合每打出一张星系牌，获得 2 点护盾和 1 充能。',
    effects: [{ type: 'power_per_attr_played', attr: 'star', block: 2, upgradeBlock: 3, charge: 1, duration: 'turn' }],
  },
  arcane_void_charge: {
    id: 'arcane_void_charge', name: '虚空充能', type: 'skill', cost: 1, rarity: 'uncommon',
    attribute: 'void', class: 'arcane_mage',
    desc: '将手牌中一张非星系牌消耗，获得 6 充能。',
    effects: [{ type: 'exhaust_non_attr_charge', attr: 'star', charge: 6, upgrade: 8 }],
  },
  star_energy_resonance: {
    id: 'star_energy_resonance', name: '星能共鸣', type: 'power', cost: 2, rarity: 'common',
    attribute: 'star', class: 'arcane_mage',
    desc: '每当你充能达到 5 层时，获得 2 点护盾。',
    effects: [{ type: 'power_charge_threshold_block', threshold: 5, block: 2, upgrade: 3 }],
  },
  gravity_warp: {
    id: 'gravity_warp', name: '引力扭曲', type: 'power', cost: 2, rarity: 'rare',
    attribute: 'star', class: 'arcane_mage',
    desc: '所有敌人力量 -1。你每有 3 层充能，敌人额外 -1 力量。',
    effects: [{ type: 'power_gravity_warp', base: -1, perCharge: 3, upgradeCost: 1 }],
  },
  eternal_stardust: {
    id: 'eternal_stardust', name: '永恒星尘', type: 'power', cost: 3, rarity: 'legendary',
    attribute: 'star', class: 'arcane_mage',
    desc: '你的星尘共鸣层数不会因打出手牌而减少（虚空牌除外）。战斗结束时，若你星尘共鸣≥8，获得 8 充能（带到下场战斗）。',
    effects: [{ type: 'power_eternal_resonance', attr: 'star', combatEndCharge: 8, resMin: 8, upgradeCost: 2 }],
  },
};

export const EXPANSION_BLOOD_HUNTER = {
  void_rend: {
    id: 'void_rend', name: '虚空撕裂', type: 'attack', cost: 1, rarity: 'common',
    attribute: 'void', class: 'blood_hunter',
    desc: '造成 {dmg} 点伤害，超载：将一张腐化印记洗入抽牌堆。',
    effects: [{ type: 'damage', value: 7, upgrade: 10 }, { type: 'corruption_shuffle', count: 1 }],
  },
  pain_burst: {
    id: 'pain_burst', name: '痛苦爆发', type: 'attack', cost: 2, rarity: 'uncommon',
    attribute: 'void', class: 'blood_hunter',
    desc: '造成 {dmg} 点伤害。消耗手牌中一张腐化印记，若如此做，伤害翻倍。',
    effects: [{ type: 'exhaust_corruption_double', value: 12, upgrade: 15 }],
  },
  blood_sacrifice_blade: {
    id: 'blood_sacrifice_blade', name: '血祭之刃', type: 'attack', cost: 1, rarity: 'common',
    attribute: 'void', class: 'blood_hunter',
    desc: '造成 {dmg} 点伤害，失去 3 点生命。',
    effects: [{ type: 'damage', value: 10, upgrade: 13 }, { type: 'hp_loss', value: 3, upgrade: 2 }],
  },
  despair_strike: {
    id: 'despair_strike', name: '绝望重击', type: 'attack', cost: 2, rarity: 'rare',
    attribute: 'void', class: 'blood_hunter',
    desc: '造成 {dmg} 点伤害。你每有 1 张腐化印记在手牌/抽牌堆/弃牌堆，伤害 +1。',
    effects: [{ type: 'count_corruption_damage_bonus', value: 16, upgrade: 20, perCard: 1, upgradePerCard: 2 }],
  },
  void_toss: {
    id: 'void_toss', name: '虚空投掷', type: 'attack', cost: 0, rarity: 'uncommon',
    attribute: 'void', class: 'blood_hunter',
    desc: '弃一张牌，对随机敌人造成 5 点伤害。若弃的是腐化印记，造成 12 点伤害。',
    effects: [{ type: 'discard_for_damage', value: 5, upgrade: 7, corruptionDamage: 12, upgradeCorruption: 15 }],
  },
  corrupt_absorb: {
    id: 'corrupt_absorb', name: '腐化吸收', type: 'skill', cost: 1, rarity: 'common',
    attribute: 'void', class: 'blood_hunter',
    desc: '获得 {blk} 点护盾。超载：获得 2 层腐化印记（加入手牌）。',
    effects: [
      { type: 'block', value: 7, upgrade: 10 },
      { type: 'add_temp', card: 'corruption_mark', count: 2, upgrade: 2 },
    ],
  },
  blood_shield: {
    id: 'blood_shield', name: '鲜血护盾', type: 'skill', cost: 1, rarity: 'uncommon',
    attribute: 'void', class: 'blood_hunter',
    desc: '失去 5 点生命，获得 15 点护盾。',
    effects: [{ type: 'hp_loss', value: 5, upgrade: 4 }, { type: 'block', value: 15, upgrade: 18 }],
  },
  void_ritual: {
    id: 'void_ritual', name: '虚空仪轨', type: 'skill', cost: 2, rarity: 'rare',
    attribute: 'void', class: 'blood_hunter',
    desc: '消耗手牌，每消耗一张抽一张牌。对每张被消耗的腐化印记，回复 4 点生命。',
    effects: [{ type: 'exhaust_hand_draw_corruption_heal', healPer: 4, upgradeCost: 1 }],
  },
  pain_share: {
    id: 'pain_share', name: '痛苦分担', type: 'skill', cost: 1, rarity: 'uncommon',
    attribute: 'void', class: 'blood_hunter',
    desc: '选择一名敌人，将其力量值转化为你的等量护盾，然后其力量归零。',
    effects: [{ type: 'steal_strength_block', bonus: 0, upgrade: 5 }],
  },
  self_sacrifice: {
    id: 'self_sacrifice', name: '自我献祭', type: 'skill', cost: 1, rarity: 'rare',
    attribute: 'void', class: 'blood_hunter',
    desc: '失去 8 点生命，获得 2 点能量和 3 点力量（本场战斗）。',
    effects: [
      { type: 'hp_loss', value: 8, upgrade: 6 },
      { type: 'energy', value: 2 },
      { type: 'buff', status: 'strength', value: 3, upgrade: 4 },
    ],
  },
  corrupt_momentum: {
    id: 'corrupt_momentum', name: '腐化蔓延', type: 'power', cost: 1, rarity: 'common',
    attribute: 'void', class: 'blood_hunter',
    desc: '每场战斗首次获得腐化印记时，抽 1 张牌。',
    effects: [{ type: 'power_first_corruption_draw', value: 1, upgradeCost: 0 }],
  },
  eternal_void: {
    id: 'eternal_void', name: '永恒虚空', type: 'power', cost: 3, rarity: 'legendary',
    attribute: 'void', class: 'blood_hunter',
    desc: '你的虚空牌不再中断星辰共鸣。战斗结束时，若你生命低于 30%，回复至 50%。',
    effects: [{ type: 'power_eternal_void', healPercent: 0.5, hpThreshold: 0.3, upgradeCost: 2 }],
  },
};

export const EXPANSION_SPECIAL = {
  shadow_clone: {
    id: 'shadow_clone', name: '分身', type: 'attack', cost: 0, rarity: 'special',
    attribute: 'moon', ethereal: true,
    desc: '造成 {dmg} 点伤害。虚无。',
    effects: [{ type: 'damage', value: 4, upgrade: 5 }],
  },
};

export const EXPANSION_CARD_IDS = {
  iron_warrior: Object.keys(EXPANSION_IRON_WARRIOR),
  shadow_rogue: Object.keys(EXPANSION_SHADOW_ROGUE),
  arcane_mage: Object.keys(EXPANSION_ARCANE_MAGE),
  blood_hunter: Object.keys(EXPANSION_BLOOD_HUNTER),
};

export const EXPANSION_CARDS = {
  ...EXPANSION_IRON_WARRIOR,
  ...EXPANSION_SHADOW_ROGUE,
  ...EXPANSION_ARCANE_MAGE,
  ...EXPANSION_BLOOD_HUNTER,
  ...EXPANSION_SPECIAL,
};
