/** 战斗逻辑引擎 — 商业级机制 */
import { CARD_POOL, ENEMIES, RELICS, POTIONS } from './data.js';
import { getEnemyScale } from './map.js';
import { getAscensionEnemyScaleMult, getAscensionBurstRequired, getEnemyAttackBonus, applyPotionAscension } from './ascension.js';
import {
  createResonanceState, applyResonanceOnCardPlayed, getCardAttribute,
  getResonanceLayer, getMaxResonanceLayer, resetResonanceTurnFlags,
} from './resonance.js';
import {
  createBurstState, canUseBurst, tickBurstCooldown,
  getBurstAttackDiscount, consumeBurstAttackDiscount, BURST_SKILLS,
} from './burst.js';
import { mergeBattleTarots, applyBattleTarotOnStart, BATTLE_TAROT_IDS, createBattleTarotEffect } from './tarot.js';
import { isGddEffect, resolveGddEffect, applyGddPowerHooks, getMaxCharge } from './gdd-effects.js';
import { triggerRelics, applyRelicPassives } from './relic-engine.js';
import { CORRUPTION_CARD_IDS } from './data/gdd-cards.js';
import {
  buildGddIntent, executeGddIntent, getEnemyIntentKeys, tickEclipseWitchForm,
} from './gdd-enemy-ai.js';
import { applyEnvTarotModifiers } from './env-tarot.js';

const HAND_MAX = 10;

export const STATUS = {
  strength: { name: '力量', desc: '攻击 +N', type: 'buff' },
  dexterity: { name: '敏捷', desc: '格挡 +N', type: 'buff' },
  focus: { name: '专注', desc: '奥术 +N', type: 'buff' },
  weak: { name: '虚弱', desc: '攻击 -25%', type: 'debuff' },
  vulnerable: { name: '易伤', desc: '受伤 +50%', type: 'debuff' },
  frail: { name: '脆弱', desc: '格挡 -25%', type: 'debuff' },
  poison: { name: '中毒', desc: '回合末失去生命', type: 'debuff' },
  ritual: { name: '仪式', desc: '敌人力量增长', type: 'buff' },
  enrage: { name: '狂怒', desc: '敌人强化', type: 'buff' },
  thorns: { name: '荆棘', desc: '受击反伤', type: 'buff' },
  barricade: { name: '壁垒', desc: '格挡保留', type: 'buff' },
  blur: { name: '模糊', desc: '下回合格挡保留', type: 'buff' },
  intangible: { name: '无形', desc: '伤害最多为1', type: 'buff' },
  artifact: { name: '人工制品', desc: '抵消1层负面', type: 'buff' },
  stun: { name: '击晕', desc: '跳过下回合行动', type: 'debuff' },
  dodge: { name: '闪避', desc: '完全规避下次攻击', type: 'buff' },
  void_corruption: { name: '虚空腐蚀', desc: '回合开始失去生命', type: 'debuff' },
  corrupt_infection: { name: '腐化感染', desc: '回合末受到伤害', type: 'debuff' },
};

export function createCombatState(game) {
  const enemyIds = game.pendingEnemies || ['cultist'];
  const scale = getEnemyScale(game.act, game.ascension || 0, game.floor || 0);
  const enemies = enemyIds.map((id, i) => spawnEnemy(id, scale, i, game));
  const maxEnergy = 3 + (game.relics.some(r => RELICS[r]?.energyBonus) ? 1 : 0);

  const combat = {
    turn: 1, playerTurn: true, ended: false, victory: false,
    cardsPlayedThisTurn: 0,
    player: {
      hp: game.hp, maxHp: game.maxHp, block: 0, blockNext: 0,
      energy: maxEnergy, maxEnergy,
      energyNext: 0, statuses: {}, powers: {},
      hand: [], drawPile: [], discard: [], exhaust: [],
      attacksPlayed: 0, penNibReady: false,
      healCapThisTurn: 5, lifestealCount: 0,
      firstCardPlayed: false, echoUsed: false,
    },
    enemies, selectedTarget: 0, log: [], floatTexts: [], vfxQueue: [],
    relicTriggers: { anchorUsed: false, lanternUsed: false },
    feedBonus: game.feedBonus || 0,
    maxCardsPerTurn: game.relics.includes('velvet_choker') ? 6 : 99,
    resonance: createResonanceState(),
    burst: createBurstState(),
    battleTarot: (game.selectedBattleTarots?.length
      ? mergeBattleTarots(game.selectedBattleTarots, !!game.pendingBoss)
      : null),
    charge: 0,
    gameRef: game,
  };

  combat.player.drawPile = shuffle(game.deck.map(c => repairCardInstance(c)));
  applyRelic(combat, game, 'onCombatStart');
  applyBattleTarotOnStart(combat, combat.battleTarot);
  combat.relicPassives = applyRelicPassives(game, combat);
  if (combat.relicPassives?.maxEnergy) {
    combat.player.maxEnergy += combat.relicPassives.maxEnergy;
    combat.player.energy = combat.player.maxEnergy;
  }
  combat.burst.chargeRequired = getAscensionBurstRequired(game.ascension || 0, combat.relicPassives);
  if (game.ascension >= 6) {
    for (const e of combat.enemies) {
      e.statuses.strength = (e.statuses.strength || 0) + 1;
    }
    addLog(combat, '进阶 VI：敌人初始 +1 力量');
  }
  if (game.nextCombatDebuff === 'chaos_hand') {
    for (let i = 0; i < 2; i++) p0.hand.push(makeCard('corruption_mark'));
    game.nextCombatDebuff = null;
  }
  if (game.nextCombatClearResonance) {
    combat.resonance.sun = combat.resonance.moon = combat.resonance.star = 0;
    game.nextCombatClearResonance = false;
  }
  const startLogs = triggerRelics(combat, game, 'onCombatStart', { helpers: getEffectHelpers(combat, game) });
  for (const msg of startLogs) addLog(combat, msg);
  applyEnvTarotModifiers(game, 'onCombatStart', { combat, isBoss: !!game.pendingBoss });
  const p0 = combat.player;
  if (game.envTarot?.combatStartStrength) {
    p0.statuses.strength = (p0.statuses.strength || 0) + game.envTarot.combatStartStrength;
    combat.envStrengthTurns = game.envTarot.combatStartStrengthTurns || 2;
  }
  if (game.envTarot?.combatStartHpLoss) {
    p0.hp -= game.envTarot.combatStartHpLoss;
    addLog(combat, `恶魔环境：失去 ${game.envTarot.combatStartHpLoss} 生命`);
  }
  startPlayerTurn(combat, game, true);
  return normalizeCombat(combat, game);
}

/** 修复存档/浅拷贝导致的能量、powers、卡牌费用异常 */
export function normalizeCombat(combat, game = null) {
  if (!combat?.player) return combat;
  const p = combat.player;

  p.powers = p.powers || {};
  p.statuses = p.statuses || {};
  p.hand = p.hand || [];
  p.drawPile = p.drawPile || [];
  p.discard = p.discard || [];
  p.exhaust = p.exhaust || [];
  p.energy = Math.max(0, Number(p.energy) || 0);
  p.maxEnergy = Math.max(1, Number(p.maxEnergy) || 3);
  p.energyNext = Number(p.energyNext) || 0;

  for (const pile of [p.hand, p.drawPile, p.discard, p.exhaust]) {
    for (let i = 0; i < pile.length; i++) pile[i] = repairCardInstance(pile[i]);
  }

  if (combat.maxCardsPerTurn == null || combat.maxCardsPerTurn === undefined) {
    combat.maxCardsPerTurn = game?.relics?.includes('velvet_choker') ? 6 : 99;
  }
  combat.cardsPlayedThisTurn = combat.cardsPlayedThisTurn || 0;
  combat.relicTriggers = combat.relicTriggers || { anchorUsed: false, lanternUsed: false };
  combat.resonance = combat.resonance || createResonanceState();
  combat.burst = combat.burst || createBurstState();
  if (game?.selectedBattleTarots?.length && !combat.battleTarot) {
    combat.battleTarot = mergeBattleTarots(game.selectedBattleTarots, !!game.pendingBoss);
  }

  // 回合卡在敌人阶段后未恢复（如 powers 未初始化导致 startPlayerTurn 抛错）
  if (!combat.ended && !combat.playerTurn && p.hand.length > 0) {
    combat.playerTurn = true;
  }
  return combat;
}

function repairCardInstance(card) {
  if (!card?.id) return card;
  const def = CARD_POOL[card.id];
  const costNum = Number(card.cost);
  if (def) {
    if (!card.type) card.type = def.type;
    if (card.unplayable == null) card.unplayable = !!def.unplayable;
    if (!Number.isFinite(costNum)) card.cost = def.cost;
    else card.cost = costNum;
    if (!card.name) card.name = def.name;
  } else if (!Number.isFinite(costNum)) {
    card.cost = 1;
  } else {
    card.cost = costNum;
  }
  return card;
}

function spawnEnemy(id, scale, index, game = null) {
  const def = ENEMIES[id];
  const asc = game?.ascension || 0;
  const bossMult = getAscensionEnemyScaleMult(asc, !!def?.boss);
  const hp = Math.floor(randRange(def.hp[0], def.hp[1]) * scale * (def.boss ? bossMult : 1));
  const enemy = {
    id, name: def.name, art: def.art || '👾',
    hp, maxHp: hp, block: 0, intentIndex: 0, intent: null,
    statuses: {}, sleeping: def.intents[0] === 'sleep',
    escaped: false, index, phase: 1, charge: 0,
  };
  if (id === 'eclipse_witch') {
    enemy.moonForm = 'newMoon';
    if (def.newMoon?.dexterity) enemy.statuses.dexterity = def.newMoon.dexterity;
  }
  return enemy;
}

