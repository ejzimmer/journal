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
  renderYarnStorage(storedYarn).result.current.yarnTypes?.map(
    ({ id, balances }) => ({
      id,
      balances: balances.map(({ month, grams }) => [month.toString(), grams]),
    }),
  );

describe('YarnStorageProvider', () => {
  describe('yarnTypes', () => {
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

    describe('when the stored months have two-digit years', () => {
      const storedYarn = {
        wool: { id: 'wool', history: { '25-12': 300, '26-02': 700 } },
      };

      it('reads them as four-digit years', () => {
        expect(getBalances(storedYarn)).toEqual([
          {
            id: 'wool',
            balances: [
              ['2025-12', 300],
              ['2026-02', 700],
            ],
          },
        ]);
      });

      it('stores them with four-digit years', () => {
        const setValue = jest.fn();
        renderYarnStorage(storedYarn, setValue);

        expect(setValue).toHaveBeenCalledWith('2026/yarn', {
          wool: { id: 'wool', history: { '2025-12': 300, '2026-02': 700 } },
        });
      });
    });
  });

  describe('months', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-03-11'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('gives the totals for every month up to this one', () => {
      const { result } = renderYarnStorage({
        wool: { id: 'wool', history: { '2026-01': 300, '2026-02': 700 } },
        cotton: { id: 'cotton', history: { '2026-01': 300 } },
      });

      expect(
        result.current.months?.map(({ month, total }) => [
          month.toString(),
          total,
        ]),
      ).toEqual([
        ['2026-01', 600],
        ['2026-02', 1000],
        ['2026-03', 1000],
      ]);
    });
  });

  describe('updateBalance', () => {
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

    describe('when yarn is added', () => {
      it('stores the latest balance plus the amount against this month', () => {
        const setValue = jest.fn();
        const { result } = renderWoolStorage(setValue);

        result.current.updateBalance({
          yarnType: 'wool',
          amount: 100,
          operation: '+',
        });

        expect(setValue).toHaveBeenCalledWith(
          '2026/yarn/wool/history/2026-09',
          3191,
        );
      });
    });

    describe('when yarn is used', () => {
      it('stores the latest balance minus the amount against this month', () => {
        const setValue = jest.fn();
        const { result } = renderWoolStorage(setValue);

        result.current.updateBalance({
          yarnType: 'wool',
          amount: 91,
          operation: '-',
        });

        expect(setValue).toHaveBeenCalledWith(
          '2026/yarn/wool/history/2026-09',
          3000,
        );
      });
    });

    describe('when the yarn type has no history', () => {
      it('starts the balance from zero', () => {
        const setValue = jest.fn();
        const { result } = renderWoolStorage(setValue);

        result.current.updateBalance({
          yarnType: 'cotton',
          amount: 50,
          operation: '+',
        });

        expect(setValue).toHaveBeenCalledWith(
          '2026/yarn/cotton/history/2026-09',
          50,
        );
      });
    });
  });
});
