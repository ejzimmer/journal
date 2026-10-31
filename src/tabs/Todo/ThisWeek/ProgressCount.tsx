import { CSSProperties } from 'react';
import { WeeklyProgress } from './weeklyProgress';

type ProgressCountProps = WeeklyProgress;

export function ProgressCount({
  numberDone,
  frequency,
  label,
  isDue,
  fillOpacity,
  onAdd,
  onRemove,
}: ProgressCountProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`progress-count ${isDue ? '' : 'not-due'} ${numberDone > 0 ? 'lit' : ''}`}
      style={{ '--fill-opacity': fillOpacity } as CSSProperties}
    >
      <button aria-label="Mark done" onClick={onAdd}>
        {numberDone}
      </button>
      <button aria-label="Undo" onClick={onRemove} disabled={numberDone === 0}>
        {frequency}
      </button>
    </div>
  );
}
