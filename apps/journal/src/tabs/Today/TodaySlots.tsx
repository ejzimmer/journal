import { useStorageContext } from 'shared/FirebaseContext';
import { DailyTask, TODAY_SLOT_COUNT, TODAY_SLOTS_KEY } from '../../types';
import { TodayTask } from '../Todo/Today/TodayTask';
import { SubtaskSlotItem } from './SubtaskSlotItem';
import { useTodaySlots } from './useTodaySlots';
import { isSubtaskSlot } from './slots';

export function TodaySlots() {
  const { updateItem } = useStorageContext();
  const { slots } = useTodaySlots();
  const emptySlotCount = Math.max(0, TODAY_SLOT_COUNT - slots.length);

  return (
    <ol className="today-slots">
      {slots.map((slot) =>
        isSubtaskSlot(slot) ? (
          <SubtaskSlotItem key={slot.id} slot={slot} />
        ) : (
          <li
            key={slot.id}
            className={`today-task item today-slot status-${slot.status} type-${slot.type}`}
          >
            <TodayTask
              task={slot}
              listId={TODAY_SLOTS_KEY}
              onChange={(task) => updateItem<DailyTask>(TODAY_SLOTS_KEY, task)}
            />
          </li>
        ),
      )}
      {Array.from({ length: emptySlotCount }, (_, index) => (
        <li key={index} className="item today-slot empty" />
      ))}
    </ol>
  );
}
