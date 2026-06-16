/** UI 渲染与交互 */
import { CLASSES, CARD_POOL, RELICS, POTIONS, ACTS, ASCENSION, ENEMIES } from './data.js';
import { canPlayCard, playCard, endPlayerTurn, getStatusList, getCardCost } from './combat.js';
import { NODE_TYPES, NODE_LABELS, getNodeTypeKey, normalizeMapForDisplay } from './map.js';
import { getMeta } from './game.js';
import { ACHIEVEMENTS } from './achievements.js';
import { TIER_LABELS } from './rewards.js';
import { getUnlockedStartBonuses, getUnlockedArchive } from './meta.js';
import { getCardKeywords, getActiveSynergies } from './keywords.js';
import { ACT_FLAVOR } from './modifiers.js';
import { getCardArtHtml, getHeroArt, getCombatHeroArt, getEnemyArt, getRelicArt, getCombatBackground, getMapNodeArt } from './art.js';
import { processVfxQueue, cardPlayVfx, initVfx } from './vfx.js';
import {
  combatClassIcon, renderCombatIntent, renderCombatHpBar, renderPotionIcon,
  renderDrawPileIcon, renderDiscardPileIcon, renderExhaustPileIcon, renderEndTurnIcon,
  renderHudGoldIcon, renderHudFloorIcon, renderHudDeckIcon, renderHudRelicIcon, renderHudSaveIcon,
} from './combat-icons.js';
import { initCanvasBg } from './canvas-bg.js';
import { playSfx, unlockAudio, getAudioSettings, setVolume, setMuted } from './audio.js';
import { initTooltip, bindCardTooltips, hideTooltip, showTextTooltip } from './tooltip.js';
import { RESONANCE_ATTR, getCardAttribute, formatResonanceTooltip } from './resonance.js';
import { canUseBurst, BURST_SKILLS } from './burst.js';
import { BATTLE_TAROT } from './tarot.js';
import { ENV_TAROT } from './env-tarot.js';

let game = null;
let callbacks = {};

export function initUI(cbs) {
  callbacks = cbs;
  initVfx();
  initTooltip();
  bindGlobalEvents();
  document.body.addEventListener('click', () => unlockAudio(), { once: true });
}

export function render(gameState) {
  game = gameState;
  const app = document.getElementById('app');
  app.className = `screen-${game.screen} act-${game.act || 1} screen-enter`;
  setTimeout(() => app.classList.remove('screen-enter'), 400);

  const bgScreen = ['combat'].includes(game.screen) ? 'combat'
    : ['map'].includes(game.screen) ? 'map'
    : ['rest'].includes(game.screen) ? 'rest'
    : 'menu';
  initCanvasBg(bgScreen, game.act || 1);

  if (game.paused && game.screen !== 'menu') {
    renderPauseOverlay();
    return;
  }
  hideTooltip();
  app.innerHTML = '';

  switch (game.screen) {
    case 'menu': renderMenu(app); break;
    case 'class_select': renderClassSelect(app); break;
    case 'map': renderMap(app); break;
    case 'combat': renderCombat(app); break;
    case 'tarot': renderTarotSelect(app); break;
    case 'tarot_lovers': renderTarotLovers(app); break;
    case 'env_tarot': renderEnvTarotSelect(app); break;
    case 'reward': renderReward(app); break;
    case 'rest': renderRest(app); break;
    case 'shop': renderShop(app); break;
    case 'shop_remove': renderShopRemove(app); break;
    case 'event': renderEvent(app); break;
    case 'event_remove': renderEventRemove(app); break;
    case 'treasure': renderTreasure(app); break;
    case 'boss_relic': renderBossRelic(app); break;
    case 'ascension_select': renderAscensionSelect(app); break;
    case 'custom_select': renderCustomSelect(app); break;
    case 'start_bonus': renderStartBonus(app); break;
    case 'archive': renderArchive(app); break;
    case 'event_relic': renderEventRelic(app); break;
    case 'event_trade': renderEventTrade(app); break;
    case 'discover': renderDiscover(app); break;
    case 'codex': renderCodex(app); break;
    case 'achievements': renderAchievements(app); break;
    case 'gameover': renderGameOver(app); break;
    case 'victory': renderVictory(app); break;
  }
}

function bindGlobalEvents() {
  document.addEventListener('keydown', (e) => {
    if (!game) return;
    if (game.screen === 'combat' && !game.paused) {
      if (e.key === 'e' || e.key === 'E') callbacks.onEndTurn?.();
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= 9 && game.combat) {
        const idx = n - 1;
        if (canPlayCard(game.combat, idx)) {
          callbacks.onPlayCard?.(idx, game.combat.selectedTarget);
        } else playSfx('error');
      }
    }
    if (e.key === 'Escape') {
      if (game.paused) { game.paused = false; render(game); }
      else if (game.screen !== 'menu' && !game.gameOver) { game.paused = true; render(game); }
    }
  });
}

function renderMenu(app) {
  const meta = getMeta();
  const heroBg = Object.keys(CLASSES).map(id => getHeroArt(id, 'large')).join('');
  app.innerHTML = `
    <div class="menu-bg"></div>
    <div class="menu-heroes">${heroBg}</div>
    <div class="menu-content">
      <h1 class="title">星渊之塔</h1>
      <p class="subtitle">Star Abyss Tower · 星辰共鸣 Roguelike</p>
      <div class="meta-stats">
        <span>🏆 通关 ${meta.wins || 0}</span>
        <span>💀 败北 ${meta.losses || 0}</span>
        <span>⭐ 最高进阶 ${meta.bestAscension || 0}</span>
      </div>
      <div class="menu-buttons">
        <button class="btn btn-primary" data-action="new">开始冒险</button>
        <button class="btn btn-secondary" data-action="continue" ${callbacks.hasSave?.() ? '' : 'disabled'}>继续游戏</button>
        <button class="btn btn-ghost" data-action="help">游戏说明</button>
        <button class="btn btn-ghost" data-action="codex">图鉴</button>
        <button class="btn btn-ghost" data-action="achievements">成就</button>
        <button class="btn btn-ghost" data-action="archive">星渊档案馆</button>
      </div>
      <p class="content-badge">星辰共鸣 · 战斗塔罗 · 80+ 卡牌 · 45+ 遗物</p>
    </div>
  `;
  app.querySelector('[data-action="new"]').onclick = () => { playSfx('click'); callbacks.onNewGame?.(); };
  app.querySelector('[data-action="continue"]').onclick = () => { playSfx('click'); callbacks.onContinue?.(); };
  app.querySelector('[data-action="help"]').onclick = () => { playSfx('click'); showHelp(); };
  app.querySelector('[data-action="codex"]').onclick = () => { playSfx('click'); callbacks.onShowCodex?.(); };
  app.querySelector('[data-action="achievements"]').onclick = () => { playSfx('click'); callbacks.onShowAchievements?.(); };
  app.querySelector('[data-action="archive"]').onclick = () => { playSfx('click'); callbacks.onShowArchive?.(); };
}

function renderClassSelect(app) {
  const cards = Object.values(CLASSES).map(cls => `
    <div class="class-card" data-class="${cls.id}" style="--class-color:${cls.color}">
      ${getHeroArt(cls.id, 'portrait')}
      <h3>${cls.name}</h3>
      <p>${cls.desc}</p>
      <div class="class-stats">生命 ${cls.maxHp}</div>
    </div>
  `).join('');
  app.innerHTML = `
    <div class="panel class-select-panel">
      <h2>选择你的英雄</h2>
      <div class="class-grid">${cards}</div>
      <button class="btn btn-ghost back-btn" data-action="back">返回</button>
    </div>
  `;
  app.querySelectorAll('.class-card').forEach(el => {
    el.onclick = () => callbacks.onSelectClass?.(el.dataset.class);
  });
  app.querySelector('[data-action="back"]').onclick = () => callbacks.onMenu?.();
}

