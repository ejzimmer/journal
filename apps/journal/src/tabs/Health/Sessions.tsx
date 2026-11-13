import { Ref } from 'react';
import { Tooltip } from 'shared/controls/Tooltip';
import { mergeRefs } from 'shared/mergeRefs';
import { ClassBlock, ExerciseClass } from '../../types';

type SessionsProps = {
  exerciseClass: ExerciseClass;
  blockIndex: number;
  getSessionName: (index: number) => string;
  onChange: (exerciseClass: ExerciseClass) => void;
  firstSessionRef?: Ref<HTMLInputElement>;
};

export function Sessions({
  exerciseClass,
  blockIndex,
  getSessionName,
  onChange,
  firstSessionRef,
}: SessionsProps) {
  const block = exerciseClass.blocks[blockIndex];
  const completed = block.completed ?? [];

  return (
    <div className="sessions">
      {Array.from({ length: block.total }, (_, index) => (
        <Tooltip key={index} label={getSessionName(index)}>
          {({ ref, ...triggerProps }) => (
            <input
              {...triggerProps}
              ref={mergeRefs(ref, index === 0 ? firstSessionRef : undefined)}
              type="checkbox"
              className="session"
              aria-label={`${exerciseClass.description}: ${getSessionName(index)}`}
              checked={completed.includes(index)}
              onChange={() =>
                onChange({
                  ...exerciseClass,
                  blocks: exerciseClass.blocks.with(
                    blockIndex,
                    toggleSession(block, index),
                  ),
                })
              }
            />
          )}
        </Tooltip>
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
