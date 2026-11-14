import './SubtaskProgress.css';

type SubtaskProgressProps = {
  doneCount: number;
  totalCount: number;
};

export function SubtaskProgress({
  doneCount,
  totalCount,
}: SubtaskProgressProps) {
  const percentDone = Math.round((doneCount / totalCount) * 100);

  return (
    <div className="subtask-progress">
      <div className="subtask-progress-track">
        <div
          className="subtask-progress-fill"
          style={{ width: `${percentDone}%` }}
        />
      </div>
      <span>
        {doneCount} of {totalCount}
      </span>
    </div>
  );
}
