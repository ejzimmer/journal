import { useMemo } from 'react';
import { ExerciseClass } from '../../shared/types';
import { useHealthStorage } from './HealthStorageContext';
import { ExerciseClassCard } from './ExerciseClassCard';
import { isClassDone } from './isClassDone';
import './ExerciseClasses.css';

const MIN_SET_CLASS_COLUMNS = 4;

export function ExerciseClasses() {
  const { classes } = useHealthStorage();
  const countSetClassColumns = useMemo(
    () => createSetClassColumnCounter(classes),
    [classes],
  );
  const sortedClasses = useMemo(
    () =>
      classes.toSorted(
        (a, b) => Number(isClassDone(a)) - Number(isClassDone(b)),
      ),
    [classes],
  );

  return (
    <ul className="exercise-classes">
      {sortedClasses.map((exerciseClass) => (
        <ExerciseClassCard
          key={exerciseClass.id}
          exerciseClass={exerciseClass}
          countSetClassColumns={countSetClassColumns}
        />
      ))}
    </ul>
  );
}

function createSetClassColumnCounter(classes: ExerciseClass[]) {
  const tallestWeeklyClass = Math.max(
    1,
    ...classes
      .filter(({ blocks }) => blocks.length > 1)
      .map(({ blocks }) => blocks.length),
  );
  return (total: number) =>
    Math.max(MIN_SET_CLASS_COLUMNS, Math.ceil(total / tallestWeeklyClass));
}
