import { ReactNode } from 'react';
import { DailyTask } from '../../../types';
import { TodayTask } from '../../Todo/Today/TodayTask';
import { useDailyTaskList } from '../../Todo/Today/useDailyTaskList';

import './TaskPillList.css';

type TaskPillListProps = {
  listId: string;
  renderAction?: (task: DailyTask) => ReactNode;
};

export function TaskPillList({ listId, renderAction }: TaskPillListProps) {
  const { tasks, getReorderControls, updateTask } = useDailyTaskList(listId);

  return (
    <ol className="task-pills">
      {tasks.map((task, index) => (
        <li key={task.id} className={`task-pill status-${task.status}`}>
          <TodayTask
            task={task}
            listId={listId}
            onChange={updateTask}
            reorder={getReorderControls(index)}
          />
          {renderAction?.(task)}
        </li>
      ))}
    </ol>
  );
}
