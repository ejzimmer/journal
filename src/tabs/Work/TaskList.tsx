import { useState, MouseEvent, FocusEvent, useRef, useMemo } from "react"
import { EditableText } from "../../shared/controls/EditableText"
import { AddTaskForm } from "../../shared/TaskList/AddTaskForm"
import { Item, Label } from "../../shared/TaskList/types"
import { Task } from "./Task"
import { isTask } from "./drag-utils"

import "./TaskList.css"
import { ConfirmationModal } from "../../shared/controls/ConfirmationModal"
import { useDropTarget } from "../../shared/drag-and-drop/useDropTarget"

export function TaskList({
  list,
  labels,
  onChangeListName,
  onDelete,
  onAddTask,
  onChangeTask,
  onReorderTasks,
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
      list.items
        ? Object.values(list.items).toSorted(
            (a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)
          )
        : [],
    [list]
  )

  const { onChangePosition } = useDropTarget({
    list: sortedList,
    isDraggable: isTask,
    getItemIndex: (data) =>
      sortedList.findIndex((task) => task.id === data.taskId),
    onReorder: onReorderTasks,
  })

  return (
    <div className="work-task-list">
      <h2>
        <div style={{ position: "relative", top: "12px", fontSize: "1.4em" }}>
          <EditableText
            label={`Edit ${list.description} name`}
            onChange={onChangeListName}
          >
            {list.description}
          </EditableText>
        </div>
        <ConfirmationModal
          trigger={(props) => (
            <button
              {...props}
              aria-label={`delete list ${list.description}`}
              className="delete-button ghost"
            >
              🗑️
            </button>
          )}
          message={`Are you sure you want to delete list ${list.description}?`}
          confirmButtonText="Yes, delete"
          onConfirm={onDelete}
        />
      </h2>
      <ul ref={listRef} onClick={showTaskForm} onFocus={showTaskForm}>
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
            />
          </li>
        ))}
        {addTaskFormVisible && (
          <li style={{ marginBlockStart: "12px" }}>
            <AddTaskForm
              onSubmit={onAddTask}
              onCancel={() => {
                setAddTaskFormVisible(false)
              }}
              labelOptions={labels ? Object.values(labels) : []}
            />
          </li>
        )}
      </ul>
    </div>
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
