import { getToday, isAfterToday, isBeforeToday } from '../../shared/dates';
import { useStorageContext } from '../../shared/FirebaseContext';
import { useDailyJob } from '../../shared/dailyJobs/DailyJobsContext';
import {
  renumberPositions,
  sortByPosition,
} from '../../shared/drag-and-drop/utils';
import { WorkTask, WORK_CLEANUP_KEY, WORK_KEY } from './types';
import { getAppendPosition } from './taskPosition';
import { TODAY_LIST_NAME } from './priorityDestination';
import { addSourceListLabel } from './labelUtils';

const finishedBeforeToday = (task: WorkTask) =>
  task.status === 'done' && isBeforeToday(task.lastStatusUpdate);

const isDue = (task: WorkTask) =>
  task.status !== 'done' && !!task.dueDate && !isAfterToday(task.dueDate);

const getItemsKey = (list: WorkTask) => `${WORK_KEY}/${list.id}/items`;

const getSortedItems = (list: WorkTask) =>
  sortByPosition(Object.values(list.items ?? {}));

const findListByName = (lists: WorkTask[], name: string) =>
  lists.find((list) => list.description === name);

const hasListChanged = (list: WorkTask, items: WorkTask[]) =>
  items.length !== Object.keys(list.items ?? {}).length ||
  items.some((task) => list.items?.[task.id]?.position !== task.position);

export function useWorkDailyUpdate() {
  const { useValue, addItem, updateList } = useStorageContext();
  const { value: lists, synced } = useValue<Record<string, WorkTask>>(WORK_KEY);

  useDailyJob({
    lastRunKey: WORK_CLEANUP_KEY,
    isReady: synced && lists !== undefined,
    run: () => {
      const allLists = sortByPosition(Object.values(lists ?? {}));
      const doneList = findListByName(allLists, 'Done');
      const todayList = findListByName(allLists, TODAY_LIST_NAME);
      const activeLists = allLists.filter((list) => list !== doneList);

      const tasksToFinish = doneList
        ? activeLists.flatMap((list) =>
            getSortedItems(list).filter(finishedBeforeToday),
          )
        : [];
      const dueTasks = todayList
        ? activeLists.flatMap((list) =>
            getSortedItems(list)
              .filter(isDue)
              .map((task) =>
                list === todayList
                  ? task
                  : {
                      ...addSourceListLabel(task, list),
                      parentId: getItemsKey(todayList),
                    },
              ),
          )
        : [];

      if (doneList) {
        let nextDonePosition = getAppendPosition(doneList);
        tasksToFinish.forEach((task) =>
          addItem<WorkTask>(getItemsKey(doneList), {
            ...task,
            parentId: getItemsKey(doneList),
            position: nextDonePosition++,
            lastStatusUpdate: getToday(),
          }),
        );
      }

      const movingTaskIds = new Set(
        [...tasksToFinish, ...dueTasks].map((task) => task.id),
      );
      activeLists.forEach((list) => {
        const remainingTasks = getSortedItems(list).filter(
          (task) => !movingTaskIds.has(task.id),
        );
        const items = renumberPositions(
          list === todayList
            ? [...dueTasks, ...remainingTasks]
            : remainingTasks,
        );

        if (hasListChanged(list, items)) {
          updateList(getItemsKey(list), items);
        }
      });
    },
  });
}
