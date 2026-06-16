/** Canvas 环境粒子 — 菜单 / 地图 / 休息（战斗场景用 CSS 背景，不在此层叠粒子） */

let canvas, cctx, animId, mode = 'menu', actNum = 1, particles = [], paused = false;

const THEMES = {
  menu: { count: 36, colors: ['#6040a0', '#d4a84b', '#4060c0'], speed: 0.28 },
  map: { count: 22, colors: ['#5040a0', '#4a9e6e', '#8090a0'], speed: 0.18 },
  rest: { count: 16, colors: ['#d4a84b', '#c45c3e'], speed: 0.12 },
};

const ACT_TINT = { 1: '#201830', 2: '#304060', 3: '#402060' };

function hexAlpha(hex, a) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function resizeCanvas() {
  if (!canvas || !cctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawBase() {
  if (!cctx || !canvas) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const tint = ACT_TINT[actNum] || ACT_TINT[1];
  const grad = cctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, hexAlpha(tint, 0.55));
  grad.addColorStop(0.55, 'rgba(8, 10, 16, 0.92)');
  grad.addColorStop(1, 'rgba(4, 6, 10, 0.98)');
  cctx.fillStyle = grad;
  cctx.fillRect(0, 0, w, h);
}

function spawnParticles(theme) {
  particles = Array.from({ length: theme.count }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 1 + Math.random() * 2.5,
    vx: (Math.random() - 0.5) * theme.speed * 0.002,
    vy: -0.0004 - Math.random() * theme.speed * 0.002,
    color: theme.colors[Math.floor(Math.random() * theme.colors.length)],
    alpha: 0.1 + Math.random() * 0.28,
    pulse: Math.random() * Math.PI * 2,
  }));
}

function drawFrame() {
  if (!cctx || !canvas || paused) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  drawBase();
  const t = Date.now() * 0.001;

  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.pulse += 0.02;
    if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
    if (p.x < -0.05) p.x = 1.05;
    if (p.x > 1.05) p.x = -0.05;

    const px = p.x * w;
    const py = p.y * h;
    const a = p.alpha * (0.55 + 0.45 * Math.sin(p.pulse + t));
    const grad = cctx.createRadialGradient(px, py, 0, px, py, p.r * 7);
    grad.addColorStop(0, hexAlpha(p.color, a));
    grad.addColorStop(1, 'transparent');
    cctx.fillStyle = grad;
    cctx.beginPath();
    cctx.arc(px, py, p.r * 4, 0, Math.PI * 2);
    cctx.fill();
  }
}

function loop() {
  animId = requestAnimationFrame(loop);
  drawFrame();
}

function startLoop() {
  if (animId) return;
  loop();
}

function stopLoop() {
  if (animId) {
    cancelAnimationFrame(animId);
    animId = null;
  }
}

/** 战斗界面：清空 canvas，避免与 combat-scene 背景叠两层 */
function clearForCombat() {
  stopLoop();
  particles = [];
  resizeCanvas();
  if (cctx && canvas) {
    cctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  if (canvas) canvas.style.opacity = '0';
}

function ensureCanvas() {
  if (canvas) return true;
  canvas = document.getElementById('bg-canvas');
  if (!canvas) return false;
  cctx = canvas.getContext('2d', { alpha: true });
  window.addEventListener('resize', () => {
    resizeCanvas();
    if (mode === 'combat') clearForCombat();
    else drawFrame();
  });
  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
    if (!paused && mode !== 'combat') startLoop();
  });
  return true;
}

export function initCanvasBg(screenMode = 'menu', act = 1) {
  if (!ensureCanvas()) return;
  mode = screenMode;
  actNum = act;

  if (screenMode === 'combat') {
    clearForCombat();
    return;
  }

  canvas.style.opacity = '1';
  const theme = THEMES[screenMode] || THEMES.menu;
  spawnParticles(theme);
  resizeCanvas();
  drawFrame();
  if (!paused) startLoop();
}

export function stopCanvasBg() {
  stopLoop();
  particles = [];
  if (cctx && canvas) cctx.clearRect(0, 0, canvas.width, canvas.height);
}
