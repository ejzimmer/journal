import { Gem } from './Gem';
import {
  calculateClusterLayout,
  formatPoints,
  getHexVertices,
} from './gemGeometry';
import { SUBJECT_TYPE_LABELS } from './subjectTypeLabels';
import { SUBJECT_TYPES, SubjectType } from './types';

const SETTING_RADIUS = 16;
const layout = calculateClusterLayout(SETTING_RADIUS);

type LevelGemClusterProps = {
  level: number;
  percents: Record<SubjectType, number>;
};

export function LevelGemCluster({ level, percents }: LevelGemClusterProps) {
  const description = SUBJECT_TYPES.map(
    (type) => `${SUBJECT_TYPE_LABELS[type]} ${percents[type]}%`,
  ).join(', ');

  return (
    <div className="level-gem-cluster">
      <svg
        viewBox={layout.viewBox}
        width={layout.width}
        height={layout.height}
        role="img"
        aria-label={`Level ${level}: ${description}`}
      >
        {SUBJECT_TYPES.map((type) => (
          <polygon
            key={type}
            points={formatPoints(
              getHexVertices(...layout.centres[type], layout.settingRadius),
            )}
            fill="url(#wanikani-gold)"
          />
        ))}
        {SUBJECT_TYPES.map((type) => (
          <Gem
            key={type}
            type={type}
            cx={layout.centres[type][0]}
            cy={layout.centres[type][1]}
            r={layout.gemRadius}
            percent={percents[type]}
          />
        ))}
      </svg>
      <div aria-hidden="true">{level}</div>
    </div>
  );
}
