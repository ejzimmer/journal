import { reorderWithEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge';
import { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import { renumberPositions } from 'shared/drag-and-drop/utils';
import { WorkTask } from './types';

const DEPENDENT_MARKER = '^^';

export const isDependentTask = (task: WorkTask) =>
  task.description.trimStart().startsWith(DEPENDENT_MARKER);

export function findBlockerSource(tasks: WorkTask[], index: number) {
  let sourceIndex = index;
  while (sourceIndex > 0 && isDependentTask(tasks[sourceIndex])) {
    sourceIndex--;
  }
  return tasks[sourceIndex];
}

export function groupTasksWithDependents(tasks: WorkTask[]) {
  return tasks.reduce<WorkTask[][]>((groups, task, index) => {
    if (index > 0 && isDependentTask(task)) {
      groups.at(-1)!.push(task);
    } else {
      groups.push([task]);
    }
    return groups;
  }, []);
}

export function findTaskWithDependents(tasks: WorkTask[], taskId: string) {
  const index = tasks.findIndex(({ id }) => id === taskId);
  if (index === -1) return [];

  const task = tasks[index];
  if (isDependentTask(task)) return [task];

  let end = index + 1;
  while (end < tasks.length && isDependentTask(tasks[end])) {
    end++;
  }
  return tasks.slice(index, end);
}

export function insertTasks(
  tasks: WorkTask[],
  index: number,
  inserted: WorkTask[],
) {
  let insertAt = Math.min(Math.max(index, 0), tasks.length);
  if (!isDependentTask(inserted[0])) {
    while (
      insertAt > 0 &&
      insertAt < tasks.length &&
      isDependentTask(tasks[insertAt])
    ) {
      insertAt++;
    }
  }
  return [...tasks.slice(0, insertAt), ...inserted, ...tasks.slice(insertAt)];
}

export function reorderTaskWithDependents({
  list,
  startIndex,
  indexOfTarget,
  closestEdgeOfTarget,
}: {
  list: WorkTask[];
  startIndex: number;
  indexOfTarget: number;
  closestEdgeOfTarget: Edge | null;
}) {
  if (isDependentTask(list[startIndex])) {
    return reorderWithEdge({
      list,
      startIndex,
      indexOfTarget,
      closestEdgeOfTarget,
      axis: 'vertical',
    });
  }

  const movedTasks = findTaskWithDependents(list, list[startIndex].id);
  const target = list[indexOfTarget];
  if (movedTasks.includes(target)) return list;

  const remainingTasks = list.filter((task) => !movedTasks.includes(task));
  const targetIndex = remainingTasks.indexOf(target);
  return insertTasks(
    remainingTasks,
    closestEdgeOfTarget === 'bottom' ? targetIndex + 1 : targetIndex,
    movedTasks,
  );
}

export function flattenReorderedGroups(
  groups: WorkTask[][],
  reorderedHeads: { id: string }[],
) {
  const groupsByHeadId = new Map(groups.map((group) => [group[0].id, group]));
  return renumberPositions(
    reorderedHeads.flatMap(({ id }) => groupsByHeadId.get(id) ?? []),
  );
}
