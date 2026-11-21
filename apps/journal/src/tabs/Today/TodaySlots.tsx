import { useStorageContext } from 'shared/FirebaseContext';
import {
  isSubtaskSlot,
  TODAY_SLOT_COUNT,
  TODAY_SLOTS_KEY,
} from 'shared/todaySlots/types';
import { useTodaySlots } from 'shared/todaySlots/useTodaySlots';
import { DailyTask, TodaySlot } from '../../types';
import { toggleDailyTaskStatus } from '../Todo/Today/toggleDailyTaskStatus';
import { DailyGoal } from './DailyGoal';
import { SubtaskSlotItem } from './SubtaskSlotItem';

export function TodaySlots() {
  const { updateItem } = useStorageContext();
  const { slots } = useTodaySlots<TodaySlot>();
  const emptySlotCount = Math.max(0, TODAY_SLOT_COUNT - slots.length);

  return (
    <ol className="today-slots">
      {slots.map((slot) =>
        isSubtaskSlot(slot) ? (
          <SubtaskSlotItem key={slot.id} slot={slot} />
        ) : (
          <DailyGoal
            key={slot.id}
            task={slot}
            onToggle={() =>
              updateItem<DailyTask>(
                TODAY_SLOTS_KEY,
                toggleDailyTaskStatus(slot),
              )
            }
          />
        ),
      )}
      {Array.from({ length: emptySlotCount }, (_, index) => (
        <li key={index} className="item today-slot empty" />
      ))}
    </ol>
  );
}
