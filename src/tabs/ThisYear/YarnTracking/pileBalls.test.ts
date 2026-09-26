import { getPileBalls } from './pileBalls';

describe('getPileBalls', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-11'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('a ball that has not been used', () => {
    it('is not faded', () => {
      const ball = { id: 0, yarnType: 'wool' as const, grams: 200 };

      expect(getPileBalls([ball])).toEqual([{ ball, fade: undefined }]);
    });
  });

  describe('a ball that has been used', () => {
    describe('when seen from an earlier month', () => {
      it('fades by how long before that month it was used', () => {
        const ball = {
          id: 0,
          yarnType: 'wool' as const,
          grams: 200,
          usedIn: Temporal.PlainYearMonth.from('2026-06'),
        };

        expect(
          getPileBalls([ball], Temporal.PlainYearMonth.from('2026-08')),
        ).toEqual([{ ball, fade: 2 / 12 }]);
      });
    });

    describe('less than a year ago', () => {
      it('fades in proportion to how long ago it was used', () => {
        const ball = {
          id: 0,
          yarnType: 'wool' as const,
          grams: 200,
          usedIn: Temporal.PlainYearMonth.from('2026-06'),
        };

        expect(getPileBalls([ball])).toEqual([{ ball, fade: 0.25 }]);
      });
    });

    describe('a year or more ago', () => {
      it('is left out of the pile', () => {
        const recent = {
          id: 0,
          yarnType: 'wool' as const,
          grams: 200,
          usedIn: Temporal.PlainYearMonth.from('2025-10'),
        };
        const gone = {
          ...recent,
          id: 1,
          usedIn: Temporal.PlainYearMonth.from('2025-09'),
        };

        expect(getPileBalls([gone, recent])).toEqual([
          { ball: recent, fade: 11 / 12 },
        ]);
      });
    });
  });
});
