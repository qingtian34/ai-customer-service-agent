/** 环境塔罗 — 大阿卡纳（每层开始三选一，影响本层非 Boss 房间） */
export const ENV_TAROT = {
  fool: {
    id: 'fool', name: '愚者', icon: '🃏',
    desc: '未知事件出现概率翻倍。',
  },
  magician: {
    id: 'magician', name: '魔术师', icon: '🎩',
    desc: '宝箱额外包含一张随机卡牌。',
  },
  high_priestess: {
    id: 'high_priestess', name: '女祭司', icon: '📿',
    desc: '休息点可额外选择「移除一张卡牌」。',
  },
  empress: {
    id: 'empress', name: '女皇', icon: '👑',
    desc: '战斗奖励卡牌三选一变为五选一。',
  },
  emperor: {
    id: 'emperor', name: '皇帝', icon: '⚔',
    desc: '精英敌人奖励遗物变为四选一。',
  },
  hierophant: {
    id: 'hierophant', name: '教皇', icon: '🕯',
    desc: '休息点回复生命提升至 40%。',
  },
  lovers: {
    id: 'lovers', name: '恋人', icon: '💕',
    desc: '商人出售卡牌费用减半。',
  },
  chariot: {
    id: 'chariot', name: '战车', icon: '🏇',
    desc: '战斗开始时获得 1 点临时力量，持续 2 回合。',
  },
  strength: {
    id: 'strength', name: '力量', icon: '💪',
    desc: '该层敌人生命 +15%，但掉落金币 +50%。',
  },
  hermit: {
    id: 'hermit', name: '隐者', icon: '🏮',
    desc: '战斗奖励有概率额外出现「锻造」选项。',
  },
  wheel: {
    id: 'wheel', name: '命运之轮', icon: '🎡',
    desc: '该层所有随机效果额外触发一次。',
  },
  justice: {
    id: 'justice', name: '正义', icon: '⚖',
    desc: '每击败普通敌人，回复 2 生命。',
  },
  hanged_man: {
    id: 'hanged_man', name: '倒吊人', icon: '🙃',
    desc: '该层第一次死亡时复活并恢复 20% 生命（每层限一次）。',
  },
  death: {
    id: 'death', name: '死神', icon: '💀',
    desc: '精英敌人会在小地图上显示。',
  },
  temperance: {
    id: 'temperance', name: '节制', icon: '🏺',
    desc: '每次进入新房间回复 3 生命。',
  },
  devil: {
    id: 'devil', name: '恶魔', icon: '😈',
    desc: '敌人掉落金币翻倍，但每场战斗开始失去 3 生命。',
  },
  tower: {
    id: 'tower', name: '塔', icon: '🗼',
    desc: '战斗奖励卡牌必定包含一张稀有卡。',
  },
  star: {
    id: 'star', name: '星星', icon: '⭐',
    desc: '所有充能效果效率 +50%。',
  },
  moon: {
    id: 'moon', name: '月亮', icon: '🌙',
    desc: '所有状态牌/诅咒牌在回合结束的负面效果减半。',
  },
  sun: {
    id: 'sun', name: '太阳', icon: '☀',
    desc: '日系牌伤害 +3，护盾 +3。',
  },
  judgement: {
    id: 'judgement', name: '审判', icon: '📯',
    desc: 'Boss 房间前出现一个额外精英（奖励丰厚）。',
  },
  world: {
    id: 'world', name: '世界', icon: '🌍',
    desc: '地图迷雾全部可见，可任意传送至已走过的节点。',
  },
};

export const ENV_TAROT_IDS = Object.keys(ENV_TAROT);

export function pickEnvTarotChoices(count = 3) {
  const pool = [...ENV_TAROT_IDS];
  const picks = [];
  while (picks.length < count && pool.length) {
    const i = Math.floor(Math.random() * pool.length);
    picks.push(pool.splice(i, 1)[0]);
  }
  return picks;
}

function scaleEnvValue(value, mult, round = true) {
  const scaled = value * mult;
  return round ? Math.max(1, Math.floor(scaled)) : scaled;
}

export function createEnvTarotEffect(tarotId, mult = 1) {
  const def = ENV_TAROT[tarotId];
  if (!def) return null;
  const s = (v) => scaleEnvValue(v, mult);
  const base = { id: tarotId, name: def.name, icon: def.icon, desc: def.desc, mult };

  switch (tarotId) {
    case 'fool':
      return { ...base, eventWeightMult: 2 * mult };
    case 'magician':
      return { ...base, chestExtraCard: s(1) };
    case 'high_priestess':
      return { ...base, restExtraRemove: true };
    case 'empress':
      return { ...base, rewardCardChoices: s(5) };
    case 'emperor':
      return { ...base, eliteRelicChoices: s(4) };
    case 'hierophant':
      return { ...base, restHealPercent: 0.4 * mult };
    case 'lovers':
      return { ...base, shopCardPriceMult: 0.5 * mult };
    case 'chariot':
      return { ...base, combatStartStrength: s(1), combatStartStrengthTurns: s(2) };
    case 'strength':
      return { ...base, enemyHpMult: 1 + 0.15 * mult, goldDropMult: 1 + 0.5 * mult };
    case 'hermit':
      return { ...base, forgeOptionChance: 0.3 * mult };
    case 'wheel':
      return { ...base, randomEffectDouble: true };
    case 'justice':
      return { ...base, healOnNormalKill: s(2) };
    case 'hanged_man':
      return { ...base, deathSavePercent: 0.2 * mult, deathSaveOncePerAct: true };
    case 'death':
      return { ...base, revealElitesOnMap: true };
    case 'temperance':
      return { ...base, roomEnterHeal: s(3) };
    case 'devil':
      return { ...base, goldDropMult: 2 * mult, combatStartHpLoss: s(3) };
    case 'tower':
      return { ...base, rewardGuaranteeRare: true };
    case 'star':
      return { ...base, chargeEfficiencyMult: 1 + 0.5 * mult };
    case 'moon':
      return { ...base, statusNegativeHalf: true };
    case 'sun':
      return { ...base, sunCardDamageBonus: s(3), sunCardBlockBonus: s(3) };
    case 'judgement':
      return { ...base, extraEliteBeforeBoss: true };
    case 'world':
      return { ...base, mapFullReveal: true, mapFreeTeleport: true };
    default:
      return base;
  }
}

