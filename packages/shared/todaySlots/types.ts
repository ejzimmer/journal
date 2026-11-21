import { SortableItem } from '../drag-and-drop/types';

export const TODAY_SLOTS_KEY = '今日/slots';
export const TODAY_SLOT_COUNT = 3;

// Slots hold subtask paths as the journal reads them, so subtasks from
// Amimono, which stores its data under v2/amimono, sit under this path.
export const AMIMONO_PROJECTS_PATH = 'amimono/projects';

export type SubtaskSlot = SortableItem & { subtaskPath: string };

export const isSubtaskSlot = (
  slot: SortableItem | SubtaskSlot,
): slot is SubtaskSlot => 'subtaskPath' in slot;
