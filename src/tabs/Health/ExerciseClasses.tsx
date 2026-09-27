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
          {exerciseClass.blocks.map((block, blockIndex) => (
            <div className="completions" key={block.id}>
              {Array.from({ length: block.total }, (_, index) => {
                const completed = block.completed ?? [];
                const isChecked = index < completed.length;

                return (
                  <div className="tooltip-container" key={index}>
                    <div className="tooltip-anchor">
                      <EmojiCheckbox
                        label={block.id + index}
                        emoji="✅"
                        isChecked={isChecked}
                        onChange={() =>
                          updateClass({
                            ...exerciseClass,
                            blocks: exerciseClass.blocks.with(blockIndex, {
                              ...block,
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

function isClassDone({ blocks }: ExerciseClass) {
  return blocks.every(
    ({ total, completed }) => (completed?.length ?? 0) === total,
  );
}
