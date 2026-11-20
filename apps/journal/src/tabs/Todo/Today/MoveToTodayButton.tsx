import { ArrowRightIcon } from 'shared/icons/ArrowRight';
import { DailyTask, ONCE_KEY } from '../../../types';
import { useTodaySlots } from '../../Today/useTodaySlots';

type MoveToTodayButtonProps = { task: DailyTask };

export function MoveToTodayButton({ task }: MoveToTodayButtonProps) {
  const { hasFreeSlot, moveTaskToSlot } = useTodaySlots();

  return (
    <button
      className="icon ghost move-to-today"
      aria-label={`Move ${task.description} to today`}
      disabled={!hasFreeSlot}
      onClick={() => moveTaskToSlot(task, ONCE_KEY)}
    >
      <ArrowRightIcon width="16px" />
    </button>
  );
}
