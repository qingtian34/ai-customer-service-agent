/** 游戏状态与流程控制 */
import {
  CLASSES, CARD_POOL, RELICS, EVENTS, POTIONS, REWARD_CARD_POOL,
  SHOP_PRICES, ACTS, ASCENSION, RARITY_WEIGHTS, BOSS_RELIC_POOL, NEGATIVE_BOSS_RELIC_POOL,
  WHEEL_OUTCOMES, POTION_DROP_WEIGHTS, RELIC_RARITY_WEIGHTS,
} from './data.js';
import { createCombatState, makeCard, upgradeCard, normalizeCombat } from './combat.js';
import { generateMap, moveToNode, getCombatEnemies, teleportMapNode, NODE_LABELS } from './map.js';
import { checkAchievements, onVictoryMeta } from './achievements.js';
import { rollEliteModifier } from './modifiers.js';
import { pickBattleTarotChoices, mergeBattleTarots } from './tarot.js';
import { pickEnvTarotChoices, createEnvTarotEffect, applyEnvTarotModifiers } from './env-tarot.js';
import {
  applyAscensionToNewGame, getAscensionRestHealPercent, getAscensionShopPriceMod,
  getAscensionTarotChoiceCount, rollBossRelicChoices, shouldDualBossChain,
} from './ascension.js';
import {
  getCharacterLevel, filterCardPoolByLevel, applyStartBonus, getUnlockedStartBonuses,
  checkTrueEnding, grantRunXp, getUnlockedArchive,
} from './meta.js';
import {
  getCombatRewardTier, buildCombatRewards, rollCardRewardsForTier, randomPotionDrop,
} from './rewards.js';

const SAVE_KEY = 'spire_ascension_save_v3';
const META_KEY = 'spire_ascension_meta';

export function getMeta() {
  try {
    return JSON.parse(localStorage.getItem(META_KEY)) || {
      wins: 0, losses: 0, bestAscension: 0, achievements: [], classesWon: {},
      poisonKills: 0, fragments: 0, stats: {}, characterXp: {}, characterLevel: {},
    };
  }
  catch {
    return { wins: 0, losses: 0, bestAscension: 0, achievements: [], classesWon: {}, poisonKills: 0 };
  }
}

export function createNewGame(classId, ascension = 0, opts = {}) {
  const cls = CLASSES[classId];
  const meta = getMeta();
  const starterRelic = Object.values(RELICS).find(r => r.class === classId);
  const game = {
    classId, className: cls.name, ascension,
    hp: cls.maxHp, maxHp: cls.maxHp,
    gold: 99,
    act: 1, floor: 0,
    deck: cls.starterDeck.map(id => makeCard(id)),
    relics: starterRelic ? [starterRelic.id] : [],
    potions: [], maxPotions: 3,
    map: null, currentNodeId: null, screen: 'map',
    combat: null, rewards: null, shop: null, event: null,
    pendingEnemies: null, pendingBoss: false, pendingElite: false,
    mawBankGold: 0, feedBonus: 0,
    gameOver: false, victory: false, trueEnding: false,
    stats: { combatsWon: 0, elitesSlain: 0, cardsPlayed: 0, damageDealt: 0, goldEarned: 0, damageTaken: 0, potionsUsed: 0, forges: 0, shopSpent: 0 },
    bossRelicChoice: null,
    journal: [],
    eliteModifier: null,
    newAchievements: [],
    custom: opts.custom || null,
    startBonus: opts.startBonus || null,
    relicsMap: RELICS,
    bossRelicPool: BOSS_RELIC_POOL,
    characterLevel: getCharacterLevel(meta, classId),
    checkpoint: null,
    combatCheckpoint: null,
  };

  applyAscensionToNewGame(game);
  if (game.ascension >= 12) game.deck.push(makeCard('deep_corruption'));
  applyStartBonus(game, opts.startBonus, meta);
  if (game.custom?.allRelicsOpen) game.relics.push('lucky_coin');

  game.envTarotChoices = pickEnvTarotChoices(3);
  game.screen = 'env_tarot';
  return game;
}

export function saveCheckpoint(game, type = 'room') {
  try {
    const snap = {
      hp: game.hp, maxHp: game.maxHp, gold: game.gold,
      deck: game.deck.map(c => ({ id: c.id, upgraded: c.upgraded })),
      relics: [...game.relics], potions: [...game.potions],
      act: game.act, floor: game.floor, map: game.map,
      currentNodeId: game.currentNodeId, envTarot: game.envTarot,
      envTarotId: game.envTarotId, type,
      pendingEnemies: game.pendingEnemies,
      pendingBoss: game.pendingBoss,
      pendingElite: game.pendingElite,
      tarotChoices: game.tarotChoices,
    };
    if (type === 'combat') game.combatCheckpoint = JSON.stringify(snap);
    else game.checkpoint = JSON.stringify(snap);
  } catch { /* ignore */ }
}

