import { ReactNode } from 'react';
import { TodayTask } from './TodayTask';
import { DailyTask } from '../../../types';
import { useStorageContext } from 'shared/FirebaseContext';
import { Destination, SortableItem } from 'shared/drag-and-drop/types';
import { onChangePosition, sortByPosition } from 'shared/drag-and-drop/utils';

type DailyTaskListProps = {
  listId: string;
  renderAction?: (task: DailyTask) => ReactNode;
};

export function DailyTaskList({ listId, renderAction }: DailyTaskListProps) {
  const { useValue, updateList, updateItem } = useStorageContext();
  const { value } = useValue<Record<string, DailyTask>>(listId);
  const tasks = value ? sortByPosition(Object.values(value)) : [];

  const moveTask = (index: number, destination: Destination) =>
    onChangePosition(tasks, index, destination, (tasks: SortableItem[]) =>
      updateList(listId, tasks),
    );

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
                onChange={(task: DailyTask) => {
                  updateItem<DailyTask>(listId, task);
                }}
                reorder={{
                  isFirst: index === 0,
                  isLast: index === tasks.length - 1,
                  move: (destination) => moveTask(index, destination),
                }}
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
