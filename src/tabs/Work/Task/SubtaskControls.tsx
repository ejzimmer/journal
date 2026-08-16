import { useState } from "react"
import { AddSubtask } from "./AddSubtask"
import { StandardChecklistButton } from "./StandardChecklistButton"
import { Subtask } from "../types"

type SubtaskControlsProps = {
  subtasks?: Record<string, Subtask>
  path: string
}

export function SubtaskControls({ subtasks, path }: SubtaskControlsProps) {
  const [addingSubtask, setAddingSubtask] = useState(false)

  return (
    <>
      <AddSubtask subtasks={subtasks} path={path} onToggle={setAddingSubtask} />
      {addingSubtask && (
        <StandardChecklistButton subtasks={subtasks} path={path} />
      )}
    </>
  )
}
