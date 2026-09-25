import { AddThisWeekTaskForm } from './AddThisWeekTaskForm';
import { ThisWeekTask } from './ThisWeekTask';
import { WEEKLY_KEY, WeeklyTask } from '../../../shared/types';
import { useRef } from 'react';
import { useStorageContext } from '../../../shared/FirebaseContext';
import { compareLastCompleted, getCompletedDates } from './utils';

export function ThisWeekList() {
  const listRef = useRef<HTMLOListElement>(null);
  const { useValue } = useStorageContext();
  const { value } = useValue<Record<string, WeeklyTask>>(WEEKLY_KEY);

  const taskOrder = useRef<string[]>([]);

  if (value && taskOrder.current.length !== Object.values(value).length) {
    taskOrder.current = Object.values(value)
      .toSorted((a, b) => {
        const aUrgency = a.frequency - getCompletedDates(a.completed).length;
        const bUrgency = b.frequency - getCompletedDates(b.completed).length;

        if (aUrgency === bUrgency) {
          return compareLastCompleted(a, b);
        }

        return bUrgency - aUrgency;
      })
      .map((task) => task.id);
  }

  const tasks = value ? taskOrder.current.map((id) => value[id]) : [];

  return (
    <div className="todo-task-list weekly">
      {tasks.length ? (
        <ol ref={listRef}>
          {tasks.map((task, index) => (
            <li key={task.id} className="item">
              <ThisWeekTask task={task} />
            </li>
          ))}
        </ol>
      ) : (
        <div>No tasks</div>
      )}
      <AddThisWeekTaskForm />
    </div>
  );
}
