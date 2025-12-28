import { isBefore, subDays } from "date-fns"
import { Task, TaskListProps, Weekly } from "../types"
import { AddThisWeekTaskForm, TaskDetails } from "./AddThisWeekTaskForm"
import { ThisWeekTask } from "./ThisWeekTask"

export type WeeklyTask = Weekly & Task

const moreThanAWeekAgo = (date: number | undefined) =>
  date && isBefore(date, subDays(new Date(), 7))

export function ThisWeekList({
  tasks,
  onUpdateList,
  createTask,
  categories,
}: TaskListProps<Weekly>) {
  const readyForReset = tasks.some((task) =>
    task.completed.some(moreThanAWeekAgo)
  )
  if (readyForReset) {
    onUpdateList(
      tasks.map((task) => ({
        ...task,
        completed: task.completed.map((date) =>
          moreThanAWeekAgo(date) ? undefined : date
        ),
      }))
    )
  }

  const onChangeTask = (task: WeeklyTask) => {
    const index = tasks.findIndex((t) => t.id === task.id)
    onUpdateList(tasks.with(index, task))
  }
  const onDeleteTask = (task: Task) => {
    const index = tasks.findIndex((t) => t.id === task.id)
    onUpdateList(tasks.toSpliced(index, 1))
  }
  const onCreateTask = (details: TaskDetails) => {
    const task = createTask({ ...details, completed: [] })
    onUpdateList([...tasks, task])
  }

  return (
    <div className="todo-task-list weekly">
      {tasks.length ? (
        <ul>
          {tasks.map((task) => (
            <li key={task.description}>
              <ThisWeekTask
                task={task}
                onChange={onChangeTask}
                onDelete={() => onDeleteTask(task)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div>No tasks</div>
      )}
      <AddThisWeekTaskForm onSubmit={onCreateTask} categories={categories} />
    </div>
  )
}
