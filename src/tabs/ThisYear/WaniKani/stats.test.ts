import {
  calculateBurnedPercentsByLevel,
  calculateLevelProgress,
  countSubjectsBySrsGroup,
  getSrsGroup,
} from './stats';
import { Assignment, Subject } from './types';

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
