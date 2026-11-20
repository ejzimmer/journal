import { ReactNode, useRef } from 'react';
import { TodayTask } from './TodayTask';
import { DailyTask } from '../../../types';
import { useStorageContext } from 'shared/FirebaseContext';
import { DraggableListItem } from 'shared/drag-and-drop/DraggableListItem';
import { draggableTypeKey, SortableItem } from 'shared/drag-and-drop/types';
import { DragPreview } from 'shared/drag-and-drop/DragPreview';
import { DragHandle } from 'shared/drag-and-drop/DragHandle';
import { useDropTarget } from 'shared/drag-and-drop/useDropTarget';
import { useDraggableList } from 'shared/drag-and-drop/useDraggableList';
import { isDraggable, sortByPosition } from 'shared/drag-and-drop/utils';

type DailyTaskListProps = {
  listId: string;
  renderAction?: (task: DailyTask) => ReactNode;
};

export function DailyTaskList({ listId, renderAction }: DailyTaskListProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const { useValue, updateList, updateItem } = useStorageContext();
  const { value } = useValue<Record<string, DailyTask>>(listId);
  const tasks = value ? sortByPosition(Object.values(value)) : [];

  useDropTarget({
    dropTargetRef: listRef,
    canDrop: ({ source }) => isDraggable(source.data),
    getData: () => ({ listId }),
  });
  useDraggableList({
    listId,
    canDropSourceOnTarget: (source) => source[draggableTypeKey] === listId,
    getTargetListId: (source) => source.parentId,
    getAxis: () => 'vertical',
  });

  return (
    <div className="todo-task-list">
      {tasks.length ? (
        <ol ref={listRef}>
          {tasks.map((task, index) => (
            <DraggableListItem
              key={task.id}
              className={`today-task item status-${task.status} type-${task.type}`}
              getData={() => ({
                [draggableTypeKey]: listId,
                id: task.id,
                parentId: listId,
              })}
              dragPreview={<DragPreview>{task.description}</DragPreview>}
              isDroppable={(data) => data[draggableTypeKey] === listId}
              allowedEdges={['bottom', 'top']}
              dragHandle={
                <DragHandle
                  list={tasks}
                  index={index}
                  onReorder={(tasks: SortableItem[]) => {
                    updateList(listId, tasks);
                  }}
                />
              }
            >
              <TodayTask
                task={task}
                listId={listId}
                onChange={(task: DailyTask) => {
                  updateItem<DailyTask>(listId, task);
                }}
              />
              {renderAction?.(task)}
            </DraggableListItem>
          ))}
        </ol>
      ) : (
        <div>No tasks</div>
      )}
    </div>
  );
}
