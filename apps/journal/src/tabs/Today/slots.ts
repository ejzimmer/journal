import { updateCompletionDate } from 'shared/years';
import { AMIMONO_PROJECTS_PATH, isSubtaskSlot } from 'shared/todaySlots/types';
import {
  DailyTask,
  ProjectDetails,
  ProjectSubtask,
  TodaySlot,
} from '../../types';

type ProjectsWithSubtasks = Record<
  string,
  { subtasks?: Record<string, Pick<ProjectSubtask, 'status'>> }
>;
export type ProjectsByPath = Record<string, ProjectsWithSubtasks | undefined>;

const SUBTASKS_SEPARATOR = '/subtasks/';

export const getProjectPath = (subtaskPath: string) =>
  subtaskPath.split(SUBTASKS_SEPARATOR)[0];

export const isAmimonoSubtaskPath = (subtaskPath: string) =>
  subtaskPath.startsWith(`${AMIMONO_PROJECTS_PATH}/`);

export function findSubtaskStatus(
  projectsByPath: ProjectsByPath,
  subtaskPath: string,
): ProjectSubtask['status'] | undefined {
  const [projectPath, subtaskId] = subtaskPath.split(SUBTASKS_SEPARATOR);
  const projectIdStart = projectPath.lastIndexOf('/');
  const projectsPath = projectPath.slice(0, projectIdStart);
  const projectId = projectPath.slice(projectIdStart + 1);

  return projectsByPath[projectsPath]?.[projectId]?.subtasks?.[subtaskId]
    ?.status;
}

export function isSlotDone(slot: TodaySlot, projectsByPath: ProjectsByPath) {
  if (isSubtaskSlot(slot)) {
    return findSubtaskStatus(projectsByPath, slot.subtaskPath) !== 'ready';
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
