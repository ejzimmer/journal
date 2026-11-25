import { DAILY_KEY } from '../../../types';
import { TodayTask } from '../../Todo/Today/TodayTask';
import { useDailyTaskList } from '../../Todo/Today/useDailyTaskList';

import './EveryDayTaskList.css';

export function EveryDayTaskList() {
  const { tasks, getReorderControls, updateTask } = useDailyTaskList(DAILY_KEY);

  return (
    <ol className="every-day-tasks">
      {tasks.map((task, index) => (
        <li key={task.id} className={`every-day-task status-${task.status}`}>
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
