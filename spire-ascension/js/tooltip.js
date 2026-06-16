/** 卡牌 / 意图悬浮提示 */

let el = null;

export function initTooltip() {
  el = document.getElementById('tooltip');
  if (!el) {
    el = document.createElement('div');
    el.id = 'tooltip';
    el.className = 'tooltip hidden';
    document.body.appendChild(el);
  }
}

export function showCardTooltip(card, def, x, y) {
  if (!el) initTooltip();
  const kw = def?.keywords?.join?.(' ') || '';
  el.innerHTML = `
    <div class="tooltip-card card-${card.type}">
      <div class="tooltip-title">${card.name}${card.upgraded ? '+' : ''}</div>
      <div class="tooltip-meta">费用 ${card.cost >= 0 ? card.cost : '—'} · ${card.type} · ${card.rarity || ''}</div>
      <div class="tooltip-desc">${card.desc}</div>
      ${kw ? `<div class="tooltip-kw">${kw}</div>` : ''}
    </div>
  `;
  positionTooltip(x, y);
  el.classList.remove('hidden');
}

export function showTextTooltip(html, x, y) {
  if (!el) initTooltip();
  el.innerHTML = `<div class="tooltip-text">${html}</div>`;
  positionTooltip(x, y);
  el.classList.remove('hidden');
}

export function hideTooltip() {
  el?.classList.add('hidden');
}

function positionTooltip(x, y) {
  const pad = 16;
  const rect = el.getBoundingClientRect();
  let left = x + pad;
  let top = y - rect.height - pad;
  if (top < 8) top = y + pad;
  if (left + 280 > window.innerWidth) left = x - 280 - pad;
  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
}

export function bindCardTooltips(container, getCardDef) {
  if (!container) return;
  container.querySelectorAll('.hand-card').forEach(cardEl => {
    const idx = cardEl.dataset.hand;
    if (idx == null) return;
    cardEl.addEventListener('mouseenter', (e) => {
      const hand = window.__gameCombatHand;
      if (!hand?.[+idx]) return;
      const c = hand[+idx];
      showCardTooltip(c, getCardDef?.(c) || {}, e.clientX, e.clientY);
    });
    cardEl.addEventListener('mousemove', (e) => {
      if (!el?.classList.contains('hidden')) positionTooltip(e.clientX, e.clientY);
    });
    cardEl.addEventListener('mouseleave', hideTooltip);
  });
}