function renderAscensionSelect(app) {
  const pendingClass = game.pendingClass;
  const cls = CLASSES[pendingClass];
  const meta = getMeta();
  const maxUnlocked = Math.min(20, (meta.bestAscension || 0) + 1);
  const levels = ASCENSION.map(a => {
    const locked = a.level > maxUnlocked;
    return `
    <button class="ascension-btn${locked ? ' locked' : ''}" data-level="${a.level}" ${locked ? 'disabled' : ''}>
      <strong>${a.name}</strong>
      <small>${locked ? '🔒 需通关上一进阶' : a.desc}</small>
    </button>`;
  }).join('');
  app.innerHTML = `
    <div class="panel ascension-panel">
      <div class="ascension-hero">${getHeroArt(pendingClass, 'portrait')}</div>
      <h2>${cls?.name} — 选择进阶等级</h2>
      <p class="tarot-hint">已解锁 0–${maxUnlocked} · 角色等级 ${game.pendingCharLevel ?? getCharacterLevelDisplay(meta, pendingClass)}</p>
      <div class="ascension-grid">${levels}</div>
      <div class="menu-buttons">
        <button class="btn btn-secondary" data-action="custom">⚙ 自定义模式</button>
        <button class="btn btn-ghost" data-action="back">返回</button>
      </div>
    </div>
  `;
  app.querySelectorAll('.ascension-btn:not(.locked)').forEach(el => {
    el.onclick = () => callbacks.onSelectAscension?.(+el.dataset.level);
  });
  app.querySelector('[data-action="custom"]').onclick = () => { game.screen = 'custom_select'; render(game); };
  app.querySelector('[data-action="back"]').onclick = () => { game.screen = 'class_select'; render(game); };
}

function getCharacterLevelDisplay(meta, classId) {
  const xp = meta?.characterXp?.[classId] || 0;
  return Math.min(20, Math.floor(xp / 500));
}

function renderCustomSelect(app) {
  const c = game.pendingCustom || { energy: 0, gold: 0, maxHp: 0, cardDropMult: 1, allRelicsOpen: false };
  app.innerHTML = `
    <div class="panel custom-panel">
      <h2>⚙ 自定义模式</h2>
      <p class="tarot-hint">调参爽局 — 不影响进阶解锁</p>
      <label>额外起始能量 <input type="number" id="custom-energy" min="0" max="3" value="${c.energy}"/></label>
      <label>额外起始金币 <input type="number" id="custom-gold" min="0" max="500" value="${c.gold}"/></label>
      <label>额外最大生命 <input type="number" id="custom-hp" min="0" max="50" value="${c.maxHp}"/></label>
      <label>卡牌奖励倍率 <input type="number" id="custom-cards" min="1" max="3" step="0.5" value="${c.cardDropMult}"/></label>
      <label><input type="checkbox" id="custom-relics" ${c.allRelicsOpen ? 'checked' : ''}/> 遗物池全开放（+幸运币）</label>
      <div class="menu-buttons">
        <button class="btn btn-primary" data-action="confirm">确认并选进阶</button>
        <button class="btn btn-ghost" data-action="back">返回</button>
      </div>
    </div>
  `;
  app.querySelector('[data-action="confirm"]').onclick = () => {
    game.pendingCustom = {
      energy: +app.querySelector('#custom-energy').value || 0,
      gold: +app.querySelector('#custom-gold').value || 0,
      maxHp: +app.querySelector('#custom-hp').value || 0,
      cardDropMult: +app.querySelector('#custom-cards').value || 1,
      allRelicsOpen: app.querySelector('#custom-relics').checked,
    };
    game.screen = 'ascension_select';
    render(game);
  };
  app.querySelector('[data-action="back"]').onclick = () => { game.screen = 'ascension_select'; render(game); };
}

function renderStartBonus(app) {
  const meta = getMeta();
  const bonuses = getUnlockedStartBonuses(meta);
  const cards = bonuses.map(b => `
    <button class="tarot-pick-card start-bonus-card" data-bonus="${b.id}">
      <h3>${b.name}</h3>
      <p>${b.desc}</p>
    </button>`).join('');
  app.innerHTML = `
    <div class="panel">
      <h2>🎁 开局加成</h2>
      <p class="tarot-hint">成就解锁的额外起始奖励（可选）</p>
      <div class="tarot-pick-grid">${cards || '<p>暂无解锁加成</p>'}</div>
      <button class="btn btn-primary" data-skip>跳过，直接开始</button>
      <button class="btn btn-ghost" data-back>返回</button>
    </div>
  `;
  app.querySelectorAll('[data-bonus]').forEach(el => {
    el.onclick = () => callbacks.onStartGame?.(game.pendingClass, game.pendingAscension, { startBonus: el.dataset.bonus, custom: game.pendingCustom });
  });
  app.querySelector('[data-skip]').onclick = () => callbacks.onStartGame?.(game.pendingClass, game.pendingAscension, { custom: game.pendingCustom });
  app.querySelector('[data-back]').onclick = () => { game.screen = 'ascension_select'; render(game); };
}

function renderArchive(app) {
  const meta = getMeta();
  const entries = getUnlockedArchive(meta);
  app.innerHTML = `
    <div class="panel archive-panel">
      <h2>📚 星渊档案馆</h2>
      <p>记忆碎片 ${meta.fragments || 0} · 已解锁 ${entries.length} 条 lore</p>
      <div class="archive-list">${entries.map(e => `
        <div class="archive-entry">
          <strong>${e.title}</strong> <small>（${e.fragments} 碎片）</small>
          <p>${e.text}</p>
        </div>`).join('') || '<p>继续冒险以收集记忆碎片…</p>'}</div>
      <button class="btn btn-ghost" data-back>返回</button>
    </div>
  `;
  app.querySelector('[data-back]').onclick = () => callbacks.onMenu?.();
}

function renderEventRelic(app) {
  const choices = game.eventRelicChoices || [];
  app.innerHTML = `
    <div class="panel">
      <h2>🎁 选择遗物</h2>
      <div class="relic-pick-grid">${choices.map((rid, i) => {
        const r = RELICS[rid];
        return `<button class="btn btn-relic" data-i="${i}">${getRelicArt(rid, r)}<strong>${r?.name}</strong><br><small>${r?.desc}</small></button>`;
      }).join('')}</div>
    </div>`;
  app.querySelectorAll('[data-i]').forEach(el => {
    el.onclick = () => callbacks.onPickEventRelic?.(+el.dataset.i);
  });
}

function renderEventTrade(app) {
  const remain = game.tradeCardRemaining || 0;
  app.innerHTML = `
    <div class="panel">
      <h2>🔄 双胞胎商人 — 交换卡牌</h2>
      <p>剩余 ${remain} 次 · 点击一张牌换成同稀有度随机牌</p>
      <div class="deck-grid">${game.deck.map((c, i) => `
        <div class="deck-card-mini card-${c.type}" data-i="${i}">${c.name}${c.upgraded ? '+' : ''}</div>
      `).join('')}</div>
    </div>`;
  app.querySelectorAll('[data-i]').forEach(el => {
    el.onclick = () => callbacks.onTradeEventCard?.(+el.dataset.i);
  });
}

