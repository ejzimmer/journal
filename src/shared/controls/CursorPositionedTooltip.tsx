import { useId } from 'react';
import { showPopoverOnMount } from './showPopoverOnMount';

type CursorPositionedTooltipProps = {
  text: string;
  rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>;
};

export function CursorPositionedTooltip({
  text,
  rect,
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
        {text}
      </div>
    </>
  );
}
