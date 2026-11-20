import { getToday } from 'shared/dates';
import { CALENDAR_KEY, DAILY_KEY, ONCE_KEY, WEEKLY_KEY } from '../../types';

export const TODO_TYPES = ['毎日', '一度', '毎週', '期日'] as const;
export type TodoType = (typeof TODO_TYPES)[number];

export type TypeFieldValues = {
  frequency: string;
  dueDate: string;
  repeats: boolean;
};

export const LIST_IDS: Record<TodoType, string> = {
  毎日: DAILY_KEY,
  一度: ONCE_KEY,
  毎週: WEEKLY_KEY,
  期日: CALENDAR_KEY,
};

export function createTypeDetails(
  type: TodoType,
  { frequency, dueDate, repeats }: TypeFieldValues,
) {
  switch (type) {
    case '毎日':
    case '一度':
      return { type, status: 'ready', lastCompleted: getToday() };
    case '毎週': {
      const timesPerWeek = Number.parseInt(frequency);
      return Number.isNaN(timesPerWeek)
        ? undefined
        : { frequency: timesPerWeek, completed: [] };
    }
    case '期日':
      return dueDate ? { dueDate, repeats } : undefined;
  }
}
