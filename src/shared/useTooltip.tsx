import { PointerEvent, useState } from 'react';
import { CursorPositionedTooltip } from './controls/CursorPositionedTooltip';

type TooltipState = { text: string; rect: DOMRect };

export function useTooltip() {
  const [state, setState] = useState<TooltipState>();

  const createTooltipHandlers = (text: string) => ({
    onPointerEnter: (event: PointerEvent<Element>) =>
      setState({ text, rect: event.currentTarget.getBoundingClientRect() }),
    onPointerLeave: () => setState(undefined),
  });

  const tooltip = state && (
    <CursorPositionedTooltip text={state.text} rect={state.rect} />
  );

  return { createTooltipHandlers, tooltip };
}
