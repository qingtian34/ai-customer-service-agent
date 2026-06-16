/** Web Audio 音效 — 程序化合成 + 可选素材扩展 */

const SETTINGS_KEY = 'spire_audio_settings';

let ctx = null;
let master = null;
let unlocked = false;
let settings = { volume: 0.65, muted: false };

export function loadAudioSettings() {
  try {
    settings = { ...settings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)) };
  } catch { /* default */ }
}

export function saveAudioSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getAudioSettings() {
  return { ...settings };
}

export function setVolume(v) {
  settings.volume = Math.max(0, Math.min(1, v));
  if (master) master.gain.value = settings.muted ? 0 : settings.volume;
  saveAudioSettings();
}

export function setMuted(m) {
  settings.muted = !!m;
  if (master) master.gain.value = settings.muted ? 0 : settings.volume;
  saveAudioSettings();
}

export function unlockAudio() {
  if (unlocked) return;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = settings.muted ? 0 : settings.volume;
    master.connect(ctx.destination);
    unlocked = true;
    if (ctx.state === 'suspended') ctx.resume();
  } catch { /* no audio */ }
}

function playTone(freq, dur, type = 'sine', vol = 0.15, slide = 0) {
  if (!ctx || settings.muted) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slide) osc.frequency.exponentialRampToValueAtTime(slide, t + dur);
  g.gain.setValueAtTime(vol * settings.volume, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(g);
  g.connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function playNoise(dur, vol = 0.08, filterFreq = 800) {
  if (!ctx || settings.muted) return;
  const t = ctx.currentTime;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filt = ctx.createBiquadFilter();
  filt.type = 'bandpass';
  filt.frequency.value = filterFreq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol * settings.volume, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(filt);
  filt.connect(g);
  g.connect(master);
  src.start(t);
}

const SFX = {
  click: () => playTone(520, 0.06, 'sine', 0.12),
  card: () => { playTone(280, 0.08, 'triangle', 0.1); playTone(420, 0.05, 'sine', 0.06); },
  attack: () => { playNoise(0.12, 0.14, 600); playTone(120, 0.1, 'sawtooth', 0.08, 60); },
  block: () => playTone(180, 0.15, 'square', 0.1, 90),
  heal: () => { playTone(440, 0.1, 'sine', 0.1); playTone(660, 0.12, 'sine', 0.08); },
  poison: () => playTone(200, 0.2, 'sawtooth', 0.06, 150),
  enemyTurn: () => playTone(90, 0.25, 'triangle', 0.1),
  endTurn: () => playTone(330, 0.12, 'sine', 0.1, 220),
  map: () => playTone(400, 0.08, 'sine', 0.08),
  gold: () => { playTone(880, 0.06, 'sine', 0.08); setTimeout(() => playTone(1100, 0.08, 'sine', 0.06), 60); },
  relic: () => { playTone(523, 0.1, 'sine', 0.1); playTone(659, 0.1, 'sine', 0.08); playTone(784, 0.15, 'sine', 0.06); },
  victory: () => {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.2, 'sine', 0.12), i * 120));
  },
  defeat: () => { playTone(220, 0.3, 'sawtooth', 0.1, 110); },
  error: () => playTone(150, 0.15, 'square', 0.08),
};

export function playSfx(name) {
  unlockAudio();
  const fn = SFX[name];
  if (fn) fn();
}
