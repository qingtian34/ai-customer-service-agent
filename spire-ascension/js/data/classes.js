/** 角色、幕次、商店价格、进阶难度 */
import { STARTER_DECKS } from './gdd-cards.js';

export const CLASSES = {
  iron_warrior: {
    id: 'iron_warrior', name: '烈日骑士', icon: '☀',
    desc: '重甲战士。以日耀共鸣、格挡与太阳风暴爆发碾压敌人。',
    maxHp: 80,
    starterDeck: STARTER_DECKS.iron_warrior,
    color: '#e8a838', theme: 'warrior',
    burstName: '太阳风暴',
  },
  shadow_rogue: {
    id: 'shadow_rogue', name: '月影舞者', icon: '🌙',
    desc: '敏捷刺客。月影共鸣、连击与月下轮舞爆发。',
    maxHp: 65,
    starterDeck: STARTER_DECKS.shadow_rogue,
    color: '#6eb5ff', theme: 'rogue',
    burstName: '月下轮舞',
  },
  arcane_mage: {
    id: 'arcane_mage', name: '星尘术士', icon: '✦',
    desc: '掌控星尘能量。充能、星尘共鸣与超新星爆发。',
    maxHp: 55,
    starterDeck: STARTER_DECKS.arcane_mage,
    color: '#b98cff', theme: 'mage',
    burstName: '超新星',
  },
  blood_hunter: {
    id: 'blood_hunter', name: '虚空猎手', icon: '🌀',
    desc: '以腐化与生命为代价换取力量。虚空湮灭爆发。',
    maxHp: 70,
    starterDeck: STARTER_DECKS.blood_hunter,
    color: '#7a5cad', theme: 'hunter',
    burstName: '虚空湮灭',
  },
};

export const ACTS = [
  { name: '第一幕：日冕圣殿', floors: 17, boss: 'sun_monarch', theme: 'exordium', bg: '#1a1520' },
  { name: '第二幕：月影深渊', floors: 17, boss: 'eclipse_witch', theme: 'city', bg: '#151a25' },
  { name: '第三幕：星渊之核', floors: 17, boss: 'abyss_core', theme: 'beyond', bg: '#0f1520' },
];

export const ASCENSION = [
  { level: 0, name: '普通', desc: '标准难度' },
  { level: 1, name: '进阶 I', desc: '敌人生命 +10%' },
  { level: 2, name: '进阶 II', desc: '普通敌人攻击力 +2' },
  { level: 3, name: '进阶 III', desc: '精英敌人拥有额外能力' },
  { level: 4, name: '进阶 IV', desc: 'Boss 生命 +15%' },
  { level: 5, name: '进阶 V', desc: '休息点回复生命降低至 20%' },
  { level: 6, name: '进阶 VI', desc: '所有敌人初始力量 +1' },
  { level: 7, name: '进阶 VII', desc: '商人售价 +20%' },
  { level: 8, name: '进阶 VIII', desc: '战斗后选牌少一个选项（三选一变二选一）' },
  { level: 9, name: '进阶 IX', desc: '事件负面结果概率提升' },
  { level: 10, name: '进阶 X', desc: 'Boss 获得第二形态（星渊之核四阶段）' },
  { level: 11, name: '进阶 XI', desc: '敌人攻击模式随机化增加' },
  { level: 12, name: '进阶 XII', desc: '初始卡组中加入一张「深度腐化」诅咒' },
  { level: 13, name: '进阶 XIII', desc: '地图路线更加线性，分支减少' },
  { level: 14, name: '进阶 XIV', desc: '最大生命 -10' },
  { level: 15, name: '进阶 XV', desc: '药水效果减半' },
  { level: 16, name: '进阶 XVI', desc: '共鸣爆发需要 6 层充能' },
  { level: 17, name: '进阶 XVII', desc: '敌人造成伤害时施加 1 层虚弱/易伤随机' },
  { level: 18, name: '进阶 XVIII', desc: '战斗塔罗选择减少至 2 张' },
  { level: 19, name: '进阶 XIX', desc: 'Boss 掉落遗物为随机负面遗物二选一' },
  { level: 20, name: '进阶 XX', desc: '双 Boss 连战（月蚀魔女后直接对战星渊之核）' },
];

export const SHOP_PRICES = { card: 50, relic: 150, remove: 75, potion: 50, cardSale: 35 };

export const RARITY_WEIGHTS = {
  common: 60, uncommon: 25, rare: 12, curse: 3,
};
