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

  describe('getCurrentBalance', () => {
    const renderWoolStorage = () =>
      renderYarnStorage({
        wool: { id: 'wool', history: { '2026-09': 3091, '2026-08': 4221 } },
        cotton: { id: 'cotton', history: {} },
      });

    it('returns the balance from the most recent month', () => {
      expect(renderWoolStorage().result.current.getCurrentBalance('wool')).toBe(
        3091,
      );
    });

    describe('when the yarn type has no history', () => {
      it('returns zero', () => {
        expect(
          renderWoolStorage().result.current.getCurrentBalance('cotton'),
        ).toBe(0);
      });
    });
  });

  describe('recordBalance', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-09-25'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("stores the balance against this month in the yarn type's history", () => {
      const setValue = jest.fn();
      const { result } = renderYarnStorage(
        { wool: { id: 'wool', history: { '2026-08': 4221 } } },
        setValue,
      );

      result.current.recordBalance('wool', 3091);

      expect(setValue).toHaveBeenCalledWith(
        '2026/yarn/wool/history/2026-09',
        3091,
      );
    });
  });
});
