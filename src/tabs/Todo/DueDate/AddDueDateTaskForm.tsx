import { useState } from "react"
import { AddTaskForm } from "../AddTaskForm"
import { PARENT_LIST } from "./types"
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
      listId={PARENT_LIST}
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
