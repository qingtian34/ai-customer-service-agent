/**
 * game-icons.net 集成 — 参考 GitHub 开源 STS 克隆 Bunbun 的素材方案
 * https://github.com/BRousserie/Bunbun
 * https://github.com/game-icons/icons (CC-BY 3.0)
 *
 * 内置核心 SVG 路径（离线可用）；运行 scripts/download-github-assets.ps1 可下载完整库。
 */

const CDN = 'https://cdn.jsdelivr.net/gh/game-icons/icons@master';

/** 内置路径 — game-icons 风格剪影（512 视口） */
const BUILTIN = {
  broadsword: 'M380 48 L420 88 L180 328 L140 368 L108 336 L148 296 Z M148 296 L88 356 L56 324 L116 264 Z M116 264 L76 304 L44 272 L84 232 Z',
  round_shield: 'M256 48 C360 48 448 120 448 240 C448 360 360 464 256 480 C152 464 64 360 64 240 C64 120 152 48 256 48 Z M256 96 C180 96 112 160 112 240 C112 320 180 400 256 416 C332 400 400 320 400 240 C400 160 332 96 256 96 Z',
  fireball: 'M256 32 C320 80 368 128 368 208 C368 288 320 352 256 384 C192 352 144 288 144 208 C144 128 192 80 256 32 Z M256 128 C224 160 208 184 208 216 C208 248 224 280 256 296 C288 280 304 248 304 216 C304 184 288 160 256 128 Z',
  magic_swirl: 'M256 32 C176 96 176 176 256 240 C336 176 336 96 256 32 Z M256 272 C176 336 176 416 256 480 C336 416 336 336 256 272 Z M128 176 C192 176 240 224 240 288 C240 352 192 400 128 400 C64 400 16 352 16 288 C16 224 64 176 128 176 Z M384 176 C448 176 496 224 496 288 C496 352 448 400 384 400 C320 400 272 352 272 288 C272 224 320 176 384 176 Z',
  poison: 'M256 32 L288 96 L320 128 L320 192 C320 256 288 304 256 336 C224 304 192 256 192 192 L192 128 L224 96 Z M240 368 L240 448 L272 448 L272 368 Z M224 448 L288 448 L288 480 L224 480 Z',
  lightning: 'M288 32 L192 272 L256 272 L224 480 L384 208 L304 208 L352 32 Z',
  hearts: 'M256 448 C200 400 96 320 96 224 C96 160 144 112 208 112 C232 112 256 128 256 128 C256 128 280 112 304 112 C368 112 416 160 416 224 C416 320 312 400 256 448 Z',
  crossed_swords: 'M48 464 L128 384 L160 416 L80 496 Z M128 384 L208 304 L240 336 L160 416 Z M464 48 L384 128 L416 160 L496 80 Z M384 128 L304 208 L336 240 L416 160 Z M192 320 L320 192 L352 224 L224 352 Z',
  run: 'M128 448 L128 320 L192 256 L256 288 L320 224 L384 256 L448 192 L480 224 L400 304 L336 272 L272 336 L208 304 L160 352 L160 448 Z M320 128 C320 160 296 184 264 184 C232 184 208 160 208 128 C208 96 232 72 264 72 C296 72 320 96 320 128 Z',
  aura: 'M256 32 C176 64 128 128 128 208 C128 288 176 352 256 384 C336 352 384 288 384 208 C384 128 336 64 256 32 Z M256 96 C304 120 336 160 336 208 C336 256 304 296 256 320 C208 296 176 256 176 208 C176 160 208 120 256 96 Z',
  barbarian: 'M256 48 C304 48 344 88 344 136 C344 168 328 196 304 212 L304 240 L352 288 L352 352 L288 416 L224 416 L160 352 L160 288 L208 240 L208 212 C184 196 168 168 168 136 C168 88 208 48 256 48 Z M224 288 L224 352 L288 352 L288 288 Z',
  thief: 'M256 48 C296 48 328 80 328 120 C328 152 312 180 288 196 L320 256 L352 288 L320 416 L192 416 L160 288 L192 256 L224 196 C200 180 184 152 184 120 C184 80 216 48 256 48 Z M240 256 L240 352 L272 352 L272 256 Z',
  wizard: 'M256 32 L352 128 L320 416 L192 416 L160 128 Z M224 160 L224 224 L288 224 L288 160 Z M240 256 L240 352 L272 352 L272 256 Z M208 96 C208 112 220 128 256 128 C292 128 304 112 304 96 C304 80 280 64 256 64 C232 64 208 80 208 96 Z',
  vampire: 'M256 48 C304 48 344 88 344 136 L344 176 L384 256 L384 352 L320 416 L192 416 L128 352 L128 256 L168 176 L168 136 C168 88 208 48 256 48 Z M224 176 L224 224 L288 224 L288 176 Z M240 256 L272 320 L240 384 L208 320 Z',
  cultist: 'M256 32 C200 32 160 72 160 128 L160 192 L128 256 L128 416 L384 416 L384 256 L352 192 L352 128 C352 72 312 32 256 32 Z M208 128 C208 96 228 80 256 80 C284 80 304 96 304 128 L304 160 L208 160 Z M240 256 L240 352 L272 352 L272 256 Z',
  slime: 'M256 64 C352 64 416 128 416 224 C416 320 352 416 256 448 C160 416 96 320 96 224 C96 128 160 64 256 64 Z M208 192 C208 216 224 232 248 232 C272 232 288 216 288 192 C288 168 272 152 248 152 C224 152 208 168 208 192 Z M304 256 C304 272 316 284 332 284 C348 284 360 272 360 256 C360 240 348 228 332 228 C316 228 304 240 304 256 Z',
  goblin: 'M256 48 C296 48 328 80 328 120 C328 152 312 180 288 196 L320 256 L352 288 L320 416 L192 416 L160 288 L192 256 L224 196 C200 180 184 152 184 120 C184 80 216 48 256 48 Z M208 128 L208 160 L240 160 L240 128 Z M272 128 L272 160 L304 160 L304 128 Z',
  ghost: 'M256 32 C176 32 128 96 128 176 L128 416 L192 416 L192 352 L256 384 L320 352 L320 416 L384 416 L384 176 C384 96 336 32 256 32 Z M208 128 C208 152 228 168 256 168 C284 168 304 152 304 128 C304 104 284 88 256 88 C228 88 208 104 208 128 Z',
  crown: 'M128 320 L128 416 L384 416 L384 320 L352 256 L304 288 L256 224 L208 288 L160 256 Z M160 192 L192 256 L256 192 L320 256 L352 192 L384 256 L416 192 L384 128 L256 160 L128 128 L96 192 Z',
  skull: 'M256 48 C176 48 128 112 128 192 C128 256 160 304 208 320 L208 384 L192 416 L320 416 L304 384 L304 320 C352 304 384 256 384 192 C384 112 336 48 256 48 Z M208 192 C208 216 224 232 248 232 C272 232 288 216 288 192 C288 168 272 152 248 152 C224 152 208 168 208 192 Z M304 192 C304 216 320 232 344 232 C368 232 384 216 384 192 C384 168 368 152 344 152 C320 152 304 168 304 192 Z',
  worm: 'M96 256 C96 176 160 112 256 112 C352 112 416 176 416 256 C416 336 352 400 256 400 C160 400 96 336 96 256 Z M176 256 C176 288 200 312 232 312 L280 312 C312 312 336 288 336 256 C336 224 312 200 280 200 L232 200 C200 200 176 224 176 256 Z',
  spider: 'M256 160 C320 160 368 208 368 272 C368 336 320 384 256 384 C192 384 144 336 144 272 C144 208 192 160 256 160 Z M128 128 L192 192 M384 128 L320 192 M96 256 L176 256 M416 256 L336 256 M128 384 L192 320 M384 384 L320 320',
  book: 'M128 96 L128 416 L256 384 L384 416 L384 96 L256 128 Z M192 160 L192 352 M320 160 L320 352',
  potion: 'M224 96 L224 160 L192 224 L192 384 C192 416 220 448 256 448 C292 448 320 416 320 384 L320 224 L288 160 L288 96 Z M240 96 L240 64 L272 64 L272 96 Z',
  gold: 'M160 352 L160 416 L352 416 L352 352 L320 288 L256 256 L192 288 Z M192 224 L256 192 L320 224 L352 160 L256 96 L160 160 Z',
  card_stack: 'M144 112 L144 368 L368 368 L368 112 L256 80 Z M160 128 L160 352 L352 352 L352 128 L256 104 Z M176 144 L176 336 L336 336 L336 144 L256 128 Z',
  card_discard: 'M128 160 L128 352 L320 352 L320 160 L224 96 Z M144 176 L144 336 L304 336 L304 176 L224 128 Z M352 256 L416 256 L416 288 L480 256 L416 224 L416 256 Z',
  arrow_right: 'M96 224 L96 288 L320 288 L320 352 L448 256 L320 160 L320 224 Z',
  hourglass: 'M192 96 L320 96 L256 208 L320 320 L192 320 L256 208 Z M224 128 L224 176 L288 176 L288 128 Z M224 240 L224 288 L288 288 L288 240 Z',
};

