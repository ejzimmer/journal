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
    <div className="todo-task-list">
      <ul>
        {tasks.map((task) => (
          <li
            key={task.description}
            style={{ display: "flex", gap: "10px", alignItems: "center" }}
          >
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
