import { useStorageContext } from 'shared/FirebaseContext';
import { ArrowRightIcon } from 'shared/icons/ArrowRight';
import { DAILY_GOALS_KEY } from 'shared/dailyGoals/types';
import { useDailyGoals } from 'shared/dailyGoals/useDailyGoals';
import { DailyTask, ONCE_KEY, DailyGoalItem } from '../../../types';

type MoveToTodayButtonProps = { task: DailyTask };

export function MoveToTodayButton({ task }: MoveToTodayButtonProps) {
  const { setValues } = useStorageContext();
  const { hasFreeSlot, nextPosition } = useDailyGoals<DailyGoalItem>();

  const moveTaskToToday = () =>
    setValues({
      [`${DAILY_GOALS_KEY}/${task.id}`]: { ...task, position: nextPosition },
      [`${ONCE_KEY}/${task.id}`]: null,
    });

  return (
    <button
      className="icon ghost move-to-today"
      aria-label={`Move ${task.description} to today`}
      disabled={!hasFreeSlot}
      onClick={moveTaskToToday}
    >
      <ArrowRightIcon width="16px" />
    </button>
  );
}