export function startPlayerTurn(combat, game, isFirst = false) {
  const p = combat.player;
  p.powers = p.powers || {};
  // 《星渊之塔》设定：护盾跨回合保留；模糊仍叠加下回合格挡
  if (p.statuses.blur) {
    p.block = (p.block || 0) + (p.blockNext || 0);
    p.statuses.blur = Math.max(0, (p.statuses.blur || 0) - 1);
  }
  p.blockNext = 0;
  tickBurstCooldown(combat);
  resetResonanceTurnFlags(combat);
  const tarot = combat.battleTarot;
  if (tarot) {
    tarot.firstCardUsed = false;
    tarot.skillDiscountUsed = false;
    tarot.moonDiscountUsed = false;
  }

  let energy = p.maxEnergy + (p.energyNext || 0);
  if (game.relics.includes('ice_cream') && !isFirst) {
    const retain = Math.min(p.energy, RELICS.ice_cream.retainEnergy);
    energy += retain;
  }
  p.energyNext = 0;
  p.energy = energy;
  p.cardsPlayedThisTurn = 0;
  p.healCapThisTurn = 5;
  p.lifestealCount = 0;
  p.firstCardPlayed = false;
  p.echoUsed = false;

  const voidStacks = p.statuses.void_corruption || 0;
  if (voidStacks > 0 && !isFirst) {
    const loss = voidStacks * 2;
    p.hp -= loss;
    addLog(combat, `虚空腐蚀：失去 ${loss} 生命`);
  }

  if (!isFirst) {
    combat.turn++;
    applyPowerTurnStart(combat, game);
  }

  if ((p.statuses.void_corruption || 0) > 0) {
    const loss = p.statuses.void_corruption * 2;
    p.hp -= loss;
    addLog(combat, `虚空腐蚀：失去 ${loss} 生命`);
  }
  if (combat.pendingOverload) {
    p.hp -= combat.pendingOverload;
    addLog(combat, `过载：失去 ${combat.pendingOverload} 生命`);
    combat.pendingOverload = 0;
  }
  if (combat.envStrengthTurns > 0) {
    combat.envStrengthTurns--;
    if (combat.envStrengthTurns <= 0) p.statuses.strength = Math.max(0, (p.statuses.strength || 0) - (game.envTarot?.combatStartStrength || 0));
  }

  const turnStartLogs = triggerRelics(combat, game, 'onTurnStart', { helpers: getEffectHelpers(combat, game) });
  for (const msg of turnStartLogs) addLog(combat, msg);
  applyGddPowerHooks(combat, game, 'turnStart', {});

  applyTarotTurnStart(combat, game, isFirst);

  if (game.customStartEnergy && isFirst) {
    p.energy += game.customStartEnergy;
    addLog(combat, `自定义模式：+${game.customStartEnergy} 起始能量`);
  }

  const drawPenalty = combat.battleTarot?.worldDrawPenalty || 0;
  const drawCount = Math.max(1, 5 - drawPenalty);
  drawCards(combat, drawCount);
  if (isFirst && game.relics.includes('ring_of_snake')) drawCards(combat, 2);
  if (game.relics.includes('pocketwatch') && combat.turn % 3 === 0) drawCards(combat, 3);
  if (game.relics.includes('happy_flower') && combat.turn % 3 === 0) p.energy += 1;

  if (isFirst && game.relics.includes('anchor') && !combat.relicTriggers.anchorUsed) {
    p.block += 10;
    combat.relicTriggers.anchorUsed = true;
  }
  if (isFirst && game.relics.includes('lantern') && !combat.relicTriggers.lanternUsed) {
    p.energy += 1;
    combat.relicTriggers.lanternUsed = true;
  }
  if (isFirst && game.persistCharge) {
    combat.charge = game.persistCharge;
    game.persistCharge = 0;
    addLog(combat, `永恒星尘：继承 ${combat.charge} 充能`);
  }
  if (game.nextCombatStartEnergy) {
    p.energy += game.nextCombatStartEnergy;
    addLog(combat, `永恒月影：额外 ${game.nextCombatStartEnergy} 点能量`);
    game.nextCombatStartEnergy = 0;
  }
  combat.damageTakenThisTurn = 0;
  if (game.relics.includes('mercury_hourglass')) {
    for (const e of combat.enemies) if (e.hp > 0) { e.hp -= 3; addFloat(combat, e.index, '-3', 'damage'); }
    addLog(combat, '水银沙漏：所有敌人受到 3 点伤害');
  }

  updateEnemyIntents(combat);
  combat.playerTurn = true;
  addLog(combat, `—— 第 ${combat.turn} 回合 · 你的回合 ——`);
}

function applyPowerTurnStart(combat, game) {
  const p = combat.player;
  p.powers = p.powers || {};
  if (p.powers.demon_form) {
    p.statuses.strength = (p.statuses.strength || 0) + p.powers.demon_form;
    addLog(combat, `恶魔形态：力量 +${p.powers.demon_form}`);
  }
  if (p.powers.brutality) {
    p.hp -= 1;
    drawCards(combat, 1);
    addLog(combat, '残暴：失去 1 生命，抽 1 张牌');
  }
  if (p.powers.wraith) {
    p.statuses.dexterity = (p.statuses.dexterity || 0) + p.powers.wraith;
    addLog(combat, `幽魂形态：敏捷 +${p.powers.wraith}`);
  }
  if (p.powers.creative) {
    const powers = Object.keys(CARD_POOL).filter(k => CARD_POOL[k].type === 'power' && CARD_POOL[k].rarity !== 'basic');
    const id = powers[Math.floor(Math.random() * powers.length)];
    p.hand.push(makeCard(id));
    addLog(combat, `创意 AI：获得 ${CARD_POOL[id]?.name}`);
  }
  if (p.powers.magnetism) {
    const zeros = Object.keys(CARD_POOL).filter(k => CARD_POOL[k].cost === 0 && !CARD_POOL[k].unplayable);
    if (zeros.length) p.hand.push(makeCard(zeros[Math.floor(Math.random() * zeros.length)]));
  }
}

export function endPlayerTurn(combat, game) {
  if (!combat.playerTurn || combat.ended) return;
  combat.playerTurn = false;
  const p = combat.player;

  // 状态牌效果
  for (const card of [...p.hand]) {
    const def = CARD_POOL[card.id];
    if (def?.effects) {
      for (const eff of def.effects) {
        if (eff.type === 'ethereal_burn') p.hp -= eff.value;
        if (eff.type === 'ethereal_weak') p.statuses.weak = (p.statuses.weak || 0) + eff.value;
      }
    }
  }

  if (p.powers.combust) {
    for (const e of combat.enemies) {
      if (e.hp > 0) { e.hp -= p.powers.combust; addLog(combat, `自燃：${e.name} 受到 ${p.powers.combust} 点伤害`); }
    }
  }

  if (p.powers.retain) {
    const keep = Math.min(p.powers.retain, p.hand.length);
    const kept = p.hand.splice(0, keep);
    p.discard.push(...p.hand);
    p.hand = kept;
  } else {
    p.discard.push(...p.hand);
    p.hand = [];
  }

  if (game.relics.includes('calipers') && !p.statuses.barricade && !p.powers.barricade) {
    p.blockNext = Math.max(0, p.block - 15);
    p.block = 0;
  }

  applyTarotEndTurn(combat, game);
  if (combat.pendingOverloadEnd) {
    p.hp -= combat.pendingOverloadEnd;
    addLog(combat, `过载：失去 ${combat.pendingOverloadEnd} 生命`);
    combat.pendingOverloadEnd = 0;
  }
  const turnEndLogs = triggerRelics(combat, game, 'onTurnEnd', { helpers: getEffectHelpers(combat, game) });
  for (const msg of turnEndLogs) addLog(combat, msg);
  enemyTurn(combat, game);
  if (combat.ended) return;
  processPoison(combat);
  decayStatuses(combat);
  if (checkCombatEnd(combat, game)) return;
  startPlayerTurn(combat, game);
}

function enemyTurn(combat, game) {
  addLog(combat, '—— 敌人回合 ——');
  const order = [...combat.enemies].sort((a, b) => {
    if (a.delayIntent && !b.delayIntent) return 1;
    if (!a.delayIntent && b.delayIntent) return -1;
    return 0;
  });
  for (const enemy of order) {
    if (enemy.delayIntent) {
      enemy.delayIntent = false;
      addLog(combat, `${enemy.name} 攻击延后至回合末`);
    }
    if (enemy.hp <= 0 || enemy.escaped) continue;
    const def = ENEMIES[enemy.id];
    tickEclipseWitchForm(enemy, def);
    if ((enemy.statuses.stun || 0) > 0) {
      enemy.statuses.stun -= 1;
      addLog(combat, `${enemy.name} 被击晕，跳过行动`);
      continue;
    }
    if (enemy.sleeping) {
      enemy.sleeping = false;
      addLog(combat, `${enemy.name} 苏醒了！`);
      continue;
    }
    executeEnemyIntent(combat, game, enemy);
    onEnemyTurnEnd(combat, game, enemy, def);
    checkBossPhase(combat, enemy, game);
    if (checkCombatEnd(combat, game)) return;
  }
}

function onEnemyTurnEnd(combat, game, enemy, def) {
  if (def?.onTurnEndChargeDamage && (enemy.charge || 0) > 0) {
    const dmg = enemy.charge;
    for (const e of combat.enemies) {
      if (e.hp > 0 && e.index !== enemy.index) {
        applyDamageToEnemy(combat, e, dmg, game);
      }
    }
    addLog(combat, `${enemy.name} 充能释放 ${dmg} 点伤害`);
  }
  if (enemy.id === 'sun_monarch' && def?.passive?.sunResonancePerTurn) {
    enemy.sunResonance = (enemy.sunResonance || 0) + def.passive.sunResonancePerTurn;
    if (enemy.sunResonance >= 5 && def.passive.bonusEnergyAt5) {
      combat.player.energy += def.passive.bonusEnergyAt5;
      enemy.sunResonance = 0;
      addLog(combat, '日冕君主：阳炎能量涌动！');
    }
  }
}

