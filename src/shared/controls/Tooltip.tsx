import {
  FocusEvent,
  MouseEvent,
  PointerEvent,
  ReactNode,
  useEffect,
  useId,
  useRef,
} from 'react';
import { createHoverHandlers } from './createHoverHandlers';
import { useTouchLongPress } from './useTouchLongPress';
import './Tooltip.css';

type TooltipPosition = 'top' | 'right' | 'top-right';

export type TooltipTriggerProps = {
  ref: (trigger: HTMLElement | null) => void;
  'aria-describedby': string;
  onPointerEnter: (event: PointerEvent<Element>) => void;
  onPointerLeave: (event: PointerEvent<Element>) => void;
  onPointerDown: (event: PointerEvent<Element>) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
  onContextMenu: (event: MouseEvent<Element>) => void;
  onClickCapture: (event: MouseEvent<Element>) => void;
  onFocus: (event: FocusEvent<Element>) => void;
  onBlur: () => void;
};

type TooltipProps = {
  label: string;
  position?: TooltipPosition;
  isOpen?: boolean;
  children: (triggerProps: TooltipTriggerProps) => ReactNode;
};

export function Tooltip({
  label,
  position = 'right',
  isOpen,
  children,
}: TooltipProps) {
  const id = useId();
  const anchorName = `--tooltip${id.replace(/[^\w-]/g, '-')}`;
  const tooltipRef = useRef<HTMLDivElement>(null);

  const anchorTooltipToTrigger = (trigger: HTMLElement | null) => {
    trigger?.style.setProperty('anchor-name', anchorName);
  };

  const showTooltip = () => showPopover(tooltipRef.current);
  const hideTooltip = () => hidePopover(tooltipRef.current);

  useEffect(() => {
    if (isOpen === undefined) return;
    if (isOpen) {
      showPopover(tooltipRef.current);
    } else {
      hidePopover(tooltipRef.current);
    }
  }, [isOpen]);

  const longPressHandlers = useTouchLongPress({
    onShow: showTooltip,
    onHide: hideTooltip,
  });

  const showTooltipOnKeyboardFocus = (event: FocusEvent<Element>) => {
    if (event.target.matches(':focus-visible')) {
      showTooltip();
    }
  };

  return (
    <>
      {children({
        ref: anchorTooltipToTrigger,
        'aria-describedby': id,
        ...createHoverHandlers({ onShow: showTooltip, onHide: hideTooltip }),
        ...longPressHandlers,
        onFocus: showTooltipOnKeyboardFocus,
        onBlur: hideTooltip,
      })}
      <div
        ref={tooltipRef}
        id={id}
        role="tooltip"
        className={`tooltip tooltip-${position}`}
        popover="manual"
        style={{ positionAnchor: anchorName }}
      >
        {label}
      </div>
    </>
  );
}

function showPopover(popover: HTMLElement | null) {
  if (popover && !popover.matches(':popover-open')) {
    popover.showPopover();
  }
}

function hidePopover(popover: HTMLElement | null) {
  if (popover?.matches(':popover-open')) {
    popover.hidePopover();
  }
}
