import { KeyboardEvent, PointerEvent, useState } from 'react';
import { createPortal } from 'react-dom';
import { TinyCloud } from './TinyCloud';

type UpdateStretchButtonProps = {
  label: string;
  path: string;
  hoverText?: string;
  onClick: () => void;
  onHighlight?: (isHighlighted: boolean) => void;
};

export function UpdateStretchButton({
  label,
  path,
  hoverText,
  onClick,
  onHighlight,
}: UpdateStretchButtonProps) {
  const [hoveredRect, setHoveredRect] = useState<DOMRect>();

  const clickOnEnterOrSpace = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  const startHover = (event: PointerEvent<SVGPathElement>) => {
    onHighlight?.(true);
    setHoveredRect(event.currentTarget.getBoundingClientRect());
  };

  const endHover = () => {
    onHighlight?.(false);
    setHoveredRect(undefined);
  };

  return (
    <>
      <path
        className="update-stretch"
        role="button"
        tabIndex={0}
        aria-label={label}
        d={path}
        onClick={onClick}
        onKeyDown={clickOnEnterOrSpace}
        onPointerEnter={startHover}
        onPointerLeave={endHover}
        onFocus={() => onHighlight?.(true)}
        onBlur={() => onHighlight?.(false)}
      />
      {hoverText &&
        hoveredRect &&
        createPortal(
          <TinyCloud text={hoverText} rect={hoveredRect} />,
          document.body,
        )}
    </>
  );
}
