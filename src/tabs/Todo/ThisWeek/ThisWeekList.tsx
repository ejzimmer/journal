import { TaskListProps, WeeklyTask } from "../types"
import { AddThisWeekTaskForm } from "./AddThisWeekTaskForm"
import { ThisWeekTask } from "./ThisWeekTask"

export function ThisWeekList({
  tasks,
  onChangeTask,
  onDeleteTask,
  onCreateTask,
  categories,
}: TaskListProps<WeeklyTask>) {
  if (!tasks) {
    return <div>No tasks</div>
  }

  return (
    <div className="todo-task-list weekly">
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
      <AddThisWeekTaskForm onSubmit={onCreateTask} categories={categories} />
    </div>
  )
}
