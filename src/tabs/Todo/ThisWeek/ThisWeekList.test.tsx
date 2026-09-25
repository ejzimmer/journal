import {
  getDateDaysAgo,
  getLegacyTimestampDaysAgo,
} from '../../../shared/dateTestUtils';
import { WeeklyTask } from '../../../shared/types';
import { refreshTasks } from './useWeeklyReset';

const lateInTheDay = Temporal.Duration.from({ hours: 23 }).total(
  'milliseconds',
);

const mockTask: WeeklyTask = {
  id: '2',
  description: 'strength training',
  category: 'e',
  parentId: 'WEEKLY',
  frequency: 2,
  position: 4,
};

describe('updating done tasks', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-02-28T13:10:57.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("when the task hasn't been completed", () => {
    it('does nothing', () => {
      const updateTask = jest.fn();
      refreshTasks([mockTask], updateTask);

      expect(updateTask).not.toHaveBeenCalled();
    });
  });

  describe("when the task hasn't been completed in the last 7 days", () => {
    it('does nothing', () => {
      const completed = [getDateDaysAgo(4), getDateDaysAgo(2)];
      const updateTask = jest.fn();
      refreshTasks([{ ...mockTask, completed }], updateTask);

      expect(updateTask).not.toHaveBeenCalled();
    });
  });

  describe('when the task was completed more than 7 days ago', () => {
    it('calls update task with the outdated completed tasks removed', () => {
      const completed = [
        getDateDaysAgo(12),
        getDateDaysAgo(8),
        getDateDaysAgo(4),
        getDateDaysAgo(2),
      ];
      const updateTask = jest.fn();
      refreshTasks([{ ...mockTask, completed }], updateTask);

      expect(updateTask).toHaveBeenCalledWith({
        ...mockTask,
        completed: [completed[2], completed[3]],
      });
    });
  });

  describe('when the task was completed exactly 7 days ago', () => {
    it('calls update task with the outdated completed tasks removed', () => {
      const completed = [
        getDateDaysAgo(12),
        getDateDaysAgo(7),
        getDateDaysAgo(4),
        getDateDaysAgo(2),
      ];
      const updateTask = jest.fn();
      refreshTasks([{ ...mockTask, completed }], updateTask);

      expect(updateTask).toHaveBeenCalledWith({
        ...mockTask,
        completed: [completed[2], completed[3]],
      });
    });

    describe('and it was stored as a timestamp from before the migration', () => {
      it('drops it whatever time of day it holds', () => {
        const completed = [
          getLegacyTimestampDaysAgo(7) + lateInTheDay,
          getDateDaysAgo(4),
          getDateDaysAgo(2),
        ];
        const updateTask = jest.fn();
        refreshTasks([{ ...mockTask, completed }], updateTask);

        expect(updateTask).toHaveBeenCalledWith({
          ...mockTask,
          completed: [completed[1], completed[2]],
        });
      });
    });
  });

  describe('when the completed array is actually a record', () => {
    it('deals with that too', () => {
      const completed = {
        '1': getDateDaysAgo(8),
        '2': getDateDaysAgo(4),
        '3': getDateDaysAgo(2),
      } as unknown as number[]; // Firebase turns sparse arrays into objects
      const updateTask = jest.fn();
      refreshTasks([{ ...mockTask, completed }], updateTask);
    });
  });
});
