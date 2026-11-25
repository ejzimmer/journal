import { useStorageContext } from '../FirebaseContext';
import { SortableItem } from '../drag-and-drop/types';
import { getNextPosition, sortByPosition } from '../drag-and-drop/utils';
import {
  isSubtaskGoal,
  isTaskGoal,
  TODAY_SLOT_COUNT,
  DAILY_GOALS_KEY,
} from './types';

export function useDailyGoals<Goal extends SortableItem>() {
  const { useValue, addItem, setValues } = useStorageContext();
  const { value } = useValue<Record<string, Goal>>(DAILY_GOALS_KEY);
  const goals = sortByPosition(Object.values(value ?? {}));
  const hasFreeSlot = goals.length < TODAY_SLOT_COUNT;
  const nextPosition = getNextPosition(goals);

  const addSubtaskGoal = (projectPath: string, subtaskPath: string) => {
    if (!hasFreeSlot) return;

    addItem(DAILY_GOALS_KEY, {
      projectPath,
      subtaskPath,
      position: nextPosition,
    });
  };

  const findSubtaskGoal = (subtaskPath: string) =>
    goals.find(
      (goal) => isSubtaskGoal(goal) && goal.subtaskPath === subtaskPath,
    );

  const removeGoal = (goal?: Goal) => {
    if (goal) setValues({ [`${DAILY_GOALS_KEY}/${goal.id}`]: null });
  };

  const removeSubtaskGoal = (subtaskPath: string) =>
    removeGoal(findSubtaskGoal(subtaskPath));

  const hasSubtaskGoal = (subtaskPath: string) =>
    findSubtaskGoal(subtaskPath) !== undefined;

  const addTaskGoal = (taskPath: string) => {
    if (!hasFreeSlot) return;

    addItem(DAILY_GOALS_KEY, { taskPath, position: nextPosition });
  };

  const findTaskGoal = (taskPath: string) =>
    goals.find((goal) => isTaskGoal(goal) && goal.taskPath === taskPath);

  const removeTaskGoal = (taskPath: string) =>
    removeGoal(findTaskGoal(taskPath));

  const hasTaskGoal = (taskPath: string) =>
    findTaskGoal(taskPath) !== undefined;

  return {
    goals,
    hasFreeSlot,
    nextPosition,
    addSubtaskGoal,
    removeSubtaskGoal,
    hasSubtaskGoal,
    addTaskGoal,
    removeTaskGoal,
    hasTaskGoal,
  };
}
