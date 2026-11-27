import { useState, MouseEvent, useMemo, JSX, useRef, useEffect } from 'react';
import { EditableText, EditableTextHandle } from 'shared/controls/EditableText';
import { AddTaskForm } from './AddTaskForm';
import { Task } from './Task/Task';
import { isList, isTask } from './drag-utils';

import './TaskList.css';
import { DragHandle } from 'shared/drag-and-drop/DragHandle';
import { draggableTypeKey } from 'shared/drag-and-drop/types';
import { DraggableListItem } from 'shared/drag-and-drop/DraggableListItem';
import { DragPreview } from 'shared/drag-and-drop/DragPreview';
import { ListDestination } from './listDestination';
import { PostitModalDialog } from './PostitModalDialog';
import { WorkTask } from './types';
import { useWorkStorage } from './WorkStorageContext';
import { useDropTarget } from 'shared/drag-and-drop/useDropTarget';
import { sortByPosition } from 'shared/drag-and-drop/utils';
import { Labels } from './Task/Labels';
import { LabelsControl } from './LabelsControl';
import {
  findBlockerSource,
  flattenReorderedGroups,
  groupTasksWithDependents,
  isDependentTask,
} from './dependentTasks';

type PendingFocus = {
  isReady: (tasks: WorkTask[]) => boolean;
  moveFocus: () => void;
};

function getListData(list: WorkTask, parentId: string) {
  return {
    [draggableTypeKey]: 'list',
    id: list.id,
    parentId: parentId,
  };
}

type TaskListProps = {
  index: number;
  listId: string;
  parentListId: string;
  additionalMoveDestinations: (task: WorkTask) => JSX.Element;
  onMoveTaskToList?: (task: WorkTask, destination: ListDestination) => void;
};

