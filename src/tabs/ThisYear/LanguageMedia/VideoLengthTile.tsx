import { DurationField } from './DurationField';

type VideoLengthTileProps = {
  name?: string;
  defaultValue?: number;
};

export function VideoLengthTile({
  name = 'length',
  defaultValue,
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
        durationFormat="hh:mm:ss"
      />
    </div>
  );
}
