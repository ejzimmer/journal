import {
  DAILY_GOALS_KEY,
  SubtaskGoal,
  TaskGoal,
} from 'shared/dailyGoals/types';
import { DailyTask, ONCE_KEY } from '../../types';
import { createOnceGoalMigration } from './onceGoalMigration';

const createOnceTask = (
  id: string,
  { parentId = ONCE_KEY, position = 0 } = {},
): DailyTask => ({
  id,
  description: id,
  category: '📦',
  parentId,
  position,
  type: '一度',
  status: 'ready',
  lastCompleted: '2026-11-24',
});

const swatch: SubtaskGoal = {
  id: 'swatch',
  position: 0,
  projectPath: 'amimono/projects/cardigan',
  subtaskPath: 'amimono/projects/cardigan/subtasks/swatch',
};

const library: TaskGoal = {
  id: 'library',
  position: 1,
  taskPath: `${ONCE_KEY}/library`,
};

describe('createOnceGoalMigration', () => {
  describe('when a slot holds a one-off task that was moved out of its list', () => {
    it('puts the task back at the end of the list and points the slot at it', () => {
      const parcel = createOnceTask('parcel', {
        parentId: DAILY_GOALS_KEY,
        position: 2,
      });

      expect(
        createOnceGoalMigration({
          onceTasks: {
            socks: createOnceTask('socks', { position: 0 }),
            library: createOnceTask('library', { position: 4 }),
          },
          goals: { swatch, library, parcel },
        }),
      ).toEqual({
        [`${ONCE_KEY}/parcel`]: { ...parcel, parentId: ONCE_KEY, position: 5 },
        [`${DAILY_GOALS_KEY}/parcel`]: {
          id: 'parcel',
          position: 2,
          taskPath: `${ONCE_KEY}/parcel`,
        },
      });
    });
  });

  describe('when a moved task still has a link waiting to be migrated', () => {
    it('leaves it alone', () => {
      const linked = {
        ...createOnceTask('linked', { parentId: DAILY_GOALS_KEY }),
        linkedTask: 'amimono/projects/cardigan/subtasks/sleeves',
      };

      expect(createOnceGoalMigration({ goals: { linked } })).toEqual({});
    });
  });
});
