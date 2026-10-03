import { IconProps } from './types';

const SQUARE_POSITIONS = [2, 7, 12];

export function SquareGridIcon({
  colour = 'currentColor',
  ...props
}: IconProps) {
  return (
    <svg viewBox="0 0 18 18" fill={colour} width="100%" {...props}>
      {SQUARE_POSITIONS.flatMap((y) =>
        SQUARE_POSITIONS.map((x) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="4" height="4" rx="1" />
        )),
      )}
    </svg>
  );
}
