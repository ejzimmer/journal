import { PointerEvent, useRef, useState } from 'react';
import { CursorPositionedTooltip } from './controls/CursorPositionedTooltip';
import { createHoverHandlers } from './controls/createHoverHandlers';
import { PointerPosition } from './controls/pointerPosition';
import { useTouchLongPress } from './controls/useTouchLongPress';

type TooltipState = { text: string; rect: DOMRect };

export function useCursorPositionedTooltip() {
  const [state, setState] = useState<TooltipState>();

  const pressedTriggerText = useRef('');

  const showTooltip = (text: string, position: PointerPosition) =>
    setState({ text, rect: position.currentTarget.getBoundingClientRect() });

  const hideTooltip = () => setState(undefined);

  const longPressHandlers = useTouchLongPress({
    onShow: (position) => showTooltip(pressedTriggerText.current, position),
    onHide: hideTooltip,
  });

  const createTooltipHandlers = (text: string) => ({
    ...createHoverHandlers({
      onShow: (position) => showTooltip(text, position),
      onHide: hideTooltip,
    }),
    ...longPressHandlers,
    onPointerDown: (event: PointerEvent<Element>) => {
      pressedTriggerText.current = text;
      longPressHandlers.onPointerDown(event);
    },
  });

  const tooltip = state && (
    <CursorPositionedTooltip text={state.text} rect={state.rect} />
  );

  return { createTooltipHandlers, tooltip };
}