/** 远程完整库映射（download-github-assets.ps1 下载后优先使用本地文件） */
export const GI_FILES = {
  broadsword: { author: 'lorc', file: 'broadsword.svg' },
  round_shield: { author: 'lorc', file: 'round-shield.svg' },
  fireball: { author: 'lorc', file: 'fireball.svg' },
  magic_swirl: { author: 'lorc', file: 'magic-swirl.svg' },
  poison: { author: 'lorc', file: 'poison.svg' },
  lightning: { author: 'lorc', file: 'lightning-helix.svg' },
  hearts: { author: 'lorc', file: 'hearts.svg' },
  crossed_swords: { author: 'lorc', file: 'crossed-swords.svg' },
  run: { author: 'lorc', file: 'run.svg' },
  aura: { author: 'lorc', file: 'aura.svg' },
  barbarian: { author: 'delapouite', file: 'barbarian.svg' },
  thief: { author: 'delapouite', file: 'thief.svg' },
  wizard: { author: 'delapouite', file: 'wizard-face.svg' },
  vampire: { author: 'delapouite', file: 'vampire-dracula.svg' },
  cultist: { author: 'delapouite', file: 'cultist.svg' },
  slime: { author: 'delapouite', file: 'slime.svg' },
  goblin: { author: 'delapouite', file: 'goblin.svg' },
  ghost: { author: 'delapouite', file: 'ghost.svg' },
  crown: { author: 'delapouite', file: 'crown.svg' },
  skull: { author: 'lorc', file: 'death-skull.svg' },
  worm: { author: 'delapouite', file: 'worm.svg' },
  spider: { author: 'delapouite', file: 'spider-face.svg' },
  book: { author: 'delapouite', file: 'book-cover.svg' },
  potion: { author: 'delapouite', file: 'potion-ball.svg' },
  gold: { author: 'delapouite', file: 'gold-bar.svg' },
};

