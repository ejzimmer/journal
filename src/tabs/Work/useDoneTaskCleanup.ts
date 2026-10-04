import { getToday, isBeforeToday } from '../../shared/dates';
import { useStorageContext } from '../../shared/FirebaseContext';
import { useDailyJob } from '../../shared/dailyJobs/DailyJobsContext';
import {
  renumberPositions,
  sortByPosition,
} from '../../shared/drag-and-drop/utils';
import { WorkTask, WORK_CLEANUP_KEY, WORK_KEY } from './types';
import { getAppendPosition } from './taskPosition';

const finishedBeforeToday = (task: WorkTask) =>
  task.status === 'done' && isBeforeToday(task.lastStatusUpdate);

export function useDoneTaskCleanup() {
  const { useValue, addItem, updateList } = useStorageContext();
  const { value: lists, synced } = useValue<Record<string, WorkTask>>(WORK_KEY);

  useDailyJob({
    lastRunKey: WORK_CLEANUP_KEY,
    isReady: synced && lists !== undefined,
    run: () => {
      const allLists = Object.values(lists ?? {});
      const doneList = allLists.find((list) => list.description === 'Done');
      if (!doneList) return;

      const doneListItemsKey = `${WORK_KEY}/${doneList.id}/items`;
      let nextDonePosition = getAppendPosition(doneList);

      allLists.forEach((list) => {
        if (list.id === doneList.id || !list.items) return;

        const { done, notDone } = Object.values(list.items).reduce(
          (
            { done, notDone }: { done: WorkTask[]; notDone: WorkTask[] },
            task,
          ) => {
            if (finishedBeforeToday(task)) {
              done.push(task);
            } else {
              notDone.push(task);
            }

            return { done, notDone };
          },
          { done: [], notDone: [] },
        );

        sortByPosition(done).forEach((task) =>
          addItem<WorkTask>(doneListItemsKey, {
            ...task,
            parentId: doneListItemsKey,
            position: nextDonePosition++,
            lastStatusUpdate: getToday(),
          }),
        );

        const orderedNotDone = renumberPositions(sortByPosition(notDone));
        const positionsChanged = orderedNotDone.some(
          (task) => list.items?.[task.id]?.position !== task.position,
        );

        if (done.length > 0 || positionsChanged) {
          updateList(`${WORK_KEY}/${list.id}/items`, orderedNotDone);
        }
      });
    },
  });
}
