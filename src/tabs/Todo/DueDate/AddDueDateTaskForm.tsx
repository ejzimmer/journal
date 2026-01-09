import { useId, useState } from "react"
import { AddTaskForm } from "../AddTaskForm"
import { EditableDate } from "../../../shared/controls/EditableDate"
import { PARENT_LIST } from "./types"

export function AddDueDateTaskForm() {
  const [dueDate, setDueDate] = useState<number>(new Date().getTime())
  const dueDateId = useId()

  const getAdditionalFieldValue = () => {
    if (!dueDate) {
      return false
    }

    return {
      dueDate: new Date().getTime(),
    }
  }

  return (
    <AddTaskForm
      listId={PARENT_LIST}
      getAdditionalFieldValues={getAdditionalFieldValue}
    >
      <label className="label" htmlFor={dueDateId}>
        Due date
      </label>
      <div style={{ fontSize: "24px" }}>
        <EditableDate id={dueDateId} value={dueDate} onChange={setDueDate} />
      </div>
    </AddTaskForm>
  )
}
