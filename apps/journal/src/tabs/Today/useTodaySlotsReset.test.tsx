import { getDateDaysAgo } from 'shared/dates';
import {
  createDailyJobsStorage,
  renderDailyJob,
} from 'shared/dailyJobs/dailyJobsTestUtils';
import { BaseSubtask } from 'shared/projects/types';
import { SubtaskSlot, TODAY_SLOTS_KEY } from 'shared/todaySlots/types';
import { DailyTask } from '../../types';
import { useTodaySlotsReset } from './useTodaySlotsReset';

const projectPath = 'amimono/projects/cardigan';
const findSubtaskPath = (subtaskId: string) =>
  `${projectPath}/subtasks/${subtaskId}`;

const createTaskSlot = (
  id: string,
  status: DailyTask['status'],
): DailyTask => ({
  id,
  description: id,
  category: '📦',
  parentId: TODAY_SLOTS_KEY,
  position: 0,
  type: '一度',
  status,
  lastCompleted: getDateDaysAgo(1),
});

const createSubtaskSlot = (subtaskId: string): SubtaskSlot => ({
  id: subtaskId,
  position: 1,
  projectPath,
  subtaskPath: findSubtaskPath(subtaskId),
});

const createSubtask = (
  id: string,
  status: BaseSubtask['status'],
): BaseSubtask => ({ id, description: id, status, position: 0 });

describe('clearing the Today slots at the start of the day', () => {
  describe('when some slots hold a finished task or a done subtask', () => {
    it('empties those slots and leaves the rest', async () => {
      const storage = createDailyJobsStorage({
        [TODAY_SLOTS_KEY]: {
          parcel: createTaskSlot('parcel', 'finished'),
          library: createTaskSlot('library', 'ready'),
          swatch: createSubtaskSlot('swatch'),
          sleeves: createSubtaskSlot('sleeves'),
        },
        [findSubtaskPath('swatch')]: createSubtask('swatch', 'done'),
        [findSubtaskPath('sleeves')]: createSubtask('sleeves', 'ready'),
      });

      await renderDailyJob(useTodaySlotsReset, storage);

      expect(storage.setValues).toHaveBeenCalledWith({
        [`${TODAY_SLOTS_KEY}/parcel`]: null,
        [`${TODAY_SLOTS_KEY}/swatch`]: null,
      });
    });
  });

  describe("when a slot's subtask has been deleted", () => {
    it('empties the slot', async () => {
      const storage = createDailyJobsStorage({
        [TODAY_SLOTS_KEY]: { gone: createSubtaskSlot('gone') },
      });

      await renderDailyJob(useTodaySlotsReset, storage);

      expect(storage.setValues).toHaveBeenCalledWith({
        [`${TODAY_SLOTS_KEY}/gone`]: null,
      });
    });
  });
});
