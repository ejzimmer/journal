import { ReactNode, useId } from 'react';
import { showPopoverOnMount } from './showPopoverOnMount';
import './Tooltip.css';
import './CursorPositionedTooltip.css';

type CursorPositionedTooltipProps = {
  rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>;
  children: ReactNode;
};

export function CursorPositionedTooltip({
  rect,
  children,
}: CursorPositionedTooltipProps) {
  const anchorName = `--cursor-positioned-tooltip${useId().replace(/[^\w-]/g, '-')}`;

  return (
    <>
      <div
        className="cursor-positioned-tooltip-anchor"
        style={{
          anchorName,
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        }}
      />
      <div
        ref={showPopoverOnMount}
        className="tooltip tooltip-right cursor-positioned-tooltip"
        popover="manual"
        role="tooltip"
        style={{ positionAnchor: anchorName }}
      >
        {children}
      </div>
    </>
  );
}
