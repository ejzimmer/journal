import { DURATION_UNITS, DurationField } from './DurationField';

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
    <div className="progress-tile time-tile tooltip-container">
      <span className="page-icon tooltip-anchor" aria-hidden="true">
        ⏱️
      </span>
      <div className="tooltip" aria-hidden="true">
        Length
      </div>
      <DurationField
        label="Length"
        name={name}
        defaultValue={defaultValue}
        durationFormat={durationFormat}
      />
    </div>
  );
}
