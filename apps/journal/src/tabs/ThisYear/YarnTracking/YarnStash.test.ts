import { YarnStash } from './YarnStash';
import { YarnType } from './types';

const JANUARY = Temporal.PlainYearMonth.from('2026-01');
const FEBRUARY = Temporal.PlainYearMonth.from('2026-02');
const MARCH = Temporal.PlainYearMonth.from('2026-03');
const APRIL = Temporal.PlainYearMonth.from('2026-04');
const MAY = Temporal.PlainYearMonth.from('2026-05');

describe('YarnStash', () => {
  describe('applyBalances', () => {
    describe('when yarn has only been added', () => {
      it('has a ball for each 200g, with the leftover as a smaller ball', () => {
        const stash = new YarnStash();

        stash.applyBalances([
          { id: 'wool', balances: [{ month: JANUARY, grams: 500 }] },
        ]);

        expect(stash.balls).toEqual([
          { id: 0, yarnType: 'wool', grams: 200 },
          { id: 1, yarnType: 'wool', grams: 200 },
          { id: 2, yarnType: 'wool', grams: 100 },
        ]);
      });
    });

    describe('when yarn is used', () => {
      describe('and a whole number of balls is used', () => {
        it('marks those balls as used in that month', () => {
          const stash = new YarnStash();

          stash.applyBalances([
            {
              id: 'wool',
              balances: [
                { month: JANUARY, grams: 600 },
                { month: MARCH, grams: 200 },
              ],
            },
          ]);

          expect(stash.balls).toEqual([
            { id: 0, yarnType: 'wool', grams: 200, usedIn: MARCH },
            { id: 1, yarnType: 'wool', grams: 200, usedIn: MARCH },
            { id: 2, yarnType: 'wool', grams: 200 },
          ]);
        });
      });

      describe('and there is a partial ball', () => {
        it('uses up the partial ball before shrinking a whole one', () => {
          const stash = new YarnStash();

          stash.applyBalances([
            {
              id: 'wool',
              balances: [
                { month: JANUARY, grams: 700 },
                { month: FEBRUARY, grams: 465 },
              ],
            },
          ]);

          expect(stash.balls).toEqual([
            { id: 0, yarnType: 'wool', grams: 65 },
            { id: 1, yarnType: 'wool', grams: 200 },
            { id: 2, yarnType: 'wool', grams: 200 },
            { id: 3, yarnType: 'wool', grams: 100, usedIn: FEBRUARY },
          ]);
        });
      });
    });

    describe('when yarn is added after some has been used', () => {
      it('tops up the partial ball, then restocks a used ball with the rest', () => {
        const stash = new YarnStash();

        stash.applyBalances([
          {
            id: 'wool',
            balances: [
              { month: JANUARY, grams: 800 },
              { month: FEBRUARY, grams: 300 },
              { month: MARCH, grams: 535 },
            ],
          },
        ]);

        expect(stash.balls).toEqual([
          { id: 0, yarnType: 'wool', grams: 200, usedIn: FEBRUARY },
          { id: 4, yarnType: 'wool', grams: 135 },
          { id: 2, yarnType: 'wool', grams: 200 },
          { id: 3, yarnType: 'wool', grams: 200 },
        ]);
      });

      it('restocks the ball that was used most recently', () => {
        const stash = new YarnStash();

        stash.applyBalances([
          {
            id: 'wool',
            balances: [
              { month: JANUARY, grams: 600 },
              { month: FEBRUARY, grams: 400 },
              { month: APRIL, grams: 200 },
              { month: MAY, grams: 400 },
            ],
          },
        ]);

        expect(stash.balls).toEqual([
          { id: 0, yarnType: 'wool', grams: 200, usedIn: FEBRUARY },
          { id: 3, yarnType: 'wool', grams: 200 },
          { id: 2, yarnType: 'wool', grams: 200 },
        ]);
      });

      describe('and more is added than there are used balls to restock', () => {
        it('adds new balls to the stash', () => {
          const stash = new YarnStash();

          stash.applyBalances([
            {
              id: 'wool',
              balances: [
                { month: JANUARY, grams: 200 },
                { month: FEBRUARY, grams: 0 },
                { month: MARCH, grams: 400 },
              ],
            },
          ]);

          expect(stash.balls).toEqual([
            { id: 1, yarnType: 'wool', grams: 200 },
            { id: 2, yarnType: 'wool', grams: 200 },
          ]);
        });
      });
    });

    describe('when there are several yarn types', () => {
      it('restocks a used ball of one type with another', () => {
        const stash = new YarnStash();

        stash.applyBalances([
          {
            id: 'wool',
            balances: [
              { month: JANUARY, grams: 400 },
              { month: FEBRUARY, grams: 200 },
            ],
          },
          { id: 'cotton', balances: [{ month: MARCH, grams: 200 }] },
        ]);

        expect(stash.balls).toEqual([
          { id: 2, yarnType: 'cotton', grams: 200 },
          { id: 1, yarnType: 'wool', grams: 200 },
        ]);
      });

      describe('and one is used in the same month another is added', () => {
        it('restocks the ball used that month rather than adding one', () => {
          const stash = new YarnStash();

          stash.applyBalances([
            {
              id: 'cotton',
              balances: [
                { month: JANUARY, grams: 0 },
                { month: FEBRUARY, grams: 200 },
              ],
            },
            {
              id: 'wool',
              balances: [
                { month: JANUARY, grams: 200 },
                { month: FEBRUARY, grams: 0 },
              ],
            },
          ]);

          expect(stash.balls).toEqual([
            { id: 1, yarnType: 'cotton', grams: 200 },
          ]);
        });
      });
    });

    describe('when balances have already been applied', () => {
      describe('and they have not changed', () => {
        it('leaves the stash as it was', () => {
          const stash = new YarnStash();
          const wool: YarnType = {
            id: 'wool',
            balances: [
              { month: JANUARY, grams: 700 },
              { month: FEBRUARY, grams: 465 },
            ],
          };

          stash.applyBalances([wool]);
          stash.applyBalances([wool]);

          expect(stash.balls).toEqual([
            { id: 0, yarnType: 'wool', grams: 65 },
            { id: 1, yarnType: 'wool', grams: 200 },
            { id: 2, yarnType: 'wool', grams: 200 },
            { id: 3, yarnType: 'wool', grams: 100, usedIn: FEBRUARY },
          ]);
        });
      });

      describe('and the latest month has a new balance', () => {
        it('applies the difference from the current balance', () => {
          const stash = new YarnStash();

          stash.applyBalances([
            { id: 'wool', balances: [{ month: MARCH, grams: 400 }] },
          ]);
          stash.applyBalances([
            { id: 'wool', balances: [{ month: MARCH, grams: 300 }] },
          ]);

          expect(stash.balls).toEqual([
            { id: 0, yarnType: 'wool', grams: 100 },
            { id: 1, yarnType: 'wool', grams: 200 },
          ]);
        });
      });

      describe('and a later month has been added', () => {
        it('applies only the later month', () => {
          const stash = new YarnStash();

          stash.applyBalances([
            { id: 'wool', balances: [{ month: MARCH, grams: 400 }] },
          ]);
          stash.applyBalances([
            {
              id: 'wool',
              balances: [
                { month: MARCH, grams: 400 },
                { month: APRIL, grams: 600 },
              ],
            },
          ]);

          expect(stash.balls).toEqual([
            { id: 0, yarnType: 'wool', grams: 200 },
            { id: 1, yarnType: 'wool', grams: 200 },
            { id: 2, yarnType: 'wool', grams: 200 },
          ]);
        });
      });
    });
  });

  describe('ball ids', () => {
    describe('when a ball shrinks and is then used up', () => {
      it('keeps the id it was stocked with', () => {
        const stash = new YarnStash();
        const wool = (grams: number): YarnType => ({
          id: 'wool',
          balances: [{ month: JANUARY, grams }],
        });

        stash.applyBalances([wool(200)]);
        const [ball] = stash.balls;
        stash.applyBalances([wool(50)]);
        stash.applyBalances([wool(0)]);

        expect(stash.balls).toEqual([
          { id: ball.id, yarnType: 'wool', grams: 50, usedIn: JANUARY },
        ]);
      });
    });

    describe('when a used ball is restocked', () => {
      it('gives the restocked ball a new id', () => {
        const stash = new YarnStash();

        stash.applyBalances([
          {
            id: 'wool',
            balances: [
              { month: JANUARY, grams: 200 },
              { month: FEBRUARY, grams: 0 },
            ],
          },
        ]);
        const [usedBall] = stash.balls;
        stash.applyBalances([
          {
            id: 'wool',
            balances: [
              { month: FEBRUARY, grams: 0 },
              { month: MARCH, grams: 200 },
            ],
          },
        ]);

        expect(stash.balls).toEqual([
          { id: usedBall.id + 1, yarnType: 'wool', grams: 200 },
        ]);
      });
    });
  });

  describe('getBalance', () => {
    it('adds up the unused grams of one yarn type', () => {
      const stash = new YarnStash();

      stash.applyBalances([
        {
          id: 'wool',
          balances: [
            { month: JANUARY, grams: 700 },
            { month: FEBRUARY, grams: 465 },
          ],
        },
        { id: 'cotton', balances: [{ month: JANUARY, grams: 100 }] },
      ]);

      expect(stash.getBalance('wool')).toBe(465);
    });
  });

  describe('getTotalBalance', () => {
    it('adds up the unused grams of every yarn type', () => {
      const stash = new YarnStash();

      stash.applyBalances([
        {
          id: 'wool',
          balances: [
            { month: JANUARY, grams: 700 },
            { month: FEBRUARY, grams: 465 },
          ],
        },
        { id: 'cotton', balances: [{ month: JANUARY, grams: 100 }] },
      ]);

      expect(stash.getTotalBalance()).toBe(565);
    });
  });
});