export const CARD_GI = {
  slash: 'broadsword',
  shield: 'round_shield',
  poison: 'poison',
  arcane: 'fireball',
  aura: 'aura',
  blood: 'hearts',
  motion: 'run',
  generic: 'crossed_swords',
};

export const HERO_GI = {
  iron_warrior: 'barbarian',
  shadow_rogue: 'thief',
  arcane_mage: 'wizard',
  blood_hunter: 'vampire',
};

export const ENEMY_GI = {
  // 旧 STS 敌人
  cultist: 'cultist', jaw_worm: 'worm', louse: 'worm', slime_s: 'slime', slime_m: 'slime',
  gremlin: 'goblin', fungi: 'goblin', spiker: 'skull', bandit: 'thief', centurion: 'barbarian',
  shelled: 'worm', orb_walker: 'magic_swirl', chosen: 'cultist', mystic: 'wizard',
  darkling: 'ghost', spire_shield: 'round_shield', spire_spear: 'broadsword', repulsor: 'magic_swirl',
  nob: 'barbarian', lagavulin: 'ghost', sentry: 'round_shield', gremlin_nob: 'goblin',
  book_of_stabbing: 'book', giant_head: 'skull', slime_boss: 'crown', hexaghost: 'ghost', time_eater: 'ghost',
  // GDD 第一幕
  sun_acolyte: 'cultist', light_sentinel: 'round_shield', hot_slime: 'slime', sun_construct: 'magic_swirl',
  moon_peeper: 'ghost', eclipse_knight: 'barbarian', star_collector: 'wizard', star_dust_minion: 'slime',
  sun_monarch: 'crown', sun_acolyte_minion: 'cultist',
  // GDD 第二幕
  moon_wolf: 'worm', shadow_mage: 'wizard', void_lurker: 'spider', crescent_priest: 'cultist',
  star_construct: 'magic_swirl', twin_moon_striker: 'thief', twin_moon_supporter: 'ghost',
  void_amalgam: 'ghost', eclipse_witch: 'ghost', eclipse_phantom: 'ghost',
  // GDD 第三幕
  star_colossus: 'barbarian', void_mutant: 'ghost', star_oracle: 'wizard', sun_remnant: 'fireball',
  hybrid_mutant: 'spider', triple_trial_sun: 'fireball', triple_trial_moon: 'ghost',
  triple_trial_star: 'magic_swirl', corruption_lord: 'skull', abyss_core: 'magic_swirl',
};

