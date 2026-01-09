import { useState } from "react"
import { FormControl } from "../../../shared/controls/FormControl"
import { AddTaskForm } from "../AddTaskForm"
import { PARENT_LIST } from "./types"

export function AddThisWeekTaskForm() {
  const [frequency, setFrequency] = useState<string | undefined>("1")

  const getAdditionalFieldValues = () => {
    if (!frequency || isNaN(Number.parseInt(frequency))) {
      return false
    }

    setFrequency("1")

    return {
      frequency: Number.parseInt(frequency),
      completed: [],
    }
  }

  return (
    <AddTaskForm
      listId={PARENT_LIST}
      getAdditionalFieldValues={getAdditionalFieldValues}
    >
      <FormControl
        type="number"
        label="Frequency"
        value={frequency}
        size={2}
        onChange={setFrequency}
      />
    </AddTaskForm>
  )
}
