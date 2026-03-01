import { useContext } from "react"
import { FirebaseContext } from "../../../shared/FirebaseContext"

import { EmojiCheckbox } from "../../../shared/controls/EmojiCheckbox"

import "./TodayTask.css"
import { DailyTask, DAILY_KEY, ProjectSubtask } from "../../../shared/types"
import { EditableTextWithDelete } from "../../../shared/controls/EditableTextWithDelete"

export function TodayTask({
  task,
  onChange,
}: {
  task: DailyTask
  onChange: (task: DailyTask) => void
}) {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const { value: linkedTask } = storageContext.useValue<ProjectSubtask>(
    task?.linkedTask,
  )

  const handleStatusChange = () => {
    if (task.status !== "ready") {
      onChange({
        ...task,
        status: "ready",
        lastCompleted: new Date().getTime(),
      })
    } else {
      onChange({
        ...task,
        status: task.type === "毎日" ? "done" : "finished",
        lastCompleted: new Date().getTime(),
      })
    }

    if (task.linkedTask && linkedTask) {
      const segments = task.linkedTask.split("/")
      const path = segments.slice(0, segments.length - 1).join("/")

      storageContext.updateItem<ProjectSubtask>(path, {
        ...linkedTask,
        status: task.status === "finished" ? "ready" : "done",
      })
    }
  }

  return (
    <>
      <EmojiCheckbox
        emoji={task.category.emoji}
        isChecked={task.status !== "ready"}
        onChange={handleStatusChange}
        label={`${task.description} done`}
      />
      <div className="description" style={{ flexGrow: 1 }}>
        <EditableTextWithDelete
          label="description"
          value={task.description}
          onChange={(description) => onChange({ ...task, description })}
          onDelete={() => {
            storageContext.deleteItem<DailyTask>(DAILY_KEY, task)
          }}
        />
      </div>
    </>
  )
}
