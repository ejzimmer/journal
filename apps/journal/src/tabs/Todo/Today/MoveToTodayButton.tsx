import { useStorageContext } from 'shared/FirebaseContext';
import { ArrowRightIcon } from 'shared/icons/ArrowRight';
import { TODAY_SLOTS_KEY } from 'shared/todaySlots/types';
import { useTodaySlots } from 'shared/todaySlots/useTodaySlots';
import { DailyTask, ONCE_KEY, TodaySlot } from '../../../types';

type MoveToTodayButtonProps = { task: DailyTask };

export function MoveToTodayButton({ task }: MoveToTodayButtonProps) {
  const { setValues } = useStorageContext();
  const { hasFreeSlot, nextPosition } = useTodaySlots<TodaySlot>();

  const moveTaskToSlot = () =>
    setValues({
      [`${TODAY_SLOTS_KEY}/${task.id}`]: { ...task, position: nextPosition },
      [`${ONCE_KEY}/${task.id}`]: null,
    });

  return (
    <button
      className="icon ghost move-to-today"
      aria-label={`Move ${task.description} to today`}
      disabled={!hasFreeSlot}
      onClick={moveTaskToSlot}
    >
      <ArrowRightIcon width="16px" />
    </button>
  );
}
