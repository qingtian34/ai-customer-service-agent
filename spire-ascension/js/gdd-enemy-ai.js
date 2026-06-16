/** GDD 敌人意图扩展 */

export function buildGddIntent(def, key, enemy, combat) {
  const str = (enemy.statuses.strength || 0) + (enemy.statuses.ritual || 0);
  const p = combat?.player;

  if (key === 'attack_debuff') {
    const range = def.attack_debuff || def.attack || [8, 8];
    const val = (Array.isArray(range) ? rand(range) : range) + str;
    const deb = def.debuff || { vulnerable: 1 };
    return { type: 'attack_debuff', value: val, debuff: deb, display: `⚔ ${val} + 减益` };
  }
  if (key === 'corruption_discard' || key === 'corruption_hand') {
    const cfg = def[key] || { damage: [5, 5], corruption: 1 };
    const dmg = (Array.isArray(cfg.damage) ? rand(cfg.damage) : cfg.damage) + str;
    const target = cfg.target || (key === 'corruption_hand' ? 'hand' : 'discard');
    return { type: key, value: dmg, corruption: cfg.corruption || 1, target, display: `☠ ${dmg} + 腐化` };
  }
  if (key === 'clear_resonance') {
    return { type: 'clear_resonance', display: '🌀 清除共鸣' };
  }
  if (key === 'charge') {
    return { type: 'charge', stacks: def.charge?.stacks || 1, display: '⚡ 充能' };
  }
  if (key === 'special_beam') {
    const cfg = def.special_beam || { base: 8, perCharge: 3 };
    const ch = enemy.charge || 0;
    const val = cfg.base + ch * (cfg.perCharge || 3) + str;
    return { type: 'special_beam', value: val, consumeCharge: cfg.consumeCharge, display: `✦ 射线 ${val}` };
  }
  if (key === 'special_sun_burst') {
    const cfg = def.special_sun_burst || { damage: [15, 15] };
    const val = rand(cfg.damage) + str;
    return { type: 'special_sun_burst', value: val, requiresResonance: cfg.requiresResonance, display: `☀ 阳炎 ${val}` };
  }
  if (key === 'opening_shield') {
    const cfg = def.opening_shield || { block: 30, strength: 3, turns: 3 };
    if (enemy.openingDone) return buildGddIntent(def, 'attack_big', enemy, combat);
    return { type: 'opening_shield', ...cfg, display: `🛡 日蚀护盾 ${cfg.block}` };
  }
  if (key === 'summon_minion') {
    const cfg = def.summon_minion || { id: 'star_dust_minion', hp: 15 };
    return { type: 'summon_minion', ...cfg, display: '👥 召唤' };
  }
  if (key === 'buff_ally') {
    const cfg = def.buff_ally || { block: 6, strength: 2 };
    return { type: 'buff_ally', ...cfg, display: '🛡 辅助盟友' };
  }
  if (key === 'attack_discard') {
    const range = def.attack_discard?.damage || def.attack || [12, 12];
    return { type: 'attack_discard', value: rand(range) + str, display: `⚔ ${rand(range)} + 弃牌` };
  }
  if (key === 'add_deep_corruption') {
    return { type: 'add_deep_corruption', display: '💀 深度腐化' };
  }
  if (key === 'attack_multi') {
    const range = def.attack_multi || [7, 7];
    const hits = def.multiHits?.[enemy.intentIndex % (def.multiHits?.length || 1)] || 2;
    const val = rand(range) + str;
    return { type: 'attack_multi', value: val, hits, display: `⚔ ${hits}×${val}` };
  }
  if (key === 'attack_big') {
    const range = def.attack_big || [20, 20];
    let val = rand(range) + str;
    if (def.attack_bigHalvedIfShield && enemy.block <= 0 && enemy.shieldBroken) val = Math.floor(val / 2);
    return { type: 'attack_big', value: val, display: `⚔ ${val}` };
  }
  if (key === 'debuff_all') {
    return { type: 'debuff', value: def.debuff_all || { weak: 2, vulnerable: 2 }, display: '🔻 群体削弱' };
  }
  if (key === 'phase_shell') {
    return { type: 'defend', value: 20, display: '🛡 壳层护盾' };
  }
  if (key === 'attack_fast') {
    const range = def.attack_fast || [7, 7];
    const hits = def.fastHits || 3;
    const val = rand(range) + str;
    return { type: 'attack_multi', value: val, hits, display: `⚡ ${hits}×${val}` };
  }
  if (key === 'attack_defend') {
    const cfg = def.attack_defend || { attack: [10, 10], defend: [8, 8] };
    const atk = rand(cfg.attack) + str;
    const blk = rand(cfg.defend);
    return { type: 'attack_defend', attack: atk, defend: blk, display: `⚔ ${atk} · 🛡 ${blk}` };
  }
  if (key === 'attack_judgment') {
    const cfg = def.attack_judgment || { damage: [35, 35] };
    const val = rand(cfg.damage) + str;
    return { type: 'attack', value: val, ignoreBlock: !!cfg.ignoreBlock, display: `⚖ 终焉 ${val}` };
  }
  if (key === 'form_attack') {
    const form = enemy.moonForm || 'newMoon';
    if (form === 'fullMoon') {
      const cfg = def.fullMoon || { attack_big: [22, 22] };
      const val = rand(cfg.attack_big) + str;
      return { type: 'attack_big', value: val, display: `🌕 月蚀重击 ${val}` };
    }
    const cfg = def.newMoon || { attack_multi: [8, 8], hits: 2 };
    const val = rand(cfg.attack_multi) + str;
    const hits = cfg.hits || 2;
    return { type: 'attack_multi', value: val, hits, display: `🌑 暗影连弹 ${hits}×${val}` };
  }
  if (key === 'special_drain') {
    const ch = enemy.charge || 0;
    const val = ch * 2 + str;
    return { type: 'special_drain', value: val, consumeCharge: true, display: `🌀 能量倾泻 ${val}` };
  }
  if (key === 'special_nova') {
    const cfg = def.special_nova || { perCharge: 2 };
    const ch = enemy.charge || 0;
    const val = ch * (cfg.perCharge || 2) + str;
    return { type: 'special_nova', value: val, consumeCharge: cfg.consumeCharge !== false, display: `✦ 新星 ${val}` };
  }
  if (key === 'special_howl') {
    return { type: 'special_howl', buff: def.special_howl?.buffAll || { strength: 3 }, display: '🐺 月嚎' };
  }
  if (key === 'attack_heal') {
    const cfg = def.attack_heal || { damage: [12, 12], heal: [7, 7] };
    return {
      type: 'attack_heal',
      value: rand(cfg.damage) + str,
      heal: rand(cfg.heal),
      display: `⚔ ${rand(cfg.damage)} · 💚 ${rand(cfg.heal)}`,
    };
  }
  if (key === 'special_shockwave') {
    const cfg = def.special_shockwave || { damage: [15, 15] };
    const val = rand(cfg.damage) + str;
    return { type: 'special_shockwave', value: val, display: `💥 全屏 ${val}` };
  }
  if (key === 'special_forecast') {
    return { type: 'special_forecast', multiplier: def.special_forecast?.damageMultiplier || 3, display: '🔮 预言' };
  }
  return null;
}

