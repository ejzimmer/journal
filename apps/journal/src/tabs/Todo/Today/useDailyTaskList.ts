import { useStorageContext } from 'shared/FirebaseContext';
import { Destination, SortableItem } from 'shared/drag-and-drop/types';
import { onChangePosition, sortByPosition } from 'shared/drag-and-drop/utils';
import { DailyTask } from '../../../types';
import { ReorderControls } from './ReorderControls';

export function useDailyTaskList(listId: string) {
  const { useValue, updateList, updateItem } = useStorageContext();
  const { value } = useValue<Record<string, DailyTask>>(listId);
  const tasks = value ? sortByPosition(Object.values(value)) : [];

  const moveTask = (index: number, destination: Destination) =>
    onChangePosition(tasks, index, destination, (tasks: SortableItem[]) =>
      updateList(listId, tasks),
    );

  const getReorderControls = (index: number): ReorderControls => ({
    isFirst: index === 0,
    isLast: index === tasks.length - 1,
    move: (destination) => moveTask(index, destination),
  });

  const updateTask = (task: DailyTask) => updateItem<DailyTask>(listId, task);

  return { tasks, getReorderControls, updateTask };
}
