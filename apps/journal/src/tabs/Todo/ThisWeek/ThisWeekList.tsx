import { ThisWeekTask } from './ThisWeekTask';
import { WEEKLY_KEY, WeeklyTask } from '../../../types';
import { useRef } from 'react';
import { useStorageContext } from 'shared/FirebaseContext';
import { useWeeklyPriorityOrder } from './useWeeklyPriorityOrder';

export function ThisWeekList() {
  const listRef = useRef<HTMLOListElement>(null);
  const { useValue } = useStorageContext();
  const { value } = useValue<Record<string, WeeklyTask>>(WEEKLY_KEY);

  const tasks = useWeeklyPriorityOrder(Object.values(value ?? {}));

  return (
    <div className="todo-task-list weekly">
      {tasks.length ? (
        <ol ref={listRef}>
          {tasks.map((task) => (
            <li key={task.id} className="item">
              <ThisWeekTask task={task} />
            </li>
          ))}
        </ol>
      ) : (
        <div>No tasks</div>
      )}
    </div>
  );
}
