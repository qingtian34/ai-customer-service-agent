/** 地图生成与遭遇 — 杀戮尖塔式自下而上星轨 */
import { ENCOUNTER_TABLES, BOSS_BY_ACT } from './data.js';

export const NODE_TYPES = {
  M: { type: 'combat', icon: '⚔', label: '敌人' },
  E: { type: 'elite', icon: '👹', label: '精英' },
  R: { type: 'rest', icon: '🔥', label: '休息' },
  S: { type: 'shop', icon: '🛒', label: '商店' },
  '?': { type: 'event', icon: '❓', label: '未知' },
  B: { type: 'boss', icon: '💀', label: 'Boss' },
};

/** 每层节点数量（对称） */
const ROW_COUNTS = [3, 4, 4, 5, 4, 5, 4, 5, 4, 5, 4, 5, 4, 4, 3, 3, 1];

export function generateMap(act = 1, ascension = 0, opts = {}) {
  const linear = ascension >= 13 || opts.linearMap;
  const rows = linear ? 12 : ROW_COUNTS.length;
  const nodes = [];
  const connections = [];

  for (let r = 0; r < rows; r++) {
    const rowNodes = [];
    let count = linear
      ? (r === 0 ? 1 : r === rows - 1 ? 1 : randInt(1, 2))
      : (ROW_COUNTS[r] ?? randInt(3, 4));
    if (r === 0 && !linear) count = 3;
    if (r === rows - 1) count = 1;

    const positions = layoutSymmetricRow(count);
    for (let c = 0; c < count; c++) {
      const pos = positions[c];
      const node = {
        id: `n_${r}_${c}`,
        row: r,
        col: c,
        x: pos.x,
        /** 自下而上：起点在底部，Boss 在顶部 */
        y: 1 - r / Math.max(1, rows - 1),
        type: 'combat',
        visited: false,
        available: r === 0,
        cleared: false,
        isStart: r === 0,
        isBoss: r === rows - 1,
      };
      rowNodes.push(node);
      nodes.push(node);
    }
    if (r > 0) connectRows(nodes, connections, r, rowNodes, linear);
  }

  assignNodeTypes(nodes, rows, act, ascension, linear);

  const boss = nodes.find(n => n.row === rows - 1);
  if (boss) {
    boss.type = 'boss';
    boss.isBoss = true;
  }

  applyMapEdgeInset(nodes);

  return { nodes, connections, rows, act, _displayInset: true };
}

/** 留出上下左右边距，避免节点/标签被裁切 */
export function applyMapEdgeInset(nodes, pad = 0.085) {
  const inset = (v) => pad + v * (1 - 2 * pad);
  for (const n of nodes) {
    n.x = inset(n.x);
    n.y = inset(n.y);
  }
}

/** 旧存档地图补正边距（只执行一次） */
export function normalizeMapForDisplay(map) {
  if (!map?.nodes || map._displayInset) return map;
  const needsInset = map.nodes.some(n => n.y <= 0.01 || n.y >= 0.99 || n.x <= 0.01 || n.x >= 0.99);
  if (needsInset) applyMapEdgeInset(map.nodes);
  map._displayInset = true;
  return map;
}

function layoutSymmetricRow(count) {
  if (count <= 0) return [];
  if (count === 1) return [{ x: 0.5 }];
  const span = Math.min(0.7, 0.14 + count * 0.11);
  const out = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    out.push({ x: 0.5 + (t - 0.5) * span });
  }
  return out;
}

function connectRows(nodes, connections, r, rowNodes, linear = false) {
  const prevRow = nodes.filter(n => n.row === r - 1);
  if (!prevRow.length) return;

  if (linear) {
    for (let i = 0; i < Math.min(prevRow.length, rowNodes.length); i++) {
      addConnection(connections, prevRow[i].id, rowNodes[i].id);
    }
    if (!connections.some(c => rowNodes[0] && c.to === rowNodes[0].id)) {
      addConnection(connections, prevRow[0].id, rowNodes[0].id);
    }
    return;
  }

  for (const pn of prevRow) {
    const sorted = [...rowNodes].sort((a, b) => Math.abs(a.x - pn.x) - Math.abs(b.x - pn.x));
    const maxLinks = sorted.length === 1 ? 1 : randInt(1, 2);
    for (let i = 0; i < maxLinks; i++) {
      addConnection(connections, pn.id, sorted[i].id);
    }
  }
  for (const tn of rowNodes) {
    if (!connections.some(c => c.to === tn.id)) {
      const nearest = prevRow.reduce((a, b) =>
        Math.abs(a.x - tn.x) < Math.abs(b.x - tn.x) ? a : b);
      addConnection(connections, nearest.id, tn.id);
    }
  }
}