function renderMap(app) {
  const act = ACTS[game.act - 1] || ACTS[0];
  const flavor = ACT_FLAVOR[game.act] || ACT_FLAVOR[1];
  const map = normalizeMapForDisplay(game.map);
  const nodes = map.nodes;
  const currentId = game.currentNodeId;
  const paths = map.connections.map(c => {
    const from = nodes.find(n => n.id === c.from);
    const to = nodes.find(n => n.id === c.to);
    const isNext = from && to && (
      (currentId && c.from === currentId && to.available && !to.cleared) ||
      (!currentId && from.row === 0 && from.available && !from.cleared && to.available && !to.cleared)
    );
    return {
      x1: from.x * 100, y1: from.y * 100, x2: to.x * 100, y2: to.y * 100,
      cleared: from.cleared && to.cleared,
      active: !!isNext,
    };
  });

  const pathSvg = paths.map(p =>
    `<line x1="${p.x1}%" y1="${p.y1}%" x2="${p.x2}%" y2="${p.y2}%"
      class="map-path ${p.cleared ? 'cleared' : ''} ${p.active ? 'active' : ''}"/>`
  ).join('');

  const teleportMode = !!game.mapFreeTeleport;
  const revealAll = !!game.mapFullReveal;

  const mapRows = map.rows || 17;
  const mapContentHeight = mapRows * 72 + 80;
  const mapPadY = 56;
  const mapInnerHeight = mapContentHeight + mapPadY * 2;

  const nodeEls = nodes.map(n => {
    const typeKey = getNodeTypeKey(n.type);
    const nt = NODE_TYPES[typeKey] || NODE_TYPES.M;
    const canTeleport = teleportMode && n.cleared && n.id !== game.currentNodeId;
    const showType = revealAll || n.visited || n.available || n.revealed || n.cleared;
    const cls = [
      'map-node', `node-${n.type}`,
      n.isStart || (n.row === 0 && !game.currentNodeId) ? 'node-start' : '',
      n.isBoss || n.type === 'boss' ? 'node-boss' : '',
      n.available ? 'available' : '',
      n.visited ? 'visited' : '',
      n.cleared ? 'cleared' : '',
      canTeleport ? 'teleport-target' : '',
      !showType ? 'fogged' : '',
      game.currentNodeId === n.id ? 'current' : '',
      n.judgementElite ? 'judgement-elite' : '',
    ].filter(Boolean).join(' ');
    const label = showType ? (n.judgementElite ? '审判精英' : nt.label) : '？';
    return `<div class="${cls}" data-node="${n.id}" style="left:${n.x * 100}%;top:${n.y * 100}%" title="${label}">
      <span class="node-emoji" aria-hidden="true">${nt.icon}</span>
      ${showType ? `<span class="node-label">${label}</span>` : '<span class="node-label node-fog">？</span>'}
    </div>`;
  }).join('');

  const mapLegend = `
    <div class="map-legend">
      <h4>图例</h4>
      <div class="legend-row"><span class="legend-icon">❓</span> 未知</div>
      <div class="legend-row"><span class="legend-icon">🛒</span> 商店</div>
      <div class="legend-row"><span class="legend-icon">🔥</span> 休息</div>
      <div class="legend-row"><span class="legend-icon">⚔</span> 敌人</div>
      <div class="legend-row"><span class="legend-icon">👹</span> 精英</div>
      <div class="legend-row"><span class="legend-icon">💀</span> Boss</div>
    </div>`;

  const bossHint = nodes.some(n => n.type === 'boss')
    ? '<div class="map-boss-hint">通往最终 Boss</div>' : '';

  const journal = (game.journal || []).slice(0, 6).map(j =>
    `<div class="journal-line"><span class="j-floor">${j.act}-${j.floor}</span> ${j.text}</div>`
  ).join('');

  app.innerHTML = `
    <header class="hud">
      <div class="hud-left">
        <span class="hud-class">${CLASSES[game.classId]?.icon} ${game.className}</span>
        <span class="hud-act">${act.name}</span>
        ${game.ascension ? `<span class="asc-badge">进阶 ${game.ascension}</span>` : ''}
      </div>
      <div class="hud-center">
        <span class="hp-bar">❤️ ${game.hp}/${game.maxHp}</span>
        <span class="gold">💰 ${game.gold}</span>
        <span class="floor-badge">层 ${game.floor}</span>
      </div>
      <div class="hud-right">
        <button class="btn-icon" data-action="deck" title="卡组">🃏 ${game.deck.length}</button>
        <button class="btn-icon" data-action="relics" title="遗物">✨ ${game.relics.length}</button>
        <button class="btn-icon" data-action="journal" title="日志">📜</button>
        <button class="btn-icon" data-action="save" title="保存">💾</button>
      </div>
    </header>
    <div class="map-layout">
      <div class="map-scroll-viewport" id="map-scroll-viewport">
        <div class="map-scroll-inner" style="height:${mapInnerHeight}px">
          <div class="map-container act-theme-${game.act}" style="--act-color:${flavor.color};height:${mapContentHeight}px">
            <div class="map-flavor"><span class="map-flavor-mood">${flavor.mood}</span></div>
            ${bossHint}
            <svg class="map-svg" viewBox="0 0 100 100" preserveAspectRatio="none">${pathSvg}</svg>
            <div class="map-nodes">${nodeEls}</div>
          </div>
        </div>
      </div>
      ${mapLegend}
      <aside class="journal-panel">
        <h4>📜 冒险日志</h4>
        <div class="journal-scroll">${journal || '<p class="empty-journal">旅程刚刚开始…</p>'}</div>
      </aside>
    </div>
    <footer class="map-footer">${teleportMode ? '🌍 世界塔罗：点击已通关节点可传送 · ' : ''}滚轮上下移动地图 · Esc 暂停</footer>
  `;

  bindMapScroll(app);
  scrollMapToActiveNode(app);

  app.querySelectorAll('.map-node.available, .map-node.teleport-target').forEach(el => {
    el.onclick = () => { playSfx('map'); callbacks.onSelectNode?.(el.dataset.node); };
  });
  app.querySelector('[data-action="deck"]').onclick = () => showDeckModal(true);
  app.querySelector('[data-action="relics"]').onclick = () => showRelicsModal();
  app.querySelector('[data-action="journal"]').onclick = () => showJournalModal();
  app.querySelector('[data-action="save"]').onclick = () => callbacks.onSave?.();
}

const renderIntentBubble = renderCombatIntent;
const renderStsHpBar = renderCombatHpBar;

