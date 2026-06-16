/** 精英遭遇词缀 / 战斗修饰 */
export const ELITE_MODIFIERS = [
  { id: 'armored', name: '装甲', icon: '🛡️', desc: '敌人初始 +8 格挡', apply: (combat) => { for (const e of combat.enemies) e.block += 8; } },
  { id: 'vicious', name: '凶残', icon: '⚔️', desc: '敌人 +15% 生命', apply: (combat) => { for (const e of combat.enemies) { e.maxHp = Math.floor(e.maxHp * 1.15); e.hp = e.maxHp; } } },
  { id: 'hexed', name: '诅咒', icon: '🔮', desc: '战斗开始你获得 1 层虚弱', apply: (combat) => { combat.player.statuses.weak = (combat.player.statuses.weak || 0) + 1; } },
  { id: 'rich', name: '富饶', icon: '💎', desc: '额外 +20 金币奖励', goldBonus: 20 },
  { id: 'sentinel', name: '哨戒', icon: '👁️', desc: '敌人首回合 +5 格挡', apply: (combat) => { combat.enemies.forEach(e => { e.block += 5; }); combat.eliteFirstTurn = true; } },
  { id: 'volatile', name: '易爆', icon: '💥', desc: '敌人死亡时对随机敌人造成 5 伤害', onEnemyDeath: (combat, dead) => {
    const others = combat.enemies.filter(e => e.hp > 0 && e !== dead);
    if (others.length) others[Math.floor(Math.random() * others.length)].hp -= 5;
  }},
];

export const ACT_FLAVOR = {
  1: { name: '尖塔底层', mood: '古老、潮湿、低语', color: '#2a2035', particles: '🕯️' },
  2: { name: '迷雾走廊', mood: '霓虹、迷雾、机械', color: '#1a2535', particles: '🌫️' },
  3: { name: '尖塔之巅', mood: '虚空、时间、神圣', color: '#101828', particles: '✨' },
};

export function rollEliteModifier() {
  return ELITE_MODIFIERS[Math.floor(Math.random() * ELITE_MODIFIERS.length)];
}
