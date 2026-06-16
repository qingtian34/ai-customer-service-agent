/** 入口：状态机与回调绑定 */
import {
  createNewGame, saveGame, loadGame, hasSave,
  selectMapNode, finishCombat, pickReward, pickBossRelic,
  selectBattleTarot, selectLoversTarot, selectEnvTarot,
  restHeal, restUpgrade, restDig, restMeditate, restRemoveCard, pickDiscoverCard,
  shopBuy, shopRemoveCard, leaveShop,
  openTreasure, applyEventChoice, removeCardFromDeck,
  shopForge, pickEventRelic, tradeEventCard, retryFromCheckpoint,
} from './game.js';
import { getUnlockedStartBonuses } from './meta.js';
import { playCard, endPlayerTurn, usePotion, useBurstSkill, resolvePendingChoice } from './combat.js';
import { initUI, render, showAchievementPopups } from './ui.js';
import { playSfx, unlockAudio } from './audio.js';

document.addEventListener('click', () => unlockAudio(), { once: true });

let game = null;

initUI({
  hasSave,
  onNewGame: () => { game = { screen: 'class_select' }; render(game); },
  onContinue: () => {
    game = loadGame();
    if (game) {
      if (game.screen === 'combat' && !game.combat) game.screen = 'map';
      if (game.screen === 'env_tarot' && !game.envTarotChoices?.length) game.screen = 'map';
      game.screen = game.screen || 'map';
      render(game);
    }
  },
  onMenu: () => { game = { screen: 'menu' }; render(game); },
  onSelectClass: (classId) => {
    const meta = JSON.parse(localStorage.getItem('spire_ascension_meta') || '{}');
    game = { screen: 'ascension_select', pendingClass: classId, pendingCharLevel: Math.min(20, Math.floor((meta.characterXp?.[classId] || 0) / 500)) };
    render(game);
  },
  onSelectAscension: (ascension) => {
    game.pendingAscension = ascension;
    const meta = JSON.parse(localStorage.getItem('spire_ascension_meta') || '{}');
    const bonuses = getUnlockedStartBonuses(meta);
    if (bonuses.length) {
      game.screen = 'start_bonus';
    } else {
      game = createNewGame(game.pendingClass, ascension, { custom: game.pendingCustom });
      saveGame(game);
    }
    render(game);
  },
  onStartGame: (classId, ascension, opts = {}) => {
    game = createNewGame(classId, ascension ?? game.pendingAscension ?? 0, {
      custom: opts.custom ?? game.pendingCustom,
      startBonus: opts.startBonus,
    });
    saveGame(game);
    render(game);
  },
  onSelectNode: (nodeId) => {
    selectMapNode(game, nodeId);
    saveGame(game);
    render(game);
  },
  onSelectTarot: (tarotId) => {
    selectBattleTarot(game, tarotId);
    saveGame(game);
    render(game);
  },
  onPendingChoice: (payload) => {
    if (!game.combat) return;
    resolvePendingChoice(game.combat, game, payload);
    game.hp = game.combat.player.hp;
    if (game.combat.ended) {
      setTimeout(() => { finishCombat(game); showAchievementPopups(game); render(game); }, 500);
    } else render(game);
  },
  onSelectLovers: (choice) => {
    selectLoversTarot(game, choice);
    saveGame(game);
    render(game);
  },
  onSelectEnvTarot: (tarotId) => {
    selectEnvTarot(game, tarotId);
    saveGame(game);
    render(game);
  },
  onUseBurst: () => {
    if (!game.combat) return false;
    const result = useBurstSkill(game.combat, game, game.combat.selectedTarget);
    if (!result?.ok) return false;
    game.hp = game.combat.player.hp;
    if (game.combat.ended) {
      setTimeout(() => { finishCombat(game); showAchievementPopups(game); render(game); }, 600);
    } else render(game);
    return true;
  },
  onPlayCard: (handIndex, targetIndex) => {
    if (!game.combat) return false;
    const result = playCard(game.combat, game, handIndex, targetIndex);
    if (!result?.ok) return false;
    game.hp = game.combat.player.hp;
    if (result.discover?.length) {
      game.discoverCards = result.discover;
      game.combat.pendingDiscover = null;
      game.screen = 'discover';
      render(game);
      return true;
    }
    if (game.combat.ended) setTimeout(() => { finishCombat(game); showAchievementPopups(game); render(game); }, 600);
    else render(game);
    return true;
  },
  onEndTurn: () => {
    if (!game.combat) return;
    playSfx('endTurn');
    endPlayerTurn(game.combat, game);
    game.hp = game.combat.player.hp;
    if (!game.combat.playerTurn && !game.combat.ended) playSfx('enemyTurn');
    if (game.combat.ended) setTimeout(() => { finishCombat(game); showAchievementPopups(game); render(game); }, 800);
    else render(game);
  },
  onUsePotion: (index) => {
    if (!game.combat || !game.potions[index]) return;
    if (usePotion(game.combat, game, game.potions[index], index)) {
      game.hp = game.combat.player.hp;
      if (game.combat.ended) setTimeout(() => { finishCombat(game); showAchievementPopups(game); render(game); }, 500);
      else render(game);
    }
  },
  onDiscover: (i) => { pickDiscoverCard(game, i); render(game); },
  onReward: (type, index) => {
    if (type === 'relic') playSfx('relic');
    else if (type !== 'skip') playSfx('card');
    pickReward(game, type, index);
    render(game);
  },
  onBossRelic: (relicId) => { pickBossRelic(game, relicId); render(game); },
  onRestHeal: () => { restHeal(game); render(game); },
  onRestUpgrade: (i) => { restUpgrade(game, i); render(game); },
  onRestDig: () => { restDig(game); render(game); },
  onRestMeditate: () => { restMeditate(game); render(game); },
  onRestRemove: (i) => { restRemoveCard(game, i); render(game); },
  onShopBuy: (type, i) => {
    if (type === 'forge') shopForge(game);
    else shopBuy(game, type, i);
    render(game);
  },
  onShopForge: () => { shopForge(game); render(game); },
  onPickEventRelic: (i) => { pickEventRelic(game, i); render(game); },
  onTradeEventCard: (i) => { tradeEventCard(game, i); render(game); },
  onRetryCheckpoint: (type) => {
    if (retryFromCheckpoint(game, type)) {
      game.paused = false;
      game.gameOver = false;
      render(game);
    }
  },
  onShopRemove: (i) => { shopRemoveCard(game, i); render(game); },
  onLeaveShop: () => { leaveShop(game); render(game); },
  onTreasure: () => { openTreasure(game); render(game); },
  onEventChoice: (i) => { applyEventChoice(game, i); render(game); },
  onEventRemove: (i) => { removeCardFromDeck(game, i); render(game); },
  onSave: () => { saveGame(game); toast('游戏已保存'); },
  onResume: () => { game.paused = false; render(game); },
  onShowCodex: () => { game.screen = 'codex'; render(game); },
  onShowAchievements: () => { game.screen = 'achievements'; render(game); },
  onShowArchive: () => { game = { screen: 'archive' }; render(game); },
  onInspectPile: (pile) => { game.inspectingPile = pile; render(game); },
  onClosePile: () => { game.inspectingPile = null; render(game); },
});

game = { screen: 'menu' };
render(game);

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => t.remove(), 2000);
}
