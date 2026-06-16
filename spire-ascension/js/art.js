/** 美术 — game-icons.net 主插画 + 程序化背景（参考 GitHub Bunbun 方案） */
import { renderGi, CARD_GI, HERO_GI, ENEMY_GI } from './game-icons.js';

const TYPE_PALETTE = {
  attack: { bg: ['#2a1218', '#1a080c'], accent: '#e06050', glow: '#ff8060' },
  skill: { bg: ['#121a28', '#081018'], accent: '#5090e0', glow: '#70b0ff' },
  power: { bg: ['#1a1228', '#100818'], accent: '#9060e0', glow: '#b080ff' },
  curse: { bg: ['#181018', '#0c080c'], accent: '#606060', glow: '#404040' },
  status: { bg: ['#181018', '#0c080c'], accent: '#806040', glow: '#604030' },
};

const CLASS_PALETTE = {
  iron_warrior: '#c45c3e',
  shadow_rogue: '#4a9e6e',
  arcane_mage: '#5b7fd4',
  blood_hunter: '#8b3040',
  neutral: '#a89060',
};

const CARD_MOTIFS = [
  { test: /strike|slash|blade|cleave|bludgeon|pummel|bash|uppercut|heavy|finisher|backstab|shiv|wild|feed|reaper|meteor|beam|ftl|zap|ball|cold|seeing|grand|storm/i, draw: 'slash' },
  { test: /defend|block|barrier|shrug|iron_wave|survivor|dodge|blur|impervious|flame_barrier|reinforced|stack|charge|second/i, draw: 'shield' },
  { test: /poison|deadly|catalyst|shiv/i, draw: 'poison' },
  { test: /zap|lightning|electro|ball|beam|ftl|meteor|storm|compile|dualcast|focus|cold|echo|creative|all_for/i, draw: 'arcane' },
  { test: /inflame|corruption|demon|barricade|footwork|after_image|wraith|well_laid|electrodynamics|power/i, draw: 'aura' },
  { test: /blood|offering|combust|brutality|feel_no|wild|reaper|feed/i, draw: 'blood' },
  { test: /draw|discovery|madness|jack|trip|flash|adrenaline|leg_sweep|dash/i, draw: 'motion' },
];

const MOTIF_ICON = CARD_GI;

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function getCardMotif(id) {
  for (const m of CARD_MOTIFS) if (m.test.test(id)) return m.draw;
  return 'generic';
}

