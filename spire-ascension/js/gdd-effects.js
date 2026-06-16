/** GDD 卡牌效果解析 — 《星渊之塔》 */
import { getResonanceLayer } from './resonance.js';
import { CORRUPTION_CARD_IDS } from './data/gdd-cards.js';

const GDD_EFFECT_TYPES = new Set([
  'cond_res_damage', 'cond_res_block', 'cond_res_draw', 'cond_res_energy', 'cond_res_buff',
  'cond_res_double', 'cond_res_exempt_exhaust',
  'bonus_per_res_layer', 'martyr', 'kill_heal', 'convert_max_res_block', 'free_burst',
  'retrieve_discard_by_attr', 'purge_curses_aoe', 'discard_hand_draw', 'cond_cards_played_attr',
  'cond_cards_played',
  'power_solar_aura', 'power_scorched', 'power_immortal_flame', 'power_eternal_noon',
  'power_phoenix_rebirth', 'power_unyielding', 'power_afterimage_formation', 'power_moon_wheel',
  'power_shadow_veil', 'power_werewolf_blood',
  'add_charge', 'spend_all_charge_damage', 'spend_all_charge_block', 'charge_cost_reduce', 'overload',
  'corruption_shuffle', 'exhaust_corruption_damage', 'add_void_resonance', 'x_cost_damage', 'chain_reaction',
  'stun', 'mirror_target', 'zero_cost_attr_hand', 'duplicate_hand_ethereal', 'next_attack_discount',
  'exhaust_hand_card_for_charge', 'choice_charge_or_block', 'shuffle_discard_to_draw', 'siphon_enemy_stats',
  'power_star_surge', 'power_charge_amp', 'power_superconductor', 'power_stardust_body', 'power_ultimate_overload',
  'power_corrupt_heart', 'power_void_form', 'power_calamity_source', 'power_self_annihilation', 'power_corrupt_aura',
  'exhaust_corruption_shield', 'void_convert_hand', 'shadow_deal_exhaust', 'nihil_shield', 'symbiosis',
  'repeat_by_hp_lost', 'damage_per_card_played', 'retrieve_discard_zero_cost',
  'exhaust_corruption_block_draw', 'transform_hand_card', 'exhaust_hand_cards', 'add_resonance',
  'power_nihil_shield',
  // 扩展包
  'on_vulnerable_strength', 'cond_res_return_hand', 'exhaust_status_double_damage', 'execute_damage',
  'power_attack_damage_bonus', 'power_incoming_reduce', 'cond_cards_played_draw',
  'power_eclipse_combo', 'damage_res_layers', 'x_cost_random_multi', 'cond_no_hit_last_turn_block',
  'moon_solo_discard_draw', 'power_scaling_block', 'power_zero_cost_block', 'power_eternal_resonance',
  'star_arrow', 'halve_enemy_block', 'splash_damage', 'damage_per_debuff', 'charge_next_turn_block_loss',
  'cond_charge_block', 'charge_to_draw', 'delay_enemy_intent', 'power_per_attr_played',
  'exhaust_non_attr_charge', 'power_charge_threshold_block', 'power_gravity_warp',
  'exhaust_corruption_double', 'count_corruption_damage_bonus', 'discard_for_damage',
  'exhaust_hand_draw_corruption_heal', 'steal_strength_block', 'power_first_corruption_draw',
  'power_eternal_void', 'power_on_strength_gain', 'power_big_hit_vulnerable',
]);

export function isGddEffect(type) {
  return GDD_EFFECT_TYPES.has(type);
}

function effVal(ctx, eff) {
  const { card } = ctx;
  if (card.upgraded && eff.upgrade !== undefined) return eff.upgrade;
  return eff.value ?? eff.count ?? 1;
}

function resMin(ctx, eff) {
  const res = eff.resonance;
  if (!res) return 0;
  if (ctx.card.upgraded && res.upgrade !== undefined) return res.upgrade;
  return res.min ?? 0;
}

function meetsResonance(ctx, eff) {
  const res = eff.resonance;
  if (!res?.attr) return false;
  return getResonanceLayer(ctx.combat.resonance, res.attr) >= resMin(ctx, eff);
}

export function getMaxCharge(combat) {
  const sc = combat.player?.powers?.superconductor;
  if (sc?.maxCharge) return sc.maxCharge;
  return 10 + (combat.relicPassives?.burstChargeMaxBonus || 0);
}

function addCharge(combat, amount, helpers) {
  const max = getMaxCharge(combat);
  const prev = combat.charge || 0;
  combat.charge = Math.min(max, prev + amount);
  if (combat.charge > prev) {
    helpers.addLog(combat, `充能 +${combat.charge - prev}（${combat.charge}/${max}）`);
    const ratio = combat.player.powers?.stardust_body?.ratio;
    if (ratio) helpers.addBlock(combat, combat.player, Math.floor((combat.charge - prev) * ratio));
    const ctb = combat.player.powers?.charge_threshold_block;
    if (ctb && prev < ctb.threshold && combat.charge >= ctb.threshold) {
      helpers.addBlock(combat, combat.player, ctb.block || 2);
      helpers.addLog(combat, `星能共鸣：获得 ${ctb.block || 2} 护盾`);
    }
  }
}

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isCorruptionCard(id, helpers) {
  return (helpers.CORRUPTION_CARD_IDS || CORRUPTION_CARD_IDS).includes(id);
}

function isCurseOrStatus(card, helpers) {
  if (isCorruptionCard(card.id, helpers)) return true;
  const attr = helpers.getCardAttribute?.(card.id, null, null);
  return card.type === 'status' || card.type === 'curse';
}

function getTarget(ctx) {
  return ctx.combat.enemies[ctx.targetIndex] || ctx.combat.enemies.find(e => e.hp > 0);
}

function countCardsPlayedAttr(combat, attr, helpers) {
  const log = combat.cardsPlayedLog || [];
  return log.filter(c => helpers.getCardAttribute(c.id, null, null) === attr).length;
}

function countCorruptionInPiles(combat, helpers) {
  const p = combat.player;
  const all = [...p.hand, ...p.drawPile, ...p.discard];
  return all.filter(c => isCorruptionCard(c.id, helpers)).length;
}

