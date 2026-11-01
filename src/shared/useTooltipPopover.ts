import { FocusEvent, useRef } from 'react';

export function showPopoverOnMount(popover: HTMLElement | null) {
  popover?.showPopover();
}

export function useTooltipPopover<T extends HTMLElement = HTMLDivElement>() {
  const tooltipRef = useRef<T>(null);

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

  return {
    triggerProps: {
      onPointerEnter: showTooltip,
      onPointerLeave: hideTooltip,
      onFocus: showTooltipOnKeyboardFocus,
      onBlur: hideTooltip,
    },
    tooltipProps: { ref: tooltipRef, popover: 'manual' as const },
  };
}
