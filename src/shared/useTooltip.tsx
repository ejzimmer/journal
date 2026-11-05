import { PointerEvent, useState } from 'react';
import { PointerTooltip } from './controls/PointerTooltip';

type TooltipState = { text: string; rect: DOMRect };

export function useTooltip() {
  const [state, setState] = useState<TooltipState>();

  const createTooltipHandlers = (text: string) => ({
    onPointerEnter: (event: PointerEvent<Element>) =>
      setState({ text, rect: event.currentTarget.getBoundingClientRect() }),
    onPointerLeave: () => setState(undefined),
  });

  const tooltip = state && (
    <PointerTooltip text={state.text} rect={state.rect} />
  );

  return { createTooltipHandlers, tooltip };
}
