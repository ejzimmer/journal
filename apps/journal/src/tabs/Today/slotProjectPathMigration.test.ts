import { getToday } from 'shared/dates';
import { TODAY_SLOTS_KEY } from 'shared/todaySlots/types';
import { DailyTask, PROJECTS_KEY } from '../../types';
import { createSlotProjectPathUpdates } from './slotProjectPathMigration';

const shelvesPath = `${PROJECTS_KEY}/shelves`;

describe('giving older Today slots a project path', () => {
  describe('when a subtask slot has no project path', () => {
    it("adds the path of the subtask's project", () => {
      expect(
        createSlotProjectPathUpdates({
          drill: {
            id: 'drill',
            position: 0,
            subtaskPath: `${shelvesPath}/subtasks/drill`,
          },
        }),
      ).toEqual({ [`${TODAY_SLOTS_KEY}/drill/projectPath`]: shelvesPath });
    });
  });

  describe('when every subtask slot already has a project path', () => {
    it('changes nothing', () => {
      expect(
        createSlotProjectPathUpdates({
          sleeves: {
            id: 'sleeves',
            position: 0,
            projectPath: 'amimono/projects/cardigan',
            subtaskPath: 'amimono/projects/cardigan/subtasks/sleeves',
          },
        }),
      ).toEqual({});
    });
  });

  describe('when a slot holds a one-off task', () => {
    it('changes nothing', () => {
      const parcel: DailyTask = {
        id: 'parcel',
        description: 'Post the parcel',
        category: '📦',
        parentId: TODAY_SLOTS_KEY,
        position: 0,
        type: '一度',
        status: 'ready',
        lastCompleted: getToday(),
      };

      expect(createSlotProjectPathUpdates({ parcel })).toEqual({});
    });
  });
});
