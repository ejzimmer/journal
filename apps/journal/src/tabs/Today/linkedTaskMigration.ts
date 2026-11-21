import { getNextPosition } from 'shared/drag-and-drop/utils';
import {
  DailyTask,
  ONCE_KEY,
  ProjectDetails,
  PROJECTS_KEY,
  DailyGoalItem,
} from '../../types';
import {
  DAILY_GOALS_KEY,
  TODAY_SLOT_COUNT,
  isSubtaskGoal,
} from 'shared/dailyGoals/types';
import { findJournalProjectPath } from './goalProjectPathMigration';

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
  goals = {},
  projects = {},
}: {
  onceTasks?: Record<string, DailyTask>;
  goals?: Record<string, DailyGoalItem>;
  projects?: Record<string, ProjectDetails>;
}): Record<string, unknown> {
  const updates: [string, unknown][] = [];
  const goalList = Object.values(goals);
  const subtaskPathsInGoals = new Set(
    goalList.filter(isSubtaskGoal).map((goal) => goal.subtaskPath),
  );
  let goalCount = goalList.length;
  let nextPosition = getNextPosition(goalList);

  goalList.forEach((goal) => {
    if (isSubtaskGoal(goal) || !goal.linkedTask) return;

    if (isSubtaskPath(goal.linkedTask)) {
      updates.push([
        `${DAILY_GOALS_KEY}/${goal.id}`,
        {
          id: goal.id,
          position: goal.position,
          projectPath: findJournalProjectPath(goal.linkedTask),
          subtaskPath: goal.linkedTask,
        },
      ]);
      subtaskPathsInGoals.add(goal.linkedTask);
    } else {
      updates.push([`${DAILY_GOALS_KEY}/${goal.id}/linkedTask`, null]);
    }
  });

  Object.values(onceTasks).forEach((task) => {
    if (!task.linkedTask) return;

    const subtaskPath = task.linkedTask;
    const isOpenSubtaskLink =
      isSubtaskPath(subtaskPath) && task.status === 'ready';

    if (isOpenSubtaskLink && subtaskPathsInGoals.has(subtaskPath)) {
      updates.push([`${ONCE_KEY}/${task.id}`, null]);
    } else if (isOpenSubtaskLink && goalCount < TODAY_SLOT_COUNT) {
      updates.push(
        [`${ONCE_KEY}/${task.id}`, null],
        [
          `${DAILY_GOALS_KEY}/${task.id}`,
          {
            id: task.id,
            position: nextPosition,
            projectPath: findJournalProjectPath(subtaskPath),
            subtaskPath,
          },
        ],
      );
      subtaskPathsInGoals.add(subtaskPath);
      goalCount += 1;
      nextPosition += 1;
    } else {
      updates.push([`${ONCE_KEY}/${task.id}/linkedTask`, null]);
    }
  });

  return Object.fromEntries([...updates, ...findProjectLinkUpdates(projects)]);
}
