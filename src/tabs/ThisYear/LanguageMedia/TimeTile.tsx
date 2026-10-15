import { DurationField } from './DurationField';

const ONE_HOUR = 3600;

export function TimeTile({
  upToInSeconds,
  lengthInSeconds,
}: {
  upToInSeconds?: number;
  lengthInSeconds?: number;
}) {
  const longestTime = Math.max(upToInSeconds ?? 0, lengthInSeconds ?? 0);

  return (
    <div className="progress-tile time-tile tooltip-container">
      <span className="page-icon tooltip-anchor" aria-hidden="true">
        ⏱️
      </span>
      <div className="tooltip" aria-hidden="true">
        Up to
      </div>
      <DurationField
        label="Up to"
        name="upTo"
        defaultValue={upToInSeconds}
        durationFormat={longestTime < ONE_HOUR ? 'mm:ss' : 'hh:mm:ss'}
      />
    </div>
  );
}
