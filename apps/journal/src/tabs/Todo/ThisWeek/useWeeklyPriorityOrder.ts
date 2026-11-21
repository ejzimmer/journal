import { useRef } from 'react';
import { WeeklyTask } from '../../../types';
import { compareWeeklyPriority } from './utils';

const joinIds = (ids: string[]) => ids.toSorted().join();

// The order is only recalculated when tasks are added or removed, so ticking
// a task off doesn't make it jump down the list.
export function useWeeklyPriorityOrder(tasks: WeeklyTask[]) {
  const order = useRef<string[]>([]);
  const ids = tasks.map((task) => task.id);

  if (joinIds(order.current) !== joinIds(ids)) {
    order.current = tasks
      .toSorted(compareWeeklyPriority)
      .map((task) => task.id);
  }

  const tasksById = new Map(tasks.map((task) => [task.id, task]));
  return order.current.flatMap((id) => tasksById.get(id) ?? []);
}
