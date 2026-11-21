import { useStorageContext } from 'shared/FirebaseContext';
import {
  AMIMONO_PROJECTS_PATH,
  isSubtaskSlot,
  TODAY_SLOT_COUNT,
  TODAY_SLOTS_KEY,
} from 'shared/todaySlots/types';
import { useTodaySlots } from 'shared/todaySlots/useTodaySlots';
import { DailyTask, TodaySlot } from '../../types';
import { TodayTask } from '../Todo/Today/TodayTask';
import { AmimonoSubtaskSlotItem } from './AmimonoSubtaskSlotItem';
import { SubtaskSlotItem } from './SubtaskSlotItem';

export function TodaySlots() {
  const { updateItem } = useStorageContext();
  const { slots } = useTodaySlots<TodaySlot>();
  const emptySlotCount = Math.max(0, TODAY_SLOT_COUNT - slots.length);

  const renderSlot = (slot: TodaySlot) => {
    if (!isSubtaskSlot(slot)) {
      return (
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
      );
    }

    return slot.subtaskPath.startsWith(`${AMIMONO_PROJECTS_PATH}/`) ? (
      <AmimonoSubtaskSlotItem key={slot.id} slot={slot} />
    ) : (
      <SubtaskSlotItem key={slot.id} slot={slot} />
    );
  };

  return (
    <ol className="today-slots">
      {slots.map(renderSlot)}
      {Array.from({ length: emptySlotCount }, (_, index) => (
        <li key={index} className="item today-slot empty" />
      ))}
    </ol>
  );
}
