/** GDD 遗物触发引擎 — 《星渊之塔》 */
import { RELICS as GDD_RELICS } from './data/gdd-relics.js';
import { RELICS as BASE_RELICS } from './data/relics.js';
import { getResonanceLayer, getMaxResonanceLayer } from './resonance.js';
import { CARD_POOL } from './data/gdd-cards.js';

const RES_ATTRS = ['sun', 'moon', 'star'];
const RANDOM_RES = ['sun', 'moon', 'star'];

function lookupRelic(id, relicsMap) {
  return relicsMap?.[id] || GDD_RELICS[id] || BASE_RELICS[id] || null;
}

function relicState(combat, relicId) {
  combat.relicState = combat.relicState || {};
  if (!combat.relicState[relicId]) combat.relicState[relicId] = {};
  return combat.relicState[relicId];
}

function oncePerCombat(combat, relicId, key) {
  const st = relicState(combat, relicId);
  const k = key || 'used';
  if (st[k]) return true;
  st[k] = true;
  return false;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function applyBurstCharge(combat, amount) {
  if (!combat.burst) return;
  const max = 5;
  combat.burst.charge = Math.min(max, (combat.burst.charge || 0) + amount);
}

function applyResonanceTrigger(combat, relic, relicId, cfg, ctx, logs) {
  const { attr, layer, helpers } = ctx;
  const st = relicState(combat, relicId);
  const p = combat.player;

  if (cfg.firstReach != null && layer >= cfg.firstReach && cfg.once && !st[`reach_${attr}_${cfg.firstReach}`]) {
    st[`reach_${attr}_${cfg.firstReach}`] = true;
    if (cfg.block) { helpers?.addBlock?.(combat, p, cfg.block); logs.push(`${relic.name}：+${cfg.block} 护盾`); }
    if (cfg.energy) { p.energy = (p.energy || 0) + cfg.energy; logs.push(`${relic.name}：+${cfg.energy} 能量`); }
    if (cfg.draw) { helpers?.drawCards?.(combat, cfg.draw); logs.push(`${relic.name}：抽 ${cfg.draw} 张`); }
    if (cfg.burstCharge) { applyBurstCharge(combat, cfg.burstCharge); logs.push(`${relic.name}：爆发充能 +${cfg.burstCharge}`); }
    if (cfg.strength) { p.statuses.strength = (p.statuses.strength || 0) + cfg.strength; logs.push(`${relic.name}：+${cfg.strength} 力量`); }
    if (cfg.dodgeNext) { p.statuses.dodge = (p.statuses.dodge || 0) + cfg.dodgeNext; logs.push(`${relic.name}：闪避下次攻击`); }
  }

  if (cfg.atLeast != null && layer >= cfg.atLeast && cfg.once && !st[`at_${attr}_${cfg.atLeast}`]) {
    st[`at_${attr}_${cfg.atLeast}`] = true;
    if (cfg.strength) { p.statuses.strength = (p.statuses.strength || 0) + cfg.strength; logs.push(`${relic.name}：+${cfg.strength} 力量`); }
    if (cfg.dodgeNext) { p.statuses.dodge = (p.statuses.dodge || 0) + cfg.dodgeNext; logs.push(`${relic.name}：闪避`); }
    if (cfg.burstCharge) { applyBurstCharge(combat, cfg.burstCharge); logs.push(`${relic.name}：爆发充能 +${cfg.burstCharge}`); }
  }

  if (cfg.reach != null && attr === 'burstCharge' && (combat.charge || 0) >= cfg.reach) {
    const k = `charge_${cfg.reach}`;
    if (!cfg.once || !st[k]) {
      if (cfg.once) st[k] = true;
      if (cfg.energy) { p.energy = (p.energy || 0) + cfg.energy; logs.push(`${relic.name}：+${cfg.energy} 能量`); }
      if (cfg.burstCharge) { applyBurstCharge(combat, cfg.burstCharge); logs.push(`${relic.name}：爆发充能 +${cfg.burstCharge}`); }
    }
  }
}

function handleCombatStart(combat, game, relic, relicId, eff, ctx, logs) {
  const p = combat.player;
  const helpers = ctx.helpers || {};

  if (eff.shuffleCorruption) {
    for (let i = 0; i < eff.shuffleCorruption; i++) {
      p.drawPile.push(helpers.makeCard?.('corruption_mark') || { id: 'corruption_mark', name: '腐化印记', type: 'status', cost: -1 });
    }
    p.drawPile = shuffle(p.drawPile);
    logs.push(`${relic.name}：${eff.shuffleCorruption} 张腐化印记洗入抽牌堆`);
  }

  if (eff.randomResonance) {
    const a = RANDOM_RES[Math.floor(Math.random() * RANDOM_RES.length)];
    combat.resonance[a] = Math.min(10, (combat.resonance[a] || 0) + eff.randomResonance);
    logs.push(`${relic.name}：${a} 共鸣 +${eff.randomResonance}`);
  }

  if (eff.resonance) {
    for (const [a, v] of Object.entries(eff.resonance)) {
      if (RES_ATTRS.includes(a)) combat.resonance[a] = Math.max(combat.resonance[a] || 0, v);
    }
    logs.push(`${relic.name}：初始共鸣层数`);
  }

  if (eff.buffRandomHand) {
    const { type, damage, block } = eff.buffRandomHand;
    const pool = p.hand.filter(c => c.type === type);
    if (pool.length) {
      const c = pool[Math.floor(Math.random() * pool.length)];
      if (damage) c.bonusDamage = (c.bonusDamage || 0) + damage;
      if (block) c.bonusBlock = (c.bonusBlock || 0) + block;
      logs.push(`${relic.name}：强化 ${c.name}`);
    }
  }

  if (eff.buff) {
    for (const [k, v] of Object.entries(eff.buff)) p.statuses[k] = (p.statuses[k] || 0) + v;
    logs.push(`${relic.name}：获得增益`);
  }

  if (eff.draw) { helpers.drawCards?.(combat, eff.draw); logs.push(`${relic.name}：抽 ${eff.draw} 张`); }
  if (eff.energy) { p.energy = (p.energy || 0) + eff.energy; logs.push(`${relic.name}：+${eff.energy} 能量`); }
  if (eff.maxEnergy) { p.maxEnergy = (p.maxEnergy || 3) + eff.maxEnergy; p.energy = (p.energy || 0) + eff.maxEnergy; }
  if (eff.block) helpers.addBlock?.(combat, p, eff.block);
  if (eff.hpLoss) { p.hp -= eff.hpLoss; logs.push(`${relic.name}：失去 ${eff.hpLoss} 生命`); }

  if (eff.buffAllEnemies) {
    for (const e of combat.enemies) {
      for (const [k, v] of Object.entries(eff.buffAllEnemies)) e.statuses[k] = (e.statuses[k] || 0) + v;
    }
    logs.push(`${relic.name}：敌人强化`);
  }

  if (eff.debuffAll) {
    for (const e of combat.enemies) {
      for (const [k, v] of Object.entries(eff.debuffAll)) e.statuses[k] = (e.statuses[k] || 0) + v;
    }
  }

  if (eff.upgradeNonRareDeck) {
    for (const c of p.drawPile) {
      const def = CARD_POOL[c.id];
      if (def && def.rarity !== 'rare' && def.rarity !== 'legendary') c.upgraded = true;
    }
    logs.push(`${relic.name}：牌组随机升级`);
  }

  if (eff.chooseHandCostReduce) {
    combat.pendingChoice = { type: 'relic_cost_reduce', amount: eff.chooseHandCostReduce, relicId };
    logs.push(`${relic.name}：选择一张手牌减费`);
  }

  if (eff.soulTransformCharges) {
    relicState(combat, relicId).soulCharges = eff.soulTransformCharges;
  }

  if (eff.randomBattleTarot) {
    game.pendingRandomBattleTarot = (game.pendingRandomBattleTarot || 0) + eff.randomBattleTarot;
  }
}

function handleTurnStart(combat, game, relic, relicId, eff, ctx, logs) {
  const p = combat.player;
  const helpers = ctx.helpers || {};

  if (eff.block) { helpers.addBlock?.(combat, p, eff.block); logs.push(`${relic.name}：+${eff.block} 护盾`); }
  if (eff.energy) { p.energy = (p.energy || 0) + eff.energy; logs.push(`${relic.name}：+${eff.energy} 能量`); }
  if (eff.draw) { helpers.drawCards?.(combat, eff.draw); logs.push(`${relic.name}：抽 ${eff.draw} 张`); }
  if (eff.heal) { p.hp = Math.min(p.maxHp, p.hp + eff.heal); logs.push(`${relic.name}：回复 ${eff.heal}`); }

  if (eff.aoeDamage) {
    for (const e of combat.enemies) if (e.hp > 0) helpers.applyDamageToEnemy?.(combat, e, eff.aoeDamage, game);
    logs.push(`${relic.name}：群体 ${eff.aoeDamage} 伤害`);
  }

  if (eff.everyNthTurn?.n) {
    if (combat.turn % eff.everyNthTurn.n === 0) {
      p.energy = (p.energy || 0) + (eff.everyNthTurn.energy || 1);
      logs.push(`${relic.name}：周期能量`);
    }
  }

  if (eff.ifMoonResonance?.atLeast) {
    if (getResonanceLayer(combat.resonance, 'moon') >= eff.ifMoonResonance.atLeast) {
      p.energy = (p.energy || 0) + (eff.ifMoonResonance.energy || 2);
      logs.push(`${relic.name}：月影共鸣能量`);
    }
  }

  if (eff.sunResonance) {
    combat.resonance.sun = Math.max(0, (combat.resonance.sun || 0) + eff.sunResonance);
  }
  if (eff.moonResonance) {
    combat.resonance.moon = Math.max(0, (combat.resonance.moon || 0) + eff.moonResonance);
  }
  if (eff.starResonance) {
    combat.resonance.star = Math.max(0, (combat.resonance.star || 0) + eff.starResonance);
  }

  if (eff.highestResonanceBonus) {
    let best = 'sun';
    let bestVal = getResonanceLayer(combat.resonance, 'sun');
    for (const a of ['moon', 'star']) {
      const v = getResonanceLayer(combat.resonance, a);
      if (v > bestVal) { bestVal = v; best = a; }
    }
    const bonus = eff.highestResonanceBonus[best];
    if (bonus) {
      if (bonus.strength) p.statuses.strength = (p.statuses.strength || 0) + bonus.strength;
      if (bonus.dexterity) p.statuses.dexterity = (p.statuses.dexterity || 0) + bonus.dexterity;
      if (bonus.burstCharge) applyBurstCharge(combat, bonus.burstCharge);
      logs.push(`${relic.name}：${best} 系增益`);
    }
  }

  if (eff.addCards) {
    for (const [cid, count] of Object.entries(eff.addCards)) {
      for (let i = 0; i < count; i++) p.hand.push(helpers.makeCard?.(cid) || { id: cid, cost: 0 });
    }
    logs.push(`${relic.name}：获得卡牌`);
  }
}

function handleTurnEnd(combat, game, relic, relicId, eff, ctx, logs) {
  const p = combat.player;
  const helpers = ctx.helpers || {};

  if (eff.hpLoss) { p.hp -= eff.hpLoss; logs.push(`${relic.name}：失去 ${eff.hpLoss} 生命`); }

  if (eff.ifEnergyLeft?.block && (p.energy || 0) > 0) {
    helpers.addBlock?.(combat, p, eff.ifEnergyLeft.block);
    logs.push(`${relic.name}：剩余能量护盾`);
  }

  if (eff.energyZero?.energy && (p.energy || 0) === 0) {
    if (!eff.energyZero.once || !oncePerCombat(combat, relicId, 'energyZero')) {
      p.energy = (p.energy || 0) + eff.energyZero.energy;
      logs.push(`${relic.name}：零能量补偿`);
    }
  }

  if (eff.ifNoResonance?.hpLoss) {
    const total = getMaxResonanceLayer(combat.resonance);
    if (total <= 0) {
      p.hp -= eff.ifNoResonance.hpLoss;
      logs.push(`${relic.name}：无共鸣惩罚`);
    }
  }
}

function handleCrossResonance(combat, game, relic, relicId, eff, ctx, logs) {
  const p = combat.player;
  const helpers = ctx.helpers || {};

  if (eff.block) { helpers.addBlock?.(combat, p, eff.block); logs.push(`${relic.name}：+${eff.block} 护盾`); }
  if (eff.draw) { helpers.drawCards?.(combat, eff.draw); logs.push(`${relic.name}：抽 ${eff.draw} 张`); }
  if (eff.tempEnergy) { p.energy = (p.energy || 0) + eff.tempEnergy; logs.push(`${relic.name}：+${eff.tempEnergy} 临时能量`); }

  if (eff.ifEnergyReward?.draw && ctx.energyReward) {
    helpers.drawCards?.(combat, eff.ifEnergyReward.draw);
    logs.push(`${relic.name}：跨系抽牌`);
  }

  if (eff.noResonanceLoss?.oncePerCombat) {
    if (!oncePerCombat(combat, relicId, 'noResLoss')) {
      combat.skipNextResonanceLoss = true;
      logs.push(`${relic.name}：共鸣稳定`);
    }
  }
}

function handleCardPlayed(combat, game, relic, relicId, eff, ctx, logs) {
  const p = combat.player;
  const helpers = ctx.helpers || {};
  const card = ctx.card;

  if (eff.firstXCost?.blockEqualsCost && card?.xCost && !oncePerCombat(combat, relicId, 'firstXCost')) {
    const cost = ctx.energySpent || 0;
    helpers.addBlock?.(combat, p, cost);
    logs.push(`${relic.name}：X 费护盾 ${cost}`);
  }

  if (eff.dexterityTemp) {
    p.statuses.dexterity = (p.statuses.dexterity || 0) + eff.dexterityTemp;
    combat.tempDexNextTurn = (combat.tempDexNextTurn || 0) + eff.dexterityTemp;
  }

  if (eff.ifAttack?.strengthTemp && card?.type === 'attack') {
    p.statuses.strength = (p.statuses.strength || 0) + eff.ifAttack.strengthTemp;
    combat.tempStrNextTurn = (combat.tempStrNextTurn || 0) + eff.ifAttack.strengthTemp;
  }

  if (eff.ifAttack?.damagePerBurstCharge && card?.type === 'attack') {
    const bonus = (combat.charge || 0) * eff.ifAttack.damagePerBurstCharge;
    card.bonusDamage = (card.bonusDamage || 0) + bonus;
  }

  if (eff.sameElementStreak) {
    const st = relicState(combat, relicId);
    const attr = ctx.cardAttr;
    if (attr) {
      if (st.lastAttr === attr) st.streak = (st.streak || 0) + 1;
      else { st.lastAttr = attr; st.streak = 1; }
      if (st.streak >= eff.sameElementStreak.at && !st.upgraded) {
        st.upgraded = true;
        if (p.hand.length) {
          const i = Math.floor(Math.random() * p.hand.length);
          p.hand[i] = { ...p.hand[i], upgraded: true };
          logs.push(`${relic.name}：升级 ${p.hand[i].name}`);
        }
      }
    }
  }
}

function handleDamageDealt(combat, game, relic, relicId, eff, ctx, logs) {
  if (eff.ifTargetVulnerable?.bonus && ctx.target?.statuses?.vulnerable) {
    ctx.bonusDamage = (ctx.bonusDamage || 0) + eff.ifTargetVulnerable.bonus;
    logs.push(`${relic.name}：易伤 +${eff.ifTargetVulnerable.bonus}`);
  }
}

function handleDamageTaken(combat, game, relic, relicId, eff, ctx, logs) {
  const p = combat.player;
  const helpers = ctx.helpers || {};
  const amt = ctx.amount || 0;

  if (eff.reduce && eff.ifAbove && amt > eff.ifAbove) {
    ctx.reduced = (ctx.reduced || 0) + eff.reduce;
    logs.push(`${relic.name}：减伤 ${eff.reduce}`);
  }

  if (eff.thorns && amt > 0 && ctx.enemy?.hp > 0) {
    helpers.applyDamageToEnemy?.(combat, ctx.enemy, eff.thorns, game);
    logs.push(`${relic.name}：反伤 ${eff.thorns}`);
  }
}

function handleCombatEnd(combat, game, relic, relicId, eff, ctx, logs) {
  if (eff.ifElite?.heal && game.pendingElite) {
    game.hp = Math.min(game.maxHp, game.hp + eff.ifElite.heal);
    logs.push(`${relic.name}：精英战后回复`);
  }

  if (eff.ifVictory?.healFull && combat.victory) {
    game.hp = game.maxHp;
    logs.push(`${relic.name}：满血回复`);
  }

  if (eff.ifHpBelow != null && game.hp / game.maxHp < eff.ifHpBelow && eff.healToPercent) {
    game.hp = Math.max(game.hp, Math.floor(game.maxHp * eff.healToPercent));
    logs.push(`${relic.name}：低血回复`);
  }

  if (eff.hpLoss) {
    game.hp = Math.max(1, game.hp - eff.hpLoss);
    logs.push(`${relic.name}：战后失去 ${eff.hpLoss} 生命`);
  }

  if (eff.ifNotBoss?.extraRelicChance && !game.pendingBoss && Math.random() < eff.ifNotBoss.extraRelicChance) {
    game.pendingExtraRelic = true;
    logs.push(`${relic.name}：额外遗物机会`);
  }
}

/**
 * 触发遗物 hook，返回日志消息列表。
 * @param {object} combat
 * @param {object} game
 * @param {string} hook — onCombatStart | onTurnStart | onTurnEnd | onResonanceChange | onCrossResonance | onCardPlayed | onDamageDealt | onDamageTaken | onEnemyKilled | onCombatEnd | onExhaust | onCorruptionGain | onCorruptionExhaust | onBlockGain | onDiscardEmpty | onDrawPileEmpty | onDebuffApplied | onDebuffDealt | onFatal | onHpThreshold | onBurstRelease | onOverloadDamage | onVoidCard | onFloorStart | onObtain | onChest | onFirstShop
 * @param {object} ctx — hook 上下文 + helpers
 * @param {object} [relicsMap] — 可选 RELICS 合并表，避免循环依赖
 */
export function triggerRelics(combat, game, hook, ctx = {}, relicsMap = null) {
  const logs = [];
  if (!game?.relics?.length) return logs;
  combat.relicState = combat.relicState || {};

  for (const relicId of game.relics) {
    const relic = lookupRelic(relicId, relicsMap);
    if (!relic) continue;

    const hookData = relic[hook];
    if (!hookData && hook !== 'onResonanceChange') continue;

    switch (hook) {
      case 'onCombatStart':
        handleCombatStart(combat, game, relic, relicId, hookData, ctx, logs);
        if (relic.onTurnEnd?.hpLoss) { /* fool_stone handled at turn end */ }
        break;

      case 'onTurnStart':
        handleTurnStart(combat, game, relic, relicId, hookData, ctx, logs);
        break;

      case 'onTurnEnd':
        handleTurnEnd(combat, game, relic, relicId, hookData, ctx, logs);
        break;

      case 'onResonanceChange': {
        const rc = relic.onResonanceChange;
        if (!rc) break;
        if (rc.any) {
          const maxLayer = getMaxResonanceLayer(combat.resonance);
          applyResonanceTrigger(combat, relic, relicId, rc.any, { ...ctx, attr: 'any', layer: maxLayer }, logs);
        }
        for (const attr of RES_ATTRS) {
          if (rc[attr]) {
            applyResonanceTrigger(combat, relic, relicId, rc[attr], {
              ...ctx, attr, layer: getResonanceLayer(combat.resonance, attr),
            }, logs);
          }
        }
        if (rc.burstCharge) {
          applyResonanceTrigger(combat, relic, relicId, rc.burstCharge, {
            ...ctx, attr: 'burstCharge', layer: combat.charge || 0,
          }, logs);
        }
        if (rc.every3Total) {
          const total = RES_ATTRS.reduce((s, a) => s + getResonanceLayer(combat.resonance, a), 0);
          const st = relicState(combat, relicId);
          const tier = Math.floor(total / 3);
          while ((st.every3Tier || 0) < tier) {
            st.every3Tier = (st.every3Tier || 0) + 1;
            const b = rc.every3Total;
            if (b.strength) combat.player.statuses.strength = (combat.player.statuses.strength || 0) + b.strength;
            if (b.dexterity) combat.player.statuses.dexterity = (combat.player.statuses.dexterity || 0) + b.dexterity;
            if (b.burstCharge) applyBurstCharge(combat, b.burstCharge);
            logs.push(`${relic.name}：三系共鸣奖励`);
          }
        }
        break;
      }

      case 'onCrossResonance':
        handleCrossResonance(combat, game, relic, relicId, hookData, ctx, logs);
        break;

      case 'onCardPlayed':
        handleCardPlayed(combat, game, relic, relicId, hookData, ctx, logs);
        break;

      case 'onDamageDealt':
        handleDamageDealt(combat, game, relic, relicId, hookData, ctx, logs);
        break;

      case 'onDamageTaken':
        handleDamageTaken(combat, game, relic, relicId, hookData, ctx, logs);
        break;

      case 'onEnemyKilled':
        if (hookData?.heal) {
          combat.player.hp = Math.min(combat.player.maxHp, combat.player.hp + hookData.heal);
          logs.push(`${relic.name}：击杀回复`);
        }
        break;

      case 'onCombatEnd':
        handleCombatEnd(combat, game, relic, relicId, hookData, ctx, logs);
        break;

      case 'onExhaust':
        if (hookData?.block) { ctx.helpers?.addBlock?.(combat, combat.player, hookData.block); logs.push(`${relic.name}：+${hookData.block} 护盾`); }
        break;

      case 'onCorruptionGain': {
        const st = relicState(combat, relicId);
        if (hookData?.draw) {
          const cap = hookData.capPerTurn ?? 99;
          if ((st.corruptionDrawTurn || 0) < cap) {
            st.corruptionDrawTurn = (st.corruptionDrawTurn || 0) + 1;
            ctx.helpers?.drawCards?.(combat, hookData.draw);
            logs.push(`${relic.name}：腐化抽牌`);
          }
        }
        if (hookData?.strength) {
          combat.player.statuses.strength = (combat.player.statuses.strength || 0) + hookData.strength;
          logs.push(`${relic.name}：+${hookData.strength} 力量`);
        }
        break;
      }

      case 'onCorruptionExhaust':
        if (hookData?.heal) {
          combat.player.hp = Math.min(combat.player.maxHp, combat.player.hp + hookData.heal);
          logs.push(`${relic.name}：消耗腐化回复`);
        }
        break;

      case 'onBlockGain':
        if (hookData?.bonus) {
          ctx.extraBlock = (ctx.extraBlock || 0) + hookData.bonus;
        }
        break;

      case 'onDiscardEmpty':
        if (hookData?.energy) {
          combat.player.energy = (combat.player.energy || 0) + hookData.energy;
          logs.push(`${relic.name}：弃牌堆空 +能量`);
        }
        break;

      case 'onDrawPileEmpty':
        if (hookData?.reshuffleDraw && (!hookData.once || !oncePerCombat(combat, relicId, 'drawEmpty'))) {
          const p = combat.player;
          p.drawPile = shuffle([...p.drawPile, ...p.discard]);
          p.discard = [];
          ctx.helpers?.drawCards?.(combat, hookData.reshuffleDraw);
          logs.push(`${relic.name}：洗抽`);
        }
        break;

      case 'onDebuffApplied':
        if (hookData?.negate && hookData.once && !oncePerCombat(combat, relicId, 'negateDebuff')) {
          ctx.negated = true;
          logs.push(`${relic.name}：无效化减益`);
        }
        break;

      case 'onDebuffDealt':
        if (hookData?.ifVulnerable?.extraStacks && ctx.status === 'vulnerable') {
          ctx.extraStacks = (ctx.extraStacks || 0) + hookData.ifVulnerable.extraStacks;
        }
        if (hookData?.ifWeak?.durationBonus && ctx.status === 'weak') {
          ctx.durationBonus = (ctx.durationBonus || 0) + hookData.ifWeak.durationBonus;
        }
        break;

      case 'onFatal':
        if (hookData?.revivePercent && hookData.once && !oncePerCombat(combat, relicId, 'fatal')) {
          combat.player.hp = Math.max(1, Math.floor(combat.player.maxHp * hookData.revivePercent));
          ctx.revived = true;
          logs.push(`${relic.name}：复活`);
        }
        break;

      case 'onHpThreshold':
        if (hookData?.below != null && combat.player.hp / combat.player.maxHp < hookData.below) {
          if (!hookData.once || !oncePerCombat(combat, relicId, 'hpThreshold')) {
            if (hookData.block) ctx.helpers?.addBlock?.(combat, combat.player, hookData.block);
            if (hookData.strength) combat.player.statuses.strength = (combat.player.statuses.strength || 0) + hookData.strength;
            logs.push(`${relic.name}：低血触发`);
          }
        }
        break;

      case 'onBurstRelease':
        if (hookData?.aoeDamage) {
          for (const e of combat.enemies) if (e.hp > 0) ctx.helpers?.applyDamageToEnemy?.(combat, e, hookData.aoeDamage, game);
          logs.push(`${relic.name}：爆发 ${hookData.aoeDamage} 群体伤害`);
        }
        break;

      case 'onOverloadDamage':
        if (hookData?.blockEqualsDamage && ctx.amount) {
          ctx.helpers?.addBlock?.(combat, combat.player, ctx.amount);
          logs.push(`${relic.name}：过载护盾`);
        }
        break;

      case 'onVoidCard':
        if (hookData?.skipResonanceBreakChance && Math.random() < hookData.skipResonanceBreakChance) {
          ctx.skipResonanceBreak = true;
          logs.push(`${relic.name}：虚空不中断共鸣`);
        }
        break;

      case 'onFloorStart':
        if (hookData?.heal) { game.hp = Math.min(game.maxHp, game.hp + hookData.heal); logs.push(`${relic.name}：层初回复`); }
        if (hookData?.healFull) { game.hp = game.maxHp; logs.push(`${relic.name}：层初满血`); }
        break;

      case 'onObtain':
        if (hookData?.maxHp) { game.maxHp += hookData.maxHp; game.hp = Math.max(1, game.hp + hookData.maxHp); }
        if (hookData?.heal) game.hp = Math.min(game.maxHp, game.hp + hookData.heal);
        if (hookData?.gold) { game.gold = (game.gold || 0) + hookData.gold; logs.push(`${relic.name}：+${hookData.gold} 金币`); }
        if (hookData?.removeCards) game.pendingRemoveCards = (game.pendingRemoveCards || 0) + hookData.removeCards;
        if (hookData?.useLegendaryPotion) game.pendingLegendaryPotion = true;
        break;

      case 'onChest':
        if (hookData?.extraLoot) game.chestExtraLoot = true;
        if (hookData?.addCurse) game.pendingChestCurse = (game.pendingChestCurse || 0) + hookData.addCurse;
        break;

      case 'onFirstShop':
        if (hookData?.copyCard) game.pendingShopCopy = hookData.copyCard;
        break;

      default:
        break;
    }

    // 被动字段在 applyRelicPassives 处理；此处仅处理带 hook 的复合遗物
    if (hook === 'onTurnEnd' && relic.onCombatStart?.draw && relic.id === 'fool_stone') {
      /* fool_stone draw at combat start already in onCombatStart */
    }
  }

  return logs;
}

/**
 * 汇总遗物被动修正到 game / combat。
 * @param {object} game
 * @param {object} [combat] — 战斗中则写入 combat.relicPassives
 * @param {object} [relicsMap]
 */
export function applyRelicPassives(game, combat = null, relicsMap = null) {
  const passives = {
    goldBonus: 0,
    shopDiscount: 0,
    maxPotions: 0,
    handSize: 0,
    maxEnergy: 0,
    burstChargeRequired: 5,
    burstChargeMaxBonus: 0,
    revealElites: false,
    powerCostReduce: 0,
    cardCostReduce: 0,
    attackDamageMult: 1,
    enemyHpMult: 1,
    rewardGoldMult: 1,
    cardRewardMinRarity: null,
    resonanceGainMult: 1,
    overloadSelfDamageMult: 1,
    burstEffectMult: 1,
    burstNoCooldown: false,
    voidNoResonanceBreak: false,
    retainHand: 0,
    restForgeDiscount: 0,
    restForgeHpReduce: 0,
    durationBonus: 0,
    eventSuccessMult: 1,
    noGoldGain: false,
    extraCardReward: 0,
    extraBattleTarot: 0,
    extraEnvTarot: 0,
    envTarotEffectMult: 1,
    battleTarotLimit: null,
    battleTarotEffectMult: 1,
    envTarotRerollPerAct: 0,
    preciseIntents: false,
    alwaysFirstTurn: false,
    sharedResonanceDisplay: false,
    syncResonance: false,
    resonanceNoDecay: {},
    onVoidCard: {},
  };

  for (const relicId of game.relics || []) {
    const r = lookupRelic(relicId, relicsMap);
    if (!r) continue;

    if (r.goldBonus) passives.goldBonus += r.goldBonus;
    if (r.shopDiscount) passives.shopDiscount += r.shopDiscount;
    if (r.maxPotions) passives.maxPotions += r.maxPotions;
    if (r.handSize) passives.handSize += r.handSize;
    if (r.maxEnergy) passives.maxEnergy += r.maxEnergy;
    if (r.burstChargeRequired) passives.burstChargeRequired = r.burstChargeRequired;
    if (r.burstChargeMaxBonus) passives.burstChargeMaxBonus += r.burstChargeMaxBonus;
    if (r.revealElites) passives.revealElites = true;
    if (r.powerCostReduce) passives.powerCostReduce += r.powerCostReduce;
    if (r.cardCostReduce) passives.cardCostReduce += r.cardCostReduce;
    if (r.attackDamageMult) passives.attackDamageMult *= r.attackDamageMult;
    if (r.enemyHpMult) passives.enemyHpMult *= r.enemyHpMult;
    if (r.rewardGoldMult) passives.rewardGoldMult *= r.rewardGoldMult;
    if (r.cardRewardMinRarity) passives.cardRewardMinRarity = r.cardRewardMinRarity;
    if (r.resonanceGainMult) passives.resonanceGainMult *= r.resonanceGainMult;
    if (r.overloadSelfDamageMult) passives.overloadSelfDamageMult = r.overloadSelfDamageMult;
    if (r.burstEffectMult) passives.burstEffectMult *= r.burstEffectMult;
    if (r.burstNoCooldown) passives.burstNoCooldown = true;
    if (r.voidNoResonanceBreak) passives.voidNoResonanceBreak = true;
    if (r.retainHand) passives.retainHand += r.retainHand;
    if (r.restForgeDiscount) passives.restForgeDiscount = Math.max(passives.restForgeDiscount, r.restForgeDiscount);
    if (r.restForgeHpReduce) passives.restForgeHpReduce += r.restForgeHpReduce;
    if (r.durationBonus) passives.durationBonus += r.durationBonus;
    if (r.eventSuccessMult) passives.eventSuccessMult *= r.eventSuccessMult;
    if (r.noGoldGain) passives.noGoldGain = true;
    if (r.extraCardReward) passives.extraCardReward += r.extraCardReward;
    if (r.extraBattleTarot) passives.extraBattleTarot += r.extraBattleTarot;
    if (r.extraEnvTarot) passives.extraEnvTarot += r.extraEnvTarot;
    if (r.envTarotEffectMult) passives.envTarotEffectMult *= r.envTarotEffectMult;
    if (r.battleTarotLimit != null) passives.battleTarotLimit = r.battleTarotLimit;
    if (r.battleTarotEffectMult) passives.battleTarotEffectMult *= r.battleTarotEffectMult;
    if (r.envTarotRerollPerAct) passives.envTarotRerollPerAct += r.envTarotRerollPerAct;
    if (r.preciseIntents) passives.preciseIntents = true;
    if (r.alwaysFirstTurn) passives.alwaysFirstTurn = true;
    if (r.sharedResonanceDisplay) passives.sharedResonanceDisplay = true;
    if (r.syncResonance) passives.syncResonance = true;
    if (r.resonanceNoDecay) Object.assign(passives.resonanceNoDecay, r.resonanceNoDecay);
    if (r.onVoidCard) Object.assign(passives.onVoidCard, r.onVoidCard);
  }

  game.relicPassives = passives;
  if (passives.maxPotions) game.maxPotions = 3 + passives.maxPotions;

  if (combat?.player) {
    combat.relicPassives = passives;
    if (passives.maxEnergy) {
      combat.player.maxEnergy = (combat.player.maxEnergy || 3) + passives.maxEnergy;
    }
  }

  return passives;
}
