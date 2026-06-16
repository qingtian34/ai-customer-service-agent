/** 战斗塔罗 — 大阿卡纳（战斗前三选一） */
export const BATTLE_TAROT = {
  fool: {
    id: 'fool', name: '愚者', icon: '🃏',
    desc: '每回合打出的第一张牌不消耗能量。',
  },
  magician: {
    id: 'magician', name: '魔术师', icon: '🎩',
    desc: '回合开始，每种星辰共鸣≥1 则 +1 能量（最多 +2）。',
  },
  high_priestess: {
    id: 'high_priestess', name: '女祭司', icon: '📿',
    desc: '回合开始，若手牌≤3，抽 2 张牌。',
  },
  empress: {
    id: 'empress', name: '女皇', icon: '👑',
    desc: '所有能力牌费用 -1。',
  },
  emperor: {
    id: 'emperor', name: '皇帝', icon: '⚔',
    desc: '每打出 3 张攻击牌，获得 2 点护盾。',
  },
  hierophant: {
    id: 'hierophant', name: '教皇', icon: '🕯',
    desc: '回合结束，若全部共鸣层数为 0，回复 3 生命。',
  },
  lovers: {
    id: 'lovers', name: '恋人', icon: '💕',
    desc: '攻击伤害 +2，或技能护盾 +3（战斗开始时选择）。',
    choice: true,
  },
  chariot: {
    id: 'chariot', name: '战车', icon: '🏇',
    desc: '每打出 3 张攻击牌，获得 1 点力量（本回合）。',
  },
  strength: {
    id: 'strength', name: '力量', icon: '💪',
    desc: '战斗开始 +2 力量，-2 敏捷。',
  },
  hermit: {
    id: 'hermit', name: '隐者', icon: '🏮',
    desc: '每回合第一张技能牌费用 -1。',
  },
  wheel: {
    id: 'wheel', name: '命运之轮', icon: '🎡',
    desc: '回合开始，若手牌为空，抽 2 张牌。',
  },
  justice: {
    id: 'justice', name: '正义', icon: '⚖',
    desc: '受到攻击时，对来源造成 2 点伤害。',
  },
  hanged_man: {
    id: 'hanged_man', name: '倒吊人', icon: '🙃',
    desc: '致命伤害时保留 1 生命并获得 10 护盾（每场 1 次）。',
  },
  death: {
    id: 'death', name: '死神', icon: '💀',
    desc: '击杀非 Boss 敌人回复 5 生命。',
  },
  temperance: {
    id: 'temperance', name: '节制', icon: '🏺',
    desc: '回合结束，若能量未用完，获得 3 护盾。',
  },
  devil: {
    id: 'devil', name: '恶魔', icon: '😈',
    desc: '力量 +3，每回合结束失去 2 生命。',
  },
  tower: {
    id: 'tower', name: '塔', icon: '🗼',
    desc: '敌人每损失 25% 生命，受到 10 点伤害。',
  },
  star: {
    id: 'star', name: '星星', icon: '⭐',
    desc: '每层星·尘共鸣，回合开始 +1 护盾。',
  },
  moon: {
    id: 'moon', name: '月亮', icon: '🌙',
    desc: '每层月·影共鸣，首张攻击牌 -1 费（每回合 1 次）。',
  },
  sun: {
    id: 'sun', name: '太阳', icon: '☀',
    desc: '每层日·耀共鸣，攻击附加 1 点伤害。',
  },
  judgement: {
    id: 'judgement', name: '审判', icon: '📯',
    desc: '第 3 回合起，每回合对所有敌人造成 15 伤害。',
  },
  world: {
    id: 'world', name: '世界', icon: '🌍',
    desc: '最大能量 +2，每回合少抽 1 张牌。',
  },
};

export const BATTLE_TAROT_IDS = Object.keys(BATTLE_TAROT);

export function pickBattleTarotChoices(count = 3) {
  const pool = [...BATTLE_TAROT_IDS];
  const picks = [];
  while (picks.length < count && pool.length) {
    const i = Math.floor(Math.random() * pool.length);
    picks.push(pool.splice(i, 1)[0]);
  }
  return picks;
}

export function scaleTarotValue(value, isBoss) {
  if (!isBoss) return value;
  return Math.floor(value * 0.75);
}

