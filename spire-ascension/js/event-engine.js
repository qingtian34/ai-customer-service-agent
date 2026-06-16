/** 事件效果解析 — GDD §8.2 全部选项 */
import { RELICS, CARD_POOL, BOSS_RELIC_POOL } from './data.js';
import { makeCard, upgradeCard, createCombatState } from './combat.js';
import { getCombatEnemies } from './map.js';
import { pickEnvTarotChoices, createEnvTarotEffect } from './env-tarot.js';
import { getCardAttribute } from './resonance.js';

export function resolveEventEffect(game, eff, helpers) {
  const {
    obtainRelic, rollRelicReward, rollRelicByRarity, weightedPick, buildWeightedCardPool,
    randomPotion, addJournal, clearNode, saveGame,
  } = helpers;

  if (eff.gold) game.gold = Math.max(0, game.gold + eff.gold);
  if (eff.hp) game.hp = Math.max(1, game.hp + eff.hp);
  if (eff.heal) game.hp = Math.min(game.maxHp, game.hp + eff.heal);
  if (eff.maxHp) { game.maxHp += eff.maxHp; game.hp += eff.maxHp; }
  if (eff.maxHpPercent) {
    const delta = Math.floor(game.maxHp * eff.maxHpPercent);
    game.maxHp = Math.max(1, game.maxHp + delta);
    game.hp = Math.min(game.hp, game.maxHp);
  }

  if (eff.addRelic) {
    const rid = resolveRelicGrant(game, eff.addRelic, helpers);
    if (rid) obtainRelic(game, rid);
  }

  if (eff.addCard === 'rare') {
    const pool = buildWeightedCardPool(game).filter(id => ['rare', 'uncommon'].includes(CARD_POOL[id]?.rarity));
    if (pool.length) game.deck.push(makeCard(pool[Math.floor(Math.random() * pool.length)]));
  } else if (eff.addCard === 'power') {
    const powers = buildWeightedCardPool(game).filter(id => CARD_POOL[id]?.type === 'power');
    if (powers.length) {
      game.discoverCards = [makeCard(powers[Math.floor(Math.random() * powers.length)])];
      game.screen = 'discover';
      game.eventPending = true;
      saveGame(game);
      return { screen: 'discover' };
    }
  } else if (eff.addCard === 'void_gift' || eff.addCard === 'random') {
    const n = eff.cards || 1;
    for (let i = 0; i < n; i++) {
      const pool = buildWeightedCardPool(game);
      game.deck.push(makeCard(pool[Math.floor(Math.random() * pool.length)]));
    }
  }

  if (eff.duplicateCard) {
    if (game.deck.length) {
      const c = game.deck[Math.floor(Math.random() * game.deck.length)];
      game.deck.push(makeCard(c.id, c.upgraded));
      addJournal(game, `复制 ${c.name}`);
    }
  }

  if (eff.transformCards) {
    const pool = buildWeightedCardPool(game);
    for (let i = 0; i < eff.transformCards && game.deck.length; i++) {
      const idx = Math.floor(Math.random() * game.deck.length);
      game.deck[idx] = makeCard(pool[Math.floor(Math.random() * pool.length)]);
    }
  }

  if (eff.upgrade) {
    for (let u = 0; u < eff.upgrade; u++) {
      const ups = game.deck.map((c, i) => ({ c, i })).filter(x => !x.c.upgraded);
      if (!ups.length) break;
      const pick = ups[Math.floor(Math.random() * ups.length)];
      game.deck[pick.i] = upgradeCard(pick.c);
    }
  }

  if (eff.upgradePowers) {
    game.deck = game.deck.map(c => CARD_POOL[c.id]?.type === 'power' ? upgradeCard(c) : c);
  }

  if (eff.upgradeStarCards) {
    game.deck = game.deck.map(c => {
      const attr = getCardAttribute(c.id, CARD_POOL[c.id], game.classId);
      return ['sun', 'moon', 'star'].includes(attr) ? upgradeCard(c) : c;
    });
  }

  if (eff.addCurse) game.deck.push(makeCard(eff.addCurse));
  if (eff.potion) {
    for (let i = 0; i < eff.potion && game.potions.length < game.maxPotions; i++) {
      game.potions.push(randomPotion());
    }
  }

  if (eff.removeCard) {
    game.screen = 'event_remove';
    game.eventPending = true;
    saveGame(game);
    return { screen: 'event_remove' };
  }

  if (eff.removeCurse) {
    const idx = game.deck.findIndex(c => c.type === 'curse' || c.type === 'status' || CARD_POOL[c.id]?.rarity === 'curse');
    if (idx >= 0) game.deck.splice(idx, 1);
  }

  if (eff.removeRelic && game.relics.length > 1) {
    game.relics.splice(Math.floor(Math.random() * game.relics.length), 1);
  }

  if (eff.gamble) {
    const g = eff.gamble;
    game.hp = Math.max(1, game.hp - (g.hp || 0));
    if (Math.random() < (g.chance || 0.5)) {
      const rid = rollRelicByRarity(game, g.winRelic || 'rare');
      if (rid) obtainRelic(game, rid);
      game.eventMessage = '赌局胜利！';
    } else {
      game.eventMessage = '赌局失败…';
    }
  }

  if (eff.wishingWell) {
    const tier = eff.wishingWell;
    const roll = Math.random();
    if (tier >= 99 && roll < 0.35) {
      const rid = rollRelicReward(game);
      if (rid) obtainRelic(game, rid);
    } else if (tier >= 50 && roll < 0.45) {
      game.gold += 80;
    } else if (roll < 0.5) {
      game.hp = Math.min(game.maxHp, game.hp + 15);
    } else {
      game.deck.push(makeCard('corruption_mark'));
    }
  }

  if (eff.tradeCard) {
    game.tradeCardRemaining = eff.tradeCard || 3;
    game.screen = 'event_trade';
    saveGame(game);
    return { screen: 'event_trade' };
  }

  if (eff.clearResonance) {
    game.nextCombatClearResonance = true;
    const rid = rollRelicByRarity(game, 'common');
    if (rid) obtainRelic(game, rid);
  }

  if (eff.skipNextCombat) {
    game.skipNextCombat = true;
  }

  if (eff.combatDebuff) {
    game.nextCombatDebuff = eff.combatDebuff;
  }

  if (eff.combat) {
    game.pendingEnemies = getCombatEnemies('combat', game.act, game.floor);
    if (eff.combat !== 'combat') game.pendingEnemies = [eff.combat];
    game.combat = createCombatState(game);
    game.screen = 'combat';
    game.event = null;
    saveGame(game);
    return { screen: 'combat' };
  }

  if (eff.changeEnvTarot) {
    game.envTarotChoices = pickEnvTarotChoices(3);
    game.screen = 'env_tarot';
    saveGame(game);
    return { screen: 'env_tarot' };
  }

  return null;
}

function resolveRelicGrant(game, spec, helpers) {
  const { rollRelicReward, rollRelicByRarity } = helpers;
  if (spec === 'rare') return rollRelicByRarity(game, 'rare') || rollRelicReward(game);
  if (spec === 'common') return rollRelicByRarity(game, 'common') || rollRelicReward(game);
  if (spec === 'random') return rollRelicReward(game);
  if (spec === 'boss') {
    const pool = BOSS_RELIC_POOL.filter(id => !game.relics.includes(id));
    return pool[Math.floor(Math.random() * pool.length)];
  }
  if (spec === 'shop_special') {
    const picks = [];
    const pool = Object.values(RELICS).filter(r => !r.class && !game.relics.includes(r.id) && r.rarity !== 'starter');
    for (let i = 0; i < 3 && pool.length; i++) {
      const r = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
      picks.push(r.id);
    }
    game.eventRelicChoices = picks;
    game.screen = 'event_relic';
    return null;
  }
  if (typeof spec === 'string' && RELICS[spec]) return spec;
  return rollRelicReward(game);
}
