/** 敌人定义 — 普通 / 精英 / Boss */
export const ENEMIES = {
  // —— 第一幕 ——
  cultist: { id: 'cultist', name: '邪教徒', act: [1, 2], hp: [46, 52], intents: ['buff', 'attack', 'attack'], attack: [5, 6], buff: { ritual: 3 }, art: '🔮' },
  jaw_worm: { id: 'jaw_worm', name: '颚虫', act: [1], hp: [38, 44], intents: ['attack', 'buff', 'attack_big'], attack: [10, 11], attack_big: [15, 17], buff: { strength: 3 }, art: '🐛' },
  louse: { id: 'louse', name: '虱虫', act: [1], hp: [11, 16], intents: ['attack', 'debuff', 'attack'], attack: [6, 7], debuff: { weak: 1 }, art: '🪲' },
  slime_s: { id: 'slime_s', name: '小史莱姆', act: [1, 2], hp: [12, 15], intents: ['attack', 'debuff', 'attack'], attack: [5, 6], debuff: { frail: 1 }, art: '🟢' },
  slime_m: { id: 'slime_m', name: '中史莱姆', act: [1], hp: [28, 32], intents: ['attack', 'split', 'attack'], attack: [9, 10], split: true, art: '🟩' },
  gremlin: { id: 'gremlin', name: '地精', act: [1, 2], hp: [12, 18], intents: ['attack', 'attack', 'attack'], attack: [4, 6], art: '👺' },
  fungi: { id: 'fungi', name: '真菌兽', act: [1], hp: [22, 28], intents: ['debuff', 'attack', 'buff'], attack: [8, 9], debuff: { weak: 2, frail: 2 }, buff: { strength: 2 }, art: '🍄' },
  spiker: { id: 'spiker', name: '刺球', act: [1, 2], hp: [42, 48], intents: ['attack', 'defend', 'attack_big'], attack: [7, 8], attack_big: [14, 16], defend: [8, 12], art: '🦔' },

  // —— 第二幕 ——
  bandit: { id: 'bandit', name: '强盗', act: [2, 3], hp: [35, 42], intents: ['attack', 'attack', 'debuff'], attack: [9, 11], debuff: { weak: 1 }, art: '🥷' },
  centurion: { id: 'centurion', name: '百夫长', act: [2], hp: [52, 58], intents: ['defend', 'attack', 'attack_big'], attack: [10, 12], attack_big: [16, 18], defend: [10, 14], art: '⚔️' },
  shelled: { id: 'shelled', name: '壳虫', act: [2, 3], hp: [44, 50], intents: ['defend', 'attack', 'debuff'], attack: [12, 14], defend: [15, 18], debuff: { frail: 2 }, art: '🐚' },
  orb_walker: { id: 'orb_walker', name: '圆球行者', act: [2], hp: [90, 96], intents: ['buff', 'attack', 'special_strength'], attack: [10, 12], buff: { strength: 3 }, art: '🔵' },
  chosen: { id: 'chosen', name: '被选者', act: [2, 3], hp: [48, 54], intents: ['debuff', 'attack', 'debuff_big'], attack: [10, 12], debuff: { weak: 2 }, debuff_big: { weak: 3, vulnerable: 3 }, art: '👁️' },
  mystic: { id: 'mystic', name: '秘术师', act: [2, 3], hp: [38, 44], intents: ['heal', 'attack', 'buff'], attack: [8, 10], heal: [10, 14], buff: { strength: 2 }, art: '🧙' },

  // —— 第三幕 ——
  darkling: { id: 'darkling', name: '暗兽', act: [3], hp: [48, 54], intents: ['attack', 'buff', 'attack_big'], attack: [12, 14], attack_big: [18, 20], buff: { strength: 2 }, art: '🌑' },
  spire_shield: { id: 'spire_shield', name: '尖塔盾卫', act: [3], hp: [55, 62], intents: ['defend', 'attack', 'defend_big'], attack: [11, 13], defend: [12, 16], defend_big: [20, 24], art: '🛡️' },
  spire_spear: { id: 'spire_spear', name: '尖塔矛卫', act: [3], hp: [50, 56], intents: ['attack', 'attack', 'attack_big'], attack: [10, 12], attack_big: [20, 22], art: '🔱' },
  repulsor: { id: 'repulsor', name: '排斥者', act: [3], hp: [42, 48], intents: ['debuff', 'attack', 'debuff'], attack: [9, 11], debuff: { frail: 2, weak: 1 }, art: '💫' },

  // —— 精英 ——
  nob: { id: 'nob', name: '怒怒', elite: true, act: [1, 2], hp: [78, 84], intents: ['buff', 'attack_big', 'attack', 'attack_big'], attack: [7, 9], attack_big: [13, 17], buff: { enrage: 2 }, art: '👹' },
  lagavulin: { id: 'lagavulin', name: '乐加维林', elite: true, act: [1, 2], hp: [104, 114], intents: ['sleep', 'debuff', 'attack_big', 'attack_big'], attack_big: [16, 20], debuff: { dexterity_down: 2, strength_down: 1 }, art: '😴' },
  sentry: { id: 'sentry', name: '哨兵', elite: true, act: [1, 2, 3], hp: [38, 42], intents: ['attack', 'debuff', 'attack'], attack: [9, 10], debuff: { weak: 2 }, art: '🗿' },
  gremlin_nob: { id: 'gremlin_nob', name: '地精大块头', elite: true, act: [1], hp: [65, 72], intents: ['attack', 'attack_big', 'buff'], attack: [10, 12], attack_big: [16, 18], buff: { strength: 2 }, art: '🟤' },
  book_of_stabbing: { id: 'book_of_stabbing', name: '刺击之书', elite: true, act: [2, 3], hp: [160, 175], intents: ['attack_multi', 'attack_multi', 'attack_multi_big'], attack_multi: [6, 7], attack_multi_big: [7, 8], multiHits: [4, 5, 6], art: '📕' },
  giant_head: { id: 'giant_head', name: '巨首', elite: true, act: [3], hp: [200, 220], intents: ['buff', 'attack_huge', 'attack_huge'], attack_huge: [30, 40], buff: { strength: 3 }, art: '🗿' },

  // —— Boss ——
  slime_boss: { id: 'slime_boss', name: '史莱姆王', boss: true, act: [1], hp: [140, 150], intents: ['attack', 'split_boss', 'attack_big', 'attack'], attack: [9, 11], attack_big: [16, 18], art: '👑' },
  hexaghost: { id: 'hexaghost', name: '六火', boss: true, act: [2], hp: [250, 260], intents: ['attack', 'special', 'attack_big', 'special_big'], attack: [6, 8], attack_big: [12, 15], special: 'inferno', special_big: 'inferno_big', phase2: 0.5, art: '👻' },
  time_eater: { id: 'time_eater', name: '时间吞噬者', boss: true, act: [3], hp: [480, 500], intents: ['debuff', 'attack', 'attack_big', 'special_time'], attack: [10, 12], attack_big: [18, 22], debuff: { weak: 2, vulnerable: 2 }, special_time: 'drain', phase2: 0.5, art: '⏳' },
};

