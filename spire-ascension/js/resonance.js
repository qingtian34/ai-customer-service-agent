/** 星辰共鸣 — 《星渊之塔》核心机制 */
import { CARD_POOL } from './data.js';

export const RESONANCE_ATTR = {
  sun: { id: 'sun', label: '日·耀', short: '日', icon: '☀', color: '#e8a838' },
  moon: { id: 'moon', label: '月·影', short: '月', icon: '🌙', color: '#6eb5ff' },
  star: { id: 'star', label: '星·尘', short: '星', icon: '✦', color: '#b98cff' },
  void: { id: 'void', label: '虚空', short: '空', icon: '🌀', color: '#7a5cad' },
};

const CYCLE = { sun: 'moon', moon: 'star', star: 'sun' };
export const MAX_RESONANCE_LAYER = 10;

const CLASS_DEFAULT_ATTR = {
  iron_warrior: 'sun',
  shadow_rogue: 'moon',
  arcane_mage: 'star',
  blood_hunter: 'void',
};

export function createResonanceState() {
  return {
    sun: 0,
    moon: 0,
    star: 0,
    lastAttr: null,
    burstChargeThisTurn: 0,
    crossEnergyThisTurn: false,
  };
}

/** 推断卡牌星辰属性（未在 CardDef 标注时按职业/类型推断） */
export function getCardAttribute(cardId, cardDef, classId) {
  if (cardDef?.attribute) return cardDef.attribute;
  if (cardDef?.class && CLASS_DEFAULT_ATTR[cardDef.class]) {
    return CLASS_DEFAULT_ATTR[cardDef.class];
  }
  const fallback = CLASS_DEFAULT_ATTR[classId] || 'void';
  if (cardId === 'strike' || cardId === 'defend') return fallback;
  if (cardDef?.type === 'attack') return fallback === 'void' ? 'void' : fallback;
  if (cardDef?.type === 'skill') return fallback === 'void' ? 'void' : (fallback === 'sun' ? 'moon' : fallback);
  if (cardDef?.type === 'power') return 'star';
  return 'void';
}

export function getMaxResonanceLayer(res) {
  if (!res) return 0;
  return Math.max(res.sun || 0, res.moon || 0, res.star || 0);
}

export function getResonanceLayer(res, attr) {
  if (!res || attr === 'void') return 0;
  return res[attr] || 0;
}

/**
 * 打出卡牌后更新共鸣层数。
 * 返回 { logs, crossEnergy, burstChargeGain }
 */
export function applyResonanceOnCardPlayed(combat, attr) {
  const res = combat.resonance;
  const result = { logs: [], crossEnergy: false, burstChargeGain: 0 };
  if (!res) return result;

  if (attr === 'void') {
    if (combat.player?.powers?.eternal_void) {
      result.logs.push('永恒虚空：虚空牌不中断星辰共鸣');
      return result;
    }
    res.sun = Math.max(0, (res.sun || 0) - 1);
    res.moon = Math.max(0, (res.moon || 0) - 1);
    res.star = Math.max(0, (res.star || 0) - 1);
    res.lastAttr = null;
    result.logs.push('虚空牌：全部共鸣层数 -1');
    return result;
  }

  const eternal = combat.player?.powers || {};
  const skipDecay = (a) => eternal[`eternal_${a}`] || eternal.eternal_resonance?.attr === a;

  if (res.lastAttr === attr) {
    const prev = res[attr] || 0;
    res[attr] = Math.min(MAX_RESONANCE_LAYER, prev + 1);
    result.logs.push(`${RESONANCE_ATTR[attr].label} 共鸣 +1（${res[attr]} 层）`);
    if (prev < 3 && res[attr] >= 3) {
      result.burstChargeGain += grantBurstChargeFromResonance(combat, result);
    }
    return result;
  }

  if (res.lastAttr && res.lastAttr !== 'void') {
    const prevAttr = res.lastAttr;
    const prevLayer = res[prevAttr] || 0;
    if (prevLayer >= 3 && CYCLE[prevAttr] === attr && !res.crossEnergyThisTurn) {
      combat.player.energy = (combat.player.energy || 0) + 1;
      res.crossEnergyThisTurn = true;
      result.crossEnergy = true;
      result.logs.push('跨系共鸣：获得 1 点能量');
    }
    if (prevLayer >= 1 && !skipDecay(prevAttr)) {
      res[prevAttr] = prevLayer - 1;
      result.logs.push(`${RESONANCE_ATTR[prevAttr].label} 共鸣 -1（${res[prevAttr]} 层）`);
    } else if (prevLayer >= 1 && skipDecay(prevAttr)) {
      result.logs.push(`${RESONANCE_ATTR[prevAttr].label} 永恒：层数不减`);
    }
  }

  const before = res[attr] || 0;
  res[attr] = res.lastAttr == null && before > 0
    ? Math.min(MAX_RESONANCE_LAYER, before + 1)
    : 1;
  res.lastAttr = attr;
  result.logs.push(`${RESONANCE_ATTR[attr].label} 共鸣 → ${res[attr]} 层`);

  if (before < 3 && res[attr] >= 3) {
    result.burstChargeGain += grantBurstChargeFromResonance(combat, result);
  }
  return result;
}

function grantBurstChargeFromResonance(combat, result) {
  const res = combat.resonance;
  if ((res.burstChargeThisTurn || 0) >= 2) return 0;
  res.burstChargeThisTurn = (res.burstChargeThisTurn || 0) + 1;
  if (combat.burst) {
    combat.burst.charge = Math.min(5, (combat.burst.charge || 0) + 1);
  }
  result.logs.push('共鸣达 3 层：爆发充能 +1');
  return 1;
}

export function resetResonanceTurnFlags(combat) {
  if (!combat.resonance) return;
  combat.resonance.burstChargeThisTurn = 0;
  combat.resonance.crossEnergyThisTurn = false;
}

/** 战斗塔罗「太阳」：每层日耀附加伤害 */
export function getTarotBonusDamage(combat, baseAttr) {
  const tarot = combat.battleTarot;
  if (!tarot?.sunBonusPerLayer) return 0;
  return getResonanceLayer(combat.resonance, 'sun');
}

export function getResonanceConditionMet(combat, attr, threshold) {
  return getResonanceLayer(combat.resonance, attr) >= threshold;
}

export function formatResonanceTooltip(res) {
  if (!res) return '';
  return `日 ${res.sun || 0} · 月 ${res.moon || 0} · 星 ${res.star || 0}`;
}