function renderCombat(app) {
  const c = game.combat;
  const p = c.player;
  const enemies = c.enemies.filter(e => e.hp > 0);
  const synergies = getActiveSynergies(c);
  const mod = c.eliteModifier;

  const synergyHtml = synergies.length ? `
    <div class="synergy-bar">${synergies.map(s =>
      `<span class="synergy-chip" title="${s.desc}">${s.icon} ${s.name}</span>`
    ).join('')}</div>` : '';

  const modBanner = mod ? `<div class="elite-mod-banner">${mod.icon} 精英词缀：${mod.name} — ${mod.desc}</div>` : '';

  const enemyHtml = enemies.map((e) => {
    const statuses = getStatusList(e).map(s => `<span class="status-badge" title="${s.desc}">${s.name}${s.value}</span>`).join('');
    const idx = c.enemies.indexOf(e);
    const def = ENEMIES[e.id] || {};
    return `
      <div class="enemy-panel ${c.selectedTarget === idx ? 'targeted' : ''}" data-target="${idx}">
        ${renderCombatIntent(e.intent)}
        ${getEnemyArt(e.id, { elite: def.elite, boss: def.boss, index: idx })}
        <div class="enemy-name">${e.name}${e.phase > 1 ? ' ★' : ''}</div>
        ${renderStsHpBar(e.hp, e.maxHp, e.block)}
        <div class="status-row">${statuses}</div>
      </div>
    `;
  }).join('');

  const handLen = p.hand.length;
  const handHtml = p.hand.map((card, i) => {
    const playable = canPlayCard(c, i);
    const cost = getCardCost(c, card);
    const offset = i - (handLen - 1) / 2;
    const rot = handLen > 1 ? offset * 5 : 0;
    const lift = Math.abs(offset) * 10;
    const fanStyle = `--fan-rot:${rot}deg; transform:rotate(${rot}deg) translateY(${lift}px); z-index:${i + 1};`;
    return renderCardMarkup(card, { playable, handIndex: i, cost, fanStyle });
  }).join('');

  const potionsHtml = (game.potions || []).map((pid, i) => {
    const pot = POTIONS[pid];
    return `<button class="potion-slot" data-potion="${i}" title="${pot?.desc}">${renderPotionIcon()}</button>`;
  }).join('');
  const emptyPotions = Math.max(0, (game.maxPotions || 3) - (game.potions?.length || 0));
  const potionSlots = potionsHtml + Array(emptyPotions).fill('<span class="potion-slot empty"></span>').join('');

  const pStatuses = getStatusList(p).map(s => `<span class="status-badge" title="${s.desc}">${s.name} ${s.value}</span>`).join('');
  const relicsHtml = game.relics.map(rid => getRelicArt(rid, RELICS[rid])).join('');

  const cls = CLASSES[game.classId];
  const res = c.resonance || { sun: 0, moon: 0, star: 0 };
  const burst = c.burst || { charge: 0, cooldown: 0 };
  const burstSkill = BURST_SKILLS[game.classId];
  const burstReady = canUseBurst(c);
  const tarot = c.battleTarot;

  const resonanceHtml = `
    <aside class="resonance-panel" title="${formatResonanceTooltip(res)}">
      <div class="resonance-title">星辰共鸣</div>
      ${['sun', 'moon', 'star'].map(key => {
        const a = RESONANCE_ATTR[key];
        const layers = res[key] || 0;
        return `<div class="res-bar res-${key}" style="--fill:${Math.min(100, layers * 10)}%; --color:${a.color}">
          <span class="res-icon">${a.icon}</span>
          <div class="res-track"><div class="res-fill"></div></div>
          <span class="res-val">${layers}</span>
        </div>`;
      }).join('')}
      <button class="burst-btn ${burstReady ? 'ready' : ''}" data-action="burst" title="${burstSkill?.desc || ''}"
        ${burstReady ? '' : 'disabled'}>
        <span class="burst-icon">${burstSkill?.icon || '✦'}</span>
        <span class="burst-label">${burstSkill?.name || '爆发'}</span>
        <span class="burst-charge">${burst.charge || 0}/5</span>
        ${burst.cooldown > 0 ? `<span class="burst-cd">CD ${burst.cooldown}</span>` : ''}
      </button>
      ${tarot ? `<div class="battle-tarot-chip" title="${tarot.desc}">${tarot.icon} ${tarot.name}</div>` : ''}
      ${game.classId === 'arcane_mage' || (c.charge || 0) > 0 ? `
        <div class="charge-bar" title="星尘充能">
          <span class="charge-label">充能</span>
          <span class="charge-val">${c.charge || 0}</span>
        </div>` : ''}
    </aside>`;

  app.innerHTML = `
    <div class="combat-scene sts-combat act-combat-${game.act}" style="background:${getCombatBackground(game.act)}; --class-color:${cls?.color || '#c45c3e'}">
      ${resonanceHtml}
      <div class="combat-bg-fx"></div>
      ${modBanner}
      ${synergyHtml}

      <header class="combat-hud">
        <div class="combat-hud-left">
          <span class="combat-class-badge" style="background:${cls?.color}22;border-color:${cls?.color}">${combatClassIcon(game.classId, cls?.color)} ${cls?.name}</span>
          ${renderCombatHpBar(p.hp, p.maxHp)}
          <span class="combat-gold" title="金币">${renderHudGoldIcon()} ${game.gold}</span>
        </div>
        <div class="combat-hud-center">
          <div class="potion-row">${potionSlots}</div>
        </div>
        <div class="combat-hud-right">
          <span class="combat-floor" title="当前层数">${renderHudFloorIcon()} ${game.floor}</span>
          <button class="hud-btn" data-action="deck" title="卡组 (${game.deck.length})">${renderHudDeckIcon()}</button>
          <button class="hud-btn" data-action="relics" title="遗物">${renderHudRelicIcon()}</button>
          <button class="hud-btn" data-action="save" title="保存">${renderHudSaveIcon()}</button>
        </div>
      </header>

      <div class="combat-relic-strip">${relicsHtml || '<span class="relic-empty">暂无遗物</span>'}</div>

      <div class="combat-arena">
        <div class="player-combat-unit" style="--class-color:${cls?.color}">
          <div class="player-sprite">${getCombatHeroArt(game.classId)}</div>
          ${renderStsHpBar(p.hp, p.maxHp, p.block)}
          <div class="status-row player-status">${pStatuses}</div>
        </div>
        <div class="enemy-area">${enemyHtml || '<div class="victory-msg">敌人已消灭</div>'}</div>
      </div>

      <div class="combat-bottom">
        <div class="bottom-left">
          <div class="energy-orb" title="能量">
            <div class="energy-orb-bg"></div>
            <div class="energy-orb-inner">
              <span class="energy-current">${p.energy}</span>
              <span class="energy-sep">/</span>
              <span class="energy-max">${p.maxEnergy}</span>
            </div>
          </div>
          <button class="pile-stack pile-draw" data-pile="draw" title="抽牌堆">
            <span class="pile-icon-img">${renderDrawPileIcon()}</span>
            <span class="pile-count">${p.drawPile.length}</span>
          </button>
        </div>

        <div class="hand-fan">${handHtml}</div>

        <div class="bottom-right">
          <button class="btn-end-turn" data-action="end" ${c.playerTurn && !c.ended ? '' : 'disabled'}>
            <span class="end-turn-label">结束回合</span>
            ${renderEndTurnIcon()}
          </button>
          <button class="pile-stack pile-discard" data-pile="discard" title="弃牌堆">
            <span class="pile-icon-img">${renderDiscardPileIcon()}</span>
            <span class="pile-count">${p.discard.length}</span>
          </button>
          ${p.exhaust.length ? `<button class="pile-stack pile-exhaust" data-pile="exhaust" title="消耗堆"><span class="pile-icon-img">${renderExhaustPileIcon()}</span><span class="pile-count">${p.exhaust.length}</span></button>` : ''}
        </div>
      </div>

      <div class="combat-log-collapsed" title="战斗日志">${c.log[0] || ''}</div>
    </div>
  `;

  app.querySelector('[data-action="deck"]')?.addEventListener('click', () => showDeckModal(true));
  app.querySelector('[data-action="relics"]')?.addEventListener('click', () => showRelicsModal());
  app.querySelector('[data-action="save"]')?.addEventListener('click', () => callbacks.onSave?.());

  app.querySelectorAll('.hand-card:not(.disabled)').forEach(el => {
    el.onclick = () => {
      const idx = +el.dataset.hand;
      const target = c.selectedTarget;
      if (callbacks.onPlayCard?.(idx, target)) { playSfx('card'); cardPlayVfx(el); }
    };
  });
  app.querySelectorAll('.enemy-panel').forEach(el => {
    el.onclick = () => { c.selectedTarget = +el.dataset.target; render(game); };
  });
  app.querySelectorAll('.potion-slot[data-potion]').forEach(el => {
    el.onclick = () => callbacks.onUsePotion?.(+el.dataset.potion);
  });
  app.querySelectorAll('.pile-stack[data-pile]').forEach(el => {
    el.onclick = () => showPileModal(el.dataset.pile);
  });
  app.querySelector('[data-action="end"]').onclick = () => { playSfx('endTurn'); callbacks.onEndTurn?.(); };
  app.querySelector('[data-action="burst"]')?.addEventListener('click', () => {
    if (callbacks.onUseBurst?.()) playSfx('card');
  });

  if (game.inspectingPile) showPileModal(game.inspectingPile);

  if (c.vfxQueue?.length) {
    requestAnimationFrame(() => {
      processVfxQueue(c.vfxQueue);
      c.vfxQueue = [];
    });
  }

  renderPendingChoiceOverlay(app, c);

  window.__gameCombatHand = p.hand;
  bindCardTooltips(app.querySelector('.hand-fan'), (card) => CARD_POOL[card.id]);

  app.querySelectorAll('.intent-bubble').forEach(el => {
    const panel = el.closest('.enemy-panel');
    if (!panel) return;
    el.addEventListener('mouseenter', (e) => {
      const idx = +panel.dataset.target;
      const enemy = c.enemies[idx];
      if (enemy?.intent?.display) showTextTooltip(enemy.intent.display, e.clientX, e.clientY);
    });
    el.addEventListener('mouseleave', hideTooltip);
  });
}

