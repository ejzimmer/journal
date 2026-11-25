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

export type TaskGoal = SortableItem & { taskPath: string };

export const isTaskGoal = (goal: SortableItem | TaskGoal): goal is TaskGoal =>
  'taskPath' in goal;

export type LinkedGoal = SubtaskGoal | TaskGoal;

export const isLinkedGoal = (goal: SortableItem): goal is LinkedGoal =>
  isSubtaskGoal(goal) || isTaskGoal(goal);

export const getLinkedPath = (goal: LinkedGoal) =>
  isSubtaskGoal(goal) ? goal.subtaskPath : goal.taskPath;
