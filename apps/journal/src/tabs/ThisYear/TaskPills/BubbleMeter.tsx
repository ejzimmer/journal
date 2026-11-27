import { CSSProperties } from 'react';

import './BubbleMeter.css';

type BubbleMeterProps = {
  label: string;
  segmentCount: number;
  filledCount: number;
  onAdd: () => void;
  onRemove: () => void;
  className?: string;
};

export function BubbleMeter({
  label,
  segmentCount,
  filledCount,
  onAdd,
  onRemove,
  className,
}: BubbleMeterProps) {
  const filledSegments = Math.min(filledCount, segmentCount);
  const extraCount = Math.max(filledCount - segmentCount, 0);

  return (
    <div
      role="group"
      aria-label={label}
      className={className ? `bubble-meter ${className}` : 'bubble-meter'}
      style={{ '--segments': segmentCount } as CSSProperties}
    >
      {filledSegments > 0 && (
        <button
          className="bubble-meter-fill"
          aria-label="Undo"
          onClick={onRemove}
          style={{ width: `${(filledSegments / segmentCount) * 100}%` }}
        />
      )}
      {filledSegments < segmentCount && (
        <button
          className="bubble-meter-empty"
          aria-label="Mark done"
          onClick={onAdd}
        />
      )}
      {Array.from({ length: extraCount }, (_, index) => (
        <span
          key={index}
          className="bubble-meter-extra"
          style={{ '--index': index } as CSSProperties}
        />
      ))}
    </div>
  );
}