function renderPendingChoiceOverlay(app, combat) {
  const ch = combat.pendingChoice;
  if (!ch) return;
  const p = combat.player;
  let body = '';

  if (ch.type === 'charge_or_block') {
    body = `
      <button class="btn" data-pending="charge">充能 +${ch.charge || 5}</button>
      <button class="btn" data-pending="block">护盾（至多 ${ch.blockCap || 10}）</button>`;
  } else if (ch.type === 'potion_resonance') {
    body = `
      <button class="btn" data-pending="res-sun">☀ 日之共鸣 +${ch.amount || 4}</button>
      <button class="btn" data-pending="res-moon">🌙 月之共鸣 +${ch.amount || 4}</button>
      <button class="btn" data-pending="res-star">⭐ 星之共鸣 +${ch.amount || 4}</button>`;
  } else if (ch.type === 'exhaust_hand') {
    body = `<p>选择 ${ch.count || 2} 张手牌消耗，然后抽 ${ch.thenDraw || 3} 张</p>
      <div class="pending-hand">${p.hand.map((card, i) =>
        `<button class="pending-card-btn" data-hand-pick="${i}">${card.name}</button>`
      ).join('')}</div>
      <button class="btn btn-primary" data-pending="confirm-exhaust" disabled id="pending-confirm">确认</button>`;
  } else if (ch.handIndices || ch.options) {
    const cards = ch.options
      ? ch.options.map((o, i) => ({ i, name: o.card?.name || '牌' }))
      : (ch.handIndices || []).map(i => ({ i, name: p.hand[i]?.name || '牌' }));
    body = cards.map(({ i, name }) =>
      `<button class="pending-card-btn" data-hand-pick="${i}">${name}</button>`
    ).join('');
  }

  const overlay = document.createElement('div');
  overlay.className = 'pending-choice-overlay';
  overlay.innerHTML = `
    <div class="pending-choice-panel">
      <h3>请选择</h3>
      <div class="pending-choice-body">${body}</div>
    </div>`;
  app.appendChild(overlay);

  const picked = new Set();
  overlay.querySelectorAll('[data-pending="charge"]').forEach(el => {
    el.onclick = () => callbacks.onPendingChoice?.({ pick: 'charge' });
  });
  overlay.querySelector('[data-pending="block"]')?.addEventListener('click', () => {
    callbacks.onPendingChoice?.({ pick: 'block' });
  });
  overlay.querySelector('[data-pending="res-sun"]')?.addEventListener('click', () => {
    callbacks.onPendingChoice?.({ attr: 'sun' });
  });
  overlay.querySelector('[data-pending="res-moon"]')?.addEventListener('click', () => {
    callbacks.onPendingChoice?.({ attr: 'moon' });
  });
  overlay.querySelector('[data-pending="res-star"]')?.addEventListener('click', () => {
    callbacks.onPendingChoice?.({ attr: 'star' });
  });
  overlay.querySelectorAll('[data-hand-pick]').forEach(el => {
    el.onclick = () => {
      const idx = +el.dataset.handPick;
      if (ch.type === 'exhaust_hand') {
        if (picked.has(idx)) picked.delete(idx);
        else if (picked.size < (ch.count || 2)) picked.add(idx);
        el.classList.toggle('selected', picked.has(idx));
        const btn = overlay.querySelector('#pending-confirm');
        if (btn) {
          btn.disabled = picked.size < (ch.count || 2);
          btn.onclick = () => callbacks.onPendingChoice?.({ indices: [...picked] });
        }
      } else {
        callbacks.onPendingChoice?.({ handIndex: idx, index: idx });
      }
    };
  });
}

function renderDiscover(app) {
  const cards = game.discoverCards || [];
  app.innerHTML = `
    <div class="panel discover-panel">
      <h2>🔮 发现 — 选择一张加入卡组</h2>
      <div class="reward-cards">${cards.map((c, i) =>
        `<div class="reward-card-wrap" data-discover="${i}">${cardPreview(c)}</div>`
      ).join('')}</div>
    </div>
  `;
  app.querySelectorAll('[data-discover]').forEach(el => {
    el.onclick = () => callbacks.onDiscover?.(+el.dataset.discover);
  });
}

function renderBossRelic(app) {
  const choices = game.bossRelicChoice || [];
  app.innerHTML = `
    <div class="panel boss-relic-panel">
      <h2>👑 Boss 战利品 — 选择一件遗物</h2>
      <div class="boss-relic-grid">
        ${choices.map(rid => {
          const r = RELICS[rid];
          return `<div class="boss-relic-card" data-relic="${rid}">
            ${getRelicArt(rid, r)}
            <h3>${r?.name}</h3>
            <p>${r?.desc}</p>
          </div>`;
        }).join('')}
      </div>
    </div>
  `;
  app.querySelectorAll('.boss-relic-card').forEach(el => {
    el.onclick = () => callbacks.onBossRelic?.(el.dataset.relic);
  });
}

function bindMapScroll(app) {
  const viewport = app.querySelector('#map-scroll-viewport');
  if (!viewport) return;
  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    viewport.scrollTop += e.deltaY;
  }, { passive: false });
}

function scrollMapToActiveNode(app) {
  const viewport = app.querySelector('#map-scroll-viewport');
  if (!viewport) return;
  requestAnimationFrame(() => {
    const maxScroll = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
    let target = viewport.querySelector('.map-node.current');
    if (!target && !game.currentNodeId) {
      // 新开局：起点在底部，滚到底部
      viewport.scrollTop = maxScroll;
      return;
    }
    if (!target) target = viewport.querySelector('.map-node.available');
    if (!target) {
      viewport.scrollTop = maxScroll;
      return;
    }
    const vRect = viewport.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();
    const delta = tRect.top - vRect.top - viewport.clientHeight * 0.42;
    viewport.scrollTop = Math.max(0, Math.min(viewport.scrollTop + delta, maxScroll));
  });
}

function renderReward(app) {
  const r = game.rewards;
  const tierLabel = TIER_LABELS[r.tier] || '';
  const cards = r.cards.map((c, i) => {
    const preview = cardPreview(c);
    const picked = r.cardPicked;
    return `<div class="reward-card-wrap ${picked ? 'picked' : ''}" data-pick-card="${i}">${preview}</div>`;
  }).join('');

  const potionBlock = r.potion ? `
    <section class="reward-section">
      <h3>🧪 药水 ${r.tier === 'elite' ? '（精英必掉）' : '（概率掉落）'}</h3>
      <button class="btn btn-potion reward-potion-btn" data-pick="potion">
        ${POTIONS[r.potion]?.icon || '⚗'} ${POTIONS[r.potion]?.name || '药水'}
      </button>
    </section>` : '';

  const relicBlock = (r.relicChoices || []).length ? `
    <section class="reward-section">
      <h3>✨ 遗物（${tierLabel}必掉 · 择一）</h3>
      <div class="reward-relic-row">${(r.relicChoices || []).map((rid, i) =>
        `<button class="btn btn-relic" data-pick="relic" data-relic-idx="${i}">${RELICS[rid]?.icon || '✦'} ${RELICS[rid]?.name}</button>`
      ).join('')}</div>
    </section>` : '';

  const bossRelicHint = game.pendingPostRewardBossRelic
    ? '<p class="reward-hint">点击继续将前往 Boss 遗物选择</p>' : '';

  app.innerHTML = `
    <div class="panel reward-panel">
      <h2>战利品</h2>
      <p class="gold-reward">+${r.gold} 金币 · ${tierLabel}</p>
      ${bossRelicHint}
      <section class="reward-section reward-section-cards">
        <h3>🃏 卡牌奖励 <span class="reward-optional">三选一 · 可跳过</span></h3>
        <div class="reward-cards">${cards}</div>
      </section>
      ${potionBlock}
      ${relicBlock}
      ${r.forge ? '<button class="btn btn-forge" data-pick="forge">🔨 锻造（升级随机卡牌）</button>' : ''}
      <button class="btn btn-primary" data-pick="skip">
        ${game.pendingPostRewardBossRelic ? '继续 → Boss 遗物' : '继续冒险'}
      </button>
    </div>
  `;
  app.querySelectorAll('[data-pick-card]').forEach(el => {
    el.onclick = () => {
      if (r.cardPicked) return;
      callbacks.onReward?.('card', +el.dataset.pickCard);
      render(game);
    };
  });
  app.querySelectorAll('[data-pick="relic"]').forEach(el => {
    el.addEventListener('click', () => {
      callbacks.onReward?.('relic', +(el.dataset.relicIdx || 0));
      render(game);
    });
  });
  app.querySelector('[data-pick="potion"]')?.addEventListener('click', () => {
    callbacks.onReward?.('potion', 0);
    render(game);
  });
  app.querySelector('[data-pick="forge"]')?.addEventListener('click', () => callbacks.onReward?.('forge', 0));
  app.querySelector('[data-pick="skip"]').onclick = () => callbacks.onReward?.('skip', 0);
}

