import { useContext } from "react"
import { EditableText } from "../../../shared/controls/EditableText"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { DeleteButton } from "../DeleteButton"

import { EmojiCheckbox } from "../../../shared/controls/EmojiCheckbox"

import "./TodayTask.css"
import { DailyTask, LIST_KEY } from "./types"

export function TodayTask({ task }: { task: DailyTask }) {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const onChange = (task: DailyTask) => {
    storageContext.updateItem<DailyTask>(LIST_KEY, task)
  }

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
  }

  return (
    <>
      <EmojiCheckbox
        emoji={task.category.emoji}
        isChecked={task.status !== "ready"}
        onChange={handleStatusChange}
        label={`${task.description} done`}
      />
      <div style={{ flexGrow: 1 }}>
        <EditableText
          label="description"
          onChange={(description) => onChange({ ...task, description })}
        >
          {task.description}
        </EditableText>
      </div>
      <DeleteButton
        onDelete={() => storageContext.deleteItem<DailyTask>(LIST_KEY, task)}
      />
    </>
  )
}
