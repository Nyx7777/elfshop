import { catalog } from './catalog.ts';
import type { Goods, Shop, Zone } from './types.ts';

export function dimensions(g: Goods) {
  const d = catalog[g.itemId];
  return g.rotated ? [d.h, d.w] : [d.w, d.h];
}
export function board(s: Shop, zone: Zone): [number, number] {
  return [
    6,
    zone === 'vault'
      ? s.upgrades.includes('vault')
        ? 2
        : 0
      : s.upgrades.includes('shelves')
        ? 6
        : 4,
  ];
}
export function occupies(g: Goods, x: number, y: number) {
  const [w, h] = dimensions(g);
  return x >= g.x && x < g.x + w && y >= g.y && y < g.y + h;
}
export function fits(s: Shop, g: Goods) {
  const [w, h] = dimensions(g),
    [bw, bh] = board(s, g.zone);
  if (
    !Number.isInteger(g.x) ||
    !Number.isInteger(g.y) ||
    g.x < 0 ||
    g.y < 0 ||
    g.x + w > bw ||
    g.y + h > bh
  )
    return false;
  return !s.stock.some(
    (other) =>
      other.uid !== g.uid &&
      other.zone === g.zone &&
      (() => {
        const [ow, oh] = dimensions(other);
        return (
          g.x < other.x + ow &&
          g.x + w > other.x &&
          g.y < other.y + oh &&
          g.y + h > other.y
        );
      })(),
  );
}
export function findSpace(
  s: Shop,
  g: Goods,
  zone: Zone = 'shop',
): Goods | null {
  const [w, h] = board(s, zone);
  for (const rotated of [g.rotated, !g.rotated])
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const candidate = { ...g, x, y, zone, rotated };
        if (fits(s, candidate)) return candidate;
      }
  return null;
}
export function usedSpace(s: Shop, zone: Zone = 'shop') {
  return s.stock
    .filter((g) => g.zone === zone)
    .reduce((n, g) => {
      const [w, h] = dimensions(g);
      return n + w * h;
    }, 0);
}
export function pledged(s: Shop, uid: number) {
  return s.contracts.find(
    (c) => c.uid === uid && (c.status === 'active' || c.status === 'overdue'),
  );
}
export function value(g: Goods) {
  const d = catalog[g.itemId];
  return Math.max(
    5,
    Math.round(
      d.value *
        (0.35 + (0.65 * g.condition) / 100) *
        (g.authentic ? 1 : 0.16) *
        (g.cursed ? 0.58 : 1),
    ),
  );
}
export function estimate(g: Goods): string {
  const d = catalog[g.itemId];
  if (!g.inspected && !g.scanned) return '尚未检查';
  const known = !d.magical ? g.inspected : g.scanned;
  const v = known
    ? value(g)
    : Math.round(d.value * (0.35 + (0.65 * g.condition) / 100));
  return `${Math.round(v * (known ? 0.9 : 0.65))}–${Math.round(v * (known ? 1.1 : 1.15))} G${known ? '' : ' · 魔力未明'}`;
}
export function repairCost(g: Goods, level: number) {
  return Math.ceil(
    ((catalog[g.itemId].value * (100 - g.condition)) / 100) *
      (level >= 2 ? 0.17 : 0.23),
  );
}