function executeEnemyIntent(combat, game, enemy) {
  const intent = enemy.intent;
  if (!intent) return;
  const helpers = {
    ...getEffectHelpers(combat, game),
    dealDamageToPlayer,
    applyDebuffToPlayer,
    spawnMinion,
  };
  if (executeGddIntent(combat, game, enemy, intent, helpers)) {
    enemy.intentIndex = (enemy.intentIndex + 1) % (ENEMIES[enemy.id]?.intents?.length || 1);
    return;
  }
  const p = combat.player;

  switch (intent.type) {
    case 'attack':
    case 'attack_multi':
    case 'attack_big': {
      const hits = intent.hits || 1;
      for (let h = 0; h < hits; h++) {
        dealDamageToPlayer(combat, game, enemy, intent.value, !!intent.ignoreBlock);
        if (p.hp <= 0) break;
      }
      break;
    }
    case 'buff':
      for (const [k, v] of Object.entries(intent.value))
        enemy.statuses[k] = (enemy.statuses[k] || 0) + v;
      addLog(combat, `${enemy.name} 强化了自身`);
      break;
    case 'debuff':
      applyDebuffToPlayer(p, intent.value);
      addLog(combat, `${enemy.name} 削弱了你`);
      break;
    case 'defend':
      enemy.block += intent.value;
      addLog(combat, `${enemy.name} 获得 ${intent.value} 点格挡`);
      break;
    case 'heal':
      enemy.hp = Math.min(enemy.maxHp, enemy.hp + intent.value);
      addLog(combat, `${enemy.name} 恢复 ${intent.value} 点生命`);
      break;
    case 'split':
      addLog(combat, `${enemy.name} 分裂了！`);
      enemy.hp = Math.floor(enemy.maxHp / 2);
      break;
    case 'special':
    case 'special_big': {
      const dmg = intent.value || 12;
      dealDamageToPlayer(combat, game, enemy, dmg, true);
      addLog(combat, `${enemy.name} 释放 ${intent.display}！`);
      break;
    }
    case 'special_time':
      p.drawPile = shuffle([...p.drawPile, ...p.discard]);
      p.discard = [];
      addLog(combat, '时间吞噬者：洗混你的弃牌堆！');
      break;
  }
  const def = ENEMIES[enemy.id];
  const keys = getEnemyIntentKeys(def, enemy);
  enemy.intentIndex = (enemy.intentIndex + 1) % keys.length;
}

function dealDamageToPlayer(combat, game, enemy, baseDmg, ignoreBlock = false) {
  const p = combat.player;
  let dmg = baseDmg + (enemy.statuses.strength || 0) + (enemy.statuses.ritual || 0) + (enemy.statuses.enrage || 0);
  if (p.statuses.weak) dmg = Math.floor(dmg * 0.75);
  const incomingReduce = p.powers?.incoming_reduce || 0;
  if (incomingReduce > 0) dmg = Math.max(0, dmg - incomingReduce);

  if (p.statuses.intangible) dmg = Math.min(dmg, 1);

  if ((p.statuses.dodge || 0) > 0 && !ignoreBlock) {
    p.statuses.dodge--;
    addLog(combat, '闪避！完全规避伤害');
    addFloat(combat, -1, '闪避', 'block');
    return;
  }

  let hpDmg;
  if (ignoreBlock) {
    hpDmg = dmg;
    p.block = 0;
  } else {
    const blocked = Math.min(p.block, dmg);
    p.block -= blocked;
    hpDmg = dmg - blocked;
  }

  if (game.relics.includes('torii') && hpDmg > 0 && hpDmg <= 5) hpDmg = 1;
  if (game.relics.includes('boot') && hpDmg > 0 && hpDmg < 5) hpDmg = 5;

  if (hpDmg > 0 && game?.ascension >= 17) {
    const deb = Math.random() < 0.5 ? 'weak' : 'vulnerable';
    p.statuses[deb] = (p.statuses[deb] || 0) + 1;
  }

  const tarot = combat.battleTarot;
  if (hpDmg > 0 && tarot?.hangedShield && !tarot.hangedUsed && p.hp - hpDmg <= 0) {
    p.hp = 1;
    p.block = (p.block || 0) + tarot.hangedShield;
    tarot.hangedUsed = true;
    addLog(combat, `倒吊人：保留 1 生命并获得 ${tarot.hangedShield} 护盾`);
    addFloat(combat, -1, `+${tarot.hangedShield}`, 'block');
    return;
  }

  if (hpDmg > 0) {
    if (combat.battleTarot?.justiceRetaliate && enemy?.hp > 0) {
      enemy.hp -= combat.battleTarot.justiceRetaliate;
      addLog(combat, `正义塔罗：${enemy.name} 受到 ${combat.battleTarot.justiceRetaliate} 反伤`);
    }
    if (game.relics.includes('bronze_scales') || (p.statuses.thorns || 0) > 0) {
      const thorns = 3 + (p.statuses.thorns || 0);
      enemy.hp -= thorns;
      addLog(combat, `${enemy.name} 受到 ${thorns} 点反伤`);
    }
    if (game.relics.includes('self_forming_clay')) p.block += 3;
    p.hp -= hpDmg;
    combat.damageTakenThisFight = (combat.damageTakenThisFight || 0) + hpDmg;
    combat.damageTakenThisTurn = (combat.damageTakenThisTurn || 0) + hpDmg;
    addLog(combat, `${enemy.name} 对你造成 ${hpDmg} 点伤害`);
    addFloat(combat, -1, `-${hpDmg}`, 'damage');
  } else {
    addLog(combat, `${enemy.name} 的攻击被格挡`);
  }
}

function applyDebuffToPlayer(p, debuffs) {
  for (const [k, v] of Object.entries(debuffs)) {
    if (k === 'dexterity_down') p.statuses.dexterity = (p.statuses.dexterity || 0) - v;
    else if (k === 'strength_down') p.statuses.strength = (p.statuses.strength || 0) - v;
    else p.statuses[k] = (p.statuses[k] || 0) + v;
  }
}

function checkBossPhase(combat, enemy, game) {
  const def = ENEMIES[enemy.id];
  if (!def || enemy.hp <= 0) return;
  const ratio = enemy.hp / enemy.maxHp;
  const p = combat.player;

  if (enemy.id === 'abyss_core') {
    if (enemy.phase < 2 && ratio <= (def.phase2 ?? 0.6)) {
      enemy.phase = 2;
      enemy.intentIndex = 0;
      enemy.charge = 0;
      p.statuses.void_corruption = (p.statuses.void_corruption || 0) + 1;
      addLog(combat, '星渊之核：外壳破裂，核心外露！');
    } else if (enemy.phase < 3 && ratio <= (def.phase3 ?? 0.27)) {
      enemy.phase = 3;
      enemy.intentIndex = 0;
      enemy.statuses.strength = (enemy.statuses.strength || 0) + 2;
      addLog(combat, '星渊之核：心脏暴露，攻势加剧！');
    } else if (enemy.phase < 4 && ratio <= 0.12 && (combat.gameRef?.ascension || 0) >= 10) {
      enemy.phase = 4;
      enemy.statuses.strength = (enemy.statuses.strength || 0) + 3;
      addLog(combat, '进阶 X：星渊之核进入最终形态！');
    }
    return;
  }

  if (enemy.id === 'eclipse_witch' && def.phase2 && enemy.phase < 2 && ratio <= def.phase2) {
    enemy.phase = 2;
    enemy.formCounter = 0;
    enemy.moonForm = 'newMoon';
    addLog(combat, '月蚀魔女：半血后每回合切换形态！');
    const cfg = def.summon_minion;
    if (cfg) spawnMinion(combat, cfg.id, cfg.hp || 40, enemy.index);
    return;
  }

  if (def.phase2 && enemy.phase < 2 && ratio <= def.phase2) {
    enemy.phase = 2;
    enemy.intentIndex = 0;
    if (enemy.id === 'sun_monarch') {
      addLog(combat, '日冕君主：终焉审判将至！');
    } else {
      enemy.statuses.strength = (enemy.statuses.strength || 0) + 3;
      addLog(combat, `${enemy.name} 进入第二阶段！`);
    }
  }

  if (enemy.id === 'void_lurker' && def.enrageAtHalf && !enemy.enraged) {
    if (ratio <= 0.5) {
      enemy.enraged = true;
      addLog(combat, '虚空潜伏者狂暴：攻击加倍！');
    }
  }
}

function processPoison(combat) {
  for (const enemy of combat.enemies) {
    const poison = enemy.statuses.poison || 0;
    if (poison > 0 && enemy.hp > 0) {
      enemy.hp -= poison;
      addLog(combat, `${enemy.name} 中毒 ${poison}`);
      addFloat(combat, enemy.index, `-${poison}`, 'poison');
    }
  }
}

function decayStatuses(combat) {
  const p = combat.player;
  if (p.statuses.intangible) p.statuses.intangible--;
  if (p.statuses.weak) p.statuses.weak--;
  if (p.statuses.frail) p.statuses.frail--;
  for (const e of combat.enemies) {
    if (e.statuses.vulnerable) e.statuses.vulnerable--;
    if (e.statuses.weak) e.statuses.weak--;
  }
}

