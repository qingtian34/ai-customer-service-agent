/** 随机事件 — 18+ 个 */
export const EVENTS = [
  { id: 'golden_shrine', name: '黄金神龛', desc: '一尊散发金光的古老神龛，低语着财富与代价。', choices: [
    { text: '祈祷 (+100 金币)', effect: { gold: 100 } },
    { text: '献祭 (-5 HP, +150 金币)', effect: { hp: -5, gold: 150 } },
    { text: '离开', effect: {} },
  ]},
  { id: 'wounded_warrior', name: '负伤战士', desc: '一名战士靠在墙边，鲜血从铠甲缝隙渗出。', choices: [
    { text: '给予药水 (-10 HP, 获得稀有遗物)', effect: { hp: -10, relic: 'rare' } },
    { text: '抢劫 (+50 金币, 获得诅咒)', effect: { gold: 50, addCurse: 'doubt' } },
    { text: '无视', effect: {} },
  ]},
  { id: 'living_wall', name: '活墙', desc: '墙壁在呼吸，脉络在砖缝间搏动。', choices: [
    { text: '触摸 (升级一张牌)', effect: { upgrade: 1 } },
    { text: '挖掘 (+75 金币)', effect: { gold: 75 } },
    { text: '离开', effect: {} },
  ]},
  { id: 'bonfire_spirits', name: '篝火精灵', desc: '温暖的精灵在篝火旁起舞，歌声抚慰心灵。', choices: [
    { text: '献上卡牌 (移除一张, +10 HP)', effect: { removeCard: 1, heal: 10 } },
    { text: '加入舞蹈 (+3 最大生命)', effect: { maxHp: 3 } },
    { text: '离开', effect: {} },
  ]},
  { id: 'mind_bloom', name: '心灵绽放', desc: '奇异花朵释放孢子，你的思绪异常清晰。', choices: [
    { text: '吸入花粉 (升级全部, -50% HP)', effect: { upgradeAll: true, hpPercent: -0.5 } },
    { text: '离开', effect: {} },
  ]},
  { id: 'scrap_ooze', name: '废料软泥', desc: '一滩软泥吞噬着金属碎片，发出咕噜声。', choices: [
    { text: '伸手进去 (移除2张牌, -3 HP)', effect: { removeCard: 2, hp: -3 } },
    { text: '用金币引诱 (+随机遗物, -75 金币)', effect: { gold: -75, relic: 'random' } },
    { text: '离开', effect: {} },
  ]},
  { id: 'match_keep', name: '火柴Keeper', desc: '一个裹在毯子里的人兜售着神秘的火柴。', choices: [
    { text: '买一根 (-15 金币, +随机药水)', effect: { gold: -15, potion: 1 } },
    { text: '买全部 (-50 金币, +3 药水)', effect: { gold: -50, potion: 3 } },
    { text: '离开', effect: {} },
  ]},
  { id: 'wheel_of_change', name: '变化之轮', desc: '一个巨大的转盘，上面写满未知的命运。', choices: [
    { text: '转动 (随机效果)', effect: { wheel: true } },
    { text: '离开', effect: {} },
  ]},
  { id: 'face_trader', name: '换脸者', desc: '兜帽下没有面孔，只有虚空。', choices: [
    { text: '看脸 (-10% HP, +稀有遗物)', effect: { hpPercent: -0.1, relic: 'rare' } },
    { text: '给金币 (-50 金币, +5 最大生命)', effect: { gold: -50, maxHp: 5 } },
    { text: '离开', effect: {} },
  ]},
  { id: 'nest', name: '巢穴', desc: '巨大的鸟巢中传来尖锐的鸣叫。', choices: [
    { text: '偷蛋 (+随机卡牌, 精英战)', effect: { card: 'random', eliteFight: true } },
    { text: '留下食物 (-20 金币, +2 力量)', effect: { gold: -20, strength: 2 } },
    { text: '离开', effect: {} },
  ]},
  { id: 'tome_of_war', name: '战争之书', desc: '厚重的典籍记载着古老的战斗技巧。', choices: [
    { text: '阅读 (升级2张牌)', effect: { upgrade: 2 } },
    { text: '撕毁 (+150 金币, 获得诅咒)', effect: { gold: 150, addCurse: 'curse_decay' } },
    { text: '离开', effect: {} },
  ]},
  { id: 'cursed_tome', name: '诅咒典籍', desc: '黑色封皮的书本，似乎有生命。', choices: [
    { text: '阅读 (+2 随机卡牌, +2 诅咒)', effect: { cards: 2, curses: 2 } },
    { text: '烧掉 (+30 金币)', effect: { gold: 30 } },
    { text: '离开', effect: {} },
  ]},
  { id: 'big_fish', name: '巨鱼', desc: '水池中有一条巨大的鱼，注视着你。', choices: [
    { text: '钓鱼 (+随机遗物)', effect: { relic: 'random' } },
    { text: '扔回金币 (-20 金币, +15 HP)', effect: { gold: -20, heal: 15 } },
    { text: '离开', effect: {} },
  ]},
  { id: 'cleric', name: '牧师', desc: '一位流浪牧师提供神圣的服务。', choices: [
    { text: '治疗 (+30 HP, -50 金币)', effect: { heal: 30, gold: -50 } },
    { text: '净化 (移除1张牌, -50 金币)', effect: { removeCard: 1, gold: -50 } },
    { text: '离开', effect: {} },
  ]},
  { id: 'shrine_of_paper', name: '纸之神龛', desc: '纸片如雪花飘落，汇聚成神秘符号。', choices: [
    { text: '写字 (升级1张, +1 诅咒)', effect: { upgrade: 1, addCurse: 'doubt' } },
    { text: '撕碎 (+40 金币)', effect: { gold: 40 } },
    { text: '离开', effect: {} },
  ]},
  { id: 'vampires', name: '吸血鬼', desc: '三个苍白的身影从阴影中浮现。', choices: [
    { text: '接受 (-30% HP, 移除全部打击, +咬痕)', effect: { hpPercent: -0.3, removeStrike: true, relic: 'vampire_bite' } },
    { text: '拒绝 (战斗)', effect: { fight: 'vampire' } },
    { text: '用血瓶换 (+血瓶效果)', effect: { removeRelic: 'blood_vial', gold: 100 } },
  ]},
  { id: 'upgrade_shrine', name: '升级神龛', desc: '神圣的光芒笼罩着这座小型神龛。', choices: [
    { text: '祈祷 (升级1张牌)', effect: { upgrade: 1 } },
    { text: '深度祈祷 (升级2张, -8 HP)', effect: { upgrade: 2, hp: -8 } },
    { text: '离开', effect: {} },
  ]},
  { id: 'potion_courier', name: '药水商队', desc: '旅行商人展示着五颜六色的瓶子。', choices: [
    { text: '购买 (-40 金币, +2 药水)', effect: { gold: -40, potion: 2 } },
    { text: '以物易物 (移除1张, +1 药水)', effect: { removeCard: 1, potion: 1 } },
    { text: '离开', effect: {} },
  ]},
];

export const WHEEL_OUTCOMES = [
  { text: '大奖！+100 金币', effect: { gold: 100 } },
  { text: '治疗！+20 HP', effect: { heal: 20 } },
  { text: '诅咒！获得疑虑', effect: { addCurse: 'doubt' } },
  { text: '升级！', effect: { upgrade: 1 } },
  { text: '受伤！-10 HP', effect: { hp: -10 } },
  { text: '遗物！', effect: { relic: 'random' } },
];
