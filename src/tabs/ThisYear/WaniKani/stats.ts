import {
  Assignment,
  SRS_GROUPS,
  SrsGroup,
  Subject,
  SUBJECT_TYPES,
  SubjectType,
} from './types';

const KANJI_PASS_RATIO = 0.9;

export function getSrsGroup(srsStage: number): SrsGroup | undefined {
  if (srsStage >= 9) return 'burned';
  if (srsStage === 8) return 'enlightened';
  if (srsStage === 7) return 'master';
  if (srsStage >= 5) return 'guru';
  if (srsStage >= 1) return 'apprentice';
  return undefined;
}

function indexAssignmentsBySubject(assignments: Assignment[]) {
  return new Map(
    assignments.map((assignment) => [assignment.subjectId, assignment]),
  );
}

export function countSubjectsBySrsGroup(
  subjects: Subject[],
  assignments: Assignment[],
): Record<SubjectType, { total: number; counts: Record<SrsGroup, number> }> {
  const assignmentsBySubject = indexAssignmentsBySubject(assignments);

  return Object.fromEntries(
    SUBJECT_TYPES.map((type) => {
      const counts = Object.fromEntries(
        SRS_GROUPS.map((group) => [group, 0]),
      ) as Record<SrsGroup, number>;
      const subjectsOfType = subjects.filter(
        (subject) => subject.type === type,
      );
      subjectsOfType.forEach((subject) => {
        const srsStage = assignmentsBySubject.get(subject.id)?.srsStage ?? 0;
        const group = getSrsGroup(srsStage);
        if (group) counts[group]++;
      });
      return [type, { total: subjectsOfType.length, counts }];
    }),
  ) as Record<SubjectType, { total: number; counts: Record<SrsGroup, number> }>;
}

export function calculateBurnedPercentsByLevel(
  subjects: Subject[],
  assignments: Assignment[],
  maxLevel: number,
): { level: number; percents: Record<SubjectType, number> }[] {
  const assignmentsBySubject = indexAssignmentsBySubject(assignments);

  return Array.from({ length: maxLevel }, (_, index) => {
    const level = index + 1;
    const percents = Object.fromEntries(
      SUBJECT_TYPES.map((type) => {
        const subjectsAtLevel = subjects.filter(
          (subject) => subject.level === level && subject.type === type,
        );
        const burned = subjectsAtLevel.filter(
          (subject) =>
            getSrsGroup(assignmentsBySubject.get(subject.id)?.srsStage ?? 0) ===
            'burned',
        ).length;
        return [
          type,
          subjectsAtLevel.length === 0
            ? 0
            : Math.floor((burned / subjectsAtLevel.length) * 100),
        ];
      }),
    ) as Record<SubjectType, number>;
    return { level, percents };
  });
}

export function calculateLevelProgress(
  subjects: Subject[],
  assignments: Assignment[],
  level: number,
) {
  const assignmentsBySubject = indexAssignmentsBySubject(assignments);

  const countPassed = (type: SubjectType) => {
    const subjectsAtLevel = subjects.filter(
      (subject) => subject.level === level && subject.type === type,
    );
    const passed = subjectsAtLevel.filter(
      (subject) => assignmentsBySubject.get(subject.id)?.passedAt,
    ).length;
    return { passed, total: subjectsAtLevel.length };
  };

  const kanji = countPassed('kanji');
  return {
    radical: countPassed('radical'),
    kanji: {
      ...kanji,
      needed: Math.ceil(kanji.total * KANJI_PASS_RATIO),
    },
  };
}
