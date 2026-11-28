import { useStorageContext } from 'shared/FirebaseContext';
import { CalendarTask, CALENDAR_KEY } from '../../../types';
import { DueDateTaskPill } from './DueDateTaskPill';

import './TaskPills.css';

export function DueDateTaskList() {
  const { useValue } = useStorageContext();
  const { value } = useValue<Record<string, CalendarTask>>(CALENDAR_KEY);
  const tasks = Object.values(value ?? {}).sort((a, b) =>
    Temporal.PlainDate.compare(a.dueDate, b.dueDate),
  );

  return (
    <ol className="task-pills">
      {tasks.map((task) => (
        <li key={task.id} className={`task-pill status-${task.status}`}>
          <DueDateTaskPill task={task} />
        </li>
      ))}
    </ol>
  );
}
