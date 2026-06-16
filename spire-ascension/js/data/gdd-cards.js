/**
 * 《星渊之塔》GDD 完整卡牌数据
 * iron_warrior=日冕骑士  shadow_rogue=月影舞者
 * arcane_mage=星尘贤者  blood_hunter=虚空行者
 */
import {
  EXPANSION_CARDS,
  EXPANSION_CARD_IDS,
} from './gdd-cards-expansion.js';

// —— 共用基础牌 ——
const BASIC_CARDS = {
  strike: {
    id: 'strike', name: '打击', type: 'attack', cost: 1, rarity: 'basic',
    desc: '造成 {dmg} 点伤害。',
    effects: [{ type: 'damage', value: 6, upgrade: 9 }],
  },
  defend: {
    id: 'defend', name: '防御', type: 'skill', cost: 1, rarity: 'basic',
    desc: '获得 {blk} 点护盾。',
    effects: [{ type: 'block', value: 5, upgrade: 8 }],
  },
};

// —— 日冕骑士 iron_warrior (Sol Knight) ——
const IRON_WARRIOR_CARDS = {
  sol_thrust: {
    id: 'sol_thrust', name: '日冕突刺', type: 'attack', cost: 1, rarity: 'basic',
    attribute: 'sun', class: 'iron_warrior',
    desc: '造成 {dmg} 点伤害。日耀共鸣≥2 时获得 4 点护盾。',
    effects: [
      { type: 'damage', value: 7, upgrade: 9 },
      { type: 'cond_res_block', value: 4, upgrade: 5, resonance: { attr: 'sun', min: 2 } },
    ],
  },
  radiant_slash: {
    id: 'radiant_slash', name: '辉光斩', type: 'attack', cost: 1, rarity: 'common',
    attribute: 'sun', class: 'iron_warrior',
    desc: '造成 {dmg} 点伤害。日耀共鸣≥3 时，再造成 4 点伤害。',
    effects: [
      { type: 'damage', value: 9, upgrade: 10 },
      { type: 'cond_res_damage', value: 4, upgrade: 5, resonance: { attr: 'sun', min: 3 }, extra: true },
    ],
  },
  dawn_break: {
    id: 'dawn_break', name: '破晓', type: 'attack', cost: 1, rarity: 'uncommon',
    attribute: 'sun', class: 'iron_warrior',
    desc: '造成 4 点伤害两次。每有一层日耀共鸣，伤害+1。',
    effects: [
      { type: 'multi_damage', value: 4, upgrade: 5, hits: 2 },
      { type: 'bonus_per_res_layer', attr: 'sun', perLayer: 1 },
    ],
  },
  solar_strike: {
    id: 'solar_strike', name: '旭日重击', type: 'attack', cost: 2, rarity: 'rare',
    attribute: 'sun', class: 'iron_warrior', exhaust: true,
    desc: '造成 {dmg} 点伤害。消耗。若日耀共鸣≥4，不消耗。',
    effects: [
      { type: 'damage', value: 20, upgrade: 24 },
      { type: 'cond_res_exempt_exhaust', resonance: { attr: 'sun', min: 4 } },
    ],
  },
  sun_ray: {
    id: 'sun_ray', name: '太阳射线', type: 'attack', cost: 0, rarity: 'common',
    attribute: 'sun', class: 'iron_warrior',
    desc: '造成 {dmg} 点伤害。抽 1 张牌。',
    effects: [{ type: 'damage', value: 3, upgrade: 5 }, { type: 'draw', value: 1 }],
  },
  flare_burst: {
    id: 'flare_burst', name: '耀斑爆发', type: 'attack', cost: 2, rarity: 'uncommon',
    attribute: 'sun', class: 'iron_warrior',
    desc: '造成 {dmg} 点伤害，获得 2 点力量（仅本回合）。日耀共鸣≥2，获得的力量持续整场战斗。',
    effects: [
      { type: 'damage', value: 12, upgrade: 14 },
      { type: 'buff', status: 'strength', value: 2, temp: true },
      { type: 'cond_res_buff', status: 'strength', value: 2, resonance: { attr: 'sun', min: 2, upgrade: 1 }, permanent: true },
    ],
  },
  solar_judgment: {
    id: 'solar_judgment', name: '烈日审判', type: 'attack', cost: 3, rarity: 'rare',
    attribute: 'sun', class: 'iron_warrior', ethereal: true,
    desc: '造成 {dmg} 点伤害。虚无。',
    effects: [{ type: 'damage', value: 30, upgrade: 36 }],
  },
  light_forged_armor: {
    id: 'light_forged_armor', name: '光铸铠甲', type: 'skill', cost: 1, rarity: 'common',
    attribute: 'sun', class: 'iron_warrior',
    desc: '获得 {blk} 点护盾。日耀共鸣≥2，再获得 3 点护盾。',
    effects: [
      { type: 'block', value: 7, upgrade: 9 },
      { type: 'cond_res_block', value: 3, upgrade: 5, resonance: { attr: 'sun', min: 2 } },
    ],
  },
  dawn_barrier: {
    id: 'dawn_barrier', name: '黎明壁垒', type: 'skill', cost: 2, rarity: 'uncommon',
    attribute: 'sun', class: 'iron_warrior',
    desc: '获得 {blk} 点护盾，下回合获得 2 点能量。',
    effects: [{ type: 'block', value: 15, upgrade: 18 }, { type: 'energy_next', value: 2 }],
  },
  twilight_light: {
    id: 'twilight_light', name: '黄昏之光', type: 'skill', cost: 0, rarity: 'uncommon',
    attribute: 'void', class: 'iron_warrior', exhaust: true, voidNoResPenalty: true,
    desc: '选择弃牌堆中一张日系牌加入手牌。共鸣中断无额外惩罚。消耗。',
    effects: [{ type: 'retrieve_discard_by_attr', attr: 'sun' }],
  },
  martyr_sword: {
    id: 'martyr_sword', name: '殉道者之剑', type: 'attack', cost: 1, rarity: 'rare',
    attribute: 'void', class: 'iron_warrior',
    desc: '失去 3 点生命，造成 {dmg} 点伤害。日耀共鸣层数转换为力量（每 2 层 1 力量）直到回合结束。',
    effects: [{ type: 'martyr', hpLoss: 3, upgradeHpLoss: 2, damage: 15, upgrade: 18, resAttr: 'sun', strPerLayers: 2 }],
  },
  solar_shield: {
    id: 'solar_shield', name: '旭日之盾', type: 'skill', cost: 2, rarity: 'common',
    attribute: 'sun', class: 'iron_warrior',
    desc: '获得 {blk} 点护盾。日耀共鸣≥3，获得 2 点力量（本场战斗）。',
    effects: [
      { type: 'block', value: 10, upgrade: 12 },
      { type: 'cond_res_buff', status: 'strength', value: 2, upgrade: 3, resonance: { attr: 'sun', min: 3 } },
    ],
  },
  solar_field: {
    id: 'solar_field', name: '日光灵场', type: 'skill', cost: 1, rarity: 'uncommon',
    attribute: 'sun', class: 'iron_warrior',
    desc: '获得 {blk} 点护盾，所有敌人失去 2 点力量。',
    effects: [
      { type: 'block', value: 6, upgrade: 8 },
      { type: 'debuff_all', status: 'strength', value: -2, upgrade: -3 },
    ],
  },
  eternal_day: {
    id: 'eternal_day', name: '永恒之昼', type: 'skill', cost: 3, rarity: 'rare',
    attribute: 'sun', class: 'iron_warrior',
    desc: '获得 {blk} 点护盾，并立刻触发一次「共鸣爆发」，不消耗爆发层数且不进入冷却（一局一次）。',
    effects: [{ type: 'block', value: 20, upgrade: 25 }, { type: 'free_burst', oncePerRun: true }],
  },
  radiant_guidance: {
    id: 'radiant_guidance', name: '光辉指引', type: 'skill', cost: 1, rarity: 'common',
    attribute: 'sun', class: 'iron_warrior',
    desc: '抽 2 张牌。日耀共鸣≥4，改为抽 3 张。',
    effects: [
      { type: 'draw', value: 2 },
      { type: 'cond_res_draw', value: 3, resonance: { attr: 'sun', min: 4, upgrade: 3 } },
    ],
  },
  solar_ring: {
    id: 'solar_ring', name: '太阳之环', type: 'skill', cost: 1, rarity: 'uncommon',
    attribute: 'sun', class: 'iron_warrior',
    desc: '将一张「微型太阳」加入手牌。微型太阳（0 费，造成 6 点伤害，日耀共鸣+2）。消耗。',
    effects: [{ type: 'add_temp', card: 'micro_sun', count: 1 }],
  },
  purifying_flame: {
    id: 'purifying_flame', name: '净化烈焰', type: 'attack', cost: 2, rarity: 'common',
    attribute: 'sun', class: 'iron_warrior',
    desc: '对全体敌人造成 {dmg} 点伤害。消耗手牌中所有状态/诅咒牌，每张额外造成 3 点伤害。',
    effects: [{ type: 'aoe_damage', value: 8, upgrade: 10 }, { type: 'purge_curses_aoe', perCard: 3 }],
  },
  unyielding: {
    id: 'unyielding', name: '不屈', type: 'skill', cost: 1, rarity: 'rare',
    attribute: 'sun', class: 'iron_warrior',
    desc: '本回合内，每次你受到攻击伤害，获得 2 点护盾。',
    effects: [{ type: 'power_unyielding', value: 2, upgrade: 3, duration: 'turn' }],
  },
  sol_eclipse: {
    id: 'sol_eclipse', name: '日蚀', type: 'skill', cost: 1, rarity: 'uncommon',
    attribute: 'void', class: 'iron_warrior',
    desc: '消耗手牌。然后抽等同于消耗数量的牌。日系牌不进入弃牌堆而是移回牌组。',
    effects: [{ type: 'discard_hand_draw', sunReturnToDeck: true }],
  },
  resonance_convert: {
    id: 'resonance_convert', name: '共鸣转化', type: 'skill', cost: 0, rarity: 'common',
    attribute: 'void', class: 'iron_warrior',
    desc: '将你的最高共鸣层数转化为等量护盾（最大 10），然后将该层数归零。',
    effects: [{ type: 'convert_max_res_block', max: 10, bonus: 0, upgrade: 2 }],
  },
  light_awakening: {
    id: 'light_awakening', name: '光明觉醒', type: 'skill', cost: 1, rarity: 'rare',
    attribute: 'sun', class: 'iron_warrior',
    desc: '获得 1 点能量。若你本回合已打出 3 张以上日系牌，获得 3 点能量。',
    effects: [
      { type: 'energy', value: 1 },
      { type: 'cond_cards_played_attr', attr: 'sun', min: 3, energy: 3, upgrade: 4 },
    ],
  },
  solar_aura: {
    id: 'solar_aura', name: '日冕光环', type: 'power', cost: 2, rarity: 'uncommon',
    attribute: 'sun', class: 'iron_warrior',
    desc: '每当你打出日系牌，获得 2 点护盾。',
    effects: [{ type: 'power_solar_aura', value: 2, upgrade: 3 }],
  },
  scorched: {
    id: 'scorched', name: '焦土', type: 'power', cost: 3, rarity: 'rare',
    attribute: 'sun', class: 'iron_warrior',
    desc: '每回合开始，对所有敌人造成 4 点伤害。日耀共鸣达到 5 时，伤害变为 8。',
    effects: [{ type: 'power_scorched', value: 4, upgrade: 6, resBonus: { attr: 'sun', min: 5, damage: 8 } }],
  },
  immortal_flame: {
    id: 'immortal_flame', name: '不灭阳炎', type: 'power', cost: 1, rarity: 'uncommon',
    attribute: 'sun', class: 'iron_warrior',
    desc: '每当你失去护盾时，造成等于失去护盾值一半的伤害给随机敌人。',
    effects: [{ type: 'power_immortal_flame', ratio: 0.5, upgrade: 1.0 }],
  },
  eternal_noon: {
    id: 'eternal_noon', name: '永恒正午', type: 'power', cost: 2, rarity: 'rare',
    attribute: 'sun', class: 'iron_warrior',
    desc: '你的最大能量+1。所有日系牌费用-1（最低 0）。',
    effects: [{ type: 'power_eternal_noon', maxEnergy: 1, upgrade: 2, sunCostReduce: 1 }],
  },
  phoenix_rebirth: {
    id: 'phoenix_rebirth', name: '凤凰重生', type: 'power', cost: 4, rarity: 'legendary',
    attribute: 'void', class: 'iron_warrior', exhaust: true,
    desc: '当你死亡时，复活并恢复 50% 生命，失去此能力。每场战斗限一次。消耗。',
    effects: [{ type: 'power_phoenix_rebirth', healPercent: 0.5, oncePerCombat: true }],
  },
};

