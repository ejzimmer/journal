import { useStorageContext } from '../FirebaseContext';
import { SortableItem } from '../drag-and-drop/types';
import { getNextPosition, sortByPosition } from '../drag-and-drop/utils';
import { isSubtaskSlot, TODAY_SLOT_COUNT, TODAY_SLOTS_KEY } from './types';

export function useTodaySlots<Slot extends SortableItem>() {
  const { useValue, addItem, setValues } = useStorageContext();
  const { value } = useValue<Record<string, Slot>>(TODAY_SLOTS_KEY);
  const slots = sortByPosition(Object.values(value ?? {}));
  const hasFreeSlot = slots.length < TODAY_SLOT_COUNT;
  const nextPosition = getNextPosition(slots);

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
    nextPosition,
    addSubtaskToSlot,
    removeSubtaskFromSlot,
    isSubtaskInSlot,
  };
}
