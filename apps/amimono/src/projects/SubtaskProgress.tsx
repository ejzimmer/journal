import './SubtaskProgress.css';
import { Subtask } from './types';

type SubtaskProgressProps = {
  subtasks: Subtask[];
};

export function SubtaskProgress({ subtasks }: SubtaskProgressProps) {
  const doneCount = subtasks.filter(({ status }) => status === 'done').length;
  const percentDone = Math.round((doneCount / subtasks.length) * 100);

  return (
    <div className="subtask-progress">
      <div className="subtask-progress-track">
        <div
          className="subtask-progress-fill"
          style={{ width: `${percentDone}%` }}
        />
      </div>
      <span>
        {doneCount} of {subtasks.length}
      </span>
    </div>
  );
}
