import { createArcPath } from './deadHang';
import { RING_CENTRE, RING_WIDTH } from './ringGeometry';

type RingArcProps = {
  radius: number;
  from: number;
  to: number;
  className: string;
};

export function RingArc({ radius, from, to, className }: RingArcProps) {
  const end = Math.min(1, to);
  if (end <= from) return null;
  if (end - from >= 1) {
    return (
      <circle
        className={className}
        cx={RING_CENTRE}
        cy={RING_CENTRE}
        r={radius}
        strokeWidth={RING_WIDTH}
      />
    );
  }
  const capLength = RING_WIDTH / 2 / (2 * Math.PI * radius);
  const capStart = from + capLength;
  const capEnd = Math.max(capStart + 0.0001, end - capLength);
  return (
    <path
      className={className}
      d={createArcPath(RING_CENTRE, radius, capStart, capEnd)}
      strokeWidth={RING_WIDTH}
      strokeLinecap="round"
    />
  );
}
