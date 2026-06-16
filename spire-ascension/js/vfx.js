/** 战斗视觉特效 — Kenney 粒子 + 飘字 + 音效 */

import { particleUrl } from './assets.js';
import { playSfx } from './audio.js';

let layer = null;

export function initVfx() {
  if (typeof document === 'undefined') return;
  layer = document.getElementById('vfx-layer');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'vfx-layer';
    document.body.appendChild(layer);
  }
}

function centerOf(el) {
  if (!el) return { x: window.innerWidth / 2, y: window.innerHeight / 3 };
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

export function spawnFloat(targetIndex, text, type = 'damage') {
  if (!layer) initVfx();
  const el = targetIndex >= 0
    ? document.querySelector(`.enemy-panel[data-target="${targetIndex}"] .enemy-art`)
    : document.querySelector('.player-combat-unit .player-sprite, .player-combat-unit');
  const { x, y } = centerOf(el);
  const node = document.createElement('div');
  node.className = `vfx-float vfx-${type}`;
  node.textContent = text;
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
  layer.appendChild(node);
  requestAnimationFrame(() => node.classList.add('active'));
  setTimeout(() => node.remove(), 1100);
}

export function shakeEnemy(targetIndex) {
  const panel = document.querySelector(`.enemy-panel[data-target="${targetIndex}"]`);
  if (!panel) return;
  panel.classList.remove('anim-hit');
  void panel.offsetWidth;
  panel.classList.add('anim-hit');
  setTimeout(() => panel.classList.remove('anim-hit'), 450);
}

export function shakePlayer() {
  const el = document.querySelector('.player-combat-unit');
  if (!el) return;
  el.classList.remove('anim-hit');
  void el.offsetWidth;
  el.classList.add('anim-hit');
  setTimeout(() => el.classList.remove('anim-hit'), 450);
}

export function playSlash(targetIndex) {
  if (!layer) initVfx();
  const el = document.querySelector(`.enemy-panel[data-target="${targetIndex}"] .enemy-art`);
  const { x, y } = centerOf(el);
  const slash = document.createElement('img');
  slash.src = particleUrl('slash');
  slash.className = 'vfx-slash-sprite';
  slash.style.left = `${x}px`;
  slash.style.top = `${y}px`;
  layer.appendChild(slash);
  requestAnimationFrame(() => slash.classList.add('active'));
  setTimeout(() => slash.remove(), 450);
  spawnParticles(x, y, ['hit', 'spark'], 2);
}

function spawnParticles(x, y, names, count = 3) {
  if (!layer) initVfx();
  const burst = document.createElement('div');
  burst.className = 'particle-burst';
  burst.style.left = `${x}px`;
  burst.style.top = `${y}px`;
  for (let i = 0; i < count; i++) {
    const img = document.createElement('img');
    img.src = particleUrl(names[i % names.length]);
    img.style.left = `${(i - 1) * 20}px`;
    img.style.top = `${(i % 2) * -15}px`;
    burst.appendChild(img);
  }
  layer.appendChild(burst);
  setTimeout(() => burst.remove(), 600);
}

export function playBlockFlash() {
  if (!layer) initVfx();
  const el = document.querySelector('.player-combat-unit .player-sprite, .player-combat-unit');
  const { x, y } = centerOf(el);
  const shield = document.createElement('div');
  shield.className = 'vfx-shield';
  shield.style.left = `${x}px`;
  shield.style.top = `${y}px`;
  layer.appendChild(shield);
  requestAnimationFrame(() => shield.classList.add('active'));
  const ring = document.createElement('img');
  ring.src = particleUrl('magic');
  ring.className = 'vfx-heal-sprite';
  ring.style.left = `${x}px`;
  ring.style.top = `${y}px`;
  layer.appendChild(ring);
  requestAnimationFrame(() => ring.classList.add('active'));
  setTimeout(() => { shield.remove(); ring.remove(); }, 600);
}

export function playHealPulse() {
  if (!layer) initVfx();
  const el = document.querySelector('.player-combat-unit .player-sprite, .player-combat-unit');
  const { x, y } = centerOf(el);
  const heal = document.createElement('img');
  heal.src = particleUrl('heal');
  heal.className = 'vfx-heal-sprite';
  heal.style.left = `${x}px`;
  heal.style.top = `${y}px`;
  layer.appendChild(heal);
  requestAnimationFrame(() => heal.classList.add('active'));
  spawnParticles(x, y, ['star', 'heal'], 3);
  setTimeout(() => heal.remove(), 700);
}

export function screenFlash(type = 'damage') {
  if (!layer) initVfx();
  const flash = document.createElement('div');
  flash.className = `vfx-screen-flash vfx-flash-${type}`;
  layer.appendChild(flash);
  requestAnimationFrame(() => flash.classList.add('active'));
  setTimeout(() => flash.remove(), 400);
}

export function processVfxQueue(queue = []) {
  if (!queue.length) return;
  for (const ev of queue) {
    switch (ev.type) {
      case 'damage':
        spawnFloat(ev.target, ev.text, ev.target >= 0 ? 'damage' : 'damage');
        playSfx('attack');
        if (ev.target >= 0) { shakeEnemy(ev.target); playSlash(ev.target); }
        else { shakePlayer(); screenFlash('damage'); }
        break;
      case 'block':
        spawnFloat(-1, ev.text, 'block');
        playSfx('block');
        playBlockFlash();
        break;
      case 'heal':
        spawnFloat(-1, ev.text, 'heal');
        playSfx('heal');
        playHealPulse();
        break;
      case 'poison':
        spawnFloat(ev.target, ev.text, 'poison');
        playSfx('poison');
        shakeEnemy(ev.target);
        {
          const el = document.querySelector(`.enemy-panel[data-target="${ev.target}"] .enemy-art`);
          const c = centerOf(el);
          spawnParticles(c.x, c.y, ['smoke', 'scorch'], 2);
        }
        break;
      case 'buff':
        spawnFloat(ev.target ?? -1, ev.text, 'buff');
        break;
      default:
        spawnFloat(ev.target ?? -1, ev.text, ev.type || 'damage');
    }
  }
}

export function cardPlayVfx(cardEl) {
  if (!cardEl) return;
  cardEl.classList.add('card-played');
  const rect = cardEl.getBoundingClientRect();
  spawnParticles(rect.left + rect.width / 2, rect.top, ['magic', 'spark'], 2);
  setTimeout(() => cardEl.classList.remove('card-played'), 400);
}
