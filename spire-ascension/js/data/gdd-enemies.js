/** GDD 敌人 — 日冕圣殿 / 月影深渊 / 星渊之核 */
export const ENEMIES = {
  // —— 第一幕：日冕圣殿 ——
  sun_acolyte: {
    id: 'sun_acolyte', name: '日冕信徒', element: 'sun', act: [1],
    hp: [42, 48], art: '☀️',
    intents: ['attack_debuff', 'defend', 'special_sun_burst'],
    attack_debuff: [8, 8], debuff: { vulnerable: 1 },
    defend: [12, 12],
    special_sun_burst: { damage: [15, 15], requiresResonance: 2, clearSelfResonance: true },
    onPlayerSunCard: { sunResonance: 1 },
  },
  light_sentinel: {
    id: 'light_sentinel', name: '光辉哨兵', element: 'sun', act: [1],
    hp: [35, 40], art: '🛡️',
    intents: ['buff_ally', 'attack', 'defend'],
    buff_ally: { block: 6, strength: 2 },
    attack: [7, 7], defend: [5, 5],
    soloFallback: { attack: [7, 7], defend: [5, 5] },
  },
  hot_slime: {
    id: 'hot_slime', name: '灼热史莱姆', element: 'void', act: [1],
    hp: [30, 38], art: '🟠',
    intents: ['corruption_discard', 'attack', 'corruption_discard'],
    corruption_discard: { damage: [5, 5], corruption: 1, target: 'discard' },
    attack: [6, 7],
    onDeath: { corruption: 1, target: 'hand' },
  },
  sun_construct: {
    id: 'sun_construct', name: '阳炎构造体', element: 'sun', act: [1],
    hp: [44, 50], art: '⚙️',
    intents: ['defend', 'charge', 'special_beam'],
    defend: [10, 10], charge: { stacks: 1 },
    special_beam: { base: 8, perCharge: 3, consumeCharge: true },
  },
  moon_peeper: {
    id: 'moon_peeper', name: '月影窥视者', element: 'moon', act: [1],
    hp: [32, 38], art: '👁️',
    intents: ['attack_multi', 'buff', 'attack_multi'],
    attack_multi: [7, 7], multiHits: [2, 2, 2],
    buff: { strength: 3 }, buffOnce: true,
  },

  // —— 第一幕精英 ——
  eclipse_knight: {
    id: 'eclipse_knight', name: '日蚀圣骑士', element: 'sun', elite: true, act: [1],
    hp: [85, 90], art: '🌑',
    intents: ['opening_shield', 'attack_big', 'attack', 'attack_big'],
    opening_shield: { block: 30, strength: 3, turns: 3 },
    attack_big: [20, 20], attack: [12, 14],
    shieldBrokenDebuff: { weak: 2, noStrengthGain: 2 },
    attack_bigHalvedIfShield: true,
  },
  star_collector: {
    id: 'star_collector', name: '星尘收集者', element: 'star', elite: true, act: [1],
    hp: [70, 80], art: '✨',
    intents: ['summon_minion', 'charge', 'attack'],
    summon_minion: { id: 'star_dust_minion', hp: 15 },
    charge: { stacks: 1 },
    attack: [8, 10],
    onTurnEndChargeDamage: true,
  },
  star_dust_minion: {
    id: 'star_dust_minion', name: '星尘构造体', element: 'star', act: [1],
    hp: [15, 15], art: '💫', minion: true,
    intents: ['attack'],
    attack: [5, 5],
  },

  // —— 第一幕 Boss ——
  sun_monarch: {
    id: 'sun_monarch', name: '日冕君主', element: 'sun', boss: true, act: [1],
    hp: [220, 220], art: '👑',
    intents: ['attack_defend', 'buff', 'summon_minion', 'attack_defend'],
    attack_defend: { attack: [12, 12], defend: [8, 8] },
    buff: { defend: [15, 15], strength: 2 },
    summon_minion: { id: 'sun_acolyte_minion', hp: 30 },
    phase2: 0.5,
    phase2Intents: ['attack_judgment'],
    attack_judgment: { damage: [35, 35], ignoreBlock: true, every: 3 },
    passive: { sunResonancePerTurn: 1, bonusEnergyAt5: 2 },
  },
  sun_acolyte_minion: {
    id: 'sun_acolyte_minion', name: '日冕信徒', element: 'sun', act: [1],
    hp: [30, 30], art: '☀️', minion: true,
    intents: ['attack'],
    attack: [6, 8],
  },

  // —— 第二幕：月影深渊 ——
  moon_wolf: {
    id: 'moon_wolf', name: '月影狼', element: 'moon', act: [2],
    hp: [40, 48], art: '🐺',
    intents: ['attack_multi', 'attack_multi', 'special_howl'],
    attack_multi: [7, 7], multiHits: [2, 2, 2],
    special_howl: { buffAll: { strength: 3 }, afterAttacks: 3 },
  },
  shadow_mage: {
    id: 'shadow_mage', name: '暗影法师', element: 'moon', act: [2],
    hp: [38, 45], art: '🌙',
    intents: ['attack_debuff', 'buff_ally', 'attack_debuff'],
    attack_debuff: [9, 9], debuff: { weak: 1 },
    buff_ally: { block: 12, dexterity: 2 },
  },
  void_lurker: {
    id: 'void_lurker', name: '虚空潜伏者', element: 'void', act: [2],
    hp: [35, 42], art: '🦑',
    intents: ['corruption_hand', 'attack', 'corruption_hand'],
    corruption_hand: { damage: [6, 6], corruption: 1 },
    attack: [8, 9],
    enrageAtHalf: { doubleAttack: true },
  },
  crescent_priest: {
    id: 'crescent_priest', name: '弦月祭司', element: 'moon', act: [2],
    hp: [42, 50], art: '🌒',
    intents: ['clear_resonance', 'attack', 'buff'],
    clear_resonance: { buffAll: { strength: 4 } },
    attack: [10, 12],
    buff: { strength: 2 },
    cooldown: { clear_resonance: 2 },
  },
  star_construct: {
    id: 'star_construct', name: '星尘构造体', element: 'star', act: [2],
    hp: [44, 55], art: '🔷',
    intents: ['charge', 'defend', 'special_nova'],
    charge: { stacks: 8 },
    defend: [8, 10],
    special_nova: { perCharge: 2, consumeCharge: true },
    interrupt: { damage: 15, stun: 1 },
  },

  // —— 第二幕精英 ——
  twin_moon_striker: {
    id: 'twin_moon_striker', name: '月影双子·刃', element: 'moon', elite: true, act: [2],
    hp: [65, 65], art: '🌓', linked: 'twin_moon_supporter',
    intents: ['attack_multi', 'attack_multi', 'attack_multi'],
    attack_multi: [6, 6], multiHits: [3, 3, 3],
    enrageOnPartnerDeath: { strength: 4 },
    damageLink: 0.5,
  },
  twin_moon_supporter: {
    id: 'twin_moon_supporter', name: '月影双子·幕', element: 'moon', elite: true, act: [2],
    hp: [65, 65], art: '🌔', linked: 'twin_moon_striker',
    intents: ['buff_ally', 'defend', 'buff_ally'],
    buff_ally: { block: 15, strength: 2 },
    defend: [10, 12],
    damageLink: 0.5,
  },
  void_amalgam: {
    id: 'void_amalgam', name: '虚空聚合体', element: 'void', elite: true, act: [2],
    hp: [80, 80], art: '🌀',
    intents: ['corruption_discard', 'attack_discard', 'corruption_discard'],
    corruption_discard: { count: 2, target: 'discard' },
    attack_discard: { damage: [12, 12], discardRandom: 1 },
    healFromCorruption: { perCard: 5, threshold: 0.3 },
  },

  // —— 第二幕 Boss ——
  eclipse_witch: {
    id: 'eclipse_witch', name: '月蚀魔女', element: 'moon', boss: true, act: [2],
    hp: [250, 250], art: '🌘',
    intents: ['form_attack', 'form_attack', 'summon_minion'],
    newMoon: { dexterity: 4, attack_multi: [8, 8], hits: 2 },
    fullMoon: { strength: 4, attack_big: [22, 22] },
    formCycle: 2,
    phase2: 0.5,
    phase2FormEveryTurn: true,
    summon_minion: { id: 'eclipse_phantom', hp: 40, inheritForm: 0.5 },
    passive: { drawOnMoonResonance3: 1 },
  },
  eclipse_phantom: {
    id: 'eclipse_phantom', name: '月蚀幻影', element: 'moon', act: [2],
    hp: [40, 40], art: '👤', minion: true,
    intents: ['attack'],
    attack: [8, 10],
  },

  // —— 第三幕：星渊之核 ——
  star_colossus: {
    id: 'star_colossus', name: '星尘巨像', element: 'star', act: [3],
    hp: [55, 65], art: '🗿',
    intents: ['charge', 'defend', 'special_shockwave'],
    charge: { stacks: 1, max: 3 },
    defend: [12, 14],
    special_shockwave: { damage: [15, 15], aoe: true },
    interrupt: { stun: 1, damage: 15 },
  },
  void_mutant: {
    id: 'void_mutant', name: '虚空畸变体', element: 'void', act: [3],
    hp: [45, 52], art: '🧬',
    intents: ['corruption_hand', 'attack', 'corruption_hand'],
    corruption_hand: { damage: [8, 9], corruption: 1 },
    attack: [10, 11],
    onDeath: { corruption: 3, target: 'hand' },
  },
  star_oracle: {
    id: 'star_oracle', name: '星辰预言者', element: 'star', act: [3],
    hp: [40, 48], art: '🔮',
    intents: ['special_forecast', 'buff', 'attack'],
    special_forecast: { peekHand: true, damageMultiplier: 3 },
    buff: { chargeAll: 3 },
    attack: [8, 10],
  },
  sun_remnant: {
    id: 'sun_remnant', name: '日冕残余', element: 'sun', act: [3],
    hp: [50, 58], art: '🔥',
    intents: ['attack', 'buff', 'special_sun_burst'],
    attack: [12, 12],
    buff: { sunResonance: 2 },
    special_sun_burst: { damage: [18, 18], requiresResonance: 3 },
  },
  hybrid_mutant: {
    id: 'hybrid_mutant', name: '混合畸变体', element: 'void', act: [3],
    hp: [60, 60], art: '🔀',
    intents: ['clear_resonance', 'attack', 'attack'],
    clear_resonance: { randomElement: ['sun', 'moon', 'star'] },
    attack: [9, 11],
    elementRotate: ['sun', 'moon', 'star'],
  },

  // —— 第三幕精英 ——
  triple_trial_sun: {
    id: 'triple_trial_sun', name: '试炼·日', element: 'sun', elite: true, act: [3],
    hp: [55, 55], art: '☀️', trialLink: true,
    intents: ['attack', 'attack_big', 'attack'],
    attack: [10, 12], attack_big: [16, 18],
    onAllyKilled: { buffOthers: { strength: 3 } },
    sharedResonance: true,
  },
  triple_trial_moon: {
    id: 'triple_trial_moon', name: '试炼·月', element: 'moon', elite: true, act: [3],
    hp: [55, 55], art: '🌙', trialLink: true,
    intents: ['attack_multi', 'debuff', 'attack_multi'],
    attack_multi: [6, 7], multiHits: [2, 2, 2],
    debuff: { weak: 2 },
    onAllyKilled: { buffOthers: { strength: 3 } },
    sharedResonance: true,
    resonanceCombo: { at: 5, damage: [30, 30] },
  },
  triple_trial_star: {
    id: 'triple_trial_star', name: '试炼·星', element: 'star', elite: true, act: [3],
    hp: [55, 55], art: '⭐', trialLink: true,
    intents: ['charge', 'attack', 'special_beam'],
    charge: { stacks: 1 },
    attack: [9, 11],
    special_beam: { base: 6, perCharge: 4, consumeCharge: true },
    onAllyKilled: { buffOthers: { strength: 3 } },
    sharedResonance: true,
  },
  corruption_lord: {
    id: 'corruption_lord', name: '腐化君主', element: 'void', elite: true, act: [3],
    hp: [95, 95], art: '👿',
    intents: ['corruption_hand', 'attack_heal', 'corruption_hand'],
    corruption_hand: { card: 'deep_corruption', count: 1 },
    attack_heal: { damage: [14, 14], heal: [7, 7] },
    deep_corruption: { unplayable: true, hpLossEndTurn: 5 },
  },

  // —— 第三幕 Boss ——
  abyss_core: {
    id: 'abyss_core', name: '星渊之核', element: 'void', boss: true, act: [3],
    hp: [300, 300], art: '💠', phases: 3,
    // 阶段一：壳 (120 HP)
    intents: ['defend', 'attack', 'charge'],
    defend: [20, 20],
    attack: [8, 8],
    charge: { stacks: 3 },
    special_beam: { base: 8, perCharge: 3 },
    phaseThresholds: [0.6, 0.27], // 120 shell → 100 core → 80 heart
    phase2: 0.6,
    phase2Intents: ['debuff', 'special_drain', 'attack'],
    void_corruption: { stacks: 1, hpLossPerTurn: 2 },
    special_drain: { perCharge: true },
    phase3: 0.27,
    phase3Intents: ['attack_multi', 'attack_multi', 'attack_multi'],
    phase3Attack: [7, 7], phase3Hits: 3,
    healOnVoidCard: 5,
  },
};

