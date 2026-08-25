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
import { ListDestination } from "./listDestination"
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
  onMoveTaskToList,
}: {
  index: number
  listId: string
  parentListId: string
  additionalMoveDestinations: (task: WorkTask) => JSX.Element
  onMoveTaskToList?: (task: WorkTask, destination: ListDestination) => void
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
    getLabel,
    addLabel,
    removeLabel,
  } = useWorkStorage()

  const list = getList(listId)
  const listLabel = list?.labelIds?.[0]
    ? getLabel(list.labelIds[0])
    : undefined

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
          {listLabel &&
            (editingLabel ? (
              <LabelsControl
                value={listLabel ? [listLabel] : []}
                onChange={(labels) => {
                  const oldId = list.labelIds?.[0]
                  if (oldId) {
                    removeLabel(oldId, list)
                  }
                  const newLabel = labels[0]
                  if (newLabel) {
                    addLabel(newLabel, list)
                  }
                  setEditingLabel(false)
                }}
                label=""
                isMulti={false}
                autoFocus
              />
            ) : (
              <>
                <Labels
                  labelIds={list.labelIds}
                  onRemoveLabel={(id) => removeLabel(id, list)}
                />
                <button
                  className="ghost"
                  aria-label={`Change ${listLabel.value} label`}
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
                  additionalActions={{
                    menuItems: additionalMoveDestinations(task),
                    onKeyDown: onMoveTaskToList
                      ? (event) => {
                          switch (event.key) {
                            case "ArrowLeft":
                              event.preventDefault()
                              onMoveTaskToList(
                                task,
                                event.shiftKey ? "first" : "previous",
                              )
                              break
                            case "ArrowRight":
                              event.preventDefault()
                              onMoveTaskToList(
                                task,
                                event.shiftKey ? "last" : "next",
                              )
                              break
                          }
                        }
                      : undefined,
                  }}
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
