import {
  useState,
  MouseEvent,
  FocusEvent,
  useRef,
  useMemo,
  useContext,
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
import { AdjacentListDestination } from "./adjacentList"
import { PostitModalDialog } from "./PostitModal"
import { WorkTask, WORK_KEY } from "./types"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { useDropTarget } from "../../shared/drag-and-drop/useDropTarget"
import { sortByPosition } from "../../shared/drag-and-drop/utils"
import { Labels } from "./Task/Labels"
import { LabelsControl } from "./LabelsControl"
import { LabelsContext } from "./LabelsContext"

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
  onMoveTaskToAdjacentList,
}: {
  index: number
  listId: string
  parentListId: string
  additionalMoveDestinations: (task: WorkTask) => JSX.Element
  onMoveTaskToAdjacentList?: (
    task: WorkTask,
    destination: AdjacentListDestination,
  ) => void
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

  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("missing storage context")
  }

  const { value: lists } =
    storageContext.useValue<Record<string, WorkTask>>(WORK_KEY)
  const list = lists?.[listId]

  const allLabels = useContext(LabelsContext)
  const listLabelValue = allLabels?.find(
    (l) => l.id === list?.labelIds?.[0],
  )?.value

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
          list={Object.values(lists)}
          index={index}
          onReorder={(reorderedList) => {
            storageContext.updateList(WORK_KEY, reorderedList)
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
                  storageContext.updateItem(WORK_KEY, { ...list, description })
                } else {
                  setConfirmDeleteModalOpen(true)
                }
              }}
            />
          </h2>
          {list.labelIds?.[0] &&
            (editingLabel ? (
              <LabelsControl
                value={list.labelIds}
                onChange={(labelIds) => {
                  storageContext.updateItem(WORK_KEY, { ...list, labelIds })
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
                  onRemoveLabel={(id) =>
                    storageContext.updateItem(WORK_KEY, {
                      ...list,
                      labelIds: list.labelIds?.filter(
                        (existing) => existing !== id,
                      ),
                    })
                  }
                />
                <button
                  className="ghost"
                  aria-label={`Change ${listLabelValue} label`}
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
              storageContext.deleteItem(WORK_KEY, list)
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
              path={`${WORK_KEY}/${listId}/items`}
              task={task}
              dragHandle={
                <DragHandle
                  list={sortedList}
                  index={index}
                  onReorder={(reorderedList) =>
                    storageContext.updateList(
                      `${WORK_KEY}/${listId}/items`,
                      reorderedList,
                    )
                  }
                  additionalActions={{
                    menuItems: additionalMoveDestinations(task),
                    onKeyDown: onMoveTaskToAdjacentList
                      ? (event) => {
                          switch (event.key) {
                            case "ArrowLeft":
                              event.preventDefault()
                              onMoveTaskToAdjacentList(
                                task,
                                event.shiftKey ? "first" : "previous",
                              )
                              break
                            case "ArrowRight":
                              event.preventDefault()
                              onMoveTaskToAdjacentList(
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
                onSubmit={(newTask) =>
                  storageContext.addItem(`${WORK_KEY}/${listId}/items`, newTask)
                }
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