export function retryFromCheckpoint(game, type = 'room') {
  const raw = type === 'combat' ? game.combatCheckpoint : game.checkpoint;
  if (!raw) return false;
  try {
    const cp = JSON.parse(raw);
    game.hp = cp.hp;
    game.maxHp = cp.maxHp;
    game.gold = cp.gold;
    game.deck = cp.deck.map(c => makeCard(c.id, c.upgraded));
    game.relics = cp.relics;
    game.potions = cp.potions;
    game.combat = null;
    game.rewards = null;
    game.gameOver = false;
    if (type === 'combat') {
      game.pendingEnemies = cp.pendingEnemies;
      game.pendingBoss = cp.pendingBoss;
      game.pendingElite = cp.pendingElite;
      game.tarotChoices = cp.tarotChoices || pickBattleTarotChoices(3);
      game.bossTarotPicks = [];
      game.selectedBattleTarot = null;
      game.selectedBattleTarots = null;
    } else {
      game.pendingEnemies = null;
      game.pendingBoss = false;
      game.pendingElite = false;
    }
    game.screen = type === 'combat' ? 'tarot' : 'map';
    addJournal(game, type === 'combat' ? '时光回溯：重试战斗' : '时光回溯：回到房间前');
    saveGame(game);
    return true;
  } catch { return false; }
}

export function selectEnvTarot(game, tarotId) {
  game.envTarotId = tarotId;
  game.envTarot = createEnvTarotEffect(tarotId);
  const actCtx = applyEnvTarotModifiers(game, 'onActStart', {});
  game.deathSaveAvailable = !!actCtx.deathSaveAvailable;
  if (!game.map) {
    game.map = generateMap(game.act, game.ascension || 0);
    applyMapEnvModifiers(game);
  }
  addJournal(game, `环境塔罗：${game.envTarot.name}`);
  game.screen = 'map';
}

/** 环境塔罗：世界（全图可见/传送）、审判（Boss前额外精英） */
function applyMapEnvModifiers(game) {
  const ctx = applyEnvTarotModifiers(game, 'onMapGenerate', {});
  game.mapFullReveal = !!ctx.fullReveal;
  game.mapFreeTeleport = !!ctx.freeTeleport;
  if (ctx.revealElites || applyEnvTarotModifiers(game, 'onEliteReveal', {}).revealElites) {
    game.mapRevealElites = true;
    for (const n of game.map.nodes) {
      if (n.type === 'elite') n.revealed = true;
    }
  }
  if (ctx.extraEliteBeforeBoss) insertJudgementEliteNode(game.map);
}

function insertJudgementEliteNode(map) {
  const boss = map.nodes.find(n => n.type === 'boss');
  if (!boss || map.nodes.some(n => n.judgementElite)) return;
  const prevRow = map.nodes.filter(n => n.row === boss.row - 1);
  if (!prevRow.length) return;
  const anchor = prevRow[Math.floor(prevRow.length / 2)];
  const elite = {
    id: `n_judgement_${boss.row}`,
    row: boss.row - 1,
    col: anchor.col + 0.15,
    x: Math.min(0.92, anchor.x + 0.12),
    y: anchor.y,
    type: 'elite',
    visited: false,
    available: false,
    cleared: false,
    judgementElite: true,
    revealed: true,
  };
  map.nodes.push(elite);
  map.connections.push({ from: anchor.id, to: elite.id });
  map.connections.push({ from: elite.id, to: boss.id });
  const oldToBoss = map.connections.filter(c => c.to === boss.id && c.from !== elite.id);
  if (oldToBoss.length > 1) {
    const drop = oldToBoss.find(c => c.from !== anchor.id) || oldToBoss[0];
    map.connections = map.connections.filter(c => c !== drop);
  }
}

export function beginActWithEnvTarot(game) {
  game.envTarotChoices = pickEnvTarotChoices(3);
  game.screen = 'env_tarot';
}

export function saveGame(game) {
  try {
    const payload = JSON.parse(JSON.stringify(game));
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    return true;
  } catch { return false; }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data.map) data.map = generateMap(data.act, data.ascension || 0);
    if (data.envTarot && data.map) applyMapEnvModifiers(data);
    if (data.deck?.length) {
      data.deck = data.deck.map(c => makeCard(c.id, !!c.upgraded));
    }
    if (data.combat) normalizeCombat(data.combat, data);
    return data;
  } catch { return null; }
}

