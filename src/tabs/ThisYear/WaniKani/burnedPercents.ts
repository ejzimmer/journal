import { indexAssignmentsBySubject } from './indexAssignmentsBySubject';
import { getSrsGroup } from './srsGroups';
import { Assignment, Subject, SUBJECT_TYPES, SubjectType } from './types';

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