function countEnemyDebuffTypes(enemy) {
  const debuffs = ['weak', 'vulnerable', 'poison', 'corrupt_infection', 'strength'];
  let n = 0;
  for (const k of debuffs) {
    if ((enemy.statuses?.[k] || 0) > 0) n++;
    if (k === 'strength' && (enemy.statuses?.strength || 0) < 0) n++;
  }
  return n;
}

function applyStrengthGain(combat, amount, temp = false) {
  if (amount <= 0) return;
  const p = combat.player;
  p.powers = p.powers || {};
  let gain = amount;
  if (p.powers.on_strength_gain && !combat.solarWrathUsedThisTurn) {
    gain += p.powers.on_strength_gain.value || 1;
    combat.solarWrathUsedThisTurn = true;
  }
  p.statuses.strength = (p.statuses.strength || 0) + gain;
}

/** 伤害修正：intentBonus、bonus_per_res_layer 等 */
export function getGddDamageModifiers(ctx, eff, baseDmg) {
  const { combat, card, helpers, targetIndex } = ctx;
  let dmg = baseDmg;
  const p = combat.player;

  if (combat.bonusPerResLayer) {
    const { attr, perLayer } = combat.bonusPerResLayer;
    dmg += helpers.getResonanceLayer(combat.resonance, attr) * perLayer;
  }

  if (eff?.intentBonus != null) {
    const target = combat.enemies[targetIndex];
    const bonus = card.upgraded && eff.upgradeIntentBonus != null ? eff.upgradeIntentBonus : eff.intentBonus;
    if (target?.intent?.type?.includes('attack')) dmg += bonus;
  }

  if (combat.doubleDamageThisCard) dmg *= 2;

  const sc = p.powers?.superconductor;
  if (sc && card.type === 'attack') {
    const per = sc.dmgPerCharge || 1;
    const cap = sc.dmgCap ?? 10;
    const chargeBonus = Math.min(cap, (combat.charge || 0) * per);
    dmg += chargeBonus;
  }

  if (combat.mirrorTargetIndex != null && targetIndex === combat.mirrorTargetIndex && combat.mirrorMult) {
    dmg = Math.floor(dmg * combat.mirrorMult);
  }

  return Math.max(0, dmg);
}

