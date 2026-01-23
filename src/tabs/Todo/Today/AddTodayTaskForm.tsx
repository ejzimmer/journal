import { useState } from "react"
import { Switch } from "../../../shared/controls/Switch"
import { AddTaskForm } from "../AddTaskForm"
import { Daily, LIST_KEY } from "./types"

export function AddTodayTaskForm() {
  const [taskType, setTaskType] = useState<Daily["type"]>("一度")

  const getAdditionalFieldValues = () => {
    return {
      type: taskType,
      status: "ready",
      lastCompleted: new Date().getTime(),
    }
  }

  return (
    <AddTaskForm
      listId={LIST_KEY}
      getAdditionalFieldValues={getAdditionalFieldValues}
    >
      <fieldset>
        <legend className="label">Type</legend>
        <Switch
          options={["一度", "毎日"]}
          value={taskType}
          onChange={setTaskType}
          name="task-type"
        />
      </fieldset>
    </AddTaskForm>
  )
}
