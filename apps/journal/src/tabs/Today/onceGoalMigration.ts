import { getNextPosition } from 'shared/drag-and-drop/utils';
import { DAILY_GOALS_KEY, isLinkedGoal } from 'shared/dailyGoals/types';
import { DailyTask, ONCE_KEY, DailyGoalItem } from '../../types';

const isMovedOnceTask = (goal: DailyGoalItem): goal is DailyTask =>
  !isLinkedGoal(goal) && !goal.linkedTask;

export function createOnceGoalMigration({
  onceTasks = {},
  goals = {},
}: {
  onceTasks?: Record<string, DailyTask>;
  goals?: Record<string, DailyGoalItem>;
}): Record<string, unknown> {
  let nextPosition = getNextPosition(Object.values(onceTasks));

  return Object.fromEntries(
    Object.values(goals)
      .filter(isMovedOnceTask)
      .flatMap((task) => {
        const taskPath = `${ONCE_KEY}/${task.id}`;
        const position = nextPosition;
        nextPosition += 1;

        return [
          [taskPath, { ...task, parentId: ONCE_KEY, position }],
          [
            `${DAILY_GOALS_KEY}/${task.id}`,
            { id: task.id, position: task.position, taskPath },
          ],
        ];
      }),
  );
}
