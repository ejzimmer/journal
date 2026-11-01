import { showPopoverOnMount } from './showPopoverOnMount';

type PointerTooltipProps = {
  text: string;
  rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>;
};

export function PointerTooltip({ text, rect }: PointerTooltipProps) {
  return (
    <div
      className="tooltip-anchor pointer-tooltip"
      style={{
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      }}
    >
      <div
        ref={showPopoverOnMount}
        className="tooltip"
        popover="manual"
        role="tooltip"
      >
        {text}
      </div>
    </div>
  );
}
