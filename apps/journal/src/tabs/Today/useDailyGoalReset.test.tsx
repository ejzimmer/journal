import { getDateDaysAgo } from 'shared/dates';
import {
  createDailyJobsStorage,
  renderDailyJob,
} from 'shared/dailyJobs/dailyJobsTestUtils';
import { BaseSubtask } from 'shared/projects/types';
import { SubtaskGoal, DAILY_GOALS_KEY } from 'shared/dailyGoals/types';
import { DailyTask } from '../../types';
import { useDailyGoalReset } from './useDailyGoalReset';

const projectPath = 'amimono/projects/cardigan';
const findSubtaskPath = (subtaskId: string) =>
  `${projectPath}/subtasks/${subtaskId}`;

const createTaskGoal = (
  id: string,
  status: DailyTask['status'],
): DailyTask => ({
  id,
  description: id,
  category: '📦',
  parentId: DAILY_GOALS_KEY,
  position: 0,
  type: '一度',
  status,
  lastCompleted: getDateDaysAgo(1),
});

const createSubtaskGoal = (subtaskId: string): SubtaskGoal => ({
  id: subtaskId,
  position: 1,
  projectPath,
  subtaskPath: findSubtaskPath(subtaskId),
});

const createSubtask = (
  id: string,
  status: BaseSubtask['status'],
): BaseSubtask => ({ id, description: id, status, position: 0 });

describe('clearing finished daily goals at the start of the day', () => {
  describe('when some goals are finished tasks or done subtasks', () => {
    it('removes those goals and keeps the rest', async () => {
      const storage = createDailyJobsStorage({
        [DAILY_GOALS_KEY]: {
          parcel: createTaskGoal('parcel', 'finished'),
          library: createTaskGoal('library', 'ready'),
          swatch: createSubtaskGoal('swatch'),
          sleeves: createSubtaskGoal('sleeves'),
        },
        [findSubtaskPath('swatch')]: createSubtask('swatch', 'done'),
        [findSubtaskPath('sleeves')]: createSubtask('sleeves', 'ready'),
      });

      await renderDailyJob(useDailyGoalReset, storage);

      expect(storage.setValues).toHaveBeenCalledWith({
        [`${DAILY_GOALS_KEY}/parcel`]: null,
        [`${DAILY_GOALS_KEY}/swatch`]: null,
      });
    });
  });

  describe("when a goal's subtask has been deleted", () => {
    it('removes the goal', async () => {
      const storage = createDailyJobsStorage({
        [DAILY_GOALS_KEY]: { gone: createSubtaskGoal('gone') },
      });

      await renderDailyJob(useDailyGoalReset, storage);

      expect(storage.setValues).toHaveBeenCalledWith({
        [`${DAILY_GOALS_KEY}/gone`]: null,
      });
    });
  });
});
