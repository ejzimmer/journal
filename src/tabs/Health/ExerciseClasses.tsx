import { useMemo } from 'react';
import { EmojiCheckbox } from '../../shared/controls/EmojiCheckbox';
import { ExerciseClass } from '../../shared/types';
import { useHealthStorage } from './HealthStorageContext';
import './ExerciseClasses.css';

export function ExerciseClasses() {
  const { classes, updateClass } = useHealthStorage();
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
          {exerciseClass.times.map((times, timesIndex) => (
            <div className="completions" key={times.id}>
              {Array.from({ length: times.total }, (_, index) => {
                const completed = times.completed ?? [];
                const isChecked = index < completed.length;

                return (
                  <div className="tooltip-container" key={index}>
                    <div className="tooltip-anchor">
                      <EmojiCheckbox
                        label={times.id + index}
                        emoji="✅"
                        isChecked={isChecked}
                        onChange={() =>
                          updateClass({
                            ...exerciseClass,
                            times: exerciseClass.times.with(timesIndex, {
                              ...times,
                              completed: isChecked
                                ? completed.slice(0, -1)
                                : [...completed, completed.length],
                            }),
                          })
                        }
                      />
                    </div>
                    {isChecked && <div className="tooltip">{index + 1}</div>}
                  </div>
                );
              })}
            </div>
          ))}
        </li>
      ))}
    </ul>
  );
}

function isClassDone({ times }: ExerciseClass) {
  return times.every(
    ({ total, completed }) => (completed?.length ?? 0) === total,
  );
}
