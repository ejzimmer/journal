import { DURATION_UNITS, DurationField } from './DurationField';
import { Tooltip } from '../../../shared/controls/Tooltip';

type VideoLengthTileProps = {
  name?: string;
  defaultValue?: number;
  durationFormat?: keyof typeof DURATION_UNITS;
};

export function VideoLengthTile({
  name = 'length',
  defaultValue,
  durationFormat = 'hh:mm:ss',
}: VideoLengthTileProps) {
  return (
    <div className="progress-tile time-tile">
      <Tooltip className="page-icon" text="Length" aria-hidden="true">
        ⏱️
      </Tooltip>
      <DurationField
        label="Length"
        name={name}
        defaultValue={defaultValue}
        durationFormat={durationFormat}
      />
    </div>
  );
}
