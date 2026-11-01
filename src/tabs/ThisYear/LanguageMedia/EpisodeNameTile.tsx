import { useTooltipPopover } from '../../../shared/useTooltipPopover';

export function EpisodeNameTile() {
  const { triggerProps, tooltipProps } = useTooltipPopover();

  return (
    <div className="progress-tile url-tile tooltip-container">
      <span
        className="page-icon tooltip-anchor"
        {...triggerProps}
        aria-hidden="true"
      >
        🎬
      </span>
      <div className="tooltip" {...tooltipProps} aria-hidden="true">
        Name
      </div>
      <input name="name" aria-label="Name" />
    </div>
  );
}
