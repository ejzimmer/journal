import { ArrowRightIcon } from 'shared/icons/ArrowRight';
import { useDailyGoals } from 'shared/dailyGoals/useDailyGoals';
import { DailyTask, ONCE_KEY } from '../../../types';

type OnTodaySwitchProps = { task: DailyTask };

export function OnTodaySwitch({ task }: OnTodaySwitchProps) {
  const { hasFreeSlot, addTaskGoal, removeTaskGoal, hasTaskGoal } =
    useDailyGoals();
  const taskPath = `${ONCE_KEY}/${task.id}`;
  const isOnToday = hasTaskGoal(taskPath);

  return (
    <button
      role="switch"
      className="on-today-switch"
      aria-label={`${task.description} on today`}
      aria-checked={isOnToday}
      disabled={!isOnToday && !hasFreeSlot}
      onClick={() =>
        isOnToday ? removeTaskGoal(taskPath) : addTaskGoal(taskPath)
      }
    >
      <ArrowRightIcon width="14px" />
    </button>
  );
}
