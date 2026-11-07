import { Magnitude, Symptom } from './symptoms';

const GLYPH_SCALE = 0.5;
const OUTLINE_WIDTH = 2.25;
const STROKE_WIDTH = 2.5;

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
  outlined?: boolean;
};

export function SymptomIcon({
  symptom,
  magnitude,
  width,
  outlined,
}: SymptomIconProps) {
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

  return (
    <svg viewBox="0 0 20 20" width={width} aria-hidden="true">
      {outlined && (
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
      {glyphs.map(({ key, transform }) => (
        <path key={key} d={symptom.path} transform={transform} {...paint} />
      ))}
    </svg>
  );
}