function updateEnemyIntents(combat) {
  for (const enemy of combat.enemies) {
    if (enemy.hp <= 0) continue;
    const def = ENEMIES[enemy.id];
    const keys = getEnemyIntentKeys(def, enemy);
    let key = keys[enemy.intentIndex % keys.length];
    if (enemy.id === 'sun_monarch' && enemy.phase >= 2 && def.attack_judgment) {
      enemy.judgmentCounter = (enemy.judgmentCounter || 0) + 1;
      if (enemy.judgmentCounter % (def.attack_judgment.every || 3) === 0) key = 'attack_judgment';
    }
    if (enemy.id === 'void_lurker' && enemy.enraged && key === 'attack') {
      enemy.intent = buildIntent(def, 'attack_multi', enemy, combat);
      if (enemy.intent) enemy.intent.hits = 2;
      continue;
    }
    enemy.intent = buildIntent(def, key, enemy, combat);
  }
}

function buildIntent(def, key, enemy, combat) {
  const gdd = buildGddIntent(def, key, enemy, combat);
  if (gdd) return gdd;
  const str = (enemy.statuses.strength || 0) + (enemy.statuses.ritual || 0);
  if (key === 'sleep') return { type: 'sleep', display: '💤 沉睡' };
  if (key === 'split' || key === 'split_boss') return { type: 'split', display: '✨ 分裂' };
  if (key === 'buff') return { type: 'buff', value: def.buff || { strength: 2 }, display: '💪 强化' };
  if (key === 'debuff') return { type: 'debuff', value: def.debuff || def.debuff_big || { weak: 1 }, display: '🔻 削弱' };
  if (key === 'defend' || key === 'defend_big') {
    const range = def[key] || def.defend || [8, 12];
    const val = randRange(range[0], range[1]);
    return { type: 'defend', value: val, display: `🛡 防御 ${val}` };
  }
  if (key === 'heal') {
    const range = def.heal || [10, 14];
    return { type: 'heal', value: randRange(range[0], range[1]), display: '💚 治疗' };
  }
  if (key === 'special') return { type: 'special', value: 6, display: '🔥 地狱火' };
  if (key === 'special_big') return { type: 'special_big', value: 12, display: '🔥 烈焰' };
  if (key === 'special_time') return { type: 'special_time', display: '⏳ 时间扭曲' };
  if (key === 'special_strength') return { type: 'buff', value: { strength: 3 }, display: '💪 蓄力' };
  if (key === 'attack_multi' || key === 'attack_multi_big') {
    const range = def[key] || def.attack_multi || [6, 7];
    const hits = def.multiHits ? def.multiHits[enemy.intentIndex % def.multiHits.length] : 4;
    const val = randRange(range[0], range[1]) + str;
    return { type: 'attack_multi', value: val, hits, display: `⚔️ ${hits}×${val}` };
  }
  if (key.startsWith('attack')) {
    const range = def[key] || def.attack;
    const val = randRange(range[0], range[1]) + str;
    return { type: 'attack', value: val, display: `⚔️ ${val}` };
  }
  return { type: 'unknown', display: '❓' };
}

export function canPlayCard(combat, handIndex) {
  if (!combat.playerTurn || combat.ended) return false;
  const p = combat.player;
  const card = p.hand[handIndex];
  if (!card) return false;
  const def = CARD_POOL[card.id];
  if (def?.unplayable || card.unplayable) return false;
  if (def?.requireHpBelow != null && p.hp / p.maxHp >= def.requireHpBelow) return false;
  const rawCost = card.cost ?? def?.cost ?? 0;
  if (rawCost === -1 || def?.xCost) {
    if ((Number(p.energy) || 0) <= 0) return false;
  } else {
    const cost = getCardCost(combat, card);
    if (!Number.isFinite(cost) || cost < 0) return false;
    if (cost > (Number(p.energy) || 0)) return false;
  }
  const maxPlay = combat.maxCardsPerTurn ?? 99;
  if (maxPlay < 99 && combat.cardsPlayedThisTurn >= maxPlay) return false;
  if (card.type === 'attack') {
    const alive = combat.enemies.filter(e => e.hp > 0 && !e.escaped);
    if (!alive.length) return false;
  }
  return true;
}

export function getCardCost(combat, card) {
  if (card.freeThisTurn) return 0;
  const p = combat.player;
  const powers = p.powers || {};
  if (powers.corruption && card.type === 'skill') return 0;
  const def = CARD_POOL[card.id];
  const raw = card.cost ?? def?.cost ?? 0;
  let cost = Number(raw);
  if (raw === -1 || def?.xCost) cost = Math.max(0, Number(p.energy) || 0);
  if (!Number.isFinite(cost)) cost = 0;
  if (def?.costReducePerAttr) {
    cost -= combat.cardsPlayedByAttr?.[def.costReducePerAttr] || 0;
  }
  if (combat.eclipseComboDiscount?.[card.id]) {
    cost -= combat.eclipseComboDiscount[card.id];
  }
  if (p.powers?.void_form && getCardAttribute(card.id, def, null) === 'void') cost -= 1;
  if (p.powers?.eternal_noon?.sunCostReduce && getCardAttribute(card.id, def, null) === 'sun') {
    cost -= p.powers.eternal_noon.sunCostReduce;
  }
  if (def?.effects?.some(e => e.type === 'charge_cost_reduce') && (combat.charge || 0) > 0) {
    const red = Math.min(cost - 1, combat.charge);
    cost -= red;
  }
  const t = combat.battleTarot;
  if (t?.powerCostReduce && card.type === 'power') cost -= t.powerCostReduce;
  if (t?.firstCardFree && !t.firstCardUsed && !combat.player.firstCardPlayed) cost = 0;
  if (t?.firstSkillDiscount && !t.skillDiscountUsed && card.type === 'skill') cost -= t.firstSkillDiscount;
  if (t?.moonAttackDiscount && !t.moonDiscountUsed && card.type === 'attack') {
    if (getResonanceLayer(combat.resonance, 'moon') >= 1) cost -= 1;
  }
  cost -= getBurstAttackDiscount(combat, card);
  return Math.max(0, cost);
}

export function resolvePendingChoice(combat, game, payload) {
  const choice = combat.pendingChoice;
  if (!choice) return { ok: false };
  const p = combat.player;
  const helpers = getEffectHelpers(combat, game);

  switch (choice.type) {
    case 'retrieve_discard': {
      const card = choice.options?.[payload?.index]?.card;
      if (card) {
        const di = p.discard.findIndex(c => c.id === card.id);
        const picked = di >= 0 ? p.discard.splice(di, 1)[0] : repairCardInstance(card);
        const inst = repairCardInstance(picked);
        const toHand = choice.resToHand
          && getResonanceLayer(combat.resonance, choice.resToHand.attr) >= (choice.resToHand.min || 5);
        if (choice.toDrawTop && !toHand) p.drawPile.push(inst);
        else p.hand.push(inst);
      }
      break;
    }
    case 'duplicate_ethereal': {
      const idx = payload?.handIndex;
      if (idx != null && p.hand[idx]) {
        const copy = { ...repairCardInstance(p.hand[idx]), ethereal: true };
        for (let i = 0; i < (choice.count || 2); i++) p.hand.push({ ...copy });
        helpers.addLog(combat, `复制 ${copy.name}`);
      }
      break;
    }
    case 'exhaust_for_charge': {
      const idx = payload?.handIndex;
      if (idx != null && p.hand[idx]) {
        p.exhaust.push(p.hand.splice(idx, 1)[0]);
        const gain = choice.chargeGain || 2;
        combat.charge = Math.min(getMaxCharge(combat), (combat.charge || 0) + gain);
        helpers.addLog(combat, `充能 +${gain}`);
      }
      break;
    }
    case 'charge_or_block':
      if (payload?.pick === 'charge') {
        combat.charge = Math.min(getMaxCharge(combat), (combat.charge || 0) + (choice.charge || 5));
      } else {
        helpers.addBlock(combat, p, Math.min(choice.blockCap || 10, p.maxHp - p.hp));
      }
      break;
    case 'transform_hand': {
      const idx = payload?.handIndex;
      if (idx != null && p.hand[idx]) {
        p.hand[idx] = makeCard(choice.cardId || 'void_energy');
        helpers.addLog(combat, '手牌已转化');
      }
      break;
    }
    case 'exhaust_hand': {
      const indices = (payload?.indices || []).sort((a, b) => b - a);
      for (const i of indices) {
        if (p.hand[i]) p.exhaust.push(p.hand.splice(i, 1)[0]);
      }
      if (choice.thenDraw) drawCards(combat, choice.thenDraw);
      break;
    }
    case 'relic_cost_reduce': {
      const idx = payload?.handIndex;
      if (idx != null && p.hand[idx]) p.hand[idx].cost = Math.max(0, (p.hand[idx].cost || 0) - (choice.amount || 1));
      break;
    }
    case 'potion_resonance': {
      const attr = payload?.attr || ['sun', 'moon', 'star'][Math.floor(Math.random() * 3)];
      if (['sun', 'moon', 'star'].includes(attr)) {
        combat.resonance[attr] = Math.min(10, (combat.resonance[attr] || 0) + (choice.amount || 4));
        addLog(combat, `${attr} 共鸣 +${choice.amount || 4}`);
      }
      break;
    }
    default:
      break;
  }
  combat.pendingChoice = null;
  checkCombatEnd(combat, game);
  return { ok: true };
}

