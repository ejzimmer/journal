import { buildYarnPile, getBallSizes } from './utils';
import { convertToYarnType } from './YarnStorageContext';
import { StoredYarn, YarnBall } from './types';

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

const buildPile = (storedYarn: StoredYarn) =>
  buildYarnPile(Object.values(storedYarn).map(convertToYarnType)).map(
    ({ usedIn, ...ball }: YarnBall) =>
      usedIn ? { ...ball, usedIn: usedIn.toString() } : ball,
  );

const createYarn = (history: Record<string, number>) => ({
  wool: { id: 'wool', history },
});

describe('buildYarnPile', () => {
  describe('when yarn has only been added', () => {
    it('has a ball in the stash for each 200g, with the leftover as a smaller ball', () => {
      expect(buildPile(createYarn({ '2026-01': 500 }))).toEqual([
        { yarnType: 'wool', size: 1 },
        { yarnType: 'wool', size: 1 },
        { yarnType: 'wool', size: 0.5 },
      ]);
    });
  });

  describe('when yarn is used', () => {
    describe('and a whole number of balls is used', () => {
      it('marks those balls as used in that month', () => {
        expect(
          buildPile(createYarn({ '2026-01': 600, '2026-03': 200 })),
        ).toEqual([
          { yarnType: 'wool', size: 1 },
          { yarnType: 'wool', size: 1, usedIn: '2026-03' },
          { yarnType: 'wool', size: 1, usedIn: '2026-03' },
        ]);
      });
    });

    describe('and there is a partial ball', () => {
      it('uses up the partial ball before shrinking a whole one', () => {
        expect(
          buildPile(createYarn({ '2026-01': 700, '2026-02': 465 })),
        ).toEqual([
          { yarnType: 'wool', size: 1 },
          { yarnType: 'wool', size: 1 },
          { yarnType: 'wool', size: 0.325 },
          { yarnType: 'wool', size: 0.5, usedIn: '2026-02' },
        ]);
      });
    });
  });

  describe('when yarn is added after some has been used', () => {
    it('tops up the partial ball, then restocks a used ball with the rest', () => {
      expect(
        buildPile(
          createYarn({ '2026-01': 800, '2026-02': 300, '2026-03': 535 }),
        ),
      ).toEqual([
        { yarnType: 'wool', size: 1 },
        { yarnType: 'wool', size: 1 },
        { yarnType: 'wool', size: 0.675 },
        { yarnType: 'wool', size: 1, usedIn: '2026-02' },
      ]);
    });

    it('restocks the ball that was used most recently', () => {
      expect(
        buildPile(
          createYarn({
            '2026-01': 600,
            '2026-02': 400,
            '2026-04': 200,
            '2026-05': 400,
          }),
        ),
      ).toEqual([
        { yarnType: 'wool', size: 1 },
        { yarnType: 'wool', size: 1 },
        { yarnType: 'wool', size: 1, usedIn: '2026-02' },
      ]);
    });

    describe('and more is added than there are used balls to restock', () => {
      it('adds new balls to the pile', () => {
        expect(
          buildPile(
            createYarn({ '2026-01': 200, '2026-02': 0, '2026-03': 400 }),
          ),
        ).toEqual([
          { yarnType: 'wool', size: 1 },
          { yarnType: 'wool', size: 1 },
        ]);
      });
    });
  });

  describe('when there are several yarn types', () => {
    it('restocks a used ball of one type with another', () => {
      expect(
        buildPile({
          wool: { id: 'wool', history: { '2026-01': 400, '2026-02': 200 } },
          cotton: { id: 'cotton', history: { '2026-03': 200 } },
        }),
      ).toEqual([
        { yarnType: 'wool', size: 1 },
        { yarnType: 'cotton', size: 1 },
      ]);
    });

    describe('and one is used in the same month another is added', () => {
      it('restocks the ball used that month rather than growing the pile', () => {
        expect(
          buildPile({
            cotton: { id: 'cotton', history: { '2026-01': 0, '2026-02': 200 } },
            wool: { id: 'wool', history: { '2026-01': 200, '2026-02': 0 } },
          }),
        ).toEqual([{ yarnType: 'cotton', size: 1 }]);
      });
    });
  });
});