// —— 月影舞者 shadow_rogue (Lunar Dancer) ——
const SHADOW_ROGUE_CARDS = {
  moon_step: {
    id: 'moon_step', name: '月步', type: 'attack', cost: 0, rarity: 'basic',
    attribute: 'moon', class: 'shadow_rogue',
    desc: '造成 {dmg} 点伤害。抽 1 张牌。',
    effects: [{ type: 'damage', value: 3, upgrade: 5 }, { type: 'draw', value: 1 }],
  },
  shadow_knives: {
    id: 'shadow_knives', name: '暗影飞刀', type: 'attack', cost: 1, rarity: 'basic',
    attribute: 'moon', class: 'shadow_rogue',
    desc: '造成 4 点伤害两次。月影共鸣≥2 时获得 1 点能量。',
    effects: [
      { type: 'multi_damage', value: 4, upgrade: 5, hits: 2 },
      { type: 'cond_res_energy', value: 1, resonance: { attr: 'moon', min: 2 } },
    ],
  },
  moon_blade: {
    id: 'moon_blade', name: '月刃', type: 'attack', cost: 0, rarity: 'common',
    attribute: 'moon', class: 'shadow_rogue',
    desc: '造成 {dmg} 点伤害。月影共鸣≥3，本牌伤害翻倍。',
    effects: [
      { type: 'damage', value: 4, upgrade: 5 },
      { type: 'cond_res_double', resonance: { attr: 'moon', min: 3, upgrade: 2 } },
    ],
  },
  crescent_strike: {
    id: 'crescent_strike', name: '新月打击', type: 'attack', cost: 1, rarity: 'common',
    attribute: 'moon', class: 'shadow_rogue',
    desc: '造成 {dmg} 点伤害，抽 1 张牌。',
    effects: [{ type: 'damage', value: 6, upgrade: 8 }, { type: 'draw', value: 1 }],
  },
  shadow_slash: {
    id: 'shadow_slash', name: '分身斩', type: 'attack', cost: 2, rarity: 'uncommon',
    attribute: 'moon', class: 'shadow_rogue',
    desc: '造成 5 点伤害三次。',
    effects: [{ type: 'multi_damage', value: 5, upgrade: 6, hits: 3 }],
  },
  lunar_eclipse: {
    id: 'lunar_eclipse', name: '月蚀', type: 'attack', cost: 2, rarity: 'rare',
    attribute: 'moon', class: 'shadow_rogue',
    desc: '造成 {dmg} 点伤害。对所有敌人施加 1 层虚弱。',
    effects: [
      { type: 'damage', value: 14, upgrade: 18 },
      { type: 'debuff_all', status: 'weak', value: 1, upgrade: 2 },
    ],
  },
  afterimage_formation: {
    id: 'afterimage_formation', name: '残影阵', type: 'attack', cost: 1, rarity: 'uncommon',
    attribute: 'moon', class: 'shadow_rogue',
    desc: '本回合每打出一张攻击牌，对随机敌人造成 2 点伤害。',
    effects: [{ type: 'power_afterimage_formation', value: 2, upgrade: 3, duration: 'turn' }],
  },
  moon_raid: {
    id: 'moon_raid', name: '月影突袭', type: 'attack', cost: 1, rarity: 'common',
    attribute: 'moon', class: 'shadow_rogue',
    desc: '造成 {dmg} 点伤害。若本回合已打出 3 张及以上牌，获得 2 点护盾。',
    effects: [
      { type: 'damage', value: 7, upgrade: 9 },
      { type: 'cond_cards_played', min: 3, block: 2, upgrade: 3 },
    ],
  },
  crescent_slash: {
    id: 'crescent_slash', name: '弦月斩', type: 'attack', cost: -1, rarity: 'rare',
    attribute: 'moon', class: 'shadow_rogue', xCost: true,
    desc: '造成 X*5 点伤害。月影共鸣≥5，再造成一次 X*5 伤害。',
    effects: [{ type: 'x_cost_damage', mult: 5, upgradeMult: 6, resonance: { attr: 'moon', min: 5, repeat: true } }],
  },
  knife_juggling: {
    id: 'knife_juggling', name: '飞刀杂耍', type: 'attack', cost: 0, rarity: 'common',
    attribute: 'moon', class: 'shadow_rogue',
    desc: '造成 2 点伤害两次，弃掉一张牌，然后抽一张牌。',
    effects: [
      { type: 'multi_damage', value: 2, upgrade: 3, hits: 2 },
      { type: 'discard_random', value: 1 },
      { type: 'draw', value: 1 },
    ],
  },
  blood_moon_blade: {
    id: 'blood_moon_blade', name: '血月之刃', type: 'attack', cost: 1, rarity: 'rare',
    attribute: 'void', class: 'shadow_rogue',
    desc: '失去 2 点生命，造成 {dmg} 点伤害。若击杀敌人，回复 5 点生命。',
    effects: [{ type: 'hp_loss', value: 2 }, { type: 'damage', value: 10, upgrade: 14 }, { type: 'kill_heal', value: 5, upgrade: 7 }],
  },
  nightfall: {
    id: 'nightfall', name: '夜幕降临', type: 'attack', cost: 2, rarity: 'uncommon',
    attribute: 'moon', class: 'shadow_rogue',
    desc: '造成 {dmg} 点伤害，本回合你每打出一张牌，该伤害+1（包括此牌）。',
    effects: [{ type: 'damage_per_card_played', value: 10, upgrade: 12, bonus: 1 }],
  },
  shadow_step: {
    id: 'shadow_step', name: '暗影步', type: 'skill', cost: 1, rarity: 'common',
    attribute: 'moon', class: 'shadow_rogue',
    desc: '获得 {blk} 点护盾，下张攻击牌费用-1。',
    effects: [{ type: 'block', value: 6, upgrade: 8 }, { type: 'next_attack_discount', value: 1 }],
  },
  crescent_veil: {
    id: 'crescent_veil', name: '新月帷幕', type: 'skill', cost: 2, rarity: 'uncommon',
    attribute: 'moon', class: 'shadow_rogue', exhaust: true,
    desc: '获得 {blk} 点护盾，月影共鸣≥3 时抽 3 张牌。消耗。',
    effects: [
      { type: 'block', value: 12, upgrade: 15 },
      { type: 'cond_res_draw', value: 3, resonance: { attr: 'moon', min: 3, upgrade: 2 } },
    ],
  },
  moon_hide: {
    id: 'moon_hide', name: '月隐', type: 'skill', cost: 1, rarity: 'rare',
    attribute: 'moon', class: 'shadow_rogue',
    desc: '获得 {blk} 点护盾，本回合闪避下一次攻击伤害（完全免伤）。',
    effects: [{ type: 'block', value: 8, upgrade: 10 }, { type: 'buff', status: 'dodge', value: 1 }],
  },
  shadow_dance: {
    id: 'shadow_dance', name: '残影之舞', type: 'skill', cost: 0, rarity: 'uncommon',
    attribute: 'moon', class: 'shadow_rogue', exhaust: true,
    desc: '选择一张手牌，将其复制两张加入手牌，复制品虚无。消耗。',
    effects: [{ type: 'duplicate_hand_ethereal', count: 2 }],
  },
  moon_blessing: {
    id: 'moon_blessing', name: '月之祝福', type: 'skill', cost: 1, rarity: 'common',
    attribute: 'moon', class: 'shadow_rogue',
    desc: '获得 2 点敏捷（本场战斗）。',
    effects: [{ type: 'buff', status: 'dexterity', value: 2, upgrade: 3 }],
  },
  confusing_phantom: {
    id: 'confusing_phantom', name: '迷惑幻影', type: 'skill', cost: 1, rarity: 'common',
    attribute: 'moon', class: 'shadow_rogue',
    desc: '所有敌人失去 3 点力量。',
    effects: [{ type: 'debuff_all', status: 'strength', value: -3, upgrade: -5 }],
  },
  unravel: {
    id: 'unravel', name: '抽丝剥茧', type: 'skill', cost: 1, rarity: 'uncommon',
    attribute: 'moon', class: 'shadow_rogue',
    desc: '将弃牌堆中所有 0 费牌返回手牌。',
    effects: [{ type: 'retrieve_discard_zero_cost', value: 1 }],
  },
  moon_rally: {
    id: 'moon_rally', name: '月下集结', type: 'skill', cost: 2, rarity: 'rare',
    attribute: 'moon', class: 'shadow_rogue',
    desc: '将手牌中所有月系牌降为 0 费，直到回合结束。',
    effects: [{ type: 'zero_cost_attr_hand', attr: 'moon' }],
  },
  mirror: {
    id: 'mirror', name: '镜像', type: 'skill', cost: 1, rarity: 'uncommon',
    attribute: 'void', class: 'shadow_rogue',
    desc: '选择一名敌人，本回合其受到的下次攻击伤害翻倍。',
    effects: [{ type: 'mirror_target', mult: 2 }],
  },
  bide_time: {
    id: 'bide_time', name: '伺机待发', type: 'skill', cost: 0, rarity: 'common',
    attribute: 'moon', class: 'shadow_rogue',
    desc: '下回合获得 2 点能量。',
    effects: [{ type: 'energy_next', value: 2 }, { type: 'draw', value: 0, upgrade: 1 }],
  },
  moon_wheel: {
    id: 'moon_wheel', name: '月轮', type: 'power', cost: 2, rarity: 'rare',
    attribute: 'moon', class: 'shadow_rogue',
    desc: '每回合开始，若你上回合打出至少 4 张牌，获得 1 点能量。',
    effects: [{ type: 'power_moon_wheel', cardsLastTurn: 4, energy: 1 }],
  },
  shadow_veil: {
    id: 'shadow_veil', name: '暗影帷幕', type: 'power', cost: 1, rarity: 'uncommon',
    attribute: 'moon', class: 'shadow_rogue',
    desc: '每当你打出一张攻击牌，获得 1 点护盾。',
    effects: [{ type: 'power_shadow_veil', value: 1, upgrade: 2 }],
  },
  werewolf_blood: {
    id: 'werewolf_blood', name: '狼人之血', type: 'power', cost: 3, rarity: 'legendary',
    attribute: 'void', class: 'shadow_rogue',
    desc: '你的力量+2。每次你受到伤害，力量额外+1。',
    effects: [{ type: 'power_werewolf_blood', strength: 2, upgrade: 3, onDamage: 1 }],
  },
};

