import type { Game } from './game';

type GameV1 = Omit<Game, 'version' | 'seed'> & { version: 1; seed?: undefined };

export function migrateSave(data: unknown): Game | null {
 if (!data || typeof data !== 'object') return null;
 const d = data as Record<string, unknown>;
 if (d.version === 2) return data as Game;
 if (d.version === 1) {
  const v1 = data as GameV1;
  return {
   ...v1,
   version: 2,
   seed: Math.floor(Math.random() * 2 ** 32),
  };
 }
 return null;
}
