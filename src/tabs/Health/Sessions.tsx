import { ClassBlock, ExerciseClass } from '../../shared/types';
import { useHealthStorage } from './HealthStorageContext';

type SessionsProps = {
  exerciseClass: ExerciseClass;
  blockIndex: number;
  getSessionName: (index: number) => string;
};

export function Sessions({
  exerciseClass,
  blockIndex,
  getSessionName,
}: SessionsProps) {
  const { updateClass } = useHealthStorage();
  const block = exerciseClass.blocks[blockIndex];
  const completed = block.completed ?? [];

  return (
    <div className="sessions">
      {Array.from({ length: block.total }, (_, index) => (
        <div className="tooltip-container" key={index}>
          <div className="tooltip-anchor">
            <input
              type="checkbox"
              className="session"
              aria-label={`${exerciseClass.description}: ${getSessionName(index)}`}
              checked={completed.includes(index)}
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
