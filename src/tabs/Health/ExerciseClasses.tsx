import { useMemo } from 'react';
import { ExerciseClass } from '../../shared/types';
import { useHealthStorage } from './HealthStorageContext';
import { Sessions } from './Sessions';
import './ExerciseClasses.css';

export function ExerciseClasses() {
  const { classes } = useHealthStorage();
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
        <li
          key={exerciseClass.id}
          className={isClassDone(exerciseClass) ? 'done' : ''}
        >
          <div className="description">{exerciseClass.description}</div>
          {exerciseClass.blocks.length === 1 ? (
            <SetClass exerciseClass={exerciseClass} />
          ) : (
            <WeeklyClass exerciseClass={exerciseClass} />
          )}
        </li>
      ))}
    </ul>
  );
}

type ClassProps = { exerciseClass: ExerciseClass };

function SetClass({ exerciseClass }: ClassProps) {
  return (
    <Sessions
      exerciseClass={exerciseClass}
      blockIndex={0}
      getSessionName={(index) => `Class ${index + 1}`}
    />
  );
}

function WeeklyClass({ exerciseClass }: ClassProps) {
  return exerciseClass.blocks.map((week, weekIndex) => (
    <Sessions
      key={week.id}
      exerciseClass={exerciseClass}
      blockIndex={weekIndex}
      getSessionName={(index) => `Week ${weekIndex + 1}, class ${index + 1}`}
    />
  ));
}

function isClassDone({ blocks }: ExerciseClass) {
  return blocks.every(
    ({ total, completed }) => (completed?.length ?? 0) === total,
  );
}
