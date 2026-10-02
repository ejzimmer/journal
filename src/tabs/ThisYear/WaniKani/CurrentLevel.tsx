import { useId } from 'react';
import { StopWatchIcon } from '../../../shared/icons/StopWatch';
import { LevelBadge } from './LevelBadge';
import { LevelRings } from './LevelRings';
import { predictDaysToFinish } from './levelPrediction';
import { calculateLevelProgress } from './levelProgress';
import { WaniKaniData } from './types';

export function CurrentLevel({ data }: { data: WaniKaniData }) {
  const { radical, kanji } = calculateLevelProgress(
    data.subjects,
    data.assignments,
    data.level,
  );

  const headingId = useId();
  const daysToFinish = predictDaysToFinish(data.levelProgressions, data.level);

  return (
    <section className="current-level" aria-labelledby={headingId}>
      <LevelRings radical={radical} kanji={kanji} />
      <div className="current-level-badge">
        <LevelBadge />
        <h3 id={headingId} aria-label={`Level ${data.level}`}>
          {data.level}
        </h3>
      </div>
      {daysToFinish !== undefined && (
        <div className="days-remaining">
          <StopWatchIcon width="16px" role="img" aria-label="Days remaining" />
          {daysToFinish}
        </div>
      )}
    </section>
  );
}
