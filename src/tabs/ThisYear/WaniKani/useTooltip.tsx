import { PointerEvent, useState } from 'react';

type TooltipState = { text: string; rect: DOMRect };

export function useTooltip() {
  const [state, setState] = useState<TooltipState>();

  const createTooltipHandlers = (text: string) => ({
    onPointerEnter: (event: PointerEvent<Element>) =>
      setState({ text, rect: event.currentTarget.getBoundingClientRect() }),
    onPointerLeave: () => setState(undefined),
  });

  const tooltip = state && (
    <div className="tooltip-container wanikani-tooltip">
      <div
        className="tooltip-anchor"
        style={{
          left: state.rect.left,
          top: state.rect.top,
          width: state.rect.width,
          height: state.rect.height,
        }}
      />
      <div className="tooltip" role="tooltip">
        {state.text}
      </div>
    </div>
  );

  return { createTooltipHandlers, tooltip };
}
