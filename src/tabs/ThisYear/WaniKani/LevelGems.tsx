import {
  calculatePercentsByLevel,
  findFullyBurnedTypesByLevel,
  isUnlocked,
} from './levelPercents';
import { LevelGemCluster } from './LevelGemCluster';
import { MAX_LEVEL, WaniKaniData } from './types';

export function LevelGems({ data }: { data: WaniKaniData }) {
  const levels = calculatePercentsByLevel(
    data.subjects,
    data.assignments,
    MAX_LEVEL,
    isUnlocked,
  );
  const burnedByLevel = findFullyBurnedTypesByLevel(
    data.subjects,
    data.assignments,
    MAX_LEVEL,
  );

  return (
    <div className="level-gems">
      {levels.map(({ level, counts, percents }, index) => (
        <LevelGemCluster
          key={level}
          level={level}
          counts={counts}
          percents={percents}
          burned={burnedByLevel[index]}
        />
      ))}
    </div>
  );
}
