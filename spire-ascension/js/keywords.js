/** 卡牌关键词与协同标签 */
export const KEYWORDS = {
  exhaust: { label: '消耗', color: '#8b6914', desc: '打出后移出本局战斗' },
  retain: { label: '保留', color: '#4a7fd4', desc: '回合结束时留在手牌' },
  ethereal: { label: '虚无', color: '#6a5acd', desc: '回合结束时若仍在手牌则消耗' },
  innate: { label: '固有', color: '#c45c3e', desc: '战斗开始时在手牌中' },
  unplayable: { label: '无法打出', color: '#666', desc: '不能主动打出' },
};

export function getCardKeywords(cardId, cardDef) {
  const tags = [];
  if (cardDef?.exhaust) tags.push('exhaust');
  if (cardDef?.unplayable) tags.push('unplayable');
  if (cardDef?.effects?.some(e => e.type === 'power_retain')) tags.push('retain');
  if (cardDef?.effects?.some(e => e.type?.startsWith('ethereal'))) tags.push('ethereal');
  return tags.map(t => ({ key: t, ...KEYWORDS[t] })).filter(k => k.label);
}

export function getActiveSynergies(combat) {
  const p = combat?.player;
  if (!p) return [];
  const syn = [];
  const res = combat?.resonance;
  if (res) {
    if ((res.sun || 0) >= 3) syn.push({ icon: '☀', name: '日耀共鸣', desc: `日 ${res.sun} 层 — 太阳系卡牌强化` });
    if ((res.moon || 0) >= 3) syn.push({ icon: '🌙', name: '月影共鸣', desc: `月 ${res.moon} 层 — 月系卡牌强化` });
    if ((res.star || 0) >= 3) syn.push({ icon: '✦', name: '星尘共鸣', desc: `星 ${res.star} 层 — 星系卡牌强化` });
  }
  if ((combat?.burst?.charge || 0) >= 5) {
    syn.push({ icon: '💥', name: '爆发就绪', desc: '共鸣爆发已满，可释放角色绝技' });
  }
  const pw = p.powers || {};
  if (pw.corruption) syn.push({ icon: '🌀', name: '腐化', desc: '技能0费并消耗' });
  if (pw.demon_form) syn.push({ icon: '😈', name: '恶魔形态', desc: `每回合 +${pw.demon_form} 力量` });
  if (pw.electro) syn.push({ icon: '⚡', name: '电动力学', desc: '攻击命中全体' });
  if (pw.after_image) syn.push({ icon: '👤', name: '残影', desc: '出牌获格挡' });
  if (pw.combust) syn.push({ icon: '🔥', name: '自燃', desc: '回合末群体伤害' });
  if (pw.feel_no_pain) syn.push({ icon: '💪', name: '麻木', desc: '消耗获格挡' });
  if (pw.barricade || p.statuses.barricade) syn.push({ icon: '🏰', name: '壁垒', desc: '格挡保留' });
  if (pw.storm) syn.push({ icon: '🌩️', name: '风暴', desc: '能力牌产电击' });
  if (pw.echo) syn.push({ icon: '🔁', name: '回响', desc: '首张牌双重' });
  if ((p.statuses.poison || 0) >= 3) syn.push({ icon: '☠️', name: '毒流', desc: '中毒体系激活' });
  if ((p.statuses.strength || 0) >= 3) syn.push({ icon: '💢', name: '力量流', desc: '高力量加成' });
  return syn;
}
