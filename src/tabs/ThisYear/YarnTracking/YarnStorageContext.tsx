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
import { useYarnPathMigration } from './useYarnPathMigration';

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

const listYearsNewestFirst = (
  thisYear: number,
  storedYarnByYear?: StoredYarnByYear,
) =>
  [
    ...new Set([thisYear, ...Object.keys(storedYarnByYear ?? {}).map(Number)]),
  ].sort((a, b) => b - a);

export function YarnStorageProvider({ children }: { children: ReactNode }) {
  const { useValue, setValue } = useStorageContext();
  const { value: storedYarnByYear } = useValue<StoredYarnByYear>(YARN_PATH);
  const [stashes] = useState(() => new Map<number, YarnStash>());
  const thisYear = getThisYear();
  const [selectedYear, selectYear] = useState(thisYear);

  useYarnPathMigration(storedYarnByYear);

  const yarnYears = useMemo(() => {
    const getStash = (year: number) => {
      const stash = stashes.get(year) ?? new YarnStash();
      stashes.set(year, stash);
      return stash;
    };

    const createYarnYear = (
      year: number,
      storedYarn?: StoredYarn,
    ): YarnYearStorage => {
      const stash = getStash(year);
      const yarnByType =
        storedYarn &&
        Object.values(storedYarn).map((storedYarnType) =>
          convertToYarnType(storedYarnType, year),
        );

      if (yarnByType) {
        stash.applyBalances(yarnByType);
      }

      const saveBalance = (yarnType: YarnTypeId, grams: number) =>
        setValue(
          `${getYarnPath(year)}/${yarnType}/history/${getThisMonth()}`,
          grams,
        );

      return {
        year,
        yarnByType,
        pile: yarnByType && [...stash.balls],
        currentBalance: stash.getTotalBalance(),
        getBalance: (yarnType: YarnTypeId) => stash.getBalance(yarnType),
        addYarn: (yarnType: YarnTypeId, grams: number) =>
          saveBalance(yarnType, stash.getBalance(yarnType) + grams),
        removeYarn: (yarnType: YarnTypeId, grams: number) =>
          saveBalance(
            yarnType,
            Math.max(0, stash.getBalance(yarnType) - grams),
          ),
      };
    };

    const years = listYearsNewestFirst(thisYear, storedYarnByYear);
    const yarnYears = new Map(
      years.map((year) => [
        year,
        createYarnYear(year, storedYarnByYear?.[year]),
      ]),
    );

    return {
      years,
      getYarnYear: (year: number) =>
        yarnYears.get(year) ?? createYarnYear(year),
    };
  }, [thisYear, storedYarnByYear, stashes, setValue]);

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
