import { catalog, DEBT, EXPENSE, specialties, upgrades } from './catalog.ts';
import { buyerAccepts, buyerCeiling, makeGoods, openDay } from './customers.ts';
import { rememberVisibleGoods } from './discovery.ts';
import { findSpace, fits, pledged, repairCost, value } from './inventory.ts';
import { pick, random } from './random.ts';
import type { Action, Goods, Shop, Specialty, Visit } from './types.ts';

export const current = (s: Shop) => s.visits[s.cursor];
const integer = (n: unknown, min = 1, max = 1000000): n is number =>
  typeof n === 'number' && Number.isInteger(n) && n >= min && n <= max;
function money(s: Shop, text: string, delta: number) {
  s.gold += delta;
  s.log.unshift({ day: s.day, text, delta });
  s.log = s.log.slice(0, 300);
}
function remember(s: Shop, text: string) {
  s.journal.unshift({ day: s.day, text });
  s.journal = s.journal.slice(0, 150);
}
function message(s: Shop, text: string) {
  s.message = text;
  return s;
}
function resolve(s: Shop, v: Visit, text: string) {
  v.resolved = true;
  return message(s, text);
}
function reputation(s: Shop, v: Visit, n = 2) {
  s.reputation[v.faction] = Math.max(
    -30,
    Math.min(100, s.reputation[v.faction] + n),
  );
}
function spendEnergy(s: Shop, cost: number) {
  if (s.energy < cost) {
    s.message = '精力不足。可以继续买卖，或打烊后休息。';
    return false;
  }
  s.energy -= cost;
  return true;
}
function inspection(g: Goods) {
  const d = catalog[g.itemId];
  return `外观检查：成色 ${g.condition}%。${!d.magical ? (g.authentic ? '材质与工艺相符。' : '表层下面是廉价材料，是仿品。') : '外表无法确定魔力真假。'}${d.illegal ? '有禁物流通标记，需要地下交易资格。' : ''}`;
}
function scan(g: Goods) {
  return `鉴魔结果：${g.authentic ? '魔力真实' : '幻术仿品'}，${g.cursed ? '附有诅咒，可学习进阶鉴定后净化' : '没有诅咒'}。`;
}
function owned(s: Shop, uid: number): Goods | undefined {
  const g = s.stock.find((x) => x.uid === uid);
  if (!g) {
    s.message = '找不到这件货物。';
    return;
  }
  if (pledged(s, uid)) {
    s.message = '这是客人的抵押物，赎回或转死当前不能出售、加工。';
    return;
  }
  return g;
}
export function freshShop(seed = Math.floor(Math.random() * 4294967296)): Shop {
  const s: Shop = {
    version: 3,
    seed: seed >>> 0,
    day: 1,
    gold: 560,
    debt: DEBT,
    paidDebt: 0,
    energy: 12,
    serial: 1,
    stock: [],
    knownItems: [],
    contracts: [],
    visits: [],
    cursor: 0,
    skills: { repair: 0, magic: 0, black: 0 },
    signs: ['general'],
    sign: 'general',
    intent: 'balanced',
    upgrades: [],
    reputation: { guild: 0, academy: 0, night: 0 },
    sales: { repair: 0, magic: 0, black: 0, general: 0 },
    heat: 0,
    profit: 0,
    greeted: false,
    flags: [],
    log: [{ day: 1, text: '接手店铺后的周转金', delta: 560 }],
    journal: [
      {
        day: 1,
        text: '老掌柜留下钥匙：店铺余款 3,000 金币。每七天至少累计还款 120 金币；日常开支每日 18 金币。路怎么走，由你决定。',
      },
    ],
    report: [],
    message: '先看看柜台上的生意。第一笔发展资金，可以投向工具、课程或货架。',
    ended: false,
    ending: '',
  };
  for (const [itemId, paid] of [
    ['sword', 48],
    ['potion', 32],
    ['charm', 35],
  ] as const) {
    const g = makeGoods(s, itemId, true);
    if (itemId === 'sword') g.condition = 50;
    const placed = findSpace(s, { ...g, paid, listed: true });
    if (placed) s.stock.push(placed);
  }
  openDay(s);
  return s;
}
function security(s: Shop, v: Visit) {
  if (!v.thief) return;
  if (v.observed || s.upgrades.includes('bell')) {
    remember(s, `${v.name}靠近货架时被你察觉，空着手离开了。`);
    s.report.push('你留意了客人的动作，货物没有丢失。');
    return;
  }
  const exposed = s.stock.filter(
    (g) => g.zone === 'shop' && g.listed && !pledged(s, g.uid),
  );
  if (exposed.length) {
    const g = pick(s, exposed);
    s.stock = s.stock.filter((x) => x.uid !== g.uid);
    s.profit -= g.paid;
    s.report.push(
      `清点时发现 ${catalog[g.itemId].name} 被顺走了。观察可疑来客或安装警铃能防盗。`,
    );
    remember(s, `${v.name}离开后，货架上少了${catalog[g.itemId].name}。`);
  }
}
function raid(s: Shop) {
  const seized = s.stock.filter(
    (g) => g.zone === 'shop' && catalog[g.itemId].illegal,
  );
  const fine = seized.length * 45;
  for (const g of seized) {
    const c = pledged(s, g.uid);
    if (c) {
      c.status = 'forfeited';
      s.report.push(
        `抵押物 ${catalog[g.itemId].name} 被没收，你赔偿客人 ${c.principal} 金币。`,
      );
      money(s, '被没收抵押物的赔偿', -c.principal);
    }
    s.stock = s.stock.filter((x) => x.uid !== g.uid);
  }
  if (fine) {
    money(s, '搜查罚金', -fine);
    s.report.push(
      `卫队突然搜查：没收 ${seized.length} 件暴露的禁品，罚金 ${fine} 金币。`,
    );
  } else
    s.report.push(
      '卫队突然搜查，检查了店内货架后离开。暗格里的东西没有被发现。',
    );
  s.heat = Math.max(0, s.heat - 15);
}
export function actShop(state: Shop, action: Action): Shop {
  const s = structuredClone(state);
  if (s.ended && action.type !== 'clearReport') return s;
  const v = current(s);
  const active = v && !v.resolved;
  const counterActions = [
    'inspect',
    'scan',
    'observe',
    'guard',
    'refuse',
    'offer',
    'sell',
    'service',
    'redeem',
    'extend',
    'forfeit',
  ];
  if (counterActions.includes(action.type) && !active)
    return message(s, '这次接待已经结束，请迎接下一位客人。');
  switch (action.type) {
    case 'greet':
      s.greeted = true;
      break;
    case 'clearReport':
      s.report = [];
      break;
    case 'inspect':
      if (!v.goods || v.goods.inspected) return s;
      if (spendEnergy(s, 1)) {
        v.goods.inspected = true;
        message(s, inspection(v.goods));
      }
      break;
    case 'scan':
      if (!v.goods || v.goods.scanned) return s;
      if (!s.skills.magic) return message(s, '需要先花钱学习基础魔法鉴定。');
      if (spendEnergy(s, 2)) {
        v.goods.scanned = true;
        message(s, scan(v.goods));
      }
      break;
    case 'observe':
      if (!v.observed && spendEnergy(s, 1)) {
        v.observed = true;
        message(s, v.clue);
      }
      break;
    case 'guard':
      if (!v.observed) return message(s, '先观察来客，再决定是否请他离开。');
      if (!v.thief) reputation(s, v, -2);
      resolve(
        s,
        v,
        v.thief
          ? '你示意他离开货架。铁钩缩回袖口，他匆匆走了。'
          : '客人收好东西离开了。这次误会损害了关系。',
      );
      break;
    case 'refuse':
      resolve(
        s,
        v,
        v.kind === 'redeem'
          ? '契约暂未处理，明天仍会提醒。'
          : '你婉拒了这笔生意，给下一次机会留出余地。',
      );
      break;
    case 'offer': {
      if (!v.goods || !['seller', 'pawn'].includes(v.kind)) return s;
      if (!integer(action.amount)) return message(s, '报价需为正整数。');
      if (s.gold < action.amount) return message(s, '周转金不足。');
      if (catalog[v.goods.itemId].illegal && !s.skills.black)
        return message(s, '先取得黑市交易资格，才能接这笔禁品生意。');
      const placed = findSpace(s, v.goods);
      if (!placed)
        return message(
          s,
          '没有放得下它的连续空间。整理、旋转或腾出位置后再谈。',
        );
      if (action.amount < v.floor) {
        v.patience--;
        return v.patience <= 0
          ? resolve(s, v, '价格始终没谈拢，客人离开了。')
          : message(s, '客人摇头：再加一点。继续压价可能谈崩。');
      }
      money(
        s,
        `${v.kind === 'pawn' ? '典当放款' : '收购'} · ${v.name} · ${catalog[placed.itemId].name}`,
        -action.amount,
      );
      placed.paid = action.amount;
      placed.listed = false;
      s.stock.push(placed);
      if (v.kind === 'pawn') {
        const days = v.story === 'elyn' ? 5 : 3;
        s.contracts.push({
          id: s.serial++,
          uid: placed.uid,
          customer: v.name,
          faction: v.faction,
          principal: action.amount,
          fee: Math.ceil(action.amount * 0.2),
          due: s.day + days,
          status: 'active',
          extended: false,
          reliable: v.story === 'elyn' ? false : random(s) > 0.24,
          ...(v.story === 'elyn' ? { story: 'elyn' as const } : {}),
        });
        if (v.story === 'elyn')
          remember(
            s,
            '艾琳把月见草吊坠留在柜台上，约定五天后回来。你替她保管，也替自己的钱和货架留出了位置。',
          );
      }
      if (catalog[placed.itemId].illegal) s.heat = Math.min(100, s.heat + 9);
      reputation(s, v);
      resolve(
        s,
        v,
        v.kind === 'pawn'
          ? '契约已签，抵押物入库。到期来访会自动排入客流。'
          : '成交。货物已经入库，记得检查后摆上货架。',
      );
      break;
    }
    case 'sell': {
      if (v.kind !== 'buyer' || !integer(action.amount))
        return message(s, '请输入有效售价。');
      const g = owned(s, action.uid);
      if (!g) return s;
      if (!g.listed || g.zone !== 'shop')
        return message(s, '先把这件货物从暗格取出并摆上货架。');
      const refusal = buyerAccepts(s, v, g);
      if (refusal) return message(s, refusal);
      if (action.amount > buyerCeiling(s, v, g)) {
        v.patience--;
        return v.patience <= 0
          ? resolve(s, v, '客人觉得价格太高，转身离开。')
          : message(
              s,
              `客人还价：「这件东西，我最多出 ${buyerCeiling(s, v, g)} 金币。」`,
            );
      }
      money(s, `出售 · ${v.name} · ${catalog[g.itemId].name}`, action.amount);
      s.profit += action.amount - g.paid;
      s.sales[
        catalog[g.itemId].illegal
          ? 'black'
          : catalog[g.itemId].repairable && g.condition >= 90 && s.skills.repair
            ? 'repair'
            : catalog[g.itemId].magical && g.scanned && s.skills.magic
              ? 'magic'
              : 'general'
      ]++;
      s.stock = s.stock.filter((x) => x.uid !== g.uid);
      reputation(s, v);
      if (catalog[g.itemId].illegal) s.heat = Math.min(100, s.heat + 7);
      if (v.story === 'vis-job') {
        s.flags.push('vis-helped');
        remember(
          s,
          '薇斯带着魔核去了城外。后来送来的便笺上说，那晚工棚终于暖了起来。',
        );
        reputation(s, v, 5);
      }
      resolve(s, v, `成交，收入 ${action.amount} 金币。货架腾出了位置。`);
      break;
    }
    case 'service': {
      if (v.kind !== 'service' || !v.service || !v.goods) return s;
      const skill = v.service;
      if (!s.skills[skill]) return message(s, '还没有学会这门手艺。');
      const cost =
        skill === 'repair' ? repairCost(v.goods, s.skills.repair) : 8;
      if (s.gold < cost) return message(s, '连材料费都不够了，先留出周转金。');
      if (!spendEnergy(s, skill === 'magic' && v.goods.scanned ? 0 : 2))
        return s;
      money(
        s,
        `${skill === 'repair' ? '维修材料' : '鉴定耗材'} · ${v.name}`,
        -cost,
      );
      money(s, `委托工钱 · ${v.name}`, v.ask);
      s.profit += v.ask - cost;
      s.sales[skill]++;
      reputation(s, v);
      const result =
        skill === 'repair' ? '装备已修复，客人当场验收带走。' : scan(v.goods);
      if (v.story) {
        s.flags.push(`${v.story}-done`);
        reputation(s, v, 5);
        remember(
          s,
          v.story === 'bron-job'
            ? '布隆带走修好的老剑。几天后，老兵的孙女捎来第一张平安的明信片。'
            : '你仔细鉴定了诺伊的护身符。小小的守护术是真的，他终于敢带着队友出发。',
        );
      }
      resolve(s, v, `${result} 净赚 ${v.ask - cost} 金币。`);
      break;
    }
    case 'redeem':
    case 'extend':
    case 'forfeit': {
      if (v.kind !== 'redeem') return s;
      const c = s.contracts.find((x) => x.id === v.contractId);
      if (!c || !['active', 'overdue'].includes(c.status))
        return resolve(s, v, '这笔契约已经结清。');
      if (action.type === 'redeem') {
        if (!c.reliable)
          return message(s, '客人尚未凑齐钱，需要决定宽限或转死当。');
        money(s, `赎当 · ${c.customer}`, c.principal + c.fee);
        s.profit += c.fee;
        s.sales.general++;
        c.status = 'redeemed';
        s.stock = s.stock.filter((g) => g.uid !== c.uid);
        reputation(s, v, 3);
        if (c.story === 'elyn') {
          s.flags.push('elyn-home');
          remember(
            s,
            '艾琳赎回了吊坠。「花海还在，谢谢你替我多守了一天。」她答应，以后路过都来坐坐。',
          );
        }
        resolve(s, v, '本金和利息已到账，抵押物归还，空间也腾出来了。');
      } else if (c.reliable || c.due > s.day)
        return message(s, '客人已按约带钱来赎，不能扣下抵押物。');
      else if (action.type === 'extend') {
        if (c.extended) return message(s, '已经宽限过一次。');
        c.extended = true;
        c.reliable = true;
        c.due = s.day + 1;
        c.status = 'active';
        reputation(s, v, 2);
        resolve(s, v, '你多等一天，利息不增加。抵押物继续占用空间。');
      } else {
        c.status = 'forfeited';
        reputation(s, v, -2);
        if (c.story === 'elyn') {
          s.flags.push('elyn-lost');
          remember(
            s,
            '你按契约把吊坠转为死当。艾琳后来得知了这件事，没有再来。',
          );
        }
        resolve(s, v, '抵押物已转为店铺自有库存，可以加工或出售。');
      }
      break;
    }
    case 'next':
      if (!v || !v.resolved) return message(s, '先完成或婉拒当前交易。');
      security(s, v);
      s.cursor++;
      rememberVisibleGoods(s);
      if (s.day >= 4 && s.cursor === 3 && random(s) < 0.1 + s.heat / 180)
        raid(s);
      message(
        s,
        current(s)
          ? '门铃响了，下一位客人来到柜台。'
          : '今天的客人都接待完了。可以整理、学习和还款，再打烊。',
      );
      break;
    case 'move': {
      const g = s.stock.find((x) => x.uid === action.uid);
      if (!g) return s;
      if (
        !['shop', 'vault'].includes(action.zone) ||
        typeof action.rotated !== 'boolean'
      )
        return s;
      const moved = {
        ...g,
        x: action.x,
        y: action.y,
        rotated: action.rotated,
        zone: action.zone,
      };
      if (!fits(s, moved))
        return message(s, '这里放不下：检查边界和其他物品，或旋转后再放。');
      if (moved.zone === 'vault') moved.listed = false;
      Object.assign(g, moved);
      message(s, '摆放完成。');
      break;
    }
    case 'list': {
      const g = owned(s, action.uid);
      if (g) {
        if (g.zone !== 'shop') return message(s, '暗格里的东西不能展示出售。');
        g.listed = !g.listed;
        message(
          s,
          g.listed ? '已摆上货架，接待买家时可以推荐。' : '已撤下展示。',
        );
      }
      break;
    }
    case 'liquidate': {
      const g = owned(s, action.uid);
      if (!g) return s;
      if (catalog[g.itemId].illegal && !s.skills.black)
        return message(s, '处理禁品需要黑市门路。');
      const p = Math.round(value(g) * 0.48);
      money(s, `清仓处理 · ${catalog[g.itemId].name}`, p);
      s.profit += p - g.paid;
      s.stock = s.stock.filter((x) => x.uid !== g.uid);
      message(s, `回收商支付 ${p} 金币。腾出了空间，但让掉了零售利润。`);
      break;
    }
    case 'inspectStock': {
      const g = owned(s, action.uid);
      if (!g || g.inspected) return s;
      if (spendEnergy(s, 1)) {
        g.inspected = true;
        message(s, inspection(g));
      }
      break;
    }
    case 'repair':
    case 'scanStock':
    case 'purify': {
      const g = owned(s, action.uid);
      if (!g) return s;
      const d = catalog[g.itemId];
      if (action.type === 'repair') {
        if (!s.skills.repair) return message(s, '先购买工具并学习基础修复。');
        if (!d.repairable || g.condition >= 100)
          return message(s, '这件物品不需要修复。');
        const cost = repairCost(g, s.skills.repair);
        if (s.gold < cost) return message(s, '维修材料费不足。');
        if (!spendEnergy(s, 2)) return s;
        money(s, `修复 · ${d.name}`, -cost);
        g.paid += cost;
        g.condition = 100;
        g.inspected = true;
        message(
          s,
          `修复完成，材料花费 ${cost} 金币。可以向要求高成色的客人推荐。`,
        );
      } else {
        if (s.skills.magic < (action.type === 'purify' ? 2 : 1))
          return message(s, '需要先学习相应等级的魔法鉴定。');
        if (action.type === 'scanStock' && g.scanned)
          return message(s, '已经鉴定过了。');
        if (action.type === 'purify' && (!g.scanned || !g.cursed))
          return message(s, '先鉴定，确认有诅咒后才需要净化。');
        const cost = action.type === 'purify' ? 25 : 0;
        if (s.gold < cost) return message(s, '净化材料费不足。');
        if (!spendEnergy(s, 2)) return s;
        if (cost) money(s, `净化 · ${d.name}`, -cost);
        g.paid += cost;
        if (action.type === 'purify') g.cursed = false;
        g.scanned = true;
        message(s, action.type === 'purify' ? '诅咒已解除。' : scan(g));
      }
      break;
    }
    case 'learn': {
      if (!Object.hasOwn(specialties, action.key)) return s;
      const skill = action.key,
        level = s.skills[skill],
        d = specialties[skill];
      if (level >= 2) return message(s, '这门手艺已经学到进阶。');
      if (level === 1 && s.sales[skill] < 3)
        return message(s, '先完成三笔相关业务，再学习进阶。');
      const cost = level ? d.advanced : d.cost;
      if (s.gold < cost) return message(s, '学费和工具费不足。');
      money(s, `学习 · ${d.name}${level ? '进阶' : '基础'}`, -cost);
      s.skills[skill]++;
      remember(
        s,
        `你向${d.teacher}支付 ${cost} 金币，开始${level ? '深入' : ''}经营${d.name}。`,
      );
      message(
        s,
        `已经掌握${d.name}${level ? '进阶' : '基础'}。制作相应招牌，可以吸引更多客户。`,
      );
      break;
    }
    case 'makeSign':
      if (!Object.hasOwn(specialties, action.key) || !s.skills[action.key])
        return message(s, '先获得对应的经营能力。');
      if (s.signs.includes(action.key)) return s;
      if (s.gold < 70) return message(s, '制作招牌需要 70 金币。');
      money(s, '制作专业招牌', -70);
      s.signs.push(action.key);
      message(s, '招牌做好了。在开门前选择挂哪一块，可反复使用。');
      break;
    case 'sign':
      if (
        !s.signs.includes(action.sign) ||
        !['balanced', 'buy', 'sell', 'service'].includes(action.intent)
      )
        return s;
      s.sign = action.sign;
      s.intent = action.intent;
      message(s, '招揽方向已设置，将影响明天的新客；预约赎当照常到访。');
      break;
    case 'upgrade': {
      if (
        !Object.hasOwn(upgrades, action.key) ||
        s.upgrades.includes(action.key)
      )
        return s;
      const d = upgrades[action.key];
      if (s.gold < d.cost) return message(s, '建设资金不足。');
      money(s, `建设 · ${d.name}`, -d.cost);
      s.upgrades.push(action.key);
      message(s, `${d.name}已经装好。`);
      break;
    }
    case 'repay': {
      if (
        !integer(action.amount) ||
        action.amount > s.debt ||
        action.amount > s.gold
      )
        return message(s, '还款不能超过剩余贷款和手头现金。');
      money(s, '偿还店铺贷款', -action.amount);
      s.debt -= action.amount;
      s.paidDebt += action.amount;
      if (!s.debt) {
        remember(
          s,
          '最后一笔贷款付清了。地契已经归你，处理完未结典当后，可以为这一周目收尾。',
        );
        message(s, '店铺终于属于你了！可以继续收尾，或在账本里结束本周目。');
      } else
        message(s, `还款 ${action.amount} 金币。剩余贷款 ${s.debt} 金币。`);
      break;
    }
    case 'endDay': {
      if (s.cursor < s.visits.length)
        return message(s, '请先完成或婉拒今天的客人，再打烊。');
      const installment = Math.min(
        s.debt,
        Math.max(0, Math.floor(s.day / 7) * 120 - s.paidDebt),
      );
      if (s.gold < EXPENSE + installment)
        return message(
          s,
          `打烊需 ${EXPENSE + installment} 金币（开支 ${EXPENSE}，到期还款 ${installment}）。可以先清仓腾挪资金；若已无货可卖，可在设置中重新开店。`,
        );
      money(s, '店铺日常开支', -EXPENSE);
      s.report.push(
        `第 ${s.day} 天打烊：日常开支 ${EXPENSE} 金币。货架上的东西会留到明天，不会自动售出。`,
      );
      if (installment) {
        money(s, '到期最低还款', -installment);
        s.debt -= installment;
        s.paidDebt += installment;
        s.report.push(`偿还店铺贷款 ${installment} 金币。`);
      }
      s.day++;
      s.energy = 12;
      s.heat = Math.max(0, s.heat - 4);
      for (const c of s.contracts)
        if (c.status === 'active' && c.due <= s.day && !c.reliable)
          c.status = 'overdue';
      openDay(s);
      message(s, '新的一天。招牌吸引了新的生意，也有人按约回来。');
      break;
    }
    case 'finish': {
      if (s.debt)
        return message(s, '还清店铺贷款后，才能拿到地契并结束本周目。');
      if (s.contracts.some((c) => ['active', 'overdue'].includes(c.status)))
        return message(s, '还有客人的抵押物没有交代，先把典当契约处理完。');
      const best = (Object.keys(s.sales) as (Specialty | 'general')[]).sort(
        (a, b) => s.sales[b] - s.sales[a],
      )[0];
      s.ended = true;
      s.ending = {
        repair: '冒险者信赖的修复铺',
        magic: '月塔街口的鉴魔灯',
        black: '夜色里的灰鸦当铺',
        general: '属于你的暮灯当铺',
      }[best];
      s.report = [
        `第 ${s.day} 天，你把正式的地契挂上墙。店铺的 ${DEBT} 金币贷款已经还清。`,
        `你完成了 ${Object.values(s.sales).reduce((a, b) => a + b, 0)} 笔销售与服务，剩下 ${s.gold} 金币周转金。`,
        ...(s.flags.includes('elyn-home')
          ? [
              '艾琳推门进来，把一束月见草放在柜台上：「以后路过，就来这里坐坐。」',
            ]
          : []),
        ...(s.flags.includes('bron-job-done')
          ? ['布隆送来一块新的磨刀石。那把老剑已经陪年轻的冒险者上路。']
          : []),
        ...(s.flags.includes('noi-job-done')
          ? ['诺伊的明信片到了：护身符挡住了第一道危险的法术，大家都平安。']
          : []),
        ...(s.flags.includes('vis-helped')
          ? ['薇斯没有露面。门口多了一篮来自城外工棚的面包。']
          : []),
        '灯还亮着。这里终于有了你自己的规矩。',
      ];
      break;
    }
  }
  return s;
}
