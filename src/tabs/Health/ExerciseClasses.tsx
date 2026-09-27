import { useMemo } from 'react';
import { EmojiCheckbox } from '../../shared/controls/EmojiCheckbox';
import { ClassBlock, ExerciseClass } from '../../shared/types';
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

function SetClass({ exerciseClass }: { exerciseClass: ExerciseClass }) {
  return (
    <Sessions
      exerciseClass={exerciseClass}
      blockIndex={0}
      getSessionName={(index) => `Class ${index + 1}`}
    />
  );
}

function WeeklyClass({ exerciseClass }: { exerciseClass: ExerciseClass }) {
  return exerciseClass.blocks.map((week, weekIndex) => (
    <Sessions
      key={week.id}
      exerciseClass={exerciseClass}
      blockIndex={weekIndex}
      getSessionName={(index) => `Week ${weekIndex + 1}, class ${index + 1}`}
    />
  ));
}

type SessionsProps = {
  exerciseClass: ExerciseClass;
  blockIndex: number;
  getSessionName: (index: number) => string;
};

function Sessions({
  exerciseClass,
  blockIndex,
  getSessionName,
}: SessionsProps) {
  const { updateClass } = useHealthStorage();
  const block = exerciseClass.blocks[blockIndex];
  const completed = block.completed ?? [];

  return (
    <div className="completions">
      {Array.from({ length: block.total }, (_, index) => (
        <div className="tooltip-container" key={index}>
          <div className="tooltip-anchor">
            <EmojiCheckbox
              label={`${exerciseClass.description}: ${getSessionName(index)}`}
              emoji="✅"
              isChecked={completed.includes(index)}
              onChange={() =>
                updateClass({
                  ...exerciseClass,
                  blocks: exerciseClass.blocks.with(
                    blockIndex,
                    toggleSession(block, index),
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

function toggleSession(block: ClassBlock, index: number): ClassBlock {
  const completed = block.completed ?? [];
  return {
    ...block,
    completed: completed.includes(index)
      ? completed.filter((session) => session !== index)
      : [...completed, index].toSorted((a, b) => a - b),
  };
}

function isClassDone({ blocks }: ExerciseClass) {
  return blocks.every(
    ({ total, completed }) => (completed?.length ?? 0) === total,
  );
}
