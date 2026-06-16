/** 启动：预加载素材 → 进入游戏 */
import { particleUrl } from './assets.js';
import { preloadGiIcons, getGiPreloadList } from './game-icons.js';
import { loadAudioSettings } from './audio.js';

const PRELOAD = [
  particleUrl('slash'), particleUrl('spark'), particleUrl('magic'), particleUrl('flame'),
];

function setProgress(p, text) {
  const bar = document.querySelector('.boot-progress-fill');
  const label = document.querySelector('.boot-label');
  if (bar) bar.style.width = `${p}%`;
  if (label) label.textContent = text;
}

async function preloadAssets() {
  let done = 0;
  const total = PRELOAD.length;
  const loadOne = (src) => new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => {
      done++;
      setProgress(Math.round((done / total) * 85), `加载素材 ${done}/${total}…`);
      resolve();
    };
    img.src = src;
  });
  await Promise.all(PRELOAD.map(loadOne));
  setProgress(88, '加载插画库…');
  await preloadGiIcons(getGiPreloadList());
  setProgress(95, '初始化引擎…');
}

async function start() {
  loadAudioSettings();
  setProgress(10, '准备资源…');
  await preloadAssets();
  setProgress(100, '进入游戏…');
  await import('./main.js');
  const boot = document.querySelector('.boot-screen');
  if (boot) {
    boot.classList.add('boot-done');
    setTimeout(() => boot.remove(), 500);
  }
}

start().catch((e) => {
  const app = document.getElementById('app');
  if (app) app.innerHTML = `<div class="boot-error"><h2>启动失败</h2><pre>${e.message}</pre></div>`;
});
