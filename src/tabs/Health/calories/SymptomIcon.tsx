import { Magnitude, Symptom } from './symptoms';

const CLUSTERS: Record<Magnitude, [number, number, number][]> = {
  1: [[10, 10, 1]],
  2: [
    [6.5, 11.5, 0.62],
    [13.5, 8.5, 0.62],
  ],
  3: [
    [5, 14, 0.5],
    [10, 5.5, 0.5],
    [15, 14, 0.5],
  ],
};

type SymptomIconProps = {
  symptom: Symptom;
  magnitude: Magnitude;
  width: string;
};

export function SymptomIcon({ symptom, magnitude, width }: SymptomIconProps) {
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
      {CLUSTERS[magnitude].map(([x, y, scale]) => (
        <path
          key={`${x}-${y}`}
          d={symptom.path}
          transform={`translate(${x - 10 * scale} ${y - 10 * scale}) scale(${scale})`}
          {...paint}
        />
      ))}
    </svg>
  );
}
