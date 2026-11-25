import { ReactNode } from 'react';
import { TodayTask } from './TodayTask';
import { DailyTask } from '../../../types';
import { useDailyTaskList } from './useDailyTaskList';

type DailyTaskListProps = {
  listId: string;
  renderAction?: (task: DailyTask) => ReactNode;
};

export function DailyTaskList({ listId, renderAction }: DailyTaskListProps) {
  const { tasks, getReorderControls, updateTask } = useDailyTaskList(listId);

  return (
    <div className="todo-task-list">
      {tasks.length ? (
        <ol>
          {tasks.map((task, index) => (
            <li
              key={task.id}
              className={`today-task item status-${task.status} type-${task.type}`}
            >
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
      ) : (
        <div>No tasks</div>
      )}
    </div>
  );
}
