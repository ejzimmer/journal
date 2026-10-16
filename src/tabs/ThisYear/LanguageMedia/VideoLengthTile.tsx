import { DurationField } from './DurationField';

export function VideoLengthTile() {
  return (
    <div className="progress-tile time-tile tooltip-container">
      <span className="page-icon tooltip-anchor" aria-hidden="true">
        ⏱️
      </span>
      <div className="tooltip" aria-hidden="true">
        Length
      </div>
      <DurationField label="Length" name="length" durationFormat="hh:mm:ss" />
    </div>
  );
}
