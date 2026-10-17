import { DurationField } from './DurationField';
import { formatMinutesAndSeconds } from './format';

type EpisodeTimeTileProps = {
  timestampInSeconds?: number;
  lengthInSeconds?: number;
};

export function EpisodeTimeTile({
  timestampInSeconds,
  lengthInSeconds,
}: EpisodeTimeTileProps) {
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
        name="timestamp"
        defaultValue={timestampInSeconds}
        durationFormat="mm:ss"
      />
      {lengthInSeconds !== undefined && (
        <span className="page-total">
          / {formatMinutesAndSeconds(lengthInSeconds)}
        </span>
      )}
    </div>
  );
}
