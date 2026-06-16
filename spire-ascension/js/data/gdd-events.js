/** GDD 未知事件 — 15 个（§8.2） */
export const EVENTS = [
  {
    id: 'star_altar', name: '星辰祭坛', desc: '古老祭坛上星辰符文流转，低语着祈祷与献祭。',
    choices: [
      { text: '祈祷 (-15 金币, 获得随机稀有遗物)', effect: { gold: -15, addRelic: 'rare' } },
      { text: '献祭 (-8 最大生命, 获得一张稀有卡牌)', effect: { maxHp: -8, addCard: 'rare' } },
      { text: '离开', effect: {} },
    ],
  },
  {
    id: 'wandering_merchant', name: '流浪商人', desc: '披着星尘斗篷的商人展示着稀世珍品。',
    choices: [
      { text: '购买特殊遗物 (三选一, -200 金币)', effect: { gold: -200, addRelic: 'shop_special' } },
      { text: '出售一件遗物 (+80 金币)', effect: { removeRelic: 1, gold: 80 } },
      { text: '离开', effect: {} },
    ],
  },
  {
    id: 'corrupt_pool', name: '腐败水池', desc: '黑绿色池水翻涌，散发着虚空的气息。',
    choices: [
      { text: '喝下水 (-10 生命, 移除牌组中一张牌)', effect: { hp: -10, removeCard: 1 } },
      { text: '净化 (+100 金币, 获得诅咒「深度腐化」)', effect: { gold: 100, addCurse: 'deep_corruption' } },
      { text: '离开', effect: {} },
    ],
  },
  {
    id: 'time_rift', name: '时光裂缝', desc: '时间在此扭曲，过去与未来交织成光带。',
    choices: [
      { text: '复制牌组中的一张牌', effect: { duplicateCard: 1 } },
      { text: '升级两张随机牌', effect: { upgrade: 2 } },
      { text: '随机转化 3 张牌', effect: { transformCards: 3 } },
    ],
  },
  {
    id: 'deity_statue', name: '日/月/星神像', desc: '三尊神像并列，分别代表日耀、月影与星尘。',
    choices: [
      { text: '日之祝福 (+20 生命)', effect: { heal: 20 } },
      { text: '月之祝福 (+150 金币)', effect: { gold: 150 } },
      { text: '星之祝福 (升级所有星辰牌)', effect: { upgradeStarCards: true } },
      { text: '亵渎 (战斗)', effect: { combat: 'cultist' } },
    ],
  },
  {
    id: 'soul_gamble', name: '灵魂赌局', desc: '虚空荷官邀请你以生命为筹码。',
    choices: [
      { text: '赌上 20 生命 (50% 获得稀有遗物)', effect: { gamble: { hp: 20, winRelic: 'rare', chance: 0.5 } } },
      { text: '放弃', effect: {} },
    ],
  },
  {
    id: 'ancient_library', name: '古老的图书馆', desc: '尘封典籍中记载着失传的星术。',
    choices: [
      { text: '阅读 (选择一张能力牌加入牌组)', effect: { addCard: 'power' } },
      { text: '研习 (升级所有能力牌, -10 生命)', effect: { upgradePowers: true, hp: -10 } },
      { text: '离开', effect: {} },
    ],
  },
  {
    id: 'wishing_well', name: '许愿井', desc: '深井中映出星辰，投币似乎能换来回报。',
    choices: [
      { text: '投入 30 金币 (随机奖励)', effect: { gold: -30, wishingWell: 30 } },
      { text: '投入 50 金币 (较高几率遗物)', effect: { gold: -50, wishingWell: 50 } },
      { text: '投入 99 金币 (丰厚奖励)', effect: { gold: -99, wishingWell: 99 } },
      { text: '离开', effect: {} },
    ],
  },
  {
    id: 'living_armor', name: '活体铠甲', desc: '一副会呼吸的铠甲，以生命换取力量。',
    choices: [
      { text: '接受 (-10% 最大生命, 获得 Boss 遗物)', effect: { maxHpPercent: -0.1, addRelic: 'boss' } },
      { text: '拒绝', effect: {} },
    ],
  },
  {
    id: 'twin_merchant', name: '双胞胎商人', desc: '两位一模一样的商人提供卡牌交换服务（最多三次）。',
    choices: [
      { text: '交换卡牌 (同稀有度互换, 最多 3 次)', effect: { tradeCard: 3 } },
      { text: '离开', effect: {} },
    ],
  },
  {
    id: 'curse_remover', name: '诅咒解除师', desc: '蒙面术士专精解除诅咒与腐化。',
    choices: [
      { text: '免费移除一张诅咒/状态牌', effect: { removeCurse: 1 } },
      { text: '花费 75 金币移除任意牌', effect: { gold: -75, removeCard: 1 } },
      { text: '离开', effect: {} },
    ],
  },
  {
    id: 'resonance_storm', name: '共鸣风暴', desc: '星辰能量狂涌，迫使你做出抉择。',
    choices: [
      { text: '失去全部共鸣层数, 获得随机普通遗物', effect: { clearResonance: true, addRelic: 'common' } },
      { text: '离开', effect: {} },
    ],
  },
  {
    id: 'falling_floor', name: '坠落塔层', desc: '地板崩塌，你可以选择跳过下一场战斗。',
    choices: [
      { text: '跳过下一场战斗 (-10 生命, 直接获得奖励)', effect: { skipNextCombat: true, hp: -10 } },
      { text: '正常前进', effect: {} },
    ],
  },
  {
    id: 'psychedelic_mushroom', name: '迷幻蘑菇', desc: '彩色蘑菇释放孢子，现实与幻觉边界模糊。',
    choices: [
      { text: '食用 (+随机药水, 战斗开始可能混乱)', effect: { potion: 1, combatDebuff: 'chaos_hand' } },
      { text: '拒绝', effect: {} },
    ],
  },
  {
    id: 'void_rift', name: '虚空裂隙', desc: '裂隙中涌出腐化，你可以选择接受或净化。',
    choices: [
      { text: '接受腐化 (获得「腐化之心」遗物 +3 张虚空牌)', effect: { addRelic: 'corruption_heart', addCard: 'void_gift', cards: 3 } },
      { text: '净化 (+15 生命)', effect: { heal: 15 } },
    ],
  },
];

/** 许愿井 / 赌局等随机结果池 */
export const WHEEL_OUTCOMES = [
  { text: '星辰眷顾！+100 金币', effect: { gold: 100 } },
  { text: '治疗！+20 生命', effect: { heal: 20 } },
  { text: '腐化！获得深度腐化', effect: { addCurse: 'deep_corruption' } },
  { text: '升级！随机升级一张牌', effect: { upgrade: 1 } },
  { text: '反噬！-10 生命', effect: { hp: -10 } },
  { text: '遗物降临！', effect: { addRelic: 'random' } },
  { text: '卡牌恩赐！', effect: { addCard: 'random' } },
  { text: '药水馈赠！', effect: { potion: 1 } },
];
