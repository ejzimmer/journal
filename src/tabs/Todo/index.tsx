import React, { useState } from "react"
import { AddTaskForm, NewTask } from "./AddTaskForm"
import { CalendarTask, Category, Task, WeeklyTask } from "./types"
import { EditableText } from "../../shared/controls/EditableText"

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
          tasks={groupedTasks["日付"]}
          onChangeTask={updateTask}
          onDeleteTask={deleteTask}
        />
      </div>
    </>
  )
}

const isWeeklyTask = (task: Task): task is WeeklyTask => task.type === "週に"
const isCalendarTask = (task: Task): task is CalendarTask =>
  task.type === "日付"

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
            <Weekly
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
            <Everyday
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

function Everyday({
  task,
  onChange,
  onDelete,
}: {
  task: Task
  onChange: (task: Task) => void
  onDelete: () => void
}) {
  return (
    <>
      <input
        type="checkbox"
        onClick={() => onChange({ ...task, status: "done" })}
        checked={task.status === "done" || task.status === "finished"}
      />
      <EditableText
        label="description"
        onChange={(description) => onChange({ ...task, description })}
      >
        {task.description}
      </EditableText>
      <button onClick={onDelete}>delete</button>
    </>
  )
}

function Weekly({
  task,
  onChange,
  onDelete,
}: {
  task: WeeklyTask
  onChange: (task: WeeklyTask) => void
  onDelete: () => void
}) {
  const [completed, setCompleted] = useState(() =>
    Array.from({ length: task.frequency }).map(
      (_, index) => index < task.completed
    )
  )

  const handleCompleted = (index: number) => {
    const completedStatus = completed.with(index, !completed[index])
    setCompleted(completedStatus)
    const timesCompleted = completedStatus.reduce(
      (total, current) => total + (current ? 1 : 0),
      0
    )
    onChange({ ...task, completed: timesCompleted })
  }

  return (
    <>
      <EditableText
        label="description"
        onChange={(description) => onChange({ ...task, description })}
      >
        {task.description}
      </EditableText>
      {completed.map((c, index) => (
        <input
          type="checkbox"
          key={index}
          checked={c}
          onClick={() => handleCompleted(index)}
        />
      ))}
      <button onClick={onDelete}>delete</button>
    </>
  )
}

function Calendar({
  task,
  onChange,
  onDelete,
}: {
  task: Task
  onChange: (task: Task) => void
  onDelete: () => void
}) {
  return (
    <>
      <input
        type="checkbox"
        onClick={() => onChange({ ...task, status: "finished" })}
        checked={task.status === "done" || task.status === "finished"}
      />
      <EditableText
        label="description"
        onChange={(description) => onChange({ ...task, description })}
      >
        {task.description}
      </EditableText>
      <button onClick={onDelete}>delete</button>
    </>
  )
}