// —— 星尘贤者 arcane_mage (Stellar Sage) ——
const ARCANE_MAGE_CARDS = {
  star_bolt: {
    id: 'star_bolt', name: '星弹', type: 'attack', cost: 1, rarity: 'basic',
    attribute: 'star', class: 'arcane_mage',
    desc: '造成 {dmg} 点伤害，充能 2。',
    effects: [{ type: 'damage', value: 8, upgrade: 10 }, { type: 'add_charge', value: 2, upgrade: 3 }],
  },
  charge_barrier: {
    id: 'charge_barrier', name: '充能屏障', type: 'skill', cost: 1, rarity: 'basic',
    attribute: 'star', class: 'arcane_mage',
    desc: '获得 {blk} 点护盾，充能 3。',
    effects: [{ type: 'block', value: 6, upgrade: 8 }, { type: 'add_charge', value: 3, upgrade: 4 }],
  },
  pulse_nova: {
    id: 'pulse_nova', name: '脉冲新星', type: 'attack', cost: 1, rarity: 'common',
    attribute: 'star', class: 'arcane_mage',
    desc: '造成 {dmg} 点伤害，充能 1。',
    effects: [{ type: 'damage', value: 7, upgrade: 9 }, { type: 'add_charge', value: 1, upgrade: 2 }],
  },
  star_vortex: {
    id: 'star_vortex', name: '星辰漩涡', type: 'attack', cost: 2, rarity: 'common',
    attribute: 'star', class: 'arcane_mage',
    desc: '对全体敌人造成 {dmg} 点伤害，充能 4。',
    effects: [{ type: 'aoe_damage', value: 5, upgrade: 6 }, { type: 'add_charge', value: 4, upgrade: 5 }],
  },
  charge_beam: {
    id: 'charge_beam', name: '充能光束', type: 'attack', cost: -1, rarity: 'uncommon',
    attribute: 'star', class: 'arcane_mage', xCost: true,
    desc: '造成 X*4 点伤害，消耗所有充能，每消耗 1 层充能，伤害+1。',
    effects: [{ type: 'x_cost_damage', mult: 4, upgradeMult: 5, chargeBonus: 1, spendAllCharge: true }],
  },
  nova_fragment: {
    id: 'nova_fragment', name: '超新星碎片', type: 'attack', cost: 2, rarity: 'rare',
    attribute: 'star', class: 'arcane_mage',
    desc: '造成 {dmg} 点伤害，击晕一名敌人 1 回合。',
    effects: [{ type: 'damage', value: 12, upgrade: 16 }, { type: 'stun', value: 1 }],
  },
  stardust_storm: {
    id: 'stardust_storm', name: '星尘风暴', type: 'attack', cost: 3, rarity: 'rare',
    attribute: 'star', class: 'arcane_mage', exhaust: true,
    desc: '造成 8 点伤害两次，充能 3。消耗。',
    effects: [{ type: 'multi_damage', value: 8, upgrade: 10, hits: 2 }, { type: 'add_charge', value: 3 }],
  },
  meteor: {
    id: 'meteor', name: '陨石术', type: 'attack', cost: 4, rarity: 'uncommon',
    attribute: 'star', class: 'arcane_mage',
    desc: '造成 {dmg} 点伤害。费用可被充能减免：每层充能减少 1 费（最低 1 费）。',
    effects: [{ type: 'damage', value: 28, upgrade: 34 }, { type: 'charge_cost_reduce', minCost: 1 }],
  },
  energy_overflow: {
    id: 'energy_overflow', name: '能量倾泻', type: 'attack', cost: 1, rarity: 'uncommon',
    attribute: 'void', class: 'arcane_mage',
    desc: '造成 {dmg} 点伤害，将充能层数转化为额外伤害（1:1），然后清空充能。',
    effects: [{ type: 'damage', value: 10, upgrade: 12 }, { type: 'spend_all_charge_damage', ratio: 1 }],
  },
  chain_reaction: {
    id: 'chain_reaction', name: '连锁反应', type: 'attack', cost: -1, rarity: 'rare',
    attribute: 'void', class: 'arcane_mage', xCost: true,
    desc: '消耗所有能量，每点能量触发：日-获得 2 力量，月-抽 1 牌，星-充能 3，虚空-造成 3 点伤害。顺序随机。',
    effects: [{ type: 'chain_reaction', spendAllEnergy: true, voidDamage: 3, upgrade: 4 }],
  },
  energy_shield: {
    id: 'energy_shield', name: '能量护盾', type: 'skill', cost: 1, rarity: 'common',
    attribute: 'star', class: 'arcane_mage',
    desc: '获得 {blk} 点护盾，充能 2。',
    effects: [{ type: 'block', value: 5, upgrade: 7 }, { type: 'add_charge', value: 2, upgrade: 3 }],
  },
  stardust_armor: {
    id: 'stardust_armor', name: '星尘护甲', type: 'skill', cost: 2, rarity: 'uncommon',
    attribute: 'star', class: 'arcane_mage',
    desc: '获得 {blk} 点护盾，将充能层数转化为额外护盾（1 层=2 护盾），然后清空充能。',
    effects: [{ type: 'block', value: 12, upgrade: 15 }, { type: 'spend_all_charge_block', ratio: 2 }],
  },
  overload_charge: {
    id: 'overload_charge', name: '过载充电', type: 'skill', cost: 0, rarity: 'common',
    attribute: 'star', class: 'arcane_mage',
    desc: '充能 4。下回合开始时失去 2 点生命。',
    effects: [{ type: 'add_charge', value: 4, upgrade: 6 }, { type: 'overload', value: 2, upgrade: 1, delay: 'nextTurnStart' }],
  },
  charge_transfer: {
    id: 'charge_transfer', name: '充能转移', type: 'skill', cost: 1, rarity: 'uncommon',
    attribute: 'star', class: 'arcane_mage',
    desc: '将手牌中一张牌消耗，并将其费用转化为等量充能层数。',
    effects: [{ type: 'exhaust_hand_card_for_charge', value: 1 }],
  },
  star_flash: {
    id: 'star_flash', name: '星光闪现', type: 'skill', cost: 0, rarity: 'common',
    attribute: 'star', class: 'arcane_mage',
    desc: '抽 1 张牌，充能 1。',
    effects: [{ type: 'draw', value: 1, upgrade: 2 }, { type: 'add_charge', value: 1, upgrade: 2 }],
  },
  mana_tide: {
    id: 'mana_tide', name: '法力潮汐', type: 'skill', cost: 1, rarity: 'rare',
    attribute: 'star', class: 'arcane_mage', exhaust: true,
    desc: '获得 3 点能量，充能 4。消耗。',
    effects: [{ type: 'energy', value: 3, upgrade: 4 }, { type: 'add_charge', value: 4 }],
  },
  star_resonance: {
    id: 'star_resonance', name: '星辰共鸣', type: 'skill', cost: 2, rarity: 'uncommon',
    attribute: 'star', class: 'arcane_mage',
    desc: '选择一项：获得 5 充能；或将充能层数转化为等量护盾（上限 10）。',
    effects: [{ type: 'choice_charge_or_block', charge: 5, upgrade: 7, blockCap: 10 }],
  },
  arcane_wisdom: {
    id: 'arcane_wisdom', name: '奥术智慧', type: 'skill', cost: 1, rarity: 'common',
    attribute: 'star', class: 'arcane_mage',
    desc: '抽 2 张牌，充能 1。',
    effects: [{ type: 'draw', value: 2, upgrade: 3 }, { type: 'add_charge', value: 1, upgrade: 2 }],
  },
  time_warp: {
    id: 'time_warp', name: '时空扭曲', type: 'skill', cost: 2, rarity: 'rare',
    attribute: 'void', class: 'arcane_mage',
    desc: '将弃牌堆洗入抽牌堆，获得等同于抽牌堆卡牌数量的充能。',
    effects: [{ type: 'shuffle_discard_to_draw', chargePerCard: 1 }],
  },
  energy_siphon: {
    id: 'energy_siphon', name: '能量虹吸', type: 'skill', cost: 1, rarity: 'rare',
    attribute: 'star', class: 'arcane_mage',
    desc: '消耗一名敌人 2 层力量或敏捷，并转化为你的充能 3。',
    effects: [{ type: 'siphon_enemy_stats', amount: 2, upgrade: 3, charge: 3, upgradeCharge: 5 }],
  },
  star_surge: {
    id: 'star_surge', name: '星能涌动', type: 'power', cost: 1, rarity: 'uncommon',
    attribute: 'star', class: 'arcane_mage',
    desc: '回合开始时，充能 1。',
    effects: [{ type: 'power_star_surge', value: 1, upgrade: 2 }],
  },
  charge_amp: {
    id: 'charge_amp', name: '共鸣放大器', type: 'power', cost: 2, rarity: 'rare',
    attribute: 'star', class: 'arcane_mage',
    desc: '每当你跨系触发共鸣奖励获得能量时，额外充能 2。',
    effects: [{ type: 'power_charge_amp', value: 2 }],
  },
  superconductor: {
    id: 'superconductor', name: '超导', type: 'power', cost: 1, rarity: 'uncommon',
    attribute: 'star', class: 'arcane_mage',
    desc: '你的充能上限提升至 15，每有 1 层充能，攻击伤害+1（上限 10）。',
    effects: [{ type: 'power_superconductor', maxCharge: 15, upgrade: 20, dmgPerCharge: 1, dmgCap: 10, upgradeUncap: true }],
  },
  stardust_body: {
    id: 'stardust_body', name: '星尘之躯', type: 'power', cost: 3, rarity: 'rare',
    attribute: 'star', class: 'arcane_mage',
    desc: '每当你获得充能，获得等量护盾。',
    effects: [{ type: 'power_stardust_body', ratio: 1 }],
  },
  ultimate_overload: {
    id: 'ultimate_overload', name: '终极过载', type: 'power', cost: 2, rarity: 'legendary',
    attribute: 'void', class: 'arcane_mage',
    desc: '每回合一次，你可以超出能量上限 1 点打出牌（费用不足时消耗生命值代替，1 血=1 费）。',
    effects: [{ type: 'power_ultimate_overload', overCap: 1, hpPerEnergy: 1, oncePerTurn: true }],
  },
};

