import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useStorageContext } from '../../../shared/FirebaseContext';
import {
  StoredYarn,
  StoredYarnType,
  YarnBall,
  YarnType,
  YarnTypeId,
  getYarnPath,
} from './types';
import { getThisMonth } from '../../../shared/dates';
import { YarnStash } from './YarnStash';

export type PileSnapshot = {
  month: Temporal.PlainYearMonth;
  pile: YarnBall[];
};

export type YarnStorageContextType = {
  yarnByType?: YarnType[];
  year: number;
  pile?: YarnBall[];
  pileHistory?: PileSnapshot[];
  currentBalance: number;
  getBalance: (yarnType: YarnTypeId) => number;
  addYarn: (yarnType: YarnTypeId, grams: number) => void;
  removeYarn: (yarnType: YarnTypeId, grams: number) => void;
};

export const YarnStorageContext = createContext<
  YarnStorageContextType | undefined
>(undefined);

export const convertToYarnType = (
  { id, history }: StoredYarnType,
  year: number,
): YarnType => ({
  id,
  balances: Object.entries(history)
    .map(([month, grams]) => ({
      month: Temporal.PlainYearMonth.from(month),
      grams,
    }))
    .filter(({ month }) => month.year === year)
    .sort((a, b) => Temporal.PlainYearMonth.compare(a.month, b.month)),
});

function buildPileHistory(yarnByType: YarnType[]) {
  const months = [
    ...new Set(
      yarnByType.flatMap(({ balances }) =>
        balances.map(({ month }) => month.toString()),
      ),
    ),
  ]
    .sort()
    .map((month) => Temporal.PlainYearMonth.from(month));

  const stash = new YarnStash();
  return months.map((month) => {
    stash.applyBalances(
      yarnByType.map(({ id, balances }) => ({
        id,
        balances: balances.filter(
          (balance) =>
            Temporal.PlainYearMonth.compare(balance.month, month) <= 0,
        ),
      })),
    );
    return { month, pile: stash.balls.map((ball) => ({ ...ball })) };
  });
}

type YarnStorageProviderProps = {
  year: number;
  children: ReactNode;
};

export function YarnStorageProvider({
  year,
  children,
}: YarnStorageProviderProps) {
  const { useValue, setValue } = useStorageContext();
  const path = getYarnPath(year);
  const { value: storedYarn } = useValue<StoredYarn>(path);
  const [stash] = useState(() => new YarnStash());

  const value = useMemo(() => {
    const yarnByType =
      storedYarn &&
      Object.values(storedYarn).map((storedYarnType) =>
        convertToYarnType(storedYarnType, year),
      );

    if (yarnByType) {
      stash.applyBalances(yarnByType);
    }

    const saveBalance = (yarnType: YarnTypeId, grams: number) =>
      setValue(`${path}/${yarnType}/history/${getThisMonth()}`, grams);

    return {
      year,
      yarnByType,
      pile: yarnByType && [...stash.balls],
      pileHistory: yarnByType && buildPileHistory(yarnByType),
      currentBalance: stash.getTotalBalance(),
      getBalance: (yarnType: YarnTypeId) => stash.getBalance(yarnType),
      addYarn: (yarnType: YarnTypeId, grams: number) =>
        saveBalance(yarnType, stash.getBalance(yarnType) + grams),
      removeYarn: (yarnType: YarnTypeId, grams: number) =>
        saveBalance(yarnType, Math.max(0, stash.getBalance(yarnType) - grams)),
    };
  }, [year, path, storedYarn, stash, setValue]);

  return (
    <YarnStorageContext.Provider value={value}>
      {children}
    </YarnStorageContext.Provider>
  );
}

export function useYarnStorage(): YarnStorageContextType {
  const context = useContext(YarnStorageContext);
  if (!context) {
    throw new Error('missing YarnStorageContext provider');
  }
  return context;
}
