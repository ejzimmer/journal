import { useStorageContext } from '../FirebaseContext';
import { SortableItem } from '../drag-and-drop/types';
import { getNextPosition, sortByPosition } from '../drag-and-drop/utils';
import {
  getLinkedPath,
  isLinkedGoal,
  SubtaskGoal,
  TaskGoal,
  TODAY_SLOT_COUNT,
  DAILY_GOALS_KEY,
} from './types';

type GoalLink =
  Omit<SubtaskGoal, keyof SortableItem> | Omit<TaskGoal, keyof SortableItem>;

export function useDailyGoals<Goal extends SortableItem>() {
  const { useValue, addItem, setValues } = useStorageContext();
  const { value } = useValue<Record<string, Goal>>(DAILY_GOALS_KEY);
  const goals = sortByPosition(Object.values(value ?? {}));
  const hasFreeSlot = goals.length < TODAY_SLOT_COUNT;
  const nextPosition = getNextPosition(goals);

  const addGoal = (link: GoalLink) => {
    if (!hasFreeSlot) return;

    addItem(DAILY_GOALS_KEY, { ...link, position: nextPosition });
  };

  const findGoal = (linkedPath: string) =>
    goals.find(
      (goal) => isLinkedGoal(goal) && getLinkedPath(goal) === linkedPath,
    );

  const removeGoal = (linkedPath: string) => {
    const goal = findGoal(linkedPath);
    if (goal) setValues({ [`${DAILY_GOALS_KEY}/${goal.id}`]: null });
  };

  const hasGoal = (linkedPath: string) => findGoal(linkedPath) !== undefined;

  return { goals, hasFreeSlot, nextPosition, addGoal, removeGoal, hasGoal };
}
