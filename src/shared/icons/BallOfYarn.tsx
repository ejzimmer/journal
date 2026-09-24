import { useId } from 'react';
import { IconProps } from './types';

const BALL_RADIUS = 8;
const BALL_CENTRE = 10;
const STRAND_SPACING = 1.6;
const WIND_TILT = (9 * Math.PI) / 180;

const round = (value: number) => Number(value.toFixed(2));

type StrandArc = {
  left: number;
  right: number;
  y: number;
  rx: number;
  ry: number;
  sweepsPastHalf: boolean;
};

function getStrandArc(position: number): StrandArc | null {
  const axialOffset = position - BALL_CENTRE;
  if (Math.abs(axialOffset) >= BALL_RADIUS) return null;

  const wrapRadius = Math.sqrt(BALL_RADIUS ** 2 - axialOffset ** 2);
  const halfWidthSquared =
    wrapRadius ** 2 - (axialOffset * Math.tan(WIND_TILT)) ** 2;
  if (halfWidthSquared <= 0.04) return null;

  const halfWidth = Math.sqrt(halfWidthSquared);

  return {
    left: round(BALL_CENTRE - halfWidth),
    right: round(BALL_CENTRE + halfWidth),
    y: round(BALL_CENTRE + axialOffset / Math.cos(WIND_TILT)),
    rx: round(wrapRadius),
    ry: round(Math.max(wrapRadius * Math.sin(WIND_TILT), 0.01)),
    sweepsPastHalf: axialOffset > 0,
  };
}

const arcAcross = (arc: StrandArc, to: number, sweep: number) =>
  `A${arc.rx} ${arc.ry} 0 ${arc.sweepsPastHalf ? 1 : 0} ${sweep} ${to} ${arc.y}`;

const drawStrand = (arc: StrandArc) =>
  `M${arc.left} ${arc.y}${arcAcross(arc, arc.right, 1)}`;

function drawBandFill(from: number, to: number) {
  const top = getStrandArc(from);
  const bottom = getStrandArc(to);

  const acrossTheTop = top
    ? `L${top.left} ${top.y}${arcAcross(top, top.right, 1)}L24 ${top.y}`
    : `L24 ${from}`;
  const backAlongTheBottom = bottom
    ? `L${bottom.right} ${bottom.y}${arcAcross(bottom, bottom.left, 0)}L-4 ${bottom.y}`
    : `L-4 ${to}`;

  return `M-4 ${top?.y ?? from}${acrossTheTop}L24 ${bottom?.y ?? to}${backAlongTheBottom}Z`;
}

function buildBand({
  angle,
  from,
  to,
  isBase = false,
}: {
  angle: number;
  from: number;
  to: number;
  isBase?: boolean;
}) {
  const strands: string[] = [];
  for (
    let position = from + STRAND_SPACING;
    position < to - 0.01;
    position += STRAND_SPACING
  ) {
    const arc = getStrandArc(round(position));
    if (arc) strands.push(drawStrand(arc));
  }

  const edges = isBase
    ? []
    : [from, to]
        .map((position) => getStrandArc(position))
        .filter((arc) => arc !== null)
        .map(drawStrand);

  return {
    angle,
    fill: isBase ? null : drawBandFill(from, to),
    edges,
    strands,
  };
}

const BANDS = [
  { angle: -76, from: 1, to: 19, isBase: true },
  { angle: 16, from: 2, to: 11 },
  { angle: -34, from: 6.4, to: 15.4 },
  { angle: 58, from: 10, to: 17.5 },
].map(buildBand);

export function BallOfYarnIcon({
  width = '100%',
  colour = 'currentColor',
}: IconProps) {
  const id = useId();
  const wrapClip = `${id}-wrap`;
  const shading = `${id}-shading`;

  return (
    <svg viewBox="0 0 20 20" width={width}>
      <defs>
        <clipPath id={wrapClip}>
          <circle cx="10" cy="10" r="8" />
        </clipPath>
        <radialGradient id={shading} cx="35%" cy="28%" r="80%">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="45%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.4" />
        </radialGradient>
      </defs>
      <path
        d="M12 16 C15 19 18 17.5 18.6 14.4"
        fill="none"
        stroke={colour}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="10" cy="10" r="8" fill={colour} />
      <g
        clipPath={`url(#${wrapClip})`}
        fill="none"
        stroke="black"
        strokeOpacity="0.26"
        strokeWidth="0.32"
      >
        {BANDS.map(({ angle, fill, edges, strands }) => (
          <g key={angle} transform={`rotate(${angle} 10 10)`}>
            {fill && <path d={fill} fill={colour} stroke="none" />}
            {edges.map((edge) => (
              <path
                key={edge}
                d={edge}
                strokeOpacity="0.5"
                strokeWidth="0.45"
              />
            ))}
            {strands.map((strand) => (
              <path key={strand} d={strand} />
            ))}
          </g>
        ))}
      </g>
      <circle cx="10" cy="10" r="8" fill={`url(#${shading})`} />
    </svg>
  );
}
