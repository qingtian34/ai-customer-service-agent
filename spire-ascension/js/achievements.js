/** 《星渊之塔》成就与元进度 */
export const ACHIEVEMENTS = {
  first_win: { id: 'first_win', name: '初踏星渊', icon: '🏔️', desc: '首次通关星渊之塔', reward: '解锁全部进阶 1' },
  ascension_5: { id: 'ascension_5', name: '进阶 V', icon: '⭐', desc: '进阶 5 通关', reward: '记忆碎片 +3' },
  ascension_10: { id: 'ascension_10', name: '进阶 X', icon: '🌟', desc: '进阶 10 通关', reward: '记忆碎片 +5' },
  ascension_20: { id: 'ascension_20', name: '星渊征服者', icon: '👑', desc: '进阶 20 通关', reward: '真结局线索' },
  all_classes: { id: 'all_classes', name: '四象守护者', icon: '🎭', desc: '四名角色均通关', reward: '角色皮肤线索' },
  iron_clear: { id: 'iron_clear', name: '烈日裁决', icon: '☀', desc: '烈日骑士通关', hidden: false },
  shadow_clear: { id: 'shadow_clear', name: '月影终舞', icon: '🌙', desc: '月影舞者通关', hidden: false },
  arcane_clear: { id: 'arcane_clear', name: '星尘超新星', icon: '✦', desc: '星尘术士通关', hidden: false },
  blood_clear: { id: 'blood_clear', name: '虚空猎杀', icon: '🌀', desc: '虚空猎手通关', hidden: false },
  elite_hunter: { id: 'elite_hunter', name: '精英猎手', icon: '💀', desc: '单局击杀 5 个精英', reward: '商店折扣线索' },
  boss_slayer: { id: 'boss_slayer', name: '弑君者', icon: '👹', desc: '单局击败 3 个 Boss', hidden: false },
  minimalist: { id: 'minimalist', name: '极简星轨', icon: '🃏', desc: '卡组 ≤12 张通关', hidden: false },
  relic_collector: { id: 'relic_collector', name: '遗物收藏家', icon: '✨', desc: '单局收集 10 件遗物', hidden: false },
  rich: { id: 'rich', name: '星币大亨', icon: '💰', desc: '单局持有 400 金币', hidden: false },
  pacifist_floor: { id: 'pacifist_floor', name: '铁壁', icon: '🛡️', desc: '一场战斗未受击胜利', hidden: false },
  resonance_master: { id: 'resonance_master', name: '共鸣大师', icon: '🔮', desc: '单场战斗触发 8 次三层共鸣', hidden: false },
  burst_fanatic: { id: 'burst_fanatic', name: '爆发狂人', icon: '💥', desc: '单局使用共鸣爆发 6 次', hidden: false },
  tarot_oracle: { id: 'tarot_oracle', name: '塔罗先知', icon: '🎴', desc: '累计选择 50 次战斗塔罗', hidden: false },
  env_world: { id: 'env_world', name: '世界行者', icon: '🌍', desc: '用「世界」环境塔罗通关一层', hidden: false },
  no_potion: { id: 'no_potion', name: '纯净之旅', icon: '🏺', desc: '未使用药水通关', hidden: false },
  cursed_victor: { id: 'cursed_victor', name: '诅咒王座', icon: '🔗', desc: '卡组含 3 张诅咒通关', hidden: false },
  speed_climb: { id: 'speed_climb', name: '速攀星塔', icon: '⚡', desc: '55 层内通关', hidden: false },
  judgement_elite: { id: 'judgement_elite', name: '审判之刃', icon: '📯', desc: '击败审判环境额外精英', hidden: false },
  sun_monarch: { id: 'sun_monarch', name: '日冕终结', icon: '👑', desc: '击败日冕君主', hidden: false },
  eclipse_fallen: { id: 'eclipse_fallen', name: '月蚀破碎', icon: '🌘', desc: '击败月蚀魔女', hidden: false },
  abyss_sealed: { id: 'abyss_sealed', name: '星核封印', icon: '💠', desc: '击败星渊之核', hidden: false },
  fragment_10: { id: 'fragment_10', name: '记忆拾荒', icon: '📜', desc: '累计 10 片记忆碎片', hidden: false },
  fragment_30: { id: 'fragment_30', name: '档案馆学徒', icon: '📚', desc: '累计 30 片记忆碎片', hidden: false },
  deaths_5: { id: 'deaths_5', name: '不屈意志', icon: '🙃', desc: '累计失败 5 次（倒吊人之路）', hidden: true },
  shopaholic: { id: 'shopaholic', name: '商人挚友', icon: '🛒', desc: '单局商店消费 300 金币', hidden: false },
  forge_master: { id: 'forge_master', name: '隐者锻造', icon: '🔨', desc: '单局锻造升级 3 张牌', hidden: false },
};

const CLASS_IDS = ['iron_warrior', 'shadow_rogue', 'arcane_mage', 'blood_hunter'];