/** 按幕次与节点类型的遭遇表 */
export const ENCOUNTER_TABLES = {
  1: {
    normal: [
      ['cultist'], ['jaw_worm'], ['louse', 'louse'], ['slime_s', 'slime_s'],
      ['gremlin', 'gremlin'], ['fungi'], ['spiker'], ['slime_m'], ['cultist', 'louse'],
    ],
    elite: [['nob'], ['lagavulin'], ['gremlin_nob'], ['sentry', 'sentry', 'sentry']],
  },
  2: {
    normal: [
      ['bandit', 'bandit'], ['centurion'], ['shelled'], ['chosen'], ['mystic'],
      ['cultist', 'cultist'], ['slime_s', 'slime_s', 'slime_s'], ['spiker', 'gremlin'],
    ],
    elite: [['book_of_stabbing'], ['lagavulin'], ['nob'], ['sentry', 'sentry']],
  },
  3: {
    normal: [
      ['darkling', 'darkling'], ['spire_shield', 'spire_spear'], ['repulsor'], ['chosen', 'mystic'],
      ['bandit', 'bandit', 'bandit'], ['shelled', 'shelled'],
    ],
    elite: [['giant_head'], ['book_of_stabbing'], ['lagavulin'], ['nob']],
  },
};

export const BOSS_BY_ACT = { 1: 'slime_boss', 2: 'hexagoth', 3: 'time_eater' };

// fix typo
BOSS_BY_ACT[2] = 'hexaghost';