export function playCard(combat, game, handIndex, targetIndex = 0) {
  if (combat.pendingChoice) return { ok: false, reason: 'pending' };
  if (!canPlayCard(combat, handIndex)) return { ok: false };
  const p = combat.player;
  p.powers = p.powers || {};
  const card = p.hand[handIndex];
  const cardDef = CARD_POOL[card.id];
  let cost = getCardCost(combat, card);
  if ((cardDef?.cost === -1 || cardDef?.xCost) && cost > 0) combat.lastXCost = cost;
  combat.lastEnergySpent = cost;
  p.energy = Math.max(0, (Number(p.energy) || 0) - cost);
  p.hand.splice(handIndex, 1);
  combat.cardsPlayedThisTurn++;

  if (card.type === 'attack') {
    p.attacksPlayed++;
    if (game.relics.includes('pen_nib') && p.attacksPlayed % 10 === 0) p.penNibReady = true;
    if (game.relics.includes('fossilized_fist') && !combat.fossilUsed) {
      combat.fossilBonus = 8;
      combat.fossilUsed = true;
    }
    applyTarotOnAttackPlayed(combat);
  }

  const attr = getCardAttribute(card.id, cardDef, game.classId);
  const resResult = applyResonanceOnCardPlayed(combat, attr);
  for (const msg of resResult.logs) addLog(combat, msg);
  triggerRelics(combat, game, 'onResonanceChange', {
    attr, layer: getResonanceLayer(combat.resonance, attr),
    helpers: getEffectHelpers(combat, game),
  }).forEach(m => addLog(combat, m));
  tickTrialSharedResonance(combat, game, attr);
  if (resResult.crossEnergy) {
    triggerRelics(combat, game, 'onCrossResonance', { helpers: getEffectHelpers(combat, game) })
      .forEach(m => addLog(combat, m));
    if (p.powers?.eclipse_combo) {
      const cid = p.powers.eclipse_combo.cardId;
      combat.eclipseComboDiscount = combat.eclipseComboDiscount || {};
      combat.eclipseComboDiscount[cid] = (combat.eclipseComboDiscount[cid] || 0) + 1;
      addLog(combat, `月蚀连斩：${CARD_POOL[cid]?.name || cid} 费用 -1`);
    }
  }
  if (attr === 'void') {
    const core = combat.enemies.find(e => e.id === 'abyss_core' && e.hp > 0);
    if (core) {
      const heal = ENEMIES.abyss_core?.healOnVoidCard || 5;
      core.hp = Math.min(core.maxHp, core.hp + heal);
      addLog(combat, `星渊之核吸收虚空能量，回复 ${heal} 生命`);
    }
  }
  const eclipse = combat.enemies.find(e => e.id === 'eclipse_witch' && e.hp > 0);
  if (eclipse && attr === 'moon' && getResonanceLayer(combat.resonance, 'moon') >= 3) {
    const drawN = ENEMIES.eclipse_witch?.passive?.drawOnMoonResonance3 || 0;
    if (drawN > 0 && !combat.eclipseDrawUsed) {
      drawCards(combat, drawN);
      combat.eclipseDrawUsed = true;
      addLog(combat, '月蚀魔女被动：你抽到了额外卡牌');
    }
  }
  if (attr === 'sun' && cardDef?.attribute === 'sun') {
    for (const e of combat.enemies) {
      if (e.onPlayerSunCard) e.sunResonance = (e.sunResonance || 0) + 1;
    }
  }
  combat.cardsPlayedByAttr = combat.cardsPlayedByAttr || {};
  combat.cardsPlayedByAttr[attr] = (combat.cardsPlayedByAttr[attr] || 0) + 1;
  triggerRelics(combat, game, 'onCardPlayed', { card, attr, helpers: getEffectHelpers(combat, game) })
    .forEach(m => addLog(combat, m));
  applyGddPowerHooks(combat, game, 'cardPlayed', { card, attr });

  const t = combat.battleTarot;
  if (t?.firstCardFree && !combat.player.firstCardPlayed) t.firstCardUsed = true;
  if (t?.firstSkillDiscount && card.type === 'skill' && !t.skillDiscountUsed) t.skillDiscountUsed = true;
  if (t?.moonAttackDiscount && card.type === 'attack' && !t.moonDiscountUsed
    && getResonanceLayer(combat.resonance, 'moon') >= 1) {
    t.moonDiscountUsed = true;
  }
  consumeBurstAttackDiscount(combat, card);

  if (p.powers.after_image) p.block += p.powers.after_image;
  if (p.powers.echo && !p.echoUsed) {
    p.echoUsed = true;
    resolveCardEffects(combat, game, card, targetIndex);
    addLog(combat, '回响：卡牌再次生效');
  }

  resolveCardEffects(combat, game, card, targetIndex);

  if (combat.returnPlayedCardToHand) {
    p.hand.push(repairCardInstance(card));
    combat.returnPlayedCardToHand = false;
  } else if (!card.skipExhaust && (card.exhaust || (p.powers.corruption && card.type === 'skill'))) {
    p.exhaust.push(card);
    if (p.powers.feel_no_pain) p.block += p.powers.feel_no_pain;
    if (game.relics.includes('charons_ashes')) {
      const alive = combat.enemies.filter(e => e.hp > 0);
      if (alive.length) alive[Math.floor(Math.random() * alive.length)].hp -= 3;
    }
    if (game.relics.includes('bird_faced_urn')) p.hp = Math.min(p.maxHp, p.hp + 2);
    if (game.relics.includes('dead_branch')) {
      const pool = Object.keys(CARD_POOL).filter(k => !CARD_POOL[k].unplayable && CARD_POOL[k].rarity !== 'special');
      p.hand.push(makeCard(pool[Math.floor(Math.random() * pool.length)]));
      addLog(combat, '枯枝：获得随机牌');
    }
  } else {
    p.discard.push(card);
  }

  if (game.relics.includes('unceasing_top') && p.hand.length === 0) drawCards(combat, 1);

  p.firstCardPlayed = true;
  checkCombatEnd(combat, game);
  return { ok: true, discover: combat.pendingDiscover?.length ? combat.pendingDiscover : null };
}

