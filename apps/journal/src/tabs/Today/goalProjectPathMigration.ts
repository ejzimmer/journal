import { SubtaskGoal, DAILY_GOALS_KEY } from 'shared/dailyGoals/types';
import { DailyGoalItem } from '../../types';

type OlderSubtaskGoal = Omit<SubtaskGoal, 'projectPath'>;

export const findJournalProjectPath = (subtaskPath: string) =>
  subtaskPath.split('/subtasks/')[0];

const isOlderSubtaskGoal = (
  goal: DailyGoalItem | OlderSubtaskGoal,
): goal is OlderSubtaskGoal =>
  'subtaskPath' in goal && !('projectPath' in goal);

// Daily goals saved by older versions only have a subtask path, and every one of
// those subtasks is in the journal's projects.
export function createGoalProjectPathUpdates(
  goals: Record<string, DailyGoalItem | OlderSubtaskGoal> = {},
): Record<string, string> {
  return Object.fromEntries(
    Object.values(goals)
      .filter(isOlderSubtaskGoal)
      .map((goal) => [
        `${DAILY_GOALS_KEY}/${goal.id}/projectPath`,
        findJournalProjectPath(goal.subtaskPath),
      ]),
  );
}
