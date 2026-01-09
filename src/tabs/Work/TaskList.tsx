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
import { Item } from "../../shared/types"
import { Task } from "./Task"
import { getListData, isList, isTask, sortByOrder } from "./drag-utils"
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine"
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"

import "./TaskList.css"
import { RubbishBinIcon } from "../../shared/icons/RubbishBin"
import { ModalTriggerProps } from "../../shared/controls/Modal"
import invariant from "tiny-invariant"
import { DragHandle } from "../../shared/drag-and-drop/DragHandle"
import { Draggable } from "../../shared/drag-and-drop/types"
import { DraggableListItem } from "../../shared/drag-and-drop/DraggableListItem"
import { PostitModal } from "./PostitModal"

type DragState = "idle" | "is-dragging-over"

export function TaskList({
  index,
  parentListId,
  list,
  onChangeListName,
  onDelete,
  onAddTask,
  onChangeTask,
  onReorderTasks,
  menu: Menu,
}: {
  index: number
  parentListId: string
  list: Item
  onChangeListName: (name: string) => void
  onDelete: () => void
  onAddTask: (task: Partial<Item>) => void
  onChangeTask: (task: Item) => void
  onReorderTasks: (tasks: Draggable[]) => void
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
    () =>
      (list.items ? sortByOrder(Object.values(list.items)) : []).map(
        (item) => ({ ...item, position: item.order }) // need to do data migration to update this form order to position in the database
      ),
    [list]
  )
  sortedList.forEach((item) => {
    const originalItem = list.items?.[item.id]
    if (originalItem?.order !== item.order) {
      onChangeTask(item)
    }
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
      getData={() => getListData(list, parentListId)}
      dragPreview={<DragPreview list={list} />}
      isDroppable={isList}
      allowedEdges={["left", "right"]}
      style={{ display: "flex" }}
    >
      <div className="work-task-list">
        <div className="heading">
          <DragHandle
            list={sortedList}
            index={index}
            onReorder={onReorderTasks}
          />
          <h2>
            <EditableText
              label={`Edit ${list.description} name`}
              onChange={onChangeListName}
            >
              {list.description}
            </EditableText>
          </h2>
          <PostitModal
            trigger={(props) => (
              <DeleteButton label={list.description} {...props} />
            )}
            message={`Are you sure you want to delete list ${list.description}?`}
            onConfirm={onDelete}
          />
        </div>
        <ul
          ref={listRef}
          onClick={showTaskForm}
          onFocus={showTaskForm}
          className={`tasks ${dragState}`}
        >
          {sortedList?.map((item, index) => (
            <li className="task" key={item.id}>
              <Task
                list={sortedList}
                index={index}
                onReorder={onReorderTasks}
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

function DragPreview({ list }: { list: Item }) {
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
      <ul style={{ padding: 0, marginInline: "10px" }}>
        {Object.values(list.items ?? {}).map((item) => (
          <li key={item.id}>{item.description}</li>
        ))}
      </ul>
    </div>
  )
}
