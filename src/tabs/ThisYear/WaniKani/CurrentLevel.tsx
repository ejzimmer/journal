import { StopWatchIcon } from '../../../shared/icons/StopWatch';
import { useTooltip } from '../../../shared/useTooltip';
import { formatDayMonthAndYear, getDateDaysAhead } from '../../../shared/dates';
import { LevelBadge } from './LevelBadge';
import { LevelRings } from './LevelRings';
import { predictDaysToFinish } from './levelPrediction';
import { calculateLevelProgress } from './levelProgress';
import { MAX_LEVEL, WaniKaniData } from './types';

export function CurrentLevel({ data }: { data: WaniKaniData }) {
  const { radical, kanji } = calculateLevelProgress(
    data.subjects,
    data.assignments,
    data.level,
  );

  const daysToFinish = predictDaysToFinish(data.levelProgressions, data.level);
  const { createTooltipHandlers, tooltip } = useTooltip();

  return (
    <section className="current-level" aria-label={`Level ${data.level}`}>
      <LevelRings radical={radical} kanji={kanji} />
      <div className="current-level-badge">
        <LevelBadge />
        <div className="level-number" aria-hidden="true">
          {data.level}
        </div>
      </div>
      {daysToFinish !== undefined && (
        <div
          className="days-remaining"
          {...createTooltipHandlers(
            formatDayMonthAndYear(getDateDaysAhead(daysToFinish)),
          )}
        >
          <StopWatchIcon
            width="16px"
            role="img"
            aria-label="Days remaining"
            handAngleDegrees={((data.level - 1) / MAX_LEVEL) * 360}
          />
          {daysToFinish}
        </div>
      )}
      {tooltip}
    </section>
  );
}
