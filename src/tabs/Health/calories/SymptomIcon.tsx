import { Magnitude, Symptom } from './symptoms';

const GLYPH_SCALE = 0.5;

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
};

export function SymptomIcon({ symptom, magnitude, width }: SymptomIconProps) {
  if (symptom.Icon) {
    return <symptom.Icon colour={symptom.colour} width={width} />;
  }

  const paint = symptom.stroked
    ? {
        fill: 'none',
        stroke: symptom.colour,
        strokeWidth: 2.5,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
      }
    : { fill: symptom.colour };

  return (
    <svg viewBox="0 0 20 20" width={width} aria-hidden="true">
      {CLUSTERS[magnitude].map(([x, y]) => (
        <path
          key={`${x}-${y}`}
          d={symptom.path}
          transform={`translate(${x - 10 * GLYPH_SCALE} ${y - 10 * GLYPH_SCALE}) scale(${GLYPH_SCALE})`}
          {...paint}
        />
      ))}
    </svg>
  );
}
