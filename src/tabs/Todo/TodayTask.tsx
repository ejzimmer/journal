import { EditableText } from "../../shared/controls/EditableText"
import { DeleteButton } from "./DeleteButton"
import { Task, TaskListProps } from "./types"

import "./TodayTask.css"
import { isBefore, isSameDay, startOfDay, subDays } from "date-fns"
import { useRef, useState } from "react"

export const sortDailyTasks = (a: Task, b: Task) => {
  const yesterday = startOfDay(subDays(Date.now(), 1))

  if (
    isBefore(a.lastUpdated, yesterday) &&
    isBefore(b.lastUpdated, yesterday)
  ) {
    return a.lastUpdated - b.lastUpdated
  }

  if (isBefore(a.lastUpdated, yesterday)) {
    return -1
  }

  if (isBefore(b.lastUpdated, yesterday)) {
    return 1
  }

  return 0
}

const isTask = (task: Task | undefined): task is Task => !!task

export function TodayList({
  tasks,
  onChangeTask,
  onDeleteTask,
}: TaskListProps) {
  const [order, setOrder] = useState(() => tasks?.map((t) => t.id))

  const orderedTasks: Task[] =
    tasks && order
      ? order.map((o) => tasks.find((t) => t.id === o)).filter(isTask)
      : []
  const today = useRef(Date.now())

  if (!isSameDay(today.current, Date.now())) {
    setOrder(tasks?.sort(sortDailyTasks).map((t) => t.id))
  }

  if (!orderedTasks) {
    return <div>No tasks for today</div>
  }

  return (
    <ul>
      {orderedTasks.map((task) => (
        <li
          key={task.id}
          style={{ display: "flex", gap: "10px", alignItems: "center" }}
        >
          <TodayTask
            task={task}
            onChange={onChangeTask}
            onDelete={() => onDeleteTask(task)}
          />
        </li>
      ))}
    </ul>
  )
}

export function TodayTask({
  task,
  onChange,
  onDelete,
}: {
  task: Task
  onChange: (task: Task) => void
  onDelete: () => void
}) {
  const handleStatusChange = () => {
    if (task.status === "done") {
      onChange({ ...task, status: "ready" })
    } else {
      onChange({ ...task, status: "done" })
    }
  }

  return (
    <div className={`today-task status-${task.status}`}>
      <div className="button-edge">
        <div className="button-surface">
          <span>
            <label className="led">
              <input
                aria-label="done"
                type="checkbox"
                onChange={handleStatusChange}
                checked={task.status === "done" || task.status === "finished"}
              />
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                flexGrow: 1,
              }}
            >
              {task.category.emoji}
              <EditableText
                label="description"
                onChange={(description) => onChange({ ...task, description })}
              >
                {task.description}
              </EditableText>
            </div>
            <DeleteButton onDelete={onDelete} />
          </span>
        </div>
      </div>
    </div>
  )
}
