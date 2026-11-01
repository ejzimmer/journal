import { DurationField } from './DurationField';
import { formatMinutesAndSeconds } from './format';
import { useTooltipPopover } from '../../../shared/useTooltipPopover';

type EpisodeTimeTileProps = {
  timestampInSeconds?: number;
  lengthInSeconds?: number;
};

export function EpisodeTimeTile({
  timestampInSeconds,
  lengthInSeconds,
}: EpisodeTimeTileProps) {
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