const urlCache = new Map();

export function giFileUrl(name) {
  if (urlCache.has(name)) return urlCache.get(name);
  const meta = GI_FILES[name];
  if (!meta) return null;
  const local = `assets/game-icons/${meta.author}/${meta.file}`;
  urlCache.set(name, local);
  return local;
}

export function giCdnUrl(name) {
  const meta = GI_FILES[name];
  if (!meta) return null;
  return `${CDN}/${meta.author}/${meta.file}`;
}

/** 渲染 game-icon — 内置剪影优先；下载的 SVG 用 mask 着色（避免背景矩形变白块） */
export function renderGi(name, opts = {}) {
  const {
    color = '#ffffff',
    size = 64,
    className = '',
    glow = true,
  } = opts;

  const glowStyle = glow
    ? `filter:drop-shadow(0 0 ${Math.round(size * 0.18)}px ${color}) drop-shadow(0 2px 6px rgba(0,0,0,0.65));`
    : 'filter:drop-shadow(0 2px 4px rgba(0,0,0,0.6));';

  const path = BUILTIN[name];
  if (path) {
    return `<svg class="gi-icon gi-${name} ${className}" viewBox="0 0 512 512" width="${size}" height="${size}" style="color:${color};${glowStyle}" aria-hidden="true"><path fill="currentColor" d="${path}"/></svg>`;
  }

  const src = urlCache.get(name) || giFileUrl(name) || giCdnUrl(name);
  if (src && GI_FILES[name]) {
    const safeSrc = src.replace(/'/g, '%27');
    return `<span class="gi-icon gi-mask gi-${name} ${className}" role="img" aria-hidden="true" style="width:${size}px;height:${size}px;background:${color};-webkit-mask:url('${safeSrc}') center/contain no-repeat;mask:url('${safeSrc}') center/contain no-repeat;${glowStyle}"></span>`;
  }

  return `<svg class="gi-icon gi-fallback ${className}" viewBox="0 0 512 512" width="${size}" height="${size}" style="color:${color};${glowStyle}" aria-hidden="true"><circle cx="256" cy="256" r="200" fill="currentColor" opacity="0.35"/></svg>`;
}

/** 预加载：本地 SVG → CDN → 内置 */
export async function preloadGiIcons(names) {
  const unique = [...new Set(names)];
  await Promise.all(unique.map(async (name) => {
    const local = giFileUrl(name);
    const cdn = giCdnUrl(name);
    for (const url of [local, cdn].filter(Boolean)) {
      try {
        const ok = await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = url;
        });
        if (ok) { urlCache.set(name, url); return; }
      } catch { /* next */ }
    }
  }));
}

export function getGiPreloadList() {
  return [
    ...Object.values(CARD_GI),
    ...Object.values(HERO_GI),
    ...Object.values(ENEMY_GI),
    'gold', 'potion', 'skull', 'book', 'crown', 'ghost', 'hourglass',
    'card_stack', 'card_discard', 'arrow_right', 'hearts', 'round_shield',
    'broadsword', 'aura', 'fireball', 'magic_swirl', 'crossed_swords',
  ];
}
