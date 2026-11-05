import { useId } from 'react';
import { showPopoverOnMount } from './showPopoverOnMount';

type PointerTooltipProps = {
  text: string;
  rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>;
};

export function PointerTooltip({ text, rect }: PointerTooltipProps) {
  const anchorName = `--pointer-tooltip${useId().replace(/[^\w-]/g, '-')}`;

  return (
    <>
      <div
        className="pointer-tooltip-anchor"
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
        className="tooltip tooltip-right pointer-tooltip"
        popover="manual"
        role="tooltip"
        style={{ positionAnchor: anchorName }}
      >
        {text}
      </div>
    </>
  );
}
