import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { ContextType, FirebaseContext } from '../FirebaseContext';
import { createStorageContext } from '../storageContextTestUtils';
import { DailyJobsProvider } from './DailyJobsContext';
import { hasAlreadyRun } from './hasAlreadyRun';

export function createDailyJobsStorage(
  storedValues: Record<string, unknown> = {},
  overrides: Partial<ContextType> = {},
): ContextType {
  return createStorageContext({
    useValue: <T,>(key?: string) => ({
      value: key ? (storedValues[key] as T) : undefined,
      loading: false,
      synced: true,
    }),
    claimDailyRun: jest.fn(async (lastRunKey: string, day: string) => {
      const lastRun = storedValues[lastRunKey];
      if (hasAlreadyRun(lastRun, day)) {
        return false;
      }
      storedValues[lastRunKey] = day;
      return true;
    }),
    ...overrides,
  });
}

export async function renderDailyJob(useJob: () => void, storage: ContextType) {
  const { rerender } = renderHook(useJob, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <FirebaseContext.Provider value={storage}>
        <DailyJobsProvider>{children}</DailyJobsProvider>
      </FirebaseContext.Provider>
    ),
  });
  await settleClaims();

  return {
    rerender: async () => {
      rerender();
      await settleClaims();
    },
  };
}

export const settleClaims = () => act(async () => {});
