import { ComponentPropsWithoutRef, FocusEvent, ReactNode, useRef } from 'react';

type TooltipProps = ComponentPropsWithoutRef<'span'> & { text: ReactNode };

export function Tooltip({
  text,
  className,
  children,
  ...anchorProps
}: TooltipProps) {
  const tooltipRef = useRef<HTMLSpanElement>(null);

  const showTooltip = () => {
    const tooltip = tooltipRef.current;
    if (tooltip && !tooltip.matches(':popover-open')) {
      tooltip.showPopover();
    }
  };

  const hideTooltip = () => {
    const tooltip = tooltipRef.current;
    if (tooltip?.matches(':popover-open')) {
      tooltip.hidePopover();
    }
  };

  const showTooltipOnKeyboardFocus = (event: FocusEvent<Element>) => {
    if (event.target.matches(':focus-visible')) {
      showTooltip();
    }
  };

  return (
    <span
      {...anchorProps}
      className={`tooltip-anchor ${className ?? ''}`.trim()}
      onPointerEnter={showTooltip}
      onPointerLeave={hideTooltip}
      onFocus={showTooltipOnKeyboardFocus}
      onBlur={hideTooltip}
    >
      {children}
      <span
        ref={tooltipRef}
        className="tooltip"
        popover="manual"
        aria-hidden="true"
      >
        {text}
      </span>
    </span>
  );
}
