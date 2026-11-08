import { PointerEvent, useRef, useState } from 'react';
import { CursorPositionedTooltip } from './controls/CursorPositionedTooltip';
import {
  isTouch,
  PressPosition,
  useTouchLongPress,
} from './controls/useTouchLongPress';

type TooltipState = { text: string; rect: DOMRect };

export function useTooltip() {
  const [state, setState] = useState<TooltipState>();

  const pressedText = useRef('');

  const showTooltip = (text: string, position: PressPosition) =>
    setState({ text, rect: position.currentTarget.getBoundingClientRect() });

  const hideTooltip = () => setState(undefined);

  const longPressHandlers = useTouchLongPress({
    onLongPress: (position) => showTooltip(pressedText.current, position),
    onNextPress: hideTooltip,
  });

  const createTooltipHandlers = (text: string) => ({
    onPointerEnter: (event: PointerEvent<Element>) => {
      if (!isTouch(event)) showTooltip(text, event);
    },
    onPointerLeave: (event: PointerEvent<Element>) => {
      if (!isTouch(event)) hideTooltip();
    },
    ...longPressHandlers,
    onPointerDown: (event: PointerEvent<Element>) => {
      pressedText.current = text;
      longPressHandlers.onPointerDown(event);
    },
  });

  const tooltip = state && (
    <CursorPositionedTooltip text={state.text} rect={state.rect} />
  );

  return { createTooltipHandlers, tooltip };
}
