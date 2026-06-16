/** 永久成长：角色等级、成就加成、星渊档案馆 */
import { REWARD_CARD_POOL, CARD_POOL, RELICS } from './data.js';
import { makeCard } from './combat.js';
import { ACHIEVEMENTS } from './achievements.js';

export const ARCHIVE_ENTRIES = [
  { id: 'frag_1', fragments: 1, title: '封印之初', text: '高塔并非建筑，而是古代星渊文明留下的裂口封印装置。' },
  { id: 'frag_3', fragments: 3, title: '四象守护者', text: '烈日骑士、月影舞者、星尘术士、虚空猎手曾是同一时代的守塔人。' },
  { id: 'frag_5', fragments: 5, title: '共鸣之源', text: '日、月、星三色共鸣是封印维持的脉搏；虚空则是裂口溢出的反噬。' },
  { id: 'frag_10', fragments: 10, title: '塔罗位面', text: '大阿卡纳并非占卜，而是位面规则的碎片，能暂时改写塔内法则。' },
  { id: 'frag_15', fragments: 15, title: '月蚀魔女', text: '她曾是月影位面的祭司，在裂口扩大时第一个被虚空侵蚀。' },
  { id: 'frag_20', fragments: 20, title: '日冕君主', text: '日耀军团的最后君主选择将自己钉在封印核心，成为第一幕的守关幻影。' },
  { id: 'frag_25', fragments: 25, title: '星渊之核', text: '第三幕的核心不是敌人，而是封印本身苏醒的意志。' },
  { id: 'frag_30', fragments: 30, title: '献祭真相', text: '彻底关闭裂口需要守护者献祭；真结局需以「世界」塔罗引导全部记忆归位。' },
];

export const START_BONUS_OPTIONS = {
  resilient: { id: 'resilient', name: '坚韧', desc: '替换初始遗物为随机非Starter遗物', achievement: 'pacifist_floor' },
  burst_start: { id: 'burst_start', name: '爆发', desc: '开局获得一张随机稀有卡', achievement: 'burst_fanatic' },
  speed_gold: { id: 'speed_gold', name: '速攻', desc: '起始金币 +50', achievement: 'speed_climb' },
  replace_relic: { id: 'replace_relic', name: '遗物置换', desc: '替换职业初始遗物', achievement: 'first_win' },
};

export function getCharacterLevel(meta, classId) {
  const xp = meta?.characterXp?.[classId] || 0;
  return Math.min(20, Math.floor(xp / 500));
}

export function addCharacterXp(meta, classId, amount) {
  meta.characterXp = meta.characterXp || {};
  meta.characterXp[classId] = (meta.characterXp[classId] || 0) + amount;
  meta.characterLevel = meta.characterLevel || {};
  meta.characterLevel[classId] = getCharacterLevel(meta, classId);
  return meta.characterLevel[classId];
}

/** 等级 1–5 普通，6–10 罕见，11–15 稀有，16+ 传奇 */
export function getUnlockedRaritiesForLevel(level) {
  const r = ['common'];
  if (level >= 1) r.push('common');
  if (level >= 6) r.push('uncommon');
  if (level >= 11) r.push('rare');
  if (level >= 16) r.push('legendary');
  return [...new Set(r)];
}

export function filterCardPoolByLevel(classId, level) {
  const allowed = getUnlockedRaritiesForLevel(level);
  const pool = REWARD_CARD_POOL[classId] || [];
  const neutral = REWARD_CARD_POOL.neutral || [];
  return [...pool, ...neutral].filter(id => {
    const r = CARD_POOL[id]?.rarity || 'common';
    return allowed.includes(r);
  });
}

export function getUnlockedStartBonuses(meta) {
  const ach = new Set(meta?.achievements || []);
  return Object.values(START_BONUS_OPTIONS).filter(o => ach.has(o.achievement));
}

export function applyStartBonus(game, bonusId, meta) {
  if (!bonusId) return;
  const pool = Object.values(RELICS).filter(r => !r.class && r.rarity !== 'starter' && r.rarity !== 'boss');
  switch (bonusId) {
    case 'resilient':
    case 'replace_relic': {
      if (game.relics.length) game.relics.pop();
      const r = pool[Math.floor(Math.random() * pool.length)];
      if (r) game.relics.push(r.id);
      break;
    }
    case 'burst_start': {
      const cards = filterCardPoolByLevel(game.classId, 11).filter(id => CARD_POOL[id]?.rarity === 'rare');
      if (cards.length) game.deck.push(makeCard(cards[Math.floor(Math.random() * cards.length)]));
      break;
    }
    case 'speed_gold':
      game.gold += 50;
      break;
    default:
      break;
  }
}

export function getUnlockedArchive(meta) {
  const frags = meta?.fragments || 0;
  return ARCHIVE_ENTRIES.filter(e => frags >= e.fragments);
}

export function checkTrueEnding(game, meta) {
  const allArchive = ARCHIVE_ENTRIES.every(e => (meta?.fragments || 0) >= e.fragments);
  const worldTarot = game.selectedBattleTarots?.includes('world') || game.selectedBattleTarot === 'world';
  const beatAbyss = game.lastBossId === 'abyss_core' && game.victory;
  return allArchive && worldTarot && beatAbyss;
}

export function grantRunXp(meta, game) {
  const xp = (game.stats?.combatsWon || 0) + (game.floor || 0);
  return addCharacterXp(meta, game.classId, xp);
}
