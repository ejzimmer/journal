import { useState } from "react"
import { AddTaskForm } from "../AddTaskForm"
import { CALENDAR_KEY } from "../../../shared/types"
import { FormControl } from "../../../shared/controls/FormControl"

export function AddDueDateTaskForm() {
  const [dueDate, setDueDate] = useState<string>(new Date().toString())

  const getAdditionalFieldValue = () => {
    if (!dueDate) {
      return false
    }

    return {
      dueDate: new Date(dueDate).getTime(),
    }
  }

  return (
    <AddTaskForm
      listId={CALENDAR_KEY}
      getAdditionalFieldValues={getAdditionalFieldValue}
    >
      <FormControl
        label="Due date"
        type="date"
        value={dueDate}
        onChange={setDueDate}
      />
    </AddTaskForm>
  )
}
