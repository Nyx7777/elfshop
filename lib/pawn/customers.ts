import { catalog } from './catalog.ts';
import { rememberVisibleGoods } from './discovery.ts';
import { value } from './inventory.ts';
import { pick, random } from './random.ts';
import type { Faction, Goods, Shop, Visit } from './types.ts';

const people: Record<Faction, [string, string, number][]> = {
  guild: [
    ['罗恩', '新手冒险者', 2],
    ['布隆', '矮人锻造师', 0],
    ['米拉', '林间采药人', 3],
    ['赫克', '退役骑士', 2],
    ['塔莉', '精灵猎手', -1],
  ],
  academy: [
    ['诺伊', '月塔学徒', 5],
    ['伊芙', '旅行法师', 3],
    ['奥斯', '古物收藏家', 2],
  ],
  night: [
    ['薇斯', '灰鸦信使', 1],
    ['阿什', '魔族行商', 4],
    ['索恩', '地下掮客', 0],
  ],
};
export function makeGoods(s: Shop, itemId: string, clean = false): Goods {
  const d = catalog[itemId];
  return {
    uid: s.serial++,
    itemId,
    condition: clean
      ? 100
      : d.repairable
        ? pick(s, [35, 50, 65, 80, 95])
        : pick(s, [75, 90, 100]),
    authentic:
      clean || random(s) > (d.magical || itemId === 'crown' ? 0.22 : 0.04),
    cursed: !clean && !!d.magical && random(s) < 0.22,
    inspected: clean,
    scanned: clean,
    paid: 0,
    x: 0,
    y: 0,
    rotated: false,
    zone: 'shop',
    listed: false,
  };
}
function base(s: Shop, faction: Faction): Visit {
  const [name, role, portrait] = pick(s, people[faction]);
  return {
    id: s.serial++,
    name,
    role,
    portrait,
    faction,
    kind: 'seller',
    line: '',
    clue: '',
    ask: 0,
    floor: 0,
    budget: 0,
    category: 'any',
    minCondition: 0,
    thief: false,
    observed: false,
    patience: 3,
    resolved: false,
  };
}
function stockPool(s: Shop, faction: Faction): string[] {
  if (faction === 'night') return ['core', 'grimoire', 'blood', 'crown'];
  if (faction === 'academy')
    return ['wand', 'crystal', 'charm', 'ring', 'crown'];
  return ['sword', 'armor', 'bow', 'shield', 'potion', 'compass'];
}
export function generateVisit(s: Shop): Visit {
  const primary: Faction =
    s.sign === 'magic' ? 'academy' : s.sign === 'black' ? 'night' : 'guild';
  const faction =
    random(s) < (s.sign === 'general' ? 0.45 : 0.78)
      ? primary
      : pick(
          s,
          s.skills.black
            ? (['guild', 'academy', 'night'] as const)
            : (['guild', 'academy'] as const),
        );
  const v = base(s, faction),
    roll = random(s);
  const serviceKey =
    s.sign === 'repair' ? 'repair' : s.sign === 'magic' ? 'magic' : null;
  const serviceChance =
    serviceKey && s.skills[serviceKey]
      ? s.intent === 'service'
        ? 0.68
        : 0.24
      : 0;
  if (roll < serviceChance) {
    v.kind = 'service';
    v.service = serviceKey!;
    v.goods = makeGoods(
      s,
      serviceKey === 'repair'
        ? pick(s, ['sword', 'shield', 'bow'])
        : pick(s, ['wand', 'crystal', 'charm']),
    );
    v.ask =
      serviceKey === 'repair'
        ? 65 + s.skills.repair * 15
        : 55 + s.skills.magic * 15;
    v.line =
      serviceKey === 'repair'
        ? `听说你会修装备。修好它，我付 ${v.ask} 金币。材料你来准备。`
        : `替我查明真假和诅咒，鉴定费 ${v.ask} 金币。东西我带走。`;
  } else if (
    random(s) < (s.intent === 'sell' ? 0.8 : s.intent === 'buy' ? 0.18 : 0.48)
  ) {
    v.kind = 'buyer';
    v.category =
      faction === 'night'
        ? 'any'
        : faction === 'academy'
          ? pick(s, ['arcane', 'relic'] as const)
          : pick(s, ['gear', 'gear', 'supply'] as const);
    v.budget = pick(
      s,
      faction === 'night' ? [260, 380, 480, 650] : [120, 180, 260, 380, 480],
    );
    v.minCondition = faction === 'guild' ? pick(s, [30, 60, 80]) : 0;
    v.floor = Math.round(
      (faction === 'night' ? 115 : 88) +
        random(s) * 32 +
        Math.min(12, s.reputation[faction]),
    );
    v.line =
      faction === 'night'
        ? `灰鸦介绍我来的。好货可以拿出来谈，最多 ${v.budget} 金币。`
        : `我想找${v.category === 'gear' ? '能上路的装备' : v.category === 'supply' ? '恢复补给' : v.category === 'relic' ? '旧时代遗物' : '有真魔力的物件'}，预算 ${v.budget} 金币。`;
  } else {
    v.goods = makeGoods(s, pick(s, stockPool(s, faction)));
    v.kind = s.day >= 2 && random(s) < 0.22 ? 'pawn' : 'seller';
    const apparent = Math.round(
      catalog[v.goods.itemId].value * (0.35 + (0.65 * v.goods.condition) / 100),
    );
    v.ask = Math.round(
      apparent * (v.kind === 'pawn' ? 0.45 : faction === 'night' ? 0.4 : 0.62),
    );
    v.floor = Math.round(v.ask * (0.72 + random(s) * 0.15));
    v.line =
      v.kind === 'pawn'
        ? `借我 ${v.ask} 金币，三天后赎。我知道要付两成利息，请替我留好。`
        : `这件东西想卖 ${v.ask} 金币。你可以先看看，价钱还可以谈。`;
  }
  v.thief = s.day >= 4 && random(s) < 0.13;
  v.clue = v.thief
    ? '他几次绕到货架旁，袖口有细长的铁钩；问价时，眼睛却盯着另一件货。'
    : pick(s, [
        '他把旅包放在脚边，认真看着柜台上的东西。',
        '他递出公会凭据，谈价时有些犹豫，但没有靠近货架。',
        '他频频看向门外的马车，似乎真的赶时间。',
      ]);
  return v;
}
function storyVisit(s: Shop): Visit | null {
  if (s.day === 1 && !s.flags.includes('elyn-arrived')) {
    const v = base(s, 'guild');
    s.flags.push('elyn-arrived');
    return {
      ...v,
      name: '艾琳',
      role: '远行的精灵',
      portrait: -1,
      kind: 'pawn',
      goods: makeGoods(s, 'pendant', true),
      ask: 100,
      floor: 85,
      story: 'elyn',
      line: '借我一百金币，好吗？五天后我来赎。这是他留下的月见草……我想去看看他答应过的花海。',
      clue: '她反复摩挲银链。说到五天后时，她认真地点了一下头。',
    };
  }
  const routes = [
    {
      key: 'repair',
      faction: 'guild',
      flag: 'bron-job',
      name: '布隆',
      role: '带来老兵佩剑的铁匠',
      portrait: 0,
      item: 'sword',
      line: '这把剑属于一位老兵。把它修好，让他的孙女带着出发。工钱 130 金币。',
      fee: 130,
    },
    {
      key: 'magic',
      faction: 'academy',
      flag: 'noi-job',
      name: '诺伊',
      role: '第一次独立带队的学徒',
      portrait: 5,
      item: 'charm',
      line: '出发前，想请你检查我做的护身符。我攒了 120 金币，不能让队友戴着坏掉的魔法上路。',
      fee: 120,
    },
  ] as const;
  for (const r of routes)
    if (
      s.skills[r.key] &&
      s.reputation[r.faction] >= 8 &&
      !s.flags.includes(r.flag)
    ) {
      s.flags.push(r.flag);
      const v = base(s, r.faction);
      return {
        ...v,
        name: r.name,
        role: r.role,
        portrait: r.portrait,
        kind: 'service',
        service: r.key,
        goods: {
          ...makeGoods(s, r.item, r.key === 'magic'),
          inspected: false,
          scanned: false,
        },
        story: r.flag,
        ask: r.fee,
        line: r.line,
        clue: '这是熟客专程带来的委托。他愿意把东西交到你手里。',
      };
    }
  if (
    s.skills.black &&
    s.reputation.night >= 8 &&
    !s.flags.includes('vis-job')
  ) {
    s.flags.push('vis-job');
    const v = base(s, 'night');
    return {
      ...v,
      name: '薇斯',
      role: '替城外工棚采购的信使',
      portrait: 1,
      kind: 'buyer',
      category: 'arcane',
      budget: 450,
      floor: 145,
      story: 'vis-job',
      line: '工棚的暖炉停了。我想买一颗真正的绯红魔核，最多 450 金币。你可以不接这笔生意。',
      clue: '她没有压低声音。这次不是为了倒卖，她手上有冻裂的伤口。',
    };
  }
  return null;
}
export function openDay(s: Shop) {
  s.visits = [];
  s.cursor = 0;
  for (const c of s.contracts)
    if ((c.status === 'active' || c.status === 'overdue') && c.due <= s.day) {
      const v = base(s, c.faction);
      s.visits.push({
        ...v,
        name: c.customer,
        role: c.reliable ? '按约赎当' : '到期契约',
        kind: 'redeem',
        contractId: c.id,
        story: c.story,
        line: c.reliable
          ? `按约来赎回我的东西。本金和利息，一共 ${c.principal + c.fee} 金币。`
          : c.story === 'elyn'
            ? '信使带来艾琳的便笺：「花海比我想的更远。能再等我一天吗？」'
            : '客人今天没来，捎话说还差一点路费。可以宽限一天，也可以按契约转为死当。',
        clue: '账本里保留着签订契约时的约定。',
      });
    }
  const story = storyVisit(s);
  if (story) s.visits.push(story);
  const count = s.day < 3 ? 4 : 6;
  while (s.visits.length < count) s.visits.push(generateVisit(s));
  rememberVisibleGoods(s);
}
export function buyerAccepts(s: Shop, v: Visit, g: Goods): string | null {
  const d = catalog[g.itemId];
  if (
    v.story === 'vis-job' &&
    (g.itemId !== 'core' || !g.authentic || g.cursed)
  )
    return '薇斯需要一颗真正、无诅咒的绯红魔核。';
  if (d.illegal && (v.faction !== 'night' || !s.skills.black))
    return '这位客人不接这类禁品。';
  if (v.category !== 'any' && d.category !== v.category)
    return '这不是客人正在寻找的类别。';
  if (g.condition < v.minCondition)
    return '成色达不到客人的要求，先修复或换一件。';
  if (v.faction === 'academy' && (!g.authentic || g.cursed))
    return '法师试了试魔力，拒绝了这件有问题的货物。';
  return null;
}
export function buyerCeiling(s: Shop, v: Visit, g: Goods) {
  return Math.min(
    v.budget,
    Math.round(
      ((value(g) * v.floor) / 100) *
        (catalog[g.itemId].illegal && s.skills.black >= 2 ? 1.15 : 1),
    ),
  );
}
