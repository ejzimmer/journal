import { calculateBurnedPercentsByLevel } from './burnedPercents';
import { assignments, subjects } from './testFixtures';
import { Assignment, Subject } from './types';

describe('calculateBurnedPercentsByLevel', () => {
  it('gives the percent of each type burned at every level up to the max', () => {
    expect(calculateBurnedPercentsByLevel(subjects, assignments, 2)).toEqual([
      { level: 1, percents: { radical: 50, kanji: 100, vocabulary: 0 } },
      { level: 2, percents: { radical: 0, kanji: 0, vocabulary: 0 } },
    ]);
  });

  describe('when only part of a level is burned', () => {
    it('rounds down so a level only shows 100% once everything is burned', () => {
      const manyRadicals: Subject[] = Array.from({ length: 200 }, (_, id) => ({
        id,
        type: 'radical',
        level: 1,
      }));
      const allButOneBurned: Assignment[] = manyRadicals
        .slice(1)
        .map(({ id }) => ({ subjectId: id, srsStage: 9, passedAt: null }));

      const [level] = calculateBurnedPercentsByLevel(
        manyRadicals,
        allButOneBurned,
        1,
      );

      expect(level.percents.radical).toBe(99);
    });
  });
});