function addConnection(connections, from, to) {
  if (!connections.some(c => c.from === from && c.to === to)) {
    connections.push({ from, to });
  }
}

/** 分配房间类型：仅 敌人/精英/商店/休息/问号/Boss */
function assignNodeTypes(nodes, rows, act, ascension, linear) {
  let shopCooldown = 0;
  let restCooldown = 0;
  let eliteInSegment = 0;

  for (const n of nodes) {
    if (n.row === 0) {
      n.type = 'combat';
      continue;
    }
    if (n.row === rows - 1) {
      n.type = 'boss';
      continue;
    }

    const progress = n.row / (rows - 1);
    const r = Math.random();

    if (shopCooldown <= 0 && progress > 0.2 && progress < 0.85 && r < 0.09) {
      n.type = 'shop';
      shopCooldown = 5;
      restCooldown = Math.max(restCooldown, 2);
      continue;
    }
    if (restCooldown <= 0 && progress > 0.15 && r < 0.11) {
      n.type = 'rest';
      restCooldown = 4;
      shopCooldown = Math.max(shopCooldown, 2);
      continue;
    }

    const eliteChance = 0.08 + ascension * 0.015 + (progress > 0.45 ? 0.06 : 0);
    if (eliteInSegment < 2 && progress > 0.25 && progress < 0.92 && r < eliteChance) {
      n.type = 'elite';
      eliteInSegment++;
      continue;
    }

    if (r < 0.14 + act * 0.02) {
      n.type = 'event';
      continue;
    }

    n.type = 'combat';
    shopCooldown--;
    restCooldown--;
    if (n.row % 5 === 0) eliteInSegment = 0;
  }
}

export function getAvailableNodes(map, currentNodeId) {
  if (!currentNodeId) return map.nodes.filter(n => n.row === 0);
  return map.nodes.filter(n => {
    if (n.cleared) return false;
    return map.connections.some(c => c.from === currentNodeId && c.to === n.id) && n.available;
  });
}

export function moveToNode(map, nodeId) {
  const node = map.nodes.find(n => n.id === nodeId);
  if (!node) return null;
  map.nodes.forEach(n => { n.available = false; });
  node.visited = true;
  const next = map.connections.filter(c => c.from === nodeId).map(c => c.to);
  map.nodes.forEach(n => { if (next.includes(n.id) && !n.cleared) n.available = true; });
  return node;
}

export function teleportMapNode(map, nodeId) {
  const node = map.nodes.find(n => n.id === nodeId);
  if (!node?.cleared) return null;
  map.nodes.forEach(n => { n.available = false; });
  const next = map.connections.filter(c => c.from === nodeId).map(c => c.to);
  map.nodes.forEach(n => { if (next.includes(n.id) && !n.cleared) n.available = true; });
  return node;
}

export const NODE_LABELS = {
  combat: '敌人',
  elite: '精英',
  rest: '休息',
  shop: '商店',
  event: '未知',
  boss: 'Boss',
};

export function getNodeTypeKey(type) {
  const map = {
    combat: 'M', elite: 'E', rest: 'R', shop: 'S', event: '?', boss: 'B',
  };
  return map[type] || 'M';
}

export function getCombatEnemies(nodeType, act, floor, ascension = 0) {
  if (nodeType === 'boss') return [BOSS_BY_ACT[act] || 'slime_boss'];
  const table = ENCOUNTER_TABLES[act] || ENCOUNTER_TABLES[1];
  if (nodeType === 'elite') {
    const pool = table.elite;
    return [...pool[Math.floor(Math.random() * pool.length)]];
  }
  const pool = table.normal;
  return [...pool[Math.floor(Math.random() * pool.length)]];
}

export function getEnemyScale(act, ascension, floor = 0) {
  const actMul = 1 + (act - 1) * 0.14;
  const ascMul = 1 + ascension * 0.04;
  const floorMul = 1 + Math.min(floor, 16) * 0.006;
  return actMul * ascMul * floorMul;
}

function randInt(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}
