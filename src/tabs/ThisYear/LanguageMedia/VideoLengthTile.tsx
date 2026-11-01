import { DURATION_UNITS, DurationField } from './DurationField';
import { useTooltipPopover } from '../../../shared/useTooltipPopover';

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
  const { triggerProps, tooltipProps } = useTooltipPopover();

  return (
    <div className="progress-tile time-tile tooltip-container">
      <span
        className="page-icon tooltip-anchor"
        {...triggerProps}
        aria-hidden="true"
      >
        ⏱️
      </span>
      <div className="tooltip" {...tooltipProps} aria-hidden="true">
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
