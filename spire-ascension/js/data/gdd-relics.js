/** GDD 遗物 — 100 件 + 4 职业起始 */
export const RELICS = {
  // —— 职业起始 ——
  sun_emblem: {
    id: 'sun_emblem', name: '日轮纹章', icon: '☀️', rarity: 'starter', class: 'iron_warrior',
    desc: '每场战斗第一次日耀共鸣达到3层时，获得3点护盾。',
    onResonanceChange: { sun: { firstReach: 3, block: 3, once: true } },
  },
  moon_hourglass: {
    id: 'moon_hourglass', name: '月影沙漏', icon: '🌙', rarity: 'starter', class: 'shadow_rogue',
    desc: '每当你跨系触发共鸣奖励获得能量时，抽1张牌。',
    onCrossResonance: { draw: 1 },
  },
  star_core: {
    id: 'star_core', name: '星核碎片', icon: '⭐', rarity: 'starter', class: 'arcane_mage',
    desc: '每当你充能层数达到5时，获得1点能量。',
    onResonanceChange: { burstCharge: { reach: 5, energy: 1 } },
  },
  void_seal: {
    id: 'void_seal', name: '腐化印记', icon: '🜏', rarity: 'starter', class: 'blood_hunter',
    desc: '战斗开始时，将2张「腐化印记」洗入抽牌堆。',
    onCombatStart: { shuffleCorruption: 2 },
  },

  // —— 普通（36） ——
  sun_shard: {
    id: 'sun_shard', name: '日之碎片', icon: '🔆', rarity: 'common',
    desc: '日耀共鸣首次达到2层时，获得1点能量。',
    onResonanceChange: { sun: { firstReach: 2, energy: 1, once: true } },
  },
  moon_shard: {
    id: 'moon_shard', name: '月之碎片', icon: '🌙', rarity: 'common',
    desc: '月影共鸣首次达到2层时，抽1张牌。',
    onResonanceChange: { moon: { firstReach: 2, draw: 1, once: true } },
  },
  star_shard: {
    id: 'star_shard', name: '星之碎片', icon: '✨', rarity: 'common',
    desc: '星尘共鸣首次达到2层时，充能2层。',
    onResonanceChange: { star: { firstReach: 2, burstCharge: 2, once: true } },
  },
  resonance_compass: {
    id: 'resonance_compass', name: '共鸣罗盘', icon: '🧭', rarity: 'common',
    desc: '每场战斗开始获得1层随机星辰共鸣。',
    onCombatStart: { randomResonance: 1 },
  },
  star_charm: {
    id: 'star_charm', name: '星辰护符', icon: '📿', rarity: 'common',
    desc: '每当你跨系触发共鸣奖励，获得2护盾。',
    onCrossResonance: { block: 2 },
  },
  energy_crystal: {
    id: 'energy_crystal', name: '能量水晶', icon: '💎', rarity: 'common',
    desc: '每场战斗第一次能量为0时，获得1能量。',
    onTurnEnd: { energyZero: { energy: 1, once: true } },
  },
  lucky_coin: {
    id: 'lucky_coin', name: '幸运硬币', icon: '🪙', rarity: 'common',
    desc: '战斗奖励金币+20%。', goldBonus: 0.2,
  },
  ancient_map: {
    id: 'ancient_map', name: '古旧地图', icon: '🗺️', rarity: 'common',
    desc: '精英敌人显示在路线图上。', revealElites: true,
  },
  merchant_ledger: {
    id: 'merchant_ledger', name: '商人账本', icon: '📒', rarity: 'common',
    desc: '所有商人出售价格降低10%。', shopDiscount: 0.1,
  },
  potion_belt: {
    id: 'potion_belt', name: '药水腰带', icon: '🧴', rarity: 'common',
    desc: '药水携带上限+1。', maxPotions: 1,
  },
  iron_caltrop: {
    id: 'iron_caltrop', name: '铁蒺藜', icon: '⚙️', rarity: 'common',
    desc: '回合结束，若有剩余能量，获得2护盾。',
    onTurnEnd: { ifEnergyLeft: { block: 2 } },
  },
  whetstone: {
    id: 'whetstone', name: '磨刀石', icon: '🗡️', rarity: 'common',
    desc: '战斗开始时，手牌中随机一张攻击牌伤害+5（本场）。',
    onCombatStart: { buffRandomHand: { type: 'attack', damage: 5 } },
  },
  armor_plate: {
    id: 'armor_plate', name: '护甲片', icon: '🛡️', rarity: 'common',
    desc: '战斗开始时，手牌中随机一张技能牌护盾+4（本场）。',
    onCombatStart: { buffRandomHand: { type: 'skill', block: 4 } },
  },
  birdcage: {
    id: 'birdcage', name: '鸟笼', icon: '🐦', rarity: 'common',
    desc: '弃牌堆空时，获得1点能量。',
    onDiscardEmpty: { energy: 1 },
  },
  smile_badge: {
    id: 'smile_badge', name: '笑脸徽章', icon: '😊', rarity: 'common',
    desc: '精英战胜利后回复10生命。',
    onCombatEnd: { ifElite: { heal: 10 } },
  },
  cursed_key: {
    id: 'cursed_key', name: '诅咒钥匙', icon: '🗝️', rarity: 'common',
    desc: '可打开任意宝箱，获得额外奖励，但获得一张诅咒。',
    onChest: { extraLoot: true, addCurse: 1 },
  },
  jester_cap: {
    id: 'jester_cap', name: '小丑帽', icon: '🃏', rarity: 'common',
    desc: '手牌上限+2。', handSize: 2,
  },
  quill_pen: {
    id: 'quill_pen', name: '羽毛笔', icon: '🪶', rarity: 'common',
    desc: '休息点锻造费用减半（若需花生命，则减免5）。',
    restForgeDiscount: 0.5, restForgeHpReduce: 5,
  },
  marble_bag: {
    id: 'marble_bag', name: '弹珠袋', icon: '🎱', rarity: 'common',
    desc: '获得护盾时，额外+1。',
    onBlockGain: { bonus: 1 },
  },
  obsidian: {
    id: 'obsidian', name: '黑曜石', icon: '🪨', rarity: 'common',
    desc: '造成伤害时，若敌人易伤，伤害+2。',
    onDamageDealt: { ifTargetVulnerable: { bonus: 2 } },
  },
  nightmare_dust: {
    id: 'nightmare_dust', name: '梦魇之尘', icon: '💨', rarity: 'common',
    desc: '每当你获得腐化印记，抽1张牌（每回合限1）。',
    onCorruptionGain: { draw: 1, capPerTurn: 1 },
  },
  life_spring: {
    id: 'life_spring', name: '生命之泉', icon: '💧', rarity: 'common',
    desc: '每层开始时回复5生命。',
    onFloorStart: { heal: 5 },
  },
  ancient_scale: {
    id: 'ancient_scale', name: '古老的刻度', icon: '⚖️', rarity: 'common',
    desc: '时间类效果+1回合。', durationBonus: 1,
  },
  decoy_doll: {
    id: 'decoy_doll', name: '替身人偶', icon: '🪆', rarity: 'common',
    desc: '受到大于15的伤害时，减少5点。',
    onDamageTaken: { ifAbove: 15, reduce: 5 },
  },
  tactical_manual: {
    id: 'tactical_manual', name: '战术手册', icon: '📖', rarity: 'common',
    desc: '战斗开始时，选择一张手牌并使其本场费用-1（永久）。',
    onCombatStart: { chooseHandCostReduce: 1 },
  },
  resonance_amplifier: {
    id: 'resonance_amplifier', name: '共鸣增幅器', icon: '📡', rarity: 'common',
    desc: '初始共鸣层数不再为0，而是日/月/星各1。',
    onCombatStart: { resonance: { sun: 1, moon: 1, star: 1 } },
  },
  charge_conduit: {
    id: 'charge_conduit', name: '充能导管', icon: '🔌', rarity: 'common',
    desc: '你的充能上限+3。', burstChargeMaxBonus: 3,
  },
  void_filter: {
    id: 'void_filter', name: '虚空滤网', icon: '🕸️', rarity: 'common',
    desc: '虚空牌中断共鸣时，只减少1层层数（而非全部减1）。',
    onVoidCard: { resonanceLoss: 1 },
  },
  star_resonator: {
    id: 'star_resonator', name: '星辰共鸣器', icon: '🛰️', rarity: 'common',
    desc: '每场战斗第一次共鸣达到3层时，额外充能1次爆发技能。',
    onResonanceChange: { any: { firstReach: 3, burstCharge: 1, once: true } },
  },
  backup_power: {
    id: 'backup_power', name: '备用电源', icon: '🔋', rarity: 'common',
    desc: '每场战斗第一次打出X费牌时，获得X点护盾。',
    onCardPlayed: { firstXCost: { blockEqualsCost: true, once: true } },
  },
  time_sandglass: {
    id: 'time_sandglass', name: '时光沙漏', icon: '⏳', rarity: 'common',
    desc: '每当你消耗牌时，获得1点护盾。',
    onExhaust: { block: 1 },
  },
  reverse_clock: {
    id: 'reverse_clock', name: '倒流之钟', icon: '🕰️', rarity: 'common',
    desc: '抽牌堆空时，将弃牌堆洗入抽牌堆并抽1张牌（每场战斗一次）。',
    onDrawPileEmpty: { reshuffleDraw: 1, once: true },
  },
  fool_stone: {
    id: 'fool_stone', name: '愚者之石', icon: '🃏', rarity: 'common',
    desc: '开场抽牌+1，但回合结束失去1生命。',
    onCombatStart: { draw: 1 }, onTurnEnd: { hpLoss: 1 },
  },
  treasure_hunter: {
    id: 'treasure_hunter', name: '寻宝猎人', icon: '🏹', rarity: 'common',
    desc: '非Boss战斗有10%几率额外掉落遗物。',
    onCombatEnd: { ifNotBoss: { extraRelicChance: 0.1 } },
  },
  copy_scroll: {
    id: 'copy_scroll', name: '复制卷轴', icon: '📜', rarity: 'common',
    desc: '首次进入商店，可免费复制一张非稀有卡牌。',
    onFirstShop: { copyCard: { maxRarity: 'uncommon' } },
  },
  resonance_stabilizer: {
    id: 'resonance_stabilizer', name: '共鸣稳定器', icon: '🔒', rarity: 'common',
    desc: '跨系切换时，原共鸣层数减少值由1变为0（仅限一次，每场战斗重置）。',
    onCrossResonance: { noResonanceLoss: { oncePerCombat: true } },
  },

  // —— 罕见（30） ——
  crescent_ring: {
    id: 'crescent_ring', name: '三日月之戒', icon: '💍', rarity: 'uncommon',
    desc: '你的共鸣层数首次达到3时，额外获得1点能量。',
    onResonanceChange: { any: { firstReach: 3, energy: 1, once: true } },
  },
  stardust_hourglass: {
    id: 'stardust_hourglass', name: '星尘沙漏', icon: '⌛', rarity: 'uncommon',
    desc: '跨系触发奖励获得能量时，抽1张牌。',
    onCrossResonance: { ifEnergyReward: { draw: 1 } },
  },
  balance_stone: {
    id: 'balance_stone', name: '均衡之石', icon: '⚖️', rarity: 'uncommon',
    desc: '初始能量+1，但回合结束时若没有任何共鸣层数，失去2生命。',
    maxEnergy: 1, onTurnEnd: { ifNoResonance: { hpLoss: 2 } },
  },
  sun_amulet: {
    id: 'sun_amulet', name: '日轮护符', icon: '☀️', rarity: 'uncommon',
    desc: '日耀共鸣≥4时，获得2点力量（每场战斗限1）。',
    onResonanceChange: { sun: { atLeast: 4, strength: 2, once: true } },
  },
  moon_mask: {
    id: 'moon_mask', name: '月影面具', icon: '🎭', rarity: 'uncommon',
    desc: '月影共鸣≥4时，闪避下一次攻击（每场限1）。',
    onResonanceChange: { moon: { atLeast: 4, dodgeNext: 1, once: true } },
  },
  star_core_crystal: {
    id: 'star_core_crystal', name: '星核结晶', icon: '💠', rarity: 'uncommon',
    desc: '星尘共鸣≥4时，充能5层。',
    onResonanceChange: { star: { atLeast: 4, burstCharge: 5, once: true } },
  },
  corruption_heart: {
    id: 'corruption_heart', name: '腐化之心', icon: '💔', rarity: 'uncommon',
    desc: '每获得一张腐化印记，获得1力量。',
    onCorruptionGain: { strength: 1 },
  },
  overload_core: {
    id: 'overload_core', name: '超载核心', icon: '⚡', rarity: 'uncommon',
    desc: '超载牌造成的自伤减半。', overloadSelfDamageMult: 0.5,
  },
  resonance_hammer: {
    id: 'resonance_hammer', name: '共鸣之锤', icon: '🔨', rarity: 'uncommon',
    desc: '每打出10张相同属性牌，升级手中一张随机牌（每场限1）。',
    onCardPlayed: { sameElementStreak: { at: 10, upgradeRandomHand: 1, once: true } },
  },
  blood_grail: {
    id: 'blood_grail', name: '鲜血圣杯', icon: '🏆', rarity: 'uncommon',
    desc: '战斗结束时若生命低于30%，回复到50%。',
    onCombatEnd: { ifHpBelow: 0.3, healToPercent: 0.5 },
  },
  mana_spring: {
    id: 'mana_spring', name: '魔力泉涌', icon: '🌊', rarity: 'uncommon',
    desc: '能力牌耗能-1（最低0）。', powerCostReduce: 1,
  },
  overload_shield: {
    id: 'overload_shield', name: '过载护盾', icon: '🛡️', rarity: 'uncommon',
    desc: '每当你受到超载伤害，获得等量护盾。',
    onOverloadDamage: { blockEqualsDamage: true },
  },
  void_converter: {
    id: 'void_converter', name: '虚空转换器', icon: '🔄', rarity: 'uncommon',
    desc: '虚空牌有50%几率不中断共鸣。',
    onVoidCard: { skipResonanceBreakChance: 0.5 },
  },
  agility_boots: {
    id: 'agility_boots', name: '敏捷之靴', icon: '👢', rarity: 'uncommon',
    desc: '每打出一张牌，获得1点敏捷（下回合消失）。',
    onCardPlayed: { dexterityTemp: 1 },
  },
  power_gloves: {
    id: 'power_gloves', name: '力量手套', icon: '🥊', rarity: 'uncommon',
    desc: '每打出一张攻击牌，获得1点力量（下回合消失）。',
    onCardPlayed: { ifAttack: { strengthTemp: 1 } },
  },
  thorn_crown: {
    id: 'thorn_crown', name: '荆棘王冠', icon: '👑', rarity: 'uncommon',
    desc: '每受到攻击，造成3点伤害。',
    onDamageTaken: { thorns: 3 },
  },
  frost_charm: {
    id: 'frost_charm', name: '冰霜护符', icon: '❄️', rarity: 'uncommon',
    desc: '回合开始，获得3点护盾。',
    onTurnStart: { block: 3 },
  },
  spell_counter: {
    id: 'spell_counter', name: '法术反制', icon: '🛡️', rarity: 'uncommon',
    desc: '每场战斗首次受到减益时，无效化。',
    onDebuffApplied: { negate: true, once: true },
  },
  holy_cross: {
    id: 'holy_cross', name: '圣光十字架', icon: '✝️', rarity: 'uncommon',
    desc: '每场战斗首次死亡，复活回复30%生命。',
    onFatal: { revivePercent: 0.3, once: true },
  },
  double_resonance: {
    id: 'double_resonance', name: '双倍共鸣', icon: '✖️', rarity: 'uncommon',
    desc: '你的共鸣层数获取翻倍（上限不变）。', resonanceGainMult: 2,
  },
  burst_charge_mod: {
    id: 'burst_charge_mod', name: '共鸣爆发充能', icon: '💥', rarity: 'uncommon',
    desc: '共鸣爆发所需层数降为4。', burstChargeRequired: 4,
  },
  gilded_dice: {
    id: 'gilded_dice', name: '镀金骰子', icon: '🎲', rarity: 'uncommon',
    desc: '事件选项成功率翻倍。', eventSuccessMult: 2,
  },
  memory_alloy: {
    id: 'memory_alloy', name: '记忆合金', icon: '🔗', rarity: 'uncommon',
    desc: '回合结束可保留2张手牌。', retainHand: 2,
  },
  eclipse_eye: {
    id: 'eclipse_eye', name: '日蚀之眼', icon: '👁️', rarity: 'uncommon',
    desc: '每当你造成易伤，额外施加1层。',
    onDebuffDealt: { ifVulnerable: { extraStacks: 1 } },
  },
  moon_eclipse_tear: {
    id: 'moon_eclipse_tear', name: '月蚀之泪', icon: '💧', rarity: 'uncommon',
    desc: '每当你造成虚弱，持续回合+1。',
    onDebuffDealt: { ifWeak: { durationBonus: 1 } },
  },
  stardust_mark: {
    id: 'stardust_mark', name: '星尘标记', icon: '✴️', rarity: 'uncommon',
    desc: '充能达到10时，获得1点能量。',
    onResonanceChange: { burstCharge: { reach: 10, energy: 1 } },
  },
  void_stomach: {
    id: 'void_stomach', name: '虚空之胃', icon: '🫀', rarity: 'uncommon',
    desc: '消耗腐化印记时回复2生命。',
    onCorruptionExhaust: { heal: 2 },
  },
  resonance_storm: {
    id: 'resonance_storm', name: '共鸣风暴', icon: '🌪️', rarity: 'uncommon',
    desc: '当你释放共鸣爆发时，造成10点群体伤害。',
    onBurstRelease: { aoeDamage: 10 },
  },
  time_flute: {
    id: 'time_flute', name: '时之笛', icon: '🎵', rarity: 'uncommon',
    desc: '回合数每达到5的倍数，获得1点能量。',
    onTurnStart: { everyNthTurn: { n: 5, energy: 1 } },
  },
  all_in: {
    id: 'all_in', name: '乾坤一掷', icon: '💰', rarity: 'uncommon',
    desc: '获得200金币，但无法再获得金币。',
    onObtain: { gold: 200 }, noGoldGain: true,
  },

  // —— 稀有（24） ——
  eternal_sun: {
    id: 'eternal_sun', name: '永恒日轮', icon: '🌞', rarity: 'rare',
    desc: '日耀共鸣层数不再下降，但每回合开始日耀-1。',
    resonanceNoDecay: { sun: true }, onTurnStart: { sunResonance: -1 },
  },
  eternal_moon: {
    id: 'eternal_moon', name: '永恒月轮', icon: '🌕', rarity: 'rare',
    desc: '月影共鸣层数不再下降，但每回合开始月影-1。',
    resonanceNoDecay: { moon: true }, onTurnStart: { moonResonance: -1 },
  },
  eternal_star: {
    id: 'eternal_star', name: '永恒星轮', icon: '🌟', rarity: 'rare',
    desc: '星尘共鸣层数不再下降，但每回合开始星尘-1。',
    resonanceNoDecay: { star: true }, onTurnStart: { starResonance: -1 },
  },
  void_suppressor: {
    id: 'void_suppressor', name: '虚空抑制器', icon: '🚫', rarity: 'rare',
    desc: '虚空牌不再中断共鸣序列，战斗结束后失去5生命。',
    voidNoResonanceBreak: true, onCombatEnd: { hpLoss: 5 },
  },
  primal_star: {
    id: 'primal_star', name: '原初之星', icon: '⭐', rarity: 'rare',
    desc: '星辰共鸣奖励触发时，改为获得2点临时能量。',
    onCrossResonance: { tempEnergy: 2 },
  },
  chaos_eye: {
    id: 'chaos_eye', name: '混沌之眼', icon: '👁‍🗨', rarity: 'rare',
    desc: '战斗塔罗可额外选择一张，但敌人力量+2。',
    extraBattleTarot: 1, onCombatStart: { buffAllEnemies: { strength: 2 } },
  },
  fate_wheel: {
    id: 'fate_wheel', name: '命运之轮盘', icon: '🎡', rarity: 'rare',
    desc: '每场战斗开始随机获得一个战斗塔罗效果。',
    onCombatStart: { randomBattleTarot: 1 },
  },
  time_bracelet: {
    id: 'time_bracelet', name: '时光之镯', icon: '⌚', rarity: 'rare',
    desc: '回合开始额外抽1张牌，但手牌上限-2。',
    onTurnStart: { draw: 1 }, handSize: -2,
  },
  energy_cube: {
    id: 'energy_cube', name: '能量魔方', icon: '🧊', rarity: 'rare',
    desc: '最大能量+1。', maxEnergy: 1,
  },
  cursed_blade: {
    id: 'cursed_blade', name: '诅咒之刃', icon: '🗡️', rarity: 'rare',
    desc: '所有攻击伤害翻倍，但回合结束失去2生命。',
    attackDamageMult: 2, onTurnEnd: { hpLoss: 2 },
  },
  holy_grail: {
    id: 'holy_grail', name: '圣杯', icon: '🏆', rarity: 'rare',
    desc: '战斗获胜回复全部生命。',
    onCombatEnd: { ifVictory: { healFull: true } },
  },
  demon_heart: {
    id: 'demon_heart', name: '恶魔心脏', icon: '❤️‍🔥', rarity: 'rare',
    desc: '力量+3，但每回合结束失去1生命。',
    onCombatStart: { buff: { strength: 3 } }, onTurnEnd: { hpLoss: 1 },
  },
  angel_feather: {
    id: 'angel_feather', name: '天使羽毛', icon: '🪶', rarity: 'rare',
    desc: '敏捷+3，但最大生命-10。',
    onObtain: { maxHp: -10 }, onCombatStart: { buff: { dexterity: 3 } },
  },
  philosopher_stone: {
    id: 'philosopher_stone', name: '贤者之石', icon: '⚗️', rarity: 'rare',
    desc: '所有卡牌费用-1（最低0），但所有敌人生命+25%。',
    cardCostReduce: 1, enemyHpMult: 1.25,
  },
  book_of_dead: {
    id: 'book_of_dead', name: '死者之书', icon: '📕', rarity: 'rare',
    desc: '每场战斗可消耗任意卡牌，将其永久变为「灵魂」（0费，造成10点伤害，消耗）。',
    onCombatStart: { soulTransformCharges: 99 },
    soulCard: { cost: 0, damage: 10, exhaust: true },
  },
  resonance_fusion: {
    id: 'resonance_fusion', name: '共鸣融合', icon: '🔮', rarity: 'rare',
    desc: '日、月、星共鸣层数共享（取最高者，各系仍独立计算效果）。',
    sharedResonanceDisplay: true,
  },
  supernova_model: {
    id: 'supernova_model', name: '超新星模型', icon: '💫', rarity: 'rare',
    desc: '共鸣爆发伤害和治疗效果翻倍。',
    burstEffectMult: 2,
  },
  tarot_box: {
    id: 'tarot_box', name: '塔罗之匣', icon: '🎴', rarity: 'rare',
    desc: '环境塔罗可选择2张，效果叠加但均为75%。',
    extraEnvTarot: 1, envTarotEffectMult: 0.75,
  },
  void_core: {
    id: 'void_core', name: '虚空之核', icon: '🕳️', rarity: 'rare',
    desc: '每获得一张腐化印记，抽1张牌并无视手牌上限（限5张）。',
    onCorruptionGain: { draw: 1, ignoreHandLimit: 5 },
  },
  evolution_star: {
    id: 'evolution_star', name: '进化之星', icon: '🧬', rarity: 'rare',
    desc: '所有非稀有卡牌在战斗开始时随机升级（整场战斗），但你只能选择2张战斗塔罗且效果减半。',
    onCombatStart: { upgradeNonRareDeck: true },
    battleTarotLimit: 2, battleTarotEffectMult: 0.5,
  },
  tri_god_amulet: {
    id: 'tri_god_amulet', name: '三神护符', icon: '📿', rarity: 'rare',
    desc: '根据最高共鸣属性，每回合获得对应：力量、敏捷、充能3。',
    onTurnStart: { highestResonanceBonus: { sun: { strength: 1 }, moon: { dexterity: 1 }, star: { burstCharge: 3 } } },
  },
  legendary_flask: {
    id: 'legendary_flask', name: '传奇之壶', icon: '🍶', rarity: 'rare',
    desc: '获得1瓶传奇星辰药水（立即使用，获得强效增益）。',
    onObtain: { useLegendaryPotion: true },
  },
  memory_erase: {
    id: 'memory_erase', name: '记忆删除', icon: '🧠', rarity: 'rare',
    desc: '可遗忘至多3张牌（从牌组移除）。',
    onObtain: { removeCards: 3 },
  },
  omniscient_eye: {
    id: 'omniscient_eye', name: '全知之眼', icon: '👁', rarity: 'rare',
    desc: '所有敌人意图数值精确显示，且你永远先攻。',
    preciseIntents: true, alwaysFirstTurn: true,
  },

  // —— Boss（10） ——
  solar_crown: {
    id: 'solar_crown', name: '日冕王冠', icon: '👑', rarity: 'boss',
    desc: '每场战斗开始时，日耀共鸣直接变为3。',
    onCombatStart: { resonance: { sun: 3 } },
  },
  eclipse_heart: {
    id: 'eclipse_heart', name: '月蚀之心', icon: '🖤', rarity: 'boss',
    desc: '回合开始，若月影共鸣≥3，获得2点能量。',
    onTurnStart: { ifMoonResonance: { atLeast: 3, energy: 2 } },
  },
  abyss_core_relic: {
    id: 'abyss_core_relic', name: '星渊之核', icon: '💠', rarity: 'boss',
    desc: '充能不再有上限，且每层充能使攻击伤害+1（无上限）。',
    burstChargeMaxBonus: 999, onCardPlayed: { ifAttack: { damagePerBurstCharge: 1 } },
  },
  void_egg: {
    id: 'void_egg', name: '虚空之卵', icon: '🥚', rarity: 'boss',
    desc: '每回合开始，将2张「虚空恩赐」加入手牌，但所有敌人力量+1。',
    onTurnStart: { addCards: { void_gift: 2 } },
    onCombatStart: { buffAllEnemies: { strength: 1 } },
    void_gift: { cost: 0, draw: 1, exhaust: true },
  },
  balance_key: {
    id: 'balance_key', name: '平衡之匙', icon: '🗝️', rarity: 'boss',
    desc: '日、月、星共鸣层数始终相同（以最先变化的为准），且每3层获得1点全属性加成。',
    syncResonance: true,
    onResonanceChange: { every3Total: { strength: 1, dexterity: 1, burstCharge: 1 } },
  },
  corruption_crown: {
    id: 'corruption_crown', name: '腐化皇冠', icon: '👿', rarity: 'boss',
    desc: '每场战斗首次生命低于50%，立刻获得15护盾和3力量。',
    onHpThreshold: { below: 0.5, block: 15, strength: 3, once: true },
  },
  supernova_shard: {
    id: 'supernova_shard', name: '超新星碎片', icon: '☄️', rarity: 'boss',
    desc: '共鸣爆发不再有冷却。', burstNoCooldown: true,
  },
  eternal_tower: {
    id: 'eternal_tower', name: '永恒之塔', icon: '🗼', rarity: 'boss',
    desc: '最大生命+30，每层开始回复到满血。',
    onObtain: { maxHp: 30 }, onFloorStart: { healFull: true },
  },
  chooser: {
    id: 'chooser', name: '抉择者', icon: '🔀', rarity: 'boss',
    desc: '每层可更换一次环境塔罗。', envTarotRerollPerAct: 1,
  },
  seed_of_origin: {
    id: 'seed_of_origin', name: '根源之种', icon: '🌱', rarity: 'boss',
    desc: '所有敌人生命+50%，掉落奖励翻倍，卡牌奖励变为稀有以上。',
    enemyHpMult: 1.5, rewardGoldMult: 2, cardRewardMinRarity: 'rare',
  },
};

export const BOSS_RELIC_POOL = [
  'solar_crown', 'eclipse_heart', 'abyss_core_relic', 'void_egg', 'balance_key',
  'corruption_crown', 'supernova_shard', 'eternal_tower', 'chooser', 'seed_of_origin',
];

/** 进阶 XIX：Boss 负面遗物二选一 */
export const NEGATIVE_BOSS_RELIC_POOL = [
  'demon_heart', 'cursed_blade', 'philosopher_stone', 'void_core', 'evolution_star',
  'corruption_crown', 'seed_of_origin',
];

export const RELIC_RARITY_WEIGHTS = { common: 50, uncommon: 35, rare: 15 };
