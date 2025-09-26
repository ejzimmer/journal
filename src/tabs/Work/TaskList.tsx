import {
  useState,
  MouseEvent,
  FocusEvent,
  useRef,
  useMemo,
  useEffect,
} from "react"
import { EditableText } from "../../shared/controls/EditableText"
import { AddTaskForm } from "./AddTaskForm"
import { Item, Label } from "../../shared/TaskList/types"
import { Task } from "./Task"
import { getListData, isDroppable, isTask, sortByOrder } from "./drag-utils"
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine"
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"

import "./TaskList.css"
import { ConfirmationModal } from "../../shared/controls/ConfirmationModal"
import {
  MoveProps,
  useDropTarget,
} from "../../shared/drag-and-drop/useDropTarget"
import { RubbishBinIcon } from "../../shared/icons/RubbishBin"
import { ModalTriggerProps } from "../../shared/controls/Modal"
import invariant from "tiny-invariant"

type DragState = "idle" | "is-dragging-over"

export function TaskList({
  list,
  labels,
  onChangeListName,
  onDelete,
  onAddTask,
  onChangeTask,
  onReorderTasks,
  onMoveTask,
  menu: Menu,
}: {
  list: Item
  labels?: Record<string, Label>
  onChangeListName: (name: string) => void
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

  const { onChangePosition } = useDropTarget({
    listId: list.id,
    list: sortedList,
    isDraggable: isTask,
    isDroppable,
    onReorder: onReorderTasks,
    onMove: onMoveTask,
  })

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
          return getListData(list)
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
    <div className="work-task-list">
      <div className="heading">
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
                onChangePosition(index, destination)
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
    </div>
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

function getPosition(index: number, listLength: number) {
  if (index === 0) {
    return "start"
  }
  if (index === listLength - 1) {
    return "end"
  }

  return "middle"
}
