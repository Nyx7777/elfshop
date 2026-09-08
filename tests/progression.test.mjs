import test from 'node:test';
import assert from 'node:assert/strict';
import { freshShop, actShop, current } from '../lib/pawn/engine.ts';
import { catalog } from '../lib/pawn/catalog.ts';
import { findSpace, pledged, usedSpace, value } from '../lib/pawn/inventory.ts';
import { validateShop, parseShop } from '../lib/pawn/save.ts';

// A conservative shopkeeper uses public asking prices and the customer's spoken
// counter-offer, never hidden acceptance thresholds or future visitor outcomes.
function play(route, seed) {
  let s = freshShop(seed),
    steps = 0;
  function act(action) {
    s = actShop(s, action);
    steps++;
    assert.ok(
      validateShop(s),
      `${route}, day ${s.day}, ${JSON.stringify(action)}`,
    );
    if (steps % 25 === 0) s = parseShop(JSON.stringify(s));
  }
  act({ type: 'learn', key: route });
  act({ type: 'makeSign', key: route });
  act({
    type: 'sign',
    sign: route,
    intent: route === 'black' ? 'balanced' : 'service',
  });
  if (route === 'black') act({ type: 'upgrade', key: 'vault' });
  for (let day = 0; day < 65 && !s.ended; day++) {
    while (current(s)) {
      let v = current(s);
      if (s.day >= 4 && !s.upgrades.includes('bell') && s.energy > 0)
        act({ type: 'observe' });
      if (v.kind === 'redeem')
        act({
          type: s.contracts.find((c) => c.id === v.contractId).reliable
            ? 'redeem'
            : 'extend',
        });
      else if (v.kind === 'service' && s.skills[v.service])
        act({ type: 'service' });
      else if (
        v.kind === 'seller' &&
        usedSpace(s) < 16 &&
        v.ask + 30 < s.gold
      ) {
        act({ type: 'inspect' });
        v = current(s);
        if (
          catalog[v.goods.itemId].magical &&
          s.skills.magic &&
          s.energy >= 2
        ) {
          act({ type: 'scan' });
          v = current(s);
        }
        const known =
          v.goods.scanned ||
          (!catalog[v.goods.itemId].magical && v.goods.inspected);
        if (
          (!known || (v.goods.authentic && !v.goods.cursed)) &&
          (!catalog[v.goods.itemId].illegal || s.skills.black)
        )
          act({ type: 'offer', amount: v.ask });
      } else if (v.kind === 'buyer') {
        for (const old of [...s.stock]) {
          if (pledged(s, old.uid)) continue;
          const d = catalog[old.itemId];
          if (
            (v.category !== 'any' && d.category !== v.category) ||
            (d.illegal && v.faction !== 'night') ||
            (old.inspected && old.condition < v.minCondition)
          )
            continue;
          if (old.zone === 'vault') {
            const pos = findSpace(s, old, 'shop');
            if (pos)
              act({
                type: 'move',
                uid: old.uid,
                x: pos.x,
                y: pos.y,
                zone: 'shop',
                rotated: pos.rotated,
              });
          }
          const g = s.stock.find((x) => x.uid === old.uid);
          if (g.zone !== 'shop') continue;
          if (!g.listed) act({ type: 'list', uid: g.uid });
          const known = g.scanned || (!d.magical && g.inspected);
          const price = Math.min(
            v.budget,
            Math.round(
              (known ? value(g) : d.value) *
                (v.faction === 'night' ? 1.2 : 0.95),
            ),
          );
          act({ type: 'sell', uid: g.uid, amount: price });
          const counter = s.message.match(/最多出 (\d+) 金币/);
          if (!current(s).resolved && counter)
            act({ type: 'sell', uid: g.uid, amount: Number(counter[1]) });
          if (current(s).resolved) break;
        }
      }
      if (!current(s).resolved) act({ type: 'refuse' });
      for (const g of [...s.stock])
        if (
          catalog[g.itemId].illegal &&
          g.zone === 'shop' &&
          s.upgrades.includes('vault')
        ) {
          const pos = findSpace(s, g, 'vault');
          if (pos)
            act({
              type: 'move',
              uid: g.uid,
              x: pos.x,
              y: pos.y,
              zone: 'vault',
              rotated: pos.rotated,
            });
        }
      act({ type: 'next' });
      act({ type: 'clearReport' });
    }
    if (!s.upgrades.includes('bell') && s.gold > 600)
      act({ type: 'upgrade', key: 'bell' });
    if (s.skills[route] === 1 && s.sales[route] >= 3 && s.gold > 800)
      act({ type: 'learn', key: route });
    if (s.gold > s.debt + 40) {
      act({ type: 'repay', amount: s.debt });
      act({ type: 'finish' });
    } else if (s.gold > 650 && s.debt > 0)
      act({ type: 'repay', amount: Math.min(s.debt, s.gold - 500) });
    if (s.ended) break;
    if (s.gold < 140 || usedSpace(s) > 18)
      for (const g of [...s.stock])
        if (!pledged(s, g.uid)) act({ type: 'liquidate', uid: g.uid });
    const before = s.day;
    act({ type: 'endDay' });
    act({ type: 'clearReport' });
    if (s.day === before) break;
  }
  return { s, steps };
}
for (const route of ['repair', 'magic', 'black'])
  test(`${route}: distinct seeded businesses can repay the entire loan with save/reload throughout`, () => {
    const results = [];
    for (const seed of [1, 7, 42, 101, 777]) {
      const { s, steps } = play(route, seed);
      results.push({ seed, day: s.day, debt: s.debt, steps });
      assert.ok(
        s.ended,
        `${route} seed ${seed} stalled day ${s.day}, gold ${s.gold}, debt ${s.debt}: ${s.message}`,
      );
      assert.equal(s.debt, 0);
      assert.ok(s.sales[route] > 0);
      assert.ok(s.skills[route] >= 1);
    }
    console.log(`${route} progression:`, JSON.stringify(results));
  });