/** 按幕次与节点类型的遭遇表 */
export const ENCOUNTER_TABLES = {
  1: {
    normal: [
      ['sun_acolyte'],
      ['light_sentinel'],
      ['hot_slime'],
      ['sun_construct'],
      ['moon_peeper'],
      ['sun_acolyte', 'hot_slime'],
      ['light_sentinel', 'moon_peeper'],
      ['hot_slime', 'hot_slime'],
      ['sun_construct', 'sun_acolyte'],
    ],
    elite: [
      ['eclipse_knight'],
      ['star_collector'],
    ],
  },
  2: {
    normal: [
      ['moon_wolf'],
      ['shadow_mage'],
      ['void_lurker'],
      ['crescent_priest'],
      ['star_construct'],
      ['moon_wolf', 'shadow_mage'],
      ['void_lurker', 'void_lurker'],
      ['crescent_priest', 'star_construct'],
      ['shadow_mage', 'moon_wolf'],
    ],
    elite: [
      ['twin_moon_striker', 'twin_moon_supporter'],
      ['void_amalgam'],
    ],
  },
  3: {
    normal: [
      ['star_colossus'],
      ['void_mutant'],
      ['star_oracle'],
      ['sun_remnant'],
      ['hybrid_mutant'],
      ['void_mutant', 'void_mutant'],
      ['star_colossus', 'star_oracle'],
      ['sun_remnant', 'hybrid_mutant'],
      ['star_oracle', 'void_mutant'],
    ],
    elite: [
      ['triple_trial_sun', 'triple_trial_moon', 'triple_trial_star'],
      ['corruption_lord'],
    ],
  },
};

export const BOSS_BY_ACT = { 1: 'sun_monarch', 2: 'eclipse_witch', 3: 'abyss_core' };
