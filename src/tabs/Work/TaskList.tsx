import {
  useState,
  MouseEvent,
  FocusEvent,
  useRef,
  useMemo,
  JSX,
} from "react"
import { EditableText } from "../../shared/controls/EditableText"
import { AddTaskForm } from "./AddTaskForm"
import { Task } from "./Task/Task"
import { isList, isTask } from "./drag-utils"

import "./TaskList.css"
import { DragHandle } from "../../shared/drag-and-drop/DragHandle"
import { draggableTypeKey } from "../../shared/drag-and-drop/types"
import { DraggableListItem } from "../../shared/drag-and-drop/DraggableListItem"
import { PostitModalDialog } from "./PostitModal"
import { WorkTask } from "./types"
import { useWorkStorage } from "./WorkStorageContext"
import { useDropTarget } from "../../shared/drag-and-drop/useDropTarget"
import { sortByPosition } from "../../shared/drag-and-drop/utils"
import { Labels } from "./Task/Labels"
import { LabelsControl } from "./LabelsControl"

function getListData(list: WorkTask, parentId: string) {
  return {
    [draggableTypeKey]: "list",
    id: list.id,
    parentId: parentId,
    position: list.position,
  }
}

export function TaskList({
  index,
  listId,
  parentListId,
  additionalMoveDestinations,
}: {
  index: number
  listId: string
  parentListId: string
  additionalMoveDestinations: (task: WorkTask) => JSX.Element
}) {
  const listRef = useRef<HTMLOListElement>(null)
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false)
  const [editingLabel, setEditingLabel] = useState(false)

  const [addTaskFormVisible, setAddTaskFormVisible] = useState(false)
  const showTaskForm = (event: MouseEvent | FocusEvent) => {
    event.stopPropagation()
    if (event.target === listRef.current) {
      setAddTaskFormVisible(true)
    }
  }

  const {
    lists,
    getList,
    updateList,
    deleteList,
    reorderLists,
    reorderTasks,
    addTask,
  } = useWorkStorage()

  const list = getList(listId)

  const sortedList = useMemo(
    () => (list?.items ? sortByPosition(Object.values(list.items)) : []),
    [list?.items],
  )

  const dragState = useDropTarget({
    dropTargetRef: listRef,
    canDrop: ({ source }) => isTask(source.data),
    getData: () => (list ? getListData(list, parentListId) : {}),
  })

  if (!list) {
    return
  }

  return (
    <DraggableListItem
      getData={() => getListData(list, parentListId)}
      dragPreview={<DragPreview list={list} />}
      isDroppable={isList}
      allowedEdges={["left", "right"]}
      dragHandle={
        <DragHandle
          list={Object.values(lists ?? {})}
          index={index}
          onReorder={(reorderedList) => {
            reorderLists(reorderedList)
          }}
        />
      }
    >
      <div className="work-task-list">
        <div className="heading">
          <h2>
            <EditableText
              label={`Edit ${list.description} name`}
              value={list.description}
              onChange={(description) => {
                if (description) {
                  updateList({ ...list, description })
                } else {
                  setConfirmDeleteModalOpen(true)
                }
              }}
            />
          </h2>
          {list.labels?.[0] &&
            (editingLabel ? (
              <LabelsControl
                value={list.labels}
                onChange={(labels) => {
                  updateList({ ...list, labels })
                  setEditingLabel(false)
                }}
                label=""
                isMulti={false}
                autoFocus
              />
            ) : (
              <>
                <Labels
                  labels={list.labels}
                  onRemoveLabel={(label) =>
                    updateList({
                      ...list,
                      labels: list.labels?.filter((l) => l !== label),
                    })
                  }
                />
                <button
                  className="ghost"
                  aria-label={`Change ${list.labels[0].value} label`}
                  onClick={() => setEditingLabel(true)}
                >
                  ✏️
                </button>
              </>
            ))}
          <PostitModalDialog
            isOpen={confirmDeleteModalOpen}
            message={`Are you sure you want to delete list ${list.description}?`}
            onConfirm={() => {
              deleteList(list)
            }}
            onCancel={() => setConfirmDeleteModalOpen(false)}
          />
        </div>
        <ol
          ref={listRef}
          onClick={showTaskForm}
          onFocus={showTaskForm}
          className={`tasks ${dragState}`}
        >
          {sortedList?.map((task, index) => (
            <Task
              key={task.id}
              listId={listId}
              task={task}
              dragHandle={
                <DragHandle
                  list={sortedList}
                  index={index}
                  onReorder={(reorderedList) =>
                    reorderTasks(listId, reorderedList)
                  }
                  additionalActions={additionalMoveDestinations(task)}
                />
              }
            />
          ))}
          {addTaskFormVisible && (
            <li style={{ paddingInlineStart: "var(--margin-width)" }}>
              <AddTaskForm
                onSubmit={(newTask) => addTask(listId, newTask)}
                onClose={() => {
                  setAddTaskFormVisible(false)
                }}
              />
            </li>
          )}
        </ol>
      </div>
    </DraggableListItem>
  )
}

function DragPreview({ list }: { list: WorkTask }) {
  return (
    <div
      style={{
        border: "1px solid",
        paddingInline: "20px",
        paddingBlockEnd: "10px",
        paddingBlockStart: "5px",
      }}
    >
      <h2>{list.description}</h2>
      <ol style={{ padding: 0, marginInline: "10px" }}>
        {Object.values(list.items ?? {}).map((item) => (
          <li key={item.id}>{item.description}</li>
        ))}
      </ol>
    </div>
  )
}
