import { useState } from "react"
import { Switch } from "../../../shared/controls/Switch"
import { AddTaskForm } from "../AddTaskForm"
import { DailyTaskDetails, DAILY_KEY } from "../../../shared/types"

export function AddTodayTaskForm() {
  const [taskType, setTaskType] = useState<DailyTaskDetails["type"]>("一度")

  const getAdditionalFieldValues = () => {
    return {
      type: taskType,
      status: "ready",
      lastCompleted: new Date().getTime(),
    }
  }

  return (
    <AddTaskForm
      listId={DAILY_KEY}
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
