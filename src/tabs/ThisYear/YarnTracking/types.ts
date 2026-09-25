export const KEY = '2026/yarn';

export type StoredYarn = Record<string, StoredYarnType>;
export type StoredYarnType = { id: string; history: Record<string, number> };

export type YarnBalance = { month: Temporal.PlainYearMonth; grams: number };
export type YarnType = { id: string; balances: YarnBalance[] };

export type History = Record<string, Month>;
export type Month = {
  month: Temporal.PlainYearMonth;
  total: number;
  subTotals: TotalsByType;
};
export type TotalsByType = Record<string, number>;
