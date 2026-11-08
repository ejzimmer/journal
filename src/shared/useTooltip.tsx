import { PointerEvent, useRef, useState } from 'react';
import { CursorPositionedTooltip } from './controls/CursorPositionedTooltip';
import {
  PressPosition,
  useHoverOrLongPress,
} from './controls/useHoverOrLongPress';

type TooltipState = { text: string; rect: DOMRect };

export function useTooltip() {
  const [state, setState] = useState<TooltipState>();

  const activeTriggerText = useRef('');

  const showTooltip = (text: string, position: PressPosition) =>
    setState({ text, rect: position.currentTarget.getBoundingClientRect() });

  const hideTooltip = () => setState(undefined);

  const handlers = useHoverOrLongPress({
    onShow: (position) => showTooltip(activeTriggerText.current, position),
    onHide: hideTooltip,
  });

  const createTooltipHandlers = (text: string) => ({
    ...handlers,
    onPointerEnter: (event: PointerEvent<Element>) => {
      activeTriggerText.current = text;
      handlers.onPointerEnter(event);
    },
    onPointerDown: (event: PointerEvent<Element>) => {
      activeTriggerText.current = text;
      handlers.onPointerDown(event);
    },
  });

  const tooltip = state && (
    <CursorPositionedTooltip text={state.text} rect={state.rect} />
  );

  return { createTooltipHandlers, tooltip };
}
