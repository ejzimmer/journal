import { getBallSizes, getHistoryByMonth } from './utils';

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
          '26-01': 123,
          '26-02': 544,
          '26-03': 487,
        },
      },
      wool: {
        id: 'wool',
        history: {
          '26-01': 222,
          '26-02': 566,
          '26-03': 444,
        },
      },
    };

    expect(getHistoryByMonth(yarnState)).toEqual({
      '26-01': {
        month: '26-01',
        total: 345,
        subTotals: { sockYarn: 123, wool: 222 },
      },
      '26-02': {
        month: '26-02',
        total: 1110,
        subTotals: { sockYarn: 544, wool: 566 },
      },
      '26-03': {
        month: '26-03',
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
            '26-01': 123,
            '26-02': 544,
            '26-08': 487,
          },
        },
        wool: {
          id: 'wool',
          history: {
            '26-01': 222,
            '26-02': 566,
            '26-07': 444,
          },
        },
      };

      expect(getHistoryByMonth(yarnState)).toEqual({
        '26-01': {
          month: '26-01',
          total: 345,
          subTotals: { sockYarn: 123, wool: 222 },
        },
        '26-02': {
          month: '26-02',
          total: 1110,
          subTotals: { sockYarn: 544, wool: 566 },
        },
        '26-03': {
          month: '26-03',
          total: 1110,
          subTotals: { sockYarn: 544, wool: 566 },
        },
        '26-04': {
          month: '26-04',
          total: 1110,
          subTotals: { sockYarn: 544, wool: 566 },
        },
        '26-05': {
          month: '26-05',
          total: 1110,
          subTotals: { sockYarn: 544, wool: 566 },
        },
        '26-06': {
          month: '26-06',
          total: 1110,
          subTotals: { sockYarn: 544, wool: 566 },
        },
        '26-07': {
          month: '26-07',
          total: 988,
          subTotals: { sockYarn: 544, wool: 444 },
        },
        '26-08': {
          month: '26-08',
          total: 931,
          subTotals: { sockYarn: 487, wool: 444 },
        },
        '26-09': {
          month: '26-09',
          total: 931,
          subTotals: { sockYarn: 487, wool: 444 },
        },
      });
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
