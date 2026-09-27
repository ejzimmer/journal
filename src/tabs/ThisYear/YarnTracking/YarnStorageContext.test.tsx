import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { StorageContextWrapper } from '../../../shared/storageContextTestUtils';
import {
  useYarnStorage,
  useYarnStorageContext,
  YarnStorageProvider,
} from './YarnStorageContext';
import { StoredYarn, StoredYarnByYear } from './types';

const createUseValue = (values: Record<string, unknown>) => (key: string) => ({
  value: values[key],
  loading: false,
});

const renderWithYarnProvider = <T,>(
  hook: () => T,
  values: Record<string, unknown>,
  { setValue = jest.fn(), setValues = jest.fn() } = {},
) =>
  renderHook(hook, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <StorageContextWrapper
        value={{
          useValue: createUseValue(values) as never,
          setValue,
          setValues,
        }}
      >
        <YarnStorageProvider>{children}</YarnStorageProvider>
      </StorageContextWrapper>
    ),
  });

const renderYarnStorage = (storedYarn: StoredYarn, setValue = jest.fn()) =>
  renderWithYarnProvider(
    () => useYarnStorage(),
    { yarn: { '2026': storedYarn } },
    { setValue },
  );

const getBalances = (storedYarn: StoredYarn) =>
  renderYarnStorage(storedYarn).result.current.yarnByType?.map(
    ({ id, balances }) => ({
      id,
      balances: balances.map(({ month, grams }) => [month.toString(), grams]),
    }),
  );

describe('YarnStorageProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-25'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('years', () => {
    const renderYears = (storedYarnByYear?: StoredYarnByYear) =>
      renderWithYarnProvider(() => useYarnStorageContext().years, {
        yarn: storedYarnByYear,
      });

    describe('when there is no yarn yet', () => {
      it('has just this year', () => {
        expect(renderYears().result.current).toEqual([2026]);
      });
    });

    describe('when earlier years have yarn', () => {
      it('lists this year and each year with yarn, newest first', () => {
        const wool = { wool: { id: 'wool' as const, history: {} } };

        expect(
          renderYears({ '2024': wool, '2025': wool }).result.current,
        ).toEqual([2026, 2025, 2024]);
      });
    });
  });

  describe('the selected year', () => {
    const storedYarnByYear = {
      '2025': { wool: { id: 'wool', history: { '2025-03': 400 } } },
      '2026': { wool: { id: 'wool', history: { '2026-03': 100 } } },
    };

    const renderSelectedYear = () =>
      renderWithYarnProvider(
        () => ({
          context: useYarnStorageContext(),
          storage: useYarnStorage(),
        }),
        { yarn: storedYarnByYear },
      );

    it('starts as this year', () => {
      const { result } = renderSelectedYear();

      expect(result.current.storage.currentBalance).toBe(100);
    });

    describe('when another year is selected', () => {
      it('gives the yarn from that year', () => {
        const { result } = renderSelectedYear();

        act(() => result.current.context.selectYear(2025));

        expect(result.current.storage).toMatchObject({
          year: 2025,
          currentBalance: 400,
        });
      });
    });
  });

  describe('when the yarn is still stored under 2026/yarn', () => {
    const legacyYarn = {
      wool: { id: 'wool', history: { '2026-01': 300 } },
    };

    it('moves it to yarn/2026', () => {
      const setValues = jest.fn();

      renderWithYarnProvider(
        () => useYarnStorage(),
        { '2026/yarn': legacyYarn },
        { setValues },
      );

      expect(setValues).toHaveBeenCalledWith({
        'yarn/2026': legacyYarn,
        '2026/yarn': null,
      });
    });

    describe('and yarn/2026 already has yarn', () => {
      it('leaves both where they are', () => {
        const setValues = jest.fn();

        renderWithYarnProvider(
          () => useYarnStorage(),
          { '2026/yarn': legacyYarn, yarn: { '2026': legacyYarn } },
          { setValues },
        );

        expect(setValues).not.toHaveBeenCalled();
      });
    });
  });

  describe('yarnByType', () => {
    it('gives each yarn type its balances as year-months, oldest first', () => {
      expect(
        getBalances({
          wool: { id: 'wool', history: { '2026-02': 700, '2026-01': 300 } },
        }),
      ).toEqual([
        {
          id: 'wool',
          balances: [
            ['2026-01', 300],
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
        { id: 2, yarnType: 'cotton', grams: 100 },
        { id: 1, yarnType: 'wool', grams: 200 },
      ]);
    });
  });

  describe('when the history runs past the year', () => {
    it('only uses the balances from that year', () => {
      const { result } = renderYarnStorage({
        wool: {
          id: 'wool',
          history: { '2025-12': 1000, '2026-01': 400, '2027-01': 200 },
        },
      });

      expect(result.current.pile).toEqual([
        { id: 0, yarnType: 'wool', grams: 200 },
        { id: 1, yarnType: 'wool', grams: 200 },
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
          'yarn/2026/wool/history/2026-09',
          3191,
        );
      });

      describe('when the yarn type has no history', () => {
        it('starts the balance from zero', () => {
          const setValue = jest.fn();
          const { result } = renderWoolStorage(setValue);

          result.current.addYarn('cotton', 50);

          expect(setValue).toHaveBeenCalledWith(
            'yarn/2026/cotton/history/2026-09',
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
          'yarn/2026/wool/history/2026-09',
          3000,
        );
      });

      describe('when more is removed than is in the stash', () => {
        it('stores a balance of zero', () => {
          const setValue = jest.fn();
          const { result } = renderWoolStorage(setValue);

          result.current.removeYarn('wool', 5000);

          expect(setValue).toHaveBeenCalledWith(
            'yarn/2026/wool/history/2026-09',
            0,
          );
        });
      });
    });
  });
});
