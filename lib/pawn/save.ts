import { catalog, DEBT, upgrades } from './catalog.ts';
import { fits } from './inventory.ts';
import type { Goods, Shop } from './types.ts';

export const SAVE_KEY = 'dusklight-pawnshop-v3';
export const LEGACY_KEY = 'dusklight-pawnshop-v1';
const record = (x: unknown): x is Record<string, unknown> =>
  !!x && typeof x === 'object' && !Array.isArray(x);
const num = (x: unknown, min = 0, max = 10000000): x is number =>
  typeof x === 'number' && Number.isInteger(x) && x >= min && x <= max;
const str = (x: unknown, max = 3000): x is string =>
  typeof x === 'string' && x.length <= max;
const bool = (x: unknown): x is boolean => typeof x === 'boolean';
const oneOf = (x: unknown, values: string[]) =>
  typeof x === 'string' && values.includes(x);
const array = (x: unknown, max: number): x is unknown[] =>
  Array.isArray(x) && x.length <= max;
function goods(x: unknown): x is Goods {
  if (
    !record(x) ||
    typeof x.itemId !== 'string' ||
    !Object.hasOwn(catalog, x.itemId)
  )
    return false;
  return (
    num(x.uid, 1) &&
    num(x.condition, 0, 100) &&
    num(x.paid) &&
    num(x.x, 0, 5) &&
    num(x.y, 0, 5) &&
    oneOf(x.zone, ['shop', 'vault']) &&
    ['authentic', 'cursed', 'inspected', 'scanned', 'rotated', 'listed'].every(
      (k) => bool(x[k]),
    )
  );
}
export function validateShop(data: unknown): data is Shop {
  if (!record(data) || data.version !== 3) return false;
  const s = data;
  if (
    !num(s.seed, 0, 4294967295) ||
    !num(s.day, 1, 10000) ||
    !num(s.gold, -100000) ||
    !num(s.debt, 0, DEBT) ||
    !num(s.paidDebt, 0, DEBT) ||
    s.debt + s.paidDebt !== DEBT ||
    !num(s.energy, 0, 12) ||
    !num(s.serial, 1) ||
    !num(s.heat, 0, 100) ||
    !num(s.profit, -10000000)
  )
    return false;
  if (
    !bool(s.greeted) ||
    !bool(s.ended) ||
    !str(s.ending) ||
    !str(s.message) ||
    (s.ended && s.debt !== 0)
  )
    return false;
  if (
    !record(s.skills) ||
    !['repair', 'magic', 'black'].every((k) =>
      num((s.skills as Record<string, unknown>)[k], 0, 2),
    )
  )
    return false;
  if (
    !record(s.reputation) ||
    !['guild', 'academy', 'night'].every((k) =>
      num((s.reputation as Record<string, unknown>)[k], -30, 100),
    )
  )
    return false;
  if (
    !record(s.sales) ||
    !['repair', 'magic', 'black', 'general'].every((k) =>
      num((s.sales as Record<string, unknown>)[k]),
    )
  )
    return false;
  if (
    !array(s.signs, 4) ||
    !s.signs.includes('general') ||
    !s.signs.every((x) => oneOf(x, ['general', 'repair', 'magic', 'black'])) ||
    new Set(s.signs).size !== s.signs.length ||
    !s.signs.includes(s.sign) ||
    !oneOf(s.intent, ['balanced', 'buy', 'sell', 'service'])
  )
    return false;
  if (
    !array(s.upgrades, 3) ||
    !s.upgrades.every(
      (x) => typeof x === 'string' && Object.hasOwn(upgrades, x),
    ) ||
    new Set(s.upgrades).size !== s.upgrades.length
  )
    return false;
  if (
    !array(s.flags, 200) ||
    !s.flags.every((x) => str(x, 80)) ||
    !array(s.report, 100) ||
    !s.report.every((x) => str(x))
  )
    return false;
  if (
    !array(s.log, 300) ||
    !s.log.every(
      (x) =>
        record(x) &&
        num(x.day, 1, 10000) &&
        str(x.text) &&
        num(x.delta, -10000000),
    )
  )
    return false;
  if (
    !array(s.journal, 150) ||
    !s.journal.every((x) => record(x) && num(x.day, 1, 10000) && str(x.text))
  )
    return false;
  if (!array(s.stock, 48) || !s.stock.every(goods)) return false;
  const shop = data as unknown as Shop;
  if (
    new Set(shop.stock.map((g) => g.uid)).size !== shop.stock.length ||
    !shop.stock.every(
      (g) =>
        g.uid < shop.serial &&
        fits(shop, g) &&
        (g.zone !== 'vault' || !g.listed),
    )
  )
    return false;
  if (
    !array(s.contracts, 4000) ||
    !s.contracts.every(
      (c) =>
        record(c) &&
        num(c.id, 1) &&
        num(c.uid, 1) &&
        str(c.customer, 100) &&
        oneOf(c.faction, ['guild', 'academy', 'night']) &&
        num(c.principal, 1) &&
        num(c.fee) &&
        num(c.due, 1, 10000) &&
        oneOf(c.status, ['active', 'overdue', 'redeemed', 'forfeited']) &&
        bool(c.extended) &&
        bool(c.reliable) &&
        (c.story === undefined || c.story === 'elyn'),
    )
  )
    return false;
  const active = shop.contracts.filter((c) =>
    ['active', 'overdue'].includes(c.status),
  );
  if (
    new Set(shop.contracts.map((c) => c.id)).size !== shop.contracts.length ||
    new Set(active.map((c) => c.uid)).size !== active.length ||
    !shop.contracts.every((c) => c.id < shop.serial && c.uid < shop.serial) ||
    !active.every((c) => shop.stock.some((g) => g.uid === c.uid && !g.listed))
  )
    return false;
  if (shop.ended && active.length) return false;
  if (!array(s.visits, 100) || !num(s.cursor, 0, s.visits.length)) return false;
  if (
    !s.visits.every((v) => {
      if (
        !record(v) ||
        !num(v.id, 1) ||
        !str(v.name, 100) ||
        !str(v.role, 150) ||
        !str(v.line) ||
        !str(v.clue) ||
        !num(v.portrait, -1, 5) ||
        !oneOf(v.faction, ['guild', 'academy', 'night']) ||
        !oneOf(v.kind, ['seller', 'buyer', 'pawn', 'service', 'redeem']) ||
        !oneOf(v.category, ['gear', 'arcane', 'relic', 'supply', 'any'])
      )
        return false;
      if (
        !['ask', 'floor', 'budget'].every((k) => num(v[k])) ||
        !num(v.minCondition, 0, 100) ||
        !num(v.patience, 0, 3) ||
        !['thief', 'observed', 'resolved'].every((k) => bool(v[k])) ||
        (v.story !== undefined && !str(v.story, 80))
      )
        return false;
      if (v.goods !== undefined && !goods(v.goods)) return false;
      if (
        ['seller', 'pawn', 'service'].includes(v.kind as string) &&
        !goods(v.goods)
      )
        return false;
      if (v.kind === 'service' && !oneOf(v.service, ['repair', 'magic']))
        return false;
      if (
        v.kind === 'redeem' &&
        (!num(v.contractId, 1) ||
          !shop.contracts.some((c) => c.id === v.contractId))
      )
        return false;
      return true;
    })
  )
    return false;
  return (
    new Set(shop.visits.map((v) => v.id)).size === shop.visits.length &&
    shop.visits.every(
      (v) => v.id < shop.serial && (!v.goods || v.goods.uid < shop.serial),
    ) &&
    shop.visits.slice(0, shop.cursor).every((v) => v.resolved)
  );
}

export function parseShop(raw: string): Shop | null {
  try {
    if (raw.length > 2000000) return null;
    const data: unknown = JSON.parse(raw);
    return validateShop(data) ? data : null;
  } catch {
    return null;
  }
}
