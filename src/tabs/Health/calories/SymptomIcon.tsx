import { Magnitude, Symptom } from './symptoms';
import './SymptomIcon.css';

const GLYPH_SCALE = 0.5;
const OUTLINE_WIDTH = 2.25;
const STROKE_WIDTH = 2.5;
const VIEWBOX_SIZE = 20;
// Glyphs are drawn within 1..19 of their own 20-unit box, so this is how far
// a glyph's outline can reach from its centre in the icon's viewBox.
const GLYPH_REACH = (9 + STROKE_WIDTH / 2 + OUTLINE_WIDTH) * GLYPH_SCALE;

const CLUSTERS: Record<Magnitude, [number, number][]> = {
  1: [[10, 10]],
  2: [
    [5.5, 10],
    [14.5, 10],
  ],
  3: [
    [5, 14],
    [10, 5.5],
    [15, 14],
  ],
};

type SymptomIconProps = {
  symptom: Symptom;
  magnitude: Magnitude;
  width: string;
  onDot?: boolean;
};

export function SymptomIcon({
  symptom,
  magnitude,
  width,
  onDot,
}: SymptomIconProps) {
  const { Glyph } = symptom;
  if (Glyph && !onDot) {
    return (
      <svg viewBox="0 0 20 20" width={width} aria-hidden="true">
        <Glyph colour={symptom.colour} />
      </svg>
    );
  }

  const paint = symptom.stroked
    ? {
        fill: 'none',
        stroke: symptom.colour,
        strokeWidth: STROKE_WIDTH,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
      }
    : { fill: symptom.colour };
  const glyphs = CLUSTERS[magnitude].map(([x, y]) => ({
    key: `${x}-${y}`,
    transform: `translate(${x - 10 * GLYPH_SCALE} ${y - 10 * GLYPH_SCALE}) scale(${GLYPH_SCALE})`,
  }));
  const size = onDot ? getDotIconSize(magnitude, parseFloat(width)) : undefined;

  return (
    <svg
      viewBox={size?.viewBox ?? '0 0 20 20'}
      width={size?.width ?? width}
      height={size?.height}
      aria-hidden="true"
    >
      {onDot && (
        <g className="symptom-outlines">
          {glyphs.map(({ key, transform }) => (
            <path
              key={`outline-${key}`}
              className={
                symptom.stroked ? 'symptom-outline' : 'symptom-outline filled'
              }
              d={symptom.path}
              transform={transform}
              strokeWidth={
                (symptom.stroked ? STROKE_WIDTH : 0) + OUTLINE_WIDTH * 2
              }
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </g>
      )}
      {glyphs.map(({ key, transform }) =>
        Glyph ? (
          <g key={key} transform={transform}>
            <Glyph colour={symptom.colour} />
          </g>
        ) : (
          <path key={key} d={symptom.path} transform={transform} {...paint} />
        ),
      )}
    </svg>
  );
}

function getDotIconSize(magnitude: Magnitude, iconSize: number) {
  const xs = CLUSTERS[magnitude].map(([x]) => x);
  const ys = CLUSTERS[magnitude].map(([, y]) => y);
  const left = Math.min(...xs) - GLYPH_REACH;
  const top = Math.min(...ys) - GLYPH_REACH;
  const width = Math.max(...xs) + GLYPH_REACH - left;
  const height = Math.max(...ys) + GLYPH_REACH - top;
  const scale = iconSize / VIEWBOX_SIZE;

  return {
    viewBox: `${left} ${top} ${width} ${height}`,
    width: `${width * scale}px`,
    height: `${height * scale}px`,
  };
}
