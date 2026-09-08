import { catalog } from './catalog.ts';
import type { Shop } from './types.ts';

// A day's queue is generated in advance; only the visitor at the counter is visible.
export function rememberVisibleGoods(s: Shop) {
  const ids = s.stock.map((g) => g.itemId);
  const goods = s.visits[s.cursor]?.goods;
  if (goods) ids.push(goods.itemId);
  s.knownItems = [...new Set([...s.knownItems, ...ids])];
}

export function recoverKnownItems(s: Shop) {
  // Pre-discovery saves can only reconstruct encounters still present in their records.
  const ids = ['sword', 'potion', 'charm'];
  for (const v of s.visits.slice(0, s.cursor + 1))
    if (v.goods) ids.push(v.goods.itemId);
  for (const d of Object.values(catalog))
    if (s.log.some((entry) => entry.text.includes(d.name))) ids.push(d.id);
  s.knownItems = [...new Set(ids)];
  rememberVisibleGoods(s);
}
