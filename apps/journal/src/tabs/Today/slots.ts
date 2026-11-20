import { updateCompletionDate } from 'shared/years';
import {
  DailyTask,
  ProjectDetails,
  ProjectSubtask,
  SubtaskSlot,
  TodaySlot,
} from '../../types';

export const isSubtaskSlot = (slot: TodaySlot): slot is SubtaskSlot =>
  'subtaskPath' in slot;

export const getProjectPath = (subtaskPath: string) =>
  subtaskPath.split('/').slice(0, 2).join('/');

export function findSubtask(
  projects: Record<string, ProjectDetails> | undefined,
  subtaskPath: string,
): ProjectSubtask | undefined {
  const [, projectId, , subtaskId] = subtaskPath.split('/');
  return projects?.[projectId]?.subtasks?.[subtaskId];
}

export function isSlotDone(
  slot: TodaySlot,
  projects: Record<string, ProjectDetails> | undefined,
) {
  if (isSubtaskSlot(slot)) {
    return findSubtask(projects, slot.subtaskPath)?.status !== 'ready';
  }

  return (slot as DailyTask).status !== 'ready';
}

export function toggleSubtaskInProject(
  project: ProjectDetails,
  subtask: ProjectSubtask,
): ProjectDetails {
  const status: ProjectSubtask['status'] =
    subtask.status === 'done' ? 'ready' : 'done';
  const subtasks = {
    ...project.subtasks,
    [subtask.id]: { ...subtask, status },
  };
  const isProjectDone = Object.values(subtasks).every(
    (other) => other.status === 'done',
  );

  return updateCompletionDate(
    { ...project, subtasks, status: isProjectDone ? 'done' : 'in_progress' },
    isProjectDone,
  );
}
