import { getDateDaysAgo } from 'shared/dates';
import {
  createDailyJobsStorage,
  renderDailyJob,
} from 'shared/dailyJobs/dailyJobsTestUtils';
import { BaseSubtask } from 'shared/projects/types';
import {
  SubtaskGoal,
  TaskGoal,
  DAILY_GOALS_KEY,
} from 'shared/dailyGoals/types';
import { DailyTask, ONCE_KEY } from '../../types';
import { useDailyGoalReset } from './useDailyGoalReset';

const projectPath = 'amimono/projects/cardigan';
const findSubtaskPath = (subtaskId: string) =>
  `${projectPath}/subtasks/${subtaskId}`;

const createOnceTask = (
  id: string,
  status: DailyTask['status'],
): DailyTask => ({
  id,
  description: id,
  category: '📦',
  parentId: ONCE_KEY,
  position: 0,
  type: '一度',
  status,
  lastCompleted: getDateDaysAgo(1),
});

const createTaskGoal = (taskId: string): TaskGoal => ({
  id: taskId,
  position: 0,
  taskPath: `${ONCE_KEY}/${taskId}`,
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
          parcel: createTaskGoal('parcel'),
          library: createTaskGoal('library'),
          swatch: createSubtaskGoal('swatch'),
        },
        [`${ONCE_KEY}/parcel`]: createOnceTask('parcel', 'finished'),
        [`${ONCE_KEY}/library`]: createOnceTask('library', 'ready'),
        [findSubtaskPath('swatch')]: createSubtask('swatch', 'done'),
      });

      await renderDailyJob(useDailyGoalReset, storage);

      expect(storage.setValues).toHaveBeenCalledWith({
        [`${DAILY_GOALS_KEY}/parcel`]: null,
        [`${DAILY_GOALS_KEY}/swatch`]: null,
      });
    });
  });

  describe("when a goal's one-off task has been deleted", () => {
    it('removes the goal', async () => {
      const storage = createDailyJobsStorage({
        [DAILY_GOALS_KEY]: { gone: createTaskGoal('gone') },
      });

      await renderDailyJob(useDailyGoalReset, storage);

      expect(storage.setValues).toHaveBeenCalledWith({
        [`${DAILY_GOALS_KEY}/gone`]: null,
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