export function hasSave() { return !!localStorage.getItem(SAVE_KEY); }

export function addJournal(game, text) {
  game.journal = game.journal || [];
  game.journal.unshift({ act: game.act, floor: game.floor, text, time: Date.now() });
  if (game.journal.length > 40) game.journal.pop();
}

export function selectMapNode(game, nodeId, opts = {}) {
  if (game.mapFreeTeleport && !opts.forceMove) {
    const target = game.map.nodes.find(n => n.id === nodeId);
    if (target?.cleared && target.id !== game.currentNodeId) {
      teleportMapNode(game.map, nodeId);
      game.currentNodeId = nodeId;
      addJournal(game, `世界塔罗：传送至 ${NODE_LABELS[target.type] || target.type}`);
      game.screen = 'map';
      saveGame(game);
      return;
    }
  }

  const node = moveToNode(game.map, nodeId);
  if (!node) return;
  game.currentNodeId = nodeId;
  game.floor++;

  const roomCtx = applyEnvTarotModifiers(game, 'onRoomEnter', {});
  if (roomCtx.heal) {
    game.hp = Math.min(game.maxHp, game.hp + roomCtx.heal);
    addJournal(game, `节制环境：+${roomCtx.heal} 生命`);
  }

  if (game.relics.includes('maw_bank')) {
    game.mawBankGold = Math.min(150, (game.mawBankGold || 0) + 5);
    game.gold += 5;
  }
  if (game.relics.includes('tiny_chest') && game.floor % 4 === 0) {
    game.gold += 25;
  }

  saveCheckpoint(game, 'room');

  if (game.skipNextCombat && (node.type === 'combat' || node.type === 'elite')) {
    game.skipNextCombat = false;
    game.hp = Math.max(1, game.hp - 10);
    node.cleared = true;
    game.rewards = { gold: 25, cards: rollCardRewardsForTier(game, 2, 'normal'), relic: null, potion: null, forge: false, cardPicked: false };
    game.screen = 'reward';
    addJournal(game, '坠落塔层：跳过战斗并获得奖励');
    saveGame(game);
    return;
  }

  switch (node.type) {
    case 'combat':
      addJournal(game, '进入战斗');
      startCombat(game, 'combat');
      break;
    case 'elite':
      addJournal(game, '遭遇精英！');
      startCombat(game, 'elite');
      break;
    case 'boss':
      addJournal(game, `⚠ Boss 战：${ACTS[game.act - 1]?.name || ''}`);
      startCombat(game, 'boss');
      break;
    case 'rest':
      game.screen = 'rest';
      addJournal(game, '抵达休息处');
      break;
    case 'shop':
      game.screen = 'shop';
      game.shop = generateShop(game);
      addJournal(game, '进入商店');
      if (game.relics.includes('meal_ticket')) game.hp = Math.min(game.maxHp, game.hp + 15);
      if (game.relics.includes('gambling_chip')) game.screen = 'shop_remove_once';
      break;
    case 'event':
      game.screen = 'event';
      game.event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
      addJournal(game, `事件：${game.event.name}`);
      break;
    case 'treasure':
      game.screen = 'treasure';
      addJournal(game, '发现宝箱');
      break;
    default: startCombat(game, 'combat');
  }
}

function startCombat(game, nodeType) {
  saveCheckpoint(game, 'combat');
  game.pendingEnemies = getCombatEnemies(nodeType, game.act, game.floor, game.ascension || 0);
  game.pendingBoss = nodeType === 'boss';
  game.pendingElite = nodeType === 'elite';
  game.eliteModifier = nodeType === 'elite' ? rollEliteModifier() : null;
  if (game.eliteModifier) addJournal(game, `词缀：${game.eliteModifier.icon} ${game.eliteModifier.name}`);

  if (game.pendingBoss) {
    for (const rid of game.relics) {
      const r = RELICS[rid];
      if (r?.onBossStart) game.hp = Math.min(game.maxHp, game.hp + (r.onBossStart.heal || 0));
    }
  }
  const tarotCount = getAscensionTarotChoiceCount(game.ascension || 0, game.pendingBoss);
  game.tarotChoices = pickBattleTarotChoices(tarotCount);
  game.bossTarotPicks = [];
  game.screen = 'tarot';
}

