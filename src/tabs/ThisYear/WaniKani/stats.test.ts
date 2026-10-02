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
  afterEach(() => {
    jest.useRealTimers();
  });

  function setToday(date: string) {
    jest.useFakeTimers({ now: new Date(`${date}T00:00:00Z`) });
  }

  function createProgression(
    level: number,
    unlockedOn: string,
    passedOn?: string,
  ): LevelProgression {
    return {
      level,
      unlockedAt: `${unlockedOn}T00:00:00Z`,
      passedAt: passedOn ? `${passedOn}T00:00:00Z` : null,
      abandonedAt: null,
    };
  }

  describe('on level 58 after two 10-day levels', () => {
    const progressions = [
      createProgression(56, '2026-01-01', '2026-01-11'),
      createProgression(57, '2026-01-11', '2026-01-21'),
      createProgression(58, '2026-01-21'),
    ];

    it('adds what is left of the current level to the remaining levels', () => {
      setToday('2026-01-25');

      expect(predictDaysToFinish(progressions, 58)).toBe(26);
    });

    describe('when the current level has run over the average', () => {
      it('counts only the remaining levels', () => {
        setToday('2026-02-10');

        expect(predictDaysToFinish(progressions, 58)).toBe(20);
      });
    });
  });

  describe('when one level took unusually long', () => {
    it('leaves it out of the average', () => {
      setToday('2026-05-21');
      const progressions = [
        createProgression(54, '2026-01-01', '2026-01-11'),
        createProgression(55, '2026-01-11', '2026-01-21'),
        createProgression(56, '2026-01-21', '2026-01-31'),
        createProgression(57, '2026-01-31', '2026-05-11'),
        createProgression(58, '2026-05-11', '2026-05-21'),
        createProgression(59, '2026-05-21'),
      ];

      expect(predictDaysToFinish(progressions, 59)).toBe(20);
    });
  });

  describe('after a reset', () => {
    it('only uses the levels done since the reset', () => {
      setToday('2026-03-12');
      const progressions = [
        {
          ...createProgression(58, '2026-01-01', '2026-02-20'),
          abandonedAt: '2026-03-02T00:00:00Z',
        },
        createProgression(58, '2026-03-02', '2026-03-12'),
        createProgression(59, '2026-03-12'),
      ];

      expect(predictDaysToFinish(progressions, 59)).toBe(20);
    });
  });

  describe('once level 60 is passed', () => {
    it('has nothing left', () => {
      setToday('2026-01-21');

      expect(
        predictDaysToFinish(
          [createProgression(60, '2026-01-01', '2026-01-11')],
          60,
        ),
      ).toBe(0);
    });
  });

  describe('before any level is passed', () => {
    it('makes no prediction', () => {
      setToday('2026-01-02');

      expect(
        predictDaysToFinish([createProgression(1, '2026-01-01')], 1),
      ).toBeUndefined();
    });
  });
});
