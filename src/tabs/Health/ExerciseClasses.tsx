import { useMemo } from 'react';
import { EmojiCheckbox } from '../../shared/controls/EmojiCheckbox';
import { ClassTimes, ExerciseClass } from '../../shared/types';
import { useHealthStorage } from './HealthStorageContext';
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
          {exerciseClass.times.length === 1 ? (
            <SetClass exerciseClass={exerciseClass} />
          ) : (
            <WeeklyClass exerciseClass={exerciseClass} />
          )}
        </li>
      ))}
    </ul>
  );
}

function SetClass({ exerciseClass }: { exerciseClass: ExerciseClass }) {
  return (
    <Sessions
      exerciseClass={exerciseClass}
      weekIndex={0}
      getSessionName={(index) => `Class ${index + 1}`}
    />
  );
}

function WeeklyClass({ exerciseClass }: { exerciseClass: ExerciseClass }) {
  return exerciseClass.times.map((week, weekIndex) => (
    <Sessions
      key={week.id}
      exerciseClass={exerciseClass}
      weekIndex={weekIndex}
      getSessionName={(index) => `Week ${weekIndex + 1}, class ${index + 1}`}
    />
  ));
}

type SessionsProps = {
  exerciseClass: ExerciseClass;
  weekIndex: number;
  getSessionName: (index: number) => string;
};

function Sessions({ exerciseClass, weekIndex, getSessionName }: SessionsProps) {
  const { updateClass } = useHealthStorage();
  const week = exerciseClass.times[weekIndex];
  const completed = week.completed ?? [];

  return (
    <div className="completions">
      {Array.from({ length: week.total }, (_, index) => (
        <div className="tooltip-container" key={index}>
          <div className="tooltip-anchor">
            <EmojiCheckbox
              label={`${exerciseClass.description}: ${getSessionName(index)}`}
              emoji="✅"
              isChecked={completed.includes(index)}
              onChange={() =>
                updateClass({
                  ...exerciseClass,
                  times: exerciseClass.times.with(
                    weekIndex,
                    toggleSession(week, index),
                  ),
                })
              }
            />
          </div>
          <div className="tooltip">{getSessionName(index)}</div>
        </div>
      ))}
    </div>
  );
}

function toggleSession(week: ClassTimes, index: number): ClassTimes {
  const completed = week.completed ?? [];
  return {
    ...week,
    completed: completed.includes(index)
      ? completed.filter((session) => session !== index)
      : [...completed, index].toSorted((a, b) => a - b),
  };
}

function isClassDone({ times }: ExerciseClass) {
  return times.every(
    ({ total, completed }) => (completed?.length ?? 0) === total,
  );
}