/** 战斗塔罗选择后进入战斗（Boss 战选 2 张） */
export function selectBattleTarot(game, tarotId) {
  if (game.pendingBoss) {
    game.bossTarotPicks = game.bossTarotPicks || [];
    const idx = game.bossTarotPicks.indexOf(tarotId);
    if (idx >= 0) game.bossTarotPicks.splice(idx, 1);
    else if (game.bossTarotPicks.length < 2) game.bossTarotPicks.push(tarotId);
    if (game.bossTarotPicks.length < 2) {
      game.screen = 'tarot';
      return;
    }
    game.selectedBattleTarots = [...game.bossTarotPicks];
    game.selectedBattleTarot = game.selectedBattleTarots[0];
  } else {
    game.selectedBattleTarots = [tarotId];
    game.selectedBattleTarot = tarotId;
  }

  const meta = getMeta();
  game.newAchievements = [...(game.newAchievements || []), ...checkAchievements(game, meta, 'tarot_pick')];
  localStorage.setItem(META_KEY, JSON.stringify(meta));

  game.combat = createCombatState(game);
  normalizeCombat(game.combat, game);
  if (game.eliteModifier?.apply) game.eliteModifier.apply(game.combat);
  game.combat.damageTakenThisFight = 0;
  game.combat.eliteModifier = game.eliteModifier;
  if (game.combat.battleTarot?.loversPending) {
    game.screen = 'tarot_lovers';
  } else {
    game.screen = 'combat';
  }
}

/** 恋人塔罗：攻击 +2 或 护盾 +3 */
export function selectLoversTarot(game, choice) {
  if (!game.combat?.battleTarot?.loversPending) return;
  if (choice === 'attack') {
    game.combat.battleTarot.loversAttackBonus = 2;
    addJournal(game, '恋人塔罗：攻击 +2');
  } else {
    game.combat.battleTarot.loversBlockBonus = 3;
    addJournal(game, '恋人塔罗：技能护盾 +3');
  }
  game.combat.battleTarot.loversPending = false;
  game.screen = 'combat';
}

