import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useStorageContext } from '../../../shared/FirebaseContext';
import {
  StoredYarn,
  StoredYarnByYear,
  StoredYarnType,
  YARN_PATH,
  YarnBall,
  YarnType,
  YarnTypeId,
  getYarnPath,
} from './types';
import { getThisMonth, getThisYear } from '../../../shared/dates';
import { YarnStash } from './YarnStash';
import { listYearsNewestFirst } from '../../../shared/years';

export type YarnYearStorage = {
  yarnByType?: YarnType[];
  year: number;
  pile?: YarnBall[];
  currentBalance: number;
  getBalance: (yarnType: YarnTypeId) => number;
  addYarn: (yarnType: YarnTypeId, grams: number) => void;
  removeYarn: (yarnType: YarnTypeId, grams: number) => void;
};

export type YarnStorageContextType = {
  years: number[];
  thisYear: number;
  selectedYear: number;
  selectYear: (year: number) => void;
  getYarnYear: (year: number) => YarnYearStorage;
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

export function YarnStorageProvider({ children }: { children: ReactNode }) {
  const { useValue, setValue } = useStorageContext();
  const { value: storedYarnByYear, loading } =
    useValue<StoredYarnByYear>(YARN_PATH);
  const [stashes] = useState(() => new Map<number, YarnStash>());
  const thisYear = getThisYear();
  const [selectedYear, selectYear] = useState(thisYear);

  const yarnYears = useMemo(() => {
    const getStash = (year: number, previousStash?: YarnStash) => {
      const stash = stashes.get(year) ?? YarnStash.carryOver(previousStash);
      stashes.set(year, stash);
      return stash;
    };

    const createYarnYear = (
      year: number,
      stash?: YarnStash,
      storedYarn?: StoredYarn,
    ): YarnYearStorage => {
      const yarnByType =
        storedYarn &&
        Object.values(storedYarn).map((storedYarnType) =>
          convertToYarnType(storedYarnType, year),
        );

      if (stash && yarnByType) {
        stash.applyBalances(yarnByType);
      }

      const getBalance = (yarnType: YarnTypeId) =>
        stash?.getBalance(yarnType) ?? 0;

      const saveBalance = (yarnType: YarnTypeId, grams: number) =>
        setValue(
          `${getYarnPath(year)}/${yarnType}/history/${getThisMonth()}`,
          grams,
        );

      return {
        year,
        yarnByType,
        pile: stash && [...stash.balls],
        currentBalance: stash?.getTotalBalance() ?? 0,
        getBalance,
        addYarn: (yarnType: YarnTypeId, grams: number) =>
          saveBalance(yarnType, getBalance(yarnType) + grams),
        removeYarn: (yarnType: YarnTypeId, grams: number) =>
          saveBalance(yarnType, Math.max(0, getBalance(yarnType) - grams)),
      };
    };

    const years = listYearsNewestFirst(
      thisYear,
      Object.keys(storedYarnByYear ?? {}).map(Number),
    );
    const yarnYears = new Map<number, YarnYearStorage>();
    let previousStash: YarnStash | undefined;
    years.toReversed().forEach((year) => {
      const stash = loading ? undefined : getStash(year, previousStash);
      yarnYears.set(
        year,
        createYarnYear(year, stash, storedYarnByYear?.[year]),
      );
      previousStash = stash;
    });

    return {
      years,
      getYarnYear: (year: number) =>
        yarnYears.get(year) ?? createYarnYear(year),
    };
  }, [thisYear, storedYarnByYear, loading, stashes, setValue]);

  const value = useMemo(
    () => ({ ...yarnYears, thisYear, selectedYear, selectYear }),
    [yarnYears, thisYear, selectedYear],
  );

  return (
    <YarnStorageContext.Provider value={value}>
      {children}
    </YarnStorageContext.Provider>
  );
}

export function useYarnStorageContext(): YarnStorageContextType {
  const context = useContext(YarnStorageContext);
  if (!context) {
    throw new Error('missing YarnStorageContext provider');
  }
  return context;
}

export function useYarnStorage(): YarnYearStorage {
  const { getYarnYear, selectedYear } = useYarnStorageContext();
  return getYarnYear(selectedYear);
}
