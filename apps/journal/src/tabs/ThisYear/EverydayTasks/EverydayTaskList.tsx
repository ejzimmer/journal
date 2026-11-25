import { DAILY_KEY } from '../../../types';
import { TodayTask } from '../../Todo/Today/TodayTask';
import { useDailyTaskList } from '../../Todo/Today/useDailyTaskList';

import './EverydayTaskList.css';

export function EverydayTaskList() {
  const { tasks, getReorderControls, updateTask } = useDailyTaskList(DAILY_KEY);

  return (
    <ol className="everyday-tasks">
      {tasks.map((task, index) => (
        <li key={task.id} className={`everyday-task status-${task.status}`}>
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
