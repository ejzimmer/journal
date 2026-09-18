import { AddDueDateTaskForm } from "./AddDueDateTaskForm"
import { DueDateTask } from "./DueDateTask"

import "./DueDateTask.css"
import { useStorageContext } from "../../../shared/FirebaseContext"
import { CalendarTask, CALENDAR_KEY } from "../../../shared/types"
import { useDueDateReset } from "./useDueDateReset"

export function DueDateList() {
  const { useValue } = useStorageContext()
  const { value } = useValue<Record<string, CalendarTask>>(CALENDAR_KEY)
  const tasks = value ? Object.values(value) : []

  useDueDateReset()

  return (
    <div className="todo-task-list calendar">
      {tasks.length ? (
        <ol>
          {tasks
            .sort((a, b) => a.dueDate - b.dueDate)
            .map((task) => (
              <li key={task.id} className={`status-${task.status}`}>
                <DueDateTask task={task} />
              </li>
            ))}
        </ol>
      ) : (
        <div>No tasks</div>
      )}
      <AddDueDateTaskForm />
    </div>
  )
}
