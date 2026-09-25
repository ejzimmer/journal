export const KEY = '2026/yarn';

export const YARN_TYPE_IDS = [
  'wool',
  'cotton',
  'acrylic',
  'sock yarn',
] as const;
export type YarnTypeId = (typeof YARN_TYPE_IDS)[number];

export const isYarnTypeId = (value: string): value is YarnTypeId =>
  YARN_TYPE_IDS.some((id) => id === value);

export type StoredYarn = Partial<Record<YarnTypeId, StoredYarnType>>;
export type StoredYarnType = {
  id: YarnTypeId;
  history: Record<string, number>;
};

export type YarnBalance = { month: Temporal.PlainYearMonth; grams: number };
export type YarnType = { id: YarnTypeId; balances: YarnBalance[] };

export type Operation = '+' | '-';
export type YarnBall = {
  yarnType: YarnTypeId;
  grams: number;
  usedIn?: Temporal.PlainYearMonth;
};