// —— 虚空行者 blood_hunter (Void Walker) ——
const BLOOD_HUNTER_CARDS = {
  corrupt_strike: {
    id: 'corrupt_strike', name: '腐化打击', type: 'attack', cost: 1, rarity: 'basic',
    attribute: 'void', class: 'blood_hunter',
    desc: '造成 {dmg} 点伤害，腐化：将一张腐化印记洗入抽牌堆。',
    effects: [{ type: 'damage', value: 12, upgrade: 15 }, { type: 'corruption_shuffle', count: 1 }],
  },
  void_step: {
    id: 'void_step', name: '虚空步', type: 'skill', cost: 1, rarity: 'basic',
    attribute: 'void', class: 'blood_hunter',
    desc: '获得 {blk} 点护盾，超载：失去 2 点生命。',
    effects: [{ type: 'block', value: 6, upgrade: 8 }, { type: 'overload', value: 2 }],
  },
  void_cleave: {
    id: 'void_cleave', name: '虚空裂斩', type: 'attack', cost: 2, rarity: 'common',
    attribute: 'void', class: 'blood_hunter',
    desc: '造成 {dmg} 点伤害，超载：失去 5 点生命。',
    effects: [{ type: 'damage', value: 22, upgrade: 26 }, { type: 'overload', value: 5, upgrade: 3 }],
  },
  abyss_touch: {
    id: 'abyss_touch', name: '深渊之触', type: 'attack', cost: 1, rarity: 'common',
    attribute: 'void', class: 'blood_hunter',
    desc: '造成 {dmg} 点伤害，若敌人意图为攻击，伤害+6。',
    effects: [{ type: 'damage', value: 8, upgrade: 10, intentBonus: 6, upgradeIntentBonus: 8 }],
  },
  rot_feast: {
    id: 'rot_feast', name: '腐肉盛宴', type: 'attack', cost: 0, rarity: 'uncommon',
    attribute: 'void', class: 'blood_hunter',
    desc: '消耗手牌中所有腐化印记，每张造成 5 点伤害。',
    effects: [{ type: 'exhaust_corruption_damage', perCard: 5, upgrade: 6 }],
  },
  pain_spear: {
    id: 'pain_spear', name: '痛苦长矛', type: 'attack', cost: 2, rarity: 'rare',
    attribute: 'void', class: 'blood_hunter',
    desc: '造成 {dmg} 点伤害，重复你损失生命值 5% 的次数（最多 4 次）。',
    effects: [{ type: 'damage', value: 14, upgrade: 16 }, { type: 'repeat_by_hp_lost', percent: 0.05, upgrade: 0.07, max: 4 }],
  },
  soul_reap: {
    id: 'soul_reap', name: '灵魂收割', type: 'attack', cost: 1, rarity: 'uncommon',
    attribute: 'void', class: 'blood_hunter',
    desc: '造成 {dmg} 点伤害，回复等量生命。',
    effects: [{ type: 'damage', value: 6, upgrade: 9, lifesteal: true }],
  },
  sacrifice: {
    id: 'sacrifice', name: '献祭', type: 'attack', cost: 3, rarity: 'rare',
    attribute: 'void', class: 'blood_hunter',
    desc: '造成 {dmg} 点伤害，将 3 张腐化印记加入手牌。',
    effects: [{ type: 'damage', value: 30, upgrade: 36 }, { type: 'add_temp', card: 'corruption_mark', count: 3, upgrade: 2 }],
  },
  void_burst: {
    id: 'void_burst', name: '虚空爆发', type: 'attack', cost: 1, rarity: 'common',
    attribute: 'void', class: 'blood_hunter',
    desc: '造成 {dmg} 点伤害，虚空共鸣层数+2。',
    effects: [{ type: 'damage', value: 9, upgrade: 12 }, { type: 'add_void_resonance', value: 2 }],
  },
  corrupt_nova: {
    id: 'corrupt_nova', name: '腐化新星', type: 'attack', cost: 2, rarity: 'uncommon',
    attribute: 'void', class: 'blood_hunter',
    desc: '对所有敌人造成 {dmg} 点伤害，对自身造成 3 点伤害。',
    effects: [{ type: 'aoe_damage', value: 10, upgrade: 14 }, { type: 'hp_loss', value: 3, upgrade: 2, self: true }],
  },
  endless_hunger: {
    id: 'endless_hunger', name: '无尽饥渴', type: 'attack', cost: -1, rarity: 'rare',
    attribute: 'void', class: 'blood_hunter', xCost: true,
    desc: '造成 X*4 点伤害，将 X 张腐化印记加入手牌。',
    effects: [{ type: 'x_cost_damage', mult: 4, upgradeMult: 5 }, { type: 'add_temp', card: 'corruption_mark', xCost: true }],
  },
  fate_reverse: {
    id: 'fate_reverse', name: '命运逆转', type: 'attack', cost: 0, rarity: 'rare',
    attribute: 'void', class: 'blood_hunter',
    desc: '仅在你生命值低于 30% 时可用，造成 {dmg} 点伤害。',
    effects: [{ type: 'damage', value: 25, upgrade: 30, requireHpBelow: 0.3 }],
  },
  corrupt_armor: {
    id: 'corrupt_armor', name: '腐化护甲', type: 'skill', cost: 2, rarity: 'common',
    attribute: 'void', class: 'blood_hunter',
    desc: '获得 {blk} 点护盾，将一张腐化印记洗入抽牌堆。',
    effects: [{ type: 'block', value: 12, upgrade: 16 }, { type: 'corruption_shuffle', count: 1 }],
  },
  blood_ritual: {
    id: 'blood_ritual', name: '鲜血仪式', type: 'skill', cost: 1, rarity: 'uncommon',
    attribute: 'void', class: 'blood_hunter',
    desc: '失去 4 点生命，获得 8 点护盾和 2 点力量（本回合）。',
    effects: [
      { type: 'hp_loss', value: 4, upgrade: 3 },
      { type: 'block', value: 8, upgrade: 10 },
      { type: 'buff', status: 'strength', value: 2, upgrade: 3, temp: true },
    ],
  },
  pain_drain: {
    id: 'pain_drain', name: '痛苦汲取', type: 'skill', cost: 0, rarity: 'common',
    attribute: 'void', class: 'blood_hunter',
    desc: '消耗手牌中所有腐化印记，每张获得 4 点护盾并抽 1 张牌。',
    effects: [{ type: 'exhaust_corruption_block_draw', blockPer: 4, upgrade: 5, drawPer: 1 }],
  },
  void_convert: {
    id: 'void_convert', name: '虚空转换', type: 'skill', cost: 1, rarity: 'rare',
    attribute: 'void', class: 'blood_hunter',
    desc: '将一张手牌变为「虚空能量」（0 费，获得 2 点能量，消耗）。',
    effects: [{ type: 'transform_hand_card', card: 'void_energy', upgradeCost: 0 }],
  },
  shadow_deal: {
    id: 'shadow_deal', name: '暗影交易', type: 'skill', cost: 0, rarity: 'uncommon',
    attribute: 'void', class: 'blood_hunter',
    desc: '选择两张手牌消耗，然后抽 3 张牌。',
    effects: [{ type: 'exhaust_hand_cards', count: 2 }, { type: 'draw', value: 3, upgrade: 4 }],
  },
  corrupt_spread: {
    id: 'corrupt_spread', name: '腐化传播', type: 'skill', cost: 1, rarity: 'common',
    attribute: 'void', class: 'blood_hunter',
    desc: '给一名敌人施加 2 层「腐化感染」（减益：回合结束受到 2 点伤害，持续 3 回合）。',
    effects: [{ type: 'debuff', status: 'corrupt_infection', value: 2, upgrade: 3, duration: 3, tickDamage: 2 }],
  },
  nihil_shield: {
    id: 'nihil_shield', name: '虚无之盾', type: 'skill', cost: 1, rarity: 'uncommon',
    attribute: 'void', class: 'blood_hunter',
    desc: '获得 {blk} 点护盾。本回合内你每受到一次伤害，护盾+3。',
    effects: [{ type: 'block', value: 10, upgrade: 13 }, { type: 'power_nihil_shield', perHit: 3, duration: 'turn' }],
  },
  symbiosis: {
    id: 'symbiosis', name: '共生', type: 'skill', cost: 0, rarity: 'rare',
    attribute: 'void', class: 'blood_hunter',
    desc: '选择一名敌人，其下回合造成的伤害将为你回复等量生命（上限 15）。',
    effects: [{ type: 'symbiosis', cap: 15, upgrade: 20 }],
  },
  corrupt_heart: {
    id: 'corrupt_heart', name: '腐化之心', type: 'power', cost: 1, rarity: 'uncommon',
    attribute: 'void', class: 'blood_hunter',
    desc: '每当你获得一张腐化印记，获得 1 点力量。',
    effects: [{ type: 'power_corrupt_heart', value: 1, upgrade: 2 }],
  },
  void_form: {
    id: 'void_form', name: '虚空形态', type: 'power', cost: 2, rarity: 'rare',
    attribute: 'void', class: 'blood_hunter',
    desc: '所有虚空牌费用-1。回合结束时若有腐化印记在手，失去 1 生命（而非 3）。',
    effects: [{ type: 'power_void_form', voidCostReduce: 1, corruptionBurn: 1, upgradeCancelBurn: true }],
  },
  calamity_source: {
    id: 'calamity_source', name: '灾祸之源', type: 'power', cost: 1, rarity: 'uncommon',
    attribute: 'void', class: 'blood_hunter',
    desc: '每当你消耗一张牌，对随机敌人造成 3 点伤害。',
    effects: [{ type: 'power_calamity_source', value: 3, upgrade: 4 }],
  },
  self_annihilation: {
    id: 'self_annihilation', name: '自我湮灭', type: 'power', cost: 3, rarity: 'legendary',
    attribute: 'void', class: 'blood_hunter',
    desc: '当你死亡时，对全体敌人造成你最大生命值 50% 的伤害，并复活保留 1 点生命。每局一次。消耗。',
    effects: [{ type: 'power_self_annihilation', damagePercent: 0.5, upgrade: 0.75, reviveHp: 1, oncePerRun: true }],
  },
  corrupt_aura: {
    id: 'corrupt_aura', name: '腐化光环', type: 'power', cost: 2, rarity: 'rare',
    attribute: 'void', class: 'blood_hunter',
    desc: '每回合开始，将一张腐化印记加入手牌，但所有敌人受到 2 点伤害。',
    effects: [{ type: 'power_corrupt_aura', corruptionToHand: 1, aoeDamage: 2, upgrade: 3 }],
  },
};

