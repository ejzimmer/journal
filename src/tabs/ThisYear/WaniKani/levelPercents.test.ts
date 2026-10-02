import { calculatePercentsByLevel, isUnlocked } from './levelPercents';
import { assignments, subjects } from './testFixtures';
import { Assignment, Subject } from './types';

describe('calculatePercentsByLevel', () => {
  describe('counting unlocked subjects', () => {
    it('gives the percent of each type unlocked at every level up to the max', () => {
      expect(
        calculatePercentsByLevel(subjects, assignments, 2, isUnlocked),
      ).toEqual([
        { level: 1, percents: { radical: 100, kanji: 100, vocabulary: 0 } },
        { level: 2, percents: { radical: 0, kanji: 66, vocabulary: 0 } },
      ]);
    });
  });

  describe('when only part of a level is counted', () => {
    it('rounds down so a level only shows 100% once everything is counted', () => {
      const manyRadicals: Subject[] = Array.from({ length: 200 }, (_, id) => ({
        id,
        type: 'radical',
        level: 1,
      }));
      const allButOneUnlocked: Assignment[] = manyRadicals
        .slice(1)
        .map(({ id }) => ({ subjectId: id, srsStage: 1, passedAt: null }));

      const [level] = calculatePercentsByLevel(
        manyRadicals,
        allButOneUnlocked,
        1,
        isUnlocked,
      );

      expect(level.percents.radical).toBe(99);
    });
  });
});