function resolveCardEffects(combat, game, card, targetIndex) {
  const def = CARD_POOL[card.id];
  if (!def?.effects) return;
  const p = combat.player;
  let target = combat.enemies[targetIndex];
  const electro = p.powers.electro && card.type === 'attack';

  for (const eff of def.effects) {
    const val = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.value ?? eff.count ?? 1);
    switch (eff.type) {
      case 'damage':
      case 'multi_damage': {
        const hits = eff.hits || 1;
        for (let i = 0; i < hits; i++) {
          let dmg = calcAttackDamage(p, val, card, combat, game);
          const targets = electro ? combat.enemies.filter(e => e.hp > 0) : [target].filter(e => e?.hp > 0);
          for (const t of targets) {
            const dealt = applyDamageToEnemy(combat, t, dmg, game);
            addFloat(combat, t.index, `-${dealt}`, 'damage');
          }
        }
        if (game.relics.includes('blood_vial_starter') && p.lifestealCount < 5) {
          p.hp = Math.min(p.maxHp, p.hp + 1);
          p.lifestealCount++;
        }
        break;
      }
      case 'aoe_damage': {
        let dmg = calcAttackDamage(p, val, card, combat, game);
        for (const e of combat.enemies) if (e.hp > 0) applyDamageToEnemy(combat, e, dmg, game);
        addLog(combat, `${card.name} 造成 ${dmg} 点群体伤害`);
        break;
      }
      case 'aoe_lifesteal': {
        let total = 0;
        for (const e of combat.enemies) {
          if (e.hp > 0) total += applyDamageToEnemy(combat, e, calcAttackDamage(p, val, card, combat, game), game);
        }
        p.hp = Math.min(p.maxHp, p.hp + total);
        addLog(combat, `死神恢复 ${total} 点生命`);
        break;
      }
      case 'block': addBlock(combat, p, val); break;
      case 'draw': drawCards(combat, val); break;
      case 'energy': p.energy += val; break;
      case 'energy_next': p.energyNext = (p.energyNext || 0) + val; break;
      case 'buff':
        if (eff.status === 'barricade') p.powers.barricade = 1;
        else p.statuses[eff.status] = (p.statuses[eff.status] || 0) + val;
        break;
      case 'debuff':
        if (target?.hp > 0) target.statuses[eff.status] = (target.statuses[eff.status] || 0) + val;
        break;
      case 'debuff_all':
        for (const e of combat.enemies) if (e.hp > 0) e.statuses[eff.status] = (e.statuses[eff.status] || 0) + val;
        break;
      case 'hp_loss': p.hp -= applyHpLossReduce(game, val); break;
      case 'discard_random':
        if (p.hand.length) p.discard.push(p.hand.splice(Math.floor(Math.random() * p.hand.length), 1)[0]);
        break;
      case 'add_temp': {
        const count = eff.count ? (card.upgraded && eff.upgrade ? eff.upgrade : eff.count) : val;
        for (let i = 0; i < count; i++) {
          p.hand.push(makeCard(eff.card));
          if (CORRUPTION_CARD_IDS.includes(eff.card)) {
            applyGddPowerHooks(combat, game, 'corruptionGain', { helpers: getEffectHelpers(combat, game) });
          }
        }
        break;
      }
      case 'copy_to_discard': p.discard.push(makeCard(card.id, card.upgraded)); break;
      case 'double_poison':
        if (target) target.statuses.poison = (target.statuses.poison || 0) * 2;
        break;
      case 'conditional_strength': {
        const attacking = combat.enemies.some(e => e.intent?.type?.includes('attack'));
        if (attacking) p.statuses.strength = (p.statuses.strength || 0) + val;
        break;
      }
      case 'exhaust_hand_block': {
        const n = p.hand.length;
        p.exhaust.push(...p.hand);
        p.hand = [];
        addBlock(combat, p, val * n);
        break;
      }
      case 'retrieve_self': p.hand.push(makeCard(card.id, card.upgraded)); break;
      case 'power_corruption': p.powers.corruption = 1; break;
      case 'power_demon_form': p.powers.demon_form = val; break;
      case 'power_after_image': p.powers.after_image = val; break;
      case 'power_wraith': p.powers.wraith = val; break;
      case 'power_combust': p.powers.combust = val; break;
      case 'power_feel_no_pain': p.powers.feel_no_pain = val; break;
      case 'power_brutality': p.powers.brutality = val; break;
      case 'power_retain': p.powers.retain = val; break;
      case 'power_electro': p.powers.electro = 1; break;
      case 'power_storm': p.powers.storm = val; break;
      case 'power_echo': p.powers.echo = 1; break;
      case 'power_creative': p.powers.creative = 1; break;
      case 'power_magnetism': p.powers.magnetism = 1; break;
      case 'feed': {
        if (target && target.hp <= 0) combat.feedBonus = (combat.feedBonus || 0) + val;
        break;
      }
      case 'finale': {
        const n = p.drawPile.length;
        p.exhaust.push(...p.drawPile);
        p.drawPile = [];
        let dmg = calcAttackDamage(p, val, card, combat, game);
        for (const e of combat.enemies) if (e.hp > 0) for (let i = 0; i < n; i++) applyDamageToEnemy(combat, e, dmg, game);
        break;
      }
      case 'discard_hand_shiv': {
        const n = p.hand.length;
        p.discard.push(...p.hand);
        p.hand = [];
        for (let i = 0; i < n; i++) p.hand.push(makeCard('shiv'));
        break;
      }
      case 'block_per_draw': addBlock(combat, p, p.drawPile.length * val); break;
      case 'retrieve_zero_cost': {
        const zeros = p.discard.filter(c => c.cost === 0);
        p.discard = p.discard.filter(c => c.cost !== 0);
        p.hand.push(...zeros);
        break;
      }
      case 'upgrade_hand':
        p.hand = p.hand.map(c => upgradeCard(c));
        break;
      case 'add_deck':
        combat.addToDeck = combat.addToDeck || [];
        for (let i = 0; i < val; i++) combat.addToDeck.push(makeCard(eff.card));
        break;
      case 'clear_debuffs':
        for (const k of Object.keys(p.statuses)) if (STATUS[k]?.type === 'debuff') delete p.statuses[k];
        break;
      case 'discover': {
        const pool = Object.keys(CARD_POOL).filter(k => !CARD_POOL[k].unplayable && CARD_POOL[k].rarity !== 'basic' && CARD_POOL[k].rarity !== 'special');
        combat.pendingDiscover = [];
        const pickCount = Math.min(val, 3);
        const used = new Set();
        for (let i = 0; i < pickCount; i++) {
          let id = pool[Math.floor(Math.random() * pool.length)];
          let guard = 0;
          while (used.has(id) && guard++ < 20) id = pool[Math.floor(Math.random() * pool.length)];
          used.add(id);
          combat.pendingDiscover.push(makeCard(id));
        }
        break;
      }
      case 'random_colorless': {
        const neutral = ['trip', 'flash_of_steel', 'panacea', 'anger', 'pommel_strike'];
        for (let i = 0; i < val; i++) p.hand.push(makeCard(neutral[Math.floor(Math.random() * neutral.length)]));
        break;
      }
      case 'random_zero_cost':
        if (p.hand.length) p.hand[Math.floor(Math.random() * p.hand.length)].freeThisTurn = true;
        break;
      case 'damage_per_card': {
        const bonus = (eff.bonus || 2) * combat.cardsPlayedThisTurn;
        applyDamageToEnemy(combat, target, calcAttackDamage(p, val + bonus, card, combat, game), game);
        break;
      }
      default:
        if (isGddEffect(eff.type)) {
          resolveGddEffect({
            combat, game, card, eff, val, targetIndex,
            energySpent: combat.lastEnergySpent ?? combat.lastXCost,
            helpers: getEffectHelpers(combat, game),
          });
        }
        break;
    }
  }
  if (p.powers.storm && card.type === 'power') p.hand.push(makeCard('zap'));
}

function calcAttackDamage(p, base, card, combat, game = null) {
  let dmg = base + (p.statuses.strength || 0);
  if (CARD_POOL[card.id]?.effects?.some(e => e.strengthMult)) dmg += (p.statuses.strength || 0);
  if (p.statuses.focus && card.type === 'attack') dmg += p.statuses.focus;
  const t = combat?.battleTarot;
  if (t?.loversAttackBonus) dmg += t.loversAttackBonus;
  if (t?.sunBonusPerLayer) dmg += getResonanceLayer(combat.resonance, 'sun') * t.sunBonusPerLayer;
  if (p.statuses.weak) dmg = Math.floor(dmg * 0.75);
  if (p.penNibReady) { dmg *= 2; p.penNibReady = false; }
  if (combat.fossilBonus) { dmg += combat.fossilBonus; combat.fossilBonus = 0; }
  if (combat.charge && p.powers?.superconductor?.dmgPerCharge) {
    const cap = p.powers.superconductor.dmgCap ?? 10;
    const bonus = Math.min(cap, combat.charge) * (p.powers.superconductor.dmgPerCharge || 1);
    dmg += bonus;
  }
  if (game?.envTarot?.sunCardDamageBonus && getCardAttribute(card.id, CARD_POOL[card.id], game?.classId) === 'sun') {
    dmg += game.envTarot.sunCardDamageBonus;
  }
  if (combat.gameRef?.envTarot?.sunCardDamageBonus && getCardAttribute(card.id, CARD_POOL[card.id], combat.gameRef?.classId) === 'sun') {
    dmg += combat.gameRef.envTarot.sunCardDamageBonus;
  }
  const adb = p.powers?.attack_damage_bonus;
  if (adb && card.type === 'attack') {
    let bonus = adb.base || 0;
    if (adb.resAttr && getResonanceLayer(combat.resonance, adb.resAttr) >= (adb.resMin || 3)) {
      bonus = adb.resBonus || bonus;
    }
    dmg += bonus;
  }
  return Math.max(0, dmg);
}

function addBlock(combat, p, val) {
  let blk = val + (p.statuses.dexterity || 0);
  if (combat.battleTarot?.loversBlockBonus && val > 0) blk += combat.battleTarot.loversBlockBonus;
  if (combat.gameRef?.envTarot?.sunCardBlockBonus && val > 0) blk += combat.gameRef.envTarot.sunCardBlockBonus;
  if (p.statuses.frail) blk = Math.floor(blk * 0.75);
  p.block += blk;
  addLog(combat, `获得 ${blk} 点格挡`);
  addFloat(combat, -1, `+${blk}`, 'block');
}

function applyDamageToEnemy(combat, enemy, baseDmg, game = null) {
  const hpBefore = enemy.hp;
  let dmg = baseDmg;
  if (enemy.statuses.vulnerable) dmg = Math.floor(dmg * 1.5);
  const blocked = Math.min(enemy.block, dmg);
  enemy.block -= blocked;
  let hpDmg = dmg - blocked;
  if (enemy.shieldBroken && ENEMIES[enemy.id]?.attack_bigHalvedIfShield) {
    /* 破盾标记由攻击意图设置 */
  }
  enemy.hp -= hpDmg;

  const def = ENEMIES[enemy.id];
  if (def?.interrupt?.stun && hpDmg >= (def.interrupt.damage || 15)) {
    enemy.statuses.stun = (enemy.statuses.stun || 0) + (def.interrupt.stun || 1);
    enemy.charge = 0;
    addLog(combat, `${enemy.name} 充能被击晕！`);
  }
  if (def?.linked && hpDmg > 0) {
    const partner = combat.enemies.find(e => e.id === def.linked && e.hp > 0 && e.index !== enemy.index);
    if (partner) {
      const linkDmg = Math.floor(hpDmg * (def.damageLink ?? 0.5));
      partner.hp -= linkDmg;
      addLog(combat, `生命链接：${partner.name} 受到 ${linkDmg} 伤害`);
    }
  }
  if (enemy.block <= 0 && hpDmg > 0) enemy.shieldBroken = true;

  const t = combat.battleTarot;
  if (t?.towerDamage && hpBefore > 0 && enemy.hp > 0) {
    const pctLost = (hpBefore - enemy.hp) / enemy.maxHp;
    const thresholds = t.towerThresholds[enemy.index] || 0;
    const newThresholds = Math.floor(pctLost / 0.25);
    if (newThresholds > thresholds) {
      const hits = newThresholds - thresholds;
      t.towerThresholds[enemy.index] = newThresholds;
      enemy.hp -= t.towerDamage * hits;
      addLog(combat, `塔：${enemy.name} 受到 ${t.towerDamage * hits} 额外伤害`);
    }
  }

  const bhv = combat.player.powers?.big_hit_vulnerable;
  if (bhv && hpDmg >= (bhv.threshold || 15) && enemy.hp > 0) {
    enemy.statuses.vulnerable = (enemy.statuses.vulnerable || 0) + (bhv.value || 1);
  }

  if (enemy.hp <= 0) {
    onEnemyDeath(combat, game, enemy, def);
    if (game && t?.deathHeal && !def?.boss) {
      combat.player.hp = Math.min(combat.player.maxHp, combat.player.hp + t.deathHeal);
      addLog(combat, `死神塔罗：回复 ${t.deathHeal} 生命`);
    }
  }
  return hpDmg;
}

