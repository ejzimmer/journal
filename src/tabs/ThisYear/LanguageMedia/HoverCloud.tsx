import { PointerEvent, ReactNode, useState } from 'react';
import { createPortal } from 'react-dom';
import { TinyCloud } from './TinyCloud';

type HoverCloudProps = { text?: string; children: ReactNode };

export function HoverCloud({ text, children }: HoverCloudProps) {
  const [hoveredRect, setHoveredRect] = useState<DOMRect>();

  const startHover = (event: PointerEvent<SVGGElement>) =>
    setHoveredRect(event.currentTarget.getBoundingClientRect());

  return (
    <g
      onPointerEnter={startHover}
      onPointerLeave={() => setHoveredRect(undefined)}
    >
      {children}
      {text &&
        hoveredRect &&
        createPortal(
          <TinyCloud text={text} rect={hoveredRect} />,
          document.body,
        )}
    </g>
  );
}
