import { calculatePercentsByLevel, isUnlocked } from './levelPercents';
import { LevelGemCluster } from './LevelGemCluster';
import { MAX_LEVEL, WaniKaniData } from './types';

export function LevelGems({ data }: { data: WaniKaniData }) {
  const levels = calculatePercentsByLevel(
    data.subjects,
    data.assignments,
    MAX_LEVEL,
    isUnlocked,
  );

  return (
    <div className="level-gems">
      {levels.map(({ level, percents }) => (
        <LevelGemCluster key={level} level={level} percents={percents} />
      ))}
    </div>
  );
}