/** 能力牌持续效果 — combat 在对应 hook 调用 */
export function applyGddPowerHooks(combat, game, hook, ctx = {}) {
  const p = combat.player;
  const pw = p.powers || {};
  const helpers = ctx.helpers;
  if (!helpers) return;

  if (hook === 'turnStart') {
    combat.solarWrathUsedThisTurn = false;
    if (combat.pendingBlockLossNextTurn) {
      p.block = Math.max(0, (p.block || 0) - combat.pendingBlockLossNextTurn);
      helpers.addLog(combat, `充能过载：失去 ${combat.pendingBlockLossNextTurn} 护盾`);
      combat.pendingBlockLossNextTurn = 0;
    }
    if (pw.gravity_warp) {
      const extra = Math.floor((combat.charge || 0) / (pw.gravity_warp.perCharge || 3));
      const total = (pw.gravity_warp.base || -1) + extra;
      for (const e of combat.enemies) {
        if (e.hp > 0) e.statuses.strength = (e.statuses.strength || 0) + total;
      }
      if (total) helpers.addLog(combat, `引力扭曲：敌人力量 ${total}`);
    }
    if (pw.star_surge) addCharge(combat, pw.star_surge, helpers);
    if (pw.scorched) {
      let dmg = pw.scorched.value || 4;
      const rb = pw.scorched.resBonus;
      if (rb && helpers.getResonanceLayer(combat.resonance, rb.attr) >= (rb.min || 5)) dmg = rb.damage || dmg;
      for (const e of combat.enemies) {
        if (e.hp > 0) helpers.applyDamageToEnemy(combat, e, dmg, game);
      }
      helpers.addLog(combat, `焦土：全体敌人受到 ${dmg} 点伤害`);
    }
    if (pw.corrupt_aura) {
      const n = pw.corrupt_aura.corruptionToHand || 1;
      for (let i = 0; i < n; i++) p.hand.push(helpers.makeCard('corruption_mark'));
      const aoe = pw.corrupt_aura.aoeDamage || 2;
      for (const e of combat.enemies) if (e.hp > 0) helpers.applyDamageToEnemy(combat, e, aoe, game);
      helpers.addLog(combat, `腐化光环：获得 ${n} 张腐化印记，全体受到 ${aoe} 伤害`);
    }
    if (combat.pendingOverload) {
      p.hp -= combat.pendingOverload;
      helpers.addLog(combat, `过载：失去 ${combat.pendingOverload} 生命`);
      combat.pendingOverload = 0;
    }
    if (pw.moon_wheel) {
      const need = pw.moon_wheel.cardsLastTurn || 4;
      if ((combat.cardsPlayedLastTurn || 0) >= need) {
        p.energy = (p.energy || 0) + (pw.moon_wheel.energy || 1);
        helpers.addLog(combat, '月轮：获得 1 点能量');
      }
    }
  }

  if (hook === 'turnEnd') {
    combat.cardsPlayedLastTurn = combat.cardsPlayedThisTurn || 0;
    combat.damageTakenLastTurn = combat.damageTakenThisTurn || 0;
    combat.damageTakenThisTurn = 0;
    if (pw.ultimate_overload) combat.ultimateOverloadUsed = false;
    if (pw.unyielding) delete pw.unyielding;
    if (pw.afterimage_formation) delete pw.afterimage_formation;
    if (pw.nihil_shield) delete pw.nihil_shield;
    if (pw.incoming_reduce) delete pw.incoming_reduce;
    if (pw.attack_damage_bonus) delete pw.attack_damage_bonus;
    if (pw.per_attr_played) delete pw.per_attr_played;
  }

  if (hook === 'cardPlayed') {
    const card = ctx.card;
    if (!card) return;
    const attr = helpers.getCardAttribute(card.id, null, game?.classId);
    if (pw.solar_aura && attr === 'sun') helpers.addBlock(combat, p, pw.solar_aura);
    if (pw.shadow_veil && card.type === 'attack') helpers.addBlock(combat, p, pw.shadow_veil);
    if (pw.afterimage_formation && card.type === 'attack') {
      const alive = combat.enemies.filter(e => e.hp > 0);
      if (alive.length) {
        const t = alive[Math.floor(Math.random() * alive.length)];
        helpers.applyDamageToEnemy(combat, t, pw.afterimage_formation, game);
      }
    }
    if (pw.charge_amp && ctx.crossEnergy) addCharge(combat, pw.charge_amp, helpers);
    if (pw.corrupt_heart && isCorruptionCard(card.id, helpers)) {
      p.statuses.strength = (p.statuses.strength || 0) + (pw.corrupt_heart || 1);
    }
    if (pw.calamity_source && card.exhaustedThisPlay) {
      const alive = combat.enemies.filter(e => e.hp > 0);
      if (alive.length) {
        const t = alive[Math.floor(Math.random() * alive.length)];
        helpers.applyDamageToEnemy(combat, t, pw.calamity_source, game);
      }
    }
    if (pw.zero_cost_block && (card.cost === 0 || card.freeThisTurn)) {
      helpers.addBlock(combat, p, pw.zero_cost_block);
    }
    if (pw.per_attr_played && helpers.getCardAttribute(card.id, null, game?.classId) === pw.per_attr_played.attr) {
      if (pw.per_attr_played.block) helpers.addBlock(combat, p, pw.per_attr_played.block);
      if (pw.per_attr_played.charge) addCharge(combat, pw.per_attr_played.charge, helpers);
    }
    combat.cardsPlayedLog = combat.cardsPlayedLog || [];
    combat.cardsPlayedLog.push({ id: card.id, type: card.type });
  }

  if (hook === 'blockLost') {
    const lost = ctx.amount || 0;
    if (pw.immortal_flame && lost > 0) {
      const dmg = Math.floor(lost * (pw.immortal_flame.ratio || 0.5));
      const alive = combat.enemies.filter(e => e.hp > 0);
      if (alive.length && dmg > 0) {
        const t = alive[Math.floor(Math.random() * alive.length)];
        helpers.applyDamageToEnemy(combat, t, dmg, game);
        helpers.addLog(combat, `不灭阳炎：造成 ${dmg} 点伤害`);
      }
    }
  }

  if (hook === 'damageTaken') {
    const amt = ctx.amount || 0;
    if (pw.unyielding && amt > 0) helpers.addBlock(combat, p, pw.unyielding);
    if (pw.nihil_shield && amt > 0) helpers.addBlock(combat, p, pw.nihil_shield.perHit || 3);
    if (pw.werewolf_blood && amt > 0) {
      p.statuses.strength = (p.statuses.strength || 0) + (pw.werewolf_blood.onDamage || 1);
    }
  }

  if (hook === 'corruptionGain') {
    if (pw.corrupt_heart) p.statuses.strength = (p.statuses.strength || 0) + (pw.corrupt_heart || 1);
    if (pw.first_corruption_draw && !combat.firstCorruptionDrawn) {
      combat.firstCorruptionDrawn = true;
      helpers.drawCards(combat, pw.first_corruption_draw || 1);
      helpers.addLog(combat, '腐化蔓延：抽 1 张牌');
    }
  }

  if (hook === 'combatEndVictory') {
    if (pw.eternal_resonance) {
      const er = pw.eternal_resonance;
      const layer = helpers.getResonanceLayer(combat.resonance, er.attr);
      if (layer >= (er.resMin || 8)) {
        if (er.combatEndHeal) {
          game.hp = Math.min(game.maxHp, game.hp + er.combatEndHeal);
          helpers.addLog(combat, `永恒共鸣：回复 ${er.combatEndHeal} 生命`);
        }
        if (er.combatEndEnergy) game.nextCombatStartEnergy = (game.nextCombatStartEnergy || 0) + er.combatEndEnergy;
        if (er.combatEndCharge) game.persistCharge = er.combatEndCharge;
      }
    }
    if (pw.eternal_void_no_break && game.hp / game.maxHp < (pw.eternal_void_no_break.hpThreshold || 0.3)) {
      game.hp = Math.max(game.hp, Math.floor(game.maxHp * (pw.eternal_void_no_break.healPercent || 0.5)));
      helpers.addLog(combat, '永恒虚空：回复至 50% 生命');
    }
  }

  if (hook === 'fatal') {
    if (pw.phoenix_rebirth && !combat.phoenixUsed) {
      combat.phoenixUsed = true;
      p.hp = Math.max(1, Math.floor(p.maxHp * (pw.phoenix_rebirth.healPercent || 0.5)));
      delete pw.phoenix_rebirth;
      helpers.addLog(combat, '凤凰重生：复活！');
      return true;
    }
    if (pw.self_annihilation && !game.selfAnnihilationUsed) {
      game.selfAnnihilationUsed = true;
      const dmg = Math.floor(p.maxHp * (pw.self_annihilation.damagePercent || 0.5));
      for (const e of combat.enemies) if (e.hp > 0) helpers.applyDamageToEnemy(combat, e, dmg, game);
      p.hp = pw.self_annihilation.reviveHp || 1;
      delete pw.self_annihilation;
      helpers.addLog(combat, `自我湮灭：全体 ${dmg} 伤害，保留 1 生命`);
      return true;
    }
  }
}

