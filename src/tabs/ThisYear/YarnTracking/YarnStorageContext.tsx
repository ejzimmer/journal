import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useStorageContext } from '../../../shared/FirebaseContext';
import {
  BalanceChange,
  KEY,
  StoredYarn,
  StoredYarnType,
  YarnType,
} from './types';
import { hasTwoDigitYearMonths, migrateYarnDates } from './migrateYarnDates';
import { getThisMonth } from './utils';

export type YarnStorageContextType = {
  yarnTypes?: YarnType[];
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

  const migratedYarn = useMemo(
    () => storedYarn && migrateYarnDates(storedYarn),
    [storedYarn],
  );

  const hasMigrated = useRef(false);
  useEffect(() => {
    if (!storedYarn || !migratedYarn || hasMigrated.current) return;
    hasMigrated.current = true;

    if (hasTwoDigitYearMonths(storedYarn)) {
      setValue(KEY, migratedYarn);
    }
  }, [storedYarn, migratedYarn, setValue]);

  const value = useMemo(() => {
    const yarnTypes =
      migratedYarn && Object.values(migratedYarn).map(convertToYarnType);

    const getCurrentBalance = (yarnType: string) =>
      yarnTypes?.find(({ id }) => id === yarnType)?.balances.at(-1)?.grams ?? 0;

    return {
      yarnTypes,
      updateBalance: ({ yarnType, amount, operation }: BalanceChange) => {
        const currentBalance = getCurrentBalance(yarnType);

        setValue(
          `${KEY}/${yarnType}/history/${getThisMonth()}`,
          operation === '+' ? currentBalance + amount : currentBalance - amount,
        );
      },
    };
  }, [migratedYarn, setValue]);

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
