import { createContext, ReactNode, useContext, useMemo } from 'react';
import { useStorageContext } from '../../../shared/FirebaseContext';
import {
  BalanceChange,
  KEY,
  Month,
  StoredYarn,
  StoredYarnType,
  YarnType,
} from './types';
import { getHistoryByMonth, getThisMonth } from './utils';

export type YarnStorageContextType = {
  yarnTypes?: YarnType[];
  months?: Month[];
  maxTotal: number;
  updateBalance: (change: BalanceChange) => void;
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

  const value = useMemo(() => {
    const yarnTypes =
      storedYarn && Object.values(storedYarn).map(convertToYarnType);

    const getCurrentBalance = (yarnType: string) =>
      yarnTypes?.find(({ id }) => id === yarnType)?.balances.at(-1)?.grams ?? 0;

    const months = yarnTypes && getHistoryByMonth(yarnTypes);

    return {
      yarnTypes,
      months,
      maxTotal: Math.max(0, ...(months ?? []).map(({ total }) => total)),
      updateBalance: ({ yarnType, amount, operation }: BalanceChange) => {
        const currentBalance = getCurrentBalance(yarnType);

        setValue(
          `${KEY}/${yarnType}/history/${getThisMonth()}`,
          operation === '+' ? currentBalance + amount : currentBalance - amount,
        );
      },
    };
  }, [storedYarn, setValue]);

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
