import { getToday } from 'shared/dates';
import { DailyTask } from '../../../types';

export function toggleDailyTaskStatus(task: DailyTask): DailyTask {
  if (task.status !== 'ready') {
    return { ...task, status: 'ready', lastCompleted: getToday() };
  }

  return {
    ...task,
    status: task.type === '毎日' ? 'done' : 'finished',
    lastCompleted: getToday(),
  };
}