/** 按 Boss 阶段 / 月蚀形态返回当前意图循环 */
export function getEnemyIntentKeys(def, enemy) {
  if (!def) return ['attack'];
  if (enemy.id === 'abyss_core') {
    if (enemy.phase >= 3) return def.phase3Intents || def.intents;
    if (enemy.phase >= 2) return def.phase2Intents || def.intents;
    return def.intents;
  }
  if (enemy.phase >= 2 && def.phase2Intents) return def.phase2Intents;
  return def.intents;
}

export function tickEclipseWitchForm(enemy, def) {
  if (enemy.id !== 'eclipse_witch') return;
  const cycle = enemy.phase >= 2 ? 1 : (def.formCycle || 2);
  enemy.formCounter = (enemy.formCounter || 0) + 1;
  if (!enemy.moonForm) enemy.moonForm = 'newMoon';
  if (enemy.formCounter >= cycle) {
    enemy.formCounter = 0;
    enemy.moonForm = enemy.moonForm === 'fullMoon' ? 'newMoon' : 'fullMoon';
    const formDef = enemy.moonForm === 'fullMoon' ? def.fullMoon : def.newMoon;
    if (formDef?.strength) enemy.statuses.strength = formDef.strength;
    if (formDef?.dexterity) enemy.statuses.dexterity = formDef.dexterity;
  }
}