// —— 特殊 / 状态 / 衍生牌 ——
const SPECIAL_CARDS = {
  corruption_mark: {
    id: 'corruption_mark', name: '腐化印记', type: 'status', cost: -1, rarity: 'special',
    attribute: 'void', unplayable: true, ethereal: true,
    desc: '无法打出。回合结束时若在手牌，失去 3 点生命。',
    effects: [{ type: 'ethereal_burn', value: 3 }],
  },
  deep_corruption: {
    id: 'deep_corruption', name: '深度腐化', type: 'status', cost: -1, rarity: 'special',
    attribute: 'void', unplayable: true, ethereal: true,
    desc: '无法打出。回合结束时若在手牌，失去 5 点生命。',
    effects: [{ type: 'ethereal_burn', value: 5 }],
  },
  micro_sun: {
    id: 'micro_sun', name: '微型太阳', type: 'attack', cost: 0, rarity: 'special',
    attribute: 'sun', exhaust: true,
    desc: '造成 {dmg} 点伤害，日耀共鸣+2。消耗。',
    effects: [{ type: 'damage', value: 6, upgrade: 9 }, { type: 'add_resonance', attr: 'sun', value: 2 }],
  },
  void_energy: {
    id: 'void_energy', name: '虚空能量', type: 'skill', cost: 0, rarity: 'special',
    attribute: 'void', exhaust: true,
    desc: '获得 2 点能量。消耗。',
    effects: [{ type: 'energy', value: 2, upgrade: 3 }],
  },
  void_gift: {
    id: 'void_gift', name: '虚空恩赐', type: 'skill', cost: 0, rarity: 'special',
    attribute: 'void', exhaust: true,
    desc: '抽 1 张牌。消耗。',
    effects: [{ type: 'draw', value: 1 }],
  },
  soul: {
    id: 'soul', name: '灵魂', type: 'attack', cost: 0, rarity: 'special',
    attribute: 'void', exhaust: true,
    desc: '造成 {dmg} 点伤害。消耗。',
    effects: [{ type: 'damage', value: 10, upgrade: 14 }],
  },
};

