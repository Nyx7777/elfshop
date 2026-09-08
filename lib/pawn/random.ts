import type { Shop } from './types.ts';
export function random(s: Shop) {
  s.seed = (Math.imul(1664525, s.seed) + 1013904223) >>> 0;
  return s.seed / 4294967296;
}
export function pick<T>(s: Shop, list: readonly T[]): T {
  return list[Math.floor(random(s) * list.length)];
}
