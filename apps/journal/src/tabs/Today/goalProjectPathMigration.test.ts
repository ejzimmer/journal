import { getToday } from 'shared/dates';
import { DAILY_GOALS_KEY } from 'shared/dailyGoals/types';
import { DailyTask, PROJECTS_KEY } from '../../types';
import { createGoalProjectPathUpdates } from './goalProjectPathMigration';

const shelvesPath = `${PROJECTS_KEY}/shelves`;

describe('giving older daily goals a project path', () => {
  describe('when a subtask goal has no project path', () => {
    it("adds the path of the subtask's project", () => {
      expect(
        createGoalProjectPathUpdates({
          drill: {
            id: 'drill',
            position: 0,
            subtaskPath: `${shelvesPath}/subtasks/drill`,
          },
        }),
      ).toEqual({ [`${DAILY_GOALS_KEY}/drill/projectPath`]: shelvesPath });
    });
  });

  describe('when every subtask goal already has a project path', () => {
    it('changes nothing', () => {
      expect(
        createGoalProjectPathUpdates({
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

  describe('when a goal is a one-off task', () => {
    it('changes nothing', () => {
      const parcel: DailyTask = {
        id: 'parcel',
        description: 'Post the parcel',
        category: '📦',
        parentId: DAILY_GOALS_KEY,
        position: 0,
        type: '一度',
        status: 'ready',
        lastCompleted: getToday(),
      };

      expect(createGoalProjectPathUpdates({ parcel })).toEqual({});
    });
  });
});
