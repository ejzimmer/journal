import { Ref } from 'react';
import { ClassBlock, ExerciseClass } from '../../shared/types';
import { Session } from './Session';

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
        <Session
          key={index}
          name={getSessionName(index)}
          label={`${exerciseClass.description}: ${getSessionName(index)}`}
          isChecked={completed.includes(index)}
          inputRef={index === 0 ? firstSessionRef : undefined}
          onToggle={() =>
            onChange({
              ...exerciseClass,
              blocks: exerciseClass.blocks.with(
                blockIndex,
                toggleSession(block, index),
              ),
            })
          }
        />
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
