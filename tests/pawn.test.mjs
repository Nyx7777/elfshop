import test from 'node:test';
import assert from 'node:assert/strict';
import { actShop, current, freshShop } from '../lib/pawn/engine.ts';
import { catalog, DEBT } from '../lib/pawn/catalog.ts';
import {
  makeGoods,
  generateVisit,
  openDay,
  buyerCeiling,
} from '../lib/pawn/customers.ts';
import {
  board,
  dimensions,
  findSpace,
  fits,
  pledged,
  value,
} from '../lib/pawn/inventory.ts';
import { parseShop, validateShop } from '../lib/pawn/save.ts';

function nextDay(s) {
  while (current(s)) {
    if (!current(s).resolved) s = actShop(s, { type: 'refuse' });
    s = actShop(s, { type: 'next' });
  }
  return actShop(s, { type: 'endDay' });
}
function advanceTo(s, day) {
  while (s.day < day) {
    const before = s.day;
    s = nextDay(s);
    assert.ok(s.day > before, s.message);
  }
  return s;
}
function place(s, id, clean = true, zone = 'shop') {
  const g = makeGoods(s, id, clean),
    p = findSpace(s, g, zone);
  assert.ok(p);
  s.stock.push(p);
  return p;
}

test('new game uses independent version, valid spatial inventory and repeatable random seed', () => {
  const s = freshShop(42);
  assert.ok(validateShop(s));
  assert.deepEqual(s, freshShop(42));
  assert.notDeepEqual(s.visits, freshShop(43).visits);
  assert.equal(s.debt, DEBT);
  assert.deepEqual(board(s, 'shop'), [6, 4]);
  assert.equal(parseShop(JSON.stringify(s)).seed, s.seed);
});
test('footprints prevent overlaps and out of bounds, rotation and vault have real dimensions', () => {
  const s = freshShop(4);
  s.stock = [];
  const armor = place(s, 'armor');
  assert.deepEqual(dimensions(armor), [2, 3]);
  assert.equal(fits(s, { ...armor, x: 5 }), false);
  const sword = makeGoods(s, 'sword', true);
  assert.equal(fits(s, { ...sword, x: 0, y: 0 }), false);
  assert.equal(findSpace(s, sword, 'vault'), null);
  s.upgrades.push('vault');
  assert.equal(findSpace(s, armor, 'vault')?.rotated, true);
  assert.equal(
    actShop(s, {
      type: 'move',
      uid: armor.uid,
      x: 0,
      y: 0,
      rotated: false,
      zone: 'vault',
    }).stock[0].zone,
    'shop',
  );
  const moved = actShop(s, {
    type: 'move',
    uid: armor.uid,
    x: 0,
    y: 0,
    rotated: true,
    zone: 'vault',
  });
  assert.equal(moved.stock[0].zone, 'vault');
  assert.ok(validateShop(moved));
});
test('offers reject invalid money, prevent double purchasing and never mutate prior state', () => {
  const s = freshShop(1);
  for (const amount of [NaN, Infinity, -1, 0, 1.5, 1000001])
    assert.equal(actShop(s, { type: 'offer', amount }).gold, s.gold);
  const bought = actShop(s, { type: 'offer', amount: 100 });
  assert.equal(s.stock.length, 3);
  assert.equal(bought.stock.length, 4);
  assert.equal(bought.gold, 460);
  assert.equal(actShop(bought, { type: 'offer', amount: 100 }).gold, 460);
  assert.ok(validateShop(bought));
});
test('full warehouse rejects a purchase without spending money or ending the conversation', () => {
  const s = freshShop(1);
  s.stock = [];
  for (let i = 0; i < 24; i++) place(s, 'potion');
  const next = actShop(s, { type: 'offer', amount: 100 });
  assert.equal(next.gold, s.gold);
  assert.equal(current(next).resolved, false);
  assert.match(next.message, /空间/);
});
test('pledged property cannot be listed, liquidated, scanned or repaired and remains in custody', () => {
  let s = actShop(freshShop(1), { type: 'offer', amount: 100 });
  const uid = s.contracts[0].uid;
  for (const type of ['list', 'liquidate', 'repair', 'scanStock', 'purify']) {
    const next = actShop(s, { type, uid });
    assert.equal(next.gold, s.gold);
    assert.deepEqual(next.stock, s.stock);
    assert.match(next.message, /抵押物/);
  }
  assert.ok(pledged(s, uid));
});
test('Elyn overdue branch extends once and returns money plus interest without duplicating redemption', () => {
  let s = actShop(freshShop(2), { type: 'offer', amount: 100 });
  s = advanceTo(s, 6);
  assert.equal(current(s).kind, 'redeem');
  assert.equal(s.contracts[0].status, 'overdue');
  s = actShop(s, { type: 'extend' });
  assert.equal(s.contracts[0].due, 7);
  s = nextDay(s);
  assert.equal(current(s).kind, 'redeem');
  const gold = s.gold;
  s = actShop(s, { type: 'redeem' });
  assert.equal(s.gold, gold + 120);
  assert.ok(s.flags.includes('elyn-home'));
  assert.equal(s.contracts[0].status, 'redeemed');
  assert.equal(actShop(s, { type: 'redeem' }).gold, s.gold);
  assert.ok(validateShop(s));
});
test('forfeiture releases collateral but honoring an arrived redemption is mandatory', () => {
  let s = actShop(freshShop(3), { type: 'offer', amount: 100 });
  s = advanceTo(s, 6);
  s = actShop(s, { type: 'forfeit' });
  assert.equal(s.contracts[0].status, 'forfeited');
  assert.ok(s.flags.includes('elyn-lost'));
  assert.equal(pledged(s, s.contracts[0].uid), undefined);
  let t = actShop(freshShop(3), { type: 'offer', amount: 100 });
  t.contracts[0].reliable = true;
  t = advanceTo(t, 6);
  t = actShop(t, { type: 'forfeit' });
  assert.equal(t.contracts[0].status, 'active');
  assert.equal(current(t).resolved, false);
});
test('learning and signs cost actual money; a sign changes future traffic, not current appointments', () => {
  let s = freshShop(3);
  assert.equal(actShop(s, { type: 'makeSign', key: 'magic' }).signs.length, 1);
  s = actShop(s, { type: 'learn', key: 'magic' });
  assert.equal(s.gold, 380);
  s = actShop(s, { type: 'makeSign', key: 'magic' });
  assert.equal(s.gold, 310);
  const visits = structuredClone(s.visits);
  s = actShop(s, { type: 'sign', sign: 'magic', intent: 'service' });
  assert.deepEqual(s.visits, visits);
  assert.equal(s.gold, 310);
  s = actShop(s, { type: 'makeSign', key: 'magic' });
  assert.equal(s.gold, 310);
  assert.equal(actShop(s, { type: 'learn', key: 'magic' }).skills.magic, 1);
});
test('sign intent shifts buyers and service customers statistically without guaranteeing a customer', () => {
  const a = freshShop(42),
    b = freshShop(42);
  a.intent = 'sell';
  b.intent = 'buy';
  a.day = b.day = 5;
  let buyersA = 0,
    buyersB = 0;
  for (let i = 0; i < 1000; i++) {
    buyersA += generateVisit(a).kind === 'buyer';
    buyersB += generateVisit(b).kind === 'buyer';
  }
  assert.ok(buyersA > buyersB * 2);
  assert.ok(buyersA < 1000);
  const mage = freshShop(42);
  mage.skills.magic = 1;
  mage.sign = 'magic';
  mage.intent = 'service';
  let jobs = 0;
  for (let i = 0; i < 500; i++) jobs += generateVisit(mage).kind === 'service';
  assert.ok(jobs > 250);
});
test('buyer requires listed matching goods and respects budget, condition, price and repeat guards', () => {
  let s = freshShop(4);
  s = actShop(s, { type: 'refuse' });
  s = actShop(s, { type: 'next' });
  const v = current(s);
  v.kind = 'buyer';
  v.category = 'supply';
  v.budget = 100;
  v.floor = 100;
  v.minCondition = 0;
  v.thief = false;
  const sword = s.stock.find((g) => g.itemId === 'sword'),
    potion = s.stock.find((g) => g.itemId === 'potion');
  assert.equal(
    actShop(s, { type: 'sell', uid: sword.uid, amount: 1 }).gold,
    s.gold,
  );
  assert.equal(
    actShop(s, { type: 'sell', uid: potion.uid, amount: 101 }).gold,
    s.gold,
  );
  const sold = actShop(s, { type: 'sell', uid: potion.uid, amount: 72 });
  assert.equal(sold.gold, s.gold + 72);
  assert.equal(sold.stock.length, s.stock.length - 1);
  assert.equal(
    actShop(sold, { type: 'sell', uid: potion.uid, amount: 72 }).gold,
    sold.gold,
  );
});
test('closing does not sell listed goods or force a day-seven ending; payments credit total debt', () => {
  let s = freshShop(4);
  s.visits.forEach((v) => {
    v.resolved = true;
    v.thief = false;
  });
  s.cursor = s.visits.length;
  const stock = structuredClone(s.stock);
  s = actShop(s, { type: 'endDay' });
  assert.deepEqual(s.stock, stock);
  s = actShop(s, { type: 'repay', amount: 240 });
  const after = s.debt;
  s = advanceTo(s, 8);
  assert.equal(s.ended, false);
  assert.equal(s.debt, after);
  assert.equal(s.paidDebt, 240);
  assert.ok(validateShop(s));
});
test('magic services pay only once, materials and energy count, and advanced purification costs money', () => {
  let s = freshShop(7);
  s.skills.magic = 2;
  const v = current(s);
  v.kind = 'service';
  v.service = 'magic';
  v.ask = 75;
  v.story = undefined;
  v.goods.scanned = false;
  const gold = s.gold;
  s = actShop(s, { type: 'service' });
  assert.equal(s.gold, gold + 67);
  assert.equal(s.energy, 10);
  assert.equal(s.sales.magic, 1);
  assert.equal(actShop(s, { type: 'service' }).gold, s.gold);
  const g = place(s, 'wand');
  g.cursed = true;
  g.scanned = true;
  const before = value(g);
  s = actShop(s, { type: 'purify', uid: g.uid });
  assert.equal(s.gold, gold + 67 - 25);
  assert.ok(value(s.stock.find((x) => x.uid === g.uid)) > before);
  assert.equal(s.energy, 8);
});
test('repair investment yields inventory improvement without free repeated processing', () => {
  let s = freshShop(5);
  const uid = s.stock.find((g) => g.itemId === 'sword').uid;
  assert.equal(actShop(s, { type: 'repair', uid }).energy, 12);
  s = actShop(s, { type: 'learn', key: 'repair' });
  const old = s.stock.find((g) => g.uid === uid),
    before = value(old),
    gold = s.gold;
  s = actShop(s, { type: 'repair', uid });
  assert.ok(s.gold < gold);
  assert.ok(value(s.stock.find((g) => g.uid === uid)) > before);
  assert.equal(s.energy, 10);
  const repeat = actShop(s, { type: 'repair', uid });
  assert.equal(repeat.gold, s.gold);
  assert.equal(repeat.energy, s.energy);
});
test('thief can be intercepted by observation or alarm, collateral is never stolen', () => {
  for (const defense of ['none', 'observe', 'bell']) {
    let s = freshShop(6);
    const v = current(s);
    v.thief = true;
    v.resolved = true;
    if (defense === 'observe') v.observed = true;
    if (defense === 'bell') s.upgrades.push('bell');
    const n = s.stock.length;
    s = actShop(s, { type: 'next' });
    assert.equal(s.stock.length, n - (defense === 'none' ? 1 : 0));
  }
  let s = actShop(freshShop(6), { type: 'offer', amount: 100 });
  s.stock = s.stock.filter((g) => pledged(s, g.uid));
  current(s).thief = true;
  s = actShop(s, { type: 'next' });
  assert.equal(s.stock.length, 1);
});
test('surprise searches seize exposed contraband and leave hidden goods intact', () => {
  let s = freshShop(7);
  s.stock = [];
  s.day = 4;
  s.heat = 100;
  s.upgrades.push('vault');
  const outside = place(s, 'core'),
    inside = place(s, 'blood', true, 'vault');
  s.cursor = 2;
  s.visits.slice(0, 3).forEach((v) => {
    v.resolved = true;
    v.thief = false;
  });
  let hit = false;
  for (let seed = 1; seed < 100 && !hit; seed++) {
    s.seed = seed;
    const next = actShop(s, { type: 'next' });
    if (next.report.some((x) => x.includes('搜查'))) {
      assert.equal(
        next.stock.some((g) => g.uid === outside.uid),
        false,
      );
      assert.equal(
        next.stock.some((g) => g.uid === inside.uid),
        true,
      );
      assert.equal(next.gold, s.gold - 45);
      hit = true;
    }
  }
  assert.ok(hit);
});
test('paid-off loans unlock player-controlled ending only after outstanding contracts settle', () => {
  let s = actShop(freshShop(1), { type: 'offer', amount: 100 });
  s.gold = 5000;
  assert.equal(actShop(s, { type: 'finish' }).ended, false);
  s = actShop(s, { type: 'repay', amount: 3000 });
  assert.equal(s.debt, 0);
  assert.equal(s.ended, false);
  assert.equal(actShop(s, { type: 'finish' }).ended, false);
  s = advanceTo(s, 6);
  s = actShop(s, { type: 'forfeit' });
  s = actShop(s, { type: 'finish' });
  assert.ok(s.ended);
  assert.ok(validateShop(s));
  assert.deepEqual(actShop(s, { type: 'learn', key: 'magic' }), s);
  assert.equal(actShop(s, { type: 'clearReport' }).report.length, 0);
});
test('invalid and malicious save shapes cannot enter the engine', () => {
  const s = freshShop(8);
  for (const data of [
    null,
    [],
    {},
    { ...s, version: 2 },
    { ...s, seed: NaN },
    { ...s, energy: 99 },
    { ...s, debt: 0 },
    { ...s, sign: 'missing' },
    { ...s, skills: {} },
    { ...s, visits: [{}] },
    { ...s, contracts: [{}] },
    { ...s, cursor: 999 },
    { ...s, stock: [{ ...s.stock[0], itemId: '__proto__' }] },
  ])
    assert.equal(validateShop(data), false);
  const overlap = structuredClone(s);
  overlap.stock[1].x = 0;
  overlap.stock[1].y = 0;
  assert.equal(validateShop(overlap), false);
  assert.equal(parseShop('{broken'), null);
  assert.equal(parseShop(' '.repeat(2000001)), null);
});
