import { useCallback, useMemo, useRef } from 'react';
import { useStorageContext } from 'shared/FirebaseContext';
import { PlusIcon } from 'shared/icons/Plus';
import { SortIcon } from 'shared/icons/Sort';
import { Subtask } from './Subtask';
import { AddSubtaskForm } from './AddSubtaskForm';
import { PROJECTS_KEY, ProjectSubtask, ProjectDetails } from '../../types';
import { getSubtasksKey } from './utils';
import { DragHandle } from 'shared/drag-and-drop/DragHandle';
import { draggableTypeKey, SortableItem } from 'shared/drag-and-drop/types';
import { useDropTarget } from 'shared/drag-and-drop/useDropTarget';
import {
  getNextPosition,
  isDraggable,
  renumberPositions,
  sortByPosition,
} from 'shared/drag-and-drop/utils';
import { useDraggableList } from 'shared/drag-and-drop/useDraggableList';
import { Drawer } from 'shared/drawer/Drawer';
import { useFormToggle } from 'shared/controls/useFormToggle';

type SubtasksProps = {
  projectId: string;
  isVisible: boolean;
};

export function SubtaskList({ projectId, isVisible }: SubtasksProps) {
  const { isFormOpen, triggerRef, toggleForm } = useFormToggle();
  const listRef = useRef<HTMLOListElement>(null);
  const subtasksKey = getSubtasksKey(projectId);

  const { useValue, addItem, updateList } = useStorageContext();
  const { value } = useValue<Record<string, ProjectSubtask>>(subtasksKey);
  const subtasks = useMemo(() => (value ? Object.values(value) : []), [value]);
  const { value: project } = useValue<ProjectDetails>(
    `${PROJECTS_KEY}/${projectId}`,
  );

  const onAddTask = (description: string) => {
    if (!project) return;

    addItem<ProjectSubtask>(subtasksKey, {
      description,
      status: 'ready',
      category: project.category,
      position: getNextPosition(subtasks),
    });
  };

  useDropTarget({
    dropTargetRef: listRef,
    canDrop: ({ source }) => isDraggable(source.data),
    getData: () => ({ listId: subtasksKey }),
  });
  useDraggableList({
    listId: subtasksKey,
    canDropSourceOnTarget: (source) => {
      return source[draggableTypeKey] === `subtask-${subtasksKey}`;
    },
    getTargetListId: (source) => source.parentId,
    getAxis: () => 'vertical',
  });

  const sortedTasks = useMemo(() => sortByPosition(subtasks), [subtasks]);

  const hasUnsortedDoneTasks = sortedTasks.some(
    (task, index) =>
      index > 0 &&
      task.status !== 'done' &&
      sortedTasks[index - 1].status === 'done',
  );

  const onSortDoneToEnd = useCallback(() => {
    const reordered = renumberPositions(
      sortedTasks.toSorted(
        (a, b) => Number(a.status === 'done') - Number(b.status === 'done'),
      ),
    );

    updateList<ProjectSubtask>(subtasksKey, reordered);
  }, [sortedTasks, subtasksKey, updateList]);

  if (!project) {
    return null;
  }

  return (
    <Drawer isOpen={isVisible} className="subtasks-section">
      <ol className="subtasks" ref={listRef}>
        {sortedTasks.map((task, index) => (
          <Subtask
            key={task.id}
            path={subtasksKey}
            project={project}
            {...task}
            dragHandle={
              <DragHandle
                list={sortedTasks}
                index={index}
                onReorder={(tasks: SortableItem[]) => {
                  updateList(subtasksKey, tasks);
                }}
              />
            }
          />
        ))}
      </ol>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          paddingInline: '12px',
          paddingBlockEnd: '8px',
        }}
      >
        <AddSubtaskForm isFormVisible={isFormOpen} onAddSubtask={onAddTask} />
        <button
          ref={triggerRef}
          className={`icon ghost show-form ${isFormOpen ? 'form-visible' : ''}`}
          aria-label="Add subtask"
          onClick={toggleForm}
          style={{ alignSelf: 'baseline' }}
        >
          <PlusIcon width="16px" colour="var(--action-colour)" />
        </button>
        {hasUnsortedDoneTasks && (
          <button
            className="icon ghost sort-done-to-end"
            onClick={onSortDoneToEnd}
            title="Move done subtasks to the end"
            aria-label="Move done subtasks to the end"
            style={{ alignSelf: 'baseline' }}
          >
            <SortIcon width="16px" colour="var(--action-colour)" />
          </button>
        )}
      </div>
    </Drawer>
  );
}
