import {
  useState,
  MouseEvent,
  useMemo,
  JSX,
  useRef,
  useEffect,
} from 'react';
import {
  EditableText,
  EditableTextHandle,
} from '../../shared/controls/EditableText';
import { AddTaskForm } from './AddTaskForm';
import { Task } from './Task/Task';
import { isList, isTask } from './drag-utils';

import './TaskList.css';
import { DragHandle } from '../../shared/drag-and-drop/DragHandle';
import { draggableTypeKey } from '../../shared/drag-and-drop/types';
import { DraggableListItem } from '../../shared/drag-and-drop/DraggableListItem';
import { ListDestination } from './listDestination';
import { PostitModalDialog } from './PostitModal';
import { WorkTask } from './types';
import { useWorkStorage } from './WorkStorageContext';
import { useDropTarget } from '../../shared/drag-and-drop/useDropTarget';
import { sortByPosition } from '../../shared/drag-and-drop/utils';
import { Labels } from './Task/Labels';
import { LabelsControl } from './LabelsControl';

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

export function TaskList({
  index,
  listId,
  parentListId,
  additionalMoveDestinations,
  onMoveTaskToList,
}: {
  index: number;
  listId: string;
  parentListId: string;
  additionalMoveDestinations: (task: WorkTask) => JSX.Element;
  onMoveTaskToList?: (task: WorkTask, destination: ListDestination) => void;
}) {
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

  const notDoneCount = useMemo(
    () => sortedList.filter((task) => task.status !== 'done').length,
    [sortedList],
  );

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
      dragPreview={<DragPreview list={list} />}
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
          {notDoneCount > 0 && (
            <span
              className="task-count"
              aria-label={`${notDoneCount} tasks remaining`}
            >
              ({notDoneCount})
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
                  list={sortedList}
                  index={index}
                  onReorder={(reorderedList) =>
                    reorderTasks(listId, reorderedList)
                  }
                  additionalActions={{
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

function DragPreview({ list }: { list: WorkTask }) {
  return (
    <div
      style={{
        border: '1px solid',
        paddingInline: '20px',
        paddingBlockEnd: '10px',
        paddingBlockStart: '5px',
      }}
    >
      <h2>{list.description}</h2>
      <ol style={{ padding: 0, marginInline: '10px' }}>
        {Object.values(list.items ?? {}).map((item) => (
          <li key={item.id}>{item.description}</li>
        ))}
      </ol>
    </div>
  );
}