export function resolveGddEffect(ctx) {
  const { combat, game, card, eff, val, targetIndex, helpers } = ctx;
  if (!isGddEffect(eff.type)) return false;

  const p = combat.player;
  p.powers = p.powers || {};
  const v = val ?? effVal(ctx, eff);
  const target = getTarget(ctx);

  switch (eff.type) {
    case 'cond_res_damage':
      if (meetsResonance(ctx, eff)) {
        const dmg = helpers.calcAttackDamage(p, v, card, combat);
        const t = getTarget(ctx);
        if (t?.hp > 0) {
          const final = getGddDamageModifiers(ctx, eff, dmg);
          helpers.applyDamageToEnemy(combat, t, final, game);
          helpers.addFloat(combat, t.index, `-${final}`, 'damage');
        }
      }
      break;

    case 'cond_res_block':
      if (meetsResonance(ctx, eff)) helpers.addBlock(combat, p, v);
      break;

    case 'cond_res_draw':
      if (meetsResonance(ctx, eff)) helpers.drawCards(combat, v);
      break;

    case 'cond_res_energy':
      if (meetsResonance(ctx, eff)) p.energy = (p.energy || 0) + v;
      break;

    case 'cond_res_buff':
      if (meetsResonance(ctx, eff)) {
        const amount = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.value ?? 1);
        if (eff.permanent || !eff.temp) p.statuses[eff.status] = (p.statuses[eff.status] || 0) + amount;
        else p.statuses[eff.status] = (p.statuses[eff.status] || 0) + amount;
      }
      break;

    case 'cond_res_double':
      if (meetsResonance(ctx, eff)) combat.doubleDamageThisCard = true;
      break;

    case 'cond_res_exempt_exhaust':
      if (meetsResonance(ctx, eff)) combat.exemptExhaust = true;
      break;

    case 'bonus_per_res_layer':
      combat.bonusPerResLayer = { attr: eff.attr, perLayer: eff.perLayer || 1 };
      break;

    case 'martyr': {
      const hpLoss = card.upgraded && eff.upgradeHpLoss != null ? eff.upgradeHpLoss : (eff.hpLoss || 3);
      p.hp -= hpLoss;
      helpers.addLog(combat, `殉道：失去 ${hpLoss} 生命`);
      const dmg = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.damage || 15);
      if (target?.hp > 0) {
        const dealt = helpers.applyDamageToEnemy(combat, target, helpers.calcAttackDamage(p, dmg, card, combat), game);
        helpers.addFloat(combat, target.index, `-${dealt}`, 'damage');
      }
      const layers = helpers.getResonanceLayer(combat.resonance, eff.resAttr || 'sun');
      const strGain = Math.floor(layers / (eff.strPerLayers || 2));
      if (strGain > 0) {
        p.statuses.strength = (p.statuses.strength || 0) + strGain;
        helpers.addLog(combat, `殉道：获得 ${strGain} 点力量（本回合）`);
        combat.martyrStrTemp = strGain;
      }
      break;
    }

    case 'kill_heal':
      combat.killHealThisCard = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : v;
      break;

    case 'convert_max_res_block': {
      const res = combat.resonance;
      let bestAttr = 'sun';
      let best = helpers.getResonanceLayer(res, 'sun');
      for (const a of ['moon', 'star']) {
        const layer = helpers.getResonanceLayer(res, a);
        if (layer > best) { best = layer; bestAttr = a; }
      }
      const cap = eff.max || 10;
      const bonus = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.bonus || 0);
      const blk = Math.min(cap, best + bonus);
      if (blk > 0) {
        helpers.addBlock(combat, p, blk);
        res[bestAttr] = 0;
        helpers.addLog(combat, `共鸣转化：${bestAttr} 层数归零，获得 ${blk} 护盾`);
      }
      break;
    }

    case 'free_burst': {
      if (eff.oncePerRun && game.freeBurstUsed) break;
      if (helpers.useBurstSkill(combat, game, targetIndex)?.ok) {
        if (eff.oncePerRun) game.freeBurstUsed = true;
        combat.burst.cooldown = 0;
        helpers.addLog(combat, '免费共鸣爆发');
      }
      break;
    }

    case 'retrieve_discard_by_attr': {
      const matches = p.discard.filter(c => helpers.getCardAttribute(c.id, null, game.classId) === eff.attr);
      if (matches.length) {
        combat.pendingChoice = {
          type: 'retrieve_discard',
          options: matches.map((c, i) => ({ index: i, card: c })),
          attr: eff.attr,
          toDrawTop: eff.toDrawTop,
          resToHand: eff.resToHand,
        };
        helpers.addLog(combat, '选择弃牌堆中的一张牌');
      }
      break;
    }

    case 'purge_curses_aoe': {
      const per = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.perCard || 3);
      let extra = 0;
      const kept = [];
      for (const c of p.hand) {
        if (isCurseOrStatus(c, helpers)) { extra += per; p.exhaust.push(c); }
        else kept.push(c);
      }
      p.hand = kept;
      if (extra > 0) {
        for (const e of combat.enemies) {
          if (e.hp > 0) helpers.applyDamageToEnemy(combat, e, extra, game);
        }
        helpers.addLog(combat, `净化：额外 ${extra} 点群体伤害`);
      }
      break;
    }

    case 'discard_hand_draw': {
      const n = p.hand.length;
      const sunReturn = eff.sunReturnToDeck;
      const toProcess = [...p.hand];
      p.hand = [];
      let sunCards = [];
      for (const c of toProcess) {
        if (sunReturn && helpers.getCardAttribute(c.id, null, game.classId) === 'sun') sunCards.push(c);
        else p.discard.push(c);
      }
      if (sunReturn && sunCards.length) {
        p.drawPile = shuffleArr([...p.drawPile, ...sunCards]);
        helpers.addLog(combat, `${sunCards.length} 张日系牌返回牌组`);
      }
      helpers.drawCards(combat, n);
      break;
    }

    case 'cond_cards_played_attr': {
      const min = eff.min || 3;
      const energy = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.energy || 3);
      if (countCardsPlayedAttr(combat, eff.attr, helpers) >= min) {
        p.energy = (p.energy || 0) + energy;
        helpers.addLog(combat, `条件满足：获得 ${energy} 能量`);
      }
      break;
    }

    case 'cond_cards_played': {
      const min = eff.min || 3;
      const blk = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.block || 2);
      if ((combat.cardsPlayedThisTurn || 0) >= min) helpers.addBlock(combat, p, blk);
      break;
    }

    case 'power_solar_aura':
      p.powers.solar_aura = v;
      helpers.addLog(combat, '日冕光环已激活');
      break;
    case 'power_scorched':
      p.powers.scorched = { value: v, resBonus: eff.resBonus };
      break;
    case 'power_immortal_flame':
      p.powers.immortal_flame = { ratio: card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.ratio || 0.5) };
      break;
    case 'power_eternal_noon':
      p.powers.eternal_noon = {
        maxEnergy: card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.maxEnergy || 1),
        sunCostReduce: eff.sunCostReduce || 1,
      };
      p.maxEnergy = (p.maxEnergy || 3) + (p.powers.eternal_noon.maxEnergy || 1);
      break;
    case 'power_phoenix_rebirth':
      p.powers.phoenix_rebirth = { healPercent: eff.healPercent || 0.5, oncePerCombat: eff.oncePerCombat };
      break;
    case 'power_unyielding':
      p.powers.unyielding = v;
      break;
    case 'power_afterimage_formation':
      p.powers.afterimage_formation = v;
      break;
    case 'power_moon_wheel':
      p.powers.moon_wheel = { cardsLastTurn: eff.cardsLastTurn || 4, energy: eff.energy || 1 };
      break;
    case 'power_shadow_veil':
      p.powers.shadow_veil = v;
      break;
    case 'power_werewolf_blood':
      p.statuses.strength = (p.statuses.strength || 0) + (card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.strength || 2));
      p.powers.werewolf_blood = { onDamage: eff.onDamage || 1, strength: v };
      break;
    case 'power_star_surge':
      p.powers.star_surge = v;
      break;
    case 'power_charge_amp':
      p.powers.charge_amp = v;
      break;
    case 'power_superconductor':
      p.powers.superconductor = {
        maxCharge: card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.maxCharge || 15),
        dmgPerCharge: eff.dmgPerCharge || 1,
        dmgCap: eff.upgradeUncap && card.upgraded ? 999 : (eff.dmgCap || 10),
      };
      break;
    case 'power_stardust_body':
      p.powers.stardust_body = { ratio: eff.ratio || 1 };
      break;
    case 'power_ultimate_overload':
      p.powers.ultimate_overload = { overCap: eff.overCap || 1, hpPerEnergy: eff.hpPerEnergy || 1 };
      break;
    case 'power_corrupt_heart':
      p.powers.corrupt_heart = v;
      break;
    case 'power_void_form':
      p.powers.void_form = {
        voidCostReduce: eff.voidCostReduce || 1,
        corruptionBurn: card.upgraded && eff.upgradeCancelBurn ? 0 : (eff.corruptionBurn || 1),
      };
      break;
    case 'power_calamity_source':
      p.powers.calamity_source = v;
      break;
    case 'power_self_annihilation':
      p.powers.self_annihilation = {
        damagePercent: card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.damagePercent || 0.5),
        reviveHp: eff.reviveHp || 1,
      };
      break;
    case 'power_corrupt_aura':
      p.powers.corrupt_aura = { corruptionToHand: eff.corruptionToHand || 1, aoeDamage: v };
      break;
    case 'power_nihil_shield':
    case 'nihil_shield':
      p.powers.nihil_shield = { perHit: card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.perHit || 3) };
      break;

    case 'add_charge':
      addCharge(combat, v, helpers);
      break;

    case 'spend_all_charge_damage': {
      const charge = combat.charge || 0;
      const ratio = eff.ratio || 1;
      const extra = Math.floor(charge * ratio);
      combat.charge = 0;
      if (extra > 0 && target?.hp > 0) {
        helpers.applyDamageToEnemy(combat, target, extra, game);
        helpers.addLog(combat, `消耗充能：额外 ${extra} 伤害`);
      }
      break;
    }

    case 'spend_all_charge_block': {
      const charge = combat.charge || 0;
      const ratio = eff.ratio || 2;
      const extra = Math.floor(charge * ratio);
      combat.charge = 0;
      if (extra > 0) helpers.addBlock(combat, p, extra);
      break;
    }

    case 'charge_cost_reduce':
      card.chargeCostReduce = { minCost: eff.minCost || 1 };
      break;

    case 'overload':
      if (eff.delay === 'nextTurnStart') combat.pendingOverload = (combat.pendingOverload || 0) + v;
      else {
        p.hp -= v;
        helpers.addLog(combat, `超载：失去 ${v} 生命`);
      }
      break;

    case 'corruption_shuffle': {
      const count = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.count || v);
      for (let i = 0; i < count; i++) p.drawPile.push(helpers.makeCard('corruption_mark'));
      p.drawPile = shuffleArr(p.drawPile);
      helpers.addLog(combat, `腐化：${count} 张腐化印记洗入抽牌堆`);
      break;
    }

    case 'exhaust_corruption_damage': {
      const per = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.perCard || 5);
      let total = 0;
      const kept = [];
      for (const c of p.hand) {
        if (isCorruptionCard(c.id, helpers)) { total += per; p.exhaust.push(c); }
        else kept.push(c);
      }
      p.hand = kept;
      if (total > 0 && target?.hp > 0) {
        helpers.applyDamageToEnemy(combat, target, total, game);
        helpers.addLog(combat, `腐肉盛宴：${total} 伤害`);
      }
      break;
    }

    case 'exhaust_corruption_block_draw': {
      const blockPer = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.blockPer || 4);
      const drawPer = eff.drawPer || 1;
      let n = 0;
      const kept = [];
      for (const c of p.hand) {
        if (isCorruptionCard(c.id, helpers)) { n++; p.exhaust.push(c); }
        else kept.push(c);
      }
      p.hand = kept;
      if (n > 0) {
        helpers.addBlock(combat, p, blockPer * n);
        helpers.drawCards(combat, drawPer * n);
      }
      break;
    }

    case 'exhaust_corruption_shield': {
      const per = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.perCard || 4);
      let n = 0;
      const kept = [];
      for (const c of p.hand) {
        if (isCorruptionCard(c.id, helpers)) { n++; p.exhaust.push(c); }
        else kept.push(c);
      }
      p.hand = kept;
      if (n > 0) helpers.addBlock(combat, p, per * n);
      break;
    }

    case 'add_void_resonance':
      combat.resonance.void = (combat.resonance.void || 0) + v;
      helpers.addLog(combat, `虚空共鸣 +${v}（${combat.resonance.void} 层）`);
      break;

    case 'add_resonance': {
      const attr = eff.attr;
      if (attr && attr !== 'void') {
        combat.resonance[attr] = Math.min(10, (combat.resonance[attr] || 0) + (eff.value || v));
        helpers.addLog(combat, `${attr} 共鸣 +${eff.value || v}`);
      }
      break;
    }

    case 'x_cost_damage': {
      const spent = ctx.energySpent ?? Math.max(0, p.energy);
      const mult = card.upgraded && eff.upgradeMult != null ? eff.upgradeMult : (eff.mult || 4);
      let dmg = spent * mult;
      if (eff.chargeBonus && combat.charge) {
        dmg += combat.charge * (eff.chargeBonus || 1);
        if (eff.spendAllCharge) combat.charge = 0;
      }
      if (eff.resonance && meetsResonance(ctx, eff) && eff.resonance.repeat) dmg *= 2;
      if (target?.hp > 0) {
        const final = getGddDamageModifiers(ctx, eff, helpers.calcAttackDamage(p, dmg, card, combat));
        helpers.applyDamageToEnemy(combat, target, final, game);
        helpers.addFloat(combat, target.index, `-${final}`, 'damage');
      }
      break;
    }

    case 'chain_reaction': {
      const energy = p.energy || 0;
      p.energy = 0;
      const effects = ['sun', 'moon', 'star', 'void'];
      for (let i = 0; i < energy; i++) {
        const pick = effects[Math.floor(Math.random() * effects.length)];
        switch (pick) {
          case 'sun':
            p.statuses.strength = (p.statuses.strength || 0) + 2;
            helpers.addLog(combat, '连锁：+2 力量');
            break;
          case 'moon':
            helpers.drawCards(combat, 1);
            break;
          case 'star':
            addCharge(combat, 3, helpers);
            break;
          case 'void': {
            const voidDmg = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.voidDamage || 3);
            const alive = combat.enemies.filter(e => e.hp > 0);
            if (alive.length) {
              const t = alive[Math.floor(Math.random() * alive.length)];
              helpers.applyDamageToEnemy(combat, t, voidDmg, game);
            }
            break;
          }
        }
      }
      break;
    }

    case 'stun':
      if (target?.hp > 0) {
        target.statuses.stun = (target.statuses.stun || 0) + v;
        helpers.addLog(combat, `${target.name} 被击晕 ${v} 回合`);
      }
      break;

    case 'mirror_target':
      combat.mirrorTargetIndex = targetIndex;
      combat.mirrorMult = eff.mult || 2;
      helpers.addLog(combat, '镜像：下次攻击伤害翻倍');
      break;

    case 'zero_cost_attr_hand':
      for (const c of p.hand) {
        if (helpers.getCardAttribute(c.id, null, game.classId) === eff.attr) c.freeThisTurn = true;
      }
      helpers.addLog(combat, `${eff.attr} 系手牌本回合 0 费`);
      break;

    case 'duplicate_hand_ethereal': {
      const count = eff.count || 2;
      if (p.hand.length) {
        combat.pendingChoice = {
          type: 'duplicate_ethereal',
          count,
          handIndices: p.hand.map((_, i) => i),
        };
        helpers.addLog(combat, '选择一张手牌复制');
      }
      break;
    }

    case 'next_attack_discount':
      combat.nextAttackDiscount = v;
      break;

    case 'exhaust_hand_card_for_charge':
      combat.pendingChoice = { type: 'exhaust_for_charge', handIndices: p.hand.map((_, i) => i) };
      break;

    case 'choice_charge_or_block':
      combat.pendingChoice = {
        type: 'charge_or_block',
        charge: card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.charge || 5),
        blockCap: eff.blockCap || 10,
      };
      break;

    case 'shuffle_discard_to_draw': {
      const total = p.discard.length;
      p.drawPile = shuffleArr([...p.drawPile, ...p.discard]);
      p.discard = [];
      const per = eff.chargePerCard || 1;
      addCharge(combat, total * per, helpers);
      helpers.addLog(combat, `时空扭曲：${total} 张牌洗入，充能 +${total * per}`);
      break;
    }

    case 'siphon_enemy_stats': {
      if (!target?.hp) break;
      const amount = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.amount || 2);
      const chargeGain = card.upgraded && eff.upgradeCharge != null ? eff.upgradeCharge : (eff.charge || 3);
      let siphoned = 0;
      if ((target.statuses.strength || 0) > 0) {
        const take = Math.min(amount, target.statuses.strength);
        target.statuses.strength -= take;
        siphoned += take;
      } else if ((target.statuses.dexterity || 0) > 0) {
        const take = Math.min(amount, target.statuses.dexterity);
        target.statuses.dexterity -= take;
        siphoned += take;
      }
      if (siphoned > 0) addCharge(combat, chargeGain, helpers);
      break;
    }

    case 'void_convert_hand':
    case 'transform_hand_card':
      combat.pendingChoice = {
        type: 'transform_hand',
        cardId: eff.card || 'void_energy',
        handIndices: p.hand.map((_, i) => i),
      };
      break;

    case 'shadow_deal_exhaust':
    case 'exhaust_hand_cards': {
      const count = eff.count || 2;
      const draw = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (ctx.drawVal ?? 3);
      combat.pendingChoice = { type: 'exhaust_hand', count, thenDraw: draw };
      break;
    }

    case 'symbiosis': {
      if (target?.hp > 0) {
        target.symbiosis = { cap: card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.cap || 15) };
        helpers.addLog(combat, `共生：${target.name} 下回合伤害转治疗（上限 ${target.symbiosis.cap}）`);
      }
      break;
    }

    case 'repeat_by_hp_lost': {
      const maxHp = p.maxHp;
      const lost = maxHp - p.hp;
      const pct = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.percent || 0.05);
      const max = eff.max || 4;
      const repeats = Math.min(max, Math.floor(lost / Math.max(1, Math.floor(maxHp * pct))));
      const baseDmg = ctx.baseDamage ?? v;
      for (let i = 0; i < repeats; i++) {
        if (target?.hp > 0) helpers.applyDamageToEnemy(combat, target, baseDmg, game);
      }
      if (repeats > 0) helpers.addLog(combat, `痛苦长矛：重复 ${repeats} 次`);
      break;
    }

    case 'damage_per_card_played': {
      const bonus = (eff.bonus || 1) * (combat.cardsPlayedThisTurn || 0);
      const base = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.value ?? v);
      const dmg = helpers.calcAttackDamage(p, base + bonus, card, combat);
      if (target?.hp > 0) helpers.applyDamageToEnemy(combat, target, dmg, game);
      break;
    }

    case 'retrieve_discard_zero_cost': {
      const zeros = p.discard.filter(c => (c.cost === 0 || c.cost === -1) && !c.unplayable);
      p.discard = p.discard.filter(c => !zeros.includes(c));
      p.hand.push(...zeros);
      if (zeros.length) helpers.addLog(combat, `${zeros.length} 张 0 费牌返回手牌`);
      break;
    }

    // —— 扩展包效果 ——
    case 'on_vulnerable_strength':
      if (target?.statuses?.vulnerable > 0) {
        const amt = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : v;
        applyStrengthGain(combat, amt);
        helpers.addLog(combat, `灼铁：获得 ${amt} 点力量`);
      }
      break;

    case 'cond_res_return_hand':
      if (meetsResonance(ctx, eff)) combat.returnPlayedCardToHand = true;
      break;

    case 'exhaust_status_double_damage': {
      const base = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : v;
      let dmg = helpers.calcAttackDamage(p, base, card, combat);
      const kept = [];
      let consumed = false;
      for (const c of p.hand) {
        if (!consumed && isCurseOrStatus(c, helpers)) { p.exhaust.push(c); consumed = true; }
        else kept.push(c);
      }
      p.hand = kept;
      if (consumed) dmg *= 2;
      if (target?.hp > 0) {
        helpers.applyDamageToEnemy(combat, target, dmg, game);
        helpers.addFloat(combat, target.index, `-${dmg}`, 'damage');
      }
      break;
    }

    case 'execute_damage': {
      let dmg = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : v;
      const exec = card.upgraded && eff.upgradeExecute != null ? eff.upgradeExecute : (eff.execute || dmg);
      if (target?.hp > 0 && target.hp / target.maxHp < (eff.threshold || 0.3)) dmg = exec;
      if (target?.hp > 0) {
        const final = helpers.calcAttackDamage(p, dmg, card, combat);
        helpers.applyDamageToEnemy(combat, target, final, game);
        helpers.addFloat(combat, target.index, `-${final}`, 'damage');
      }
      break;
    }

    case 'power_attack_damage_bonus':
      p.powers.attack_damage_bonus = {
        base: card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.base || 3),
        resAttr: eff.resAttr, resMin: eff.resMin || 3,
        resBonus: card.upgraded && eff.upgradeResBonus != null ? eff.upgradeResBonus : (eff.resBonus || 5),
      };
      break;

    case 'power_incoming_reduce':
      p.powers.incoming_reduce = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : v;
      break;

    case 'cond_cards_played_draw':
      if ((combat.cardsPlayedThisTurn || 0) >= (eff.min || 3)) helpers.drawCards(combat, v);
      break;

    case 'power_eclipse_combo':
      combat.eclipseComboDiscount = combat.eclipseComboDiscount || {};
      combat.eclipseComboDiscount[eff.cardId || card.id] = 0;
      p.powers.eclipse_combo = { cardId: eff.cardId || card.id };
      break;

    case 'damage_res_layers': {
      const cap = card.upgraded && eff.upgradeCap != null ? eff.upgradeCap : (eff.cap || 8);
      const layers = Math.min(cap, helpers.getResonanceLayer(combat.resonance, eff.attr || 'moon'));
      const base = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : v;
      const dmg = helpers.calcAttackDamage(p, base + layers, card, combat);
      if (target?.hp > 0) helpers.applyDamageToEnemy(combat, target, dmg, game);
      break;
    }

    case 'x_cost_random_multi': {
      const spent = ctx.energySpent ?? Math.max(0, p.energy);
      const mult = card.upgraded && eff.upgradeMult != null ? eff.upgradeMult : (eff.mult || 3);
      const alive = () => combat.enemies.filter(e => e.hp > 0);
      for (let i = 0; i < spent; i++) {
        const pool = alive();
        if (!pool.length) break;
        const t = pool[Math.floor(Math.random() * pool.length)];
        const dmg = helpers.calcAttackDamage(p, spent * mult, card, combat);
        helpers.applyDamageToEnemy(combat, t, dmg, game);
      }
      break;
    }

    case 'cond_no_hit_last_turn_block':
      if (!combat.damageTakenLastTurn) helpers.addBlock(combat, p, card.upgraded && eff.upgrade !== undefined ? eff.upgrade : v);
      break;

    case 'moon_solo_discard_draw': {
      const drawN = card.upgraded && eff.upgradeBaseDraw ? eff.upgradeBaseDraw
        : (meetsResonance(ctx, eff) ? (eff.resDraw || 2) : (eff.draw || 1));
      if (p.hand.length) {
        p.discard.push(p.hand.splice(Math.floor(Math.random() * p.hand.length), 1)[0]);
        helpers.drawCards(combat, drawN);
      }
      break;
    }

    case 'power_scaling_block': {
      const key = eff.powerKey || 'shadow_cloak';
      const growth = card.upgraded && eff.upgradeGrowth != null ? eff.upgradeGrowth : (eff.growth || 2);
      const base = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.base || 10);
      p.powers[key] = p.powers[key] || { bonus: 0 };
      const total = base + (p.powers[key].bonus || 0);
      helpers.addBlock(combat, p, total);
      p.powers[key].bonus = (p.powers[key].bonus || 0) + growth;
      break;
    }

    case 'power_zero_cost_block':
      p.powers.zero_cost_block = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : v;
      break;

    case 'power_eternal_resonance':
      p.powers.eternal_resonance = {
        attr: eff.attr,
        resMin: eff.resMin || 8,
        combatEndHeal: eff.combatEndHeal,
        combatEndEnergy: eff.combatEndEnergy,
        combatEndCharge: eff.combatEndCharge,
      };
      p.powers[`eternal_${eff.attr}`] = true;
      break;

    case 'power_eternal_void':
      p.powers.eternal_void = true;
      p.powers.eternal_void_no_break = {
        healPercent: eff.healPercent || 0.5,
        hpThreshold: eff.hpThreshold || 0.3,
      };
      break;

    case 'power_on_strength_gain':
      p.powers.on_strength_gain = { value: card.upgraded && eff.upgradeCost != null ? eff.upgradeCost : v };
      break;

    case 'power_big_hit_vulnerable':
      p.powers.big_hit_vulnerable = {
        threshold: card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.threshold || 15),
        value: v,
      };
      break;

    case 'star_arrow': {
      const base = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.damage || 6);
      let dmg = helpers.calcAttackDamage(p, base, card, combat);
      addCharge(combat, eff.chargeGain || 1, helpers);
      const spend = eff.spendCharge || 3;
      if ((combat.charge || 0) >= spend) {
        combat.charge -= spend;
        dmg += card.upgraded && eff.upgradeBonus != null ? eff.upgradeBonus : (eff.bonusDamage || 4);
      }
      if (target?.hp > 0) helpers.applyDamageToEnemy(combat, target, dmg, game);
      break;
    }

    case 'halve_enemy_block':
      if (target) target.block = Math.floor((target.block || 0) / 2);
      break;

    case 'splash_damage': {
      const main = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : v;
      const splash = card.upgraded && eff.upgradeSplash != null ? eff.upgradeSplash : (eff.splash || 5);
      if (target?.hp > 0) helpers.applyDamageToEnemy(combat, target, helpers.calcAttackDamage(p, main, card, combat), game);
      for (const e of combat.enemies) {
        if (e.hp > 0 && e !== target) helpers.applyDamageToEnemy(combat, e, splash, game);
      }
      break;
    }

    case 'damage_per_debuff': {
      const per = card.upgraded && eff.upgradePerDebuff != null ? eff.upgradePerDebuff : (eff.perDebuff || 3);
      const debuffs = target ? countEnemyDebuffTypes(target) : 0;
      const base = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : v;
      const dmg = helpers.calcAttackDamage(p, base + debuffs * per, card, combat);
      if (target?.hp > 0) helpers.applyDamageToEnemy(combat, target, dmg, game);
      break;
    }

    case 'charge_next_turn_block_loss':
      combat.pendingBlockLossNextTurn = (combat.pendingBlockLossNextTurn || 0)
        + (card.upgraded && eff.upgrade !== undefined ? eff.upgrade : v);
      break;

    case 'cond_charge_block': {
      const high = (combat.charge || 0) >= (eff.chargeMin || 5);
      addCharge(combat, eff.chargeGain || 2, helpers);
      const blk = high
        ? (card.upgraded && eff.upgradeHigh != null ? eff.upgradeHigh : eff.highBlock)
        : (card.upgraded && eff.upgradeLow != null ? eff.upgradeLow : eff.lowBlock);
      helpers.addBlock(combat, p, blk);
      break;
    }

    case 'charge_to_draw': {
      const per = card.upgraded && eff.upgradePerCharge != null ? eff.upgradePerCharge : (eff.perCharge || 2);
      const charge = combat.charge || 0;
      combat.charge = 0;
      const draws = Math.floor(charge / per);
      if (draws > 0) helpers.drawCards(combat, draws);
      break;
    }

    case 'delay_enemy_intent':
      if (target?.hp > 0) target.delayIntent = true;
      break;

    case 'power_per_attr_played':
      p.powers.per_attr_played = {
        attr: eff.attr,
        block: card.upgraded && eff.upgradeBlock != null ? eff.upgradeBlock : (eff.block || 2),
        charge: eff.charge || 1,
      };
      break;

    case 'exhaust_non_attr_charge':
      combat.pendingChoice = {
        type: 'exhaust_for_charge',
        handIndices: p.hand.map((c, i) => i).filter(i => {
          const c = p.hand[i];
          return helpers.getCardAttribute(c.id, null, game.classId) !== eff.attr;
        }),
        chargeGain: card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.charge || 6),
      };
      break;

    case 'power_charge_threshold_block':
      p.powers.charge_threshold_block = {
        threshold: eff.threshold || 5,
        block: card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.block || 2),
      };
      break;

    case 'power_gravity_warp':
      p.powers.gravity_warp = {
        base: eff.base || -1,
        perCharge: eff.perCharge || 3,
      };
      break;

    case 'exhaust_corruption_double': {
      const base = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : v;
      let dmg = helpers.calcAttackDamage(p, base, card, combat);
      const kept = [];
      let consumed = false;
      for (const c of p.hand) {
        if (!consumed && isCorruptionCard(c.id, helpers)) { p.exhaust.push(c); consumed = true; }
        else kept.push(c);
      }
      p.hand = kept;
      if (consumed) dmg *= 2;
      if (target?.hp > 0) helpers.applyDamageToEnemy(combat, target, dmg, game);
      break;
    }

    case 'count_corruption_damage_bonus': {
      const per = card.upgraded && eff.upgradePerCard != null ? eff.upgradePerCard : (eff.perCard || 1);
      const n = countCorruptionInPiles(combat, helpers);
      const base = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : v;
      const dmg = helpers.calcAttackDamage(p, base + n * per, card, combat);
      if (target?.hp > 0) helpers.applyDamageToEnemy(combat, target, dmg, game);
      break;
    }

    case 'discard_for_damage': {
      if (!p.hand.length) break;
      const idx = Math.floor(Math.random() * p.hand.length);
      const discarded = p.hand.splice(idx, 1)[0];
      p.discard.push(discarded);
      const isCorr = isCorruptionCard(discarded.id, helpers);
      const base = isCorr
        ? (card.upgraded && eff.upgradeCorruption != null ? eff.upgradeCorruption : (eff.corruptionDamage || 12))
        : (card.upgraded && eff.upgrade !== undefined ? eff.upgrade : v);
      const alive = combat.enemies.filter(e => e.hp > 0);
      if (alive.length) {
        const t = alive[Math.floor(Math.random() * alive.length)];
        helpers.applyDamageToEnemy(combat, t, helpers.calcAttackDamage(p, base, card, combat), game);
      }
      break;
    }

    case 'exhaust_hand_draw_corruption_heal': {
      const healPer = eff.healPer || 4;
      const cards = [...p.hand];
      p.hand = [];
      let heal = 0;
      for (const c of cards) {
        if (isCorruptionCard(c.id, helpers)) {
          p.exhaust.push(c);
          heal += healPer;
        } else p.exhaust.push(c);
      }
      helpers.drawCards(combat, cards.length);
      if (heal > 0) p.hp = Math.min(p.maxHp, p.hp + heal);
      break;
    }

    case 'steal_strength_block': {
      if (!target?.hp) break;
      const str = Math.max(0, target.statuses?.strength || 0);
      const bonus = card.upgraded && eff.upgrade !== undefined ? eff.upgrade : (eff.bonus || 0);
      target.statuses.strength = 0;
      helpers.addBlock(combat, p, str + bonus);
      break;
    }

    case 'power_first_corruption_draw':
      p.powers.first_corruption_draw = card.upgraded && eff.upgradeCost === 0 ? 1 : v;
      break;

    default:
      return false;
  }
  return true;
}
