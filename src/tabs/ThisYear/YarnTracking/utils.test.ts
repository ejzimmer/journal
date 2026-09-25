import { getBallSizes, getHistoryByMonth } from './utils';
import { StoredYarn } from './types';
import { convertToYarnType } from './YarnStorageContext';

const getMonthsByMonthId = (yarnState: StoredYarn) =>
  Object.fromEntries(
    getHistoryByMonth(Object.values(yarnState).map(convertToYarnType)).map(
      (month) => [
        month.month.toString(),
        { ...month, month: month.month.toString() },
      ],
    ),
  );

describe('getHistoryByMonth', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns returns the total of each yarn type per month', () => {
    jest.setSystemTime(new Date('2026-03-11'));

    const yarnState = {
      sockYarn: {
        id: 'sockYarn',
        history: {
          '2026-01': 123,
          '2026-02': 544,
          '2026-03': 487,
        },
      },
      wool: {
        id: 'wool',
        history: {
          '2026-01': 222,
          '2026-02': 566,
          '2026-03': 444,
        },
      },
    };

    expect(getMonthsByMonthId(yarnState)).toEqual({
      '2026-01': {
        month: '2026-01',
        total: 345,
        subTotals: { sockYarn: 123, wool: 222 },
      },
      '2026-02': {
        month: '2026-02',
        total: 1110,
        subTotals: { sockYarn: 544, wool: 566 },
      },
      '2026-03': {
        month: '2026-03',
        total: 931,
        subTotals: { sockYarn: 487, wool: 444 },
      },
    });
  });

  describe('when there is no data for a specific month', () => {
    it('returns the data for the previous month', () => {
      jest.setSystemTime(new Date('2026-09-04'));
      const yarnState = {
        sockYarn: {
          id: 'sockYarn',
          history: {
            '2026-01': 123,
            '2026-02': 544,
            '2026-08': 487,
          },
        },
        wool: {
          id: 'wool',
          history: {
            '2026-01': 222,
            '2026-02': 566,
            '2026-07': 444,
          },
        },
      };

      expect(getMonthsByMonthId(yarnState)).toEqual({
        '2026-01': {
          month: '2026-01',
          total: 345,
          subTotals: { sockYarn: 123, wool: 222 },
        },
        '2026-02': {
          month: '2026-02',
          total: 1110,
          subTotals: { sockYarn: 544, wool: 566 },
        },
        '2026-03': {
          month: '2026-03',
          total: 1110,
          subTotals: { sockYarn: 544, wool: 566 },
        },
        '2026-04': {
          month: '2026-04',
          total: 1110,
          subTotals: { sockYarn: 544, wool: 566 },
        },
        '2026-05': {
          month: '2026-05',
          total: 1110,
          subTotals: { sockYarn: 544, wool: 566 },
        },
        '2026-06': {
          month: '2026-06',
          total: 1110,
          subTotals: { sockYarn: 544, wool: 566 },
        },
        '2026-07': {
          month: '2026-07',
          total: 988,
          subTotals: { sockYarn: 544, wool: 444 },
        },
        '2026-08': {
          month: '2026-08',
          total: 931,
          subTotals: { sockYarn: 487, wool: 444 },
        },
        '2026-09': {
          month: '2026-09',
          total: 931,
          subTotals: { sockYarn: 487, wool: 444 },
        },
      });
    });
  });

  describe('when a yarn type has no history', () => {
    it('counts it as having none of that yarn', () => {
      jest.setSystemTime(new Date('2026-02-04'));
      const yarnState = {
        wool: { id: 'wool', history: { '2026-01': 300 } },
        cotton: { id: 'cotton', history: {} },
      };

      expect(getMonthsByMonthId(yarnState)['2026-02']).toEqual({
        month: '2026-02',
        total: 300,
        subTotals: { wool: 300, cotton: 0 },
      });
    });
  });

  describe('when the history starts before this year', () => {
    it('returns every month from the first one recorded, in order', () => {
      jest.setSystemTime(new Date('2026-02-04'));
      const yarnState = {
        wool: { id: 'wool', history: { '2026-01': 300, '2025-11': 500 } },
      };

      expect(Object.keys(getMonthsByMonthId(yarnState))).toEqual([
        '2025-11',
        '2025-12',
        '2026-01',
        '2026-02',
      ]);
    });
  });
});

describe('getBallSizes', () => {
  describe('when the amount is a whole number of 200g balls', () => {
    it('returns a full size ball for each 200g', () => {
      expect(getBallSizes(600)).toEqual([1, 1, 1]);
    });
  });

  describe('when there are grams left over', () => {
    it('adds a ball scaled to the leftover grams', () => {
      expect(getBallSizes(2700)).toEqual([
        ...Array.from({ length: 13 }, () => 1),
        0.5,
      ]);
    });
  });

  describe('when there is less than 200g', () => {
    it('returns a single scaled ball', () => {
      expect(getBallSizes(50)).toEqual([0.25]);
    });
  });

  describe('when there is no yarn', () => {
    it('returns no balls', () => {
      expect(getBallSizes(0)).toEqual([]);
    });
  });
});
