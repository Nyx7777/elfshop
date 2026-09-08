import test from 'node:test';
import assert from 'node:assert/strict';
import { freshShop, actShop, current } from '../lib/pawn/engine.ts';
import { catalog } from '../lib/pawn/catalog.ts';
import { makeGoods, generateVisit } from '../lib/pawn/customers.ts';
import { parseShop, validateShop } from '../lib/pawn/save.ts';

test('opening journal knows inherited stock and the current counter item only', () => {
  const s = freshShop(42);
  const expected = new Set([
    ...s.stock.map((g) => g.itemId),
    current(s).goods.itemId,
  ]);
  assert.deepEqual(new Set(s.knownItems), expected);
  assert.equal(s.knownItems.length, 4);
  assert.ok(s.knownItems.length < Object.keys(catalog).length);
  for (let i = 0; i < 30; i++) generateVisit(s);
  assert.deepEqual(new Set(s.knownItems), expected);
});

test('a new counter encounter unlocks its type without appraising it, and survives departure and reload', () => {
  let s = freshShop(42);
  s.visits[1] = {
    ...s.visits[0],
    id: s.serial++,
    goods: makeGoods(s, 'core'),
    resolved: false,
  };
  const truthBefore = structuredClone(s.visits[1].goods);
  assert.equal(s.knownItems.includes('core'), false);
  s = actShop(s, { type: 'refuse' });
  assert.equal(s.knownItems.includes('core'), false);
  s = actShop(s, { type: 'next' });
  assert.equal(s.knownItems.includes('core'), true);
  assert.deepEqual(current(s).goods, truthBefore);
  while (current(s)) {
    s = actShop(s, { type: 'refuse' });
    s = actShop(s, { type: 'next' });
  }
  s = actShop(s, { type: 'endDay' });
  assert.equal(s.day, 2);
  s = parseShop(JSON.stringify(s));
  assert.ok(s);
  assert.equal(s.knownItems.includes('core'), true);
  assert.equal(new Set(s.knownItems).size, s.knownItems.length);
  const sword = s.stock.find((g) => g.itemId === 'sword');
  s = actShop(s, { type: 'liquidate', uid: sword.uid });
  assert.equal(
    s.stock.some((g) => g.uid === sword.uid),
    false,
  );
  assert.equal(s.knownItems.includes('sword'), true);
});

test('pre-fix version 3 saves recover known goods without revealing future queue or changing progress', () => {
  let s = freshShop(42);
  s = actShop(s, { type: 'offer', amount: current(s).ask });
  assert.equal(s.contracts.length, 1);
  s.visits[1] = {
    ...s.visits[0],
    id: s.serial++,
    goods: makeGoods(s, 'core'),
    resolved: false,
  };
  s.log.push({ day: 1, text: `出售 ${catalog.armor.name}`, delta: 100 });
  delete s.knownItems;
  const migrated = parseShop(JSON.stringify(s));
  assert.ok(migrated);
  assert.ok(validateShop(migrated));
  assert.equal(migrated.knownItems.includes('core'), false);
  assert.equal(migrated.knownItems.includes('armor'), true);
  assert.equal(migrated.knownItems.includes(current(s).goods.itemId), true);
  const { knownItems, ...progress } = migrated;
  assert.deepEqual(progress, s);
  assert.deepEqual(parseShop(JSON.stringify(migrated)), migrated);
});

test('malformed discovery records are rejected rather than treated as old saves', () => {
  for (const knownItems of [
    null,
    'sword',
    ['missing'],
    ['sword', 'sword'],
    ['__proto__'],
  ]) {
    assert.equal(
      parseShop(JSON.stringify({ ...freshShop(42), knownItems })),
      null,
    );
  }
});
