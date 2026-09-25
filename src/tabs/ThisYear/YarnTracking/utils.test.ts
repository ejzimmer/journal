import { buildYarnPile, getBallSizes } from './utils';

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

const JANUARY = Temporal.PlainYearMonth.from('2026-01');
const FEBRUARY = Temporal.PlainYearMonth.from('2026-02');
const MARCH = Temporal.PlainYearMonth.from('2026-03');
const APRIL = Temporal.PlainYearMonth.from('2026-04');
const MAY = Temporal.PlainYearMonth.from('2026-05');

describe('buildYarnPile', () => {
  describe('when yarn has only been added', () => {
    it('has a ball in the stash for each 200g, with the leftover as a smaller ball', () => {
      const wool = { id: 'wool', balances: [{ month: JANUARY, grams: 500 }] };

      expect(buildYarnPile([wool])).toEqual([
        { yarnType: 'wool', size: 1 },
        { yarnType: 'wool', size: 1 },
        { yarnType: 'wool', size: 0.5 },
      ]);
    });
  });

  describe('when yarn is used', () => {
    describe('and a whole number of balls is used', () => {
      it('marks those balls as used in that month', () => {
        const wool = {
          id: 'wool',
          balances: [
            { month: JANUARY, grams: 600 },
            { month: MARCH, grams: 200 },
          ],
        };

        expect(buildYarnPile([wool])).toEqual([
          { yarnType: 'wool', size: 1 },
          { yarnType: 'wool', size: 1, usedIn: MARCH },
          { yarnType: 'wool', size: 1, usedIn: MARCH },
        ]);
      });
    });

    describe('and there is a partial ball', () => {
      it('uses up the partial ball before shrinking a whole one', () => {
        const wool = {
          id: 'wool',
          balances: [
            { month: JANUARY, grams: 700 },
            { month: FEBRUARY, grams: 465 },
          ],
        };

        expect(buildYarnPile([wool])).toEqual([
          { yarnType: 'wool', size: 1 },
          { yarnType: 'wool', size: 1 },
          { yarnType: 'wool', size: 0.325 },
          { yarnType: 'wool', size: 0.5, usedIn: FEBRUARY },
        ]);
      });
    });
  });

  describe('when yarn is added after some has been used', () => {
    it('tops up the partial ball, then restocks a used ball with the rest', () => {
      const wool = {
        id: 'wool',
        balances: [
          { month: JANUARY, grams: 800 },
          { month: FEBRUARY, grams: 300 },
          { month: MARCH, grams: 535 },
        ],
      };

      expect(buildYarnPile([wool])).toEqual([
        { yarnType: 'wool', size: 1 },
        { yarnType: 'wool', size: 1 },
        { yarnType: 'wool', size: 0.675 },
        { yarnType: 'wool', size: 1, usedIn: FEBRUARY },
      ]);
    });

    it('restocks the ball that was used most recently', () => {
      const wool = {
        id: 'wool',
        balances: [
          { month: JANUARY, grams: 600 },
          { month: FEBRUARY, grams: 400 },
          { month: APRIL, grams: 200 },
          { month: MAY, grams: 400 },
        ],
      };

      expect(buildYarnPile([wool])).toEqual([
        { yarnType: 'wool', size: 1 },
        { yarnType: 'wool', size: 1 },
        { yarnType: 'wool', size: 1, usedIn: FEBRUARY },
      ]);
    });

    describe('and more is added than there are used balls to restock', () => {
      it('adds new balls to the pile', () => {
        const wool = {
          id: 'wool',
          balances: [
            { month: JANUARY, grams: 200 },
            { month: FEBRUARY, grams: 0 },
            { month: MARCH, grams: 400 },
          ],
        };

        expect(buildYarnPile([wool])).toEqual([
          { yarnType: 'wool', size: 1 },
          { yarnType: 'wool', size: 1 },
        ]);
      });
    });
  });

  describe('when there are several yarn types', () => {
    it('restocks a used ball of one type with another', () => {
      const wool = {
        id: 'wool',
        balances: [
          { month: JANUARY, grams: 400 },
          { month: FEBRUARY, grams: 200 },
        ],
      };
      const cotton = { id: 'cotton', balances: [{ month: MARCH, grams: 200 }] };

      expect(buildYarnPile([wool, cotton])).toEqual([
        { yarnType: 'wool', size: 1 },
        { yarnType: 'cotton', size: 1 },
      ]);
    });

    describe('and one is used in the same month another is added', () => {
      it('restocks the ball used that month rather than growing the pile', () => {
        const cotton = {
          id: 'cotton',
          balances: [
            { month: JANUARY, grams: 0 },
            { month: FEBRUARY, grams: 200 },
          ],
        };
        const wool = {
          id: 'wool',
          balances: [
            { month: JANUARY, grams: 200 },
            { month: FEBRUARY, grams: 0 },
          ],
        };

        expect(buildYarnPile([cotton, wool])).toEqual([
          { yarnType: 'cotton', size: 1 },
        ]);
      });
    });
  });
});
