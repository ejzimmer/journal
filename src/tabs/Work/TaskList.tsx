import {
  useState,
  MouseEvent,
  FocusEvent,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from "react"
import { EditableText } from "../../shared/controls/EditableText"
import { AddTaskForm } from "./AddTaskForm"
import { Item, Label } from "../../shared/TaskList/types"
import { Task } from "./Task"
import {
  getListData,
  getPosition,
  getTarget,
  isList,
  isTask,
  sortByOrder,
} from "./drag-utils"
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine"
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { reorderWithEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge"

import "./TaskList.css"
import { ConfirmationModal } from "../../shared/controls/ConfirmationModal"
import { MoveProps } from "../../shared/drag-and-drop/useDropTarget"
import { RubbishBinIcon } from "../../shared/icons/RubbishBin"
import { ModalTriggerProps } from "../../shared/controls/Modal"
import invariant from "tiny-invariant"
import { DragHandle } from "../../shared/drag-and-drop/DragHandle"
import { Destination, Position } from "../../shared/drag-and-drop/types"
import { DraggableListItem } from "../../shared/drag-and-drop/DraggableListItem"

type DragState = "idle" | "is-dragging-over"

export function TaskList({
  parentListId,
  position,
  list,
  labels,
  onChangeListName,
  onChangePosition,
  onDelete,
  onAddTask,
  onChangeTask,
  onReorderTasks,
  onMoveTask,
  menu: Menu,
}: {
  parentListId: string
  position: Position
  list: Item
  labels?: Record<string, Label>
  onChangeListName: (name: string) => void
  onChangePosition: (destination: Destination) => void
  onDelete: () => void
  onAddTask: (
    task: Omit<Partial<Item>, "labels"> & { labels?: Label[] }
  ) => void
  onChangeTask: (task: Item) => void
  onReorderTasks: (tasks: Item[]) => void
  onMoveTask: (props: MoveProps) => void
  menu?: React.FC<{ task: Item }>
}) {
  const listRef = useRef<HTMLUListElement>(null)
  const [addTaskFormVisible, setAddTaskFormVisible] = useState(false)

  const showTaskForm = (event: MouseEvent | FocusEvent) => {
    event.stopPropagation()
    if (event.target === listRef.current) {
      setAddTaskFormVisible(true)
    }
  }

  const sortedList = useMemo(
    () => (list.items ? sortByOrder(Object.values(list.items)) : []),
    [list]
  )

  const onChangeTaskPosition = useCallback(
    (originIndex: number, destination: Destination) => {
      if (!list) return
      const tasks = sortByOrder(Object.values(list.items ?? {}))

      onReorderTasks(
        reorderWithEdge({
          list: tasks,
          startIndex: originIndex,
          ...getTarget(originIndex, destination, tasks.length),
          axis: "vertical",
        })
      )
    },
    [list, onReorderTasks]
  )

  const [dragState, setDragState] = useState<DragState>("idle")
  useEffect(() => {
    if (!listRef.current) return

    const element = listRef.current
    invariant(element)
    return combine(
      dropTargetForElements({
        element,
        canDrop({ source }) {
          return isTask(source.data)
        },
        getData() {
          return getListData(list, parentListId)
        },
        onDragEnter() {
          setDragState("is-dragging-over")
        },
        onDragLeave() {
          setDragState("idle")
        },
        onDrop() {
          setDragState("idle")
        },
      })
    )
  })

  return (
    <DraggableListItem
      className="work-task-list"
      getData={() => getListData(list, parentListId)}
      dragPreview={<DragPreview />}
      isDroppable={isList}
      allowedEdges={["left", "right"]}
    >
      <div className="heading">
        <DragHandle position={position} onChangePosition={onChangePosition} />
        <h2>
          <EditableText
            label={`Edit ${list.description} name`}
            onChange={onChangeListName}
          >
            {list.description}
          </EditableText>
        </h2>
        <ConfirmationModal
          trigger={(props) => (
            <DeleteButton label={list.description} {...props} />
          )}
          message={`Are you sure you want to delete list ${list.description}?`}
          confirmButtonText="Yes, delete"
          onConfirm={onDelete}
        />
      </div>
      <ul
        ref={listRef}
        onClick={showTaskForm}
        onFocus={showTaskForm}
        className={dragState}
      >
        {sortedList?.map((item, index) => (
          <li className="task" key={item.id}>
            <Task
              position={getPosition(index, sortedList.length)}
              onChangePosition={(destination) =>
                onChangeTaskPosition(index, destination)
              }
              task={item}
              onChange={onChangeTask}
              menu={() => (Menu ? <Menu task={item} /> : null)}
              listId={list.id}
            />
          </li>
        ))}
        {addTaskFormVisible && (
          <li style={{ paddingInlineStart: "var(--margin-width)" }}>
            <AddTaskForm
              onSubmit={onAddTask}
              onClose={() => {
                setAddTaskFormVisible(false)
              }}
            />
          </li>
        )}
      </ul>
    </DraggableListItem>
  )
}

function DeleteButton({
  label,
  ...props
}: ModalTriggerProps & { label: string }) {
  const [isHovered, setHovered] = useState(false)

  return (
    <button
      {...props}
      aria-label={`delete list ${label}`}
      className="ghost"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <RubbishBinIcon width="16px" shouldAnimate={isHovered} />
    </button>
  )
}

function DragPreview() {
  return <>hello i'm a drag preview</>
}