export function TaskList({
  index,
  listId,
  parentListId,
  additionalMoveDestinations,
  onMoveTaskToList,
}: TaskListProps) {
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState(false);

  const [addTaskFormVisible, setAddTaskFormVisible] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const taskDescriptions = useRef(new Map<string, EditableTextHandle>());
  const pendingFocus = useRef<PendingFocus>(undefined);

  const showTaskForm = (event: MouseEvent) => {
    event.stopPropagation();
    if (event.target === listRef.current) {
      setAddTaskFormVisible(true);
    }
  };

  const {
    lists,
    getList,
    updateList,
    deleteList,
    reorderLists,
    reorderTasks,
    addTask,
    getLabel,
    changeLabels,
    removeLabel,
  } = useWorkStorage();

  const list = getList(listId);
  const listLabel = list?.labelIds?.[0]
    ? getLabel(list.labelIds[0])
    : undefined;

  const sortedList = useMemo(
    () => (list?.items ? sortByPosition(Object.values(list.items)) : []),
    [list?.items],
  );

  const blockerSources = useMemo(
    () => sortedList.map((_, index) => findBlockerSource(sortedList, index)),
    [sortedList],
  );

  const taskGroups = useMemo(
    () => groupTasksWithDependents(sortedList),
    [sortedList],
  );
  const groupHeads = taskGroups.map((group) => group[0]);

  const getReorderProps = (task: WorkTask, index: number) =>
    index > 0 && isDependentTask(task)
      ? {
          list: sortedList,
          index,
          onReorder: (reorderedList: { id: string }[]) =>
            reorderTasks(listId, reorderedList),
        }
      : {
          list: groupHeads,
          index: groupHeads.indexOf(task),
          onReorder: (reorderedHeads: { id: string }[]) =>
            reorderTasks(
              listId,
              flattenReorderedGroups(taskGroups, reorderedHeads),
            ),
        };

  const unfinishedTasks = sortedList.filter((task) => task.status !== 'done');
  const remainingCount = sortedList.filter(
    (task, index) => task.status !== 'done' && !blockerSources[index].blockedOn,
  ).length;

  useEffect(() => {
    if (pendingFocus.current?.isReady(sortedList)) {
      pendingFocus.current.moveFocus();
      pendingFocus.current = undefined;
    }
  }, [sortedList, addTaskFormVisible]);

  const focusTaskOrHeading = (taskId?: string) => {
    if (taskId) {
      taskDescriptions.current.get(taskId)?.focus();
    } else {
      headingRef.current?.focus();
    }
  };

  const addTaskAndFocusIt = (newTask: Parameters<typeof addTask>[1]) => {
    const taskId = addTask(listId, newTask);
    if (taskId) {
      pendingFocus.current = {
        isReady: (tasks) => tasks.some((task) => task.id === taskId),
        moveFocus: () => focusTaskOrHeading(taskId),
      };
    }
  };

  const closeTaskForm = () => {
    setAddTaskFormVisible(false);
    pendingFocus.current ??= {
      isReady: () => true,
      moveFocus: () => focusTaskOrHeading(sortedList.at(-1)?.id),
    };
  };

  const focusPreviousTaskOnceDeleted = (task: WorkTask) => {
    const index = sortedList.findIndex(({ id }) => id === task.id);
    const previousTask = sortedList[index - 1];
    pendingFocus.current = {
      isReady: (tasks) => !tasks.some(({ id }) => id === task.id),
      moveFocus: () => focusTaskOrHeading(previousTask?.id),
    };
  };

  const dragState = useDropTarget({
    dropTargetRef: listRef,
    canDrop: ({ source }) => isTask(source.data),
    getData: () => (list ? getListData(list, parentListId) : {}),
  });

  if (!list) {
    return;
  }

  return (
    <DraggableListItem
      getData={() => getListData(list, parentListId)}
      dragPreview={
        <DragPreview>
          <h2>{list.description}</h2>
          <ol>
            {Object.values(list.items ?? {}).map((item) => (
              <li key={item.id}>{item.description}</li>
            ))}
          </ol>
        </DragPreview>
      }
      isDroppable={isList}
      allowedEdges={['left', 'right']}
      dragHandle={
        <DragHandle
          list={Object.values(lists ?? {})}
          index={index}
          onReorder={(reorderedList) => {
            reorderLists(reorderedList);
          }}
        />
      }
    >
      <div className="work-task-list">
        <div className="heading">
          <h2 ref={headingRef} tabIndex={-1}>
            <EditableText
              label={`Edit ${list.description} name`}
              style={{ fontSize: 'inherit' }}
              value={list.description}
              onChange={(description) => {
                if (description) {
                  updateList({ ...list, description });
                } else {
                  setConfirmDeleteModalOpen(true);
                }
              }}
            />
          </h2>
          {listLabel &&
            (editingLabel ? (
              <LabelsControl
                value={listLabel ? [listLabel] : []}
                onChange={(labels) => {
                  changeLabels(labels, list);
                  setEditingLabel(false);
                }}
                label=""
                isMulti={false}
                autoFocus
                onDismiss={() => setEditingLabel(false)}
              />
            ) : (
              <Labels
                labelIds={list.labelIds}
                onRemoveLabel={(id) => removeLabel(id, list)}
                onEditLabel={() => setEditingLabel(true)}
              />
            ))}
          {unfinishedTasks.length > 0 && (
            <span
              className="task-count"
              aria-label={`${remainingCount} of ${unfinishedTasks.length} tasks remaining`}
            >
              ({remainingCount}/{unfinishedTasks.length})
            </span>
          )}
          <PostitModalDialog
            isOpen={confirmDeleteModalOpen}
            message={`Are you sure you want to delete list ${list.description}?`}
            onConfirm={() => {
              deleteList(list);
            }}
            onCancel={() => setConfirmDeleteModalOpen(false)}
          />
        </div>
        <ol
          ref={listRef}
          onClick={showTaskForm}
          className={`tasks ${dragState}`}
        >
          {sortedList?.map((task, index) => (
            <Task
              key={task.id}
              listId={listId}
              task={task}
              blockerSource={blockerSources[index]}
              descriptionRef={(handle) => {
                if (handle) {
                  taskDescriptions.current.set(task.id, handle);
                } else {
                  taskDescriptions.current.delete(task.id);
                }
              }}
              onDeleted={() => focusPreviousTaskOnceDeleted(task)}
              dragHandle={
                <DragHandle
                  {...getReorderProps(task, index)}
                  actions={{
                    menuItems: additionalMoveDestinations(task),
                    onKeyDown: onMoveTaskToList
                      ? (event) => {
                          switch (event.key) {
                            case 'ArrowLeft':
                              event.preventDefault();
                              onMoveTaskToList(
                                task,
                                event.shiftKey ? 'first' : 'previous',
                              );
                              break;
                            case 'ArrowRight':
                              event.preventDefault();
                              onMoveTaskToList(
                                task,
                                event.shiftKey ? 'last' : 'next',
                              );
                              break;
                          }
                        }
                      : undefined,
                  }}
                />
              }
            />
          ))}
          {addTaskFormVisible && (
            <li className="add-task-row">
              <AddTaskForm
                onSubmit={addTaskAndFocusIt}
                onClose={closeTaskForm}
              />
            </li>
          )}
        </ol>
      </div>
    </DraggableListItem>
  );
}
