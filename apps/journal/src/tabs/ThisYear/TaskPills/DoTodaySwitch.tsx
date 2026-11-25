import { ArrowRightIcon } from 'shared/icons/ArrowRight';
import { useDailyGoals } from 'shared/dailyGoals/useDailyGoals';
import { DailyTask, ONCE_KEY } from '../../../types';

type DoTodaySwitchProps = { task: DailyTask };

export function DoTodaySwitch({ task }: DoTodaySwitchProps) {
  const { hasFreeSlot, addTaskGoal, removeTaskGoal, hasTaskGoal } =
    useDailyGoals();
  const taskPath = `${ONCE_KEY}/${task.id}`;
  const isDoingToday = hasTaskGoal(taskPath);

  return (
    <button
      role="switch"
      className="do-today-switch"
      aria-label={`Do ${task.description} today`}
      aria-checked={isDoingToday}
      disabled={!isDoingToday && !hasFreeSlot}
      onClick={() =>
        isDoingToday ? removeTaskGoal(taskPath) : addTaskGoal(taskPath)
      }
    >
      <ArrowRightIcon width="14px" />
    </button>
  );
}
