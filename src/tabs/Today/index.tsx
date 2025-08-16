import { useState } from "react"
import { Item } from "../../shared/TaskList/types"
import { Task } from "./Task"
import { COLOURS } from "../../shared/TodoList/types"
import { AddTaskForm } from "./AddTaskForm"

const initialTasks: Item[] = [
  {
    id: "1",
    description: "Brush teeth",
    status: "not_started",
    lastUpdated: 0,
    labels: [{ text: "🧹", colour: COLOURS["🧹"] }],
    order: 0,
  },
  {
    id: "2",
    description: "Cast on socks",
    status: "not_started",
    lastUpdated: 0,
    labels: [{ text: "🧶", colour: COLOURS["🧶"] }],
    order: 1,
  },
  {
    id: "3",
    description: "Anki",
    status: "not_started",
    lastUpdated: 0,
    labels: [{ text: "📓", colour: COLOURS["📓"] }],
    order: 2,
  },
]

function swapTasks(tasks: Item[], task: Item, toIndex: number) {
  const sourcePosition = task.order ?? tasks.length - 1
  const taskToSwap = tasks.find(
    (t) => typeof t.order === "number" && t.order + toIndex
  )
  return tasks.map((t) => {
    if (t === task) {
      return { ...task, order: sourcePosition + toIndex }
    } else if (t === taskToSwap) {
      return { ...t, order: sourcePosition }
    } else {
      return t
    }
  })
}

export function Today() {
  const [tasks, setTasks] = useState(initialTasks)

  return (
    <>
      {tasks
        .sort((a, b) => (a.order ?? tasks.length) - (b.order ?? tasks.length))
        .map((task, index) => (
          <Task
            key={task.id}
            task={task}
            onChange={(newTask) =>
              setTasks((tasks) => tasks.with(index, newTask))
            }
            onDelete={() =>
              setTasks((tasks) => tasks.filter((t) => t.id !== task.id))
            }
            onMoveTo={(destination) => {
              const sourcePosition = task.order ?? index

              if (
                (destination === "start" || destination === "previous") &&
                sourcePosition === 0
              ) {
                return
              }
              if (
                (destination === "end" || destination === "next") &&
                sourcePosition === tasks.length - 1
              ) {
                return
              }
              switch (destination) {
                case "start":
                  setTasks(
                    tasks.map((t) => {
                      if (
                        typeof t.order === "number" &&
                        t.order < sourcePosition
                      ) {
                        return { ...t, order: t.order + 1 }
                      } else if (t === task) {
                        return { ...task, order: 0 }
                      } else {
                        return t
                      }
                    })
                  )
                  break
                case "previous":
                  setTasks(swapTasks(tasks, task, -1))
                  break
                case "next":
                  setTasks(swapTasks(tasks, task, 1))
                  break
                case "end":
                  setTasks(
                    tasks.map((t) => {
                      if (
                        typeof t.order === "number" &&
                        t.order > sourcePosition
                      ) {
                        return { ...t, order: t.order - 1 }
                      } else if (t === task) {
                        return { ...task, order: tasks.length - 1 }
                      } else {
                        return t
                      }
                    })
                  )
              }
            }}
          />
        ))}
      <AddTaskForm onSubmit={console.log} />
    </>
  )
}