function svgWrap(viewBox, inner, cls = '') {
  return `<svg class="art-svg ${cls}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;
}

/** 卡牌背景氛围光（主图标由 Kenney 矢量叠加） */
function cardAmbientDraw(accent, glow, uid, h) {
  const x1 = 40 + (h % 80);
  const y1 = 25 + ((h >> 3) % 40);
  const x2 = 120 + ((h >> 5) % 60);
  const y2 = 70 + ((h >> 7) % 30);
  return `
    <circle cx="${x1}" cy="${y1}" r="28" fill="${accent}" opacity="0.12"/>
    <circle cx="${x2}" cy="${y2}" r="18" fill="${glow}" opacity="0.08"/>
    <path d="M0 90 Q100 70 200 95" stroke="${accent}" stroke-width="1" fill="none" opacity="0.15"/>
    <rect x="8" y="8" width="184" height="104" rx="6" fill="none" stroke="${accent}" stroke-width="1" opacity="0.2"/>
  `;
}

export function getCardArt(card) {
  const type = card.type === 'status' || card.type === 'curse' ? 'curse' : card.type;
  const pal = TYPE_PALETTE[type] || TYPE_PALETTE.attack;
  const cls = card.class || 'neutral';
  const accent = CLASS_PALETTE[cls] || pal.accent;
  const h = hashStr(card.id + (card.upgraded ? 'u' : ''));
  const uid = `c${h}`;
  const inner = `
    <defs>
      <linearGradient id="cardBg${uid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${pal.bg[0]}"/>
        <stop offset="100%" stop-color="${pal.bg[1]}"/>
      </linearGradient>
      <radialGradient id="cardGlow${uid}" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="${accent}" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="200" height="120" fill="url(#cardBg${uid})"/>
    <rect width="200" height="120" fill="url(#cardGlow${uid})"/>
    ${cardAmbientDraw(accent, pal.glow, uid, h)}
  `;
  return svgWrap('0 0 200 120', inner, `card-art-svg card-art-${type}`);
}

export function getCardArtHtml(card, size = 'hand') {
  const type = card.type === 'status' || card.type === 'curse' ? 'curse' : card.type;
  const pal = TYPE_PALETTE[type] || TYPE_PALETTE.attack;
  const accent = CLASS_PALETTE[card.class] || pal.accent;
  const motif = getCardMotif(card.id);
  const giName = MOTIF_ICON[motif] || MOTIF_ICON.generic;
  const iconSize = size === 'large' ? 88 : 72;
  return `<div class="card-art card-art-${size} card-art-type-${type}" style="--card-accent:${accent};--card-glow:${pal.glow}">
    ${getCardArt(card)}
    <div class="card-motif-wrap card-motif-${motif}">${renderGi(giName, { color: accent, size: iconSize, glow: true, className: 'card-motif-icon' })}</div>
    <div class="card-art-shine"></div>
  </div>`;
}

const HERO_BG = {
  iron_warrior: ['#2a1810', '#c45c3e'],
  shadow_rogue: ['#0a1810', '#4a9e6e'],
  arcane_mage: ['#101828', '#5b7fd4'],
  blood_hunter: ['#201018', '#8b3040'],
};

export function getHeroArt(classId, size = 'portrait') {
  const gi = HERO_GI[classId] || HERO_GI.iron_warrior;
  const [bg, accent] = HERO_BG[classId] || HERO_BG.iron_warrior;
  const iconSize = size === 'large' ? 140 : size === 'portrait' ? 112 : 96;
  return `<div class="hero-art hero-art-${size} anim-idle" style="--hero-accent:${accent};--hero-bg:${bg}">
    <div class="hero-art-bg"></div>
    <div class="hero-art-icon">${renderGi(gi, { color: accent, size: iconSize, glow: true })}</div>
    <div class="hero-art-floor"></div>
  </div>`;
}

/** 战斗场景用 — 无卡牌边框，更大剪影 */
export function getCombatHeroArt(classId) {
  const gi = HERO_GI[classId] || HERO_GI.iron_warrior;
  const [bg, accent] = HERO_BG[classId] || HERO_BG.iron_warrior;
  return `<div class="combat-hero-sprite anim-idle" style="--hero-accent:${accent};--hero-bg:${bg}">
    <div class="combat-hero-glow"></div>
    ${renderGi(gi, { color: accent, size: 128, glow: true, className: 'combat-hero-icon' })}
    <div class="combat-hero-shadow"></div>
  </div>`;
}

const ENEMY_TINT = {
  cultist: '#c060ff', slime_s: '#40c070', slime_m: '#30a050', gremlin: '#80a050',
  jaw_worm: '#80a040', ghost: '#8090ff', crown: '#ffd040', skull: '#c0a0a0',
};

export function getEnemyArt(enemyId, opts = {}) {
  const { elite, boss, index = 0 } = opts;
  const gi = ENEMY_GI[enemyId] || 'skull';
  const tint = ENEMY_TINT[enemyId] || (boss ? '#ff6060' : elite ? '#d4a84b' : '#a0a8c0');
  const frame = boss ? 'enemy-frame-boss' : elite ? 'enemy-frame-elite' : 'enemy-frame-normal';
  const size = boss ? 96 : elite ? 88 : 80;
  return `<div class="enemy-art ${frame} anim-enemy-idle" data-enemy="${enemyId}" style="--enemy-tint:${tint}">
    <div class="enemy-art-bg"></div>
    <div class="enemy-art-icon">${renderGi(gi, { color: tint, size, glow: true })}</div>
  </div>`;
}

export function getRelicArt(relicId, relic) {
  const h = hashStr(relicId);
  const colors = ['#d4a84b', '#4a7fd4', '#4a9e6e', '#c44b4b', '#9060c0'];
  const c = colors[h % colors.length];
  const icons = ['gold', 'crown', 'aura', 'fireball', 'hearts'];
  const gi = icons[h % icons.length];
  return `<div class="relic-art" title="${relic?.name || ''}" style="--relic-color:${c}">
    <div class="relic-art-bg"></div>
    ${renderGi(gi, { color: c, size: 40, glow: true })}
  </div>`;
}

export function getCombatBackground(act) {
  const bgs = {
    1: 'radial-gradient(ellipse at 50% 20%, rgba(80,50,100,0.35), transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(40,60,40,0.2), transparent 40%), linear-gradient(180deg, #14101a 0%, #0a0810 60%, #060810 100%)',
    2: 'radial-gradient(ellipse at 30% 30%, rgba(60,80,120,0.3), transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(80,60,40,0.25), transparent 45%), linear-gradient(180deg, #101520 0%, #0a0c14 60%, #060810 100%)',
    3: 'radial-gradient(ellipse at 50% 40%, rgba(100,60,160,0.35), transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(40,40,80,0.3), transparent 40%), linear-gradient(180deg, #0f1020 0%, #080810 60%, #040408 100%)',
  };
  return bgs[act] || bgs[1];
}

export function getMapNodeArt(type) {
  const colors = { combat: '#c44b4b', elite: '#9060c0', rest: '#d4a84b', shop: '#4a7fd4', event: '#4a9e6e', treasure: '#d4a84b', boss: '#ff4040' };
  const c = colors[type] || '#8090a0';
  return `<div class="map-node-art" style="--node-color:${c}"><span class="map-node-glow"></span></div>`;
}