function onEnemyDeath(combat, game, enemy, def) {
  if (!def) return;
  if (def.enrageOnPartnerDeath) {
    const partnerId = def.linked;
    const partner = combat.enemies.find(e => e.id === partnerId && e.hp > 0);
    if (partner) {
      partner.statuses.strength = (partner.statuses.strength || 0) + (def.enrageOnPartnerDeath.strength || 4);
      addLog(combat, `${partner.name} 进入狂暴！`);
    }
  }
  const deathCorrupt = def.onDeath?.corruption || def.onDeath?.corruptionToHand;
  if (deathCorrupt) {
    const n = typeof deathCorrupt === 'number' ? deathCorrupt : 1;
    const cardId = def.onDeath?.card || 'corruption_mark';
    for (let i = 0; i < n; i++) combat.player.hand.push(makeCard(cardId));
    addLog(combat, `获得 ${n} 张${cardId === 'deep_corruption' ? '深度腐化' : '腐化印记'}`);
  }
  if (def.onAllyKilled?.buffOthers) {
    for (const e of combat.enemies) {
      if (e.hp > 0 && e.index !== enemy.index) {
        for (const [k, v] of Object.entries(def.onAllyKilled.buffOthers)) {
          e.statuses[k] = (e.statuses[k] || 0) + v;
        }
      }
    }
    addLog(combat, '三重试炼：幸存者力量 +3');
  }
  if (enemy.id === 'void_amalgam' || def.healFromCorruption) {
    const cfg = def.healFromCorruption || { perCard: 5, threshold: 0.3 };
    if (game && combat.player.hp / combat.player.maxHp <= cfg.threshold) {
      const piles = [...combat.player.hand, ...combat.player.discard, ...combat.player.drawPile];
      const corrupt = piles.filter(c => CORRUPTION_CARD_IDS.includes(c.id)).length;
      if (corrupt > 0) {
        const heal = corrupt * (cfg.perCard || 5);
        const alive = combat.enemies.find(e => e.hp > 0 && e.id === 'void_amalgam');
        if (alive) {
          alive.hp = Math.min(alive.maxHp, alive.hp + heal);
          addLog(combat, `虚空聚合体吸收腐化，回复 ${heal} 生命`);
        }
      }
    }
  }
}

function tickTrialSharedResonance(combat, game, attr) {
  const trials = combat.enemies.filter(e => e.hp > 0 && ENEMIES[e.id]?.sharedResonance);
  if (!trials.length || !['sun', 'moon', 'star'].includes(attr)) return;
  combat.trialResonance = combat.trialResonance || { sun: 0, moon: 0, star: 0 };
  combat.trialResonance[attr] = (combat.trialResonance[attr] || 0) + 1;
  const total = (combat.trialResonance.sun || 0) + (combat.trialResonance.moon || 0) + (combat.trialResonance.star || 0);
  addLog(combat, `三重试炼共鸣 ${total}/5`);
  const combo = ENEMIES.triple_trial_moon?.resonanceCombo;
  if (combo && total >= (combo.at || 5) && !combat.trialComboUsed) {
    combat.trialComboUsed = true;
    const lo = combo.damage?.[0] ?? 30;
    const hi = combo.damage?.[1] ?? lo;
    const dmg = lo + Math.floor(Math.random() * (hi - lo + 1));
    dealDamageToPlayer(combat, game, trials[0], dmg);
    addLog(combat, `试炼·月：共鸣爆发 ${dmg} 伤害！`);
    combat.trialResonance = { sun: 0, moon: 0, star: 0 };
  }
}

export function usePotion(combat, game, potionId, potionIndex) {
  const pot = POTIONS[potionId];
  if (!pot || !combat.playerTurn) return false;
  const p = combat.player;
  let eff = applyPotionAscension({ ...pot.effect }, game.ascension || 0);

  if (eff.miracle) {
    const pool = Object.keys(POTIONS).filter(id => id !== 'miracle_potion' && id !== 'tarot_potion');
    const picks = shuffle([...pool]).slice(0, 2);
    for (const subId of picks) {
      const sub = applyPotionAscension({ ...POTIONS[subId].effect }, game.ascension || 0);
      applyPotionEffectBlock(combat, game, sub);
      addLog(combat, `奇迹：${POTIONS[subId].name}`);
    }
    game.potions.splice(potionIndex, 1);
    checkCombatEnd(combat, game);
    return true;
  }

  if (eff.randomBattleTarot) {
    const used = new Set(game.selectedBattleTarots || [game.selectedBattleTarot].filter(Boolean));
    const pool = BATTLE_TAROT_IDS.filter(id => !used.has(id));
    const pick = pool[Math.floor(Math.random() * pool.length)] || BATTLE_TAROT_IDS[Math.floor(Math.random() * BATTLE_TAROT_IDS.length)];
    const ids = [...used, pick];
    const extra = createBattleTarotEffect(pick, !!game.pendingBoss);
    applyBattleTarotOnStart(combat, extra);
    combat.battleTarot = mergeBattleTarots(ids, !!game.pendingBoss);
    addLog(combat, `塔罗药水：获得 ${extra?.name} 效果`);
    game.potions.splice(potionIndex, 1);
    checkCombatEnd(combat, game);
    return true;
  }

  applyPotionEffectBlock(combat, game, eff);

  if (eff.onDeathRevive) combat.revivePotionReady = true;
  game.potions.splice(potionIndex, 1);
  addLog(combat, `使用 ${pot.name}`);
  checkCombatEnd(combat, game);
  return true;
}

function applyPotionEffectBlock(combat, game, eff) {
  const p = combat.player;
  if (eff.aoeDamage) for (const e of combat.enemies) if (e.hp > 0) applyDamageToEnemy(combat, e, eff.aoeDamage, game);
  if (eff.block) addBlock(combat, p, eff.block);
  if (eff.energy) p.energy += eff.energy;
  if (eff.draw) drawCards(combat, eff.draw);
  if (eff.heal) p.hp = Math.min(p.maxHp, p.hp + eff.heal);
  if (eff.healPercent) p.hp = Math.min(p.maxHp, p.hp + Math.floor(p.maxHp * eff.healPercent));
  if (eff.buff) for (const [k, v] of Object.entries(eff.buff)) p.statuses[k] = (p.statuses[k] || 0) + v;
  if (eff.debuffAll) for (const e of combat.enemies) for (const [k, v] of Object.entries(eff.debuffAll)) e.statuses[k] = (e.statuses[k] || 0) + v;
  if (eff.clearDebuffs) for (const k of Object.keys(p.statuses)) if (STATUS[k]?.type === 'debuff') delete p.statuses[k];
  if (eff.clearHandStatus) {
    p.hand = p.hand.filter(c => c.type !== 'status' && c.type !== 'curse' && CARD_POOL[c.id]?.rarity !== 'curse');
    addLog(combat, '净化手牌中的状态/诅咒牌');
  }
  if (eff.addCharge) { combat.charge = Math.min(getMaxCharge(combat), (combat.charge || 0) + eff.addCharge); addLog(combat, `充能 +${eff.addCharge}`); }
  if (eff.chooseResonance) {
    combat.pendingChoice = { type: 'potion_resonance', amount: eff.chooseResonance };
    addLog(combat, '选择共鸣属性…');
  }
  if (eff.exhaustCorruptionHeal || eff.purgeCorruption) {
    const healPer = eff.exhaustCorruptionHeal || eff.healPerCard || 3;
    const before = p.hand.length;
    p.hand = p.hand.filter(c => !CORRUPTION_CARD_IDS.includes(c.id));
    const n = before - p.hand.length;
    p.hp = Math.min(p.maxHp, p.hp + n * healPer);
    addLog(combat, `净化 ${n} 张腐化印记，回复 ${n * healPer} 生命`);
  }
  if (eff.overloadEnergy) {
    p.energy += eff.overloadEnergy;
    combat.pendingOverloadEnd = (combat.pendingOverloadEnd || 0) + (eff.endTurnDamage || eff.selfDamage || 5);
  }
  if (eff.endTurnDamage && !eff.overloadEnergy) {
    combat.pendingOverloadEnd = (combat.pendingOverloadEnd || 0) + eff.endTurnDamage;
  }
  if (eff.dodge || eff.dodgeNext) p.statuses.dodge = (p.statuses.dodge || 0) + (eff.dodge || eff.dodgeNext || 1);
}

function applyHpLossReduce(game, val) {
  if (game.relics.includes('tungsten_rod')) return Math.max(1, val - 1);
  return val;
}

function checkCombatEnd(combat, game) {
  const alive = combat.enemies.filter(e => e.hp > 0 && !e.escaped);
  if (alive.length === 0) {
    combat.ended = true;
    combat.victory = true;
    game.hp = combat.player.hp;
    if (combat.feedBonus) game.feedBonus = (game.feedBonus || 0) + combat.feedBonus;
    if (combat.addToDeck) game.deck.push(...combat.addToDeck);
    applyGddPowerHooks(combat, game, 'combatEndVictory', { helpers: getEffectHelpers(combat, game) });
    applyRelic(combat, game, 'onCombatEnd');
    addLog(combat, '✦ 战斗胜利！');
    return true;
  }
  if (combat.player.hp <= 0) {
    if (combat.revivePotionReady) {
      combat.revivePotionReady = false;
      const pct = 0.3;
      combat.player.hp = Math.max(1, Math.floor(combat.player.maxHp * pct));
      combat.ended = false;
      combat.victory = false;
      addLog(combat, `星辰复活药水：回复 ${Math.round(pct * 100)}% 生命`);
      return false;
    }
    combat.ended = true;
    combat.victory = false;
    return true;
  }
  return false;
}

