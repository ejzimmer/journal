import { calculateBurnedPercentsByLevel } from './burnedPercents';
import { LevelGemCluster } from './LevelGemCluster';
import { MAX_LEVEL, WaniKaniData } from './types';

export function LevelGems({ data }: { data: WaniKaniData }) {
  const levels = calculateBurnedPercentsByLevel(
    data.subjects,
    data.assignments,
    MAX_LEVEL,
  );

  return (
    <div className="level-gems">
      {levels.map(({ level, percents }) => (
        <LevelGemCluster key={level} level={level} percents={percents} />
      ))}
    </div>
  );
}