export function checkAchievements(game, meta, event) {
  const unlocked = new Set(meta.achievements || []);
  const newly = [];

  const tryUnlock = (id) => {
    if (!unlocked.has(id) && ACHIEVEMENTS[id]) {
      unlocked.add(id);
      newly.push(ACHIEVEMENTS[id]);
    }
  };

  meta.stats = meta.stats || {};
  if (event === 'tarot_pick') meta.stats.tarotPicks = (meta.stats.tarotPicks || 0) + 1;
  if (event === 'forge') meta.stats.forges = (meta.stats.forges || 0) + 1;
  if (event === 'burst') meta.stats.bursts = (meta.stats.bursts || 0) + 1;
  if (event === 'resonance3') meta.stats.resonance3 = (meta.stats.resonance3 || 0) + 1;
  if (event === 'boss_kill') {
    meta.stats.bossKills = (meta.stats.bossKills || 0) + 1;
    if (game.pendingBoss || event === 'boss_kill') {
      const bossId = game.pendingEnemies?.[0] || game.lastBossId;
      if (bossId === 'sun_monarch') tryUnlock('sun_monarch');
      if (bossId === 'eclipse_witch') tryUnlock('eclipse_fallen');
      if (bossId === 'abyss_core') tryUnlock('abyss_sealed');
    }
  }
  if (event === 'judgement_elite') tryUnlock('judgement_elite');

  if (event === 'victory') {
    tryUnlock('first_win');
    if (game.ascension >= 5) tryUnlock('ascension_5');
    if (game.ascension >= 10) tryUnlock('ascension_10');
    if (game.ascension >= 20) tryUnlock('ascension_20');
    if ((game.stats?.elitesSlain || 0) >= 5) tryUnlock('elite_hunter');
    if ((game.stats?.bossKills || meta.stats.bossKills || 0) >= 3) tryUnlock('boss_slayer');
    if (game.deck.length <= 12) tryUnlock('minimalist');
    if (game.relics.length >= 10) tryUnlock('relic_collector');
    if ((game.stats?.totalFloors || game.floor) <= 55) tryUnlock('speed_climb');
    if (game.deck.filter(c => c.type === 'curse' || c.rarity === 'curse').length >= 3) tryUnlock('cursed_victor');
    if (!game.stats?.potionsUsed) tryUnlock('no_potion');
    if (game.envTarotId === 'world') tryUnlock('env_world');
    if ((meta.stats?.forges || 0) >= 3) tryUnlock('forge_master');

    meta.classesWon = meta.classesWon || {};
    meta.classesWon[game.classId] = true;
    if (game.classId === 'iron_warrior') tryUnlock('iron_clear');
    if (game.classId === 'shadow_rogue') tryUnlock('shadow_clear');
    if (game.classId === 'arcane_mage') tryUnlock('arcane_clear');
    if (game.classId === 'blood_hunter') tryUnlock('blood_clear');
    if (CLASS_IDS.every(id => meta.classesWon[id])) tryUnlock('all_classes');
  }

  if (event === 'elite_kill' && (game.stats?.elitesSlain || 0) >= 5) tryUnlock('elite_hunter');
  if (event === 'gold' && game.gold >= 400) tryUnlock('rich');
  if (event === 'no_damage_win') tryUnlock('pacifist_floor');
  if (event === 'resonance3' && (meta.stats.resonance3 || 0) >= 8) tryUnlock('resonance_master');
  if (event === 'burst' && (meta.stats.bursts || 0) >= 6) tryUnlock('burst_fanatic');
  if (event === 'tarot_pick' && (meta.stats.tarotPicks || 0) >= 50) tryUnlock('tarot_oracle');
  if ((meta.fragments || 0) >= 10) tryUnlock('fragment_10');
  if ((meta.fragments || 0) >= 30) tryUnlock('fragment_30');
  if ((meta.losses || 0) >= 5) tryUnlock('deaths_5');
  if (event === 'shop_spend' && (game.stats?.shopSpent || 0) >= 300) tryUnlock('shopaholic');

  meta.achievements = [...unlocked];
  return newly;
}

/** 角色等级（元进度）：通关与成就增加经验，解锁奖励卡池提示 */
export function addCharacterXp(meta, classId, amount) {
  meta.characterXp = meta.characterXp || {};
  meta.characterXp[classId] = (meta.characterXp[classId] || 0) + amount;
  const lvl = Math.floor(meta.characterXp[classId] / 500);
  meta.characterLevel = meta.characterLevel || {};
  meta.characterLevel[classId] = lvl;
  return lvl;
}

export function onVictoryMeta(game, meta) {
  meta.wins = (meta.wins || 0) + 1;
  meta.fragments = (meta.fragments || 0) + 2 + (game.act || 1);
  if (game.ascension > (meta.bestAscension || 0)) meta.bestAscension = game.ascension;
  addCharacterXp(meta, game.classId, 400 + game.ascension * 50);
  return checkAchievements(game, meta, 'victory');
}
