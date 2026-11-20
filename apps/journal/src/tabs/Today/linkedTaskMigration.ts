import { getNextPosition } from 'shared/drag-and-drop/utils';
import {
  DailyTask,
  ONCE_KEY,
  ProjectDetails,
  PROJECTS_KEY,
  TODAY_SLOT_COUNT,
  TODAY_SLOTS_KEY,
  TodaySlot,
} from '../../types';
import { isSubtaskSlot } from './slots';

const isSubtaskPath = (path: string) => path.split('/')[2] === 'subtasks';

function findProjectLinkUpdates(projects: Record<string, ProjectDetails>) {
  return Object.values(projects).flatMap((project) => [
    ...(project.linkedTaskId
      ? [[`${PROJECTS_KEY}/${project.id}/linkedTaskId`, null]]
      : []),
    ...Object.values(project.subtasks ?? {})
      .filter((subtask) => subtask.linkedId)
      .map((subtask) => [
        `${PROJECTS_KEY}/${project.id}/subtasks/${subtask.id}/linkedId`,
        null,
      ]),
  ]);
}

export function createLinkedTaskMigration({
  onceTasks = {},
  slots = {},
  projects = {},
}: {
  onceTasks?: Record<string, DailyTask>;
  slots?: Record<string, TodaySlot>;
  projects?: Record<string, ProjectDetails>;
}): Record<string, unknown> {
  const updates: [string, unknown][] = [];
  const slotList = Object.values(slots);
  const subtaskPathsInSlots = new Set(
    slotList.filter(isSubtaskSlot).map((slot) => slot.subtaskPath),
  );
  let slotCount = slotList.length;
  let nextPosition = getNextPosition(slotList);

  slotList.forEach((slot) => {
    if (isSubtaskSlot(slot) || !slot.linkedTask) return;

    if (isSubtaskPath(slot.linkedTask)) {
      updates.push([
        `${TODAY_SLOTS_KEY}/${slot.id}`,
        { id: slot.id, position: slot.position, subtaskPath: slot.linkedTask },
      ]);
      subtaskPathsInSlots.add(slot.linkedTask);
    } else {
      updates.push([`${TODAY_SLOTS_KEY}/${slot.id}/linkedTask`, null]);
    }
  });

  Object.values(onceTasks).forEach((task) => {
    if (!task.linkedTask) return;

    const subtaskPath = task.linkedTask;
    const isOpenSubtaskLink =
      isSubtaskPath(subtaskPath) && task.status === 'ready';

    if (isOpenSubtaskLink && subtaskPathsInSlots.has(subtaskPath)) {
      updates.push([`${ONCE_KEY}/${task.id}`, null]);
    } else if (isOpenSubtaskLink && slotCount < TODAY_SLOT_COUNT) {
      updates.push(
        [`${ONCE_KEY}/${task.id}`, null],
        [
          `${TODAY_SLOTS_KEY}/${task.id}`,
          { id: task.id, position: nextPosition, subtaskPath },
        ],
      );
      subtaskPathsInSlots.add(subtaskPath);
      slotCount += 1;
      nextPosition += 1;
    } else {
      updates.push([`${ONCE_KEY}/${task.id}/linkedTask`, null]);
    }
  });

  return Object.fromEntries([...updates, ...findProjectLinkUpdates(projects)]);
}
