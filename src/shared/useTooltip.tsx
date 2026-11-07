import { PointerEvent, useState } from 'react';
import { CursorPositionedTooltip } from './controls/CursorPositionedTooltip';
import {
  isTouch,
  PressPosition,
  useTouchLongPress,
} from './controls/useTouchLongPress';

type TooltipState = { text: string; rect: DOMRect };

export function useTooltip() {
  const [state, setState] = useState<TooltipState>();

  const hideTooltip = () => setState(undefined);
  const createLongPressHandlers = useTouchLongPress(hideTooltip);

  const createTooltipHandlers = (text: string) => {
    const showTooltipOn = (event: PressPosition) =>
      setState({ text, rect: event.currentTarget.getBoundingClientRect() });

    return {
      onPointerEnter: (event: PointerEvent<Element>) => {
        if (!isTouch(event)) showTooltipOn(event);
      },
      onPointerLeave: (event: PointerEvent<Element>) => {
        if (!isTouch(event)) hideTooltip();
      },
      ...createLongPressHandlers(showTooltipOn),
    };
  };

  const tooltip = state && (
    <CursorPositionedTooltip text={state.text} rect={state.rect} />
  );

  return { createTooltipHandlers, tooltip };
}