export function executeGddIntent(combat, game, enemy, intent, helpers) {
  const p = combat.player;
  const { dealDamageToPlayer, applyDebuffToPlayer, addLog, makeCardFn, spawnMinion } = helpers;

  switch (intent.type) {
    case 'attack_debuff':
      dealDamageToPlayer(combat, game, enemy, intent.value);
      applyDebuffToPlayer(p, intent.debuff);
      break;
    case 'corruption_discard':
    case 'corruption_hand': {
      dealDamageToPlayer(combat, game, enemy, intent.value);
      const pile = intent.target === 'hand' ? p.hand : p.discard;
      for (let i = 0; i < (intent.corruption || 1); i++) {
        pile.push(makeCardFn('corruption_mark'));
      }
      addLog(combat, `获得 ${intent.corruption} 张腐化印记`);
      break;
    }
    case 'clear_resonance':
      if (combat.resonance) {
        combat.resonance.sun = 0;
        combat.resonance.moon = 0;
        combat.resonance.star = 0;
        combat.resonance.lastAttr = null;
        addLog(combat, '共鸣层数被清除！');
      }
      break;
    case 'charge':
      enemy.charge = (enemy.charge || 0) + (intent.stacks || 1);
      addLog(combat, `${enemy.name} 充能 → ${enemy.charge}`);
      break;
    case 'special_beam': {
      dealDamageToPlayer(combat, game, enemy, intent.value);
      if (intent.consumeCharge) enemy.charge = 0;
      break;
    }
    case 'special_sun_burst': {
      const res = enemy.sunResonance || 0;
      if (!intent.requiresResonance || res >= intent.requiresResonance) {
        dealDamageToPlayer(combat, game, enemy, intent.value);
        enemy.sunResonance = 0;
      } else {
        addLog(combat, `${enemy.name} 阳炎未就绪`);
      }
      break;
    }
    case 'opening_shield':
      if (!enemy.openingDone) {
        enemy.block += intent.block || 30;
        enemy.statuses.strength = (enemy.statuses.strength || 0) + (intent.strength || 3);
        enemy.openingDone = true;
        enemy.openingTurns = intent.turns || 3;
        addLog(combat, `${enemy.name} 获得日蚀护盾`);
      }
      break;
    case 'summon_minion':
      spawnMinion?.(combat, intent.id, intent.hp || 15, enemy.index);
      break;
    case 'buff_ally': {
      const allies = combat.enemies.filter(e => e.hp > 0 && e.index !== enemy.index);
      const ally = allies[0];
      if (ally) {
        ally.block += intent.block || 6;
        ally.statuses.strength = (ally.statuses.strength || 0) + (intent.strength || 2);
      } else {
        enemy.block += intent.block || 5;
      }
      break;
    }
    case 'attack_discard': {
      dealDamageToPlayer(combat, game, enemy, intent.value);
      if (p.hand.length) {
        p.discard.push(p.hand.splice(Math.floor(Math.random() * p.hand.length), 1)[0]);
        addLog(combat, '随机弃置 1 张手牌');
      }
      break;
    }
    case 'add_deep_corruption':
      p.hand.push(makeCardFn('deep_corruption'));
      addLog(combat, '获得深度腐化');
      break;
    case 'attack_defend':
      enemy.block += intent.defend || 0;
      dealDamageToPlayer(combat, game, enemy, intent.attack || 0);
      addLog(combat, `${enemy.name} 攻击并防御`);
      break;
    case 'special_drain': {
      dealDamageToPlayer(combat, game, enemy, intent.value || 0);
      if (intent.consumeCharge) enemy.charge = 0;
      p.statuses.void_corruption = (p.statuses.void_corruption || 0) + 1;
      addLog(combat, '虚空腐蚀 +1');
      break;
    }
    case 'special_nova': {
      for (const e of combat.enemies) {
        if (e.hp > 0) dealDamageToPlayer(combat, game, enemy, intent.value || 0);
      }
      if (intent.consumeCharge) enemy.charge = 0;
      break;
    }
    case 'special_howl':
      for (const e of combat.enemies) {
        if (e.hp > 0) {
          const b = intent.buff || { strength: 3 };
          for (const [k, v] of Object.entries(b)) e.statuses[k] = (e.statuses[k] || 0) + v;
        }
      }
      addLog(combat, '月嚎：全体敌人强化');
      break;
    case 'attack_heal':
      dealDamageToPlayer(combat, game, enemy, intent.value || 0);
      enemy.hp = Math.min(enemy.maxHp, enemy.hp + (intent.heal || 0));
      addLog(combat, `${enemy.name} 攻击并回复 ${intent.heal} 生命`);
      break;
    case 'special_shockwave': {
      for (let i = 0; i < combat.enemies.length; i++) {
        if (combat.enemies[i].hp > 0) dealDamageToPlayer(combat, game, enemy, intent.value || 15);
      }
      enemy.charge = 0;
      break;
    }
    case 'special_forecast': {
      const hand = combat.player.hand;
      let maxCost = 0;
      for (const c of hand) maxCost = Math.max(maxCost, c.cost || 0);
      const dmg = maxCost * (intent.multiplier || 3) + str;
      dealDamageToPlayer(combat, game, enemy, dmg);
      addLog(combat, `预言：最高费 ${maxCost} → ${dmg} 伤害`);
      break;
    }
    default:
      return false;
  }
  return true;
}

function rand(range) {
  if (!Array.isArray(range)) return range;
  return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
}
