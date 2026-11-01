import { useTooltipPopover } from '../../../shared/useTooltipPopover';

type PageTileProps = { page?: number; pages?: number };

export function PageTile({ page, pages }: PageTileProps) {
  const { triggerProps, tooltipProps } = useTooltipPopover();

  return (
    <div className="progress-tile tooltip-container">
      <span
        className="page-icon tooltip-anchor"
        {...triggerProps}
        aria-hidden="true"
      >
        📖
      </span>
      <div className="tooltip" {...tooltipProps} aria-hidden="true">
        Page
      </div>
      <input
        type="number"
        name="page"
        aria-label="Page"
        defaultValue={page}
        min={0}
        max={pages}
      />
      {pages && <span className="page-total">/ {pages}</span>}
    </div>
  );
}