export function finishCombat(game) {
  if (!game.combat?.victory) {
    const saveCtx = applyEnvTarotModifiers(game, 'onDeathSave', {
      deathSaveAvailable: game.deathSaveAvailable !== false,
    });
    if (saveCtx.revivePercent) {
      game.hp = Math.max(1, Math.floor(game.maxHp * saveCtx.revivePercent));
      game.deathSaveAvailable = false;
      game.combat = null;
      game.selectedBattleTarot = null;
      game.selectedBattleTarots = null;
      game.bossTarotPicks = null;
      addJournal(game, `倒吊人环境：濒死复活（${Math.round(saveCtx.revivePercent * 100)}% 生命）`);
      game.screen = 'map';
      saveGame(game);
      return;
    }
    game.gameOver = true;
    game.screen = 'gameover';
    const meta = getMeta();
    meta.losses = (meta.losses || 0) + 1;
    meta.fragments = (meta.fragments || 0) + 1;
    localStorage.setItem(META_KEY, JSON.stringify(meta));
    return;
  }

  game.stats.combatsWon = (game.stats.combatsWon || 0) + 1;
  if (game.pendingElite) game.stats.elitesSlain = (game.stats.elitesSlain || 0) + 1;
  if (game.combat?.damageTakenThisFight === 0) {
    const meta = getMeta();
    game.newAchievements = checkAchievements(game, meta, 'no_damage_win');
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  }
  if (game.eliteModifier?.goldBonus) game.gold += game.eliteModifier.goldBonus;
  game.eliteModifier = null;
  game.selectedBattleTarot = null;
  game.selectedBattleTarots = null;
  game.bossTarotPicks = null;
  if (game.feedBonus) { game.maxHp += game.feedBonus; game.feedBonus = 0; }

  const killCtx = applyEnvTarotModifiers(game, 'onRewardRoll', {});
  if (!game.pendingBoss && !game.pendingElite && killCtx.healOnNormalKill) {
    game.hp = Math.min(game.maxHp, game.hp + killCtx.healOnNormalKill);
  }

  const node = game.map.nodes.find(n => n.id === game.currentNodeId);
  if (node) node.cleared = true;

  let goldGain = randInt(game.pendingElite ? 32 : 18, game.pendingElite ? 48 : 32);
  if (game.ascension >= 5) goldGain = Math.floor(goldGain * 0.85);
  if (game.relics.includes('golden_idol')) goldGain = Math.floor(goldGain * 1.25);
  game.gold += goldGain;
  game.stats.goldEarned = (game.stats.goldEarned || 0) + goldGain;
  addJournal(game, `战斗胜利 +${goldGain}G`);

  const meta = getMeta();
  if (game.gold >= 500) game.newAchievements = [...(game.newAchievements || []), ...checkAchievements(game, meta, 'gold')];
  localStorage.setItem(META_KEY, JSON.stringify(meta));

  if (game.relics.includes('fusion_hammer')) {
    const upgradable = game.deck.filter(c => !c.upgraded);
    if (upgradable.length) {
      const c = upgradable[Math.floor(Math.random() * upgradable.length)];
      const i = game.deck.indexOf(c);
      game.deck[i] = upgradeCard(c);
    }
  }

  if (game.pendingBoss) {
    game.lastBossId = game.pendingEnemies?.[0];
    game.stats.bossKills = (game.stats.bossKills || 0) + 1;
    const metaBoss = getMeta();
    metaBoss.stats = metaBoss.stats || {};
    metaBoss.stats.bossKills = (metaBoss.stats.bossKills || 0) + 1;
    game.newAchievements = [...(game.newAchievements || []), ...checkAchievements(game, metaBoss, 'boss_kill')];
    localStorage.setItem(META_KEY, JSON.stringify(metaBoss));

    if (shouldDualBossChain(game) && game.lastBossId === 'eclipse_witch' && !game.dualBossChainDone) {
      game.dualBossChainDone = true;
      game.hp = game.combat.player.hp;
      game.combat = null;
      game.pendingBoss = true;
      game.pendingEnemies = ['abyss_core'];
      game.act = 3;
      addJournal(game, '进阶 XX：月蚀之后，星渊之核降临！');
      game.tarotChoices = pickBattleTarotChoices(3);
      game.bossTarotPicks = [];
      game.screen = 'tarot';
      saveGame(game);
      return;
    }
  }
  const clearedNode = game.map?.nodes?.find(n => n.id === game.currentNodeId);
  if (clearedNode?.judgementElite) {
    const metaJ = getMeta();
    game.newAchievements = [...(game.newAchievements || []), ...checkAchievements(game, metaJ, 'judgement_elite')];
    localStorage.setItem(META_KEY, JSON.stringify(metaJ));
  }

  if (game.pendingBoss) {
    if (game.act >= 3) {
      game.victory = true;
      game.screen = 'victory';
      game.stats.totalFloors = (game.act - 1) * 17 + game.floor;
      const meta = getMeta();
      game.newAchievements = onVictoryMeta(game, meta);
      grantRunXp(meta, game);
      game.trueEnding = checkTrueEnding(game, meta);
      if (game.trueEnding) addJournal(game, '🌟 真结局：星渊封印重铸');
      localStorage.setItem(META_KEY, JSON.stringify(meta));
      addJournal(game, '🏆 星渊征服！');
      localStorage.removeItem(SAVE_KEY);
      return;
    }
    /* 非最终 Boss：先卡牌战利品，再 boss 遗物选择 */
  }

  const rewardCtx = applyEnvTarotModifiers(game, 'onRewardRoll', {});
  const tier = getCombatRewardTier(game);
  game.rewards = buildCombatRewards(game, tier, rewardCtx);
  game.rewards.gold = goldGain;

  if (game.pendingBoss) {
    game.pendingPostRewardBossRelic = true;
  }

  game.screen = 'reward';
  game.combat = null;
  game.pendingElite = false;
}

function rollBossRelics(game, n) {
  return rollBossRelicChoices(game, n);
}

export function pickBossRelic(game, relicId) {
  obtainRelic(game, relicId);
  game.act++;
  game.map = null;
  game.currentNodeId = null;
  game.floor = 0;
  game.bossRelicChoice = null;
  game.mapFullReveal = false;
  game.mapFreeTeleport = false;
  game.mapRevealElites = false;
  if (game.act <= 3) {
    beginActWithEnvTarot(game);
  } else {
    game.screen = 'map';
  }
  saveGame(game);
}

/** 隐者环境：奖励界面锻造（升级一张牌） */
export function rewardForge(game) {
  const upgradable = game.deck.map((c, i) => ({ c, i })).filter(x => !x.c.upgraded);
  if (!upgradable.length) return false;
  const pick = upgradable[Math.floor(Math.random() * upgradable.length)];
  game.deck[pick.i] = upgradeCard(pick.c);
  game.stats.forges = (game.stats.forges || 0) + 1;
  const meta = getMeta();
  game.newAchievements = [...(game.newAchievements || []), ...checkAchievements(game, meta, 'forge')];
  localStorage.setItem(META_KEY, JSON.stringify(meta));
  addJournal(game, `锻造：${pick.c.name} 已升级`);
  game.rewards = null;
  game.screen = 'map';
  saveGame(game);
  return true;
}

