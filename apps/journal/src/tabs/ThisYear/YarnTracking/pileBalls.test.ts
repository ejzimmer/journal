import { getLatestMonthOfYear, getPileBalls } from './pileBalls';

const AUGUST = Temporal.PlainYearMonth.from('2026-08');

describe('getPileBalls', () => {
  describe('a ball that has not been used', () => {
    it('is not faded', () => {
      const ball = { id: 0, yarnType: 'wool' as const, grams: 200 };

      expect(getPileBalls([ball], AUGUST)).toEqual([{ ball, fade: undefined }]);
    });
  });

  describe('a ball that has been used', () => {
    it('fades by how long before the month it was used', () => {
      const ball = {
        id: 0,
        yarnType: 'wool' as const,
        grams: 200,
        usedIn: Temporal.PlainYearMonth.from('2026-06'),
      };

      expect(getPileBalls([ball], AUGUST)).toEqual([{ ball, fade: 2 / 12 }]);
    });
  });
});

describe('getLatestMonthOfYear', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-11'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('for this year', () => {
    it('is this month', () => {
      expect(getLatestMonthOfYear(2026).toString()).toBe('2026-09');
    });
  });

  describe('for an earlier year', () => {
    it('is that December', () => {
      expect(getLatestMonthOfYear(2025).toString()).toBe('2025-12');
    });
  });
});
