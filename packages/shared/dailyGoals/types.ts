import { SortableItem } from '../drag-and-drop/types';

export const DAILY_GOALS_KEY = '今日/slots';
export const TODAY_SLOT_COUNT = 3;

export type SubtaskGoal = SortableItem & {
  projectPath: string;
  subtaskPath: string;
};

export const isSubtaskGoal = (
  goal: SortableItem | SubtaskGoal,
): goal is SubtaskGoal => 'subtaskPath' in goal;