export function getActiveEnvTarots(game) {
  if (!game?.envTarot) return [];
  return Array.isArray(game.envTarot) ? game.envTarot : [game.envTarot];
}

/**
 * 按 hook 汇总环境塔罗修正，返回合并后的 ctx。
 * hooks: onActStart, onRoomEnter, onCombatStart, onRewardRoll,
 *        onShopPrices, onRestHeal, onMapGenerate, onEliteReveal,
 *        onDeathSave, onEventWeight
 */
export function applyEnvTarotModifiers(game, hook, ctx = {}) {
  const out = { ...ctx };
  const effects = getActiveEnvTarots(game);
  if (!effects.length) return out;

  for (const t of effects) {
    const m = t.mult ?? 1;

    switch (hook) {
      case 'onActStart':
        if (t.deathSaveOncePerAct) out.deathSaveAvailable = true;
        if (t.deathSavePercent) {
          out.deathSavePercent = Math.max(out.deathSavePercent || 0, t.deathSavePercent);
        }
        break;

      case 'onRoomEnter':
        if (t.roomEnterHeal) {
          out.heal = (out.heal || 0) + scaleEnvValue(t.roomEnterHeal, m);
        }
        break;

      case 'onCombatStart':
        if (t.combatStartStrength) {
          out.startStrength = (out.startStrength || 0) + scaleEnvValue(t.combatStartStrength, m);
          out.startStrengthTurns = Math.max(
            out.startStrengthTurns || 0,
            scaleEnvValue(t.combatStartStrengthTurns || 2, m),
          );
        }
        if (t.combatStartHpLoss) {
          out.startHpLoss = (out.startHpLoss || 0) + scaleEnvValue(t.combatStartHpLoss, m);
        }
        if (t.enemyHpMult && t.enemyHpMult !== 1) {
          out.enemyHpMult = (out.enemyHpMult || 1) * t.enemyHpMult;
        }
        if (t.sunCardDamageBonus) {
          out.sunCardDamageBonus = (out.sunCardDamageBonus || 0) + scaleEnvValue(t.sunCardDamageBonus, m);
        }
        if (t.sunCardBlockBonus) {
          out.sunCardBlockBonus = (out.sunCardBlockBonus || 0) + scaleEnvValue(t.sunCardBlockBonus, m);
        }
        if (t.chargeEfficiencyMult) {
          out.chargeEfficiencyMult = (out.chargeEfficiencyMult || 1) * t.chargeEfficiencyMult;
        }
        if (t.statusNegativeHalf) out.statusNegativeHalf = true;
        break;

      case 'onRewardRoll':
        if (t.rewardCardChoices) {
          out.cardChoices = Math.max(out.cardChoices || 3, scaleEnvValue(t.rewardCardChoices, m));
        }
        if (t.eliteRelicChoices) {
          out.relicChoices = Math.max(out.relicChoices || 3, scaleEnvValue(t.eliteRelicChoices, m));
        }
        if (t.rewardGuaranteeRare) out.guaranteeRareCard = true;
        if (t.forgeOptionChance) {
          out.forgeOptionChance = Math.min(1, (out.forgeOptionChance || 0) + t.forgeOptionChance);
        }
        if (t.goldDropMult && t.goldDropMult !== 1) {
          out.goldMult = (out.goldMult || 1) * t.goldDropMult;
        }
        if (t.chestExtraCard) {
          out.chestExtraCards = (out.chestExtraCards || 0) + scaleEnvValue(t.chestExtraCard, m);
        }
        if (t.healOnNormalKill) {
          out.healOnNormalKill = (out.healOnNormalKill || 0) + scaleEnvValue(t.healOnNormalKill, m);
        }
        break;

      case 'onShopPrices':
        if (t.shopCardPriceMult) {
          out.cardPriceMult = (out.cardPriceMult || 1) * t.shopCardPriceMult;
        }
        break;

      case 'onRestHeal':
        if (t.restHealPercent) {
          out.healPercent = Math.max(out.healPercent || 0.3, t.restHealPercent);
        }
        if (t.restExtraRemove) out.extraRemoveOption = true;
        break;

      case 'onMapGenerate':
        if (t.mapFullReveal) out.fullReveal = true;
        if (t.mapFreeTeleport) out.freeTeleport = true;
        if (t.extraEliteBeforeBoss) out.extraEliteBeforeBoss = true;
        break;

      case 'onEliteReveal':
        if (t.revealElitesOnMap) out.revealElites = true;
        break;

      case 'onDeathSave':
        if (t.deathSaveOncePerAct && out.deathSaveAvailable !== false && t.deathSavePercent) {
          out.revivePercent = Math.max(out.revivePercent || 0, t.deathSavePercent);
          out.consumeDeathSave = true;
        }
        break;

      case 'onEventWeight':
        if (t.eventWeightMult && t.eventWeightMult !== 1) {
          out.eventMult = (out.eventMult || 1) * t.eventWeightMult;
        }
        break;

      default:
        break;
    }

    if (t.randomEffectDouble && hook !== 'onMapGenerate') {
      out.randomRolls = (out.randomRolls || 1) + 1;
    }
  }

  return out;
}
