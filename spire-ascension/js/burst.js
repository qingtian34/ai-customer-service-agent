/** 共鸣爆发技能定义与状态 */
export const BURST_SKILLS = {
  iron_warrior: {
    name: '太阳风暴',
    desc: '造成 15 点群体伤害，全体施加 2 层易伤，获得 8 点护盾。',
    icon: '☀',
  },
  shadow_rogue: {
    name: '月下轮舞',
    desc: '获得 2 点能量，本回合下 3 张攻击牌费用 -1。',
    icon: '🌙',
  },
  arcane_mage: {
    name: '超新星',
    desc: '造成 12 点伤害，击晕一名敌人 1 回合，抽 3 张牌。',
    icon: '✦',
  },
  blood_hunter: {
    name: '虚空湮灭',
    desc: '失去 5 点生命，造成 30 点伤害。',
    icon: '🌀',
  },
};

export function createBurstState() {
  return { charge: 0, cooldown: 0, attackDiscountLeft: 0, attackDiscount: 0 };
}

export function canUseBurst(combat) {
  const b = combat?.burst;
  const required = b?.chargeRequired ?? combat?.relicPassives?.burstChargeRequired ?? 5;
  return !!(combat?.playerTurn && !combat?.ended && b && b.charge >= required && (b.cooldown || 0) <= 0);
}

export function tickBurstCooldown(combat) {
  if (!combat?.burst) return;
  if (combat.burst.cooldown > 0) combat.burst.cooldown -= 1;
}

export function getBurstAttackDiscount(combat, card) {
  const b = combat?.burst;
  if (!b || b.attackDiscountLeft <= 0 || card?.type !== 'attack') return 0;
  return b.attackDiscount || 0;
}

export function consumeBurstAttackDiscount(combat, card) {
  const b = combat?.burst;
  if (!b || b.attackDiscountLeft <= 0 || card?.type !== 'attack') return;
  b.attackDiscountLeft -= 1;
}
