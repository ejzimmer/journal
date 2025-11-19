import React, { useEffect, useState } from "react"
import { AddTaskForm, NewTask } from "./AddTaskForm"
import {
  CalendarTask,
  Category,
  isCalendarTask,
  isWeeklyTask,
  Task,
} from "./types"
import { EditableText } from "../../shared/controls/EditableText"
import { dailyReset } from "./dailyReset"
import { hoursToMilliseconds } from "date-fns"
import { EditableDate } from "../../shared/controls/EditableDate"
import { TodayTask } from "./TodayTask"
import { DeleteButton } from "./DeleteButton"
import { ThisWeekTask } from "./ThisWeekTask"

const STORAGE_KEY = "todo"

export function Today() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  })

  const saveTasks = (tasks: Task[]) => {
    setTasks(tasks)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }

  const addTask = (task: NewTask) => {
    const id = crypto.randomUUID()
    saveTasks([
      ...tasks,
      { id, ...task, lastUpdated: Date.now(), status: "ready" },
    ])
  }

  const groupedTasks = Object.groupBy(tasks, (task) => task.type)
  const categories = new Map<string, Category>()
  tasks.forEach((task) => {
    categories.set(task.category.text, task.category)
  })

  const updateTask = (task: Task) => {
    const index = tasks.findIndex((t) => t.id === task.id)
    if (index > -1) {
      saveTasks(tasks.with(index, task))
    }
  }

  const deleteTask = (task: Task) => {
    const index = tasks.findIndex((t) => t.id === task.id)
    if (index > -1) {
      saveTasks(tasks.toSpliced(index, 1))
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setTasks(dailyReset(tasks))
    }, hoursToMilliseconds(1))

    return () => clearTimeout(timer)
  }, [tasks])

  return (
    <>
      <AddTaskForm
        onSubmit={addTask}
        categories={Array.from(categories.values())}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "80px" }}>
        <TaskList
          tasks={groupedTasks["毎日"]}
          onChangeTask={updateTask}
          onDeleteTask={deleteTask}
        />
        <TaskList
          tasks={groupedTasks["週に"]}
          onChangeTask={updateTask}
          onDeleteTask={deleteTask}
        />
        <TaskList
          tasks={groupedTasks["日付"]?.sort(
            (a, b) => (a as CalendarTask).dueDate - (b as CalendarTask).dueDate
          )}
          onChangeTask={updateTask}
          onDeleteTask={deleteTask}
        />
      </div>
    </>
  )
}

type TaskListProps = {
  tasks?: Task[]
  onChangeTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
}
function TaskList({ tasks, onChangeTask, onDeleteTask }: TaskListProps) {
  if (!tasks) {
    return <div>No tasks</div>
  }

  return (
    <ul>
      {tasks.map((task) => (
        <li
          key={task.description}
          style={{ display: "flex", gap: "10px", alignItems: "center" }}
        >
          {isWeeklyTask(task) ? (
            <ThisWeekTask
              task={task}
              onChange={onChangeTask}
              onDelete={() => onDeleteTask(task)}
            />
          ) : isCalendarTask(task) ? (
            <Calendar
              task={task}
              onChange={onChangeTask}
              onDelete={() => onDeleteTask(task)}
            />
          ) : (
            <TodayTask
              task={task}
              onChange={onChangeTask}
              onDelete={() => onDeleteTask(task)}
            />
          )}
        </li>
      ))}
    </ul>
  )
}

function Calendar({
  task,
  onChange,
  onDelete,
}: {
  task: CalendarTask
  onChange: (task: CalendarTask) => void
  onDelete: () => void
}) {
  return (
    <>
      <input
        type="checkbox"
        onChange={() => onChange({ ...task, status: "finished" })}
        checked={task.status === "done" || task.status === "finished"}
      />
      <div
        style={{
          color:
            task.dueDate < Date.now() ? "var(--error-colour)" : "currentcolor",
          border: "2px solid",
          fontSize: "1rem",
          fontWeight: "bold",
        }}
      >
        <EditableDate
          value={task.dueDate}
          onChange={(date) => onChange({ ...task, dueDate: date })}
        />
      </div>
      {task.category.emoji}
      <EditableText
        label="description"
        onChange={(description) => onChange({ ...task, description })}
      >
        {task.description}
      </EditableText>
      <DeleteButton onDelete={onDelete} />
    </>
  )
}
