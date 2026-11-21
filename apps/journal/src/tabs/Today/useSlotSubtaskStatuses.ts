import { useStorageContext } from 'shared/FirebaseContext';
import { BaseSubtask } from 'shared/projects/types';
import { SubtaskSlot } from 'shared/todaySlots/types';

function useSubtaskStatus(subtaskPath?: string) {
  const { useValue } = useStorageContext();
  const { value, synced } = useValue<BaseSubtask>(subtaskPath);

  return { status: value?.status, synced: !subtaskPath || synced };
}

// Hooks have to be called the same number of times on every render, so this
// reads one subtask for each of Today's three slots.
export function useSlotSubtaskStatuses(slots: SubtaskSlot[]) {
  const reads = [
    useSubtaskStatus(slots[0]?.subtaskPath),
    useSubtaskStatus(slots[1]?.subtaskPath),
    useSubtaskStatus(slots[2]?.subtaskPath),
  ];

  return {
    synced: reads.every((read) => read.synced),
    findStatus: (slot: SubtaskSlot) => reads[slots.indexOf(slot)]?.status,
  };
}