function buildWeightedCardPool(game) {
  const level = game.characterLevel ?? getCharacterLevel(getMeta(), game.classId);
  let ids = filterCardPoolByLevel(game.classId, level);
  if (!ids.length) ids = REWARD_CARD_POOL[game.classId] || [];
  const pool = [];
  const mult = game.custom?.cardDropMult || 1;
  for (const id of ids.filter(cid => CARD_POOL[cid])) {
    const r = CARD_POOL[id].rarity || 'common';
    let w = RARITY_WEIGHTS[r] || 10;
    if (mult > 1 && (r === 'rare' || r === 'uncommon')) w = Math.floor(w * mult);
    for (let i = 0; i < w; i++) pool.push(id);
  }
  return pool.length ? pool : ['strike'];
}

function rollRelicByRarity(game, minRarity) {
  let pool = Object.values(RELICS).filter(r =>
    !r.class && r.rarity !== 'starter' && r.rarity !== 'boss' && !game.relics.includes(r.id)
  );
  if (minRarity === 'rare') pool = pool.filter(r => r.rarity === 'rare' || r.rarity === 'uncommon');
  if (minRarity === 'uncommon') pool = pool.filter(r => r.rarity === 'uncommon' || r.rarity === 'rare');
  if (minRarity === 'common') pool = pool.filter(r => r.rarity === 'common');
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)].id;
}

