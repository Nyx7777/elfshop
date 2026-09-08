export type Specialty = 'repair' | 'magic' | 'black';
export type Faction = 'guild' | 'academy' | 'night';
export type Category = 'gear' | 'arcane' | 'relic' | 'supply';
export type Zone = 'shop' | 'vault';
export type Sign = 'general' | Specialty;
export type Intent = 'balanced' | 'buy' | 'sell' | 'service';
export type ItemDef = {
  id: string;
  name: string;
  icon: string;
  category: Category;
  value: number;
  w: number;
  h: number;
  description: string;
  repairable?: boolean;
  magical?: boolean;
  illegal?: boolean;
};
export type Goods = {
  uid: number;
  itemId: string;
  condition: number;
  authentic: boolean;
  cursed: boolean;
  inspected: boolean;
  scanned: boolean;
  paid: number;
  x: number;
  y: number;
  rotated: boolean;
  zone: Zone;
  listed: boolean;
};
export type Contract = {
  id: number;
  uid: number;
  customer: string;
  faction: Faction;
  principal: number;
  fee: number;
  due: number;
  status: 'active' | 'overdue' | 'redeemed' | 'forfeited';
  extended: boolean;
  reliable: boolean;
  story?: 'elyn';
};
export type Visit = {
  id: number;
  name: string;
  role: string;
  faction: Faction;
  portrait: number;
  kind: 'seller' | 'buyer' | 'pawn' | 'service' | 'redeem';
  line: string;
  clue: string;
  goods?: Goods;
  ask: number;
  floor: number;
  budget: number;
  category: Category | 'any';
  minCondition: number;
  service?: 'repair' | 'magic';
  contractId?: number;
  thief: boolean;
  observed: boolean;
  patience: number;
  resolved: boolean;
  story?: string;
};
export type Journal = { day: number; text: string };
export type Ledger = { day: number; text: string; delta: number };
export type Shop = {
  version: 3;
  seed: number;
  day: number;
  gold: number;
  debt: number;
  energy: number;
  serial: number;
  stock: Goods[];
  contracts: Contract[];
  visits: Visit[];
  cursor: number;
  skills: Record<Specialty, number>;
  signs: Sign[];
  sign: Sign;
  intent: Intent;
  upgrades: string[];
  reputation: Record<Faction, number>;
  sales: Record<Specialty | 'general', number>;
  heat: number;
  paidDebt: number;
  profit: number;
  greeted: boolean;
  flags: string[];
  log: Ledger[];
  journal: Journal[];
  report: string[];
  message: string;
  ended: boolean;
  ending: string;
};
export type Action =
  | {
      type:
        | 'inspect'
        | 'scan'
        | 'observe'
        | 'guard'
        | 'refuse'
        | 'next'
        | 'service'
        | 'redeem'
        | 'extend'
        | 'forfeit'
        | 'endDay'
        | 'clearReport'
        | 'finish'
        | 'greet';
    }
  | { type: 'offer'; amount: number }
  | { type: 'sell'; uid: number; amount: number }
  | {
      type: 'move';
      uid: number;
      x: number;
      y: number;
      rotated: boolean;
      zone: Zone;
    }
  | {
      type:
        | 'list'
        | 'liquidate'
        | 'repair'
        | 'inspectStock'
        | 'scanStock'
        | 'purify';
      uid: number;
    }
  | { type: 'learn'; key: Specialty }
  | { type: 'makeSign'; key: Specialty }
  | { type: 'sign'; sign: Sign; intent: Intent }
  | { type: 'upgrade'; key: string }
  | { type: 'repay'; amount: number };
