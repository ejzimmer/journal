import { getDateDaysAgo, getDateDaysAhead, getToday } from 'shared/dates';
import {
  CALENDAR_KEY,
  CalendarTask,
  DAILY_KEY,
  DailyTask,
  WEEKLY_KEY,
  WeeklyTask,
} from '../../types';
import { findEntriesForToday } from './todayEntries';

const createDailyTask = (id: string, type: DailyTask['type']): DailyTask => ({
  id,
  description: id,
  category: '🧹',
  parentId: DAILY_KEY,
  position: 0,
  type,
  status: 'ready',
  lastCompleted: getToday(),
});

const createWeeklyTask = (id: string, daysAgoDone: number[]): WeeklyTask => ({
  id,
  description: id,
  category: '🧹',
  parentId: WEEKLY_KEY,
  position: 0,
  frequency: 3,
  completed: daysAgoDone.map(getDateDaysAgo),
});

const createCalendarTask = (
  id: string,
  dueInDays: number,
  status: CalendarTask['status'],
): CalendarTask => ({
  id,
  description: id,
  category: '🧹',
  parentId: CALENDAR_KEY,
  position: 0,
  dueDate: getDateDaysAhead(dueInDays),
  status,
  statusUpdateDate: getToday(),
});

const findIds = (...args: Parameters<typeof findEntriesForToday>) =>
  findEntriesForToday(...args).map((entry) => entry.id);

describe('finding the tasks for today', () => {
  describe('in the daily list', () => {
    it('takes every 毎日 task', () => {
      expect(
        findIds({
          daily: {
            vitamins: createDailyTask('vitamins', '毎日'),
            duolingo: createDailyTask('duolingo', '毎日'),
          },
        }),
      ).toEqual(['vitamins', 'duolingo']);
    });
  });

  describe('in the weekly list', () => {
    it('takes the tasks that are due, and not the ones done recently', () => {
      expect(
        findIds({
          weekly: {
            run: createWeeklyTask('run', [5]),
            piano: createWeeklyTask('piano', [0]),
            yoga: createWeeklyTask('yoga', []),
          },
        }),
      ).toEqual(['run', 'yoga']);
    });
  });

  describe('in the due date list', () => {
    it.each([
      ['overdue and paused', -2, 'paused' as const],
      ['due today and paused', 0, 'paused' as const],
      ['ready, with a later due date', 10, 'ready' as const],
    ])('takes a task that is %s', (_, dueInDays, status) => {
      expect(
        findIds({
          calendar: { task: createCalendarTask('task', dueInDays, status) },
        }),
      ).toEqual(['task']);
    });

    it.each([
      ['finished', 0, 'finished' as const],
      ['paused, with a later due date', 10, 'paused' as const],
    ])('leaves out a task that is %s', (_, dueInDays, status) => {
      expect(
        findIds({
          calendar: { task: createCalendarTask('task', dueInDays, status) },
        }),
      ).toEqual([]);
    });
  });

  describe('across all the lists', () => {
    it('records which list each task came from', () => {
      expect(
        findEntriesForToday({
          daily: { vitamins: createDailyTask('vitamins', '毎日') },
          weekly: { yoga: createWeeklyTask('yoga', []) },
          calendar: { tax: createCalendarTask('tax', 0, 'ready') },
        }),
      ).toEqual([
        { id: 'vitamins', listId: DAILY_KEY },
        { id: 'yoga', listId: WEEKLY_KEY },
        { id: 'tax', listId: CALENDAR_KEY },
      ]);
    });
  });
});
