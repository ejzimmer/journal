import { CSSProperties } from 'react';
import { WeeklyProgress } from './weeklyProgress';

type ProgressBarProps = WeeklyProgress;

export function ProgressBar({
  numberDone,
  frequency,
  label,
  isDue,
  fillOpacity,
  onAdd,
  onRemove,
}: ProgressBarProps) {
  const filledSegments = Math.min(numberDone, frequency);

  return (
    <div
      role="group"
      aria-label={label}
      className={`progress-bar ${isDue ? '' : 'not-due'}`}
      style={
        {
          '--segments': frequency,
          '--fill-opacity': fillOpacity,
        } as CSSProperties
      }
    >
      {filledSegments > 0 && (
        <button
          className="done led"
          aria-label="Undo"
          onClick={onRemove}
          style={
            {
              width: `${(filledSegments / frequency) * 100}%`,
              '--lit-segments': filledSegments,
            } as CSSProperties
          }
        />
      )}
      {filledSegments < frequency && (
        <button className="not-done" aria-label="Mark done" onClick={onAdd} />
      )}
    </div>
  );
}
