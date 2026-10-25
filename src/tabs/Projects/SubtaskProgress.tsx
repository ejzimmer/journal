type SubtaskProgressProps = {
  done: number;
  total: number;
};

export function SubtaskProgress({ done, total }: SubtaskProgressProps) {
  if (total === 0) return null;

  const donePercentage = (done / total) * 100;

  return (
    <div className="subtasks-progress">
      <div className="subtasks-progress-track" aria-hidden="true">
        <div
          className="subtasks-progress-fill"
          style={{ width: `${donePercentage}%` }}
        />
      </div>
      <span className="subtasks-progress-count">
        {done} of {total}
      </span>
    </div>
  );
}
