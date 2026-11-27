import { SMALL_SCREEN_QUERY, useMediaQuery } from 'shared/useMediaQuery';
import { WeeklyTask } from '../../../types';
import { getWeeklyProgress } from './weeklyProgress';
import { CompletedDates } from './CompletedDates';
import { ProgressBar } from './ProgressBar';
import { ProgressCount } from './ProgressCount';

type ProgressIndicatorProps = Pick<
  WeeklyTask,
  'completed' | 'frequency' | 'description'
> & {
  onAdd: () => void;
  onRemove: () => void;
};

export function ProgressIndicator({
  completed,
  frequency,
  description,
  onAdd,
  onRemove,
}: ProgressIndicatorProps) {
  const isSmallScreen = useMediaQuery(SMALL_SCREEN_QUERY);
  const completedDates = completed ?? [];
  const { numberDone, remainder, isDue, fillOpacity } = getWeeklyProgress(
    completedDates,
    frequency,
  );

  const progressProps = {
    numberDone,
    frequency,
    label: `${description}: ${numberDone} of ${frequency} done`,
    isDue,
    fillOpacity,
    onAdd,
    onRemove,
  };

  return (
    <div className="indicators">
      {isSmallScreen ? (
        <ProgressCount {...progressProps} />
      ) : (
        <>
          <ProgressBar {...progressProps} />
          {remainder > 0 && <span className="remainder">+{remainder}</span>}
        </>
      )}
      {numberDone > 0 && <CompletedDates dates={completedDates} />}
    </div>
  );
}
