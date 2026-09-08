import type { ItemDef, Specialty, Faction } from './types.ts';

export const catalog: Record<string, ItemDef> = {
  sword: {
    id: 'sword',
    name: '旧骑士剑',
    icon: '⚔',
    category: 'gear',
    value: 180,
    w: 3,
    h: 1,
    repairable: true,
    description: '精钢剑刃，剑格上的旧徽记已经磨平。',
  },
  armor: {
    id: 'armor',
    name: '旅行板甲',
    icon: '♜',
    category: 'gear',
    value: 360,
    w: 2,
    h: 3,
    repairable: true,
    description: '沉重但可靠。修好后能陪人走过许多险路。',
  },
  bow: {
    id: 'bow',
    name: '精灵猎弓',
    icon: '➶',
    category: 'gear',
    value: 230,
    w: 1,
    h: 3,
    repairable: true,
    description: '弓背是百年白木，弦上还带着森林的气息。',
  },
  shield: {
    id: 'shield',
    name: '橡木圆盾',
    icon: '◉',
    category: 'gear',
    value: 145,
    w: 2,
    h: 2,
    repairable: true,
    description: '皮带与金属包边决定它能挡住多少次撞击。',
  },
  wand: {
    id: 'wand',
    name: '星银法杖',
    icon: '✦',
    category: 'arcane',
    value: 270,
    w: 1,
    h: 3,
    magical: true,
    description: '杖芯可能保存着法术，也可能只是一根空木头。',
  },
  crystal: {
    id: 'crystal',
    name: '月相晶石',
    icon: '◆',
    category: 'arcane',
    value: 155,
    w: 2,
    h: 1,
    magical: true,
    description: '光芒来自月相，还是一层会褪色的幻术？',
  },
  charm: {
    id: 'charm',
    name: '手缝护身符',
    icon: '✥',
    category: 'arcane',
    value: 95,
    w: 1,
    h: 1,
    magical: true,
    description: '针脚有些歪，里面的守护术未必也是假的。',
  },
  pendant: {
    id: 'pendant',
    name: '月见草吊坠',
    icon: '❦',
    category: 'relic',
    value: 210,
    w: 1,
    h: 1,
    magical: true,
    description: '琥珀里封着一朵永远不会凋谢的小花。',
  },
  ring: {
    id: 'ring',
    name: '归途戒指',
    icon: '◎',
    category: 'relic',
    value: 150,
    w: 1,
    h: 1,
    magical: true,
    description: '磨损的星银戒圈上，刻着一个家的坐标。',
  },
  crown: {
    id: 'crown',
    name: '旧王朝金冠',
    icon: '♛',
    category: 'relic',
    value: 290,
    w: 2,
    h: 2,
    description: '卖家说它来自王室。金色的表面还不能证明什么。',
  },
  potion: {
    id: 'potion',
    name: '净化月露',
    icon: '♧',
    category: 'supply',
    value: 72,
    w: 1,
    h: 1,
    description: '冒险者常备的恢复药，一瓶一个位置。',
  },
  compass: {
    id: 'compass',
    name: '星轨罗盘',
    icon: '✵',
    category: 'gear',
    value: 130,
    w: 2,
    h: 1,
    repairable: true,
    description: '小小齿轮指向北方，也会因为锈蚀偏离方向。',
  },
  core: {
    id: 'core',
    name: '绯红魔核',
    icon: '◈',
    category: 'arcane',
    value: 260,
    w: 2,
    h: 2,
    magical: true,
    illegal: true,
    description: '能够驱动廉价暖炉，也是卫队禁止流通的魔材。',
  },
  grimoire: {
    id: 'grimoire',
    name: '逆时禁书',
    icon: '▤',
    category: 'arcane',
    value: 340,
    w: 2,
    h: 2,
    magical: true,
    illegal: true,
    description: '让旧物回到昨天的术式，代价写在最后一页。',
  },
  blood: {
    id: 'blood',
    name: '赤月精粹',
    icon: '♦',
    category: 'supply',
    value: 195,
    w: 1,
    h: 2,
    magical: true,
    illegal: true,
    description: '没有商会封印的魔力药剂，地下买家愿意出高价。',
  },
};
export const specialties: Record<
  Specialty,
  {
    name: string;
    teacher: string;
    cost: number;
    advanced: number;
    description: string;
  }
> = {
  repair: {
    name: '装备修复',
    teacher: '布隆的工作台',
    cost: 150,
    advanced: 340,
    description: '学习修复，购买工具；接维修委托，也能翻新自己的旧装备。',
  },
  magic: {
    name: '魔法鉴定',
    teacher: '诺伊的鉴魔课程',
    cost: 180,
    advanced: 360,
    description: '辨别魔具真假与诅咒，承接收费鉴定；进阶后可净化诅咒。',
  },
  black: {
    name: '黑市门路',
    teacher: '薇斯的引荐',
    cost: 160,
    advanced: 320,
    description: '获得地下交易资格；进阶后能卖出更好的黑市价格。',
  },
};
export const factionNames: Record<Faction, string> = {
  guild: '冒险者公会',
  academy: '月塔学会',
  night: '灰鸦夜市',
};
export const categoryNames = {
  gear: '装备',
  arcane: '魔具',
  relic: '遗物',
  supply: '补给',
  any: '各类货物',
};
export const signNames = {
  general: '旧物买卖',
  repair: '兵器修复',
  magic: '魔具鉴定',
  black: '灰鸦暗记',
};
export const intentNames = {
  balanced: '买卖兼营',
  buy: '重点收货',
  sell: '招揽买家',
  service: '承接委托',
};
export const upgrades: Record<
  string,
  { name: string; cost: number; description: string }
> = {
  shelves: {
    name: '扩建货架',
    cost: 240,
    description: '店内从 6×4 格扩为 6×6 格。',
  },
  vault: {
    name: '柜下暗格',
    cost: 160,
    description: '增加 6×2 格隐蔽空间；藏货不能展示，赎当不受影响。',
  },
  bell: {
    name: '货架警铃',
    cost: 130,
    description: '有人靠近货架时给出额外提示，并拦下小偷。',
  },
};
export const DEBT = 3000;
export const EXPENSE = 18;