function weightedPick(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function rollRelicReward(game, minRarity) {
  let pool = Object.values(RELICS).filter(r =>
    !r.class && r.rarity !== 'starter' && r.rarity !== 'boss' && !game.relics.includes(r.id)
  );
  if (minRarity === 'uncommon') pool = pool.filter(r => r.rarity === 'uncommon' || r.rarity === 'rare');
  if (!pool.length) return null;
  const weighted = [];
  for (const r of pool) {
    const w = RELIC_RARITY_WEIGHTS[r.rarity] || 10;
    for (let i = 0; i < w; i++) weighted.push(r.id);
  }
  return weighted[Math.floor(Math.random() * weighted.length)];
}

function randomPotion() {
  return randomPotionDrop();
}

export function pickReward(game, type, index) {
  const r = game.rewards;
  if (type === 'card' && r?.cards?.[index]) {
    game.deck.push(r.cards[index]);
    r.cardPicked = true;
    saveGame(game);
    return;
  }
  if (type === 'relic') {
    const rid = r?.relicChoices?.[index] ?? r?.relic;
    if (rid) obtainRelic(game, rid);
    if (r) r.relicChoices = null;
    saveGame(game);
    return;
  }
  if (type === 'potion' && r?.potion && game.potions.length < game.maxPotions) {
    game.potions.push(r.potion);
    r.potion = null;
    saveGame(game);
    return;
  }
  if (type === 'forge') { rewardForge(game); return; }
  if (type === 'skip') {
    const goBossRelic = game.pendingPostRewardBossRelic;
    game.rewards = null;
    game.pendingPostRewardBossRelic = false;
    game.pendingBoss = false;
    if (goBossRelic) {
      game.bossRelicChoice = rollBossRelics(game, 3);
      game.screen = 'boss_relic';
    } else {
      game.screen = 'map';
    }
    saveGame(game);
  }
}

export function restHeal(game) {
  if (game.relics.includes('coffee_dripper')) return false;
  const restCtx = applyEnvTarotModifiers(game, 'onRestHeal', { healPercent: getAscensionRestHealPercent(game.ascension || 0) });
  const pct = restCtx.healPercent || getAscensionRestHealPercent(game.ascension || 0);
  game.hp = Math.min(game.maxHp, game.hp + Math.floor(game.maxHp * pct));
  addJournal(game, '休息恢复生命');
  clearNode(game);
  game.screen = 'map';
  saveGame(game);
  return true;
}

export function restDig(game) {
  const roll = Math.random();
  if (roll < 0.5) {
    const g = randInt(40, 80);
    game.gold += g;
    addJournal(game, `挖掘获得 ${g} 金币`);
  } else if (roll < 0.75) {
    game.hp = Math.max(1, game.hp - randInt(3, 8));
    addJournal(game, '挖掘时被尖刺所伤');
  } else {
    const rid = rollRelicReward(game);
    if (rid) { obtainRelic(game, rid); addJournal(game, `挖掘发现遗物：${RELICS[rid]?.name}`); }
    else { game.gold += 30; addJournal(game, '挖掘获得少量金币'); }
  }
  clearNode(game);
  game.screen = 'map';
  saveGame(game);
}

export function restRemoveCard(game, cardIndex) {
  if (cardIndex < 0 || cardIndex >= game.deck.length) return false;
  game.deck.splice(cardIndex, 1);
  addJournal(game, '女祭司环境：移除一张卡牌');
  clearNode(game);
  game.screen = 'map';
  saveGame(game);
  return true;
}

export function restMeditate(game) {
  game.maxHp += 2;
  game.hp += 2;
  addJournal(game, '冥想：最大生命 +2');
  clearNode(game);
  game.screen = 'map';
  saveGame(game);
}

export function pickDiscoverCard(game, index) {
  const cards = game.discoverCards;
  if (cards && cards[index]) {
    game.deck.push(cards[index]);
    addJournal(game, `发现卡牌：${cards[index].name}`);
  }
  game.discoverCards = null;
  game.screen = 'combat';
  saveGame(game);
}

export function inspectPile(game, pileType) {
  game.inspectingPile = pileType;
}

export function restUpgrade(game, cardIndex) {
  if (game.relics.includes('fusion_hammer')) return false;
  if (cardIndex < 0 || cardIndex >= game.deck.length) return false;
  game.deck[cardIndex] = upgradeCard(game.deck[cardIndex]);
  clearNode(game);
  game.screen = 'map';
  saveGame(game);
  return true;
}

function clearNode(game) {
  const node = game.map.nodes.find(n => n.id === game.currentNodeId);
  if (node) node.cleared = true;
}

export function generateShop(game) {
  const priceMod = getAscensionShopPriceMod(game.ascension || 0) * (game.envTarot?.shopCardPriceMult ? 1 : 1);
  const shopCtx = applyEnvTarotModifiers(game, 'onShopPrices', {});
  const finalMod = priceMod * (shopCtx.cardPriceMult || 1);
  const cardPool = buildWeightedCardPool(game);
  const relicPool = Object.values(RELICS).filter(r => !r.class && !game.relics.includes(r.id) && r.rarity !== 'starter' && r.rarity !== 'boss');
  return {
    priceMod: finalMod,
    cards: [0, 1, 2].map(() => makeCard(weightedPick(cardPool))),
    relic: relicPool.length ? relicPool[Math.floor(Math.random() * relicPool.length)] : null,
    potions: [randomPotion(), randomPotion()],
    removeAvailable: true,
    forgeAvailable: true,
    forgePrice: Math.floor(SHOP_PRICES.remove * finalMod),
    saleIndex: Math.floor(Math.random() * 3),
  };
}

export function shopForge(game) {
  const price = game.shop?.forgePrice || SHOP_PRICES.remove;
  if (game.gold < price) return false;
  const upgradable = game.deck.map((c, i) => ({ c, i })).filter(x => !x.c.upgraded);
  if (!upgradable.length) return false;
  game.gold -= price;
  game.stats.shopSpent = (game.stats.shopSpent || 0) + price;
  const pick = upgradable[Math.floor(Math.random() * upgradable.length)];
  game.deck[pick.i] = upgradeCard(pick.c);
  game.shop.forgeAvailable = false;
  addJournal(game, `商店锻造：${pick.c.name} 已升级`);
  saveGame(game);
  return true;
}

export function shopBuy(game, type, index) {
  const mod = game.shop?.priceMod || 1;
  const prices = { card: Math.floor(SHOP_PRICES.card * mod), relic: Math.floor(SHOP_PRICES.relic * mod), potion: Math.floor(SHOP_PRICES.potion * mod), remove: Math.floor(SHOP_PRICES.remove * mod) };
  if (type === 'card') {
    const card = game.shop.cards[index];
    const price = index === game.shop.saleIndex ? SHOP_PRICES.cardSale : prices.card;
    if (!card || game.gold < price) return false;
    game.gold -= price;
    game.deck.push(card);
    game.shop.cards[index] = null;
  } else if (type === 'relic' && game.shop.relic) {
    if (game.gold < prices.relic) return false;
    game.gold -= prices.relic;
    obtainRelic(game, game.shop.relic.id);
    game.shop.relic = null;
  } else if (type === 'potion') {
    if (game.gold < prices.potion || game.potions.length >= game.maxPotions) return false;
    game.gold -= prices.potion;
    game.potions.push(game.shop.potions[index]);
    game.shop.potions[index] = null;
  } else if (type === 'remove') {
    if (game.gold < prices.remove) return false;
    game.gold -= prices.remove;
    game.screen = 'shop_remove';
    return true;
  }
  saveGame(game);
  return true;
}

export function shopRemoveCard(game, index) {
  if (index >= 0 && index < game.deck.length) game.deck.splice(index, 1);
  game.shop.removeAvailable = false;
  game.screen = 'shop';
  saveGame(game);
}

export function leaveShop(game) {
  clearNode(game);
  game.screen = 'map';
  game.shop = null;
  saveGame(game);
}

export function openTreasure(game) {
  const roll = Math.random();
  if (roll < 0.6) {
    const relic = rollRelicReward(game);
    if (relic) {
      if (game.relics.includes('cursed_key')) game.deck.push(makeCard('curse_decay'));
      obtainRelic(game, relic);
    } else game.gold += 75;
  } else if (roll < 0.85) {
    game.gold += randInt(50, 90);
  } else {
    game.deck.push(makeCard(weightedPick(buildWeightedCardPool(game))));
  }
  clearNode(game);
  game.screen = 'map';
  saveGame(game);
}

export function obtainRelic(game, relicId) {
  if (game.relics.includes(relicId)) return;
  game.relics.push(relicId);
  addJournal(game, `获得遗物：${RELICS[relicId]?.icon} ${RELICS[relicId]?.name}`);
  const r = RELICS[relicId];
  if (r?.onObtain) {
    if (r.onObtain.maxHp) { game.maxHp += r.onObtain.maxHp; game.hp += Math.max(0, r.onObtain.maxHp); }
    if (r.onObtain.heal) game.hp = Math.min(game.maxHp, game.hp + r.onObtain.heal);
    if (r.onObtain.removeBasic) {
      const basics = game.deck.filter(c => c.id === 'strike' || c.id === 'defend');
      for (let i = 0; i < r.onObtain.removeBasic && basics.length; i++) {
        const idx = game.deck.findIndex(c => c.id === 'strike' || c.id === 'defend');
        if (idx >= 0) game.deck.splice(idx, 1);
      }
    }
  }
}

export function applyEventChoice(game, choiceIndex) {
  const ev = game.event;
  if (!ev) return;
  const choice = ev.choices[choiceIndex];
  if (!choice) return;
  let eff = { ...choice.effect };
  if (game.ascension >= 9 && eff.gamble) eff.gamble = { ...eff.gamble, chance: (eff.gamble.chance || 0.5) * 0.7 };

  if (eff.wheel) {
    const outcome = WHEEL_OUTCOMES[Math.floor(Math.random() * WHEEL_OUTCOMES.length)];
    game.eventMessage = outcome.text;
    eff = { ...eff, ...outcome.effect };
  }

  const result = resolveEventEffect(game, eff, getEventHelpers(game));
  if (result?.screen) return;
  if (game.eventPending) return;

  clearNode(game);
  game.screen = 'map';
  game.event = null;
  saveGame(game);
}

function getEventHelpers(game) {
  return {
    obtainRelic,
    rollRelicReward,
    rollRelicByRarity,
    weightedPick,
    buildWeightedCardPool,
    randomPotion,
    addJournal,
    clearNode,
    saveGame,
  };
}

export function pickEventRelic(game, index) {
  const rid = game.eventRelicChoices?.[index];
  if (rid) obtainRelic(game, rid);
  game.eventRelicChoices = null;
  clearNode(game);
  game.screen = 'map';
  game.event = null;
  saveGame(game);
}

export function tradeEventCard(game, deckIndex) {
  if ((game.tradeCardRemaining || 0) <= 0) return;
  const pool = buildWeightedCardPool(game).filter(id => CARD_POOL[id]?.rarity === CARD_POOL[game.deck[deckIndex]?.id]?.rarity);
  if (pool.length && game.deck[deckIndex]) {
    game.deck[deckIndex] = makeCard(pool[Math.floor(Math.random() * pool.length)]);
    game.tradeCardRemaining--;
    addJournal(game, '双胞胎商人：卡牌已交换');
  }
  if (game.tradeCardRemaining <= 0) {
    clearNode(game);
    game.screen = 'map';
    game.event = null;
  }
  saveGame(game);
}

export function removeCardFromDeck(game, index) {
  if (index >= 0 && index < game.deck.length) game.deck.splice(index, 1);
  clearNode(game);
  game.screen = 'map';
  game.event = null;
  game.eventPending = false;
  saveGame(game);
}

function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
