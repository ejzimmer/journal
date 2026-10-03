import { CSSProperties, useMemo } from 'react';
import { ExerciseClass } from '../../shared/types';
import { useHealthStorage } from './HealthStorageContext';
import { Sessions } from './Sessions';
import './ExerciseClasses.css';

export function ExerciseClasses() {
  const { classes } = useHealthStorage();
  const setClassColumns = useMemo(
    () => countSetClassColumns(classes),
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
        <li
          key={exerciseClass.id}
          className={`exercise-class ${isClassDone(exerciseClass) ? 'done' : ''}`}
        >
          <div className="name">{exerciseClass.description}</div>
          {exerciseClass.blocks.length === 1 ? (
            <SetClass exerciseClass={exerciseClass} columns={setClassColumns} />
          ) : (
            <WeeklyClass exerciseClass={exerciseClass} />
          )}
        </li>
      ))}
    </ul>
  );
}

const MIN_SET_CLASS_COLUMNS = 4;

type ClassProps = { exerciseClass: ExerciseClass };

function SetClass({
  exerciseClass,
  columns,
}: ClassProps & { columns: (total: number) => number }) {
  return (
    <div
      className="set-class"
      style={
        { '--columns': columns(exerciseClass.blocks[0].total) } as CSSProperties
      }
    >
      <Sessions
        exerciseClass={exerciseClass}
        blockIndex={0}
        getSessionName={(index) => `Class ${index + 1}`}
      />
    </div>
  );
}

function WeeklyClass({ exerciseClass }: ClassProps) {
  return (
    <div className="weekly-class">
      {exerciseClass.blocks.map((week, weekIndex) => (
        <Sessions
          key={week.id}
          exerciseClass={exerciseClass}
          blockIndex={weekIndex}
          getSessionName={(index) =>
            `Week ${weekIndex + 1}, class ${index + 1}`
          }
        />
      ))}
    </div>
  );
}

function countSetClassColumns(classes: ExerciseClass[]) {
  const tallestWeeklyClass = Math.max(
    1,
    ...classes
      .filter(({ blocks }) => blocks.length > 1)
      .map(({ blocks }) => blocks.length),
  );
  return (total: number) =>
    Math.max(MIN_SET_CLASS_COLUMNS, Math.ceil(total / tallestWeeklyClass));
}

function isClassDone({ blocks }: ExerciseClass) {
  return blocks.every(
    ({ total, completed }) => (completed?.length ?? 0) === total,
  );
}
