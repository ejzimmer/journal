import { useStorageContext } from 'shared/FirebaseContext';
import { getNextPosition, sortByPosition } from 'shared/drag-and-drop/utils';
import {
  DailyTask,
  TODAY_SLOT_COUNT,
  TODAY_SLOTS_KEY,
  TodaySlot,
} from '../../types';
import { isSubtaskSlot } from './slots';

export function useTodaySlots() {
  const { useValue, addItem, setValues } = useStorageContext();
  const { value } = useValue<Record<string, TodaySlot>>(TODAY_SLOTS_KEY);
  const slots = sortByPosition(Object.values(value ?? {}));
  const hasFreeSlot = slots.length < TODAY_SLOT_COUNT;
  const nextPosition = getNextPosition(slots);

  const moveTaskToSlot = (task: DailyTask, sourceListId: string) => {
    if (!hasFreeSlot) return;

    setValues({
      [`${TODAY_SLOTS_KEY}/${task.id}`]: { ...task, position: nextPosition },
      [`${sourceListId}/${task.id}`]: null,
    });
  };

  const addSubtaskToSlot = (subtaskPath: string) => {
    if (!hasFreeSlot) return;

    addItem(TODAY_SLOTS_KEY, { subtaskPath, position: nextPosition });
  };

  const findSubtaskSlot = (subtaskPath: string) =>
    slots.find(
      (slot) => isSubtaskSlot(slot) && slot.subtaskPath === subtaskPath,
    );

  const removeSubtaskFromSlot = (subtaskPath: string) => {
    const slot = findSubtaskSlot(subtaskPath);
    if (slot) setValues({ [`${TODAY_SLOTS_KEY}/${slot.id}`]: null });
  };

  const isSubtaskInSlot = (subtaskPath: string) =>
    findSubtaskSlot(subtaskPath) !== undefined;

  return {
    slots,
    hasFreeSlot,
    moveTaskToSlot,
    addSubtaskToSlot,
    removeSubtaskFromSlot,
    isSubtaskInSlot,
  };
}