function renderEnvTarotSelect(app) {
  const actName = ACTS[(game.act || 1) - 1]?.name || `第 ${game.act} 幕`;
  const choices = game.envTarotChoices || [];
  const cards = choices.map(id => {
    const t = ENV_TAROT[id];
    if (!t) return '';
    return `
      <button class="tarot-pick-card env-tarot-card" data-env-tarot="${id}">
        <div class="tarot-pick-icon">${t.icon}</div>
        <h3>${t.name}</h3>
        <p>${t.desc}</p>
      </button>`;
  }).join('');
  app.innerHTML = `
    <div class="panel tarot-panel">
      <h2>🌌 环境塔罗 · ${actName}</h2>
      <p class="tarot-hint">选择一张影响本层所有非 Boss 房间的大阿卡纳</p>
      <div class="tarot-pick-grid">${cards}</div>
    </div>`;
  app.querySelectorAll('[data-env-tarot]').forEach(el => {
    el.onclick = () => {
      playSfx('relic');
      callbacks.onSelectEnvTarot?.(el.dataset.envTarot);
    };
  });
}

function renderTarotSelect(app) {
  const choices = game.tarotChoices || [];
  const isBoss = game.pendingBoss;
  const picks = game.bossTarotPicks || [];
  const cards = choices.map(id => {
    const t = BATTLE_TAROT[id];
    if (!t) return '';
    const desc = isBoss ? `${t.desc}（Boss 战效果 ×75%）` : t.desc;
    const selected = picks.includes(id) ? ' selected' : '';
    return `
      <button class="tarot-pick-card${selected}" data-tarot="${id}">
        <div class="tarot-pick-icon">${t.icon}</div>
        <h3>${t.name}</h3>
        <p>${desc}</p>
      </button>`;
  }).join('');

  const bossHint = isBoss
    ? `Boss 战：选择 <strong>2</strong> 张大阿卡纳（已选 ${picks.length}/2，效果 ×75%）`
    : '选择一张大阿卡纳，本场战斗全程生效';

  app.innerHTML = `
    <div class="panel tarot-panel">
      <h2>🎴 战斗塔罗</h2>
      <p class="tarot-hint">${bossHint}</p>
      <div class="tarot-pick-grid">${cards}</div>
      ${isBoss && picks.length === 2 ? '<p class="tarot-confirm-hint">已选满 2 张，即将进入战斗…</p>' : ''}
    </div>`;

  app.querySelectorAll('[data-tarot]').forEach(el => {
    el.onclick = () => {
      playSfx('relic');
      callbacks.onSelectTarot?.(el.dataset.tarot);
    };
  });
}

function renderTarotLovers(app) {
  app.innerHTML = `
    <div class="panel tarot-panel">
      <h2>💕 恋人 · 抉择</h2>
      <p class="tarot-hint">选择本场战斗的加成方向</p>
      <div class="tarot-pick-grid lovers-grid">
        <button class="tarot-pick-card" data-lovers="attack">
          <div class="tarot-pick-icon">⚔</div>
          <h3>炽烈之刃</h3>
          <p>所有攻击牌伤害 +2</p>
        </button>
        <button class="tarot-pick-card" data-lovers="block">
          <div class="tarot-pick-icon">🛡</div>
          <h3>月光庇护</h3>
          <p>所有技能牌护盾 +3</p>
        </button>
      </div>
    </div>`;
  app.querySelectorAll('[data-lovers]').forEach(el => {
    el.onclick = () => callbacks.onSelectLovers?.(el.dataset.lovers);
  });
}

function renderCardMarkup(card, opts = {}) {
  const { playable, handIndex, dataAttr = '', size = 'hand', cost: costOverride, fanStyle = '' } = opts;
  const cost = costOverride ?? card.cost;
  const typeCls = card.type === 'status' || card.type === 'curse' ? 'card-curse' : `card-${card.type}`;
  const def = CARD_POOL[card.id];
  const attr = def ? getCardAttribute(card.id, def, game?.classId) : 'void';
  const attrInfo = RESONANCE_ATTR[attr];
  const attrBadge = attrInfo && size === 'hand'
    ? `<span class="card-attr-badge" style="--attr-color:${attrInfo.color}" title="${attrInfo.label}">${attrInfo.short}</span>`
    : '';
  const kw = def ? getCardKeywords(card.id, def).map(k =>
    `<span class="kw-tag" style="--kw-color:${k.color}">${k.label}</span>`
  ).join('') : '';
  const disabled = playable === false ? 'disabled' : '';
  const handAttr = handIndex != null ? `data-hand="${handIndex}"` : '';
  const styleAttr = fanStyle ? `style="${fanStyle}"` : '';
  const typeLabels = { attack: '攻击', skill: '技能', power: '能力', curse: '诅咒', status: '状态' };
  const typeLabel = size === 'hand' ? `<div class="card-type-label">${typeLabels[card.type] || card.type}</div>` : '';
  return `
    <div class="hand-card ${typeCls} ${card.upgraded ? 'upgraded' : ''} ${disabled}" ${handAttr} ${dataAttr} ${styleAttr}>
      ${attrBadge}
      ${getCardArtHtml(card, size)}
      <div class="card-cost">${cost >= 0 ? cost : '—'}</div>
      <div class="card-name">${card.name}${card.upgraded ? '+' : ''}</div>
      <div class="card-kw">${kw}</div>
      <div class="card-desc">${card.desc}</div>
      ${typeLabel}
      <div class="card-rarity rarity-${card.rarity || 'common'}">${card.rarity || ''}</div>
    </div>
  `;
}

function cardPreview(card, dataAttr = '') {
  const attr = dataAttr ? `data-pick="${dataAttr}"` : '';
  return renderCardMarkup(card, { dataAttr: attr, size: 'large' });
}

function renderRest(app) {
  const canHeal = !game.relics.includes('coffee_dripper');
  const canUpgrade = !game.relics.includes('fusion_hammer');
  const restCtx = game.envTarot?.restExtraRemove ? { extraRemoveOption: true } : {};
  const extraRemove = restCtx.extraRemoveOption || game.envTarot?.restExtraRemove;
  const healPct = game.envTarot?.restHealPercent ? Math.round(game.envTarot.restHealPercent * 100) : 30;
  app.innerHTML = `
    <div class="panel rest-panel">
      <h2>🔥 休息处</h2>
      <p class="rest-hint">只能选择一项</p>
      <div class="rest-options rest-grid">
        ${canHeal ? `<button class="rest-card" data-rest="heal"><span class="rest-icon">🛏️</span><strong>休息</strong><small>恢复 ${healPct}% 生命 (${Math.floor(game.maxHp * (healPct / 100))} HP)</small></button>` : ''}
        ${extraRemove ? `<button class="rest-card" data-rest="remove"><span class="rest-icon">📿</span><strong>净化</strong><small>移除一张卡牌（女祭司）</small></button>` : ''}
        ${canUpgrade ? `<button class="rest-card" data-rest="upgrade"><span class="rest-icon">🔨</span><strong>锻造</strong><small>升级一张卡牌</small></button>` : '<p class="disabled-hint">融合之锤：无法锻造</p>'}
        <button class="rest-card" data-rest="dig"><span class="rest-icon">⛏️</span><strong>挖掘</strong><small>风险与收益未知</small></button>
        <button class="rest-card" data-rest="meditate"><span class="rest-icon">🧘</span><strong>冥想</strong><small>最大生命 +2</small></button>
      </div>
      <div id="upgrade-list" class="deck-grid hidden"></div>
    </div>
  `;
  app.querySelector('[data-rest="heal"]')?.addEventListener('click', () => callbacks.onRestHeal?.());
  app.querySelector('[data-rest="remove"]')?.addEventListener('click', () => {
    const list = app.querySelector('#upgrade-list');
    list.classList.remove('hidden');
    list.innerHTML = game.deck.map((c, i) => `
      <div class="deck-card-mini card-${c.type}" data-idx="${i}">${c.name}</div>
    `).join('');
    list.querySelectorAll('.deck-card-mini').forEach(el => {
      el.onclick = () => callbacks.onRestRemove?.(+el.dataset.idx);
    });
  });
  app.querySelector('[data-rest="dig"]')?.addEventListener('click', () => callbacks.onRestDig?.());
  app.querySelector('[data-rest="meditate"]')?.addEventListener('click', () => callbacks.onRestMeditate?.());
  app.querySelector('[data-rest="upgrade"]')?.addEventListener('click', () => {
    const list = app.querySelector('#upgrade-list');
    list.classList.remove('hidden');
    list.innerHTML = game.deck.map((c, i) => `
      <div class="deck-card-mini card-${c.type}" data-idx="${i}">
        ${c.name}${c.upgraded ? '+' : ''} ${c.upgraded ? '(已升级)' : ''}
      </div>
    `).join('');
    list.querySelectorAll('.deck-card-mini').forEach(el => {
      if (!game.deck[+el.dataset.idx].upgraded) {
        el.onclick = () => callbacks.onRestUpgrade?.(+el.dataset.idx);
      }
    });
  });
}

