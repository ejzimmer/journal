import { getTimestampDaysAgo } from '../../../shared/dateTestUtils';

const lateInTheDay = Temporal.Duration.from({ hours: 23 }).total(
  'milliseconds',
);
import { WeeklyTask } from '../../../shared/types';
import { refreshTasks } from './useWeeklyReset';

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
      const completed = [getTimestampDaysAgo(4), getTimestampDaysAgo(2)];
      const updateTask = jest.fn();
      refreshTasks([{ ...mockTask, completed }], updateTask);

      expect(updateTask).not.toHaveBeenCalled();
    });
  });

  describe('when the task was completed more than 7 days ago', () => {
    it('calls update task with the outdated completed tasks removed', () => {
      const completed = [
        getTimestampDaysAgo(12),
        getTimestampDaysAgo(8),
        getTimestampDaysAgo(4),
        getTimestampDaysAgo(2),
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
        getTimestampDaysAgo(12),
        getTimestampDaysAgo(7) + lateInTheDay,
        getTimestampDaysAgo(4),
        getTimestampDaysAgo(2),
      ];
      const updateTask = jest.fn();
      refreshTasks([{ ...mockTask, completed }], updateTask);

      expect(updateTask).toHaveBeenCalledWith({
        ...mockTask,
        completed: [completed[2], completed[3]],
      });
    });
  });

  describe('when the completed array is actually a record', () => {
    it('deals with that too', () => {
      const completed = {
        '1': getTimestampDaysAgo(8),
        '2': getTimestampDaysAgo(4),
        '3': getTimestampDaysAgo(2),
      } as unknown as number[]; // Firebase turns sparse arrays into objects
      const updateTask = jest.fn();
      refreshTasks([{ ...mockTask, completed }], updateTask);
    });
  });
});
