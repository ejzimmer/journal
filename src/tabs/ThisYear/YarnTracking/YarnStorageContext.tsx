import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useStorageContext } from '../../../shared/FirebaseContext';
import { KEY, StoredYarn, StoredYarnType, YarnBall, YarnType } from './types';
import { getThisMonth } from '../../../shared/dates';
import { YarnStash } from './YarnStash';

export type YarnStorageContextType = {
  yarnByType?: YarnType[];
  pile?: YarnBall[];
  currentBalance: number;
  addYarn: (yarnType: string, grams: number) => void;
  removeYarn: (yarnType: string, grams: number) => void;
};

export const YarnStorageContext = createContext<
  YarnStorageContextType | undefined
>(undefined);

export const convertToYarnType = ({
  id,
  history,
}: StoredYarnType): YarnType => ({
  id,
  balances: Object.entries(history)
    .map(([month, grams]) => ({
      month: Temporal.PlainYearMonth.from(month),
      grams,
    }))
    .sort((a, b) => Temporal.PlainYearMonth.compare(a.month, b.month)),
});

export function YarnStorageProvider({ children }: { children: ReactNode }) {
  const { useValue, setValue } = useStorageContext();
  const { value: storedYarn } = useValue<StoredYarn>(KEY);
  const [stash] = useState(() => new YarnStash());

  const value = useMemo(() => {
    const yarnByType =
      storedYarn && Object.values(storedYarn).map(convertToYarnType);

    if (yarnByType) {
      stash.applyBalances(yarnByType);
    }

    const saveBalance = (yarnType: string, grams: number) =>
      setValue(`${KEY}/${yarnType}/history/${getThisMonth()}`, grams);

    return {
      yarnByType,
      pile: yarnByType && [...stash.balls],
      currentBalance: stash.getTotalBalance(),
      addYarn: (yarnType: string, grams: number) =>
        saveBalance(yarnType, stash.getBalance(yarnType) + grams),
      removeYarn: (yarnType: string, grams: number) =>
        saveBalance(yarnType, Math.max(0, stash.getBalance(yarnType) - grams)),
    };
  }, [storedYarn, stash, setValue]);

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
