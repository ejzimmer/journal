import {
  calculateBurnedPercentsByLevel,
  calculateLevelProgress,
  countSubjectsBySrsGroup,
  getSrsGroup,
  predictDaysToFinish,
  removeOutliers,
} from './stats';
import { Assignment, LevelProgression, Subject } from './types';

const subjects: Subject[] = [
  { id: 1, type: 'radical', level: 1 },
  { id: 2, type: 'radical', level: 1 },
  { id: 3, type: 'kanji', level: 1 },
  { id: 4, type: 'kanji', level: 2 },
  { id: 5, type: 'kanji', level: 2 },
  { id: 6, type: 'kanji', level: 2 },
  { id: 7, type: 'vocabulary', level: 2 },
];

const assignments: Assignment[] = [
  { subjectId: 1, srsStage: 9, passedAt: '2026-01-01T00:00:00Z' },
  { subjectId: 2, srsStage: 8, passedAt: '2026-01-01T00:00:00Z' },
  { subjectId: 3, srsStage: 9, passedAt: '2026-01-01T00:00:00Z' },
  { subjectId: 4, srsStage: 4, passedAt: '2026-01-01T00:00:00Z' },
  { subjectId: 5, srsStage: 2, passedAt: null },
  { subjectId: 7, srsStage: 0, passedAt: null },
];

describe('getSrsGroup', () => {
  it.each([
    [1, 'apprentice'],
    [4, 'apprentice'],
    [5, 'guru'],
    [6, 'guru'],
    [7, 'master'],
    [8, 'enlightened'],
    [9, 'burned'],
  ])('puts stage %i in %s', (stage, group) => {
    expect(getSrsGroup(stage)).toBe(group);
  });

  it('puts unstarted lessons in no group', () => {
    expect(getSrsGroup(0)).toBeUndefined();
  });
});

describe('countSubjectsBySrsGroup', () => {
  const counts = countSubjectsBySrsGroup(subjects, assignments);

  it('counts every subject of each type in the total', () => {
    expect(counts.radical.total).toBe(2);
    expect(counts.kanji.total).toBe(4);
    expect(counts.vocabulary.total).toBe(1);
  });

  it('counts each subject in the group for its SRS stage', () => {
    expect(counts.kanji.counts).toEqual({
      apprentice: 2,
      guru: 0,
      master: 0,
      enlightened: 0,
      burned: 1,
    });
  });
});

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

describe('calculateLevelProgress', () => {
  const progress = calculateLevelProgress(subjects, assignments, 2);

  it('counts the kanji passed at the level', () => {
    expect(progress.kanji.passed).toBe(1);
    expect(progress.kanji.total).toBe(3);
  });

  it('needs 90% of the level’s kanji passed, rounded up', () => {
    expect(progress.kanji.needed).toBe(3);
  });

  it('counts the radicals passed at the level', () => {
    expect(calculateLevelProgress(subjects, assignments, 1).radical).toEqual({
      passed: 2,
      total: 2,
    });
  });
});

describe('removeOutliers', () => {
  it('drops values far above the upper quartile', () => {
    expect(removeOutliers([7, 8, 8, 9, 10, 60])).toEqual([7, 8, 8, 9, 10]);
  });

  describe('with fewer than four values', () => {
    it('keeps them all', () => {
      expect(removeOutliers([7, 8, 60])).toEqual([7, 8, 60]);
    });
  });
});

describe('predictDaysToFinish', () => {
  const firstDay = Temporal.ZonedDateTime.from('2026-01-01T00:00:00[UTC]');

  function createProgression(
    level: number,
    unlockedDay: number,
    passedDay?: number,
  ): LevelProgression {
    return {
      level,
      unlockedAt: firstDay.add({ days: unlockedDay }).toInstant().toString(),
      passedAt:
        passedDay === undefined
          ? null
          : firstDay.add({ days: passedDay }).toInstant().toString(),
      abandonedAt: null,
    };
  }

  describe('on level 58 after two 10-day levels', () => {
    const progressions = [
      createProgression(56, 0, 10),
      createProgression(57, 10, 20),
      createProgression(58, 20),
    ];

    it('adds what is left of the current level to the remaining levels', () => {
      expect(
        predictDaysToFinish(
          progressions,
          58,
          firstDay.add({ days: 24 }).toInstant(),
        ),
      ).toBe(26);
    });

    describe('when the current level has run over the average', () => {
      it('counts only the remaining levels', () => {
        expect(
          predictDaysToFinish(
            progressions,
            58,
            firstDay.add({ days: 40 }).toInstant(),
          ),
        ).toBe(20);
      });
    });
  });

  describe('when one level took unusually long', () => {
    it('leaves it out of the average', () => {
      const progressions = [
        createProgression(54, 0, 10),
        createProgression(55, 10, 20),
        createProgression(56, 20, 30),
        createProgression(57, 30, 130),
        createProgression(58, 130, 140),
        createProgression(59, 140),
      ];

      expect(
        predictDaysToFinish(
          progressions,
          59,
          firstDay.add({ days: 140 }).toInstant(),
        ),
      ).toBe(20);
    });
  });

  describe('after a reset', () => {
    it('only uses the levels done since the reset', () => {
      const progressions = [
        {
          ...createProgression(58, 0, 50),
          abandonedAt: firstDay.add({ days: 60 }).toInstant().toString(),
        },
        createProgression(58, 60, 70),
        createProgression(59, 70),
      ];

      expect(
        predictDaysToFinish(
          progressions,
          59,
          firstDay.add({ days: 70 }).toInstant(),
        ),
      ).toBe(20);
    });
  });

  describe('once level 60 is passed', () => {
    it('has nothing left', () => {
      expect(
        predictDaysToFinish(
          [createProgression(60, 0, 10)],
          60,
          firstDay.add({ days: 20 }).toInstant(),
        ),
      ).toBe(0);
    });
  });

  describe('before any level is passed', () => {
    it('makes no prediction', () => {
      expect(
        predictDaysToFinish(
          [createProgression(1, 0)],
          1,
          firstDay.add({ days: 1 }).toInstant(),
        ),
      ).toBeUndefined();
    });
  });
});
