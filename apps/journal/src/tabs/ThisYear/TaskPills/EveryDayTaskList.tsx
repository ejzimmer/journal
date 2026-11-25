import { DAILY_KEY } from '../../../types';
import { TodayTask } from '../../Todo/Today/TodayTask';
import { useDailyTaskList } from '../../Todo/Today/useDailyTaskList';

import './TaskPills.css';

export function EveryDayTaskList() {
  const { tasks, getReorderControls, updateTask } = useDailyTaskList(DAILY_KEY);

  return (
    <ol className="task-pills">
      {tasks.map((task, index) => (
        <li key={task.id} className={`task-pill status-${task.status}`}>
          <TodayTask
            task={task}
            listId={DAILY_KEY}
            onChange={updateTask}
            reorder={getReorderControls(index)}
          />
        </li>
      ))}
    </ol>
  );
}
