import { SortableItem } from '../drag-and-drop/types';

export const TODAY_SLOTS_KEY = '今日/slots';
export const TODAY_SLOT_COUNT = 3;

export type SubtaskSlot = SortableItem & {
  projectPath: string;
  subtaskPath: string;
};

export const isSubtaskSlot = (
  slot: SortableItem | SubtaskSlot,
): slot is SubtaskSlot => 'subtaskPath' in slot;
