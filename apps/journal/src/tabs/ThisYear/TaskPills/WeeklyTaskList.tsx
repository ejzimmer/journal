import { useStorageContext } from 'shared/FirebaseContext';
import { WEEKLY_KEY, WeeklyTask } from '../../../types';
import { useWeeklyPriorityOrder } from '../../Todo/ThisWeek/useWeeklyPriorityOrder';
import { WeeklyTaskPill } from './WeeklyTaskPill';

import './TaskPills.css';

export function WeeklyTaskList() {
  const { useValue } = useStorageContext();
  const { value } = useValue<Record<string, WeeklyTask>>(WEEKLY_KEY);
  const tasks = useWeeklyPriorityOrder(Object.values(value ?? {}));

  return (
    <ol className="task-pills">
      {tasks.map((task) => (
        <li key={task.id} className="task-pill">
          <WeeklyTaskPill task={task} />
        </li>
      ))}
    </ol>
  );
}
