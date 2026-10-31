import { getDaysSince } from '../../../shared/dates';
import {
  SMALL_SCREEN_QUERY,
  useMediaQuery,
} from '../../../shared/useMediaQuery';
import { WeeklyTask } from '../../../shared/types';
import { formatWeekday, isTaskDue } from './utils';
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
  const numberDone = completedDates.length;
  const remainder = Math.max(numberDone - frequency, 0);

  const mostRecentlyDone = completedDates.reduce<string | undefined>(
    (latest, date) =>
      latest === undefined || Temporal.PlainDate.compare(date, latest) > 0
        ? date
        : latest,
    undefined,
  );
  const isDue = isTaskDue(mostRecentlyDone, frequency);
  const daysSinceDone = mostRecentlyDone ? getDaysSince(mostRecentlyDone) : 0;
  const fillOpacity =
    daysSinceDone > 2 ? Math.max(0, 1 - 0.2 * (daysSinceDone - 2)) : 1;

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
      {numberDone > 0 && (
        <ol className="dates-popover">
          {completedDates.map((date) => (
            <li key={date}>{formatWeekday(date)}</li>
          ))}
        </ol>
      )}
    </div>
  );
}
