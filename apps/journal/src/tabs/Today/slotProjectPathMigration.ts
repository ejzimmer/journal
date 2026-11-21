import { SubtaskSlot, TODAY_SLOTS_KEY } from 'shared/todaySlots/types';
import { TodaySlot } from '../../types';

type OlderSubtaskSlot = Omit<SubtaskSlot, 'projectPath'>;

export const findJournalProjectPath = (subtaskPath: string) =>
  subtaskPath.split('/subtasks/')[0];

const isOlderSubtaskSlot = (
  slot: TodaySlot | OlderSubtaskSlot,
): slot is OlderSubtaskSlot =>
  'subtaskPath' in slot && !('projectPath' in slot);

// Slots saved by older versions only have a subtask path, and every one of
// those subtasks is in the journal's projects.
export function createSlotProjectPathUpdates(
  slots: Record<string, TodaySlot | OlderSubtaskSlot> = {},
): Record<string, string> {
  return Object.fromEntries(
    Object.values(slots)
      .filter(isOlderSubtaskSlot)
      .map((slot) => [
        `${TODAY_SLOTS_KEY}/${slot.id}/projectPath`,
        findJournalProjectPath(slot.subtaskPath),
      ]),
  );
}
