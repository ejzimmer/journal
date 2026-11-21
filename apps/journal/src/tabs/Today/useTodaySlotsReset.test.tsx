import { getDateDaysAgo } from 'shared/dates';
import {
  createDailyJobsStorage,
  renderDailyJob,
} from 'shared/dailyJobs/dailyJobsTestUtils';
import { DailyTask, ProjectDetails, PROJECTS_KEY } from '../../types';
import {
  AMIMONO_PROJECTS_PATH,
  SubtaskSlot,
  TODAY_SLOTS_KEY,
} from 'shared/todaySlots/types';
import { useTodaySlotsReset } from './useTodaySlotsReset';

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

const createSubtaskSlot = (id: string, subtaskId: string): SubtaskSlot => ({
  id,
  position: 1,
  subtaskPath: `${PROJECTS_KEY}/shelves/subtasks/${subtaskId}`,
});

const createAmimonoSubtaskSlot = (subtaskId: string): SubtaskSlot => ({
  id: subtaskId,
  position: 2,
  subtaskPath: `${AMIMONO_PROJECTS_PATH}/cardigan/subtasks/${subtaskId}`,
});

const projects: Record<string, ProjectDetails> = {
  shelves: {
    id: 'shelves',
    parentId: PROJECTS_KEY,
    position: 0,
    description: 'Put up the shelves',
    category: '🚚',
    subtasks: {
      drill: {
        id: 'drill',
        description: 'Borrow a drill',
        category: '🚚',
        position: 0,
        status: 'done',
      },
      paint: {
        id: 'paint',
        description: 'Paint the boards',
        category: '🚚',
        position: 1,
        status: 'ready',
      },
    },
  },
};

describe('clearing the Today slots at the start of the day', () => {
  describe('when some slots hold a finished task or a done subtask', () => {
    it('empties those slots and leaves the rest', async () => {
      const storage = createDailyJobsStorage({
        [PROJECTS_KEY]: projects,
        [TODAY_SLOTS_KEY]: {
          parcel: createTaskSlot('parcel', 'finished'),
          library: createTaskSlot('library', 'ready'),
          drill: createSubtaskSlot('drill', 'drill'),
          paint: createSubtaskSlot('paint', 'paint'),
        },
      });

      await renderDailyJob(useTodaySlotsReset, storage);

      expect(storage.setValues).toHaveBeenCalledWith({
        [`${TODAY_SLOTS_KEY}/parcel`]: null,
        [`${TODAY_SLOTS_KEY}/drill`]: null,
      });
    });
  });

  describe('when slots hold subtasks from Amimono', () => {
    it('empties the slots whose subtask is done', async () => {
      const storage = createDailyJobsStorage({
        [PROJECTS_KEY]: projects,
        [AMIMONO_PROJECTS_PATH]: {
          cardigan: {
            name: 'Cardigan',
            subtasks: {
              swatch: { description: 'Swatch', status: 'done' },
              sleeves: { description: 'Sleeves', status: 'ready' },
            },
          },
        },
        [TODAY_SLOTS_KEY]: {
          swatch: createAmimonoSubtaskSlot('swatch'),
          sleeves: createAmimonoSubtaskSlot('sleeves'),
        },
      });

      await renderDailyJob(useTodaySlotsReset, storage);

      expect(storage.setValues).toHaveBeenCalledWith({
        [`${TODAY_SLOTS_KEY}/swatch`]: null,
      });
    });
  });

  describe("when a slot's subtask has been deleted", () => {
    it('empties the slot', async () => {
      const storage = createDailyJobsStorage({
        [PROJECTS_KEY]: projects,
        [TODAY_SLOTS_KEY]: { gone: createSubtaskSlot('gone', 'deleted') },
      });

      await renderDailyJob(useTodaySlotsReset, storage);

      expect(storage.setValues).toHaveBeenCalledWith({
        [`${TODAY_SLOTS_KEY}/gone`]: null,
      });
    });
  });
});