export function createBattleTarotEffect(tarotId, isBoss = false) {
  const def = BATTLE_TAROT[tarotId];
  if (!def) return null;
  const s = (v) => scaleTarotValue(v, isBoss);
  const base = { id: tarotId, name: def.name, icon: def.icon, desc: def.desc, isBoss, counters: {} };

  switch (tarotId) {
    case 'fool':
      return { ...base, firstCardFree: true, firstCardUsed: false };
    case 'magician':
      return { ...base, magicianEnergy: true };
    case 'high_priestess':
      return { ...base, priestessDraw: s(2), priestessHandMax: 3 };
    case 'empress':
      return { ...base, powerCostReduce: 1 };
    case 'emperor':
      return { ...base, attackBlockEvery: 3, attackBlockAmount: s(2), attacksForEmperor: 0 };
    case 'hierophant':
      return { ...base, hierophantHeal: s(3) };
    case 'lovers':
      return { ...base, loversPending: true };
    case 'chariot':
      return { ...base, chariotEvery: 3, chariotStrength: 1, attacksForChariot: 0 };
    case 'strength':
      return { ...base, startStrength: s(2), startDexPenalty: s(2) };
    case 'hermit':
      return { ...base, firstSkillDiscount: 1, skillDiscountUsed: false };
    case 'wheel':
      return { ...base, wheelDraw: s(2) };
    case 'justice':
      return { ...base, justiceRetaliate: s(2) };
    case 'hanged_man':
      return { ...base, hangedShield: s(10), hangedUsed: false };
    case 'death':
      return { ...base, deathHeal: s(5) };
    case 'temperance':
      return { ...base, temperanceBlock: s(3) };
    case 'devil':
      return { ...base, devilStrength: s(3), devilHpLoss: s(2) };
    case 'tower':
      return { ...base, towerDamage: s(10), towerThresholds: {} };
    case 'star':
      return { ...base, starBlockPerLayer: 1 };
    case 'moon':
      return { ...base, moonAttackDiscount: 1, moonDiscountUsed: false };
    case 'sun':
      return { ...base, sunBonusPerLayer: 1 };
    case 'judgement':
      return { ...base, judgementDamage: s(15), judgementFromTurn: 3 };
    case 'world':
      return { ...base, worldEnergy: s(2), worldDrawPenalty: 1 };
    default:
      return base;
  }
}

export function applyBattleTarotOnStart(combat, tarot) {
  if (!tarot) return;
  const p = combat.player;
  if (tarot.startStrength) {
    p.statuses.strength = (p.statuses.strength || 0) + tarot.startStrength;
  }
  if (tarot.startDexPenalty) {
    p.statuses.dexterity = (p.statuses.dexterity || 0) - tarot.startDexPenalty;
  }
  if (tarot.worldEnergy) {
    p.maxEnergy = (p.maxEnergy || 3) + tarot.worldEnergy;
    p.energy = (p.energy || 0) + tarot.worldEnergy;
  }
  if (tarot.devilStrength) {
    p.statuses.strength = (p.statuses.strength || 0) + tarot.devilStrength;
  }
}

/** Boss 战合并多张战斗塔罗（各效果独立叠加，恋人仍只选一次） */
export function mergeBattleTarots(tarotIds, isBoss = false) {
  const effects = (tarotIds || []).map(id => createBattleTarotEffect(id, isBoss)).filter(Boolean);
  if (!effects.length) return null;
  if (effects.length === 1) return effects[0];

  const merged = {
    id: 'merged',
    name: effects.map(e => e.name).join(' + '),
    icon: effects.map(e => e.icon).join(''),
    desc: effects.map(e => e.desc).join(' · '),
    isBoss,
    mergedIds: [...tarotIds],
    counters: {},
    towerThresholds: {},
  };

  const add = (key, val) => {
    if (val == null) return;
    if (typeof val === 'boolean') merged[key] = merged[key] || val;
    else merged[key] = (merged[key] || 0) + val;
  };

  for (const e of effects) {
    add('startStrength', e.startStrength);
    add('startDexPenalty', e.startDexPenalty);
    add('worldEnergy', e.worldEnergy);
    add('worldDrawPenalty', e.worldDrawPenalty);
    add('devilStrength', e.devilStrength);
    add('devilHpLoss', e.devilHpLoss);
    add('priestessDraw', e.priestessDraw);
    add('wheelDraw', e.wheelDraw);
    add('hierophantHeal', e.hierophantHeal);
    add('temperanceBlock', e.temperanceBlock);
    add('justiceRetaliate', e.justiceRetaliate);
    add('hangedShield', e.hangedShield);
    add('deathHeal', e.deathHeal);
    add('judgementDamage', e.judgementDamage);
    add('towerDamage', e.towerDamage);
    add('attackBlockAmount', e.attackBlockAmount);
    add('chariotStrength', e.chariotStrength);
    add('loversAttackBonus', e.loversAttackBonus);
    add('loversBlockBonus', e.loversBlockBonus);
    add('sunBonusPerLayer', e.sunBonusPerLayer);
    add('starBlockPerLayer', e.starBlockPerLayer);
    add('powerCostReduce', e.powerCostReduce);
    add('firstSkillDiscount', e.firstSkillDiscount);
    add('moonAttackDiscount', e.moonAttackDiscount);

    if (e.firstCardFree) merged.firstCardFree = true;
    if (e.magicianEnergy) merged.magicianEnergy = true;
    if (e.attackBlockEvery) {
      merged.attackBlockEvery = e.attackBlockEvery;
      merged.attacksForEmperor = 0;
    }
    if (e.chariotEvery) {
      merged.chariotEvery = e.chariotEvery;
      merged.attacksForChariot = 0;
    }
    if (e.judgementFromTurn) merged.judgementFromTurn = Math.min(merged.judgementFromTurn || 99, e.judgementFromTurn);
    if (e.priestessHandMax) merged.priestessHandMax = Math.max(merged.priestessHandMax || 0, e.priestessHandMax);
    if (e.loversPending) merged.loversPending = true;
    if (e.hangedUsed) merged.hangedUsed = false;
  }

  return merged;
}

export function applyLoversChoice(combat, choice) {
  const t = combat.battleTarot;
  if (!t?.loversPending) return;
  t.loversPending = false;
  const bonus = t.isBoss ? scaleTarotValue(2, true) : 2;
  if (choice === 'attack') {
    t.loversAttackBonus = (t.loversAttackBonus || 0) + bonus;
  } else {
    t.loversBlockBonus = (t.loversBlockBonus || 0) + bonus;
  }
}
