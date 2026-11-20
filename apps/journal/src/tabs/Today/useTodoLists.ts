import { useStorageContext } from 'shared/FirebaseContext';
import {
  CALENDAR_KEY,
  CalendarTask,
  DAILY_KEY,
  DailyTask,
  WEEKLY_KEY,
  WeeklyTask,
} from '../../types';

export function useTodoLists() {
  const { useValue } = useStorageContext();
  const daily = useValue<Record<string, DailyTask>>(DAILY_KEY);
  const weekly = useValue<Record<string, WeeklyTask>>(WEEKLY_KEY);
  const calendar = useValue<Record<string, CalendarTask>>(CALENDAR_KEY);

  return {
    lists: {
      daily: daily.value,
      weekly: weekly.value,
      calendar: calendar.value,
    },
    synced: daily.synced && weekly.synced && calendar.synced,
  };
}
