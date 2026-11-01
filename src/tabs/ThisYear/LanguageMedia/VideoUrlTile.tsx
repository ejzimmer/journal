import { useTooltipPopover } from '../../../shared/useTooltipPopover';

type VideoUrlTileProps = {
  name?: string;
  defaultValue?: string;
};

export function VideoUrlTile({
  name = 'url',
  defaultValue,
}: VideoUrlTileProps) {
  const { triggerProps, tooltipProps } = useTooltipPopover();

  return (
    <div className="progress-tile url-tile tooltip-container">
      <span
        className="page-icon tooltip-anchor"
        {...triggerProps}
        aria-hidden="true"
      >
        🔗
      </span>
      <div className="tooltip" {...tooltipProps} aria-hidden="true">
        URL
      </div>
      <input
        type="url"
        name={name}
        aria-label="URL"
        defaultValue={defaultValue}
        required
      />
    </div>
  );
}
