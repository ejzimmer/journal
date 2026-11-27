import { isBeforeToday, isThisWeek, isToday } from 'shared/dates';

export function getDueDateClass(dueDate: string) {
  if (isBeforeToday(dueDate)) {
    return 'overdue';
  }
  if (isToday(dueDate)) {
    return 'due-today';
  }
  if (isThisWeek(dueDate)) {
    return 'this-week';
  }

  return 'later';
}
