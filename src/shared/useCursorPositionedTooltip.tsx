import { PointerEvent, ReactNode, useRef, useState } from 'react';
import { CursorPositionedTooltip } from './controls/CursorPositionedTooltip';
import { createHoverHandlers } from './controls/createHoverHandlers';
import { PointerPosition } from './controls/pointerPosition';
import { useTouchLongPress } from './controls/useTouchLongPress';

type TooltipState = { content: ReactNode; rect: DOMRect };

export function useCursorPositionedTooltip() {
  const [state, setState] = useState<TooltipState>();

  const pressedTriggerContent = useRef<ReactNode>(null);

  const showTooltip = (content: ReactNode, position: PointerPosition) =>
    setState({
      content,
      rect: position.currentTarget.getBoundingClientRect(),
    });

  const hideTooltip = () => setState(undefined);

  const longPressHandlers = useTouchLongPress({
    onShow: (position) => showTooltip(pressedTriggerContent.current, position),
    onHide: hideTooltip,
  });

  const createTooltipHandlers = (content: ReactNode) => ({
    ...createHoverHandlers({
      onShow: (position) => showTooltip(content, position),
      onHide: hideTooltip,
    }),
    ...longPressHandlers,
    onPointerDown: (event: PointerEvent<Element>) => {
      pressedTriggerContent.current = content;
      longPressHandlers.onPointerDown(event);
    },
  });

  const tooltip = state && (
    <CursorPositionedTooltip rect={state.rect}>
      {state.content}
    </CursorPositionedTooltip>
  );

  return { createTooltipHandlers, tooltip };
}