export function applyRelic(combat, game, trigger) {
  for (const rid of game.relics) {
    const r = RELICS[rid];
    if (!r) continue;
    const p = combat?.player;
    if (trigger === 'onCombatStart') {
      if (r.onCombatStart?.buff) for (const [k, v] of Object.entries(r.onCombatStart.buff)) p.statuses[k] = (p.statuses[k] || 0) + v;
      if (r.onCombatStart?.draw) drawCards(combat, r.onCombatStart.draw);
      if (r.onCombatStart?.energy) p.energy += r.onCombatStart.energy;
      if (r.onCombatStart?.debuffAll) for (const e of combat.enemies) for (const [k, v] of Object.entries(r.onCombatStart.debuffAll)) e.statuses[k] = (e.statuses[k] || 0) + v;
      if (r.onCombatStart?.hpLoss) p.hp -= r.onCombatStart.hpLoss;
    }
    if (trigger === 'onCombatEnd' && r.onCombatEnd?.heal) game.hp = Math.min(game.maxHp, game.hp + r.onCombatEnd.heal);
  }
}

export function makeCard(id, upgraded = false) {
  const def = CARD_POOL[id];
  if (!def) return { id, name: '?', type: 'skill', cost: 1, desc: '', upgraded };
  return {
    id, name: def.name, type: def.type, cost: def.cost,
    rarity: def.rarity, upgraded, exhaust: def.exhaust || false,
    unplayable: def.unplayable || false,
    ethereal: def.ethereal || false,
    attribute: def.attribute,
    xCost: def.xCost || false,
    desc: formatCardDesc(def, upgraded),
  };
}

export function formatCardDesc(def, upgraded = false) {
  let desc = def.desc;
  for (const eff of def.effects || []) {
    const v = upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.value ?? eff.count);
    if (v !== undefined) desc = desc.replace('{dmg}', v).replace('{blk}', v);
  }
  return desc;
}

export function upgradeCard(card) {
  if (card.upgraded) return card;
  return { ...makeCard(card.id, true) };
}

function drawCards(combat, n) {
  const p = combat.player;
  for (let i = 0; i < n; i++) {
    if (p.hand.length >= HAND_MAX) {
      if (i === 0 && n > 0) addLog(combat, `手牌已满（${HAND_MAX}），无法抽牌`);
      break;
    }
    if (p.drawPile.length === 0) {
      if (p.discard.length === 0) break;
      p.drawPile = shuffle(p.discard.map(c => repairCardInstance(c)));
      p.discard = [];
      addLog(combat, '弃牌堆洗入抽牌堆');
    }
    if (p.drawPile.length === 0) break;
    p.hand.push(repairCardInstance(p.drawPile.pop()));
  }
}

export function getStatusList(entity) {
  return Object.entries(entity.statuses || {})
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ key: k, ...(STATUS[k] || { name: k, desc: '' }), value: v }));
}

function applyTarotTurnStart(combat, game, isFirst) {
  const t = combat.battleTarot;
  const p = combat.player;
  if (!t) return;

  if (t.magicianEnergy) {
    let bonus = 0;
    if (getResonanceLayer(combat.resonance, 'sun') >= 1) bonus++;
    if (getResonanceLayer(combat.resonance, 'moon') >= 1) bonus++;
    if (getResonanceLayer(combat.resonance, 'star') >= 1) bonus++;
    bonus = Math.min(2, bonus);
    if (bonus > 0) {
      p.energy += bonus;
      addLog(combat, `魔术师塔罗：+${bonus} 能量`);
    }
  }

  if (t.priestessDraw && p.hand.length <= (t.priestessHandMax || 3)) {
    drawCards(combat, t.priestessDraw);
    addLog(combat, `女祭司塔罗：抽 ${t.priestessDraw} 张牌`);
  }

  if (t.wheelDraw && p.hand.length === 0) {
    drawCards(combat, t.wheelDraw);
    addLog(combat, `命运之轮：抽 ${t.wheelDraw} 张牌`);
  }

  if (t.starBlockPerLayer) {
    const layers = getResonanceLayer(combat.resonance, 'star');
    if (layers > 0) {
      addBlock(combat, p, layers * t.starBlockPerLayer);
    }
  }

  if (t.judgementDamage && combat.turn >= (t.judgementFromTurn || 3)) {
    for (const e of combat.enemies) {
      if (e.hp > 0) {
        applyDamageToEnemy(combat, e, t.judgementDamage, game);
        addFloat(combat, e.index, `-${t.judgementDamage}`, 'damage');
      }
    }
    addLog(combat, `审判塔罗：全体 ${t.judgementDamage} 伤害`);
  }
}

function applyTarotEndTurn(combat, game) {
  const t = combat.battleTarot;
  const p = combat.player;
  if (!t) return;

  const res = combat.resonance;
  if (t.hierophantHeal && (res.sun || 0) + (res.moon || 0) + (res.star || 0) === 0) {
    p.hp = Math.min(p.maxHp, p.hp + t.hierophantHeal);
    addLog(combat, `教皇塔罗：回复 ${t.hierophantHeal} 生命`);
  }

  if (t.temperanceBlock && p.energy > 0) {
    addBlock(combat, p, t.temperanceBlock);
    addLog(combat, `节制塔罗：剩余能量转 ${t.temperanceBlock} 护盾`);
  }

  if (t.devilHpLoss) {
    p.hp -= t.devilHpLoss;
    addLog(combat, `恶魔塔罗：失去 ${t.devilHpLoss} 生命`);
  }
}

function applyTarotOnAttackPlayed(combat) {
  const t = combat.battleTarot;
  if (!t) return;
  const p = combat.player;

  if (t.attackBlockEvery) {
    t.attacksForEmperor = (t.attacksForEmperor || 0) + 1;
    if (t.attacksForEmperor >= t.attackBlockEvery) {
      t.attacksForEmperor = 0;
      addBlock(combat, p, t.attackBlockAmount || 2);
      addLog(combat, '皇帝塔罗：获得护盾');
    }
  }

  if (t.chariotEvery) {
    t.attacksForChariot = (t.attacksForChariot || 0) + 1;
    if (t.attacksForChariot >= t.chariotEvery) {
      t.attacksForChariot = 0;
      p.statuses.strength = (p.statuses.strength || 0) + (t.chariotStrength || 1);
      addLog(combat, '战车塔罗：获得力量');
    }
  }
}

export function useBurstSkill(combat, game, targetIndex = 0) {
  if (!canUseBurst(combat)) return { ok: false };
  const p = combat.player;
  const skill = BURST_SKILLS[game.classId];
  if (!skill) return { ok: false };

  combat.burst.charge = 0;
  combat.burst.cooldown = 2;

  switch (game.classId) {
    case 'iron_warrior':
      for (const e of combat.enemies) {
        if (e.hp <= 0) continue;
        const dealt = applyDamageToEnemy(combat, e, 15, game);
        addFloat(combat, e.index, `-${dealt}`, 'damage');
        e.statuses.vulnerable = (e.statuses.vulnerable || 0) + 2;
      }
      addBlock(combat, p, 8);
      addLog(combat, `${skill.name}：群体 15 伤 + 易伤 + 8 护盾`);
      break;
    case 'shadow_rogue':
      p.energy = (p.energy || 0) + 2;
      combat.burst.attackDiscountLeft = 3;
      combat.burst.attackDiscount = 1;
      addLog(combat, `${skill.name}：+2 能量，下 3 张攻击牌 -1 费`);
      break;
    case 'arcane_mage': {
      const target = combat.enemies[targetIndex] || combat.enemies.find(e => e.hp > 0);
      if (target) {
        const dealt = applyDamageToEnemy(combat, target, 12, game);
        addFloat(combat, target.index, `-${dealt}`, 'damage');
        target.statuses.stun = (target.statuses.stun || 0) + 1;
      }
      drawCards(combat, 3);
      addLog(combat, `${skill.name}：12 伤 + 击晕 + 抽 3`);
      break;
    }
    case 'blood_hunter': {
      p.hp -= 5;
      const target = combat.enemies[targetIndex] || combat.enemies.find(e => e.hp > 0);
      if (target) {
        const dealt = applyDamageToEnemy(combat, target, 30, game);
        addFloat(combat, target.index, `-${dealt}`, 'damage');
      }
      addLog(combat, `${skill.name}：失去 5 生命，造成 30 伤害`);
      break;
    }
    default:
      return { ok: false };
  }

  combat.vfxQueue = combat.vfxQueue || [];
  combat.vfxQueue.push({ type: 'burst', classId: game.classId });
  checkCombatEnd(combat, game);
  return { ok: true };
}

function getEffectHelpers(combat, game) {
  return {
    addLog,
    addBlock,
    addFloat,
    drawCards,
    applyDamageToEnemy: (c, e, d, g) => applyDamageToEnemy(c, e, d, g || game),
    calcAttackDamage: (p, b, card, c) => calcAttackDamage(p, b, card, c, game),
    makeCard,
    getCardAttribute,
    getResonanceLayer,
    getMaxResonanceLayer,
    useBurstSkill,
    checkCombatEnd: (c, g) => checkCombatEnd(c, g || game),
    CORRUPTION_CARD_IDS,
    makeCardFn: makeCard,
  };
}

function spawnMinion(combat, minionId, hp, parentIndex) {
  const def = ENEMIES[minionId];
  if (!def) return;
  const idx = combat.enemies.length;
  combat.enemies.push({
    id: minionId,
    name: def.name,
    art: def.art || '👾',
    hp, maxHp: hp, block: 0,
    intentIndex: 0, intent: null,
    statuses: {}, sleeping: false, escaped: false, index: idx, phase: 1,
  });
  addLog(combat, `召唤 ${def.name}！`);
}

function addLog(combat, msg) { combat.log.unshift(msg); if (combat.log.length > 12) combat.log.pop(); }
function addFloat(combat, target, text, type) {
  combat.floatTexts = combat.floatTexts || [];
  combat.floatTexts.push({ target, text, type, t: Date.now() });
  combat.vfxQueue = combat.vfxQueue || [];
  combat.vfxQueue.push({ type, target, text });
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function randRange(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
