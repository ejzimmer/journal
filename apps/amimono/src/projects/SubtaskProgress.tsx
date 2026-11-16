import './SubtaskProgress.css';
import { Subtask } from './types';

type SubtaskProgressProps = {
  subtasks: Subtask[];
};

export function SubtaskProgress({ subtasks }: SubtaskProgressProps) {
  const doneCount = subtasks.filter(({ status }) => status === 'done').length;

  return (
    <div className="subtask-progress">
      <progress
        aria-label="Subtasks done"
        value={doneCount}
        max={subtasks.length}
      />
      <span>
        {doneCount} of {subtasks.length}
      </span>
    </div>
  );
}
