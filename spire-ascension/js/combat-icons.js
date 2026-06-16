/** 战斗 HUD / 意图 / 牌堆 — game-icons 矢量图标 */
import { renderGi, HERO_GI } from './game-icons.js';

const SIZES = { xs: 16, sm: 20, md: 28, lg: 36, xl: 44 };

export function cgi(name, size = 'md', color = '#ffffff', className = '') {
  const px = typeof size === 'number' ? size : (SIZES[size] || 24);
  return renderGi(name, {
    color,
    size: px,
    glow: true,
    className: `combat-gi combat-gi-${name} ${className}`.trim(),
  });
}

const INTENT_GI = {
  attack: 'broadsword',
  attack_multi: 'broadsword',
  defend: 'round_shield',
  buff: 'aura',
  debuff: 'skull',
  heal: 'hearts',
  sleep: 'ghost',
  split: 'crossed_swords',
  special: 'fireball',
  special_big: 'fireball',
  special_time: 'hourglass',
  unknown: 'magic_swirl',
};

const INTENT_COLOR = {
  attack: '#ff5858',
  attack_multi: '#ff5858',
  defend: '#58a8ff',
  buff: '#ffd058',
  debuff: '#b070d0',
  heal: '#58c878',
  sleep: '#8090b0',
  split: '#c0a050',
  special: '#ff9040',
  special_big: '#ff6040',
  special_time: '#a0a8d0',
  unknown: '#9090a8',
};

export function combatClassIcon(classId, accent) {
  const gi = HERO_GI[classId] || HERO_GI.iron_warrior;
  return cgi(gi, 'sm', accent || '#e0c890');
}

export function renderCombatIntent(intent) {
  if (!intent) {
    return `<div class="intent-bubble intent-unknown">${cgi('magic_swirl', 'lg', INTENT_COLOR.unknown)}</div>`;
  }
  const t = intent.type || 'unknown';
  const gi = INTENT_GI[t] || INTENT_GI.unknown;
  const color = INTENT_COLOR[t] || INTENT_COLOR.unknown;
  let value = '';
  if (t.includes('attack')) {
    value = t === 'attack_multi' ? (intent.display?.match(/[\d×]+/)?.[0] || '') : String(intent.value ?? '');
  } else if (t === 'defend') value = String(intent.value ?? '');
  return `<div class="intent-bubble intent-${t.split('_')[0]}" title="${intent.display || ''}">
    ${cgi(gi, 'lg', color)}
    ${value ? `<span class="intent-value">${value}</span>` : ''}
  </div>`;
}

export function renderCombatHpBar(hp, maxHp, block = 0) {
  const pct = Math.max(0, (hp / maxHp) * 100);
  return `
    <div class="sts-hp-wrap">
      ${block ? `<div class="sts-block-badge" title="格挡">${cgi('round_shield', 22, '#58a8ff')}${block}</div>` : ''}
      <div class="sts-hp-bar">
        <div class="sts-hp-fill" style="width:${pct}%"></div>
        <span class="sts-hp-text">${cgi('hearts', 'xs', '#ff5868')} ${Math.max(0, hp)} / ${maxHp}</span>
      </div>
    </div>
  `;
}

export function renderPotionIcon() {
  return cgi('potion', 26, '#c878ff');
}

export function renderDrawPileIcon() {
  return cgi('card_stack', 'md', '#e8dcc8');
}

export function renderDiscardPileIcon() {
  return cgi('card_discard', 'md', '#a8b0c8');
}

export function renderExhaustPileIcon() {
  return cgi('skull', 'md', '#9080a0');
}

export function renderEndTurnIcon() {
  return cgi('arrow_right', 20, '#ffffff', 'end-turn-gi');
}

export function renderHudGoldIcon() {
  return cgi('gold', 'sm', '#ffd060');
}

export function renderHudFloorIcon() {
  return cgi('hourglass', 'sm', '#a8b0c8');
}

export function renderHudDeckIcon() {
  return cgi('card_stack', 'md', '#c8d0e8');
}

export function renderHudRelicIcon() {
  return cgi('crown', 'md', '#ffd060');
}

export function renderHudSaveIcon() {
  return cgi('book', 'md', '#90a8c8');
}
