import { GEM_COLOURS } from './gemColours';
import { calculateRingDash, drawStar, findPointOnRing } from './ringGeometry';

const SIZE = 200;
const CENTRE = SIZE / 2;
const KANJI_RADIUS = 86;
const RADICAL_RADIUS = 74;

type LevelRingsProps = {
  radical: { passed: number; total: number };
  kanji: { passed: number; total: number; needed: number };
};

export function LevelRings({ radical, kanji }: LevelRingsProps) {
  const rings = [
    {
      type: 'kanji',
      r: KANJI_RADIUS,
      width: 9,
      fraction: kanji.total ? kanji.passed / kanji.total : 0,
    },
    {
      type: 'radical',
      r: RADICAL_RADIUS,
      width: 7,
      fraction: radical.total ? radical.passed / radical.total : 0,
    },
  ] as const;
  const goal = findPointOnRing(
    CENTRE,
    CENTRE,
    KANJI_RADIUS,
    kanji.total ? kanji.needed / kanji.total : 0,
  );

  return (
    <svg
      className="level-rings"
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width={SIZE}
      height={SIZE}
      role="img"
      aria-label={`Radicals ${radical.passed} of ${radical.total}, Kanji ${kanji.passed} of ${kanji.needed}`}
    >
      {rings.map(({ type, r, width, fraction }) => (
        <g key={type}>
          <circle
            cx={CENTRE}
            cy={CENTRE}
            r={r}
            stroke={GEM_COLOURS[type].base}
            strokeOpacity={0.18}
            strokeWidth={width}
            fill="none"
          />
          {fraction > 0 && (
            <circle
              cx={CENTRE}
              cy={CENTRE}
              r={r}
              stroke={`url(#wanikani-gem-${type})`}
              strokeWidth={width}
              strokeLinecap="round"
              strokeDasharray={calculateRingDash(r, fraction)}
              fill="none"
              transform={`rotate(-90 ${CENTRE} ${CENTRE})`}
            />
          )}
        </g>
      ))}
      <path
        d={drawStar(...goal, 7)}
        fill="url(#wanikani-gold)"
        stroke="#7a5a14"
        strokeWidth={0.5}
      />
    </svg>
  );
}
