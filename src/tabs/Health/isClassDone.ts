import { ExerciseClass } from '../../shared/types';

export function isClassDone({ blocks }: ExerciseClass) {
  return blocks.every(
    ({ total, completed }) => (completed?.length ?? 0) === total,
  );
}