function renderShop(app) {
  const s = game.shop;
  const mod = s.priceMod || 1;
  const cardPrice = Math.floor(50 * mod);
  app.innerHTML = `
    <div class="panel shop-panel">
      <h2>🛒 商店 — 商人</h2>
      <p class="gold">💰 ${game.gold}</p>
      <div class="shop-grid">
        <div class="shop-section">
          <h3>卡牌 (${cardPrice}G)</h3>
          ${s.cards.map((c, i) => c ? `<div class="shop-item ${i === s.saleIndex ? 'on-sale' : ''}" data-buy="card" data-i="${i}">${cardPreview(c)}${i === s.saleIndex ? '<span class="sale-tag">特价</span>' : ''}</div>` : '<div class="sold">已售</div>').join('')}
        </div>
        <div class="shop-section">
          <h3>遗物 (${Math.floor(150 * mod)}G)</h3>
          ${s.relic ? `<button class="shop-relic" data-buy="relic">${getRelicArt(s.relic.id, s.relic)}<strong>${s.relic.name}</strong><br><small>${s.relic.desc}</small></button>` : '<div class="sold">已售</div>'}
        </div>
        <div class="shop-section">
          <h3>药水 (${Math.floor(50 * mod)}G)</h3>
          ${(s.potions || []).map((p, i) => p ? `<button class="potion-shop" data-buy="potion" data-i="${i}">${POTIONS[p]?.icon} ${POTIONS[p]?.name}</button>` : '<div class="sold">已售</div>').join('')}
        </div>
        <button class="btn" data-buy="remove">移除卡牌 (${Math.floor(75 * mod)}G)</button>
        ${s.forgeAvailable ? `<button class="btn btn-forge" data-buy="forge">🔨 锻造 (${s.forgePrice || Math.floor(75 * mod)}G)</button>` : ''}
      </div>
      <button class="btn btn-primary" data-action="leave">离开商店</button>
    </div>
  `;
  app.querySelectorAll('[data-buy]').forEach(el => {
    el.onclick = () => callbacks.onShopBuy?.(el.dataset.buy, +(el.dataset.i || 0));
  });
  app.querySelector('[data-action="leave"]').onclick = () => callbacks.onLeaveShop?.();
}

function renderShopRemove(app) {
  app.innerHTML = `
    <div class="panel"><h2>选择要移除的卡牌</h2>
    <div class="deck-grid">${game.deck.map((c, i) => `
      <div class="deck-card-mini" data-i="${i}">${c.name}</div>
    `).join('')}</div></div>
  `;
  app.querySelectorAll('.deck-card-mini').forEach(el => {
    el.onclick = () => callbacks.onShopRemove?.(+el.dataset.i);
  });
}

function renderEvent(app) {
  const ev = game.event;
  app.innerHTML = `
    <div class="panel event-panel">
      <h2>${ev.name}</h2>
      <p class="event-desc">${ev.desc}</p>
      ${game.eventMessage ? `<p class="event-result">${game.eventMessage}</p>` : ''}
      <div class="event-choices">
        ${ev.choices.map((ch, i) => `<button class="btn btn-choice" data-i="${i}">${ch.text}</button>`).join('')}
      </div>
    </div>
  `;
  app.querySelectorAll('[data-i]').forEach(el => {
    el.onclick = () => callbacks.onEventChoice?.(+el.dataset.i);
  });
}

function renderEventRemove(app) {
  renderShopRemove(app);
  app.querySelectorAll('.deck-card-mini').forEach(el => {
    el.onclick = () => callbacks.onEventRemove?.(+el.dataset.i);
  });
}

function renderTreasure(app) {
  app.innerHTML = `
    <div class="panel treasure-panel">
      <h2>📦 宝箱</h2>
      <p>你发现了一个古老的宝箱……</p>
      <button class="btn btn-primary" data-action="open">打开</button>
    </div>
  `;
  app.querySelector('[data-action="open"]').onclick = () => callbacks.onTreasure?.();
}

function renderGameOver(app) {
  playSfx('defeat');
  const s = game.stats || {};
  const canRetryCombat = !!game.combatCheckpoint;
  const canRetryRoom = !!game.checkpoint;
  app.innerHTML = `
    <div class="panel end-panel defeat">
      <h2>💀 败北</h2>
      <p>第 ${game.act} 幕 · 第 ${game.floor} 层 · 进阶 ${game.ascension || 0}</p>
      <div class="run-stats">
        <div>战斗胜利 ${s.combatsWon || 0}</div>
        <div>精英击杀 ${s.elitesSlain || 0}</div>
        <div>金币获得 ${s.goldEarned || 0}</div>
        <div>卡组 ${game.deck?.length || 0} 张 · 遗物 ${game.relics?.length || 0} 件</div>
      </div>
      ${canRetryCombat ? '<button class="btn btn-primary" data-retry-combat">⏪ 重试本场战斗</button>' : ''}
      ${canRetryRoom ? '<button class="btn" data-retry-room">⏪ 回到进入房间前</button>' : ''}
      <button class="btn btn-primary" data-action="menu">返回主菜单</button>
    </div>
  `;
  app.querySelector('[data-retry-combat]')?.addEventListener('click', () => callbacks.onRetryCheckpoint?.('combat'));
  app.querySelector('[data-retry-room]')?.addEventListener('click', () => callbacks.onRetryCheckpoint?.('room'));
  app.querySelector('[data-action="menu"]').onclick = () => callbacks.onMenu?.();
}

function renderVictory(app) {
  playSfx('victory');
  const s = game.stats || {};
  const ach = (game.newAchievements || []).map(a => a.name).join('、');
  app.innerHTML = `
    <div class="panel end-panel victory">
      <div class="victory-hero">${getHeroArt(game.classId, 'portrait')}</div>
      <h2>${game.trueEnding ? '🌟 真结局 — 星渊重铸' : '🏆 星渊征服者！'}</h2>
      <p>${CLASSES[game.classId]?.name} · 进阶 ${game.ascension || 0} 通关</p>
      ${game.trueEnding ? '<p class="event-result">全部记忆归位，封印永久加固。</p>' : ''}
      ${ach ? `<p class="event-result">新成就：${ach}</p>` : ''}
      <div class="run-stats">
        <div>战斗 ${s.combatsWon || 0} · 精英 ${s.elitesSlain || 0}</div>
        <div>卡组 ${game.deck?.length || 0} 张 · 遗物 ${game.relics?.length || 0} 件</div>
        <div>共获得 ${s.goldEarned || 0} 金币</div>
      </div>
      <button class="btn btn-primary" data-action="menu">返回主菜单</button>
    </div>
  `;
  app.querySelector('[data-action="menu"]').onclick = () => callbacks.onMenu?.();
}

function showDeckModal(detailed = false) {
  const modal = document.getElementById('modal') || createModal();
  modal.classList.remove('hidden');
  const grouped = { attack: 0, skill: 0, power: 0, other: 0 };
  game.deck.forEach(c => { grouped[c.type] = (grouped[c.type] || 0) + 1; if (!grouped[c.type] && c.type) grouped.other++; });
  modal.innerHTML = `
    <div class="modal-box modal-wide">
      <h3>卡组 (${game.deck.length})</h3>
      ${detailed ? `<div class="deck-summary">⚔️ ${grouped.attack||0} 攻击 · 🛡 ${grouped.skill||0} 技能 · ✨ ${grouped.power||0} 能力</div>` : ''}
      <div class="deck-grid">${game.deck.map(c => `
        <div class="deck-card-mini card-${c.type}" title="${c.desc}">${c.name}${c.upgraded ? '+' : ''}</div>
      `).join('')}</div>
      <button class="btn" onclick="document.getElementById('modal').classList.add('hidden')">关闭</button>
    </div>
  `;
}