/** 合并后的完整卡牌池 */
export const CARD_POOL = {
  ...BASIC_CARDS,
  ...IRON_WARRIOR_CARDS,
  ...SHADOW_ROGUE_CARDS,
  ...ARCANE_MAGE_CARDS,
  ...BLOOD_HUNTER_CARDS,
  ...SPECIAL_CARDS,
  ...EXPANSION_CARDS,
};

/** 各职业奖励选牌池（不含基础 starter 牌） */
export const REWARD_CARD_POOL = {
  iron_warrior: [
    'radiant_slash', 'dawn_break', 'solar_strike', 'sun_ray', 'flare_burst', 'solar_judgment',
    'light_forged_armor', 'dawn_barrier', 'twilight_light', 'martyr_sword',
    'solar_shield', 'solar_field', 'eternal_day', 'radiant_guidance', 'solar_ring',
    'purifying_flame', 'unyielding', 'sol_eclipse', 'resonance_convert', 'light_awakening',
    'solar_aura', 'scorched', 'immortal_flame', 'eternal_noon', 'phoenix_rebirth',
    ...EXPANSION_CARD_IDS.iron_warrior,
  ],
  shadow_rogue: [
    'moon_blade', 'crescent_strike', 'shadow_slash', 'lunar_eclipse', 'afterimage_formation',
    'moon_raid', 'crescent_slash', 'knife_juggling', 'blood_moon_blade', 'nightfall',
    'shadow_step', 'crescent_veil', 'moon_hide', 'shadow_dance', 'moon_blessing',
    'confusing_phantom', 'unravel', 'moon_rally', 'mirror', 'bide_time',
    'moon_wheel', 'shadow_veil', 'werewolf_blood',
    ...EXPANSION_CARD_IDS.shadow_rogue,
  ],
  arcane_mage: [
    'pulse_nova', 'star_vortex', 'charge_beam', 'nova_fragment', 'stardust_storm', 'meteor',
    'energy_overflow', 'chain_reaction', 'energy_shield', 'stardust_armor', 'overload_charge',
    'charge_transfer', 'star_flash', 'mana_tide', 'star_resonance', 'arcane_wisdom',
    'time_warp', 'energy_siphon', 'star_surge', 'charge_amp', 'superconductor',
    'stardust_body', 'ultimate_overload',
    ...EXPANSION_CARD_IDS.arcane_mage,
  ],
  blood_hunter: [
    'void_cleave', 'abyss_touch', 'rot_feast', 'pain_spear', 'soul_reap', 'sacrifice',
    'void_burst', 'corrupt_nova', 'endless_hunger', 'fate_reverse', 'corrupt_armor',
    'blood_ritual', 'pain_drain', 'void_convert', 'shadow_deal', 'corrupt_spread',
    'nihil_shield', 'symbiosis', 'corrupt_heart', 'void_form', 'calamity_source',
    'self_annihilation', 'corrupt_aura',
    ...EXPANSION_CARD_IDS.blood_hunter,
  ],
  neutral: [],
};

/** 腐化类状态牌 ID */
export const CORRUPTION_CARD_IDS = ['corruption_mark', 'deep_corruption'];

/** GDD 初始卡组（按职业） */
export const STARTER_DECKS = {
  iron_warrior: [
    'strike', 'strike', 'strike', 'strike', 'strike',
    'defend', 'defend', 'defend', 'defend',
    'sol_thrust',
  ],
  shadow_rogue: [
    'strike', 'strike', 'strike', 'strike',
    'defend', 'defend', 'defend', 'defend',
    'moon_step', 'shadow_knives',
  ],
  arcane_mage: [
    'strike', 'strike', 'strike',
    'defend', 'defend', 'defend', 'defend',
    'star_bolt', 'charge_barrier',
  ],
  blood_hunter: [
    'strike', 'strike', 'strike', 'strike',
    'defend', 'defend', 'defend', 'defend',
    'corrupt_strike', 'void_step',
  ],
};

export default CARD_POOL;
