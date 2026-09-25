import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { StorageContextWrapper } from '../../../shared/storageContextTestUtils';
import { useYarnStorage, YarnStorageProvider } from './YarnStorageContext';
import { StoredYarn } from './types';

const renderYarnStorage = (storedYarn: StoredYarn, setValue = jest.fn()) =>
  renderHook(() => useYarnStorage(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <StorageContextWrapper
        value={{
          useValue: jest.fn().mockReturnValue({ value: storedYarn }),
          setValue,
        }}
      >
        <YarnStorageProvider>{children}</YarnStorageProvider>
      </StorageContextWrapper>
    ),
  });

const getBalances = (storedYarn: StoredYarn) =>
  renderYarnStorage(storedYarn).result.current.yarnByType?.map(
    ({ id, balances }) => ({
      id,
      balances: balances.map(({ month, grams }) => [month.toString(), grams]),
    }),
  );

describe('YarnStorageProvider', () => {
  describe('yarnByType', () => {
    it('gives each yarn type its balances as year-months, oldest first', () => {
      expect(
        getBalances({
          wool: { id: 'wool', history: { '2026-02': 700, '2025-12': 300 } },
        }),
      ).toEqual([
        {
          id: 'wool',
          balances: [
            ['2025-12', 300],
            ['2026-02', 700],
          ],
        },
      ]);
    });
  });

  describe('pile', () => {
    it('builds the pile of balls from every yarn type', () => {
      const { result } = renderYarnStorage({
        wool: { id: 'wool', history: { '2026-01': 400, '2026-02': 200 } },
        cotton: { id: 'cotton', history: { '2026-03': 100 } },
      });

      expect(result.current.pile).toEqual([
        { yarnType: 'cotton', grams: 100 },
        { yarnType: 'wool', grams: 200 },
      ]);
    });
  });

  describe('currentBalance', () => {
    it('adds up the latest balance of every yarn type', () => {
      const { result } = renderYarnStorage({
        wool: { id: 'wool', history: { '2026-01': 300, '2026-02': 700 } },
        cotton: { id: 'cotton', history: { '2026-01': 300 } },
      });

      expect(result.current.currentBalance).toBe(1000);
    });
  });

  describe('getBalance', () => {
    it('gives the latest balance of that yarn type', () => {
      const { result } = renderYarnStorage({
        wool: { id: 'wool', history: { '2026-01': 300, '2026-02': 700 } },
        cotton: { id: 'cotton', history: { '2026-01': 300 } },
      });

      expect(result.current.getBalance('wool')).toBe(700);
    });
  });

  describe('saving changes', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-09-25'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    const renderWoolStorage = (setValue: jest.Mock) =>
      renderYarnStorage(
        {
          wool: { id: 'wool', history: { '2026-09': 3091, '2026-08': 4221 } },
          cotton: { id: 'cotton', history: {} },
        },
        setValue,
      );

    describe('addYarn', () => {
      it('stores the current balance plus the amount against this month', () => {
        const setValue = jest.fn();
        const { result } = renderWoolStorage(setValue);

        result.current.addYarn('wool', 100);

        expect(setValue).toHaveBeenCalledWith(
          '2026/yarn/wool/history/2026-09',
          3191,
        );
      });

      describe('when the yarn type has no history', () => {
        it('starts the balance from zero', () => {
          const setValue = jest.fn();
          const { result } = renderWoolStorage(setValue);

          result.current.addYarn('cotton', 50);

          expect(setValue).toHaveBeenCalledWith(
            '2026/yarn/cotton/history/2026-09',
            50,
          );
        });
      });
    });

    describe('removeYarn', () => {
      it('stores the current balance minus the amount against this month', () => {
        const setValue = jest.fn();
        const { result } = renderWoolStorage(setValue);

        result.current.removeYarn('wool', 91);

        expect(setValue).toHaveBeenCalledWith(
          '2026/yarn/wool/history/2026-09',
          3000,
        );
      });

      describe('when more is removed than is in the stash', () => {
        it('stores a balance of zero', () => {
          const setValue = jest.fn();
          const { result } = renderWoolStorage(setValue);

          result.current.removeYarn('wool', 5000);

          expect(setValue).toHaveBeenCalledWith(
            '2026/yarn/wool/history/2026-09',
            0,
          );
        });
      });
    });
  });
});
