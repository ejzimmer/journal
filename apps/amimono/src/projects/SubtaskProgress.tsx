import './SubtaskProgress.css';

type SubtaskProgressProps = {
  doneCount: number;
  totalCount: number;
};

export function SubtaskProgress({
  doneCount,
  totalCount,
}: SubtaskProgressProps) {
  return (
    <div className="subtask-progress">
      <progress aria-label="Subtasks done" value={doneCount} max={totalCount} />
      <span>
        {doneCount} of {totalCount}
      </span>
    </div>
  );
}