function showJournalModal() {
  const modal = document.getElementById('modal') || createModal();
  modal.classList.remove('hidden');
  modal.innerHTML = `
    <div class="modal-box">
      <h3>📜 完整冒险日志</h3>
      <div class="journal-full">${(game.journal || []).map(j =>
        `<div class="journal-line"><span class="j-floor">幕${j.act}-层${j.floor}</span> ${j.text}</div>`
      ).join('') || '<p>暂无记录</p>'}</div>
      <button class="btn" onclick="document.getElementById('modal').classList.add('hidden')">关闭</button>
    </div>
  `;
}

function showPileModal(pileType) {
  const p = game.combat?.player;
  if (!p) return;
  const piles = { draw: p.drawPile, discard: p.discard, exhaust: p.exhaust };
  const pile = piles[pileType] || [];
  const names = { draw: '抽牌堆', discard: '弃牌堆', exhaust: '消耗堆' };
  const modal = document.getElementById('modal') || createModal();
  modal.classList.remove('hidden');
  modal.innerHTML = `
    <div class="modal-box">
      <h3>${names[pileType]} (${pile.length})</h3>
      <div class="deck-grid">${pile.map(c => `<div class="deck-card-mini">${c.name}</div>`).join('') || '<p>空</p>'}</div>
      <button class="btn" id="close-pile">关闭</button>
    </div>
  `;
  modal.querySelector('#close-pile').onclick = () => { modal.classList.add('hidden'); callbacks.onClosePile?.(); };
}

function renderCodex(app) {
  const cards = Object.values(CARD_POOL).filter(c => c.rarity !== 'basic');
  app.innerHTML = `
    <div class="panel codex-panel">
      <h2>📖 卡牌图鉴</h2>
      <div class="codex-filters">
        <span>共 ${cards.length} 张</span>
      </div>
      <div class="codex-grid">${cards.map(c => {
        const kw = getCardKeywords(c.id, c).map(k => k.label).join(' ');
        return `<div class="codex-card card-${c.type} rarity-border-${c.rarity}">
          ${getCardArtHtml({ ...c, upgraded: false }, 'large')}
          <div class="card-cost">${c.cost >= 0 ? c.cost : '—'}</div>
          <div class="card-name">${c.name}</div>
          <div class="card-desc">${c.desc}</div>
          <div class="codex-meta">${c.class ? CLASSES[c.class]?.name || '' : '无色'} · ${c.rarity} ${kw}</div>
        </div>`;
      }).join('')}</div>
      <button class="btn btn-ghost" data-back>返回</button>
    </div>
  `;
  app.querySelector('[data-back]').onclick = () => callbacks.onMenu?.();
}

function renderAchievements(app) {
  const meta = getMeta();
  const unlocked = new Set(meta.achievements || []);
  app.innerHTML = `
    <div class="panel achievements-panel">
      <h2>🏅 成就</h2>
      <p>${unlocked.size} / ${Object.keys(ACHIEVEMENTS).length} 已解锁 · 记忆碎片 ${meta.fragments || 0}</p>
      <div class="ach-grid">${Object.values(ACHIEVEMENTS).map(a => `
        <div class="ach-card ${unlocked.has(a.id) ? 'unlocked' : 'locked'}">
          <span class="ach-icon">${unlocked.has(a.id) ? a.icon : '🔒'}</span>
          <strong>${a.name}</strong>
          <small>${a.desc}</small>
        </div>
      `).join('')}</div>
      <button class="btn btn-ghost" data-back>返回</button>
    </div>
  `;
  app.querySelector('[data-back]').onclick = () => callbacks.onMenu?.();
}

function renderPauseOverlay() {
  const app = document.getElementById('app');
  const audio = getAudioSettings();
  const hasCombatCp = !!game.combatCheckpoint;
  const hasRoomCp = !!game.checkpoint;
  app.innerHTML = `
    <div class="pause-overlay">
      <div class="pause-box">
        <h2>⏸ 暂停</h2>
        <div class="audio-settings">
          <label><input type="checkbox" id="mute-toggle" ${audio.muted ? 'checked' : ''}/> 静音</label>
          <label>音量 <input type="range" id="volume-slider" min="0" max="100" value="${Math.round(audio.volume * 100)}"/></label>
        </div>
        <button class="btn btn-primary" id="resume">继续游戏</button>
        <button class="btn" id="save-game">保存进度</button>
        ${hasCombatCp ? '<button class="btn" id="retry-combat">⏪ 回到战斗开始前</button>' : ''}
        ${hasRoomCp ? '<button class="btn" id="retry-room">⏪ 回到进入房间前</button>' : ''}
        <button class="btn" id="view-deck">查看卡组</button>
        <button class="btn" id="view-journal">冒险日志</button>
        <button class="btn btn-ghost" id="quit">返回主菜单</button>
      </div>
    </div>
  `;
  app.querySelector('#resume').onclick = () => { playSfx('click'); callbacks.onResume?.(); };
  app.querySelector('#save-game').onclick = () => { playSfx('click'); callbacks.onSave?.(); };
  app.querySelector('#retry-combat')?.addEventListener('click', () => { playSfx('click'); callbacks.onRetryCheckpoint?.('combat'); });
  app.querySelector('#retry-room')?.addEventListener('click', () => { playSfx('click'); callbacks.onRetryCheckpoint?.('room'); });
  app.querySelector('#view-deck').onclick = () => showDeckModal(true);
  app.querySelector('#view-journal').onclick = () => showJournalModal();
  app.querySelector('#quit').onclick = () => { playSfx('click'); callbacks.onMenu?.(); };
  app.querySelector('#mute-toggle').onchange = (e) => setMuted(e.target.checked);
  app.querySelector('#volume-slider').oninput = (e) => setVolume(+e.target.value / 100);
}

export function showAchievementPopups(g) {
  const list = g.newAchievements || [];
  if (!list.length) return;
  list.forEach((a, i) => {
    setTimeout(() => {
      const t = document.createElement('div');
      t.className = 'toast achievement-toast';
      t.innerHTML = `🏅 成就解锁：<strong>${a.name}</strong>`;
      document.body.appendChild(t);
      requestAnimationFrame(() => t.classList.add('show'));
      setTimeout(() => t.remove(), 3500);
    }, i * 400);
  });
  g.newAchievements = [];
}

function showRelicsModal() {
  const modal = document.getElementById('modal') || createModal();
  modal.classList.remove('hidden');
  modal.innerHTML = `
    <div class="modal-box">
      <h3>遗物</h3>
      ${game.relics.map(rid => {
        const r = RELICS[rid];
        return `<div class="relic-row">${getRelicArt(rid, r)} <strong>${r?.name}</strong> — ${r?.desc}</div>`;
      }).join('')}
      <button class="btn" onclick="document.getElementById('modal').classList.add('hidden')">关闭</button>
    </div>
  `;
}

function showHelp() {
  const modal = document.getElementById('modal') || createModal();
  modal.classList.remove('hidden');
  modal.innerHTML = `
    <div class="modal-box help-box">
      <h3>游戏说明</h3>
      <ul>
        <li><strong>4 名英雄</strong>：铁卫、影刺、奥法、血猎，各有 20+ 专属卡牌</li>
        <li><strong>80+ 卡牌</strong>：攻击/技能/能力/诅咒，可升级、可移除</li>
        <li><strong>45+ 遗物</strong>：被动效果叠加，Boss 战后三选一</li>
        <li><strong>18+ 随机事件</strong>：风险与收益并存的抉择</li>
        <li><strong>进阶 I–V</strong>：逐级提升难度，挑战最高进阶</li>
        <li>战斗：点击敌人选目标 → 点击手牌打出 → E 结束回合</li>
        <li>药水：战斗中点击底部药水图标使用</li>
      </ul>
      <button class="btn" onclick="document.getElementById('modal').classList.add('hidden')">知道了</button>
    </div>
  `;
}

function createModal() {
  const m = document.createElement('div');
  m.id = 'modal';
  m.className = 'modal hidden';
  document.body.appendChild(m);
  return m;
}

function animateCard(el) {
  cardPlayVfx(el);
}
