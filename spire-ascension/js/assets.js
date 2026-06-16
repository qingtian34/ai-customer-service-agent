/** Kenney CC0 素材路径与 UI 图标助手 — https://kenney.nl */

const ICON_BASE = 'assets/kenney/board-game-icons/Vector/Icons';
const PARTICLE_BASE = 'assets/kenney/particles/PNG';

export const ICONS = {
  sword: 'sword.svg',
  shield: 'shield.svg',
  block: 'tag_shield.svg',
  heart: 'suit_hearts.svg',
  skull: 'skull.svg',
  fire: 'fire.svg',
  campfire: 'campfire.svg',
  card: 'card.svg',
  cards_draw: 'cards_stack.svg',
  cards_discard: 'cards_return.svg',
  cards_exhaust: 'cards_skull.svg',
  cards_fan: 'cards_fan.svg',
  book: 'book_open.svg',
  shop: 'book_closed.svg',
  award: 'award.svg',
  treasure: 'award.svg',
  character: 'character.svg',
  hourglass: 'hourglass.svg',
  question: 'hexagon_question.svg',
  token: 'token.svg',
  gold: 'resource_iron.svg',
  buff: 'award.svg',
  debuff: 'skull.svg',
  heal: 'suit_hearts.svg',
  sleep: 'timer_0.svg',
  split: 'cards_flip.svg',
  map: 'cards_seek.svg',
  save: 'book_closed.svg',
  relic: 'award.svg',
  deck: 'cards_fan_outline.svg',
  floor: 'hourglass.svg',
  end_turn: 'arrow_right.svg',
};

export const MAP_NODE_ICONS = {
  combat: 'sword',
  elite: 'skull',
  rest: 'campfire',
  shop: 'shop',
  event: 'question',
  treasure: 'treasure',
  boss: 'skull',
};

export const INTENT_ICONS = {
  attack: 'sword',
  attack_multi: 'sword',
  defend: 'shield',
  buff: 'buff',
  debuff: 'debuff',
  heal: 'heal',
  sleep: 'sleep',
  split: 'split',
  special: 'fire',
  special_big: 'fire',
  special_time: 'hourglass',
  unknown: 'question',
};

export const PARTICLES = {
  slash: 'slash_01.png',
  slash2: 'slash_02.png',
  hit: 'spark_05.png',
  magic: 'magic_03.png',
  heal: 'star_05.png',
  smoke: 'smoke_05.png',
  fire: 'flame_03.png',
  scorch: 'scorch_01.png',
  spark: 'spark_03.png',
  star: 'star_04.png',
};

export function iconUrl(name) {
  const file = ICONS[name] || ICONS.token;
  return `${ICON_BASE}/${file}`;
}

export function particleUrl(name) {
  const file = PARTICLES[name] || PARTICLES.hit;
  return `${PARTICLE_BASE}/${file}`;
}

/** 返回 Kenney SVG 图标 img 标签 */
export function icon(name, className = 'game-icon', size = '') {
  const cls = [className, size].filter(Boolean).join(' ');
  return `<img src="${iconUrl(name)}" class="${cls}" alt="" draggable="false" loading="lazy"/>`;
}

/** 粒子精灵 img */
export function particleImg(name, className = 'particle-sprite') {
  return `<img src="${particleUrl(name)}" class="${className}" alt="" draggable="false"/>`;
}
