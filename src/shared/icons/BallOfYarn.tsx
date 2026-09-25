import { useId } from 'react';
import { IconProps } from './types';

const BALL_RADIUS = 8;
const BALL_CENTRE = 10;
const STRAND_SPACING = 1.6;
const STRAND_BULGE = 0.25;
const WIND_TILT = (9 * Math.PI) / 180;
const TURN = Math.PI * 2;

const round = (value: number) => Number(value.toFixed(2));
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

type BandSpec = {
  angle: number;
  from: number;
  to: number;
  isBase?: boolean;
};

const BAND_SPECS: BandSpec[] = [
  { angle: -76, from: 1, to: 19, isBase: true },
  { angle: 16, from: 2, to: 11 },
  { angle: -34, from: 6.4, to: 15.4 },
  { angle: 58, from: 10, to: 17.5 },
];

function getGroovePositions({ from, to }: BandSpec) {
  const positions = [from];
  for (
    let position = from + STRAND_SPACING;
    position < to - 0.01;
    position += STRAND_SPACING
  ) {
    positions.push(round(position));
  }
  positions.push(to);

  return positions;
}

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

function drawBandFill({ from, to }: BandSpec) {
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

function buildBand(spec: BandSpec) {
  const positions = getGroovePositions(spec);
  const strands: string[] = [];
  const edges: string[] = [];

  positions.forEach((position, index) => {
    const arc = getStrandArc(position);
    if (!arc) return;

    const isBandEdge =
      !spec.isBase && (index === 0 || index === positions.length - 1);
    (isBandEdge ? edges : strands).push(drawStrand(arc));
  });

  return {
    angle: spec.angle,
    fill: spec.isBase ? null : drawBandFill(spec),
    edges,
    strands,
  };
}

const BANDS = BAND_SPECS.map(buildBand);

const getAxialOffsetAtRim = (heading: number, angle: number) =>
  BALL_RADIUS * Math.cos(WIND_TILT) * Math.sin(heading - toRadians(angle));

function getRimStrandId(heading: number) {
  for (let index = BAND_SPECS.length - 1; index >= 0; index--) {
    const spec = BAND_SPECS[index];
    const offset = getAxialOffsetAtRim(heading, spec.angle) + BALL_CENTRE;
    if (offset < spec.from || offset > spec.to) continue;

    const positions = getGroovePositions(spec);
    let gap = 0;
    while (gap < positions.length - 2 && offset >= positions[gap + 1]) gap++;

    return `${index}:${gap}`;
  }

  return 'ball';
}

function getRimBoundaries() {
  const headings = BAND_SPECS.flatMap((spec) =>
    getGroovePositions(spec).flatMap((position) => {
      const reach =
        (position - BALL_CENTRE) / (BALL_RADIUS * Math.cos(WIND_TILT));
      if (Math.abs(reach) > 1) return [];

      const offAxis = Math.asin(reach);
      const along = toRadians(spec.angle);
      return [along + offAxis, along + Math.PI - offAxis];
    }),
  );

  const wrapped = headings.map((heading) =>
    Number((((heading % TURN) + TURN) % TURN).toFixed(6)),
  );

  return [...new Set(wrapped)].sort((one, other) => one - other);
}

function getRimSegments() {
  const boundaries = getRimBoundaries();
  const segments: { start: number; end: number; id: string }[] = [];

  boundaries.forEach((start, index) => {
    const end =
      index === boundaries.length - 1
        ? boundaries[0] + TURN
        : boundaries[index + 1];
    const id = getRimStrandId((start + end) / 2);
    const previous = segments[segments.length - 1];

    if (previous?.id === id) previous.end = end;
    else segments.push({ start, end, id });
  });

  const first = segments[0];
  const last = segments[segments.length - 1];
  if (segments.length > 1 && first.id === last.id) {
    first.start = last.start - TURN;
    segments.pop();
  }

  return segments;
}

const pointOnRim = (heading: number) =>
  `${round(BALL_CENTRE + BALL_RADIUS * Math.cos(heading))} ${round(
    BALL_CENTRE + BALL_RADIUS * Math.sin(heading),
  )}`;

function drawBallOutline() {
  const segments = getRimSegments();

  const scallops = segments.map(({ start, end }) => {
    const chord = 2 * BALL_RADIUS * Math.sin((end - start) / 2);
    const bulge = Math.min(chord, STRAND_SPACING) * STRAND_BULGE;
    const radius = round((chord ** 2 / 4 + bulge ** 2) / (2 * bulge));

    return `A${radius} ${radius} 0 0 1 ${pointOnRim(end)}`;
  });

  return `M${pointOnRim(segments[0].start)}${scallops.join('')}Z`;
}

const BALL_OUTLINE = drawBallOutline();

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
          <path d={BALL_OUTLINE} />
        </clipPath>
        <radialGradient id={shading} cx="35%" cy="28%" r="80%">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="45%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.4" />
        </radialGradient>
      </defs>
      <path d={BALL_OUTLINE} fill={colour} />
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
      <path d={BALL_OUTLINE} fill={`url(#${shading})`} />
    </svg>
  );
}
