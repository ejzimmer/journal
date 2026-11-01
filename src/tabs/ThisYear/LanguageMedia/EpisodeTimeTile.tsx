import { DurationField } from './DurationField';
import { formatMinutesAndSeconds } from './format';
import { Tooltip } from '../../../shared/controls/Tooltip';

type EpisodeTimeTileProps = {
  timestampInSeconds?: number;
  lengthInSeconds?: number;
};

export function EpisodeTimeTile({
  timestampInSeconds,
  lengthInSeconds,
}: EpisodeTimeTileProps) {
  return (
    <div className="progress-tile time-tile">
      <Tooltip className="page-icon" text="Up to" aria-hidden="true">
        ⏱️
      </Tooltip>
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
